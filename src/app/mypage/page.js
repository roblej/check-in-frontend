'use client';

import { useState } from 'react';
import { 
  Calendar, Heart, MapPin, Gift, FileText, User, 
  MessageSquare, ChevronRight, Star, Clock, Check, X,
  CreditCard, Edit, Trash2, Share2, Hotel
} from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function MyPage() {
  // 탭 상태 관리
  const [reservationTab, setReservationTab] = useState('upcoming'); // upcoming, completed, cancelled
  const [couponTab, setCouponTab] = useState('available'); // available, used, expired
  const [reviewTab, setReviewTab] = useState('writable'); // writable, written

  // 더미 데이터
  const reservations = {
    upcoming: [
      {
        id: 1,
        hotelName: '그랜드 하얏트 서울',
        location: '서울 강남구',
        checkIn: '2025.10.20',
        checkOut: '2025.10.22',
        roomType: '디럭스 트윈',
        price: 450000,
        status: '예약확정'
      },
      {
        id: 2,
        hotelName: '신라호텔 제주',
        location: '제주 제주시',
        checkIn: '2025.11.05',
        checkOut: '2025.11.07',
        roomType: '오션뷰 킹',
        price: 380000,
        status: '예약확정'
      }
    ],
    completed: [
      {
        id: 3,
        hotelName: '롯데호텔 부산',
        location: '부산 해운대구',
        checkIn: '2025.09.15',
        checkOut: '2025.09.17',
        roomType: '스탠다드 더블',
        price: 280000,
        status: '이용완료'
      }
    ],
    cancelled: [
      {
        id: 4,
        hotelName: '파크 하얏트 서울',
        location: '서울 용산구',
        checkIn: '2025.10.01',
        checkOut: '2025.10.03',
        roomType: '디럭스 킹',
        price: 420000,
        status: '취소완료',
        refundAmount: 378000
      }
    ]
  };

  const coupons = {
    available: [
      { id: 1, name: '신규가입 웰컴 쿠폰', discount: '10%', condition: '최소 10만원 이상 예약시', expiry: '2025.12.31' },
      { id: 2, name: '가을 시즌 특별 할인', discount: '50,000원', condition: '제주도 호텔 한정', expiry: '2025.11.30' },
      { id: 3, name: 'VIP 회원 전용 쿠폰', discount: '15%', condition: '전 호텔 사용 가능', expiry: '2025.12.31' }
    ],
    used: [
      { id: 4, name: '여름 시즌 쿠폰', discount: '30,000원', condition: '전 호텔', usedDate: '2025.09.15' }
    ],
    expired: [
      { id: 5, name: '추석 연휴 특가', discount: '20%', condition: '최소 20만원 이상', expiry: '2025.09.30' }
    ]
  };

  const writableReviews = [
    {
      id: 1,
      hotelName: '롯데호텔 부산',
      location: '부산 해운대구',
      checkOutDate: '2025.09.17',
      daysLeft: 23
    }
  ];

  const writtenReviews = [
    {
      id: 1,
      hotelName: '파크 하얏트 부산',
      location: '부산 해운대구',
      rating: 5,
      content: '정말 훌륭한 호텔이었습니다. 직원분들이 친절하시고 조식도 맛있었어요.',
      date: '2025.09.10',
      helpful: 12
    }
  ];

  const likedHotels = [
    { id: 1, name: '스카이 파크 센트럴', location: '명동·남산', price: 140000, rating: 4.8 },
    { id: 2, name: '제주 호텔 리스텔', location: '제주시', price: 98000, rating: 4.5 },
    { id: 3, name: '강남 그랜드 호텔', location: '강남·서초', price: 185000, rating: 4.9 }
  ];

  const recentHotels = [
    { id: 1, name: '나인브릿지 바이...', location: '제주·서귀포', viewDate: '2025.10.14', price: 420000 },
    { id: 2, name: '호텔 현대바이...', location: '속초', viewDate: '2025.10.13', price: 180000 }
  ];

  const inquiries = [
    {
      id: 1,
      title: '예약 변경 문의',
      date: '2025.10.10',
      status: '답변완료',
      answer: '예약 변경은 체크인 3일 전까지 가능합니다.'
    },
    {
      id: 2,
      title: '결제 오류 문의',
      date: '2025.09.28',
      status: '답변완료',
      answer: '결제가 정상적으로 처리되었습니다.'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* 프로필 헤더 */}
        <section className="bg-white rounded-2xl shadow-lg p-8 mb-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
                <User className="w-10 h-10 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-1">홍길동님</h1>
                <p className="text-sm text-gray-500">gildong@example.com</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">VIP 회원</span>
                  <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">포인트: 15,000P</span>
                </div>
              </div>
            </div>
            <button className="flex items-center gap-2 px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors font-medium">
              <Edit className="w-4 h-4" />
              <span>개인정보 수정</span>
            </button>
          </div>
        </section>

        {/* 예약 내역 */}
        <section className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Calendar className="w-6 h-6 text-blue-600" />
              예약 내역
            </h2>
          </div>

          {/* 탭 */}
          <div className="flex gap-2 mb-6 border-b border-gray-200">
            <button
              onClick={() => setReservationTab('upcoming')}
              className={`px-6 py-3 font-medium transition-all border-b-2 ${
                reservationTab === 'upcoming'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              이용 예정 ({reservations.upcoming.length})
            </button>
            <button
              onClick={() => setReservationTab('completed')}
              className={`px-6 py-3 font-medium transition-all border-b-2 ${
                reservationTab === 'completed'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              이용 완료 ({reservations.completed.length})
            </button>
            <button
              onClick={() => setReservationTab('cancelled')}
              className={`px-6 py-3 font-medium transition-all border-b-2 ${
                reservationTab === 'cancelled'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              취소/환불 ({reservations.cancelled.length})
            </button>
          </div>

          {/* 예약 카드 */}
          <div className="space-y-4">
            {reservations[reservationTab].map((reservation) => (
              <div key={reservation.id} className="border border-gray-200 rounded-xl p-5 hover:shadow-md transition-all">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1">{reservation.hotelName}</h3>
                    <p className="text-sm text-gray-500 flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {reservation.location}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    reservation.status === '예약확정' ? 'bg-blue-100 text-blue-700' :
                    reservation.status === '이용완료' ? 'bg-green-100 text-green-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {reservation.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                  <div>
                    <span className="text-gray-500">체크인</span>
                    <p className="font-medium text-gray-900">{reservation.checkIn}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">체크아웃</span>
                    <p className="font-medium text-gray-900">{reservation.checkOut}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">객실타입</span>
                    <p className="font-medium text-gray-900">{reservation.roomType}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">총 결제금액</span>
                    <p className="font-bold text-blue-600">{reservation.price.toLocaleString()}원</p>
                  </div>
                </div>

                {/* 액션 버튼 */}
                <div className="flex gap-2">
                  {reservationTab === 'upcoming' && (
                    <>
                      <button className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors">
                        예약 상세보기
                      </button>
                      <button className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors">
                        호텔 위치보기
                      </button>
                      <button className="flex-1 px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg font-medium transition-colors">
                        예약 취소
                      </button>
                    </>
                  )}
                  {reservationTab === 'completed' && (
                    <>
                      <button className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors">
                        리뷰 작성
                      </button>
                      <button className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors">
                        영수증 발급
                      </button>
                      <button className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors">
                        재예약하기
                      </button>
                    </>
                  )}
                  {reservationTab === 'cancelled' && reservation.refundAmount && (
                    <div className="flex-1 text-sm">
                      <p className="text-gray-600">환불 금액: <span className="font-bold text-blue-600">{reservation.refundAmount.toLocaleString()}원</span></p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 쿠폰 관리 */}
        <section className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Gift className="w-6 h-6 text-blue-600" />
              쿠폰 관리
            </h2>
          </div>

          {/* 탭 */}
          <div className="flex gap-2 mb-6 border-b border-gray-200">
            <button
              onClick={() => setCouponTab('available')}
              className={`px-6 py-3 font-medium transition-all border-b-2 ${
                couponTab === 'available'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              사용가능 ({coupons.available.length})
            </button>
            <button
              onClick={() => setCouponTab('used')}
              className={`px-6 py-3 font-medium transition-all border-b-2 ${
                couponTab === 'used'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              사용완료 ({coupons.used.length})
            </button>
            <button
              onClick={() => setCouponTab('expired')}
              className={`px-6 py-3 font-medium transition-all border-b-2 ${
                couponTab === 'expired'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              기간만료 ({coupons.expired.length})
            </button>
          </div>

          {/* 쿠폰 카드 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {coupons[couponTab].map((coupon) => (
              <div key={coupon.id} className={`border-2 rounded-xl p-5 transition-all ${
                couponTab === 'available' 
                  ? 'border-blue-300 bg-blue-50 hover:shadow-lg' 
                  : 'border-gray-200 bg-gray-50'
              }`}>
                <div className="flex items-start justify-between mb-3">
                  <Gift className={`w-8 h-8 ${couponTab === 'available' ? 'text-blue-600' : 'text-gray-400'}`} />
                  <span className={`text-2xl font-bold ${couponTab === 'available' ? 'text-blue-600' : 'text-gray-400'}`}>
                    {coupon.discount}
                  </span>
                </div>
                <h3 className={`font-bold mb-2 ${couponTab === 'available' ? 'text-gray-900' : 'text-gray-500'}`}>
                  {coupon.name}
                </h3>
                <p className="text-xs text-gray-500 mb-3">{coupon.condition}</p>
                <div className="flex items-center justify-between text-xs">
                  <span className={couponTab === 'available' ? 'text-gray-600' : 'text-gray-400'}>
                    {couponTab === 'used' ? `사용일: ${coupon.usedDate}` : `만료일: ${coupon.expiry}`}
                  </span>
                  {couponTab === 'available' && (
                    <button className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium transition-colors">
                      사용하기
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 내 리뷰 관리 */}
        <section className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Star className="w-6 h-6 text-blue-600" />
              내 리뷰 관리
            </h2>
          </div>

          {/* 탭 */}
          <div className="flex gap-2 mb-6 border-b border-gray-200">
            <button
              onClick={() => setReviewTab('writable')}
              className={`px-6 py-3 font-medium transition-all border-b-2 ${
                reviewTab === 'writable'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              작성 가능한 리뷰 ({writableReviews.length})
            </button>
            <button
              onClick={() => setReviewTab('written')}
              className={`px-6 py-3 font-medium transition-all border-b-2 ${
                reviewTab === 'written'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              내가 작성한 리뷰 ({writtenReviews.length})
            </button>
          </div>

          {/* 리뷰 카드 */}
          <div className="space-y-4">
            {reviewTab === 'writable' ? (
              writableReviews.map((review) => (
                <div key={review.id} className="border border-blue-200 bg-blue-50 rounded-xl p-5">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-1">{review.hotelName}</h3>
                      <p className="text-sm text-gray-500">{review.location} · 체크아웃: {review.checkOutDate}</p>
                    </div>
                    <span className="px-3 py-1 bg-orange-100 text-orange-700 text-xs font-medium rounded-full">
                      {review.daysLeft}일 남음
                    </span>
                  </div>
                  <button className="w-full px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors">
                    리뷰 작성하고 포인트 받기
                  </button>
                </div>
              ))
            ) : (
              writtenReviews.map((review) => (
                <div key={review.id} className="border border-gray-200 rounded-xl p-5">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900 mb-1">{review.hotelName}</h3>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                          ))}
                        </div>
                        <span className="text-sm text-gray-500">{review.date}</span>
                      </div>
                      <p className="text-gray-700 mb-3">{review.content}</p>
                      <p className="text-sm text-gray-500">도움됨 {review.helpful}명</p>
                    </div>
                    <div className="flex gap-2">
                      <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                        <Edit className="w-4 h-4 text-gray-600" />
                      </button>
                      <button className="p-2 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* 찜목록 & 최근본호텔 */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* 찜목록 */}
          <section className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Heart className="w-6 h-6 text-red-500" />
                찜목록
              </h2>
              <button className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1">
                전체보기
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3">
              {likedHotels.map((hotel) => (
                <div key={hotel.id} className="flex gap-3 p-3 border border-gray-200 rounded-lg hover:shadow-md transition-all">
                  <div className="w-20 h-20 bg-gradient-to-br from-gray-200 to-gray-300 rounded-lg flex-shrink-0" />
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 mb-1">{hotel.name}</h3>
                    <p className="text-xs text-gray-500 mb-2">{hotel.location}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-blue-600">{hotel.price.toLocaleString()}원</span>
                      <div className="flex gap-1">
                        <button className="p-1.5 hover:bg-blue-50 rounded transition-colors">
                          <Hotel className="w-4 h-4 text-blue-600" />
                        </button>
                        <button className="p-1.5 hover:bg-blue-50 rounded transition-colors">
                          <Share2 className="w-4 h-4 text-gray-600" />
                        </button>
                        <button className="p-1.5 hover:bg-red-50 rounded transition-colors">
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* 최근본호텔 */}
          <section className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Clock className="w-6 h-6 text-blue-600" />
                최근본호텔
              </h2>
              <button className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1">
                전체보기
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3">
              {recentHotels.map((hotel) => (
                <div key={hotel.id} className="flex gap-3 p-3 border border-gray-200 rounded-lg hover:shadow-md transition-all">
                  <div className="w-20 h-20 bg-gradient-to-br from-gray-200 to-gray-300 rounded-lg flex-shrink-0" />
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 mb-1">{hotel.name}</h3>
                    <p className="text-xs text-gray-500 mb-2">{hotel.location} · {hotel.viewDate}</p>
                    <span className="text-sm font-bold text-gray-700">{hotel.price.toLocaleString()}원~</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* 1:1 문의 내역 */}
        <section className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <MessageSquare className="w-6 h-6 text-blue-600" />
              1:1 문의 내역
            </h2>
            <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors">
              새 문의하기
            </button>
          </div>

          <div className="space-y-3">
            {inquiries.map((inquiry) => (
              <div key={inquiry.id} className="border border-gray-200 rounded-xl p-5 hover:shadow-md transition-all">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-bold text-gray-900">{inquiry.title}</h3>
                      <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded">
                        {inquiry.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mb-3">{inquiry.date}</p>
                    {inquiry.answer && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <p className="text-sm text-gray-700"><span className="font-semibold text-blue-600">답변:</span> {inquiry.answer}</p>
                      </div>
                    )}
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
}
