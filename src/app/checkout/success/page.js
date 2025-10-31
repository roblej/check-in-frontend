"use client";

import { useEffect, useRef, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { usePaymentStore } from "@/stores/paymentStore";
import RouletteModal from "@/components/roulette/RouletteModal";

/**
 * 결제 성공 페이지
 * - 모바일/데스크톱 공통으로 백엔드에 결제 검증을 요청한다.
 * - StrictMode/재방문 중복 처리를 sessionStorage로 가드한다.
 */
const SuccessPageContent = () => {
  const search = useSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const [isRouletteModalOpen, setIsRouletteModalOpen] = useState(false);
  const [hasRouletteSpun, setHasRouletteSpun] = useState(false); // 룰렛을 이미 돌렸는지 여부

  const isProcessingRef = useRef(false);

  useEffect(() => {
    const doConfirm = async () => {
      const paymentKey = search.get("paymentKey");
      const orderId = search.get("orderId");
      const amount = search.get("amount");

      // localStorage에서 paymentDraft 복원 시도
      usePaymentStore.getState().loadFromStorage();

      const { paymentDraft } = usePaymentStore.getState();
      console.log("🔍 paymentDraft 전체:", paymentDraft);
      
      // type 추출: URL 파라미터 우선, 그 다음 paymentDraft
      let type = search.get("type") || paymentDraft?.meta?.type;
      
      // type이 없으면 URL 파라미터로부터 추론 시도
      if (!type) {
        // 다이닝 관련 파라미터가 있으면 다이닝 예약
        if (search.get("diningIdx") || search.get("diningDate") || search.get("diningTime")) {
          type = "dining_reservation";
          console.log("🔍 URL 파라미터로부터 다이닝 예약으로 추론");
        }
        // 중고 호텔 관련 파라미터가 있으면 중고 호텔
        else if (search.get("usedTradeIdx") || search.get("usedItemIdx")) {
          type = "used_hotel";
          console.log("🔍 URL 파라미터로부터 중고 호텔으로 추론");
        }
        // 호텔 관련 파라미터가 있으면 호텔 예약
        else if (search.get("contentId") || search.get("roomId") || paymentDraft?.meta?.contentId) {
          type = "hotel_reservation";
          console.log("🔍 URL 파라미터 또는 paymentDraft로부터 호텔 예약으로 추론");
        }
      }
      
      console.log("🔍 최종 추출된 type:", type);
      
      // type이 여전히 없으면 에러
      if (!type) {
        setError("결제 타입을 확인할 수 없습니다. URL 파라미터에 type을 포함해주세요.");
        setLoading(false);
        return;
      }

      // 같은 마운트 내 중복 호출 방지 + 재방문 가드
      const processedKey = orderId ? `payment_processed_${orderId}` : null;
      if (processedKey && typeof window !== "undefined") {
        if (isProcessingRef.current) return; // 같은 마운트 내 중복 호출 방지
        if (sessionStorage.getItem(processedKey) === "1") {
          setLoading(false);
          return;
        }
        isProcessingRef.current = true;
      }

      if (!paymentKey || !orderId || !amount) {
        setError("필수 결제 파라미터가 없습니다.");
        setLoading(false);
        return;
      }

      const amountNum = Number(amount);
      if (Number.isNaN(amountNum)) {
        setError("금액이 올바르지 않습니다.");
        setLoading(false);
        return;
      }

      // 중고 호텔의 경우 프론트에서 이미 처리됨
      if (type === "used_hotel") {
        setResult({
          orderId,
          amount: amountNum,
          type,
          message: "중고 호텔 결제가 완료되었습니다.",
        });
        if (processedKey) sessionStorage.setItem(processedKey, "1");
        setLoading(false);
        return;
      }

      try {
        // 로그인 사용자 정보 보강 (이메일/이름/전화/idx)
        let me = null;
        try {
          const meRes = await fetch("/api/customer/me", {
            credentials: "include",
          });
          if (meRes.ok) me = await meRes.json();
        } catch (err) {
          console.warn("고객 정보 조회 실패 (무시됨):", err);
        }

        const payload = {
          paymentKey,
          orderId,
          amount: amountNum,
          type,
          customerIdx: me?.customerIdx,
          customerEmail: me?.email || undefined,
          customerName: me?.name || undefined,
          customerPhone: me?.phone || undefined,
        };
        if (type === "dining_reservation") {
          const diningIdx = Number(search.get("diningIdx"));
          const guests = Number(search.get("guests"));
          payload.diningIdx = Number.isNaN(diningIdx) ? undefined : diningIdx;
          payload.diningDate = search.get("diningDate") || undefined;
          const diningTime = search.get("diningTime") || undefined;
          payload.diningTime = diningTime;
          // 백엔드가 reservationTime을 기대하는 환경을 대비해 중복 전송
          payload.reservationTime = diningTime;
          payload.guests = Number.isNaN(guests) ? undefined : guests;
        }
        // 호텔 예약일 경우 결제 직전 저장된 메타를 평탄화하여 백엔드 DTO와 일치시킴
        if (type === "hotel_reservation") {
          const meta = paymentDraft?.meta;
          console.log("paymentDraft:", paymentDraft);
          console.log("meta:", meta);

          if (meta) {
            payload.contentId = meta.contentId;
            payload.roomId = meta.roomIdx || meta.roomId;
            payload.checkIn = meta.checkIn;
            payload.checkOut = meta.checkOut;
            payload.guests = meta.guests;
            payload.nights = meta.nights;
            payload.roomPrice = meta.roomPrice;
            payload.totalPrice = meta.totalPrice;
            payload.specialRequests = meta.specialRequests;
          } else {
            console.warn("meta 정보가 없습니다. paymentDraft를 확인하세요.");
          }
        }

        console.log("결제 확인 요청 페이로드:", payload);

        const res = await fetch("/api/payments/confirm", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include", // HttpOnly 쿠키 전송을 위해 필요
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          // 서버에서 JSON 에러를 내려줄 수도 있으니 방어
          let message = "결제 처리 실패";
          try {
            const errJson = await res.json();
            if (errJson?.message) message = errJson.message;
          } catch {
            // ignore
          }
          throw new Error(message);
        }

        const data = await res.json();
        setResult(data);
        if (processedKey) sessionStorage.setItem(processedKey, "1");
      } catch (e) {
        setError(e?.message || "서버 오류가 발생했습니다.");
        if (processedKey) sessionStorage.removeItem(processedKey);
      } finally {
        setLoading(false);
        if (isProcessingRef.current) isProcessingRef.current = false;
      }
    };

    doConfirm();
  }, [search, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center py-20">
          <div className="text-center max-w-md px-4">
            {/* 로딩 애니메이션 */}
            <div className="relative mb-8">
              <div className="animate-spin rounded-full h-20 w-20 border-b-4 border-orange-600 mx-auto"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-orange-600 text-2xl">💳</div>
              </div>
            </div>

            {/* 로딩 메시지 */}
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              결제를 처리하고 있습니다
            </h2>
            <p className="text-gray-600 mb-6">
              백엔드에서 결제 정보를 검증 중입니다.
              <br />
              잠시만 기다려주세요...
            </p>

            {/* 프로그레스 바 */}
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <div
                className="bg-orange-600 h-2 rounded-full animate-pulse"
                style={{ width: "70%" }}
              ></div>
            </div>

            {/* 안내 메시지 */}
            <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                ⚠️ 페이지를 새로고침하거나 닫지 마세요
              </p>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-2xl mx-auto px-4 py-20">
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <div className="text-red-500 text-6xl mb-4">❌</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              결제 처리 실패
            </h1>
            <p className="text-red-600 mb-6">{error}</p>
            <button
              onClick={() => router.push("/")}
              className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-medium"
            >
              홈으로 돌아가기
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const qrUrl = result?.qrUrl; // 데스크톱 카카오페이의 경우에만 존재
  const receipt = result?.receiptUrl;
  const type = search.get("type");
  const isUsedHotel = type === "used_hotel";
  const isDiningReservation = type === "dining_reservation";
  const amountFromResult = result?.amount || search.get("amount");

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-2xl mx-auto px-4 py-20">
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          {/* 성공 아이콘 */}
          <div className="text-green-500 text-6xl mb-6">✅</div>

          {/* 제목 */}
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            {isUsedHotel
              ? "중고 호텔 예약 완료!"
              : isDiningReservation
              ? "다이닝 예약 완료!"
              : "결제가 완료되었습니다"}
          </h1>

          {/* 설명 */}
          <p className="text-gray-600 mb-8">
            {isUsedHotel
              ? "중고 호텔 예약이 성공적으로 완료되었습니다. 예약 확인서가 이메일로 발송됩니다."
              : isDiningReservation
              ? "다이닝 예약이 성공적으로 완료되었습니다. 예약 확인서가 이메일로 발송됩니다."
              : "결제가 성공적으로 완료되었습니다. 예약 확인서가 이메일로 발송됩니다."}
          </p>

          {/* 데스크톱 카카오페이의 경우 백엔드가 반환한 QR URL 노출 */}
          {qrUrl && (
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                📱 예약 확인 QR 코드
              </h2>
              <p className="text-sm text-gray-600 mb-4">
                체크인 시 아래 QR 코드를 제시해주세요
              </p>
              <div className="bg-gray-50 p-4 rounded-lg inline-block border-2 border-gray-200">
                <img src={qrUrl} alt="예약 QR" className="w-48 h-48 mx-auto" />
              </div>
            </div>
          )}

          {/* 결제 정보 */}
          <div className="bg-gray-50 rounded-lg p-6 mb-8 text-left">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              결제 정보
            </h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">주문번호:</span>
                <span className="font-mono font-medium">
                  {result?.orderId || search.get("orderId")}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">결제금액:</span>
                <span className="font-semibold text-orange-600">
                  {amountFromResult
                    ? Number(amountFromResult).toLocaleString()
                    : search.get("amount")?.toLocaleString()}
                  원
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">결제일시:</span>
                <span>{new Date().toLocaleString("ko-KR")}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">이메일 발송:</span>
                <span className="text-green-600">✅ 발송 완료</span>
              </div>
              {receipt && (
                <div className="flex justify-between">
                  <span className="text-gray-600">영수증:</span>
                  <a
                    href={receipt}
                    className="text-blue-600 underline hover:text-blue-800"
                    target="_blank"
                    rel="noreferrer"
                  >
                    영수증 보기
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* 안내 메시지 */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
            <h3 className="font-semibold text-blue-900 mb-2">
              📧 예약 확인서 발송
            </h3>
            <p className="text-blue-800 text-sm">
              예약 확인서가 입력하신 이메일 주소로 발송됩니다. 호텔 체크인 시
              예약 확인서를 제시해주세요.
            </p>
          </div>

          <div className="flex gap-4 justify-center">
            <button
              onClick={() => router.push("/")}
              className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              홈으로
            </button>
            <button
              onClick={() => {
                // 예약 상세 페이지로 이동 (reservIdx가 있으면 해당 페이지로, 없으면 목록으로)
                if (result?.reservIdx) {
                  router.push(`/mypage/reservation/${result.reservIdx}`);
                } else {
                  router.push("/mypage");
                }
              }}
              className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              예약 내역 보기
            </button>
            <button
              onClick={() => setIsRouletteModalOpen(true)}
              disabled={hasRouletteSpun}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                hasRouletteSpun
                  ? "bg-gray-400 cursor-not-allowed text-white"
                  : "bg-blue-500 hover:bg-blue-600 text-white"
              }`}
            >
              {hasRouletteSpun ? "뽑기 완료" : "포인트 뽑기"}
            </button>
          </div>
        </div>
      </div>

      <Footer />

      {/* 룰렛 모달 */}
      <RouletteModal
        isOpen={isRouletteModalOpen}
        onClose={() => setIsRouletteModalOpen(false)}
        onSpinComplete={() => {
          setHasRouletteSpun(true);
          // 모달은 열린 상태로 유지, 사용자가 닫기 버튼을 눌러야 닫힘
        }}
      />
    </div>
  );
};

const SuccessPage = () => {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex flex-col">
          <Header />
          <div className="flex-1 flex items-center justify-center py-20">
            <div className="text-center max-w-md px-4">
              <div className="relative mb-8">
                <div className="animate-spin rounded-full h-20 w-20 border-b-4 border-orange-600 mx-auto"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-orange-600 text-2xl">💳</div>
                </div>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                결제 정보를 불러오는 중...
              </h2>
              <p className="text-gray-600">잠시만 기다려주세요</p>
            </div>
          </div>
          <Footer />
        </div>
      }
    >
      <SuccessPageContent />
    </Suspense>
  );
};

export default SuccessPage;
