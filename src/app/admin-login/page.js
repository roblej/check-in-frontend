"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import axios from "axios";
import { useCustomerStore } from "@/stores/customerStore";
import { useAdminStore } from "@/stores/adminStore";
import { setAdminIdxCookie } from "@/utils/cookieUtils";

function AdminLoginForm() {
  const router = useRouter();
  const { setAccessToken, setInlogged, isInlogged } = useCustomerStore();
  const { setAdminIdx, setContentId, setAdminLoggedIn, fetchContentIdByAdminIdx } = useAdminStore();
  const [formData, setFormData] = useState({
    id: "",
    password: "",
    role: "admin", // 관리자/마스터 전용
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  let accessToken = "";

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

  async function login() {
    try {
      const res = await axios.post(login_url, formData);
      if (res.data) {
        accessToken = res.data;
        setInlogged(true);
        return true;
      }
      return false;
    } catch (error) {
      console.error("로그인 실패:", error);
      return false;
    }
  }

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

    setIsSubmitting(true);

    const loginSuccess = await login();

    if (loginSuccess && isInlogged()) {
      setAccessToken(accessToken);

      try {
        // 토큰에서 adminIdx 추출
        const userInfo = JSON.parse(atob(accessToken.split('.')[1]));
        const adminIdx = userInfo.adminIdx;

        if (adminIdx) {
          // adminIdx를 쿠키에 저장
          setAdminIdxCookie(adminIdx, 7); // 7일

          // admin의 type 조회 (마스터인지 관리자인지 확인)
          try {
            const typeResponse = await fetch(`/api/admin/type/${adminIdx}`, {
              credentials: 'include'
            });
            
            if (typeResponse.ok) {
              const adminType = await typeResponse.json();
              const isMaster = adminType.type === false || adminType.type === 0;

              if (isMaster) {
                // 마스터 (type=0): 마스터 페이지로 이동
                setAdminLoggedIn(true);
                router.push("/master");
                return;
              } else {
                // 관리자 (type=1): 관리자 페이지로 이동
                // adminIdx로 contentId 가져오기
                const contentId = await fetchContentIdByAdminIdx(adminIdx);

                if (contentId) {
                  setAdminLoggedIn(true);
                  console.log('관리자 로그인 성공:', { adminIdx, contentId });
                  router.push("/admin");
                } else {
                  console.warn('contentId를 가져올 수 없습니다.');
                  // 호텔 등록 페이지로 이동
                  alert("호텔 등록 페이지로 이동합니다.");
                  router.push("/hotel/register");
                }
                return;
              }
            }
          } catch (error) {
            console.error('관리자 type 조회 실패:', error);
            // type 조회 실패 시 기본적으로 관리자 페이지로 이동
            const contentId = await fetchContentIdByAdminIdx(adminIdx);
            if (contentId) {
              setAdminLoggedIn(true);
              router.push("/admin");
            } else {
              router.push("/hotel/register");
            }
          }
        }
      } catch (error) {
        console.error('관리자 정보 처리 실패:', error);
        setErrors({
          general: "로그인 처리 중 오류가 발생했습니다.",
        });
      }
    } else {
      setErrors({
        general: "아이디 또는 비밀번호가 올바르지 않습니다.",
      });
    }

    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h1 className="text-3xl font-bold text-center text-gray-900 mb-2">
              관리자 로그인
            </h1>
            <p className="text-center text-gray-600 mb-8">
              관리자 또는 마스터 계정으로 로그인하세요
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              {errors.general && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                  {errors.general}
                </div>
              )}

              <div>
                <label
                  htmlFor="id"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  아이디
                </label>
                <input
                  type="text"
                  id="id"
                  name="id"
                  value={formData.id}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.id ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="아이디를 입력하세요"
                />
                {errors.id && (
                  <p className="mt-1 text-sm text-red-600">{errors.id}</p>
                )}
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  비밀번호
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.password ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="비밀번호를 입력하세요"
                />
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "로그인 중..." : "로그인"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminLoginForm;

