'use client';

import { useState } from 'react';
import { Calendar, User, CreditCard, Clock, X, FileText } from 'lucide-react';

const ReservationDetailModal = ({ reservation, onClose }) => {
  const [requestNote, setRequestNote] = useState('');

  if (!reservation) return null;

  const getStatusBadge = (status) => {
    switch (status) {
      case 0:
        return <span className="inline-flex px-3 py-1 text-sm font-semibold rounded-full bg-yellow-100 text-yellow-800">대기</span>;
      case 1:
        return <span className="inline-flex px-3 py-1 text-sm font-semibold rounded-full bg-green-100 text-green-800">확정</span>;
      case 2:
        return <span className="inline-flex px-3 py-1 text-sm font-semibold rounded-full bg-red-100 text-red-800">취소</span>;
      case 3:
        return <span className="inline-flex px-3 py-1 text-sm font-semibold rounded-full bg-gray-100 text-gray-800">노쇼</span>;
      default:
        return <span className="inline-flex px-3 py-1 text-sm font-semibold rounded-full bg-gray-100 text-gray-800">알 수 없음</span>;
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
      <div className="absolute inset-0 bg-opacity-50"></div>
      <div className="relative bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] flex flex-col">
        {/* 헤더 */}
        <div className="px-6 py-4 border-b flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">예약 상세 정보</h2>
            <p className="text-sm text-gray-600 mt-1">예약번호: {reservation.reservIdx}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* 본문 */}
        <div className="px-6 py-4 flex-1 overflow-y-auto">
          {/* 고객 정보 */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <User className="w-5 h-5 text-blue-600" />
              고객 정보
            </h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">이름</p>
                  <p className="text-base font-medium text-gray-900 mt-1">
                    {reservation.customer?.name || '정보 없음'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">연락처</p>
                  <p className="text-base font-medium text-gray-900 mt-1">
                    {reservation.customer?.phone || '정보 없음'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">예약 인원</p>
                  <p className="text-base font-medium text-gray-900 mt-1">
                    {reservation.guest}명
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">예약 상태</p>
                  <div className="mt-1">{getStatusBadge(reservation.status)}</div>
                </div>
              </div>
            </div>
          </div>

          {/* 객실 정보 */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              객실 정보
            </h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">객실명</p>
                  <p className="text-base font-medium text-gray-900 mt-1">
                    {reservation.room?.name || '정보 없음'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">객실 번호</p>
                  <p className="text-base font-medium text-gray-900 mt-1">
                    {reservation.roomIdx}호
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">기본 가격</p>
                  <p className="text-base font-medium text-gray-900 mt-1">
                    {reservation.room?.basePrice?.toLocaleString() || '0'}원
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">객실 상태</p>
                  <div className="mt-1">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      reservation.room?.status === 1 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {reservation.room?.status === 1 ? '사용 가능' : '사용 불가'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 숙박 일정 */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              숙박 일정
            </h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    체크인
                  </p>
                  <p className="text-base font-medium text-gray-900 mt-1">
                    {reservation.checkinDate || '정보 없음'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    체크아웃
                  </p>
                  <p className="text-base font-medium text-gray-900 mt-1">
                    {reservation.checkoutDate || '정보 없음'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 결제 정보 */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-blue-600" />
              결제 정보
            </h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">총 결제금액</p>
                <p className="text-lg font-bold text-gray-900">
                  ₩{reservation.totalPrice?.toLocaleString() || '0'}
                </p>
              </div>
            </div>
          </div>

          {/* 요청사항 */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              요청사항
            </h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <textarea
                value={requestNote}
                onChange={(e) => setRequestNote(e.target.value)}
                placeholder="요청사항을 입력하세요 (저장 기능은 추후 구현 예정)"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows={4}
                disabled
              />
              <p className="text-xs text-gray-500 mt-2">
                ※ 요청사항 저장 기능은 추후 업데이트 예정입니다.
              </p>
            </div>
          </div>
        </div>

        {/* 푸터 */}
        <div className="px-6 py-4 border-t bg-gray-50 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            닫기
          </button>
          <button
            className="px-4 py-2 text-sm font-medium text-red-600 bg-white border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
            onClick={() => {
              // TODO: 예약 취소 로직 구현
              alert('예약 취소 기능은 추후 구현 예정입니다.');
            }}
          >
            예약 취소
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReservationDetailModal;

