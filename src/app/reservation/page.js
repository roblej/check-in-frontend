"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { usePaymentStore } from "@/stores/paymentStore";
import TossPaymentsWidget from "@/components/payment/TossPaymentsWidget";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const HotelReservationPage = () => {
  const router = useRouter();
  const { paymentDraft, loadFromStorage, clearPaymentDraft, getRemainingMs } =
    usePaymentStore();

  // 결제 정보 상태
  const [paymentInfo, setPaymentInfo] = useState({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    specialRequests: "",
    agreeTerms: false,
    agreePrivacy: false,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // 결제 정보 로드
  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  // 결제 정보가 없으면 홈으로 리다이렉트
  useEffect(() => {
    if (!paymentDraft) {
      router.push("/");
    }
  }, [paymentDraft, router]);

  // 결제 정보가 없으면 로딩 표시
  if (!paymentDraft) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">결제 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  // 고정된 키들 생성
  const paymentKeys = useMemo(
    () => ({
      customerKey: `customer_${paymentDraft.meta?.hotelId || "default"}`,
      orderId: paymentDraft.orderId,
    }),
    [paymentDraft]
  );

  // 폼 유효성 검사
  const isFormValid = useMemo(() => {
    if (!paymentInfo.customerName.trim()) return false;
    if (!paymentInfo.customerEmail.trim()) return false;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(paymentInfo.customerEmail))
      return false;
    if (!paymentInfo.customerPhone.trim()) return false;
    if (!/^[0-9-+\s]+$/.test(paymentInfo.customerPhone)) return false;
    if (!paymentInfo.agreeTerms) return false;
    if (!paymentInfo.agreePrivacy) return false;
    return true;
  }, [paymentInfo]);

  // 폼 유효성 검사 (에러 메시지 포함)
  const validateForm = () => {
    const newErrors = {};

    if (!paymentInfo.customerName.trim()) {
      newErrors.customerName = "예약자 이름을 입력해주세요.";
    }

    if (!paymentInfo.customerEmail.trim()) {
      newErrors.customerEmail = "이메일을 입력해주세요.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(paymentInfo.customerEmail)) {
      newErrors.customerEmail = "올바른 이메일 형식을 입력해주세요.";
    }

    if (!paymentInfo.customerPhone.trim()) {
      newErrors.customerPhone = "전화번호를 입력해주세요.";
    } else if (!/^[0-9-+\s]+$/.test(paymentInfo.customerPhone)) {
      newErrors.customerPhone = "올바른 전화번호 형식을 입력해주세요.";
    }

    if (!paymentInfo.agreeTerms) {
      newErrors.agreeTerms = "이용약관에 동의해주세요.";
    }

    if (!paymentInfo.agreePrivacy) {
      newErrors.agreePrivacy = "개인정보처리방침에 동의해주세요.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 입력 필드 변경 핸들러
  const handleInputChange = (field, value) => {
    setPaymentInfo((prev) => ({
      ...prev,
      [field]: value,
    }));

    // 에러 메시지 제거
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  // 토스페이먼츠 결제 성공 처리
  const handlePaymentSuccess = async (paymentResult) => {
    try {
      setIsLoading(true);

      // 서버에 결제 완료 알림
      const response = await fetch("/api/payments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          paymentKey: paymentResult.paymentKey,
          orderId: paymentResult.orderId,
          amount: paymentDraft.finalAmount,
          type: "hotel_reservation",
          hotelInfo: {
            contentId: paymentDraft.meta.contentId,
            hotelName: paymentDraft.meta.hotelName,
            roomId: paymentDraft.meta.roomId,
            roomName: paymentDraft.meta.roomName,
            checkIn: paymentDraft.meta.checkIn,
            checkOut: paymentDraft.meta.checkOut,
            guests: paymentDraft.meta.guests,
            nights: paymentDraft.meta.nights,
            roomPrice: paymentDraft.meta.roomPrice,
            totalPrice: paymentDraft.meta.totalPrice,
            roomImage: paymentDraft.meta.roomImage,
            amenities: paymentDraft.meta.amenities,
          },
          customerInfo: {
            name: paymentInfo.customerName,
            email: paymentInfo.customerEmail,
            phone: paymentInfo.customerPhone,
            specialRequests: paymentInfo.specialRequests,
          },
        }),
      });

      if (response.ok) {
        clearPaymentDraft();
        router.push(
          `/checkout/success?orderId=${paymentResult.orderId}&amount=${paymentDraft.finalAmount}&type=hotel_reservation`
        );
      } else {
        throw new Error("서버 처리 중 오류가 발생했습니다.");
      }
    } catch (error) {
      console.error("결제 완료 처리 오류:", error);
      alert(
        "결제는 완료되었지만 처리 중 오류가 발생했습니다. 고객센터에 문의해주세요."
      );
    } finally {
      setIsLoading(false);
    }
  };

  // 토스페이먼츠 결제 실패 처리
  const handlePaymentFail = (error) => {
    console.error("결제 실패:", error);
    router.push(
      `/checkout/fail?error=${encodeURIComponent(
        error.message || "결제가 취소되었습니다."
      )}`
    );
  };

  const remaining = getRemainingMs();
  const minutes = Math.floor(remaining / 60000);
  const seconds = Math.floor((remaining % 60000) / 1000);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            호텔 예약 결제
          </h1>
          <p className="text-gray-600">
            예약 정보를 확인하고 결제를 진행해주세요.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 호텔 정보 및 예약자 정보 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 호텔 정보 */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                예약 정보
              </h2>
              <div className="flex gap-4">
                {paymentDraft.meta.roomImage ? (
                  <img
                    src={paymentDraft.meta.roomImage}
                    alt={paymentDraft.meta.roomName}
                    className="w-32 h-24 object-cover rounded-lg"
                  />
                ) : (
                  <div className="w-32 h-24 bg-gray-200 rounded-lg flex items-center justify-center">
                    <span className="text-gray-400 text-sm">이미지 없음</span>
                  </div>
                )}
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {paymentDraft.meta.hotelName}
                  </h3>
                  <p className="text-gray-600 mb-2">
                    {paymentDraft.meta.roomName}
                  </p>
                  <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                    <div>
                      <span className="font-medium">체크인:</span>{" "}
                      {paymentDraft.meta.checkIn}
                    </div>
                    <div>
                      <span className="font-medium">체크아웃:</span>{" "}
                      {paymentDraft.meta.checkOut}
                    </div>
                    <div>
                      <span className="font-medium">숙박 일수:</span>{" "}
                      {paymentDraft.meta.nights}박
                    </div>
                    <div>
                      <span className="font-medium">게스트:</span>{" "}
                      {paymentDraft.meta.guests}명
                    </div>
                    <div>
                      <span className="font-medium">객실 가격:</span> ₩
                      {paymentDraft.meta.roomPrice.toLocaleString()}/박
                    </div>
                    <div>
                      <span className="font-medium">총 가격:</span> ₩
                      {paymentDraft.meta.totalPrice.toLocaleString()}
                    </div>
                  </div>

                  {/* 편의시설 */}
                  {paymentDraft.meta.amenities &&
                    paymentDraft.meta.amenities.length > 0 && (
                      <div className="mt-3">
                        <span className="text-sm font-medium text-gray-700">
                          편의시설:
                        </span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {paymentDraft.meta.amenities.map((amenity, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded"
                            >
                              {amenity}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                </div>
              </div>
            </div>

            {/* 예약자 정보 */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                예약자 정보
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    예약자 이름 *
                  </label>
                  <input
                    type="text"
                    value={paymentInfo.customerName}
                    onChange={(e) =>
                      handleInputChange("customerName", e.target.value)
                    }
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.customerName ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="예약자 이름을 입력하세요"
                  />
                  {errors.customerName && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.customerName}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    이메일 *
                  </label>
                  <input
                    type="email"
                    value={paymentInfo.customerEmail}
                    onChange={(e) =>
                      handleInputChange("customerEmail", e.target.value)
                    }
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.customerEmail
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                    placeholder="이메일을 입력하세요"
                  />
                  {errors.customerEmail && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.customerEmail}
                    </p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    전화번호 *
                  </label>
                  <input
                    type="tel"
                    value={paymentInfo.customerPhone}
                    onChange={(e) =>
                      handleInputChange("customerPhone", e.target.value)
                    }
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.customerPhone
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                    placeholder="전화번호를 입력하세요"
                  />
                  {errors.customerPhone && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.customerPhone}
                    </p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    특별 요청사항
                  </label>
                  <textarea
                    value={paymentInfo.specialRequests}
                    onChange={(e) =>
                      handleInputChange("specialRequests", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="특별 요청사항이 있으시면 입력해주세요"
                    rows={3}
                  />
                </div>
              </div>
            </div>

            {/* 약관 동의 */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                약관 동의
              </h2>
              <div className="space-y-3">
                <label className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={paymentInfo.agreeTerms}
                    onChange={(e) =>
                      handleInputChange("agreeTerms", e.target.checked)
                    }
                    className="mt-1"
                  />
                  <span className="text-sm text-gray-700">
                    <span className="text-red-500">*</span> 호텔 이용약관에
                    동의합니다.
                  </span>
                </label>
                {errors.agreeTerms && (
                  <p className="text-red-500 text-sm">{errors.agreeTerms}</p>
                )}

                <label className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={paymentInfo.agreePrivacy}
                    onChange={(e) =>
                      handleInputChange("agreePrivacy", e.target.checked)
                    }
                    className="mt-1"
                  />
                  <span className="text-sm text-gray-700">
                    <span className="text-red-500">*</span> 개인정보처리방침에
                    동의합니다.
                  </span>
                </label>
                {errors.agreePrivacy && (
                  <p className="text-red-500 text-sm">{errors.agreePrivacy}</p>
                )}
              </div>
            </div>

            {/* 토스페이먼츠 결제 위젯 */}
            {isFormValid && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  결제 정보
                </h2>
                <TossPaymentsWidget
                  clientKey={process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY}
                  customerKey={paymentKeys.customerKey}
                  amount={paymentDraft.finalAmount}
                  orderId={paymentKeys.orderId}
                  orderName={paymentDraft.orderName}
                  customerName={paymentInfo.customerName}
                  customerEmail={paymentInfo.customerEmail}
                  customerMobilePhone={paymentInfo.customerPhone}
                  onSuccess={handlePaymentSuccess}
                  onFail={handlePaymentFail}
                />
              </div>
            )}
          </div>

          {/* 가격 요약 */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                가격 요약
              </h2>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">객실 가격</span>
                  <span>
                    ₩{paymentDraft.meta.roomPrice.toLocaleString()}/박
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">숙박 일수</span>
                  <span>{paymentDraft.meta.nights}박</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">세금 및 수수료</span>
                  <span>포함</span>
                </div>
                <hr className="my-3" />
                <div className="flex justify-between text-lg font-semibold">
                  <span>총 결제 금액</span>
                  <span className="text-blue-600">
                    ₩{paymentDraft.finalAmount.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* 결제 유효시간 */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-yellow-600">⏰</span>
                  <span className="text-sm font-medium text-yellow-800">
                    결제 유효시간
                  </span>
                </div>
                <div className="text-lg font-bold text-yellow-900">
                  {minutes}:{seconds.toString().padStart(2, "0")}
                </div>
                <p className="text-xs text-yellow-700 mt-1">
                  시간이 지나면 예약이 자동으로 취소됩니다.
                </p>
              </div>

              {/* 결제 버튼 */}
              <button
                onClick={async () => {
                  if (isFormValid) {
                    // 토스페이먼츠 결제 핸들러 직접 호출
                    if (window.tossPaymentHandler) {
                      try {
                        await window.tossPaymentHandler();
                      } catch (error) {
                        console.error("결제 요청 실패:", error);
                        alert("결제 요청 중 오류가 발생했습니다.");
                      }
                    } else {
                      alert(
                        "토스페이먼츠가 아직 로드되지 않았습니다. 잠시 후 다시 시도해주세요."
                      );
                    }
                  } else {
                    // 폼 유효성 검사 실행
                    validateForm();
                    alert("모든 필수 정보를 입력하고 약관에 동의해주세요.");
                  }
                }}
                disabled={isLoading || remaining <= 0}
                className={`w-full py-3 px-4 rounded-lg font-medium transition-colors mb-4 ${
                  isFormValid && remaining > 0 && !isLoading
                    ? "bg-blue-500 hover:bg-blue-600 text-white"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
              >
                {isLoading
                  ? "결제 처리 중..."
                  : remaining <= 0
                  ? "결제 시간 만료"
                  : `₩${paymentDraft.finalAmount.toLocaleString()} 결제하기`}
              </button>

              <div className="text-xs text-gray-500 text-center">
                결제 완료 후 호텔 예약이 자동으로 확정됩니다.
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default HotelReservationPage;
