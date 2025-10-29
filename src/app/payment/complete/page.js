"use client";

import { useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

/**
 * 결제 완료 리다이렉트 페이지
 * /checkout/success로 즉시 리다이렉트합니다.
 */
const PaymentCompletePageContent = () => {
  const search = useSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [paymentInfo, setPaymentInfo] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const orderId = search.get("orderId");
    const paymentKey = search.get("paymentKey");
    const amount = search.get("amount");
    const type = search.get("type") || "hotel_reservation";

    if (!orderId || !paymentKey || !amount) {
      router.replace("/");
      return;
    }

    // 즉시 checkout/success로 리다이렉트
    const params = new URLSearchParams({
      orderId,
      paymentKey,
      amount,
      type,
    });
    router.replace(`/checkout/success?${params.toString()}`);
  }, [search, router]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-orange-600 mx-auto mb-6"></div>
        <p className="text-gray-600 text-lg font-medium">페이지 이동 중...</p>
      </div>
    </div>
  );
};

const PaymentCompletePage = () => {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-orange-600 mx-auto mb-6"></div>
            <p className="text-gray-600 text-lg font-medium">
              페이지 이동 중...
            </p>
          </div>
        </div>
      }
    >
      <PaymentCompletePageContent />
    </Suspense>
  );
};

export default PaymentCompletePage;
