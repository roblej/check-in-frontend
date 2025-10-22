'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Script from 'next/script';

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
  onFail,
  successUrl,
  failUrl
}) => {
  const widgetRef = useRef(null);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [scriptLoaded, setScriptLoaded] = useState(false);

  // 토스페이먼츠 SDK 로드 완료 후 실행
  useEffect(() => {
    if (!scriptLoaded) return;

    const initializePaymentWidget = async () => {
      try {
        console.log('토스페이먼츠 초기화 시작...', { clientKey, customerKey, amount });
        
        // 토스페이먼츠 초기화 - 올바른 방법
        const tossPayments = window.TossPayments(clientKey);
        console.log('토스페이먼츠 초기화 완료:', tossPayments);
        console.log('사용 가능한 메서드:', Object.keys(tossPayments));

        // 결제 위젯 대신 일반 결제 방식 사용
        console.log('토스페이먼츠 초기화 완료 - 일반 결제 방식 사용');
        setIsLoading(false);

        // 결제 요청 처리
        const handlePayment = async () => {
          try {
            console.log('결제 요청 시작...');
            
            const paymentData = {
              orderId,
              orderName,
              amount: amount,
              customerName,
              customerEmail,
              customerMobilePhone,
              // JavaScript 콜백을 사용하므로 URL 리다이렉트 비활성화
              // successUrl: successUrl || `${window.location.origin}/checkout/success`,
              // failUrl: failUrl || `${window.location.origin}/checkout/fail`,
            };
            
            console.log('결제 데이터:', paymentData);
            console.log('amount 타입:', typeof amount, '값:', amount);
            
            // 토스페이먼츠 결제 요청
            const paymentResult = await tossPayments.requestPayment('카드', paymentData);

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

        // 결제 함수를 전역으로 노출하여 외부에서 호출 가능하도록 설정
        window.tossPaymentHandler = handlePayment;
        console.log('토스페이먼츠 결제 핸들러 등록 완료');

        widgetRef.current = tossPayments;

      } catch (error) {
        console.error('토스페이먼츠 초기화 실패:', error);
        setError(error.message || '토스페이먼츠 초기화에 실패했습니다.');
        setIsLoading(false);
      }
    };

    initializePaymentWidget();

    // 컴포넌트 언마운트 시 정리
    return () => {
      if (widgetRef.current) {
        widgetRef.current = null;
      }
      // 전역 핸들러 정리
      if (window.tossPaymentHandler) {
        delete window.tossPaymentHandler;
      }
    };
  }, [scriptLoaded, clientKey, customerKey, amount, orderId, orderName, customerName, customerEmail, customerMobilePhone]);

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
    <>
      {/* 토스페이먼츠 SDK 로드 */}
      <Script
        src="https://js.tosspayments.com/v1/payment"
        strategy="afterInteractive"
        onLoad={() => {
          console.log('토스페이먼츠 SDK 로드 완료');
          setScriptLoaded(true);
        }}
        onError={() => {
          console.error('토스페이먼츠 SDK 로드 실패');
          setError('토스페이먼츠 SDK 로드에 실패했습니다.');
          setIsLoading(false);
        }}
      />

      <div className="space-y-6">
        {/* 결제 수단 선택 */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">결제 수단</h3>
          <div className="border border-gray-200 rounded-lg p-4">
            {isLoading ? (
              <div className="flex items-center justify-center h-32">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto mb-2"></div>
                  <p className="text-gray-600">토스페이먼츠 로딩 중...</p>
                </div>
              </div>
            ) : (
              <div className="text-center">
                <div className="flex items-center justify-center mb-4">
                  <div className="w-12 h-8 bg-blue-500 rounded flex items-center justify-center mr-3">
                    <span className="text-white text-sm font-bold">카드</span>
                  </div>
                  <span className="text-gray-700">카드 결제</span>
                </div>
                <p className="text-gray-500 text-sm">
                  결제 버튼을 클릭하면 토스페이먼츠 결제창이 열립니다
                </p>
              </div>
            )}
          </div>
        </div>

      </div>
    </>
  );
};

export default TossPaymentsWidget;
