"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import styles from "./signup.module.css";
import axios from "axios";

export default function SignupPage() {
  const signUp_url = "/api/login/signup";
  const checkId_url = "/api/login/checkId";
  const checkNickname_url = "/api/login/checkNickname";
  const sendVerificationCode_url = "/api/login/send-verification-code";
  const verifyEmail_url = "/api/login/verify-email";

  const router = useRouter();
  const [formData, setFormData] = useState({
    id: "",
    password: "",
    passwordConfirm: "",
    email: "",
    nickname: "",
    phone: "",
    name: "",
    birthday: "",
    gender: "",
    role: "customer", // 기본값: 회원
  });

  const [errors, setErrors] = useState({});
  const [idStatus, setIdStatus] = useState(null); // 'success', 'error', null
  const [idMessage, setIdMessage] = useState(''); // 아이디 검사 메시지 (성공/실패)
  const [nicknameStatus, setNicknameStatus] = useState(null); // 'success', 'error', null
  const [nicknameMessage, setNicknameMessage] = useState(''); // 닉네임 검사 메시지 (성공/실패)
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // 이메일 인증 관련 상태
  const [emailVerified, setEmailVerified] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [isVerifyingCode, setIsVerifyingCode] = useState(false);
  
  function signUp(){
    axios.post(signUp_url, formData)
      .then(response => {
        console.log(response.data);
        if(response.data.message){
          errors.userId = response.data.message;
        }
      })
      
  }

 

  const checkId = useCallback(() => {
    axios.post(checkId_url, { id: formData.id, role: formData.role }).then(function(res){
      console.log(res.data);
      if(res.data.status === 'fail'){
        // 실패 시: 빨간 글씨로 에러 메시지 표시
        const idError = {};
        idError.id = res.data.message;
        setErrors(idError);
        setIdStatus('error');
        setIdMessage(res.data.message);
      } else if(res.data.status === 'success'){
        // 성공 시: 초록 테두리와 초록 글씨로 성공 메시지 표시
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.id; // errors에서 id 제거
          return newErrors;
        });
        setIdStatus('success');
        setIdMessage(res.data.message || '사용 가능한 아이디입니다.');
      }
    })
  }, [formData.id, formData.role]);

  const checkNickname = useCallback(() => {
    axios.post(checkNickname_url, { nickname: formData.nickname, role: formData.role }).then(function(res){
      console.log(res.data);
      if(res.data.status === 'fail'){
        // 실패 시: 빨간 글씨로 에러 메시지 표시
        const nicknameError = {};
        nicknameError.nickname = res.data.message;
        setErrors(nicknameError);
        setNicknameStatus('error');
        setNicknameMessage(res.data.message);
      } else if(res.data.status === 'success'){
        // 성공 시: 초록 테두리와 초록 글씨로 성공 메시지 표시
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.nickname; // errors에서 nickname 제거
          return newErrors;
        });
        setNicknameStatus('success');
        setNicknameMessage(res.data.message || '사용 가능한 닉네임입니다.');
      }
    })
  }, [formData.nickname, formData.role]);

  useEffect(function(){
    if (/^[a-zA-Z0-9]{4,20}$/.test(formData.id)){
    checkId();
    }
    else{
      
    }
  },[formData.id, formData.role, checkId]);

  useEffect(function(){
    if (formData.nickname.length >= 2 && formData.nickname.length <= 10){
    checkNickname();
    }
    else{
      
    }
  },[formData.nickname, formData.role, checkNickname]);
  // 입력 필드 변경 핸들러
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // 아이디가 변경되면 상태와 에러 초기화
    if (name === 'id') {
      setIdStatus(null);
      setIdMessage('');
      setErrors((prev) => ({
        ...prev,
        id: "",
      }));
    } else if (name === 'nickname') {
      // 닉네임이 변경되면 상태와 에러 초기화
      setNicknameStatus(null);
      setNicknameMessage('');
      setErrors((prev) => ({
        ...prev,
        nickname: "",
      }));
    } else {
      // 다른 필드의 경우에만 에러 제거
      if (errors[name]) {
        setErrors((prev) => ({
          ...prev,
          [name]: "",
        }));
      }
    }
  };

  // 이메일 인증 코드 전송
  const handleSendVerificationCode = async () => {
    if (!formData.email) {
      alert('이메일을 먼저 입력해주세요.');
      return;
    }
    setIsSendingCode(true);
    try {
      const response = await axios.post(sendVerificationCode_url, {
        email: formData.email
      });
      alert('인증 코드가 전송되었습니다.');
    } catch (error) {
      alert('인증 코드 전송에 실패했습니다.');
    } finally {
      setIsSendingCode(false);
    }
  };

  // 이메일 인증 코드 확인
  const handleVerifyEmail = async () => {
    if (!verificationCode) {
      alert('인증 코드를 입력해주세요.');
      return;
    }

    setIsVerifyingCode(true);
    try {
      const response = await axios.post(verifyEmail_url, {
        email: formData.email,
        code: verificationCode
      });
      if (response.data.success) {
        setEmailVerified(true);
        alert('이메일 인증이 완료되었습니다.');
      } else {
        alert('인증 코드가 올바르지 않습니다.');
      }
    } catch (error) {
      alert('인증 코드 확인에 실패했습니다.');
    } finally {
      setIsVerifyingCode(false);
    }
  };

  // 유효성 검사 함수
  const validateForm = () => {
    const newErrors = {};

    // 아이디 검사 (4-20자, 영문+숫자)
    if (!formData.id) {
      newErrors.id = "아이디를 입력해주세요.";
    } else if (!/^[a-zA-Z0-9]{4,20}$/.test(formData.id)) {
      newErrors.id = "아이디는 4-20자의 영문, 숫자만 가능합니다.";
    } else if (idStatus === 'error') {
      // 아이디 중복 검사 실패 시
      newErrors.id = idMessage || "아이디 중복 검사가 필요합니다.";
    } else if (idStatus !== 'success') {
      // 아이디 중복 검사가 아직 완료되지 않은 경우
      newErrors.id = "아이디 중복 검사를 완료해주세요.";
    }

    // 비밀번호 검사 (8자 이상, 영문+숫자+특수문자)
    if (!formData.password) {
      newErrors.password = "비밀번호를 입력해주세요.";
    } else if (
      !/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/.test(
        formData.password
      )
    ) {
      newErrors.password =
        "비밀번호는 8자 이상, 영문, 숫자, 특수문자를 포함해야 합니다.";
    }

    // 비밀번호 확인
    if (!formData.passwordConfirm) {
      newErrors.passwordConfirm = "비밀번호 확인을 입력해주세요.";
    } else if (formData.password !== formData.passwordConfirm) {
      newErrors.passwordConfirm = "비밀번호가 일치하지 않습니다.";
    }

    // 이메일 검사
    if (!formData.email) {
      newErrors.email = "이메일을 입력해주세요.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "올바른 이메일 형식이 아닙니다.";
    }

    // 닉네임 검사 (2-10자)
    if (!formData.nickname) {
      newErrors.nickname = "닉네임을 입력해주세요.";
    } else if (formData.nickname.length < 2 || formData.nickname.length > 10) {
      newErrors.nickname = "닉네임은 2-10자로 입력해주세요.";
    } else if (nicknameStatus === 'error') {
      // 닉네임 중복 검사 실패 시
      newErrors.nickname = nicknameMessage || "닉네임 중복 검사가 필요합니다.";
    } else if (nicknameStatus !== 'success') {
      // 닉네임 중복 검사가 아직 완료되지 않은 경우
      newErrors.nickname = "닉네임 중복 검사를 완료해주세요.";
    }

    // 전화번호 검사 (숫자만, 10-11자)
    if (!formData.phone) {
      newErrors.phone = "전화번호를 입력해주세요.";
    } else if (!/^[0-9]{10,11}$/.test(formData.phone)) {
      newErrors.phone = "전화번호는 10-11자리 숫자만 입력해주세요.";
    }

    // 이름 검사
    if (!formData.name) {
      newErrors.name = "이름을 입력해주세요.";
    } else if (formData.name.length < 2) {
      newErrors.name = "이름은 2자 이상 입력해주세요.";
    }

    // 생년월일 검사
    if (!formData.birthday) {
      newErrors.birthday = "생년월일을 입력해주세요.";
    }

    // 성별 검사
    if (!formData.gender) {
      newErrors.gender = "성별을 선택해주세요.";
    }

    setErrors(newErrors);
    
    // 에러가 있으면 첫 번째 에러 필드로 스크롤
    if (Object.keys(newErrors).length > 0) {
      const firstErrorField = Object.keys(newErrors)[0];
      const errorElement = document.getElementById(firstErrorField);
      if (errorElement) {
        errorElement.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' 
        });
        errorElement.focus();
      }
    }
    
    return Object.keys(newErrors).length === 0;
  };

  // 폼 제출 핸들러
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // TODO: API 연동
      // const response = await axios.post('/api/auth/signup', formData);
      
      // 임시: 콘솔에 데이터 출력
      console.log("회원가입 데이터:", formData);
      signUp();
      // 성공 시 사용자 타입에 따라 리다이렉트
      alert("회원가입이 완료되었습니다!");
      
      // 사업자(admin)인 경우 관리자 화면으로 이동
      if (formData.role === "admin") {
        router.push("/admin");
      } else {
        // 일반 회원인 경우 로그인 페이지로 이동
        router.push("/login");
      }
    } catch (error) {
      console.error("회원가입 실패:", error);
      alert("회원가입에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className={styles.container}>
        <div className={styles.signupBox}>
          <h1 className={styles.title}>회원가입</h1>
          <p className={styles.subtitle}>CheckIn에 오신 것을 환영합니다</p>

          <form onSubmit={handleSubmit} className={styles.form}>
            {/* 사용자 유형 선택 */}
            <div className={styles.formGroup}>
              <label className={styles.label}>
                사용자 유형 <span className={styles.required}>*</span>
              </label>
              <div className={styles.radioGroup}>
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

            {/* 아이디 */}
            <div className={styles.formGroup}>
              <label htmlFor="id" className={styles.label}>
                아이디 <span className={styles.required}>*</span>
              </label>
              <input
                type="text"
                id="id"
                name="id"
                value={formData.id}
                onChange={handleChange}
                className={`${styles.input} ${
                  idStatus === 'error' 
                    ? styles.inputError 
                    : idStatus === 'success' 
                    ? styles.inputSuccess 
                    : ""
                }`}
                placeholder="4-20자의 영문, 숫자"
              />
              {idMessage && (
                <span className={
                  idStatus === 'success' 
                    ? styles.successMessage
                    : styles.errorMessage
                }>
                  {idMessage}
                </span>
              )}
              {errors.id && !idMessage && (
                <span className={styles.errorMessage}>{errors.id}</span>
              )}
            </div>

            {/* 비밀번호 */}
            <div className={styles.formGroup}>
              <label htmlFor="password" className={styles.label}>
                비밀번호 <span className={styles.required}>*</span>
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={`${styles.input} ${errors.password ? styles.inputError : ""}`}
                placeholder="8자 이상, 영문, 숫자, 특수문자 포함"
              />
              {errors.password && (
                <span className={styles.errorMessage}>{errors.password}</span>
              )}
            </div>

            {/* 비밀번호 확인 */}
            <div className={styles.formGroup}>
              <label htmlFor="passwordConfirm" className={styles.label}>
                비밀번호 확인 <span className={styles.required}>*</span>
              </label>
              <input
                type="password"
                id="passwordConfirm"
                name="passwordConfirm"
                value={formData.passwordConfirm}
                onChange={handleChange}
                className={`${styles.input} ${errors.passwordConfirm ? styles.inputError : ""}`}
                placeholder="비밀번호를 다시 입력해주세요"
              />
              {errors.passwordConfirm && (
                <span className={styles.errorMessage}>
                  {errors.passwordConfirm}
                </span>
              )}
            </div>

            {/* 이메일 */}
            <div className={styles.formGroup}>
              <label htmlFor="email" className={styles.label}>
                이메일 <span className={styles.required}>*</span>
              </label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`${styles.input} ${errors.email ? styles.inputError : ""}`}
                  placeholder="example@email.com"
                  style={{ flex: 1 }}
                />
                <button
                  type="button"
                  onClick={handleSendVerificationCode}
                  disabled={isSendingCode || emailVerified}
                  className={styles.verifyButton}
                >
                  {isSendingCode ? '전송 중...' : emailVerified ? '인증 완료' : '인증번호 전송'}
                </button>
              </div>
              {errors.email && (
                <span className={styles.errorMessage}>{errors.email}</span>
              )}
              
              {/* 인증 코드 입력 필드 */}
              {formData.email && !emailVerified && (
                <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.5rem' }}>
                  <input
                    type="text"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    className={styles.input}
                    placeholder="인증 코드 입력"
                    style={{ flex: 1 }}
                  />
                  <button
                    type="button"
                    onClick={handleVerifyEmail}
                    disabled={isVerifyingCode}
                    className={styles.verifyButton}
                  >
                    {isVerifyingCode ? '확인 중...' : '확인'}
                  </button>
                </div>
              )}
              
              {emailVerified && (
                <span className={styles.successMessage}>✓ 이메일 인증이 완료되었습니다.</span>
              )}
            </div>

            {/* 닉네임 */}
            <div className={styles.formGroup}>
              <label htmlFor="nickname" className={styles.label}>
                닉네임 <span className={styles.required}>*</span>
              </label>
              <input
                type="text"
                id="nickname"
                name="nickname"
                value={formData.nickname}
                onChange={handleChange}
                className={`${styles.input} ${
                  nicknameStatus === 'error' 
                    ? styles.inputError 
                    : nicknameStatus === 'success' 
                    ? styles.inputSuccess 
                    : ""
                }`}
                placeholder="2-10자"
              />
              {nicknameMessage && (
                <span className={
                  nicknameStatus === 'success' 
                    ? styles.successMessage
                    : styles.errorMessage
                }>
                  {nicknameMessage}
                </span>
              )}
              {errors.nickname && !nicknameMessage && (
                <span className={styles.errorMessage}>{errors.nickname}</span>
              )}
            </div>

            {/* 이름 */}
            <div className={styles.formGroup}>
              <label htmlFor="name" className={styles.label}>
                이름 <span className={styles.required}>*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`${styles.input} ${errors.name ? styles.inputError : ""}`}
                placeholder="실명을 입력해주세요"
              />
              {errors.name && (
                <span className={styles.errorMessage}>{errors.name}</span>
              )}
            </div>

            {/* 전화번호 */}
            <div className={styles.formGroup}>
              <label htmlFor="phone" className={styles.label}>
                전화번호 <span className={styles.required}>*</span>
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className={`${styles.input} ${errors.phone ? styles.inputError : ""}`}
                placeholder="01012345678 (숫자만 입력)"
              />
              {errors.phone && (
                <span className={styles.errorMessage}>{errors.phone}</span>
              )}
            </div>

            {/* 생년월일 */}
            <div className={styles.formGroup}>
              <label htmlFor="birthday" className={styles.label}>
                생년월일 <span className={styles.required}>*</span>
              </label>
              <input
                type="date"
                id="birthday"
                name="birthday"
                value={formData.birthday}
                onChange={handleChange}
                className={`${styles.input} ${errors.birthday ? styles.inputError : ""}`}
              />
              {errors.birthday && (
                <span className={styles.errorMessage}>{errors.birthday}</span>
              )}
            </div>

            {/* 성별 */}
            <div className={styles.formGroup}>
              <label className={styles.label}>
                성별 <span className={styles.required}>*</span>
              </label>
              <div className={styles.radioGroup}>
                <label className={styles.radioLabel}>
                  <input
                    type="radio"
                    name="gender"
                    value="male"
                    checked={formData.gender === "male"}
                    onChange={handleChange}
                    className={styles.radioInput}
                  />
                  <span>남성</span>
                </label>
                <label className={styles.radioLabel}>
                  <input
                    type="radio"
                    name="gender"
                    value="female"
                    checked={formData.gender === "female"}
                    onChange={handleChange}
                    className={styles.radioInput}
                  />
                  <span>여성</span>
                </label>
                <label className={styles.radioLabel}>
                  <input
                    type="radio"
                    name="gender"
                    value="other"
                    checked={formData.gender === "other"}
                    onChange={handleChange}
                    className={styles.radioInput}
                  />
                  <span>기타</span>
                </label>
              </div>
              {errors.gender && (
                <span className={styles.errorMessage}>{errors.gender}</span>
              )}
            </div>

            {/* 제출 버튼 */}
            <button
              type="submit"
              className={styles.submitButton}
              disabled={isSubmitting}
            >
              {isSubmitting ? "처리 중..." : "회원가입"}
            </button>
          </form>

          {/* 로그인 링크 */}
          <div className={styles.footer}>
            <p>
              이미 계정이 있으신가요?{" "}
              <Link href="/login" className={styles.link}>
                로그인
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
