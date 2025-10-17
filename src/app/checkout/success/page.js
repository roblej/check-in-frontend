"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

const SuccessPage = () => {
  const search = useSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  useEffect(() => {
    const doConfirm = async () => {
      const paymentKey = search.get("paymentKey");
      const orderId = search.get("orderId");
      const amount = Number(search.get("amount"));
      if (!paymentKey || !orderId || !amount) {
        setError("필수 결제 파라미터가 없습니다.");
        setLoading(false);
        return;
      }
      try {
        const res = await fetch("/api/payments", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ paymentKey, orderId, amount }),
        });
        if (!res.ok) throw new Error("결제 처리 실패");
        const data = await res.json();
        setResult(data);
      } catch (e) {
        setError(e?.message || "서버 오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    };
    doConfirm();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) return <div className="p-6">처리 중...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;

  const qrUrl = result?.qrUrl;
  const receipt = result?.receiptUrl;

  return (
    <div className="max-w-[720px] mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-4">결제가 완료되었습니다.</h1>
      {qrUrl && (
        <div className="p-4 bg-white rounded border inline-block mb-4">
          <img src={qrUrl} alt="예약 QR" className="w-48 h-48" />
        </div>
      )}
      <div className="space-y-2 mb-6">
        <div>
          주문번호: <span className="font-mono">{result?.orderId}</span>
        </div>
        {receipt && (
          <div>
            영수증:{" "}
            <a
              href={receipt}
              className="text-blue-600 underline"
              target="_blank"
              rel="noreferrer"
            >
              열기
            </a>
          </div>
        )}
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => router.push("/")}
          className="border px-4 py-2 rounded"
        >
          홈으로
        </button>
        <button
          onClick={() => alert("포인트 뽑기! 🎯")}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          포인트 뽑기
        </button>
      </div>
    </div>
  );
};

export default SuccessPage;
