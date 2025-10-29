"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { loadTossPayments } from "@tosspayments/payment-sdk";
import Image from "next/image";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const KRW = (v) => new Intl.NumberFormat("ko-KR").format(v || 0);

const DiningReservationPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");

  // URL 파라미터로부터 다이닝 정보 가져오기 (useMemo로 최적화)
  const diningInfo = useMemo(() => ({
    diningIdx: searchParams.get("diningIdx"),
    contentId: searchParams.get("contentId"),
    diningName: searchParams.get("diningName"),
    hotelName: searchParams.get("hotelName"),
    hotelAddress: searchParams.get("hotelAddress"),
    diningDate: searchParams.get("diningDate"),
    diningTime: searchParams.get("diningTime"),
    guests: parseInt(searchParams.get("guests") || "2"),
    basePrice: parseInt(searchParams.get("basePrice") || "0"),
    imageUrl: searchParams.get("imageUrl"),
    openTime: searchParams.get("openTime") || "11:00:00",
    closeTime: searchParams.get("closeTime") || "21:00:00",
    slotDuration: parseInt(searchParams.get("slotDuration") || "60"),
  }), [searchParams]);

  // 예약자 정보 상태
  const [reservationInfo, setReservationInfo] = useState({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    specialRequest: "",
    agreeTerms: false,
    agreePrivacy: false,
    useCash: 0,
    usePoint: 0,
  });

  const [selectedTime, setSelectedTime] = useState(diningInfo.diningTime || "");
  const [errors, setErrors] = useState({});

  // 사용자 정보 가져오기
  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const response = await fetch("/api/customer/me", {
          credentials: "include",
        });

        if (response.ok) {
          const userData = await response.json();
          setCustomer(userData);
          setReservationInfo((prev) => ({
            ...prev,
            customerName: userData.name || "", // 구매 시에는 실명 사용
            customerEmail: userData.email || "",
            customerPhone: userData.phone || "",
          }));
        } else {
          console.log("로그인이 필요합니다");
        }
      } catch (error) {
        console.error("사용자 정보 가져오기 실패:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserInfo();
  }, []);

  // 필수 정보 확인
  useEffect(() => {
    if (!diningInfo.diningIdx || !diningInfo.diningDate) {
      alert("다이닝 정보가 올바르지 않습니다.");
      router.push("/");
    }
  }, [diningInfo, router]);

  // 예약 가능한 시간대 생성 (다이닝의 영업시간 기반)
  const availableTimeSlots = useMemo(() => {
    const slots = [];
    
    // 시간 문자열을 분으로 변환하는 함수
    const timeToMinutes = (timeStr) => {
      const [hours, minutes] = timeStr.split(':').map(Number);
      return hours * 60 + minutes;
    };
    
    // 분을 시간 문자열로 변환하는 함수
    const minutesToTime = (minutes) => {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
    };
    
    const startMinutes = timeToMinutes(diningInfo.openTime);
    const endMinutes = timeToMinutes(diningInfo.closeTime);
    const slotDuration = diningInfo.slotDuration;
    
    // 영업시간 내에서 슬롯 단위로 시간대 생성
    for (let minutes = startMinutes; minutes < endMinutes; minutes += slotDuration) {
      slots.push(minutesToTime(minutes));
    }
    
    return slots;
  }, [diningInfo.openTime, diningInfo.closeTime, diningInfo.slotDuration]);

  // 총 금액 계산
  const totalAmount = diningInfo.basePrice * diningInfo.guests;
  const cashDiscount = Math.min(reservationInfo.useCash, totalAmount);
  const pointDiscount = Math.min(reservationInfo.usePoint, totalAmount - cashDiscount);
  const finalAmount = totalAmount - cashDiscount - pointDiscount;

  // 입력 변경 핸들러
  const handleInputChange = (field, value) => {
    setReservationInfo((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  // 유효성 검사
  const validateForm = () => {
    const newErrors = {};

    if (!reservationInfo.customerName.trim()) {
      newErrors.customerName = "예약자 이름을 입력해주세요.";
    }
    if (!reservationInfo.customerEmail.trim()) {
      newErrors.customerEmail = "이메일을 입력해주세요.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(reservationInfo.customerEmail)) {
      newErrors.customerEmail = "올바른 이메일 형식이 아닙니다.";
    }
    if (!reservationInfo.customerPhone.trim()) {
      newErrors.customerPhone = "전화번호를 입력해주세요.";
    } else if (!/^\d{10,11}$/.test(reservationInfo.customerPhone.replace(/-/g, ""))) {
      newErrors.customerPhone = "올바른 전화번호 형식이 아닙니다.";
    }
    if (!selectedTime) {
      newErrors.selectedTime = "예약 시간을 선택해주세요.";
    }
    if (!reservationInfo.agreeTerms) {
      newErrors.agreeTerms = "이용약관에 동의해주세요.";
    }
    if (!reservationInfo.agreePrivacy) {
      newErrors.agreePrivacy = "개인정보 처리방침에 동의해주세요.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 결제하기 핸들러
  const handlePayment = async () => {
    if (!validateForm()) {
      alert("입력 정보를 확인해주세요.");
      return;
    }

    if (!customer) {
      alert("로그인이 필요합니다.");
      router.push("/login");
      return;
    }

    if (finalAmount <= 0) {
      alert("결제 금액이 올바르지 않습니다.");
      return;
    }

    setIsProcessing(true);
    setError("");

    try {
      const clientKey = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY;
      if (!clientKey) {
        throw new Error("Toss client key가 설정되지 않았습니다.");
      }

      const orderId = `DINING_${Date.now()}_${customer.customerIdx}`;
      const orderName = `${diningInfo.diningName} - ${diningInfo.guests}명`;

      const tossPayments = await loadTossPayments(clientKey);

      await tossPayments.requestPayment("카드", {
        amount: finalAmount,
        orderId: orderId,
        orderName: orderName,
        customerName: reservationInfo.customerName,
        customerEmail: reservationInfo.customerEmail,
        customerMobilePhone: reservationInfo.customerPhone.replace(/-/g, ""),
        successUrl: `${window.location.origin}/checkout/success?type=dining_reservation&diningIdx=${diningInfo.diningIdx}&diningDate=${diningInfo.diningDate}&diningTime=${selectedTime}&guests=${diningInfo.guests}`,
        failUrl: `${window.location.origin}/checkout/fail?type=dining_reservation`,
      });
    } catch (e) {
      console.error("결제 오류:", e);
      setError(e?.message || "결제 요청 중 오류가 발생했습니다.");
      setIsProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">다이닝 예약</h1>

        <div className="grid md:grid-cols-3 gap-8">
          {/* 좌측: 예약 정보 입력 */}
          <div className="md:col-span-2 space-y-6">
            {/* 다이닝 정보 */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                다이닝 정보
              </h2>
              <div className="space-y-3">
                <div className="flex items-start">
                  {diningInfo.imageUrl && (
                    <div className="relative w-24 h-24 mr-4 flex-shrink-0">
                      <Image
                        src={diningInfo.imageUrl}
                        alt={diningInfo.diningName}
                        fill
                        className="object-cover rounded-lg"
                        sizes="96px"
                      />
                    </div>
                  )}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {diningInfo.diningName}
                    </h3>
                    <p className="text-sm text-gray-600">{diningInfo.hotelName}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      {diningInfo.hotelAddress}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                  <div>
                    <p className="text-sm text-gray-600">예약 일자</p>
                    <p className="font-medium">{diningInfo.diningDate}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">인원</p>
                    <p className="font-medium">{diningInfo.guests}명</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm text-gray-600 mb-2">예약 시간 선택 *</p>
                    <select
                      value={selectedTime}
                      onChange={(e) => {
                        setSelectedTime(e.target.value);
                        setErrors((prev) => ({ ...prev, selectedTime: "" }));
                      }}
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                        errors.selectedTime
                          ? "border-red-500 focus:ring-red-500"
                          : "border-gray-300 focus:ring-blue-500"
                      }`}
                    >
                      <option value="">시간을 선택해주세요</option>
                      {availableTimeSlots.map((time) => (
                        <option key={time} value={time}>
                          {time}
                        </option>
                      ))}
                    </select>
                    {errors.selectedTime && (
                      <p className="text-sm text-red-600 mt-1">{errors.selectedTime}</p>
                    )}
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm text-gray-600">1인 가격</p>
                    <p className="font-medium">₩{KRW(diningInfo.basePrice)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* 예약자 정보 */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                예약자 정보
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    이름 *
                  </label>
                  <input
                    type="text"
                    value={reservationInfo.customerName}
                    onChange={(e) => handleInputChange("customerName", e.target.value)}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                      errors.customerName
                        ? "border-red-500 focus:ring-red-500"
                        : "border-gray-300 focus:ring-blue-500"
                    }`}
                    placeholder="예약자 이름"
                  />
                  {errors.customerName && (
                    <p className="text-sm text-red-600 mt-1">{errors.customerName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    이메일 *
                  </label>
                  <input
                    type="email"
                    value={reservationInfo.customerEmail}
                    onChange={(e) => handleInputChange("customerEmail", e.target.value)}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                      errors.customerEmail
                        ? "border-red-500 focus:ring-red-500"
                        : "border-gray-300 focus:ring-blue-500"
                    }`}
                    placeholder="example@email.com"
                  />
                  {errors.customerEmail && (
                    <p className="text-sm text-red-600 mt-1">{errors.customerEmail}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    전화번호 *
                  </label>
                  <input
                    type="tel"
                    value={reservationInfo.customerPhone}
                    onChange={(e) => handleInputChange("customerPhone", e.target.value)}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                      errors.customerPhone
                        ? "border-red-500 focus:ring-red-500"
                        : "border-gray-300 focus:ring-blue-500"
                    }`}
                    placeholder="010-1234-5678"
                  />
                  {errors.customerPhone && (
                    <p className="text-sm text-red-600 mt-1">{errors.customerPhone}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    특별 요청사항
                  </label>
                  <textarea
                    value={reservationInfo.specialRequest}
                    onChange={(e) => handleInputChange("specialRequest", e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="특별한 요청사항이 있으시면 입력해주세요"
                  />
                </div>
              </div>
            </div>

            {/* 약관 동의 */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">약관 동의</h2>
              <div className="space-y-3">
                <div className="flex items-start">
                  <input
                    type="checkbox"
                    checked={reservationInfo.agreeTerms}
                    onChange={(e) => handleInputChange("agreeTerms", e.target.checked)}
                    className="mt-1 mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="text-sm text-gray-700">
                    이용약관에 동의합니다 (필수)
                    {errors.agreeTerms && (
                      <span className="text-red-600 ml-2">{errors.agreeTerms}</span>
                    )}
                  </label>
                </div>
                <div className="flex items-start">
                  <input
                    type="checkbox"
                    checked={reservationInfo.agreePrivacy}
                    onChange={(e) => handleInputChange("agreePrivacy", e.target.checked)}
                    className="mt-1 mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="text-sm text-gray-700">
                    개인정보 처리방침에 동의합니다 (필수)
                    {errors.agreePrivacy && (
                      <span className="text-red-600 ml-2">{errors.agreePrivacy}</span>
                    )}
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* 우측: 결제 요약 */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-4">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                결제 정보
              </h2>
              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">1인 가격</span>
                  <span className="font-medium">₩{KRW(diningInfo.basePrice)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">인원</span>
                  <span className="font-medium">{diningInfo.guests}명</span>
                </div>
                <div className="flex justify-between text-sm pt-3 border-t">
                  <span className="text-gray-600">소계</span>
                  <span className="font-medium">₩{KRW(totalAmount)}</span>
                </div>
                {cashDiscount > 0 && (
                  <div className="flex justify-between text-sm text-red-600">
                    <span>캐시 사용</span>
                    <span>-₩{KRW(cashDiscount)}</span>
                  </div>
                )}
                {pointDiscount > 0 && (
                  <div className="flex justify-between text-sm text-red-600">
                    <span>포인트 사용</span>
                    <span>-₩{KRW(pointDiscount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold pt-3 border-t">
                  <span>최종 결제금액</span>
                  <span className="text-blue-600">₩{KRW(finalAmount)}</span>
                </div>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}

              <button
                onClick={handlePayment}
                disabled={isProcessing}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-3 rounded-lg font-semibold transition-colors"
              >
                {isProcessing ? "결제 처리 중..." : "결제하기"}
              </button>

              <button
                onClick={() => router.back()}
                className="w-full mt-3 bg-gray-200 hover:bg-gray-300 text-gray-800 py-3 rounded-lg font-semibold transition-colors"
              >
                취소
              </button>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default DiningReservationPage;

