'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

const TossPaymentsWidget = ({ 
  clientKey, 
  customerKey, 
  amount, 
  orderId, 
  orderName, 
  customerName, 
  customerEmail, 
  customerMobilePhone,
  onSuccess,
  onFail 
}) => {
  const widgetRef = useRef(null);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadTossPayments = async () => {
      try {
        console.log('토스페이먼츠 로딩 시작...', { clientKey, customerKey, amount });
        
        // 토스페이먼츠 SDK를 CDN에서 로드
        if (!window.TossPayments) {
          const script = document.createElement('script');
          script.src = 'https://js.tosspayments.com/v1/payment-widget';
          script.async = true;
          document.head.appendChild(script);
          
          await new Promise((resolve, reject) => {
            script.onload = resolve;
            script.onerror = reject;
          });
        }
        
        console.log('TossPayments 함수 타입:', typeof window.TossPayments);
        
        // 토스페이먼츠 초기화
        const tossPayments = window.TossPayments(clientKey);

        // 결제 위젯 생성
        const paymentWidget = tossPayments.PaymentWidget(customerKey, {
          brandColor: '#FF6B35', // 오렌지 컬러로 브랜드 색상 설정
        });

        console.log('토스페이먼츠 위젯 생성 완료');

        // 결제 위젯을 DOM에 렌더링
        await paymentWidget.renderPaymentMethods('#payment-method', amount);
        
        console.log('토스페이먼츠 위젯 렌더링 완료');
        setIsLoading(false);

        // 결제 요청 처리
        const handlePayment = async () => {
          try {
            console.log('결제 요청 시작...');
            const paymentResult = await paymentWidget.requestPayment({
              orderId,
              orderName,
              customerName,
              customerEmail,
              customerMobilePhone,
              successUrl: `${window.location.origin}/checkout/success`,
              failUrl: `${window.location.origin}/checkout/fail`,
            });

            console.log('결제 결과:', paymentResult);
            if (paymentResult && onSuccess) {
              onSuccess(paymentResult);
            }
          } catch (error) {
            console.error('결제 요청 실패:', error);
            if (onFail) {
              onFail(error);
            }
          }
        };

        // 결제 버튼 이벤트 리스너 등록
        const paymentButton = document.getElementById('payment-button');
        if (paymentButton) {
          paymentButton.addEventListener('click', handlePayment);
          console.log('결제 버튼 이벤트 리스너 등록 완료');
        } else {
          console.warn('결제 버튼을 찾을 수 없습니다');
        }

        widgetRef.current = paymentWidget;

      } catch (error) {
        console.error('토스페이먼츠 로드 실패:', error);
        setError(error.message || '토스페이먼츠 로드에 실패했습니다.');
        setIsLoading(false);
      }
    };

    loadTossPayments();

    // 컴포넌트 언마운트 시 정리
    return () => {
      if (widgetRef.current) {
        widgetRef.current = null;
      }
    };
  }, [clientKey, customerKey, amount, orderId, orderName, customerName, customerEmail, customerMobilePhone]); // 필요한 의존성만 포함

  if (error) {
    return (
      <div className="space-y-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-red-900 mb-2">결제 위젯 로드 실패</h3>
          <p className="text-red-700">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 결제 수단 선택 */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">결제 수단</h3>
        <div id="payment-method" className="border border-gray-200 rounded-lg p-4 min-h-[200px]">
          {isLoading ? (
            <div className="flex items-center justify-center h-48">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto mb-2"></div>
                <p className="text-gray-600">토스페이먼츠 로딩 중...</p>
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-500">
              결제 수단을 선택해주세요
            </div>
          )}
        </div>
      </div>

      {/* 결제 버튼 */}
      <button
        id="payment-button"
        disabled={isLoading}
        className={`w-full font-medium py-3 px-4 rounded-lg transition-colors ${
          isLoading
            ? 'bg-gray-400 cursor-not-allowed text-white'
            : 'bg-orange-500 hover:bg-orange-600 text-white'
        }`}
      >
        {isLoading ? '로딩 중...' : `${amount.toLocaleString()}원 결제하기`}
      </button>
    </div>
  );
};

export default TossPaymentsWidget;
