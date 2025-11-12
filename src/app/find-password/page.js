"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import axios from "@/lib/axios";

const initialForm = {
  name: "",
  userId: "",
  email: "",
  code: "",
  newPassword: "",
  confirmPassword: "",
};

const passwordRuleMessage = "비밀번호는 8자 이상, 영문, 숫자, 특수문자를 포함해야 합니다.";

const FindPasswordPage = () => {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  const resetMessages = () => {
    setSuccessMessage("");
    setErrors((prev) => ({ ...prev, general: "" }));
  };

  const validateBasicFields = useCallback(() => {
    const newErrors = {};
    if (!form.name.trim()) {
      newErrors.name = "이름을 입력해주세요.";
    }
    if (!form.userId.trim()) {
      newErrors.userId = "아이디를 입력해주세요.";
    }
    if (!form.email.trim()) {
      newErrors.email = "이메일을 입력해주세요.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      newErrors.email = "올바른 이메일 주소가 아닙니다.";
    }
    setErrors((prev) => ({ ...prev, ...newErrors }));
    return Object.keys(newErrors).length === 0;
  }, [form.email, form.name, form.userId]);

  const handleChange = (field) => (event) => {
    const value = event.target.value;
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
    if (!["code", "newPassword", "confirmPassword"].includes(field)) {
      resetMessages();
    }
  };

  const handleSendCode = async () => {
    if (isSending) return;
    if (!validateBasicFields()) {
      return;
    }
    setIsSending(true);
    resetMessages();
    setErrors((prev) => ({ ...prev, code: "" }));
    try {
      const response = await axios.post("/login/findpassword/send-code", {
        name: form.name.trim(),
        userId: form.userId.trim(),
        email: form.email.trim(),
      });
      const status = response?.data?.status;
      const message = response?.data?.message;
      if (status === "success") {
        setIsCodeSent(true);
        setSuccessMessage(message || "인증 코드가 발송되었습니다.");
      } else {
        setIsCodeSent(false);
        setSuccessMessage("");
        setErrors((prev) => ({
          ...prev,
          general: message || "인증 코드를 발송하지 못했습니다.",
        }));
      }
    } catch (error) {
      console.error("비밀번호 찾기 인증 코드 발송 실패", error);
      setErrors((prev) => ({
        ...prev,
        general: "인증 코드 발송 중 오류가 발생했습니다.",
      }));
      setIsCodeSent(false);
    } finally {
      setIsSending(false);
    }
  };

  const handleVerifyCode = async () => {
    if (isVerifying) return;
    if (!validateBasicFields()) {
      return;
    }
    if (!form.code.trim()) {
      setErrors((prev) => ({ ...prev, code: "인증 코드를 입력해주세요." }));
      return;
    }
    setIsVerifying(true);
    resetMessages();
    try {
      const response = await axios.post("/login/findpassword/verify-code", {
        name: form.name.trim(),
        userId: form.userId.trim(),
        email: form.email.trim(),
        code: form.code.trim(),
      });
      const status = response?.data?.status;
      const message = response?.data?.message;
      if (status === "success") {
        setIsVerified(true);
        setSuccessMessage(message || "인증이 완료되었습니다. 새 비밀번호를 설정해주세요.");
      } else {
        setErrors((prev) => ({
          ...prev,
          general: message || "인증 코드가 올바르지 않습니다.",
        }));
      }
    } catch (error) {
      console.error("비밀번호 찾기 인증 실패", error);
      setErrors((prev) => ({
        ...prev,
        general: "인증을 진행하는 중 오류가 발생했습니다.",
      }));
    } finally {
      setIsVerifying(false);
    }
  };

  const validatePasswordFields = () => {
    const newErrors = {};
    const trimmedPassword = form.newPassword.trim();
    const trimmedConfirm = form.confirmPassword.trim();
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;

    if (!trimmedPassword) {
      newErrors.newPassword = "새 비밀번호를 입력해주세요.";
    } else if (!passwordRegex.test(trimmedPassword)) {
      newErrors.newPassword = passwordRuleMessage;
    }

    if (!trimmedConfirm) {
      newErrors.confirmPassword = "비밀번호 확인을 입력해주세요.";
    } else if (trimmedPassword !== trimmedConfirm) {
      newErrors.confirmPassword = "비밀번호가 일치하지 않습니다.";
    }

    setErrors((prev) => ({ ...prev, ...newErrors }));
    return Object.keys(newErrors).length === 0;
  };

  const handleResetPassword = async () => {
    if (isResetting) return;
    if (!validatePasswordFields()) {
      return;
    }
    setIsResetting(true);
    resetMessages();
    try {
      const response = await axios.post("/login/findpassword/reset", {
        userId: form.userId.trim(),
        newPassword: form.newPassword.trim(),
      });
      const status = response?.data?.status;
      const message = response?.data?.message;
      if (status === "success") {
        setResetSuccess(true);
        setSuccessMessage(message || "비밀번호가 성공적으로 변경되었습니다.");
      } else {
        setErrors((prev) => ({
          ...prev,
          general: message || "비밀번호 변경에 실패했습니다.",
        }));
      }
    } catch (error) {
      console.error("비밀번호 변경 실패", error);
      setErrors((prev) => ({
        ...prev,
        general: "비밀번호 변경 중 오류가 발생했습니다.",
      }));
    } finally {
      setIsResetting(false);
    }
  };

  const renderBasicFields = () => (
    <div className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          이름
        </label>
        <input
          id="name"
          type="text"
          value={form.name}
          onChange={handleChange("name")}
          className={`mt-1 w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
            errors.name ? "border-red-400" : "border-gray-200"
          }`}
          placeholder="이름을 입력해주세요"
          autoComplete="name"
        />
        {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
      </div>
      <div>
        <label htmlFor="userId" className="block text-sm font-medium text-gray-700">
          아이디
        </label>
        <input
          id="userId"
          type="text"
          value={form.userId}
          onChange={handleChange("userId")}
          className={`mt-1 w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
            errors.userId ? "border-red-400" : "border-gray-200"
          }`}
          placeholder="아이디를 입력해주세요"
          autoComplete="username"
        />
        {errors.userId && <p className="mt-1 text-xs text-red-500">{errors.userId}</p>}
      </div>
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          이메일
        </label>
        <div className="mt-1 flex gap-2">
          <input
            id="email"
            type="email"
            value={form.email}
            onChange={handleChange("email")}
            className={`flex-1 rounded-xl border px-4 py-2.5 text-sm outline-none transition focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.email ? "border-red-400" : "border-gray-200"
            }`}
            placeholder="example@email.com"
            autoComplete="email"
          />
          <button
            type="button"
            onClick={handleSendCode}
            disabled={isSending}
            className={`rounded-xl border px-4 py-2 text-sm font-semibold transition-colors ${
              isSending
                ? "border-gray-200 text-gray-400 cursor-not-allowed"
                : "border-blue-200 text-blue-600 hover:bg-blue-50"
            }`}
            aria-label="인증 코드 발송"
          >
            {isSending ? "전송 중..." : "인증 코드 발송"}
          </button>
        </div>
        {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
      </div>
    </div>
  );

  const renderCodeField = () =>
    isCodeSent &&
    !isVerified && (
      <div className="space-y-2">
        <label htmlFor="code" className="block text-sm font-medium text-gray-700">
          인증 코드
        </label>
        <div className="flex gap-2">
          <input
            id="code"
            type="text"
            value={form.code}
            onChange={handleChange("code")}
            className={`flex-1 rounded-xl border px-4 py-2.5 text-sm outline-none transition focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.code ? "border-red-400" : "border-gray-200"
            }`}
            placeholder="인증 코드를 입력해주세요"
            inputMode="numeric"
            maxLength={6}
          />
          <button
            type="button"
            onClick={handleVerifyCode}
            disabled={isVerifying}
            className={`rounded-xl border px-4 py-2 text-sm font-semibold transition-colors ${
              isVerifying
                ? "border-gray-200 text-gray-400 cursor-not-allowed"
                : "border-blue-200 text-blue-600 hover:bg-blue-50"
            }`}
            aria-label="인증 코드 확인"
          >
            {isVerifying ? "확인 중..." : "확인"}
          </button>
        </div>
        {errors.code && <p className="text-xs text-red-500">{errors.code}</p>}
      </div>
    );

  const renderResetFields = () =>
    isVerified &&
    !resetSuccess && (
      <div className="space-y-4">
        <div>
          <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
            새 비밀번호
          </label>
          <input
            id="newPassword"
            type="password"
            value={form.newPassword}
            onChange={handleChange("newPassword")}
            className={`mt-1 w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.newPassword ? "border-red-400" : "border-gray-200"
            }`}
            placeholder="비밀번호는 8자 이상, 영문, 숫자, 특수문자를 포함해야 합니다."
            autoComplete="new-password"
          />
          <p className="mt-1 text-xs text-gray-500">{passwordRuleMessage}</p>
          {errors.newPassword && (
            <p className="mt-1 text-xs text-red-500">{errors.newPassword}</p>
          )}
        </div>
        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
            새 비밀번호 확인
          </label>
          <input
            id="confirmPassword"
            type="password"
            value={form.confirmPassword}
            onChange={handleChange("confirmPassword")}
            className={`mt-1 w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.confirmPassword ? "border-red-400" : "border-gray-200"
            }`}
            placeholder="비밀번호를 다시 입력해주세요"
            autoComplete="new-password"
          />
          {errors.confirmPassword && (
            <p className="mt-1 text-xs text-red-500">{errors.confirmPassword}</p>
          )}
        </div>
        <button
          type="button"
          onClick={handleResetPassword}
          disabled={isResetting}
          className={`w-full rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 ${
            isResetting ? "opacity-70 cursor-not-allowed" : "hover:bg-blue-700"
          }`}
          aria-label="비밀번호 변경"
        >
          {isResetting ? "변경 중..." : "비밀번호 변경"}
        </button>
      </div>
    );

  const renderCompletion = () =>
    resetSuccess && (
      <div className="space-y-6 text-center">
        <div className="rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-4">
          <p className="text-sm text-emerald-600">비밀번호가 성공적으로 변경되었습니다.</p>
          <p className="mt-2 text-base text-emerald-700">
            새 비밀번호로 다시 로그인해주세요.
          </p>
        </div>
        <Link
          href="/login"
          className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
        >
          로그인 페이지로 이동
        </Link>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8 space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">비밀번호 찾기</h1>
            <p className="mt-2 text-sm text-gray-500">
              가입 정보 확인 후 인증을 완료하면 새 비밀번호를 설정할 수 있습니다.
            </p>
          </div>

          {errors.general && (
            <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
              {errors.general}
            </div>
          )}

          {successMessage && !resetSuccess && (
            <div className="rounded-xl bg-blue-50 border border-blue-200 px-4 py-3 text-sm text-blue-600">
              {successMessage}
            </div>
          )}

          {!resetSuccess && (
            <div className="space-y-6">
              {(!isVerified) && renderBasicFields()}
              {renderCodeField()}
              {renderResetFields()}
            </div>
          )}

          {renderCompletion()}

          {!resetSuccess && (
            <div className="pt-4 border-t border-gray-100 flex gap-2">
              <Link
                href="/login"
                className="flex-1 rounded-xl border border-gray-200 px-4 py-2.5 text-center text-sm font-medium text-gray-600 transition-colors hover:border-blue-300 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-offset-2"
              >
                로그인으로 돌아가기
              </Link>
              <Link
                href="/signup"
                className="flex-1 rounded-xl bg-blue-600 px-4 py-2.5 text-center text-sm font-semibold text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
              >
                회원가입
              </Link>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default FindPasswordPage;


