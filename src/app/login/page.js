"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import styles from "./login.module.css";
import axios from "axios";
import { useCustomerStore } from "@/stores/customerStore";
import { useAdminStore } from "@/stores/adminStore";
import { setAdminIdxCookie } from "@/utils/cookieUtils";
export default function LoginPage() {
  const router = useRouter();
  const { setAccessToken, setInlogged ,isInlogged} = useCustomerStore();
  const { setAdminIdx, setContentId, setHotelInfo, setAdminLoggedIn, fetchContentIdByAdminIdx } = useAdminStore();
  const [formData, setFormData] = useState({
    id: "",
    password: "",
    role: "customer", // 기본값: 회원
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  let accessToken = "";

  const login_url = "/api/login";

  // 네이버 로그인을 위한 함수
  const handleNaverLogin = () => {
    const client_id = 'VqsbzJuI12KsWAz74De4';
    const state = "RAMDOM_STATE";
    const redirectURI = encodeURIComponent("http://localhost:3333/api/oauth/naverCallback");
    
    // 네이버 로그인 URL로 직접 리다이렉트 (axios 불필요)
    const naverLoginUrl = `https://nid.naver.com/oauth2.0/authorize?response_type=code&client_id=${client_id}&redirect_uri=${redirectURI}&state=${state}`;
    
    // 브라우저에서 네이버 로그인 페이지로 이동
    window.location.href = naverLoginUrl;
  };

  // 입력 필드 변경 핸들러
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

   
    
    // 실시간 유효성 검사 (에러 제거)
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  async function login(){
    await axios.post(login_url, formData).then(function(res){
      console.log("res.data");
      console.log(res.data);
      if(res.data){
        accessToken = res.data;
        setInlogged(true);
      }
    })
  };

  // 유효성 검사 함수
  const validateForm = () => {
    const newErrors = {};

    if (!formData.id) {
      newErrors.id = "아이디를 입력해주세요.";
    }

    if (!formData.password) {
      newErrors.password = "비밀번호를 입력해주세요.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 폼 제출 핸들러
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    await login();
    setIsSubmitting(true);

    if(isInlogged()) {
      // TODO: API 연동
      // const response = await axios.post('/api/auth/login', {
      //   id: formData.id,
      //   password: formData.password,
      //   rememberMe: rememberMe
      // });

      // 임시: 콘솔에 데이터 출력
      console.log("로그인 데이터:", { ...formData, rememberMe });

      //zustand에 사용자 정보 저장

      //로그인 버튼 로그아웃으로 변경
      
      // 성공 시 사용자 타입에 따라 리다이렉트
      alert("로그인 성공");
      
      setAccessToken(accessToken);

      // 사업자(admin)인 경우 관리자 화면으로 이동
      if (formData.role === "admin") {
        try {
          // 토큰에서 adminIdx 추출
          const userInfo = JSON.parse(atob(accessToken.split('.')[1]));
          const adminIdx = userInfo.adminIdx;
          
          if (adminIdx) {
            // adminIdx를 쿠키에 저장
            setAdminIdxCookie(adminIdx, 7); // 7일
            
            // adminIdx로 contentId 가져오기
            const contentId = await fetchContentIdByAdminIdx(adminIdx);
            
            if (contentId) {
              setAdminLoggedIn(true);
              console.log('관리자 로그인 성공:', { adminIdx, contentId });
            } else {
              console.warn('contentId를 가져올 수 없습니다.');
              // 호텔 등록 페이지로 이동
              alert("호텔 등록 페이지로 이동합니다.");
              router.push("/hotel/register");
              return;
            }
          }
        } catch (error) {
          console.error('관리자 정보 처리 실패:', error);
        }
        
        router.push("/admin");
      } else {
        // 일반 회원인 경우 메인 페이지로 이동
        router.push("/");
      }
    } else {
      setErrors({
        general: "아이디 또는 비밀번호가 올바르지 않습니다.",
      });
    }
      setIsSubmitting(false);
    
  };

  // Enter 키 처리
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSubmit(e);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className={styles.container}>
        <div className={styles.loginBox}>
          <h1 className={styles.title}>로그인</h1>
          <p className={styles.subtitle}>CheckIn에 오신 것을 환영합니다</p>

          <form onSubmit={handleSubmit} className={styles.form}>
            {/* 전체 에러 메시지 */}
            {errors.general && (
              <div className={styles.generalError}>{errors.general}</div>
            )}

            {/* 아이디 */}
            <div className={styles.formGroup}>
              <label htmlFor="id" className={styles.label}>
                아이디
              </label>
              <input
                type="text"
                id="id"
                name="id"
                value={formData.id}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                className={`${styles.input} ${errors.id ? styles.inputError : ""}`}
                placeholder="아이디를 입력해주세요"
                autoComplete="username"
              />
              {errors.id && (
                <span className={styles.errorMessage}>{errors.id}</span>
              )}
            </div>

            {/* 비밀번호 */}
            <div className={styles.formGroup}>
              <label htmlFor="password" className={styles.label}>
                비밀번호
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                className={`${styles.input} ${errors.password ? styles.inputError : ""}`}
                placeholder="비밀번호를 입력해주세요"
                autoComplete="current-password"
              />
              {errors.password && (
                <span className={styles.errorMessage}>{errors.password}</span>
              )}
            </div>

            {/* 로그인 유지 체크박스와 사용자 유형 선택 */}
            <div className={styles.optionsGroup}>
              <div className={styles.checkboxGroup}>
                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className={styles.checkbox}
                  />
                  <span>로그인 상태 유지</span>
                </label>
              </div>
              
              <div className={styles.userTypeGroup}>
                <label className={styles.radioLabel}>
                  <input
                    type="radio"
                    name="role"
                    value="customer"
                    checked={formData.role === "customer"}
                    onChange={handleChange}
                    className={styles.radioInput}
                  />
                  회원
                </label>
                <label className={styles.radioLabel}>
                  <input
                    type="radio"
                    name="role"
                    value="admin"
                    checked={formData.role === "admin"}
                    onChange={handleChange}
                    className={styles.radioInput}
                  />
                  관리자
                </label>
              </div>
            </div>

            {/* 로그인 버튼 */}
            <button
              type="submit"
              className={styles.submitButton}
              disabled={isSubmitting}
            >
              {isSubmitting ? "로그인 중..." : "로그인"}
            </button>
          </form>

          {/* 추가 링크 */}
          <div className={styles.links}>
            <Link href="/find-id" className={styles.link}>
              아이디 찾기
            </Link>
            <span className={styles.divider}>|</span>
            <Link href="/find-password" className={styles.link}>
              비밀번호 찾기
            </Link>
          </div>

          {/* 회원가입 링크 */}
          <div className={styles.footer}>
            <p>
              아직 계정이 없으신가요?{" "}
              <Link href="/signup" className={styles.signupLink}>
                회원가입
              </Link>
            </p>
          </div>

          {/* 소셜 로그인 (선택사항) */}
          <div className={styles.socialLogin}>
            <div className={styles.dividerLine}>
              <span>또는</span>
            </div>
            <button
              type="button"
              className={styles.socialButton}
              onClick={handleNaverLogin}
            >
              <span className={styles.naverIcon}>N</span>
              네이버로 로그인
            </button>
            <button
              type="button"
              className={styles.socialButton}
              onClick={() => alert("카카오 로그인 기능 준비 중입니다.")}
            >
              <span className={styles.kakaoIcon}>K</span>
              카카오로 로그인
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
