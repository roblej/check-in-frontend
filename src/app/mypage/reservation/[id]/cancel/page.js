'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, AlertCircle, CheckCircle } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function CancelReservationPage() {
  const router = useRouter();
  const params = useParams();
  const reservationId = params.id;

  const [cancelReason, setCancelReason] = useState('');
  const [customReason, setCustomReason] = useState('');
  const [isCancelling, setIsCancelling] = useState(false);

  // 더미 예약 데이터
  const reservation = {
    id: reservationId,
    reservationNumber: 'RES202510001',
    hotelName: '그랜드 하얏트 서울',
    checkIn: '2025.10.20',
    checkOut: '2025.10.22',
    totalPrice: 400000,
    cancellationFee: 40000,
    refundAmount: 360000,
  };

  const cancelReasons = [
    '일정 변경',
    '다른 숙소 예약',
    '개인 사정',
    '가격 문제',
    '호텔 시설 불만족',
    '기타',
  ];

  const handleCancel = async () => {
    if (!cancelReason) {
      alert('취소 사유를 선택해주세요.');
      return;
    }

    if (cancelReason === '기타' && !customReason.trim()) {
      alert('취소 사유를 입력해주세요.');
      return;
    }

    setIsCancelling(true);

    // API 호출 시뮬레이션
    setTimeout(() => {
      alert('예약이 취소되었습니다.');
      router.push('/mypage');
    }, 1500);
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

        {/* 주의 사항 */}
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-start gap-3">
          <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-bold text-red-900 mb-1">예약 취소 전 확인하세요</h3>
            <ul className="text-sm text-red-800 space-y-1">
              <li>• 취소 수수료가 부과될 수 있습니다.</li>
              <li>• 체크인 3일 전까지는 무료 취소 가능합니다.</li>
              <li>• 취소 후에는 재예약이 필요합니다.</li>
            </ul>
          </div>
        </div>

        {/* 예약 정보 */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-4">예약 정보</h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">예약번호</span>
              <span className="font-medium text-gray-900">{reservation.reservationNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">호텔명</span>
              <span className="font-medium text-gray-900">{reservation.hotelName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">체크인</span>
              <span className="font-medium text-gray-900">{reservation.checkIn}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">체크아웃</span>
              <span className="font-medium text-gray-900">{reservation.checkOut}</span>
            </div>
          </div>
        </div>

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

          {cancelReason === '기타' && (
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

        {/* 환불 정보 */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-4">환불 정보</h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">결제 금액</span>
              <span className="text-gray-900">{reservation.totalPrice.toLocaleString()}원</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">취소 수수료</span>
              <span className="text-red-600">-{reservation.cancellationFee.toLocaleString()}원</span>
            </div>
            <div className="border-t border-gray-200 pt-3 flex justify-between">
              <span className="text-lg font-bold text-gray-900">환불 예정 금액</span>
              <span className="text-2xl font-bold text-blue-600">{reservation.refundAmount.toLocaleString()}원</span>
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-4">
            환불은 영업일 기준 3-5일 이내에 결제 수단으로 처리됩니다.
          </p>
        </div>

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
            disabled={isCancelling}
            className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isCancelling ? '취소 처리 중...' : '예약 취소하기'}
          </button>
        </div>
      </div>

      <Footer />
    </div>
  );
}

