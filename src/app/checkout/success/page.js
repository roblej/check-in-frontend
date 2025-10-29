"use client";

import { useEffect, useRef, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const SuccessPageContent = () => {
  const search = useSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  const isProcessingRef = useRef(false);

  useEffect(() => {
    const doConfirm = async () => {
      const paymentKey = search.get("paymentKey");
      const orderId = search.get("orderId");
      const amount = search.get("amount");
      const type = search.get("type");

      // 클라이언트 가드: 동일 주문의 중복 처리 방지 (StrictMode, 중복 방문 등)
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
      if (isNaN(amountNum)) {
        setError("금액이 올바르지 않습니다.");
        setLoading(false);
        return;
      }

      // 중고 호텔의 경우 이미 UsedPaymentForm에서 API 호출 완료
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
        const res = await fetch("/api/payments", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            paymentKey,
            orderId,
            amount: amountNum,
            type,
          }),
        });

        if (!res.ok) {
          const errorText = await res.text();
          throw new Error("결제 처리 실패");
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
  }, [search]);

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

  const qrUrl = result?.qrUrl;
  const receipt = result?.receiptUrl;
  const isUsedHotel = search.get("type") === "used_hotel";
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
            {isUsedHotel ? "중고 호텔 예약 완료!" : "결제가 완료되었습니다"}
          </h1>

          {/* 설명 */}
          <p className="text-gray-600 mb-8">
            {isUsedHotel
              ? "중고 호텔 예약이 성공적으로 완료되었습니다. 예약 확인서가 이메일로 발송됩니다."
              : "결제가 성공적으로 완료되었습니다. 예약 확인서가 이메일로 발송됩니다."}
          </p>

          {/* QR 코드 */}
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

          {/* 버튼들 */}
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => router.push("/")}
              className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              홈으로
            </button>
            <button
              onClick={() => router.push("/orders")}
              className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              주문 내역
            </button>
            <button
              onClick={() => alert("포인트 뽑기! 🎯")}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              포인트 뽑기
            </button>
          </div>
        </div>
      </div>

      <Footer />
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
