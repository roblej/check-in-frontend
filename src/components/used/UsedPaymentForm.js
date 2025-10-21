'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import TossPaymentsWidget from '@/components/payment/TossPaymentsWidget';
import { usePaymentStore } from '@/stores/paymentStore';

const UsedPaymentForm = ({ initialData }) => {
  const router = useRouter();
  const { loadFromStorage, clearPaymentDraft } = usePaymentStore();
  
  // 결제 정보 상태
  const [paymentInfo, setPaymentInfo] = useState({
    ...initialData,
    customerName: '태인',
    customerEmail: 'taein@gmail.com',
    customerPhone: '010-1234-5678'
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // 고정된 키들 생성 (useMemo로 최적화)
  const paymentKeys = useMemo(() => ({
    customerKey: `customer_${paymentInfo.usedItemIdx || 'default'}`,
    orderId: `used_hotel_${paymentInfo.usedItemIdx || Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }), [paymentInfo.usedItemIdx]);

  useEffect(() => {
    loadFromStorage();
  }, []); // 빈 의존성 배열로 변경하여 한 번만 실행

  // 폼 유효성 검사 (useMemo로 최적화)
  const isFormValid = useMemo(() => {
    if (!paymentInfo.customerName.trim()) return false;
    if (!paymentInfo.customerEmail.trim()) return false;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(paymentInfo.customerEmail)) return false;
    if (!paymentInfo.customerPhone.trim()) return false;
    if (!/^[0-9-+\s]+$/.test(paymentInfo.customerPhone)) return false;
    return true;
  }, [paymentInfo.customerName, paymentInfo.customerEmail, paymentInfo.customerPhone]);

  // 폼 유효성 검사 (에러 메시지 포함)
  const validateForm = () => {
    const newErrors = {};

    if (!paymentInfo.customerName.trim()) {
      newErrors.customerName = '구매자 이름을 입력해주세요.';
    }

    if (!paymentInfo.customerEmail.trim()) {
      newErrors.customerEmail = '이메일을 입력해주세요.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(paymentInfo.customerEmail)) {
      newErrors.customerEmail = '올바른 이메일 형식을 입력해주세요.';
    }

    if (!paymentInfo.customerPhone.trim()) {
      newErrors.customerPhone = '전화번호를 입력해주세요.';
    } else if (!/^[0-9-+\s]+$/.test(paymentInfo.customerPhone)) {
      newErrors.customerPhone = '올바른 전화번호 형식을 입력해주세요.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 입력 필드 변경 핸들러
  const handleInputChange = (field, value) => {
    setPaymentInfo(prev => ({
      ...prev,
      [field]: value
    }));
    
    // 에러 메시지 제거
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  // 토스페이먼츠 결제 성공 처리
  const handlePaymentSuccess = async (paymentResult) => {
    try {
      // 서버에 결제 완료 알림
      const response = await fetch('/api/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentKey: paymentResult.paymentKey,
          orderId: paymentResult.orderId,
          amount: paymentInfo.salePrice,
          usedItemIdx: paymentInfo.usedItemIdx,
          hotelInfo: {
            hotelName: paymentInfo.hotelName,
            roomType: paymentInfo.roomType,
            checkIn: paymentInfo.checkIn,
            checkOut: paymentInfo.checkOut,
            guests: paymentInfo.guests,
            originalPrice: paymentInfo.originalPrice,
            salePrice: paymentInfo.salePrice,
            discountAmount: paymentInfo.discountAmount,
            seller: paymentInfo.seller
          },
          customerInfo: {
            name: paymentInfo.customerName,
            email: paymentInfo.customerEmail,
            phone: paymentInfo.customerPhone
          }
        }),
      });

      if (response.ok) {
        clearPaymentDraft();
        router.push(`/checkout/success?orderId=${paymentResult.orderId}&amount=${paymentInfo.salePrice}&type=used_hotel`);
      }
    } catch (error) {
      console.error('결제 완료 처리 오류:', error);
      alert('결제는 완료되었지만 처리 중 오류가 발생했습니다. 고객센터에 문의해주세요.');
    }
  };

  // 토스페이먼츠 결제 실패 처리
  const handlePaymentFail = (error) => {
    console.error('결제 실패:', error);
    router.push(`/checkout/fail?error=${encodeURIComponent(error.message || '결제가 취소되었습니다.')}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">중고 호텔 결제</h1>
          <p className="text-gray-600">중고 호텔 예약 정보를 확인하고 결제를 진행해주세요.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 호텔 정보 및 구매자 정보 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 중고 호텔 정보 */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">중고 호텔 정보</h2>
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
                  <p className="text-gray-600 mb-2">{paymentInfo.hotelAddress}</p>
                  <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                    <div>
                      <span className="font-medium">객실 타입:</span> {paymentInfo.roomType}
                    </div>
                    <div>
                      <span className="font-medium">게스트:</span> {paymentInfo.guests}명
                    </div>
                    <div>
                      <span className="font-medium">체크인:</span> {paymentInfo.checkIn}
                    </div>
                    <div>
                      <span className="font-medium">체크아웃:</span> {paymentInfo.checkOut}
                    </div>
                    <div>
                      <span className="font-medium">숙박 일수:</span> {paymentInfo.nights}박
                    </div>
                    <div>
                      <span className="font-medium">판매자:</span> {paymentInfo.seller}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 구매자 정보 */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">구매자 정보</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    구매자 이름 *
                  </label>
                  <input
                    type="text"
                    value={paymentInfo.customerName}
                    onChange={(e) => handleInputChange('customerName', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.customerName ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="구매자 이름을 입력하세요"
                  />
                  {errors.customerName && (
                    <p className="text-red-500 text-sm mt-1">{errors.customerName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    이메일 *
                  </label>
                  <input
                    type="email"
                    value={paymentInfo.customerEmail}
                    onChange={(e) => handleInputChange('customerEmail', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.customerEmail ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="이메일을 입력하세요"
                  />
                  {errors.customerEmail && (
                    <p className="text-red-500 text-sm mt-1">{errors.customerEmail}</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    전화번호 *
                  </label>
                  <input
                    type="tel"
                    value={paymentInfo.customerPhone}
                    onChange={(e) => handleInputChange('customerPhone', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.customerPhone ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="전화번호를 입력하세요"
                  />
                  {errors.customerPhone && (
                    <p className="text-red-500 text-sm mt-1">{errors.customerPhone}</p>
                  )}
                </div>
              </div>
            </div>

            {/* 토스페이먼츠 결제 위젯 */}
            {isFormValid && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">결제 정보</h2>
                <TossPaymentsWidget
                  clientKey={process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY}
                  customerKey={paymentKeys.customerKey}
                  amount={paymentInfo.salePrice}
                  orderId={paymentKeys.orderId}
                  orderName={`${paymentInfo.hotelName} - ${paymentInfo.roomType}`}
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
              <h2 className="text-xl font-semibold text-gray-900 mb-4">가격 요약</h2>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">원가</span>
                  <span className="line-through text-gray-400">{paymentInfo.originalPrice.toLocaleString()}원</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">할인 금액</span>
                  <span className="text-red-500">-{paymentInfo.discountAmount.toLocaleString()}원</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">세금 및 수수료</span>
                  <span>{Math.round(paymentInfo.salePrice * 0.1).toLocaleString()}원</span>
                </div>
                <hr className="my-3" />
                <div className="flex justify-between text-lg font-semibold">
                  <span>총 결제 금액</span>
                  <span className="text-orange-600">{(paymentInfo.salePrice + Math.round(paymentInfo.salePrice * 0.1)).toLocaleString()}원</span>
                </div>
              </div>

              {/* 결제 버튼 */}
              <button
                onClick={() => {
                  if (isFormValid) {
                    // 토스페이먼츠 위젯의 결제 버튼 클릭
                    const paymentButton = document.getElementById('payment-button');
                    if (paymentButton) {
                      paymentButton.click();
                    }
                  } else {
                    // 폼 유효성 검사 실행
                    validateForm();
                    alert('구매자 정보를 모두 입력해주세요.');
                  }
                }}
                className={`w-full py-3 px-4 rounded-lg font-medium transition-colors mb-4 ${
                  isFormValid
                    ? 'bg-orange-500 hover:bg-orange-600 text-white'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {isFormValid 
                  ? `${(paymentInfo.salePrice + Math.round(paymentInfo.salePrice * 0.1)).toLocaleString()}원 결제하기`
                  : '구매자 정보를 입력하세요'
                }
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