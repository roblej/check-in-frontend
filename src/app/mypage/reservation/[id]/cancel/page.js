"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, AlertCircle } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import axios from "@/lib/axios";

export default function CancelReservationPage() {
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
  const computeRefundRate = (checkinStr) => {
    if (!checkinStr) return 0;
    try {
      const today = new Date();
      const checkin = new Date(checkinStr);
      const ms = checkin.setHours(0, 0, 0, 0) - today.setHours(0, 0, 0, 0);
      const days = Math.ceil(ms / (1000 * 60 * 60 * 24));
      if (days >= 7) return 1.0;
      if (days >= 3) return 0.5;
      if (days >= 1) return 0.3;
      return 0.0;
    } catch {
      return 0;
    }
  };
  const breakdown = useMemo(() => {
    const totalPrice = Number(reservation?.totalPrice || 0);
    const couponDiscount = Number(reservation?.couponDiscount || 0);
    const afterCoupon = Math.max(0, totalPrice - couponDiscount);

    if (refundInfo) {
      const refundRate = Number(refundInfo.refundRate || 0);
      const refundTotal = Number(refundInfo.refundTotalAmount || 0);
      const refundPoint = Number(refundInfo.refundPoint || 0);
      const refundCash = Number(refundInfo.refundCash || 0);
      const originalPointUsed =
        refundRate > 0 ? Math.round(refundPoint / refundRate) : 0;
      const originalCashUsed =
        refundRate > 0 ? Math.round(refundCash / refundRate) : 0;
      const originalPcUsed = originalPointUsed + originalCashUsed;
      const refundCardAmount = Math.max(
        0,
        refundTotal - refundPoint - refundCash
      );
      const originalCardPaid =
        refundRate > 0 ? Math.round(refundCardAmount / refundRate) : 0;
      const totalBackToCustomer = refundCardAmount + refundPoint + refundCash;
      return {
        mode: "final",
        totalPrice,
        couponDiscount,
        afterCoupon,
        originalPointUsed,
        originalCashUsed,
        originalPcUsed,
        originalCardPaid,
        refundRate,
        refundCardAmount,
        refundPoint,
        refundCash,
        totalBackToCustomer,
      };
    }

    const pointsUsed = Number(reservation?.pointsUsed || 0);
    const cashUsed = Number(reservation?.cashUsed || 0);
    const originalPcUsed = pointsUsed + cashUsed;
    const originalCardPaid = Math.max(0, afterCoupon - originalPcUsed);
    const policyRate = computeRefundRate(
      reservation?.checkIn || reservation?.checkinDate
    );
    const refundCardAmount = Math.round(originalCardPaid * policyRate);
    const totalBackToCustomer = refundCardAmount + pointsUsed + cashUsed;
    return {
      mode: "predicted",
      totalPrice,
      couponDiscount,
      afterCoupon,
      originalPointUsed: pointsUsed,
      originalCashUsed: cashUsed,
      originalPcUsed,
      originalCardPaid,
      refundRate: policyRate,
      refundCardAmount,
      refundPoint: pointsUsed,
      refundCash: cashUsed,
      totalBackToCustomer,
    };
  }, [refundInfo, reservation]);

  // 예약 상세 불러오기 (백엔드 연동)
  useEffect(() => {
    let mounted = true;
    const fetchDetail = async () => {
      try {
        setLoading(true);
        setError("");
        const res = await axios.get(`/reservations/${reservationId}/detail`);
        // 백엔드 DTO에 맞춰 필드 매핑 (orderNum 사용)
        const data = res?.data || {};
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
      "다른 숙소 예약",
      "개인 사정",
      "가격 문제",
      "호텔 시설 불만족",
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
      const res = await axios.post(`/reservations/${reservationId}/cancel`, {
        cancelReason: reason,
      });
      const data = res?.data || {};
      const payload = data.data || data;
      setRefundInfo({
        refundStatus: payload.refundStatus,
        refundRate: payload.refundRate,
        refundTotalAmount: payload.refundTotalAmount,
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
          <h1 className="text-3xl font-bold text-gray-900">예약 취소</h1>
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
              예약 취소 전 확인하세요
            </h3>
            <ul className="text-sm text-red-800 space-y-1">
              <li>• 취소 수수료가 부과될 수 있습니다.</li>
              <li>• 체크인 3일 전까지는 무료 취소 가능합니다.</li>
              <li>• 취소 후에는 재예약이 필요합니다.</li>
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
                    `RES-${reservationId}`}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">호텔명</span>
                <span className="font-medium text-gray-900">
                  {reservation.hotelName || reservation.hotelTitle || ""}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">체크인</span>
                <span className="font-medium text-gray-900">
                  {reservation.checkIn || reservation.checkinDate || ""}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">체크아웃</span>
                <span className="font-medium text-gray-900">
                  {reservation.checkOut || reservation.checkoutDate || ""}
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
              <div className="flex justify-between">
                <span className="text-gray-600">환불 비율</span>
                <span className="text-gray-900">
                  {Math.round((refundInfo.refundRate || 0) * 100)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">환불 금액</span>
                <span className="text-gray-900">
                  {Number(refundInfo.refundTotalAmount || 0).toLocaleString()}원
                </span>
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-4">
              환불은 영업일 기준 3-5일 이내에 결제 수단으로 처리됩니다.
            </p>
          </div>
        )}

        {breakdown && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              환불 계산식
            </h2>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-600 border-b">
                    <th className="py-2 pr-4">단계</th>
                    <th className="py-2 pr-4">항목</th>
                    <th className="py-2 pr-4">계산식</th>
                    <th className="py-2">결과</th>
                  </tr>
                </thead>
                <tbody className="text-gray-900">
                  <tr className="border-b">
                    <td className="py-2 pr-4">①</td>
                    <td className="py-2 pr-4">결제 총액</td>
                    <td className="py-2 pr-4">—</td>
                    <td className="py-2">
                      {breakdown.totalPrice.toLocaleString()}원
                    </td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 pr-4">②</td>
                    <td className="py-2 pr-4">쿠폰 제외</td>
                    <td className="py-2 pr-4">
                      {breakdown.totalPrice.toLocaleString()} -{" "}
                      {breakdown.couponDiscount.toLocaleString()}
                    </td>
                    <td className="py-2">
                      {breakdown.afterCoupon.toLocaleString()}원
                    </td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 pr-4">③</td>
                    <td className="py-2 pr-4">포인트·캐시 사용 금액</td>
                    <td className="py-2 pr-4">
                      {breakdown.originalPointUsed.toLocaleString()}P +{" "}
                      {breakdown.originalCashUsed.toLocaleString()}C
                    </td>
                    <td className="py-2">
                      {breakdown.originalPcUsed.toLocaleString()}
                    </td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 pr-4">④</td>
                    <td className="py-2 pr-4">Toss 결제 금액 (실 결제)</td>
                    <td className="py-2 pr-4">
                      {breakdown.afterCoupon.toLocaleString()} -{" "}
                      {breakdown.originalPcUsed.toLocaleString()}
                    </td>
                    <td className="py-2">
                      {breakdown.originalCardPaid.toLocaleString()}원
                    </td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 pr-4">⑤</td>
                    <td className="py-2 pr-4">
                      환불 금액 ({Math.round(breakdown.refundRate * 100)}%)
                    </td>
                    <td className="py-2 pr-4">
                      {breakdown.originalCardPaid.toLocaleString()} ×{" "}
                      {breakdown.refundRate}
                    </td>
                    <td className="py-2">
                      {breakdown.refundCardAmount.toLocaleString()}원
                    </td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 pr-4">⑥</td>
                    <td className="py-2 pr-4">포인트 복원</td>
                    <td className="py-2 pr-4">—</td>
                    <td className="py-2">
                      {breakdown.refundPoint.toLocaleString()}P
                    </td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 pr-4">⑦</td>
                    <td className="py-2 pr-4">캐시 복원</td>
                    <td className="py-2 pr-4">—</td>
                    <td className="py-2">
                      {breakdown.refundCash.toLocaleString()}C
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-4">⑧</td>
                    <td className="py-2 pr-4">총 고객 회수액</td>
                    <td className="py-2 pr-4">
                      현금 {breakdown.refundCardAmount.toLocaleString()} +
                      포인트 {breakdown.refundPoint.toLocaleString()} + 캐시{" "}
                      {breakdown.refundCash.toLocaleString()}
                    </td>
                    <td className="py-2 font-semibold">
                      {breakdown.totalBackToCustomer.toLocaleString()}원
                    </td>
                  </tr>
                </tbody>
              </table>
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
