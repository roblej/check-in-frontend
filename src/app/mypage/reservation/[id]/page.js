"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  User,
  Phone,
  Mail,
  CreditCard,
  Home,
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { mypageAPI } from "@/lib/api/mypage";

export default function ReservationDetailPage() {
  const router = useRouter();
  const params = useParams();
  const reservationId = params.id;

  // 상태 관리
  const [reservation, setReservation] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // 예약 상세 정보 불러오기
  useEffect(() => {
    const loadReservationDetail = async () => {
      setIsLoading(true);
      try {
        console.log("📤 예약 상세 조회:", reservationId);

        // 백엔드 API 호출
        const data = await mypageAPI.getReservationDetail(reservationId);

        console.log("📥 받은 상세 데이터:", data);

        setReservation(data);
        setError(null);
      } catch (err) {
        console.error("❌ 예약 상세 조회 실패:", err);
        setError(
          err.response?.data?.message || "예약 정보를 불러올 수 없습니다."
        );
      } finally {
        setIsLoading(false);
      }
    };

    if (reservationId) {
      loadReservationDetail();
    }
  }, [reservationId]);

  // 숙박 일수 계산
  const calculateNights = (checkIn, checkOut) => {
    if (!checkIn || !checkOut) return 0;
    const start = new Date(checkIn.replace(/\./g, "-"));
    const end = new Date(checkOut.replace(/\./g, "-"));
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const isCancelled = reservation?.status === "취소완료";
  const totalPayment = reservation?.totalprice ?? 0;
  const cashUsed = reservation?.cashUsed ?? 0;
  const pointsUsed = reservation?.pointsUsed ?? 0;
  const refundAmount = reservation?.refundAmount ?? 0;
  const refundCash = reservation?.refundCash ?? 0;
  const refundPoint = reservation?.refundPoint ?? 0;
  const paymentLabel = isCancelled ? "총 결제금액" : "실제 결제 금액";
  const shouldShowRefund =
    reservation?.refundAmount !== null &&
    reservation?.refundAmount !== undefined;

  // 로딩 중
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex justify-center items-center py-20">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="ml-3 text-gray-600">예약 정보를 불러오는 중...</span>
        </div>
        <Footer />
      </div>
    );
  }

  // 에러 발생
  if (error || !reservation) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-600 mb-4">
              {error || "예약 정보를 찾을 수 없습니다."}
            </p>
            <button
              onClick={() => router.push("/mypage")}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              마이페이지로 돌아가기
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

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* 헤더 */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-gray-700" />
          </button>
          <h1 className="text-3xl font-bold text-gray-900">예약 상세 정보</h1>
        </div>

        {/* 예약 상태 카드 */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-gray-500 mb-1">예약번호</p>
              <p className="text-xl font-bold text-gray-900">
                {reservation.reservationNumber || `R${reservation.id}`}
              </p>
            </div>
            <span
              className={`px-4 py-2 text-sm font-medium rounded-full ${
                reservation.status === "예약확정"
                  ? "bg-blue-100 text-blue-700"
                  : reservation.status === "이용완료"
                  ? "bg-green-100 text-green-700"
                  : reservation.status === "취소완료"
                  ? "bg-red-100 text-red-700"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              {reservation.status}
            </span>
          </div>
        </div>

        {/* 호텔 정보 */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Home className="w-6 h-6 text-blue-600" />
            호텔 정보
          </h2>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-500">호텔명</p>
              <p className="text-lg font-bold text-gray-900">
                {reservation.hotelName}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                위치
              </p>
              <p className="text-gray-900">{reservation.location}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">객실 타입</p>
              <p className="text-gray-900">{reservation.roomType}</p>
            </div>
          </div>
        </div>

        {/* 예약 정보 */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Calendar className="w-6 h-6 text-blue-600" />
            예약 정보
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">체크인</p>
              <p className="text-lg font-medium text-gray-900">
                {reservation.checkIn}
              </p>
              <p className="text-sm text-gray-500">15:00 이후</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">체크아웃</p>
              <p className="text-lg font-medium text-gray-900">
                {reservation.checkOut}
              </p>
              <p className="text-sm text-gray-500">11:00 까지</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">숙박 일수</p>
              <p className="text-gray-900">
                {calculateNights(reservation.checkIn, reservation.checkOut)}박
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">투숙 인원</p>
              <p className="text-gray-900">{reservation.guest || 0}명</p>
            </div>
          </div>
        </div>

        {/* QR 코드 */}
        {reservation.qrUrl && reservation.status === "예약확정" && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="text-2xl">📱</span>
              예약 확인 QR 코드
            </h2>
            <div className="flex flex-col items-center">
              <p className="text-sm text-gray-600 mb-4 text-center">
                체크인 시 아래 QR 코드를 제시해주세요
              </p>
              <div className="bg-gray-50 p-4 rounded-lg border-2 border-gray-200">
                <img
                  src={reservation.qrUrl}
                  alt="예약 QR 코드"
                  className="w-48 h-48 mx-auto"
                />
              </div>
            </div>
          </div>
        )}

        {/* 결제 정보 */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-blue-600" />
            결제 정보
          </h2>
          <div className="space-y-3">
            <div className="border-t border-gray-200 pt-3 flex justify-between">
              <span className="text-lg font-bold text-gray-900">
                {paymentLabel}
              </span>
              <div className="text-right">
                <span className="text-2xl font-bold text-blue-600">
                  {totalPayment.toLocaleString()}원
                </span>
                {isCancelled && (
                  <p className="text-xs text-gray-500">
                    (캐시:{cashUsed.toLocaleString()}원 / 포인트:
                    {pointsUsed.toLocaleString()}원)
                  </p>
                )}
              </div>
            </div>
            {shouldShowRefund && (
              <div className="flex justify-between pt-3 border-t border-gray-200">
                <span className="text-gray-600">환불 금액</span>
                <div className="text-right">
                  <span className="text-red-600">
                    {refundAmount.toLocaleString()}원
                  </span>
                  {isCancelled && (
                    <p className="text-xs text-gray-500">
                      (캐시:{refundCash.toLocaleString()}원 / 포인트:
                      {refundPoint.toLocaleString()}원)
                    </p>
                  )}
                </div>
              </div>
            )}
            <div className="flex justify-between pt-3 border-t border-gray-200">
              <span className="text-gray-600">예약 일시</span>
              <span className="text-gray-900">{reservation.createdAt}</span>
            </div>
          </div>
        </div>

        {/* 액션 버튼 */}
        <div className="flex gap-3">
          <button
            onClick={() =>
              router.push(`/hotel/${reservation.contentId}?tab=location`)
            }
            className="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
          >
            호텔 위치 보기
          </button>
          {reservation.status === "예약확정" && (
            <button
              onClick={() => {
                if (confirm("예약을 취소하시겠습니까?")) {
                  router.push(`/mypage/reservation/${reservationId}/cancel`);
                }
              }}
              className="flex-1 px-6 py-3 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg font-medium transition-colors"
            >
              예약 취소
            </button>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
