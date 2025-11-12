"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import axios from "@/lib/axios";
import { useRouter } from "next/navigation";

const initialForm = {
  name: "",
  email: "",
  code: "",
};

const FindIdPage = () => {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [foundId, setFoundId] = useState("");
  const router = useRouter();

  const resetMessages = () => {
    setSuccessMessage("");
    setFoundId("");
  };

  const validateBasicFields = useCallback(() => {
    const newErrors = {};
    if (!form.name.trim()) {
      newErrors.name = "이름을 입력해주세요.";
    }
    if (!form.email.trim()) {
      newErrors.email = "이메일을 입력해주세요.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      newErrors.email = "올바른 이메일 주소가 아닙니다.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [form.email, form.name]);

  const handleChange = (field) => (event) => {
    const value = event.target.value;
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
    if (field !== "code") {
      resetMessages();
    }
  };

  const handleSendCode = async () => {
    if (isSending) return;
    if (!validateBasicFields()) {
      return;
    }
    setIsSending(true);
    setErrors((prev) => ({ ...prev, code: "" }));
    resetMessages();
    try {
      const response = await axios.post("/login/findid", {
        name: form.name.trim(),
        email: form.email.trim(),
      });
      const status = response?.data?.status;
      const message = response?.data?.message || "";
      if (message.includes("소셜 로그인 사용자입니다.")) {
        alert(message);
        router.push("/login");
        return;
      }
      if (status === "success") {
        setIsCodeSent(true);
        setSuccessMessage(message || "인증 코드가 발송되었습니다.");
      } else {
        setIsCodeSent(false);
        setSuccessMessage("" );
        setErrors((prev) => ({
          ...prev,
          general: message || "인증 코드를 발송하지 못했습니다.",
        }));
      }
    } catch (error) {
      console.error("아이디 찾기 인증 코드 발송 실패", error);
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
    setErrors({});
    resetMessages();
    try {
      const response = await axios.post("/login/findid", {
        name: form.name.trim(),
        email: form.email.trim(),
        code: form.code.trim(),
      });
      const status = response?.data?.status;
      const message = response?.data?.message || "";
      if (message.includes("소셜 로그인 사용자입니다.")) {
        alert(message);
        router.push("/login");
        return;
      }
      if (status === "success") {
        setFoundId(response?.data?.id || "");
        setSuccessMessage(message || "아이디 찾기에 성공했습니다.");
        setIsCodeSent(false);
      } else {
        setErrors((prev) => ({
          ...prev,
          general: message || "인증 코드가 올바르지 않습니다.",
        }));
      }
    } catch (error) {
      console.error("아이디 찾기 실패", error);
      setErrors((prev) => ({
        ...prev,
        general: "아이디를 찾는 중 오류가 발생했습니다.",
      }));
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8 space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">아이디 찾기</h1>
            <p className="mt-2 text-sm text-gray-500">
              가입 시 입력한 이름과 이메일을 통해 인증 후 아이디를 확인할 수 있습니다.
            </p>
          </div>

          {errors.general && (
            <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
              {errors.general}
            </div>
          )}

          {successMessage && (
            <div className="rounded-xl bg-blue-50 border border-blue-200 px-4 py-3 text-sm text-blue-600">
              {successMessage}
            </div>
          )}

          {foundId && (
            <div className="rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-4">
              <p className="text-sm text-emerald-600">회원님의 아이디는 다음과 같습니다.</p>
              <p className="mt-2 text-lg font-semibold text-emerald-700 break-all">{foundId}</p>
            </div>
          )}

          {!foundId && (
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
                {errors.name && (
                  <p className="mt-1 text-xs text-red-500">{errors.name}</p>
                )}
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
                  >
                    {isSending ? "전송 중..." : "인증 코드 발송"}
                  </button>
                </div>
                {errors.email && (
                  <p className="mt-1 text-xs text-red-500">{errors.email}</p>
                )}
              </div>

              {isCodeSent && (
                <div>
                  <label htmlFor="code" className="block text-sm font-medium text-gray-700">
                    인증 코드
                  </label>
                  <div className="mt-1 flex gap-2">
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
                    >
                      {isVerifying ? "확인 중..." : "확인"}
                    </button>
                  </div>
                  {errors.code && (
                    <p className="mt-1 text-xs text-red-500">{errors.code}</p>
                  )}
                </div>
              )}
            </div>
          )}

          <div className="pt-4 border-t border-gray-100 flex gap-2">
            <Link
              href="/login"
              className="flex-1 rounded-xl border border-gray-200 px-4 py-2.5 text-center text-sm font-medium text-gray-600 transition-colors hover:border-blue-300 hover:text-blue-600"
            >
              로그인으로 돌아가기
            </Link>
            <Link
              href="/signup"
              className="flex-1 rounded-xl bg-blue-600 px-4 py-2.5 text-center text-sm font-semibold text-white transition-colors hover:bg-blue-700"
            >
              회원가입
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default FindIdPage;
