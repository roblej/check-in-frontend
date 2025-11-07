"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, AlertCircle } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { mypageAPI } from "@/lib/api/mypage";

export default function CancelDiningReservationPage() {
  const router = useRouter();
  const params = useParams();
  const reservationId = params.id;

  const [cancelReason, setCancelReason] = useState("");
  const [customReason, setCustomReason] = useState("");
  const [isCancelling, setIsCancelling] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reservation, setReservation] = useState(null);
  const [refundInfo, setRefundInfo] = useState(null);

  // 예약 상세 불러오기 (백엔드 연동)
  useEffect(() => {
    let mounted = true;
    const fetchDetail = async () => {
      try {
        setLoading(true);
        setError("");
        const data = await mypageAPI.getDiningReservationDetailForCancel(reservationId);
        console.log("다이닝 예약 상세 정보:", data);
        console.log("환불 예상 정보:", {
          expectedRefundRate: data.expectedRefundRate,
          expectedRefundMessage: data.expectedRefundMessage,
          expectedPaymentRefund: data.expectedPaymentRefund,
          expectedCashRestore: data.expectedCashRestore,
          expectedPointRestore: data.expectedPointRestore,
          expectedTotalRefund: data.expectedTotalRefund,
        });
        if (mounted) setReservation(data);
      } catch (e) {
        if (mounted) setError("예약 정보를 불러오지 못했습니다.");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchDetail();
    return () => {
      mounted = false;
    };
  }, [reservationId]);

  const cancelReasons = useMemo(
    () => [
      "일정 변경",
      "다른 다이닝 예약",
      "개인 사정",
      "가격 문제",
      "다이닝 시설 불만족",
      "기타",
    ],
    []
  );

  const handleCancel = async () => {
    if (!cancelReason) {
      alert("취소 사유를 선택해주세요.");
      return;
    }

    if (cancelReason === "기타" && !customReason.trim()) {
      alert("취소 사유를 입력해주세요.");
      return;
    }

    setIsCancelling(true);

    try {
      const reason =
        cancelReason === "기타" ? customReason.trim() : cancelReason;
      const data = await mypageAPI.cancelDiningReservation(reservationId, reason);
      const payload = data.data || data;
      // 백엔드에서 받은 모든 환불 정보를 그대로 저장
      setRefundInfo({
        refundStatus: payload.refundStatus,
        refundRate: payload.refundRate,
        refundMessage: payload.refundMessage,
        refundTotalAmount: payload.refundTotalAmount,
        paymentRefund: payload.paymentRefund,
        refundCash: payload.refundCash,
        refundPoint: payload.refundPoint,
        cancelReason: payload.cancelReason,
      });
      // 예약 상태도 로컬에서 취소로 간주
      setReservation((prev) => ({ ...(prev || {}), status: 2 }));
      alert("예약 취소 완료");
      // 필요 시 마이페이지 목록으로 이동: router.push('/mypage')
    } catch (e) {
      alert("취소 실패");
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* 헤더 */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-gray-700" />
          </button>
          <h1 className="text-3xl font-bold text-gray-900">다이닝 예약 취소</h1>
        </div>

        {loading && (
          <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200 mb-6">
            불러오는 중...
          </div>
        )}
        {error && (
          <div className="bg-white rounded-2xl shadow-sm p-6 border border-red-200 text-red-700 mb-6">
            {error}
          </div>
        )}

        {/* 주의 사항 */}
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-start gap-3">
          <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-bold text-red-900 mb-1">
              다이닝 예약 취소 전 확인하세요
            </h3>
            <ul className="text-sm text-red-800 space-y-1">
              <li>• 취소 수수료가 부과될 수 있습니다.</li>
              <li>• 예약일 7일 전까지는 무료 취소 가능합니다.</li>
              <li>• 취소 후에는 재예약이 필요합니다.</li>
              <li>• 취소 시 정원이 자동으로 해제됩니다.</li>
            </ul>
          </div>
        </div>

        {/* 예약 정보 */}
        {reservation && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-4">예약 정보</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">예약번호</span>
                <span className="font-medium text-gray-900">
                  {reservation.orderNum ||
                    reservation.reservationNumber ||
                    `D-${reservationId}`}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">다이닝명/호텔명</span>
                <span className="font-medium text-gray-900">
                  {reservation.hotelTitle || reservation.hotelName || ""}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">예약 날짜</span>
                <span className="font-medium text-gray-900">
                  {reservation.checkIn || reservation.reservationDate || ""}
                </span>
              </div>
              {reservation.status === 2 && (
                <div className="flex justify-end">
                  <span className="px-2 py-1 text-xs rounded bg-gray-100 text-gray-700">
                    취소 완료
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 취소 사유 */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-4">취소 사유</h2>
          <div className="space-y-3">
            {cancelReasons.map((reason) => (
              <label
                key={reason}
                className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <input
                  type="radio"
                  name="cancelReason"
                  value={reason}
                  checked={cancelReason === reason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="text-gray-900">{reason}</span>
              </label>
            ))}
          </div>

          {cancelReason === "기타" && (
            <div className="mt-4">
              <textarea
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                placeholder="취소 사유를 입력해주세요"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows="4"
              />
            </div>
          )}
        </div>

        {/* 환불 정보 (취소 후 표시) */}
        {refundInfo && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-4">환불 정보</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">환불 상태</span>
                <span
                  className={
                    refundInfo.refundStatus === 1
                      ? "text-green-700"
                      : refundInfo.refundStatus === 2
                      ? "text-red-700"
                      : "text-gray-700"
                  }
                >
                  {refundInfo.refundStatus === 1
                    ? "환불 완료"
                    : refundInfo.refundStatus === 2
                    ? "환불 실패"
                    : "환불 진행중"}
                </span>
              </div>
              {refundInfo.refundMessage && (
                <div className="flex justify-between">
                  <span className="text-gray-600">환불 정책</span>
                  <span className="text-gray-900">
                    {refundInfo.refundMessage}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-600">환불 비율</span>
                <span className="text-gray-900">
                  {Math.round((refundInfo.refundRate || 0) * 100)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">결제 환불</span>
                <span className="text-gray-900 font-semibold">
                  {Number(refundInfo.paymentRefund || 0).toLocaleString()}원
                </span>
              </div>
              {refundInfo.refundCash > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">캐시 복원</span>
                  <span className="text-gray-900">
                    {Number(refundInfo.refundCash || 0).toLocaleString()}원
                  </span>
                </div>
              )}
              {refundInfo.refundPoint > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">포인트 복원</span>
                  <span className="text-gray-900">
                    {Number(refundInfo.refundPoint || 0).toLocaleString()}P
                  </span>
                </div>
              )}
              <div className="flex justify-between pt-2 border-t border-gray-200">
                <span className="text-gray-900 font-semibold">
                  총 환불 금액
                </span>
                <span className="text-blue-600 font-bold">
                  {Number(refundInfo.refundTotalAmount || 0).toLocaleString()}원
                </span>
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-4">
              환불은 영업일 기준 3-5일 이내에 결제 수단으로 처리됩니다.
            </p>
          </div>
        )}

        {/* 환불 예상 정보 (취소 전 표시) */}
        {reservation && !refundInfo && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xl font-bold text-gray-900">
                환불 예상 정보
              </h2>
              <span className="px-2 py-1 text-xs rounded bg-blue-100 text-blue-700">
                예상
              </span>
            </div>
            <div className="space-y-3">
              {reservation.expectedRefundMessage && (
                <div className="flex justify-between">
                  <span className="text-gray-600">환불 정책</span>
                  <span className="text-gray-900">
                    {reservation.expectedRefundMessage}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-600">결제금액 복구</span>
                <span className="text-gray-900 font-semibold">
                  {Number(
                    reservation.expectedPaymentRefund || 0
                  ).toLocaleString()}
                  원
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">캐시 복구</span>
                <span className="text-gray-900">
                  {Number(
                    reservation.expectedCashRestore || 0
                  ).toLocaleString()}
                  원
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">포인트 복구</span>
                <span className="text-gray-900">
                  {Number(
                    reservation.expectedPointRestore || 0
                  ).toLocaleString()}
                  P
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t border-gray-200">
                <span className="text-gray-900 font-semibold">총 복구</span>
                <span className="text-blue-600 font-bold">
                  {Number(
                    reservation.expectedTotalRefund || 0
                  ).toLocaleString()}
                  원
                </span>
              </div>
            </div>
          </div>
        )}

        {/* 액션 버튼 */}
        <div className="flex gap-3">
          <button
            onClick={() => router.back()}
            className="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
          >
            돌아가기
          </button>
          <button
            onClick={handleCancel}
            disabled={
              isCancelling ||
              loading ||
              !!(reservation && reservation.status === 2)
            }
            className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isCancelling
              ? "취소 처리 중..."
              : reservation && reservation.status === 2
              ? "이미 취소됨"
              : "예약 취소하기"}
          </button>
        </div>
      </div>

      <Footer />
    </div>
  );
}

