"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Script from "next/script";

/**
 * TossPayments 결제 위젯 컴포넌트
 * TossPayments SDK를 사용하여 결제를 처리합니다.
 */
const TossPaymentsWidget = ({
  clientKey,
  customerKey,
  amount,
  orderId,
  orderName,
  customerName,
  customerEmail,
  customerMobilePhone,
  hotelInfo,
  customerInfo,
  onSuccess,
  onFail,
  successUrl,
  failUrl,
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
        console.log("토스페이먼츠 초기화 시작...", {
          clientKey,
          customerKey,
          amount,
        });

        // 토스페이먼츠 초기화 - 올바른 방법
        const tossPayments = window.TossPayments(clientKey);
        console.log("토스페이먼츠 초기화 완료:", tossPayments);
        console.log("사용 가능한 메서드:", Object.keys(tossPayments));

        // 결제 위젯 대신 일반 결제 방식 사용
        console.log("토스페이먼츠 초기화 완료 - 일반 결제 방식 사용");
        setIsLoading(false);

        // 결제 요청 처리
        const handlePayment = async () => {
          try {
            console.log("결제 요청 시작...");

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

            console.log("결제 데이터 (민감정보 제외):", {
              orderId: paymentData.orderId,
              orderName: paymentData.orderName,
              amount: paymentData.amount,
              customerName: paymentData.customerName ? "***" : undefined,
            });

            // 토스페이먼츠 결제 요청
            const paymentResult = await tossPayments.requestPayment(
              "카드",
              paymentData
            );

            console.log("결제 결과 (민감정보 제외):", {
              paymentKey: paymentResult.paymentKey ? "***" : undefined,
              orderId: paymentResult.orderId,
              amount: paymentResult.amount,
            });

            // 결제 성공 시 백엔드로 검증 요청
            if (paymentResult && paymentResult.paymentKey) {
              await verifyPaymentWithBackend(paymentResult);
            }
          } catch (error) {
            console.error("결제 요청 실패:", error);
            if (onFail) {
              onFail(error);
            }
          }
        };

        // 백엔드로 결제 검증 요청
        const verifyPaymentWithBackend = async (paymentResult) => {
          try {
            console.log("백엔드 결제 검증 시작...");
            console.log("paymentResult (민감정보 제외):", {
              paymentKey: paymentResult.paymentKey ? "***" : undefined,
              orderId: paymentResult.orderId,
              amount: paymentResult.amount,
            });

            // TODO: 로그인 상태 확인 및 사용자 인증 토큰 추가
            // TODO: 결제 전 예약 가능 여부 사전 체크 API 호출
            // TODO: 쿠폰/할인 적용 로직 추가
            // TODO: 포인트 사용 로직 추가
            // TODO: 결제 금액 검증 로직 추가

            // 중고 호텔 결제인지 확인 (orderId에 'used_hotel'이 포함된 경우)
            const isUsedHotelPayment =
              orderId && orderId.includes("used_hotel");

            const requestData = {
              paymentKey: paymentResult.paymentKey,
              orderId: paymentResult.orderId,
              amount:
                paymentResult.amount || paymentResult.totalAmount || amount, // amount 우선 사용
              type: isUsedHotelPayment ? "used_hotel" : "hotel_reservation",
              customerIdx: 1, // TODO: 실제 로그인된 사용자 ID 사용
              contentId: hotelInfo?.contentId || hotelInfo?.hotelId?.toString(),
              roomId: hotelInfo?.roomId,
              checkIn: hotelInfo?.checkIn,
              checkOut: hotelInfo?.checkOut,
              guests: hotelInfo?.guests,
              nights: hotelInfo?.nights,
              roomPrice: hotelInfo?.roomPrice,
              totalPrice: hotelInfo?.totalPrice,
              customerName: customerInfo?.name || customerName,
              customerEmail: customerInfo?.email || customerEmail,
              customerPhone: customerInfo?.phone || customerMobilePhone,
              specialRequests: customerInfo?.specialRequests,
              method: "card",
              pointsUsed: 0, // TODO: 실제 포인트 사용량 계산
              cashUsed: 0, // TODO: 현금 결제 로직 추가
              // 중고 호텔 결제를 위한 추가 필드
              ...(isUsedHotelPayment && {
                usedItemIdx: hotelInfo?.usedItemIdx,
                usedTradeIdx: hotelInfo?.usedTradeIdx,
                hotelName: hotelInfo?.hotelName,
                roomType: hotelInfo?.roomType,
                salePrice: hotelInfo?.salePrice,
                paymentInfo: {
                  useCash: 0, // TODO: 실제 캐시 사용량
                  usePoint: 0, // TODO: 실제 포인트 사용량
                  actualPaymentAmount:
                    paymentResult.amount || paymentResult.totalAmount || amount,
                  paymentMethod: "card",
                },
              }),
            };

            console.log("백엔드로 전송할 데이터 (민감정보 제외):", {
              paymentKey: requestData.paymentKey ? "***" : undefined,
              orderId: requestData.orderId,
              amount: requestData.amount,
              type: requestData.type,
              customerIdx: requestData.customerIdx,
            });

            // 중고 호텔 결제인 경우 다른 엔드포인트 사용
            const apiEndpoint = isUsedHotelPayment
              ? "/api/payments" // 중고 호텔은 프론트엔드 API 라우트 사용
              : `${
                  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8888"
                }/api/payments/confirm`; // 일반 호텔은 백엔드 직접 호출

            console.log("API 엔드포인트:", apiEndpoint);

            const response = await fetch(apiEndpoint, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                // TODO: Authorization 헤더 추가 (JWT 토큰)
              },
              body: JSON.stringify(requestData),
            });

            const result = await response.json();

            if (result.success) {
              console.log("결제 검증 성공:", result);
              if (onSuccess) {
                onSuccess(result);
              }
              // TODO: 결제 성공 후 포인트 적립 로직 추가
              // TODO: 결제 완료 알림 (토스트, 모달 등) 추가
              // TODO: 결제 완료 후 사용자 행동 추적 (GA, Mixpanel 등)

              // 성공 페이지로 이동
              router.push(
                `/payment/complete?orderId=${result.orderId}&paymentKey=${result.paymentKey}&amount=${result.amount}`
              );
            } else {
              console.error("결제 검증 실패:", result.message);
              if (onFail) {
                onFail(new Error(result.message));
              }
              // TODO: 에러 타입별 사용자 친화적 메시지 표시
              // TODO: 결제 실패 시 재시도 로직 추가

              // 실패 페이지로 이동
              router.push(
                `/checkout/fail?error=${encodeURIComponent(result.message)}`
              );
            }
          } catch (error) {
            console.error("백엔드 결제 검증 중 오류:", error);
            if (onFail) {
              onFail(error);
            }
            // TODO: 네트워크 오류 시 재시도 로직 추가
            // TODO: 오류 로깅 시스템 연동 (Sentry 등)

            // 실패 페이지로 이동
            router.push(
              `/checkout/fail?error=${encodeURIComponent(error.message)}`
            );
          }
        };

        // 결제 함수를 전역으로 노출하여 외부에서 호출 가능하도록 설정
        window.tossPaymentHandler = handlePayment;
        console.log("토스페이먼츠 결제 핸들러 등록 완료");

        widgetRef.current = tossPayments;
      } catch (error) {
        console.error("토스페이먼츠 초기화 실패:", error);
        setError(error.message || "토스페이먼츠 초기화에 실패했습니다.");
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
  }, [
    scriptLoaded,
    clientKey,
    customerKey,
    amount,
    orderId,
    orderName,
    customerName,
    customerEmail,
    customerMobilePhone,
  ]);

  if (error) {
    return (
      <div className="space-y-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-red-900 mb-2">
            결제 위젯 로드 실패
          </h3>
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
          console.log("토스페이먼츠 SDK 로드 완료");
          setScriptLoaded(true);
        }}
        onError={() => {
          console.error("토스페이먼츠 SDK 로드 실패");
          setError("토스페이먼츠 SDK 로드에 실패했습니다.");
          setIsLoading(false);
        }}
      />

      <div className="space-y-6">
        {/* 결제 수단 선택 */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            결제 수단
          </h3>
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
                <p className="text-gray-500 text-sm mb-4">
                  결제 버튼을 클릭하면 토스페이먼츠 결제창이 열립니다
                </p>
                <button
                  onClick={() =>
                    window.tossPaymentHandler && window.tossPaymentHandler()
                  }
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!window.tossPaymentHandler}
                >
                  ₩{amount?.toLocaleString()} 결제하기
                </button>
                {/* TODO: 결제 수단 선택 UI 추가 (카드, 계좌이체, 간편결제 등) */}
                {/* TODO: 쿠폰 적용 UI 추가 */}
                {/* TODO: 포인트 사용 UI 추가 */}
                {/* TODO: 결제 약관 동의 체크박스 추가 */}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default TossPaymentsWidget;
