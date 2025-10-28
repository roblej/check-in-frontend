"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const SuccessPageContent = () => {
  const search = useSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  useEffect(() => {
    const doConfirm = async () => {
      const paymentKey = search.get("paymentKey");
      const orderId = search.get("orderId");
      const amount = search.get("amount");
      const type = search.get("type");

      console.log("Success page params:", {
        paymentKey,
        orderId,
        amount,
        type,
      });

      if (!paymentKey || !orderId || !amount) {
        console.error("필수 파라미터 누락:", { paymentKey, orderId, amount });
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
          console.error("결제 검증 실패:", errorText);
          throw new Error("결제 처리 실패");
        }

        const data = await res.json();
        console.log("결제 검증 성공:", data);
        setResult(data);
      } catch (e) {
        console.error("결제 검증 오류:", e);
        setError(e?.message || "서버 오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    };
    doConfirm();
  }, [search]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
            <p className="text-gray-600">결제 처리 중...</p>
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
        <div className="min-h-screen bg-gray-50">
          <Header />
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
              <p className="text-gray-600">결제 정보를 불러오는 중...</p>
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
