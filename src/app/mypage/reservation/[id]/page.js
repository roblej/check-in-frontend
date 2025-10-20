'use client';

import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Calendar, MapPin, User, Phone, Mail, CreditCard, Home } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function ReservationDetailPage() {
  const router = useRouter();
  const params = useParams();
  const reservationId = params.id;

  // 더미 예약 상세 데이터
  const reservation = {
    id: reservationId,
    reservationNumber: 'RES202510001',
    hotelName: '그랜드 하얏트 서울',
    hotelAddress: '서울특별시 용산구 이태원로 322',
    location: '서울 강남구',
    checkIn: '2025.10.20',
    checkInTime: '15:00',
    checkOut: '2025.10.22',
    checkOutTime: '11:00',
    nights: 2,
    roomType: '디럭스 트윈',
    roomCount: 1,
    guestCount: 2,
    price: 450000,
    discount: 50000,
    totalPrice: 400000,
    status: '예약확정',
    paymentMethod: '신용카드',
    paymentDate: '2025.10.15',
    guestName: '홍길동',
    guestPhone: '010-1234-5678',
    guestEmail: 'gildong@example.com',
    specialRequest: '높은 층 객실 요청',
  };

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
              <p className="text-xl font-bold text-gray-900">{reservation.reservationNumber}</p>
            </div>
            <span className="px-4 py-2 bg-blue-100 text-blue-700 text-sm font-medium rounded-full">
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
              <p className="text-lg font-bold text-gray-900">{reservation.hotelName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                주소
              </p>
              <p className="text-gray-900">{reservation.hotelAddress}</p>
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
              <p className="text-lg font-medium text-gray-900">{reservation.checkIn}</p>
              <p className="text-sm text-gray-500">{reservation.checkInTime} 이후</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">체크아웃</p>
              <p className="text-lg font-medium text-gray-900">{reservation.checkOut}</p>
              <p className="text-sm text-gray-500">{reservation.checkOutTime} 까지</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">숙박 일수</p>
              <p className="text-gray-900">{reservation.nights}박</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">객실 수</p>
              <p className="text-gray-900">{reservation.roomCount}개</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">투숙 인원</p>
              <p className="text-gray-900">{reservation.guestCount}명</p>
            </div>
          </div>
          {reservation.specialRequest && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-gray-500 mb-1">특별 요청사항</p>
              <p className="text-gray-900">{reservation.specialRequest}</p>
            </div>
          )}
        </div>

        {/* 투숙객 정보 */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <User className="w-6 h-6 text-blue-600" />
            투숙객 정보
          </h2>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <User className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">이름</p>
                <p className="text-gray-900">{reservation.guestName}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">연락처</p>
                <p className="text-gray-900">{reservation.guestPhone}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">이메일</p>
                <p className="text-gray-900">{reservation.guestEmail}</p>
              </div>
            </div>
          </div>
        </div>

        {/* 결제 정보 */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-blue-600" />
            결제 정보
          </h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">객실 요금</span>
              <span className="text-gray-900">{reservation.price.toLocaleString()}원</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">할인</span>
              <span className="text-red-600">-{reservation.discount.toLocaleString()}원</span>
            </div>
            <div className="border-t border-gray-200 pt-3 flex justify-between">
              <span className="text-lg font-bold text-gray-900">총 결제금액</span>
              <span className="text-2xl font-bold text-blue-600">{reservation.totalPrice.toLocaleString()}원</span>
            </div>
            <div className="flex justify-between pt-3 border-t border-gray-200">
              <span className="text-gray-600">결제 수단</span>
              <span className="text-gray-900">{reservation.paymentMethod}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">결제 일시</span>
              <span className="text-gray-900">{reservation.paymentDate}</span>
            </div>
          </div>
        </div>

        {/* 액션 버튼 */}
        <div className="flex gap-3">
          <button
            onClick={() => router.push(`/hotel/${reservation.id}?tab=location`)}
            className="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
          >
            호텔 위치 보기
          </button>
          <button
            onClick={() => {
              if (confirm('예약을 취소하시겠습니까?')) {
                router.push(`/mypage/reservation/${reservationId}/cancel`);
              }
            }}
            className="flex-1 px-6 py-3 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg font-medium transition-colors"
          >
            예약 취소
          </button>
        </div>
      </div>

      <Footer />
    </div>
  );
}

