"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import styles from "./signup.module.css";
import axios from "axios";

export default function SignupPage() {
  const signUp_url = "/api/login/signup";
  const checkId_url = "/api/login/checkId";

  const router = useRouter();
  const [formData, setFormData] = useState({
    id: "",
    password: "",
    passwordConfirm: "",
    email: "",
    nickname: "",
    phone: "",
    name: "",
    birthdate: "",
    gender: "",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  useEffect(function(){
    checkId();

  },[formData.id]);


  function signUp(){
    axios.post(signUp_url, formData)
      .then(response => {
        console.log(response.data);
        if(response.data.message){
          errors.userId = response.data.message;
        }
      })
      
  }

 

  function checkId(){
    axios.post(checkId_url, { id: formData.id }).then(function(res){
      console.log(res.data);
      if(res.data.message){
        errors.userId = res.data.message;
      }
    })
  }
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

  // 유효성 검사 함수
  const validateForm = () => {
    const newErrors = {};

    // 아이디 검사 (4-20자, 영문+숫자)
    if (!formData.id) {
      newErrors.userId = "아이디를 입력해주세요.";
    } else if (!/^[a-zA-Z0-9]{4,20}$/.test(formData.id)) {
      newErrors.userId = "아이디는 4-20자의 영문, 숫자만 가능합니다.";
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
    if (!formData.birthdate) {
      newErrors.birthdate = "생년월일을 입력해주세요.";
    }

    // 성별 검사
    if (!formData.gender) {
      newErrors.gender = "성별을 선택해주세요.";
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

    setIsSubmitting(true);

    try {
      // TODO: API 연동
      // const response = await axios.post('/api/auth/signup', formData);
      
      // 임시: 콘솔에 데이터 출력
      console.log("회원가입 데이터:", formData);

      // 성공 시 로그인 페이지로 이동
      alert("회원가입이 완료되었습니다!");
      router.push("/login");
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
                className={`${styles.input} ${errors.userId ? styles.inputError : ""}`}
                placeholder="4-20자의 영문, 숫자"
              />
              {errors.userId && (
                <span className={styles.errorMessage}>{errors.userId}</span>
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
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`${styles.input} ${errors.email ? styles.inputError : ""}`}
                placeholder="example@email.com"
              />
              {errors.email && (
                <span className={styles.errorMessage}>{errors.email}</span>
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
                className={`${styles.input} ${errors.nickname ? styles.inputError : ""}`}
                placeholder="2-10자"
              />
              {errors.nickname && (
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
              <label htmlFor="birthdate" className={styles.label}>
                생년월일 <span className={styles.required}>*</span>
              </label>
              <input
                type="date"
                id="birthdate"
                name="birthdate"
                value={formData.birthdate}
                onChange={handleChange}
                className={`${styles.input} ${errors.birthdate ? styles.inputError : ""}`}
              />
              {errors.birthdate && (
                <span className={styles.errorMessage}>{errors.birthdate}</span>
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
