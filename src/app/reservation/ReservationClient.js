"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { usePaymentStore } from "@/stores/paymentStore";
import axios from "@/lib/axios";
import TossPaymentsWidget from "@/components/payment/TossPaymentsWidget";
import PaymentSummary from "@/components/payment/PaymentSummary";
import ReservationLockWrapper from "./ReservationLockWrapper";

const ReservationClient = () => {
  const router = useRouter();
  const { paymentDraft, loadFromStorage, clearPaymentDraft, getRemainingMs } =
    usePaymentStore();

  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);

  // 결제 정보 상태
  const [paymentInfo, setPaymentInfo] = useState({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    specialRequests: "",
    agreeTerms: false,
    agreePrivacy: false,
    customerIdx: null,
    customerCash: 0,
    customerPoint: 0,
    useCash: 0,
    usePoint: 0,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // 결제 정보 로드 + 로드 완료 플래그
  const [draftReady, setDraftReady] = useState(false);
  useEffect(() => {
    try {
      loadFromStorage();
    } finally {
      setDraftReady(true);
    }
  }, [loadFromStorage]);

  // 락 관리는 ReservationLockWrapper에서 처리

  // 결제 정보가 없으면 홈으로 리다이렉트 (로드 완료 후)
  useEffect(() => {
    if (draftReady && !paymentDraft) {
      router.push("/");
    }
  }, [draftReady, paymentDraft, router]);

  // httpOnly 쿠키에서 사용자 정보 가져오기
  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const response = await axios.get("/customer/me");

        if (response.status === 200) {
          const userData = response.data;
          setCustomer(userData);

          setPaymentInfo((prev) => ({
            ...prev,
            customerIdx: userData.customerIdx,
            customerName: userData.name || "",
            customerEmail: userData.email || "",
            customerPhone: userData.phone || "",
            customerCash: parseInt(userData.cash) || 0,
            customerPoint: parseInt(userData.point) || 0,
          }));
        } else if (response.status === 401) {
          console.log("인증이 필요합니다 (백엔드에서 처리)");
          return;
        }
      } catch (error) {
        console.error("사용자 정보 가져오기 실패:", error);
        return;
      } finally {
        setLoading(false);
      }
    };

    fetchUserInfo();
  }, [router]);

  // 고정된 키들 생성
  const paymentKeys = useMemo(
    () => ({
      customerKey: `customer_${paymentDraft?.meta?.hotelId || "default"}`,
      orderId: paymentDraft?.orderId || "",
    }),
    [paymentDraft]
  );

  // 결제 금액 계산
  const paymentAmounts = useMemo(() => {
    if (!paymentDraft)
      return {
        totalAmount: 0,
        useCash: 0,
        usePoint: 0,
        actualPaymentAmount: 0,
      };

    const totalAmount = paymentDraft.finalAmount;
    const maxCash = Math.min(paymentInfo.useCash, paymentInfo.customerCash);
    const maxPoint = Math.min(paymentInfo.usePoint, paymentInfo.customerPoint);
    const availableCashPoint = maxCash + maxPoint;
    const actualPaymentAmount = Math.max(0, totalAmount - availableCashPoint);

    return {
      totalAmount,
      useCash: maxCash,
      usePoint: maxPoint,
      actualPaymentAmount,
      availableCashPoint,
    };
  }, [
    paymentDraft,
    paymentInfo.useCash,
    paymentInfo.usePoint,
    paymentInfo.customerCash,
    paymentInfo.customerPoint,
  ]);

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

  // 조기 반환 대신, 본문 UI를 조건부로 구성해 훅 순서를 보장
  let gateContent = null;
  if (loading || isLoading) {
    gateContent = (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">
            {isLoading
              ? "결제를 처리하는 중입니다..."
              : "사용자 정보를 불러오는 중..."}
          </p>
          {isLoading && (
            <p className="text-sm text-gray-500 mt-2">잠시만 기다려주세요</p>
          )}
        </div>
      </div>
    );
  } else if (!customer) {
    gateContent = (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">로그인이 필요합니다.</p>
          <button
            onClick={() => router.push("/login")}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
          >
            로그인하기
          </button>
        </div>
      </div>
    );
  } else if (!paymentDraft) {
    gateContent = (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">결제 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

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

    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  // 캐시 사용량 변경 핸들러
  const handleCashChange = (value) => {
    const cashAmount = Math.max(
      0,
      Math.min(parseInt(value) || 0, paymentInfo.customerCash)
    );
    setPaymentInfo((prev) => ({
      ...prev,
      useCash: cashAmount,
    }));
  };

  // 포인트 사용량 변경 핸들러
  const handlePointChange = (value) => {
    const pointAmount = Math.max(
      0,
      Math.min(parseInt(value) || 0, paymentInfo.customerPoint)
    );
    setPaymentInfo((prev) => ({
      ...prev,
      usePoint: pointAmount,
    }));
  };

  // 전체 캐시 사용
  const useAllCash = () => {
    const totalAmount = paymentDraft?.finalAmount || 0;
    const maxCash = Math.min(paymentInfo.customerCash, totalAmount);
    setPaymentInfo((prev) => ({
      ...prev,
      useCash: maxCash,
    }));
  };

  // 전체 포인트 사용
  const useAllPoint = () => {
    const totalAmount = paymentDraft?.finalAmount || 0;
    const maxPoint = Math.min(paymentInfo.customerPoint, totalAmount);
    setPaymentInfo((prev) => ({
      ...prev,
      usePoint: maxPoint,
    }));
  };

  // 토스페이먼츠 결제 성공 처리
  const handlePaymentSuccess = async (paymentResult) => {
    try {
      setIsLoading(true);

      await axios.post("/payments", {
        paymentKey: paymentResult.paymentKey,
        orderId: paymentResult.orderId,
        amount: paymentAmounts.actualPaymentAmount,
        type: "hotel_reservation",
        hotelInfo: {
          contentId: paymentDraft.meta.contentId,
          hotelName: paymentDraft.meta.hotelName,
          roomId: paymentDraft.meta.roomIdx || paymentDraft.meta.roomId,
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
          customerIdx: paymentInfo.customerIdx,
          name: paymentInfo.customerName,
          email: paymentInfo.customerEmail,
          phone: paymentInfo.customerPhone,
          specialRequests: paymentInfo.specialRequests,
        },
        paymentInfo: {
          totalAmount: paymentAmounts.totalAmount,
          cashAmount: paymentAmounts.useCash,
          pointAmount: paymentAmounts.usePoint,
          cardAmount: paymentAmounts.actualPaymentAmount,
          paymentMethod:
            paymentAmounts.actualPaymentAmount > 0
              ? "mixed"
              : "cash_point_only",
        },
      });

      clearPaymentDraft();
      const params = new URLSearchParams({
        orderId: paymentResult.orderId,
        paymentKey: paymentResult.paymentKey,
        amount: paymentAmounts.actualPaymentAmount.toString(),
        type: "hotel_reservation",
      });
      router.push(`/checkout/success?${params.toString()}`);
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

  if (gateContent) return gateContent;

  return (
    <ReservationLockWrapper>
      {({ handleCancel }) => (
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
                <div className="flex gap-6">
                  {(() => {
                    const S3_BASE_URL =
                        "https://sist-checkin.s3.ap-northeast-2.amazonaws.com/hotelroom/";
                    const roomImageUrl = paymentDraft.meta.roomImage
                        ? `${S3_BASE_URL}${paymentDraft.meta.roomImage}`
                        : `${S3_BASE_URL}default.jpg`;

                    return (
                        <img
                            src={roomImageUrl}
                            alt={paymentDraft.meta.roomName || "호텔 이미지"}
                            className="w-40 h-36 object-cover rounded-lg"
                        />
                    );
                  })()}

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
                        errors.customerName
                          ? "border-red-500"
                          : "border-gray-300"
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
                    <p className="text-red-500 text-sm">
                      {errors.agreePrivacy}
                    </p>
                  )}
                </div>
              </div>

              {/* 토스페이먼츠 결제 위젯 */}
              {isFormValid && paymentAmounts.actualPaymentAmount > 0 && (
                <TossPaymentsWidget
                  key={paymentKeys.orderId}
                  clientKey={process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY}
                  customerKey={paymentKeys.customerKey}
                  amount={paymentAmounts.actualPaymentAmount}
                  orderId={paymentKeys.orderId}
                  orderName={paymentDraft.orderName}
                  customerName={paymentInfo.customerName}
                  customerEmail={paymentInfo.customerEmail}
                  customerMobilePhone={paymentInfo.customerPhone}
                  hotelInfo={{
                    contentId: paymentDraft.meta.contentId,
                    hotelName: paymentDraft.meta.hotelName,
                    roomId:
                      paymentDraft.meta.roomIdx || paymentDraft.meta.roomId,
                    roomIdx:
                      paymentDraft.meta.roomIdx || paymentDraft.meta.roomId,
                    roomName: paymentDraft.meta.roomName,
                    checkIn: paymentDraft.meta.checkIn,
                    checkOut: paymentDraft.meta.checkOut,
                    guests: paymentDraft.meta.guests,
                    nights: paymentDraft.meta.nights,
                    roomPrice: paymentDraft.meta.roomPrice,
                    totalPrice: paymentDraft.meta.totalPrice,
                    roomImage: paymentDraft.meta.roomImage,
                    amenities: paymentDraft.meta.amenities,
                  }}
                  customerInfo={{
                    customerIdx: paymentInfo.customerIdx,
                    name: paymentInfo.customerName,
                    email: paymentInfo.customerEmail,
                    phone: paymentInfo.customerPhone,
                    specialRequests: paymentInfo.specialRequests,
                    useCash: paymentAmounts.useCash,
                    usePoint: paymentAmounts.usePoint,
                    actualPaymentAmount: paymentAmounts.actualPaymentAmount,
                  }}
                  onSuccess={handlePaymentSuccess}
                  onFail={handlePaymentFail}
                />
              )}
            </div>

            {/* 가격 요약 */}
            <div className="lg:col-span-1">
              <PaymentSummary
                paymentDraft={paymentDraft}
                remaining={remaining}
                customerCash={paymentInfo.customerCash}
                customerPoint={paymentInfo.customerPoint}
                useCash={paymentInfo.useCash}
                usePoint={paymentInfo.usePoint}
                onCashChange={handleCashChange}
                onPointChange={handlePointChange}
                onUseAllCash={useAllCash}
                onUseAllPoint={useAllPoint}
                paymentAmounts={paymentAmounts}
                isFormValid={isFormValid}
                isLoading={isLoading}
                onPaymentClick={async () => {
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
                }}
                onValidateForm={validateForm}
                onCancel={handleCancel}
              />
            </div>
          </div>
        </div>
      )}
    </ReservationLockWrapper>
  );
};

export default ReservationClient;
