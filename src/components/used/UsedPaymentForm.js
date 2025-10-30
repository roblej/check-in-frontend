"use client";

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import TossPaymentsWidget from '@/components/payment/TossPaymentsWidget';
import { usePaymentStore } from '@/stores/paymentStore';

const UsedPaymentForm = ({ initialData }) => {
  const router = useRouter();
  const { loadFromStorage, clearPaymentDraft } = usePaymentStore();
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // httpOnly 쿠키에서 사용자 정보 가져오기
  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const response = await fetch('/api/customer/me', {
          credentials: 'include' // httpOnly 쿠키 포함
        });
        
        if (response.ok) {
          const userData = await response.json();
          setCustomer(userData);
        } else if (response.status === 401) {
          console.log('인증이 필요합니다');
          router.push('/login');
          return;
        }
      } catch (error) {
        console.error('사용자 정보 가져오기 실패:', error);
        router.push('/login');
        return;
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserInfo();
  }, [router]);

  // 결제 정보 상태
  const [paymentInfo, setPaymentInfo] = useState({
    ...initialData,
    usedTradeIdx: initialData.usedTradeIdx, // 거래 ID 추가
    customerIdx: null,
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    customerCash: 0,
    customerPoint: 0,
    // 결제 방식 관련 필드 추가
    useCash: 0, // 사용할 캐시 금액
    usePoint: 0, // 사용할 포인트 금액
    paymentMethod: "card", // 결제 방식: 'card', 'cash', 'point', 'mixed'
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // 사용자 정보가 로드되면 paymentInfo 업데이트
  useEffect(() => {
    if (customer) {
      setPaymentInfo(prev => ({
        ...prev,
        customerIdx: customer.customerIdx,
        customerName: customer.name || "", // 구매 시에는 실명 사용
        customerEmail: customer.email,
        customerPhone: customer.phone,
        customerCash: parseInt(customer.cash) || 0,
        customerPoint: parseInt(customer.point) || 0,
      }));
    }
  }, [customer]);

  // 고정된 키들 생성 (useMemo로 최적화)
  const paymentKeys = useMemo(
    () => ({
      customerKey: `customer_${paymentInfo.usedItemIdx || "default"}`,
      orderId: `used_hotel_${
        paymentInfo.usedItemIdx || Date.now()
      }_${Math.random().toString(36).substr(2, 9)}`,
    }),
    [paymentInfo.usedItemIdx]
  );

  // 결제 금액 계산 (useMemo로 최적화)
  const paymentAmounts = useMemo(() => {
    const totalAmount =
      paymentInfo.salePrice + Math.round(paymentInfo.salePrice * 0.1); // 세금 포함
    const maxCash = Math.min(paymentInfo.useCash, paymentInfo.customerCash);
    const maxPoint = Math.min(paymentInfo.usePoint, paymentInfo.customerPoint);

    // 사용 가능한 캐시와 포인트 합계
    const availableCashPoint = maxCash + maxPoint;

    // 실제 결제 금액 (총 금액 - 캐시 - 포인트)
    const actualPaymentAmount = Math.max(0, totalAmount - availableCashPoint);

    return {
      totalAmount,
      useCash: maxCash,
      usePoint: maxPoint,
      actualPaymentAmount,
      availableCashPoint,
    };
  }, [
    paymentInfo.salePrice,
    paymentInfo.useCash,
    paymentInfo.usePoint,
    paymentInfo.customerCash,
    paymentInfo.customerPoint,
  ]);

  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]); // loadFromStorage 의존성 추가

  // customer 정보가 변경될 때 paymentInfo 업데이트
  useEffect(() => {
    if (customer) {
      setPaymentInfo(prev => ({
        ...prev,
        customerIdx: customer.customerIdx,
        customerName: customer.nickname,
        customerEmail: customer.email,
        customerPhone: customer.phone,
        customerCash: parseInt(customer.cash) || 0,
        customerPoint: parseInt(customer.point) || 0,
      }));
    }
  }, [customer]);

  // 페이지 이탈 시 거래 삭제 (최적화된 버전)
  useEffect(() => {
    let isDeleting = false; // 삭제 중 플래그
    let deleteTimeout = null; // 디바운싱 타이머

    const deleteTradeOnExit = (reason) => {
      if (paymentInfo.usedTradeIdx && !isDeleting) {
        isDeleting = true; // 삭제 시작 플래그 설정
        
        console.log(`${reason} 감지 - 거래 삭제 시작:`, paymentInfo.usedTradeIdx);
        
        fetch(`/api/used/trade/${paymentInfo.usedTradeIdx}/delete`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            reason: reason,
            timestamp: new Date().toISOString()
          })
        }).then(() => {
          console.log('거래 삭제 완료:', paymentInfo.usedTradeIdx);
        }).catch(error => {
          console.error('거래 삭제 실패:', error);
          isDeleting = false; // 실패 시 플래그 리셋
        });
      }
    };

    const debouncedDeleteTrade = (reason) => {
      if (deleteTimeout) {
        clearTimeout(deleteTimeout);
      }
      
      deleteTimeout = setTimeout(() => {
        deleteTradeOnExit(reason);
      }, 100); // 100ms 디바운싱
    };

    const handleBeforeUnload = (event) => {
      if (paymentInfo.usedTradeIdx && !isDeleting) {
        console.log('페이지 이탈 감지 - 거래 삭제 시작:', paymentInfo.usedTradeIdx);
        
        // navigator.sendBeacon으로 안전한 비동기 요청
        const deleteData = JSON.stringify({ 
          reason: '사용자 페이지 이탈',
          timestamp: new Date().toISOString()
        });
        
        navigator.sendBeacon(`/api/used/trade/${paymentInfo.usedTradeIdx}/delete`, deleteData);
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden && paymentInfo.usedTradeIdx) {
        debouncedDeleteTrade('사용자 페이지 숨김');
      }
    };

    // 뒤로가기 버튼 감지
    const handlePopState = () => {
      debouncedDeleteTrade('사용자 뒤로가기');
    };

    // 링크 클릭 감지 (App Router용)
    const handleLinkClick = (event) => {
      const target = event.target.closest('a');
      if (target && target.href && !target.href.startsWith('javascript:')) {
        // 외부 링크가 아닌 경우에만 거래 삭제
        if (target.href.startsWith(window.location.origin)) {
          debouncedDeleteTrade('사용자 링크 클릭');
        }
      }
    };

    // 브라우저 이벤트 리스너
    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('popstate', handlePopState);
    document.addEventListener('click', handleLinkClick);

    return () => {
      // 타이머 정리
      if (deleteTimeout) {
        clearTimeout(deleteTimeout);
      }
      
      // 브라우저 이벤트 리스너 제거
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('popstate', handlePopState);
      document.removeEventListener('click', handleLinkClick);
    };
  }, [paymentInfo.usedTradeIdx]);

  // 폼 유효성 검사 (useMemo로 최적화)
  const isFormValid = useMemo(() => {
    if (!paymentInfo.customerName) return false;
    if (!paymentInfo.customerEmail) return false;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(paymentInfo.customerEmail)) return false;
    if (!paymentInfo.customerPhone) return false;
    if (!/^[0-9-+\s]+$/.test(paymentInfo.customerPhone)) return false;
    return true;
  }, [
    paymentInfo.customerName,
    paymentInfo.customerEmail,
    paymentInfo.customerPhone,
  ]);

  // 폼 유효성 검사 (에러 메시지 포함)
  const validateForm = () => {
    const newErrors = {};

    if (!paymentInfo.customerName) {
      newErrors.customerName = '구매자 이름을 입력해주세요.';
    }

    if (!paymentInfo.customerEmail) {
      newErrors.customerEmail = '이메일을 입력해주세요.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(paymentInfo.customerEmail)) {
      newErrors.customerEmail = "올바른 이메일 형식을 입력해주세요.";
    }

    if (!paymentInfo.customerPhone) {
      newErrors.customerPhone = '전화번호를 입력해주세요.';
    } else if (!/^[0-9-+\s]+$/.test(paymentInfo.customerPhone)) {
      newErrors.customerPhone = "올바른 전화번호 형식을 입력해주세요.";
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
    const totalAmount =
      paymentInfo.salePrice + Math.round(paymentInfo.salePrice * 0.1);
    const maxCash = Math.min(paymentInfo.customerCash, totalAmount);
    setPaymentInfo((prev) => ({
      ...prev,
      useCash: maxCash,
    }));
  };

  // 전체 포인트 사용
  const useAllPoint = () => {
    const totalAmount =
      paymentInfo.salePrice + Math.round(paymentInfo.salePrice * 0.1);
    const maxPoint = Math.min(paymentInfo.customerPoint, totalAmount);
    setPaymentInfo((prev) => ({
      ...prev,
      usePoint: maxPoint,
    }));
  };

  // 토스페이먼츠 결제 성공 처리
  const handlePaymentSuccess = async (paymentResult) => {
    try {
        // 1. 거래 확정 (중요: 결제 완료 후 거래 확정)
        if (paymentInfo.usedTradeIdx) {
          const tradeConfirmResponse = await fetch(
            `/api/used/trade/${paymentInfo.usedTradeIdx}/confirm`,
            {
              method: "POST",
            }
          );

        if (!tradeConfirmResponse.ok) {
          const errorData = await tradeConfirmResponse.json();
          console.error("거래 확정 실패:", errorData.message);
          alert("거래 확정에 실패했습니다. 고객센터에 문의해주세요.");
          return;
        }
      }

      // 2. 백엔드에 결제 내역 저장
      const paymentData = {
        usedTradeIdx: paymentInfo.usedTradeIdx,
        paymentKey: paymentResult.paymentKey,
        orderId: paymentResult.orderId,
        totalAmount: paymentAmounts.totalAmount,
        cashAmount: paymentAmounts.useCash,
        pointAmount: paymentAmounts.usePoint,
        cardAmount: paymentAmounts.actualPaymentAmount,
        paymentMethod: paymentAmounts.actualPaymentAmount > 0 ? "mixed" : "cash_point_only",
        status: 1, // 결제 완료
        receiptUrl: `https://toss.im/payments/receipt/${paymentResult.orderId}`,
        qrUrl: `https://chart.googleapis.com/chart?chs=240x240&cht=qr&chl=${encodeURIComponent(JSON.stringify({ orderId: paymentResult.orderId, paymentKey: paymentResult.paymentKey, amount: paymentAmounts.totalAmount, usedTradeIdx: paymentInfo.usedTradeIdx }))}`,
        approvedAt: new Date().toISOString(),
      };

      const backendResponse = await fetch('/api/used/payment', {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(paymentData),
      });

      if (!backendResponse.ok) {
        const errorData = await backendResponse.json();
        console.error("결제 내역 저장 실패:", errorData.message);
        alert("결제 내역 저장에 실패했습니다. 고객센터에 문의해주세요.");
        return;
      }

      const savedPayment = await backendResponse.json();
      console.log("결제 내역 저장 성공:", savedPayment);

      // 3. 성공 페이지로 리다이렉트
      clearPaymentDraft();
      const successParams = new URLSearchParams({
        orderId: paymentResult.orderId,
        amount: paymentAmounts.totalAmount,
        type: "used_hotel",
        cash: paymentAmounts.useCash,
        point: paymentAmounts.usePoint,
        card: paymentAmounts.actualPaymentAmount,
        tradeIdx: paymentInfo.usedTradeIdx,
        hotelName: paymentInfo.hotelName,
        roomType: paymentInfo.roomType,
        checkIn: paymentInfo.checkIn,
        checkOut: paymentInfo.checkOut,
      });

      router.push(`/used-payment/success?${successParams.toString()}`);
    } catch (error) {
      console.error("결제 완료 처리 오류:", error);
      alert(
        "결제는 완료되었지만 처리 중 오류가 발생했습니다. 고객센터에 문의해주세요."
      );
    }
  };

  // 토스페이먼츠 결제 실패 처리
  const handlePaymentFail = (error) => {
    console.error('결제 실패:', error);
    
    // 결제 실패 정보를 localStorage에 저장 (재시도를 위해)
    localStorage.setItem('failedPaymentInfo', JSON.stringify({
      usedTradeIdx: paymentInfo.usedTradeIdx,
      usedItemIdx: paymentInfo.usedItemIdx,
      usedPaymentData: paymentInfo,
      timestamp: Date.now()
    }));
    
    // 결제 실패 시 거래 삭제하지 않고 유지 (다시 시도를 위해)
    // 거래는 결제 페이지를 완전히 벗어날 때만 삭제됨
    
    router.push(`/checkout/fail?error=${encodeURIComponent(error.message || '결제가 취소되었습니다.')}&usedTradeIdx=${paymentInfo.usedTradeIdx}`);
  };

  // 로딩 중이면 로딩 화면 표시
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">사용자 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  // 사용자 정보가 없으면 로그인 페이지로 리다이렉트
  if (!customer) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">로그인이 필요합니다.</p>
          <button 
            onClick={() => router.push('/login')}
            className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600"
          >
            로그인하기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            중고 호텔 결제
          </h1>
          <p className="text-gray-600">
            중고 호텔 예약 정보를 확인하고 결제를 진행해주세요.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 호텔 정보 및 구매자 정보 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 중고 호텔 정보 */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                중고 호텔 정보
              </h2>
              <div className="flex gap-4">
                {paymentInfo.hotelImage ? (
                  <img
                    src={paymentInfo.hotelImage}
                    alt={paymentInfo.hotelName}
                    className="w-32 h-24 object-cover rounded-lg"
                  />
                ) : (
                  <div className="w-32 h-24 bg-gray-200 rounded-lg flex items-center justify-center">
                    <span className="text-gray-400 text-sm">이미지 없음</span>
                  </div>
                )}
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {paymentInfo.hotelName}
                  </h3>
                  <p className="text-gray-600 mb-2">
                    {paymentInfo.hotelAddress}
                  </p>
                  <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                    <div>
                      <span className="font-medium">객실 타입:</span>{" "}
                      {paymentInfo.roomType}
                    </div>
                    <div>
                      <span className="font-medium">게스트:</span>{" "}
                      {paymentInfo.guests}명
                    </div>
                    <div>
                      <span className="font-medium">체크인:</span>{" "}
                      {paymentInfo.checkIn}
                    </div>
                    <div>
                      <span className="font-medium">체크아웃:</span>{" "}
                      {paymentInfo.checkOut}
                    </div>
                    <div>
                      <span className="font-medium">숙박 일수:</span>{" "}
                      {paymentInfo.nights}박
                    </div>
                    <div>
                      <span className="font-medium">판매자:</span>{" "}
                      {paymentInfo.seller}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 구매자 정보 */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                구매자 정보
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    구매자 이름 *
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
                    placeholder="구매자 이름을 입력하세요"
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
                  amount={paymentAmounts.actualPaymentAmount}
                  orderId={paymentKeys.orderId}
                  orderName={`${paymentInfo.hotelName} - ${paymentInfo.roomType}`}
                  customerName={paymentInfo.customerName}
                  customerEmail={paymentInfo.customerEmail}
                  customerMobilePhone={paymentInfo.customerPhone}
                  paymentType="used_hotel"
                  successUrl="/used-payment/success"
                  failUrl="/used-payment/fail"
                  hotelInfo={{
                    usedItemIdx: paymentInfo.usedItemIdx,
                    usedTradeIdx: paymentInfo.usedTradeIdx,
                    hotelName: paymentInfo.hotelName,
                    roomType: paymentInfo.roomType,
                    checkIn: paymentInfo.checkIn,
                    checkOut: paymentInfo.checkOut,
                    guests: paymentInfo.guests,
                    salePrice: paymentInfo.salePrice,
                    totalPrice: paymentAmounts.totalAmount,
                  }}
                  customerInfo={{
                    name: paymentInfo.customerName,
                    email: paymentInfo.customerEmail,
                    phone: paymentInfo.customerPhone,
                    specialRequests: paymentInfo.specialRequests,
                    useCash: paymentInfo.useCash,
                    usePoint: paymentInfo.usePoint,
                    actualPaymentAmount: paymentAmounts.actualPaymentAmount,
                  }}
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
                  <span className="text-gray-600">원가</span>
                  <span className="line-through text-gray-400">
                    {paymentInfo.originalPrice.toLocaleString()}원
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">할인 금액</span>
                  <span className="text-red-500">
                    -{paymentInfo.discountAmount.toLocaleString()}원
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">세금 및 수수료</span>
                  <span>
                    {Math.round(paymentInfo.salePrice * 0.1).toLocaleString()}원
                  </span>
                </div>
                <hr className="my-3" />
                <div className="flex justify-between text-lg font-semibold">
                  <span>총 결제 금액</span>
                  <span className="text-blue-600">
                    {paymentAmounts.totalAmount.toLocaleString()}원
                  </span>
                </div>
              </div>

              {/* 캐시 및 포인트 사용 */}
              <div className="space-y-4 mb-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  결제 방식
                </h3>

                {/* 캐시 사용 */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-medium text-gray-700">
                      캐시 사용 (보유: {paymentInfo.customerCash.toString()}원)
                    </label>
                    <button
                      onClick={useAllCash}
                      className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded hover:bg-blue-200"
                    >
                      전체 사용
                    </button>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={paymentInfo.useCash}
                      onChange={(e) => handleCashChange(e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="사용할 캐시 금액"
                      min="0"
                      max={paymentInfo.customerCash}
                    />
                    <span className="text-sm text-gray-500 self-center">
                      원
                    </span>
                  </div>
                </div>

                {/* 포인트 사용 */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-medium text-gray-700">
                      포인트 사용 (보유:{" "}
                      {paymentInfo.customerPoint.toLocaleString()}P)
                    </label>
                    <button
                      onClick={useAllPoint}
                      className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded hover:bg-blue-200"
                    >
                      전체 사용
                    </button>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={paymentInfo.usePoint}
                      onChange={(e) => handlePointChange(e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="사용할 포인트"
                      min="0"
                      max={paymentInfo.customerPoint}
                    />
                    <span className="text-sm text-gray-500 self-center">P</span>
                  </div>
                </div>

                {/* 결제 내역 요약 */}
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">총 결제 금액</span>
                    <span className="text-gray-900 font-semibold">
                      {paymentAmounts.totalAmount.toLocaleString()}원
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">캐시 결제</span>
                    <span className="text-blue-600">
                      {paymentAmounts.useCash.toLocaleString()}원
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">포인트 결제</span>
                    <span className="text-blue-600">
                      {paymentAmounts.usePoint.toLocaleString()}P
                    </span>
                  </div>
                  <hr className="my-2" />
                  <div className="flex justify-between font-semibold">
                    <span>실제 결제 금액</span>
                    <span className="text-blue-600">
                      {paymentAmounts.actualPaymentAmount.toLocaleString()}원
                    </span>
                  </div>
                </div>
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
                    alert("구매자 정보를 모두 입력해주세요.");
                  }
                }}
                className={`w-full py-3 px-4 rounded-lg font-medium transition-colors mb-4 ${
                  isFormValid
                    ? "bg-blue-500 hover:bg-blue-600 text-white"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
              >
                {isFormValid
                  ? `${paymentAmounts.actualPaymentAmount.toLocaleString()}원 카드 결제하기`
                  : "구매자 정보를 입력하세요"}
              </button>

              <div className="text-xs text-gray-500 text-center">
                결제 완료 후 중고 호텔 예약이 자동으로 확정됩니다.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UsedPaymentForm;
