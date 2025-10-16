'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import axios from 'axios';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Button from '@/components/Button';

const ResalePage = () => {
  const [destination, setDestination] = useState('');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [adults, setAdults] = useState(2);
  const [sortBy, setSortBy] = useState('price');
  const [filterPrice, setFilterPrice] = useState('all');

  // 페이지 로딩 시 API 호출
  useEffect(() => {
    const fetchAreas = async () => {
      try {
        const response = await axios.get('http://localhost:8888/api/areas');
        console.log('Areas 데이터:', response.data);
      } catch (error) {
        console.error('API 호출 중 오류 발생:', error);
        if (error.response) {
          console.error('응답 오류:', error.response.status, error.response.statusText);
        } else if (error.request) {
          console.error('요청 오류:', error.request);
        } else {
          console.error('오류 메시지:', error.message);
        }
      }
    };

    fetchAreas();
  }, []);

  // 더미 데이터
  const resaleItems = [
    {
      id: 1,
      hotelName: '그랜드 하얏트 서울',
      location: '서울 강남구',
      originalPrice: 450000,
      salePrice: 320000,
      discountRate: 29,
      checkIn: '2024-01-15',
      checkOut: '2024-01-17',
      nights: 2,
      guests: 2,
      roomType: '디럭스 더블',
      description: '사정상 취소 불가능한 예약입니다. 싼 값에 양도합니다.',
      seller: '김여행',
      rating: 4.8,
      image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=300&fit=crop',
      urgent: true
    },
    {
      id: 2,
      hotelName: '롯데호텔 부산',
      location: '부산 해운대구',
      originalPrice: 280000,
      salePrice: 200000,
      discountRate: 29,
      checkIn: '2024-01-20',
      checkOut: '2024-01-22',
      nights: 2,
      guests: 2,
      roomType: '스탠다드 트윈',
      description: '급한 일정 변경으로 양도합니다. 협의 가능합니다.',
      seller: '박관광',
      rating: 4.6,
      image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400&h=300&fit=crop',
      urgent: false
    },
    {
      id: 3,
      hotelName: '신라호텔 제주',
      location: '제주 제주시',
      originalPrice: 380000,
      salePrice: 250000,
      discountRate: 34,
      checkIn: '2024-01-25',
      checkOut: '2024-01-27',
      nights: 2,
      guests: 2,
      roomType: '오션뷰 더블',
      description: '예약 취소 수수료 때문에 양도합니다. 좋은 기회입니다!',
      seller: '이휴가',
      rating: 4.9,
      image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400&h=300&fit=crop',
      urgent: true
    },
    {
      id: 4,
      hotelName: '웨스틴 조선 서울',
      location: '서울 중구',
      originalPrice: 520000,
      salePrice: 350000,
      discountRate: 33,
      checkIn: '2024-02-01',
      checkOut: '2024-02-03',
      nights: 2,
      guests: 2,
      roomType: '프리미엄 더블',
      description: '비즈니스 출장 취소로 양도합니다.',
      seller: '최출장',
      rating: 4.7,
      image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop',
      urgent: false
    },
    {
      id: 5,
      hotelName: '파크 하얏트 서울',
      location: '서울 용산구',
      originalPrice: 420000,
      salePrice: 280000,
      discountRate: 33,
      checkIn: '2024-02-05',
      checkOut: '2024-02-07',
      nights: 2,
      guests: 2,
      roomType: '시티뷰 더블',
      description: '개인 사정으로 양도합니다. 협의 가능합니다.',
      seller: '정여행',
      rating: 4.5,
      image: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=400&h=300&fit=crop',
      urgent: false
    },
    {
      id: 6,
      hotelName: '켄싱턴호텔 여수',
      location: '전남 여수시',
      originalPrice: 320000,
      salePrice: 220000,
      discountRate: 31,
      checkIn: '2024-02-10',
      checkOut: '2024-02-12',
      nights: 2,
      guests: 2,
      roomType: '오션뷰 트윈',
      description: '여행 계획 변경으로 양도합니다.',
      seller: '한바다',
      rating: 4.4,
      image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop',
      urgent: true
    }
  ];


  const handleSearch = (e) => {
    e.preventDefault();
    console.log('검색:', { destination, checkIn, checkOut, adults });
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('ko-KR').format(price);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      month: 'short',
      day: 'numeric',
      weekday: 'short'
    });
  };

  const filteredItems = resaleItems.filter(item => {
    const matchesSearch = item.hotelName.toLowerCase().includes(destination.toLowerCase()) ||
                         item.location.toLowerCase().includes(destination.toLowerCase());
    const matchesCheckIn = !checkIn || item.checkIn >= checkIn;
    const matchesCheckOut = !checkOut || item.checkOut <= checkOut;
    const matchesGuests = !adults || item.guests >= adults;
    
    return matchesSearch && matchesCheckIn && matchesCheckOut && matchesGuests;
  });

  const sortedItems = [...filteredItems].sort((a, b) => {
    switch (sortBy) {
      case 'price':
        return a.salePrice - b.salePrice;
      case 'discount':
        return b.discountRate - a.discountRate;
      case 'date':
        return new Date(a.checkIn) - new Date(b.checkIn);
      default:
        return 0;
    }
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <Header />

      {/* 히어로 섹션 */}
      <section className="bg-gradient-to-r from-orange-50 to-red-50 py-12 md:py-16">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
              <span className="text-gray-900">예약 양도</span>
              <span className="text-orange-600"> 중고거래</span>
            </h1>
            <p className="text-lg text-gray-600 mb-2">
              사정상 가지 못하는 호텔 예약을 싼 값에 양도하세요
            </p>
            <p className="text-sm text-gray-500">
              취소 수수료 없이 합리적인 가격으로 호텔을 이용할 수 있습니다
            </p>
          </div>

          {/* 검색 폼 */}
          <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 border border-gray-200">
            <form onSubmit={handleSearch}>
              {/* 검색 입력 필드 */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                {/* 목적지 */}
                <div className="lg:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    호텔 어디로 여행 가시나요?
                  </label>
                  <input
                    type="text"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    placeholder="목적지를 입력하세요"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent transition-all"
                  />
                </div>

                {/* 체크인/체크아웃 */}
                <div className="lg:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    숙박일정을 선택하세요
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="date"
                      value={checkIn}
                      onChange={(e) => setCheckIn(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent transition-all"
                    />
                    <input
                      type="date"
                      value={checkOut}
                      onChange={(e) => setCheckOut(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                {/* 인원 선택 */}
                <div className="lg:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    성인 {adults}명
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setAdults(Math.max(1, adults - 1))}
                      className="w-12 h-12 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors text-lg font-semibold"
                      aria-label="인원 감소"
                    >
                      -
                    </button>
                    <div className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-center font-medium">
                      {adults}
                    </div>
                    <button
                      onClick={() => setAdults(adults + 1)}
                      className="w-12 h-12 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors text-lg font-semibold"
                      aria-label="인원 증가"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              {/* 검색 버튼 */}
              <Button
                onClick={handleSearch}
                variant="primary"
                size="lg"
                className="w-full"
              >
                검색
              </Button>
            </form>
          </div>
        </div>
      </section>

      {/* 메인 컨텐츠 */}
      <main className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* 필터 및 정렬 */}
        <div className="bg-white rounded-xl shadow-lg p-4 mb-6 border border-gray-200">
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700">정렬:</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="price">가격순</option>
                  <option value="discount">할인율순</option>
                  <option value="date">날짜순</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700">가격:</label>
                <select
                  value={filterPrice}
                  onChange={(e) => setFilterPrice(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="all">전체</option>
                  <option value="under200">20만원 이하</option>
                  <option value="200-300">20-30만원</option>
                  <option value="300-400">30-40만원</option>
                  <option value="over400">40만원 이상</option>
                </select>
              </div>
            </div>

            {/* 결과 개수 */}
            <div>
              <p className="text-gray-600">
                총 <span className="font-semibold text-orange-600">{sortedItems.length}</span>개의 양도 예약이 있습니다
              </p>
            </div>
          </div>
        </div>

        {/* 양도 목록 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedItems.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 overflow-hidden group"
            >
              {/* 이미지 */}
              <div className="relative h-48 overflow-hidden">
                <Image
                  src={item.image}
                  alt={item.hotelName}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {item.urgent && (
                  <div className="absolute top-3 left-3 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                    긴급
                  </div>
                )}
                <div className="absolute top-3 right-3 bg-black bg-opacity-50 text-white px-2 py-1 rounded-full text-xs">
                  {item.discountRate}% 할인
                </div>
              </div>

              {/* 내용 */}
              <div className="p-6">
                <div className="mb-3">
                  <h3 className="text-lg font-bold text-gray-900 mb-1">{item.hotelName}</h3>
                  <p className="text-sm text-gray-600">{item.location}</p>
                </div>

                {/* 날짜 및 숙박 정보 */}
                <div className="mb-4 space-y-2">
                  <div className="flex items-center text-sm text-gray-600">
                    <span className="mr-2">📅</span>
                    <span>{formatDate(item.checkIn)} - {formatDate(item.checkOut)}</span>
                    <span className="ml-2 text-gray-400">({item.nights}박)</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <span className="mr-2">👥</span>
                    <span>성인 {item.guests}명</span>
                    <span className="ml-2 text-gray-400">• {item.roomType}</span>
                  </div>
                </div>

                {/* 가격 정보 */}
                <div className="mb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500 line-through">
                        원가: {formatPrice(item.originalPrice)}원
                      </p>
                      <p className="text-xl font-bold text-orange-600">
                        {formatPrice(item.salePrice)}원
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">할인</p>
                      <p className="text-lg font-semibold text-red-500">
                        -{formatPrice(item.originalPrice - item.salePrice)}원
                      </p>
                    </div>
                  </div>
                </div>

                {/* 설명 */}
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                  {item.description}
                </p>

                {/* 판매자 정보 */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center mr-2">
                      <span className="text-xs font-semibold text-gray-600">
                        {item.seller.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{item.seller}</p>
                      <div className="flex items-center">
                        <span className="text-xs text-yellow-500">⭐</span>
                        <span className="text-xs text-gray-500 ml-1">{item.rating}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 버튼 */}
                <div className="flex gap-2">
                  <Button
                    variant="primary"
                    className="flex-1 bg-orange-500 hover:bg-orange-600"
                  >
                    문의하기
                  </Button>
                  <Button
                    variant="outline"
                    className="px-4"
                  >
                    찜하기
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 빈 상태 */}
        {sortedItems.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🏨</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              검색 결과가 없습니다
            </h3>
            <p className="text-gray-600">
              다른 검색 조건으로 다시 시도해보세요
            </p>
          </div>
        )}
      </main>

      {/* 푸터 */}
      <Footer />
    </div>
  );
};

export default ResalePage;
