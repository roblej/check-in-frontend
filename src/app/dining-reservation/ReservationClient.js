"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import TossPaymentsWidget from "@/components/payment/TossPaymentsWidget";

const KRW = (v) => new Intl.NumberFormat("ko-KR").format(v || 0);

const ReservationClient = ({ diningInfo }) => {
  const router = useRouter();
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");

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

  // UI 선택값은 HH:MM 형태로 유지, 전송 시 HH:MM:SS로 변환
  const toSelectTime = (t) => {
    if (!t) return "";
    // 들어온 값이 HH:MM:SS면 HH:MM으로 변환
    if (typeof t === "string" && t.length === 8 && t.includes(":")) {
      return t.slice(0, 5);
    }
    return t;
  };
  const [selectedTime, setSelectedTime] = useState(toSelectTime(diningInfo.diningTime) || "");
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const response = await fetch("/api/customer/me", { credentials: "include" });
        if (response.ok) {
          const userData = await response.json();
          setCustomer(userData);
          setReservationInfo((prev) => ({
            ...prev,
            customerName: userData.name || "",
            customerEmail: userData.email || "",
            customerPhone: userData.phone || "",
          }));
        }
      } catch (error) {
        console.error("사용자 정보 가져오기 실패:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUserInfo();
  }, []);

  useEffect(() => {
    if (!diningInfo.diningIdx || !diningInfo.diningDate) {
      alert("다이닝 정보가 올바르지 않습니다.");
      router.push("/");
    }
  }, [diningInfo, router]);

  const availableTimeSlots = useMemo(() => {
    const slots = [];
    const timeToMinutes = (timeStr) => {
      const [hours, minutes] = timeStr.split(':').map(Number);
      return hours * 60 + minutes;
    };
    const minutesToTime = (minutes) => {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
    };
    const startMinutes = timeToMinutes(diningInfo.openTime);
    const endMinutes = timeToMinutes(diningInfo.closeTime);
    const slotDuration = diningInfo.slotDuration;
    for (let minutes = startMinutes; minutes < endMinutes; minutes += slotDuration) {
      slots.push(minutesToTime(minutes));
    }
    return slots;
  }, [diningInfo.openTime, diningInfo.closeTime, diningInfo.slotDuration]);

  const totalAmount = diningInfo.basePrice * diningInfo.guests;
  const cashDiscount = Math.min(reservationInfo.useCash, totalAmount);
  const pointDiscount = Math.min(reservationInfo.usePoint, totalAmount - cashDiscount);
  const finalAmount = totalAmount - cashDiscount - pointDiscount;

  const handleInputChange = (field, value) => {
    setReservationInfo((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!reservationInfo.customerName.trim()) newErrors.customerName = "예약자 이름을 입력해주세요.";
    if (!reservationInfo.customerEmail.trim()) newErrors.customerEmail = "이메일을 입력해주세요.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(reservationInfo.customerEmail)) newErrors.customerEmail = "올바른 이메일 형식이 아닙니다.";
    if (!reservationInfo.customerPhone.trim()) newErrors.customerPhone = "전화번호를 입력해주세요.";
    else if (!/^\d{10,11}$/.test(reservationInfo.customerPhone.replace(/-/g, ""))) newErrors.customerPhone = "올바른 전화번호 형식이 아닙니다.";
    if (!selectedTime) newErrors.selectedTime = "예약 시간을 선택해주세요.";
    if (!reservationInfo.agreeTerms) newErrors.agreeTerms = "이용약관에 동의해주세요.";
    if (!reservationInfo.agreePrivacy) newErrors.agreePrivacy = "개인정보 처리방침에 동의해주세요.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePayment = async () => {
    if (!validateForm()) { alert("입력 정보를 확인해주세요."); return; }
    if (!customer) { alert("로그인이 필요합니다."); router.push("/login"); return; }
    if (finalAmount <= 0) { alert("결제 금액이 올바르지 않습니다."); return; }
    setIsProcessing(true);
    setError("");
    try {
      if (typeof window !== "undefined" && window.tossPaymentHandler) {
        await window.tossPaymentHandler();
      } else {
        throw new Error("결제 위젯이 아직 준비되지 않았습니다. 잠시 후 다시 시도해주세요.");
      }
    } catch (e) {
      console.error("결제 오류:", e);
      setError(e?.message || "결제 요청 중 오류가 발생했습니다.");
      setIsProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-3 gap-8">
      <div className="md:col-span-2 space-y-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">다이닝 정보</h2>
          <div className="space-y-3">
            <div className="flex items-start">
              {diningInfo.imageUrl && (
                <div className="relative w-24 h-24 mr-4 flex-shrink-0">
                  <Image src={diningInfo.imageUrl} alt={diningInfo.diningName} fill className="object-cover rounded-lg" sizes="96px" />
                </div>
              )}
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{diningInfo.diningName}</h3>
                <p className="text-sm text-gray-600">{diningInfo.hotelName}</p>
                <p className="text-sm text-gray-500 mt-1">{diningInfo.hotelAddress}</p>
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
                  onChange={(e) => { setSelectedTime(e.target.value); setErrors((prev) => ({ ...prev, selectedTime: "" })); }}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.selectedTime ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-blue-500"}`}
                >
                  <option value="">시간을 선택해주세요</option>
                  {availableTimeSlots.map((time) => (<option key={time} value={time}>{time}</option>))}
                </select>
                {errors.selectedTime && (<p className="text-sm text-red-600 mt-1">{errors.selectedTime}</p>)}
              </div>
              <div className="col-span-2">
                <p className="text-sm text-gray-600">1인 가격</p>
                <p className="font-medium">₩{KRW(diningInfo.basePrice)}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">예약자 정보</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">이름 *</label>
              <input type="text" value={reservationInfo.customerName} onChange={(e) => handleInputChange("customerName", e.target.value)}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.customerName ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-blue-500"}`} placeholder="예약자 이름" />
              {errors.customerName && (<p className="text-sm text-red-600 mt-1">{errors.customerName}</p>)}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">이메일 *</label>
              <input type="email" value={reservationInfo.customerEmail} onChange={(e) => handleInputChange("customerEmail", e.target.value)}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.customerEmail ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-blue-500"}`} placeholder="example@email.com" />
              {errors.customerEmail && (<p className="text-sm text-red-600 mt-1">{errors.customerEmail}</p>)}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">전화번호 *</label>
              <input type="tel" value={reservationInfo.customerPhone} onChange={(e) => handleInputChange("customerPhone", e.target.value)}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.customerPhone ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-blue-500"}`} placeholder="010-1234-5678" />
              {errors.customerPhone && (<p className="text-sm text-red-600 mt-1">{errors.customerPhone}</p>)}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">특별 요청사항</label>
              <textarea value={reservationInfo.specialRequest} onChange={(e) => handleInputChange("specialRequest", e.target.value)} rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="특별한 요청사항이 있으시면 입력해주세요" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">약관 동의</h2>
          <div className="space-y-3">
            <div className="flex items-start">
              <input type="checkbox" checked={reservationInfo.agreeTerms} onChange={(e) => handleInputChange("agreeTerms", e.target.checked)} className="mt-1 mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
              <label className="text-sm text-gray-700">이용약관에 동의합니다 (필수){errors.agreeTerms && (<span className="text-red-600 ml-2">{errors.agreeTerms}</span>)}</label>
            </div>
            <div className="flex items-start">
              <input type="checkbox" checked={reservationInfo.agreePrivacy} onChange={(e) => handleInputChange("agreePrivacy", e.target.checked)} className="mt-1 mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
              <label className="text-sm text-gray-700">개인정보 처리방침에 동의합니다 (필수){errors.agreePrivacy && (<span className="text-red-600 ml-2">{errors.agreePrivacy}</span>)}</label>
            </div>
          </div>
        </div>
      </div>

      <div className="md:col-span-1">
        <div className="bg-white rounded-lg shadow-sm p-6 sticky top-4">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">결제 정보</h2>
          <div className="space-y-3 mb-4">
            <div className="flex justify-between text-sm"><span className="text-gray-600">1인 가격</span><span className="font-medium">₩{KRW(diningInfo.basePrice)}</span></div>
            <div className="flex justify-between text-sm"><span className="text-gray-600">인원</span><span className="font-medium">{diningInfo.guests}명</span></div>
            <div className="flex justify-between text-sm pt-3 border-t"><span className="text-gray-600">소계</span><span className="font-medium">₩{KRW(totalAmount)}</span></div>
            {cashDiscount > 0 && (<div className="flex justify-between text-sm text-red-600"><span>캐시 사용</span><span>-₩{KRW(cashDiscount)}</span></div>)}
            {pointDiscount > 0 && (<div className="flex justify-between text-sm text-red-600"><span>포인트 사용</span><span>-₩{KRW(pointDiscount)}</span></div>)}
            <div className="flex justify-between text-lg font-bold pt-3 border-t"><span>최종 결제금액</span><span className="text-blue-600">₩{KRW(finalAmount)}</span></div>
          </div>
          {error && (<div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg"><p className="text-sm text-red-800">{error}</p></div>)}

          {/* TossPayments 위젯 렌더링 (버튼 위에 배치) */}
          <div className="mb-4">
            {/** 전송용 시간값: HH:MM -> HH:MM:SS 로 변환 */}
            {(() => {
              /* 내부 즉시 실행으로 계산해 prop에 주입 */
              const timeForSubmit = selectedTime ? `${selectedTime.length === 5 ? selectedTime + ":00" : selectedTime}` : "";
              const successQuery = `type=dining_reservation&diningIdx=${diningInfo.diningIdx}&diningDate=${diningInfo.diningDate}&diningTime=${timeForSubmit}&guests=${diningInfo.guests}`;
              return (
                <TossPaymentsWidget
                  clientKey={process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY}
                  amount={finalAmount}
                  orderId={`DINING_${Date.now()}_${customer?.customerIdx || 0}`}
                  orderName={`${diningInfo.diningName} - ${diningInfo.guests}명`}
                  customerName={reservationInfo.customerName}
                  customerEmail={reservationInfo.customerEmail}
                  customerMobilePhone={reservationInfo.customerPhone.replace(/-/g, "")}
                  paymentMethod="카드"
                  paymentType="dining_reservation"
                  diningInfo={{
                    diningIdx: diningInfo.diningIdx,
                    diningDate: diningInfo.diningDate,
                    diningTime: timeForSubmit,
                    guests: diningInfo.guests,
                    totalPrice: finalAmount,
                    specialRequests: reservationInfo.specialRequest,
                  }}
                  successUrl={`/checkout/success?${successQuery}`}
                  failUrl={`/checkout/fail?type=dining_reservation`}
                  onFail={(e) => {
                    console.error(e);
                    setError(e?.message || "결제 실패");
                    setIsProcessing(false);
                  }}
                  onSuccess={() => {
                    setIsProcessing(false);
                  }}
                />
              );
            })()}
          </div>
          <button onClick={handlePayment} disabled={isProcessing} className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-3 rounded-lg font-semibold transition-colors">{isProcessing ? "결제 처리 중..." : "결제하기"}</button>
          <button onClick={() => router.back()} className="w-full mt-3 bg-gray-200 hover:bg-gray-300 text-gray-800 py-3 rounded-lg font-semibold transition-colors">취소</button>
        </div>
      </div>
    </div>
  );
};

export default ReservationClient;


