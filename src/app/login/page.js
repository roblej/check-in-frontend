"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import styles from "./login.module.css";
import axios from "axios";
import { useCustomerStore } from "@/stores/customerStore"
export default function LoginPage() {
  const router = useRouter();
  const { setCustomer } = useCustomerStore();
  const [formData, setFormData] = useState({
    id: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  let customer = {};

  const login_url = "/api/login";
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
        customer = res.data;
        console.log("customer");
        console.log(customer);
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

    if(customer.customerIdx) {
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
      
      // 성공 시 메인 페이지로 이동
      alert("로그인 성공");
      customer.inlogged = true;
      setCustomer(customer);

      router.push("/");
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

            {/* 로그인 유지 체크박스 */}
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
              onClick={() => alert("네이버 로그인 기능 준비 중입니다.")}
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
