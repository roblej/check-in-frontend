"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Script from "next/script";
import axios from "@/lib/axios";

/**
 * TossPayments 결제 위젯 컴포넌트
 * TossPayments SDK를 사용하여 결제를 처리합니다.
 *
 * 개선사항:
 * - 모바일 환경은 successUrl/failUrl 기반 리다이렉트 플로우로 고정 (Promise/Callback 사용하지 않음)
 * - 데스크톱은 Promise 플로우 유지(또는 리다이렉트로 통일 가능)
 * - 카카오페이 QR은 데스크톱에서만 노출 (모바일은 앱/리다이렉트)
 * - 카카오톡 미설치 시 사용자 안내 처리
 *
 * @param {Object} props
 * @param {string} props.clientKey - TossPayments 클라이언트 키
 * @param {string} [props.customerKey] - 고객 식별 키(옵션)
 * @param {number} props.amount - 결제 금액
 * @param {string} props.orderId - 주문 ID
 * @param {string} props.orderName - 주문명
 * @param {string} [props.customerName] - 고객 이름
 * @param {string} [props.customerEmail] - 고객 이메일
 * @param {string} [props.customerMobilePhone] - 고객 휴대폰
 * @param {Object} [props.hotelInfo] - 호텔/객실 관련 메타
 * @param {Object} [props.customerInfo] - 고객 관련 메타
 * @param {Function} [props.onSuccess] - 결제 성공 훅(데스크톱 Promise 플로우에서만 사용)
 * @param {Function} [props.onFail] - 결제 실패 훅
 * @param {string} [props.successUrl] - 결제 성공 리다이렉트 경로
 * @param {string} [props.failUrl] - 결제 실패 리다이렉트 경로
 * @param {"카드"|"카카오페이"} [props.paymentMethod="카드"] - 결제수단
 * @param {"hotel_reservation"|"used_hotel"|"dining_reservation"} [props.paymentType] - 결제 타입 명시(데스크톱 검증 시 사용)
 * @param {Object} [props.diningInfo] - 다이닝 결제에 필요한 메타(diningIdx, diningDate, diningTime, guests, totalPrice, specialRequests)
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
  paymentMethod = "카드",
  paymentType,
  diningInfo,
}) => {
  const widgetRef = useRef(null);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  // 컴포넌트 마운트 시 스크립트가 이미 로드되어 있는지 확인
  useEffect(() => {
    if (typeof window !== "undefined" && window.TossPayments) {
      setScriptLoaded(true);
    }
  }, []);

  // 토스페이먼츠 SDK 로드 완료 후 실행 (한 번만 실행)
  useEffect(() => {
    if (!scriptLoaded) return;

    let isMounted = true;

    const initializePaymentWidget = async () => {
      try {
        // 토스페이먼츠 초기화
        const tossPayments = window.TossPayments(clientKey);
        if (!isMounted) return;
        widgetRef.current = tossPayments;

        if (isMounted) setIsLoading(false);
      } catch (err) {
        if (isMounted) {
          setError(err?.message || "토스페이먼츠 초기화에 실패했습니다.");
          setIsLoading(false);
        }
      }
    };

    initializePaymentWidget();

    return () => {
      isMounted = false;
      widgetRef.current = null;
      if (window.tossPaymentHandler) delete window.tossPaymentHandler;
    };
  }, [scriptLoaded, clientKey]);

  /**
   * 백엔드 결제 검증
   * - 데스크톱 Promise 플로우에서만 사용
   * - 모바일은 리다이렉트되어 성공 페이지에서 검증 수행
   * @param {Object} paymentResult - 결제 결과 객체
   */
  const verifyPaymentWithBackend = useCallback(
    async (paymentResult) => {
      try {
        setIsVerifying(true);

        // 중고 호텔 결제 여부 (orderId 문자열 대신 명시 필드 기반으로 판정)
        const isUsedHotelPayment = !!(
          hotelInfo?.usedTradeIdx || hotelInfo?.usedItemIdx
        );

        if (!paymentResult?.paymentKey) {
          throw new Error("결제 응답에 paymentKey가 없습니다.");
        }

        const resolvedType =
          paymentType ||
          (isUsedHotelPayment
            ? "used_hotel"
            : diningInfo
            ? "dining_reservation"
            : "hotel_reservation");

        // 중고 호텔은 공통 결제 검증 API를 사용하지 않고, 호출자(onSuccess)에서 처리하도록 위임
        if (resolvedType === "used_hotel") {
          setIsVerifying(false);
          if (onSuccess) onSuccess(paymentResult);
          return;
        }

        const requestData = {
          paymentKey: paymentResult.paymentKey,
          orderId: paymentResult.orderId,
          amount: customerInfo?.actualPaymentAmount || amount,
          type: resolvedType,
          customerIdx: customerInfo?.customerIdx || 1,
          // 호텔 결제 필드 (resolvedType이 호텔/중고일 때만 의미)
          contentId: String(hotelInfo?.contentId || hotelInfo?.hotelId || ""),
          roomId:
            hotelInfo?.roomIdx || hotelInfo?.roomId
              ? parseInt(hotelInfo.roomIdx || hotelInfo.roomId, 10)
              : null,
          checkIn: hotelInfo?.checkIn || undefined,
          checkOut: hotelInfo?.checkOut || undefined,
          guests: hotelInfo?.guests
            ? parseInt(hotelInfo.guests, 10)
            : undefined,
          nights: hotelInfo?.nights
            ? parseInt(hotelInfo.nights, 10)
            : undefined,
          roomPrice: hotelInfo?.roomPrice
            ? parseInt(hotelInfo.roomPrice, 10)
            : undefined,
          totalPrice: hotelInfo?.totalPrice
            ? parseInt(hotelInfo.totalPrice, 10)
            : undefined,
          // 이메일 필수 - customerInfo 우선, 없으면 props에서 가져오기
          customerName: customerInfo?.name || customerName || "",
          customerEmail: customerInfo?.email || customerEmail || "",
          customerPhone: customerInfo?.phone || customerMobilePhone || "",
          specialRequests: customerInfo?.specialRequests || "",
          method: paymentMethod === "카카오페이" ? "kakaopay" : "card",
          pointsUsed: customerInfo?.usePoint || 0,
          cashUsed: customerInfo?.useCash || 0,
          couponIdx: customerInfo?.couponIdx || null,
          couponDiscount: Number(customerInfo?.couponDiscount || 0),
          paymentInfo: {
            totalAmount: hotelInfo?.totalPrice || amount,
            cashAmount: customerInfo?.useCash || 0,
            pointAmount: customerInfo?.usePoint || 0,
            cardAmount: customerInfo?.actualPaymentAmount || amount,
            paymentMethod:
              customerInfo?.actualPaymentAmount > 0
                ? "mixed"
                : "cash_point_only",
          },
          ...(resolvedType === "used_hotel" && {
            usedItemIdx: hotelInfo?.usedItemIdx,
            usedTradeIdx: hotelInfo?.usedTradeIdx,
            hotelName: hotelInfo?.hotelName,
            roomType: hotelInfo?.roomType,
            salePrice: hotelInfo?.salePrice,
            paymentInfo: {
              useCash: 0,
              usePoint: 0,
              actualPaymentAmount:
                paymentResult.amount || paymentResult.totalAmount || amount,
              paymentMethod: "card",
            },
          }),
          ...(resolvedType === "dining_reservation" && {
            diningIdx: diningInfo?.diningIdx,
            diningDate: diningInfo?.diningDate,
            diningTime: diningInfo?.diningTime,
            reservationTime: diningInfo?.diningTime,
            guests: diningInfo?.guests,
            totalPrice: diningInfo?.totalPrice,
            specialRequests: diningInfo?.specialRequests,
          }),
        };

        const apiEndpoint = "/api/payments";

        const { data: result } = await axios.post(apiEndpoint, requestData);

        setIsVerifying(false);

        if (result?.success) {
          if (onSuccess) onSuccess(result);
          router.push(
            `/checkout/success?orderId=${result.orderId}&paymentKey=${result.paymentKey}&amount=${result.amount}&type=${resolvedType}`
          );
        } else {
          if (onFail) onFail(new Error(result?.message || "결제 검증 실패"));
          router.push(
            `/checkout/fail?error=${encodeURIComponent(
              result?.message || "VERIFY_FAIL"
            )}`
          );
        }
      } catch (err) {
        setIsVerifying(false);
        if (onFail) onFail(err);
        router.push(`/checkout/fail?error=${encodeURIComponent(err.message)}`);
      }
    },
    [
      amount,
      customerEmail,
      customerMobilePhone,
      customerInfo,
      customerName,
      hotelInfo,
      onFail,
      onSuccess,
      paymentMethod,
      paymentType,
      diningInfo,
      router,
    ]
  );

  /**
   * 결제 요청 핸들러
   * - 모바일: 리다이렉트 플로우(앱/브라우저). QR 미노출이 정상.
   * - 데스크톱: Promise 플로우로 결과를 받고 즉시 검증.
   */
  const handlePayment = useCallback(async () => {
    try {
      const tp = widgetRef.current;
      if (!tp) throw new Error("토스페이먼츠가 초기화되지 않았습니다.");

      const origin =
        typeof window !== "undefined" ? window.location.origin : "";

      /** success/fail URL은 모든 환경에서 반드시 포함 */
      const resolvedType =
        paymentType ||
        (orderId && orderId.includes("used_hotel")
          ? "used_hotel"
          : diningInfo
          ? "dining_reservation"
          : "hotel_reservation");

      const buildUrl = (base, params) => {
        const u = new URL(base, origin);
        Object.entries(params || {}).forEach(([k, v]) => {
          if (v !== undefined && v !== null && v !== "")
            u.searchParams.set(k, String(v));
        });
        return u.pathname + (u.search || "");
      };

      let successPath = successUrl || "/checkout/success";
      let failPath = failUrl || "/checkout/fail";

      if (resolvedType === "hotel_reservation") {
        successPath = buildUrl(successPath, {
          type: resolvedType,
          contentId: hotelInfo?.contentId || hotelInfo?.hotelId,
          roomId: hotelInfo?.roomIdx || hotelInfo?.roomId,
          checkIn: hotelInfo?.checkIn,
          checkOut: hotelInfo?.checkOut,
          guests: hotelInfo?.guests,
          nights: hotelInfo?.nights,
          totalPrice: hotelInfo?.totalPrice,
        });
        failPath = buildUrl(failPath, { type: resolvedType });
      } else if (resolvedType === "dining_reservation") {
        successPath = buildUrl(successPath, {
          type: resolvedType,
          diningIdx: diningInfo?.diningIdx,
          diningDate: diningInfo?.diningDate,
          diningTime: diningInfo?.diningTime,
          guests: diningInfo?.guests,
        });
        failPath = buildUrl(failPath, { type: resolvedType });
      } else if (resolvedType === "used_hotel") {
        successPath = buildUrl(successPath, {
          type: resolvedType,
          usedTradeIdx: hotelInfo?.usedTradeIdx,
          usedItemIdx: hotelInfo?.usedItemIdx,
          hotelName: hotelInfo?.hotelName,
          roomType: hotelInfo?.roomType,
          checkIn: hotelInfo?.checkIn,
          checkOut: hotelInfo?.checkOut,
        });
        failPath = buildUrl(failPath, { type: resolvedType });
      }

      const paymentData = {
        orderId,
        orderName,
        amount,
        customerName,
        customerEmail,
        customerMobilePhone,
        successUrl: `${origin}${successPath}`,
        failUrl: `${origin}${failPath}`,
      };

      // 성공 페이지 병합용 lastPaymentPayload 저장 (모바일 리다이렉트 대비)
      try {
        const lastPayload = {
          type: resolvedType,
          customerIdx: customerInfo?.customerIdx,
          customerEmail: customerInfo?.email || customerEmail,
          customerName: customerInfo?.name || customerName,
          customerPhone: customerInfo?.phone || customerMobilePhone,
          // 호텔/다이닝 메타(있을 경우)
          contentId: hotelInfo?.contentId || hotelInfo?.hotelId,
          roomId: hotelInfo?.roomIdx || hotelInfo?.roomId,
          checkIn: hotelInfo?.checkIn,
          checkOut: hotelInfo?.checkOut,
          guests: hotelInfo?.guests,
          nights: hotelInfo?.nights,
          roomPrice: hotelInfo?.roomPrice,
          // 금액 정보
          totalPrice: customerInfo?.actualPaymentAmount || amount,
          // 고객 입력값
          specialRequests: customerInfo?.specialRequests || "",
          pointsUsed: Number(customerInfo?.usePoint || 0),
          cashUsed: Number(customerInfo?.useCash || 0),
          // 쿠폰 정보
          couponIdx: customerInfo?.couponIdx || null,
          couponDiscount: Number(customerInfo?.couponDiscount || 0),
        };
        if (typeof window !== "undefined") {
          sessionStorage.setItem(
            "lastPaymentPayload",
            JSON.stringify(lastPayload)
          );
        }
        console.log("[PAY][Widget] lastPaymentPayload 저장:", {
          type: lastPayload.type,
          pointsUsed: lastPayload.pointsUsed,
          cashUsed: lastPayload.cashUsed,
          specialRequestsLen: lastPayload.specialRequests?.length || 0,
        });
      } catch (e) {
        console.warn("[PAY][Widget] lastPaymentPayload 저장 실패(무시):", e);
      }

      const isMobile =
        typeof window !== "undefined" &&
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
          window.navigator.userAgent
        );

      if (isMobile) {
        // 📱 모바일은 리다이렉트 기반. (카카오페이 QR 미지원이 정상)
        try {
          tp.requestPayment(paymentMethod, paymentData);
          // 이후는 리다이렉트 되므로 추가 로직 없음
          return;
        } catch (mobileErr) {
          // 카카오톡 미설치 등으로 intent 스킴 실패 시
          const msg = mobileErr?.message || "";
          if (msg.includes("does not have a registered handler")) {
            // 사용자 안내 (스토어 링크 유도)
            alert(
              "카카오페이 결제를 위해 카카오톡 앱이 필요합니다.\n앱 설치 후 다시 시도해주세요."
            );
            // 선택: 스토어 링크로 이동 유도
            window.location.href =
              "https://play.google.com/store/apps/details?id=com.kakao.talk";
            return;
          }
          if (onFail) onFail(mobileErr);
        }
      } else {
        // 🖥️ 데스크톱: Promise 플로우 (카카오페이면 QR 자동 노출)
        const paymentResult = await tp.requestPayment(
          paymentMethod,
          paymentData
        );

        if (!paymentResult?.paymentKey) {
          throw new Error("결제 응답에 paymentKey가 없습니다.");
        }
        await verifyPaymentWithBackend(paymentResult);
      }
    } catch (error) {
      // 사용자 취소/창 닫힘은 에러로 처리하지 않음
      const msg = error?.message || "";
      if (
        error?.code === "USER_CANCEL" ||
        msg.includes("취소") ||
        msg.toLowerCase().includes("closed")
      ) {
        return;
      }
      if (onFail) onFail(error);
    }
  }, [
    amount,
    customerEmail,
    customerMobilePhone,
    customerName,
    customerInfo,
    failUrl,
    diningInfo,
    hotelInfo,
    paymentType,
    verifyPaymentWithBackend,
    onFail,
    orderId,
    orderName,
    paymentMethod,
    successUrl,
  ]);

  // 결제 핸들러를 전역에 등록 (기존 구조 유지)
  useEffect(() => {
    if (!isLoading) {
      window.tossPaymentHandler = handlePayment;
    }
    return () => {
      if (window.tossPaymentHandler) delete window.tossPaymentHandler;
    };
    // 결제 파라미터가 바뀌면 최신 값으로 핸들러 갱신
  }, [
    isLoading,
    paymentMethod,
    amount,
    orderId,
    orderName,
    customerName,
    customerEmail,
    customerMobilePhone,
    successUrl,
    failUrl,
    paymentType,
    diningInfo?.diningTime,
    handlePayment,
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
      {/* 토스페이먼츠 SDK 로드 (백그라운드) */}
      <Script
        src="https://js.tosspayments.com/v1/payment"
        strategy="afterInteractive"
        onLoad={() => setScriptLoaded(true)}
        onError={() => {
          setError("토스페이먼츠 SDK 로드에 실패했습니다.");
          setIsLoading(false);
        }}
      />

      {/* 로딩 또는 에러 상태만 표시 */}
      {isLoading && (
        <div className="flex items-center justify-center py-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto mb-2"></div>
            <p className="text-gray-600 text-sm">토스페이먼츠 준비 중...</p>
          </div>
        </div>
      )}

      {/* 백엔드 검증 중 로딩 오버레이 (데스크톱 Promise 플로우에서만 사용) */}
      {isVerifying && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
          style={{
            backgroundColor: "rgba(0, 0, 0, 0.6)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
          }}
        >
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center">
            <div className="relative mb-6">
              <div className="animate-spin rounded-full h-20 w-20 border-b-4 border-orange-600 mx-auto"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-orange-600 text-3xl">🔒</div>
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              결제 검증 중
            </h3>
            <p className="text-gray-600 mb-6 text-lg leading-relaxed">
              결제 정보를 확인하고 있습니다.
              <br />
              잠시만 기다려주세요...
            </p>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden mb-6">
              <div
                className="bg-orange-600 h-3 rounded-full animate-pulse transition-all duration-500"
                style={{ width: "80%" }}
              />
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800 font-medium">
                ⚠️ 페이지를 새로고침하거나 닫지 마세요
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TossPaymentsWidget;
