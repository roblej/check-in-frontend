"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

/**
 * 결제 완료 페이지
 * 결제 성공 후 최종 확인 및 안내를 제공합니다.
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

    if (!orderId || !paymentKey || !amount) {
      setError("필수 결제 정보가 없습니다.");
      setLoading(false);
      return;
    }

    // TODO: 실제 결제 정보를 백엔드에서 조회하는 API 호출 추가
    // TODO: 결제 완료 후 포인트 적립 알림 추가
    // TODO: 예약 확인서 다운로드 기능 추가

    // 결제 정보 설정
    setPaymentInfo({
      orderId,
      paymentKey,
      amount: parseInt(amount),
      qrUrl: `https://chart.googleapis.com/chart?chs=200x200&cht=qr&chl=${orderId}`,
      receiptUrl: `https://api.tosspayments.com/v1/payments/${paymentKey}/receipt`,
      approvedAt: new Date().toISOString(),
    });

    setLoading(false);
  }, [search]);

  if (loading) {
    return (
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
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-2xl mx-auto px-4 py-20">
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <div className="text-red-500 text-6xl mb-4">❌</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">오류 발생</h1>
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-4xl mx-auto px-4 py-20">
        <div className="bg-white rounded-lg shadow-sm p-8">
          {/* 성공 헤더 */}
          <div className="text-center mb-8">
            <div className="text-green-500 text-6xl mb-4">🎉</div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              결제가 완료되었습니다!
            </h1>
            <p className="text-gray-600">
              예약 확인서가 이메일로 발송되었습니다.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* 결제 정보 */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                결제 정보
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">주문번호</span>
                  <span className="font-mono font-medium text-gray-900">
                    {paymentInfo.orderId}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">결제금액</span>
                  <span className="font-semibold text-orange-600 text-lg">
                    ₩{paymentInfo.amount.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">결제일시</span>
                  <span className="text-gray-900">
                    {new Date(paymentInfo.approvedAt).toLocaleString("ko-KR")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">결제수단</span>
                  <span className="text-gray-900">카드</span>
                </div>
                <div className="pt-3 border-t">
                  <a
                    href={paymentInfo.receiptUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 underline"
                  >
                    영수증 보기 →
                  </a>
                </div>
              </div>
            </div>

            {/* QR 코드 */}
            <div className="bg-gray-50 rounded-lg p-6 text-center">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                예약 확인서
              </h2>
              <div className="bg-white p-4 rounded-lg inline-block">
                <img
                  src={paymentInfo.qrUrl}
                  alt="예약 QR 코드"
                  className="w-48 h-48 mx-auto"
                />
              </div>
              <p className="text-sm text-gray-600 mt-4">
                체크인 시 이 QR 코드를 제시해주세요
              </p>
            </div>
          </div>

          {/* 이메일 안내 */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-8">
            <div className="flex items-start">
              <div className="text-blue-500 text-2xl mr-3">📧</div>
              <div>
                <h3 className="font-semibold text-blue-900 mb-2">
                  예약 확인서 발송 완료
                </h3>
                <p className="text-blue-800 text-sm">
                  예약 확인서가 입력하신 이메일 주소로 발송되었습니다. 호텔
                  체크인 시 예약 확인서를 제시해주세요.
                </p>
              </div>
            </div>
          </div>

          {/* 액션 버튼들 */}
          <div className="flex flex-wrap gap-4 justify-center mt-8">
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
              onClick={() => router.push("/mypage")}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              마이페이지
            </button>
            <button
              onClick={() => {
                // TODO: 게이미피케이션 상자가 열리고 포인트 지급되는 기능 추가
                // TODO: 포인트 뽑기 결과에 따른 포인트 지급 로직 추가
                alert("포인트 뽑기! 🎯");
              }}
              className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
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

const PaymentCompletePage = () => {
  return (
    <Suspense fallback={
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
    }>
      <PaymentCompletePageContent />
    </Suspense>
  );
};

export default PaymentCompletePage;
