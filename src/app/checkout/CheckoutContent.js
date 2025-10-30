"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { loadTossPayments } from "@tosspayments/payment-sdk";
import { usePaymentStore } from "@/stores/paymentStore";
import axios from "@/lib/axios";

const KRW = (v) => new Intl.NumberFormat("ko-KR").format(v || 0);

const CheckoutContent = ({ searchParams }) => {
  const router = useRouter();
  const { paymentDraft, loadFromStorage, getRemainingMs, clearPaymentDraft } =
    usePaymentStore();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  const draft = useMemo(() => {
    // Allow passing minimal info via query if no draft
    if (paymentDraft) return paymentDraft;
    const q = Object.fromEntries(searchParams?.entries?.() || []);
    if (!q || !q.contentId) return null;
    return {
      orderId: q.orderId || `order_${Date.now()}`,
      orderName: q.name || `객실결제:${q.contentId}`,
      customerId: q.customerId || "guest",
      email: q.email || "",
      finalAmount: Number(q.amount || 0),
      meta: q,
    };
  }, [paymentDraft, searchParams]);

  const remaining = getRemainingMs();
  const minutes = Math.floor(remaining / 60000);
  const seconds = Math.floor((remaining % 60000) / 1000);

  const handlePay = async () => {
    if (!draft) {
      setError("결제 정보가 없습니다.");
      return;
    }
    if (remaining <= 0) {
      setError("결제 가능 시간이 만료되었습니다. 다시 시도해주세요.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      // 일반 호텔 결제에만 락 시도 (중고/다이닝 제외)
      const reservationType = draft.meta?.type || "hotel_reservation";
      if (reservationType === "hotel_reservation") {
        const roomId = draft.meta?.roomId;
        const checkIn = draft.meta?.checkIn;
        if (!roomId || !checkIn) {
          setLoading(false);
          setError(
            "객실 정보가 올바르지 않습니다. 처음부터 다시 시도해주세요."
          );
          alert("객실 정보가 올바르지 않습니다. 처음부터 다시 시도해주세요.");
          return;
        }
        try {
          // Proxy through Next.js API → backend
          await axios.post(`/payments/lock`, {
            roomId: String(roomId),
            checkIn: String(checkIn),
          });
        } catch (err) {
          const status = err?.response?.status;
          if (status === 409) {
            const msg = "이미 다른 사용자가 결제 진행중입니다.";
            setError(msg);
            alert(msg);
          } else {
            const msg =
              "결제 잠금 처리에 실패했습니다. 잠시 후 다시 시도해주세요.";
            setError(msg);
            alert(msg);
          }
          setLoading(false);
          return;
        }
      }

      const clientKey = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY;
      if (!clientKey) throw new Error("Toss client key 미설정");
      const tossPayments = await loadTossPayments(clientKey);

      // successUrl에 type 파라미터 추가 (위에서 계산됨)

      await tossPayments.requestPayment("카드", {
        amount: draft.finalAmount,
        orderId: draft.orderId,
        orderName: draft.orderName,
        customerEmail: draft.email,
        customerName: draft.customerId,
        successUrl: `${window.location.origin}/checkout/success?type=${reservationType}`,
        failUrl: `${window.location.origin}/checkout/fail`,
      });
    } catch (e) {
      setError(e?.message || "결제 요청 중 오류가 발생했습니다.");
      setLoading(false);
    }
  };

  if (!draft) {
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded">
        결제 정보가 없습니다.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="p-4 bg-white rounded border">
        <div className="flex items-center justify-between mb-2">
          <span className="text-gray-600">주문명</span>
          <span className="font-medium">{draft.orderName}</span>
        </div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-gray-600">결제금액</span>
          <span className="text-xl font-bold text-blue-600">
            ₩{KRW(draft.finalAmount)}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-600">유효시간</span>
          <span className="font-medium">
            {minutes}:{seconds.toString().padStart(2, "0")}
          </span>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded">
          {error}
        </div>
      )}

      <div className="flex gap-2">
        <button
          onClick={handlePay}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white px-5 py-3 rounded font-medium"
        >
          {loading ? "결제 요청 중..." : "Toss로 결제하기"}
        </button>
        <button
          onClick={() => {
            // 일반 호텔 취소 시 락 해제 시도 (실패 무시)
            try {
              if (draft?.meta?.type === "hotel_reservation") {
                const roomId = draft?.meta?.roomId;
                const checkIn = draft?.meta?.checkIn;
                if (roomId && checkIn) {
                  axios
                    .post(`/payments/unlock`, {
                      roomId: String(roomId),
                      checkIn: String(checkIn),
                    })
                    .catch(() => {});
                }
              }
            } catch (_) {}
            clearPaymentDraft();
            router.push("/");
          }}
          className="border px-5 py-3 rounded font-medium"
        >
          취소
        </button>
      </div>
    </div>
  );
};

export default CheckoutContent;
