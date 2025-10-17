'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Button from '@/components/Button';
import { useRouter } from 'next/navigation';
import SearchCondition from '@/components/hotelSearch/SearchCondition';
import { useSearchStore } from '@/stores/searchStore';



const CheckinHotel = () => {
  const [destination, setDestination] = useState('');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [diningDate, setDiningDate] = useState('');
  const [mealType, setMealType] = useState('lunch');
  const [adults, setAdults] = useState(2);
  const [selectedType, setSelectedType] = useState('hotel');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  const router = useRouter();

  const updateSearchParams = useSearchStore(state => state.updateSearchParams);
  const handleSearch = (e) => {
    e.preventDefault();
    if (selectedType === 'dining') {
      console.log('다이닝 검색:', { destination, diningDate, mealType, adults });
    } else {
      console.log('검색:', { destination, checkIn, checkOut, adults });
      updateSearchParams({ destination:destination, checkIn:checkIn, checkOut:checkOut, adults:adults });
    router.push(`/hotel-search`);
    }
  };

  // 날짜 변경 핸들러
  const handleDateChange = (newCheckIn, newCheckOut) => {
    setCheckIn(newCheckIn);
    setCheckOut(newCheckOut);
  };

  // 날짜 포맷팅 함수
  const formatDateDisplay = (date) => {
    if (!date) return '';
    // 시간대 문제 해결을 위해 로컬 시간으로 명시적 설정
    const d = new Date(date + 'T00:00:00');
    return `${d.getMonth() + 1}.${d.getDate()}. ${['일', '월', '화', '수', '목', '금', '토'][d.getDay()]}`;
  };

  const slides = [
    {
      title: '전세계 예약사이트 요금',
      subtitle: '한번에 비교!',
      description: '알아두면 도움 되는 생생한 숙박후기'
    },
    {
      title: '힐링 호캉스 패키지는',
      subtitle: '체크인 객실 패키지로!',
      description: '여행가기 전 확인 필수! 다양한 할인/적립!'
    },
    {
      title: '해외 출장 호텔은',
      subtitle: '첫 예약 5,000원 적립',
      description: '여행가기 전 확인 필수! 다양한 할인/적립!'
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 3000);

    return () => clearInterval(timer);
  }, [slides.length]);

  useEffect(function(){
    setCheckIn(null);
    setCheckOut(null);
    setDiningDate(null);
    setMealType(null);
    setAdults(2);
    setDestination('');
  },[selectedType]);

  const popularHotels = [
    {
      id: 1,
      name: '그랜드 하얏트 서울',
      location: '서울 강남구',
      price: 450000,
      rating: 4.8,
      reviews: 1247,
      image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=300&fit=crop',
      discount: 15
    },
    {
      id: 2,
      name: '롯데호텔 부산',
      location: '부산 해운대구',
      price: 280000,
      rating: 4.6,
      reviews: 892,
      image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400&h=300&fit=crop',
      discount: 20
    },
    {
      id: 3,
      name: '신라호텔 제주',
      location: '제주 제주시',
      price: 380000,
      rating: 4.9,
      reviews: 1563,
      image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400&h=300&fit=crop',
      discount: 10
    },
    {
      id: 4,
      name: '웨스틴 조선 서울',
      location: '서울 중구',
      price: 520000,
      rating: 4.7,
      reviews: 743,
      image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop',
      discount: 12
    },
    {
      id: 5,
      name: '파크 하얏트 서울',
      location: '서울 용산구',
      price: 420000,
      rating: 4.5,
      reviews: 634,
      image: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=400&h=300&fit=crop',
      discount: 18
    },
    {
      id: 6,
      name: '켄싱턴호텔 여수',
      location: '전남 여수시',
      price: 320000,
      rating: 4.4,
      reviews: 456,
      image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop',
      discount: 25
    }
  ];

  const travelCheckItems = [
    {
      title: '출장 항공권',
      subtitle: '해외출장 가시나요?',
      description: '출장 선호 호텔을 알려드려요',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600'
    },
    {
      title: '호텔 할인쿠폰',
      subtitle: '호텔에서 제공하는 프로모션 쿠폰 및 혜택',
      description: '누구나 언제든 사용 가능',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600'
    },
    {
      title: '멤버십 혜택',
      subtitle: '멤버십 혜택 챙기셨나요?',
    
      description: '할인은 기본, 적립은 중복으로',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600'
    }
  ];

  // 바깥 클릭 시 날짜 선택기 닫기
  const handleOutsideClick = (e) => {
    if (isDatePickerOpen && !e.target.closest('.date-picker-container')) {
      setIsDatePickerOpen(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50" onClick={handleOutsideClick}>
      {/* 헤더 */}
      <Header />

      {/* 히어로 섹션 */}
      <section className="bg-blue-50 py-12 md:py-16">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
          {/* 타이틀 영역 - 슬라이더 */}
          <div className="text-center mb-8 relative bg-white rounded-2xl shadow-lg p-6 md:p-8 border border-gray-100">
            <div className="relative h-40 md:h-44 overflow-hidden">
              {slides.map((slide, index) => (
                <div
                  key={index}
                  className={`absolute inset-0 transition-all duration-700 ease-in-out ${
                    index === currentSlide
                      ? 'opacity-100 translate-x-0'
                      : index < currentSlide
                      ? 'opacity-0 -translate-x-full'
                      : 'opacity-0 translate-x-full'
                  }`}
                >
                  <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
                    <span className="block text-gray-900 mb-2">{slide.title}</span>
                    <span className="block text-[#3B82F6]">{slide.subtitle}</span>
                  </h1>
                  <p className="text-base md:text-lg text-gray-600">
                    {slide.description}
                  </p>
                </div>
              ))}
            </div>

            {/* 슬라이드 인디케이터 */}
            <div className="flex justify-center gap-2 mt-4">
              {slides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === currentSlide
                      ? 'bg-[#3B82F6] w-8'
                      : 'bg-gray-300 hover:bg-gray-400'
                  }`}
                  aria-label={`슬라이드 ${index + 1}로 이동`}
                />
              ))}
            </div>
          </div>

          {/* 검색 폼과 중고거래 버튼 */}
          <div className="flex gap-4">
            {/* 검색 폼 - 8/10 비율 */}
            <div className="flex-[8] bg-white rounded-2xl shadow-xl p-6 md:p-8 border border-gray-200">
              {/* 검색 타입 탭 */}
              <div className="flex gap-2 mb-6">
                <button
                  onClick={() => setSelectedType('hotel')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedType === 'hotel'
                      ? 'bg-[#3B82F6] text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  숙소
                </button>
              <button
                onClick={() => setSelectedType('dining')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedType === 'dining'
                    ? 'bg-[#3B82F6] text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                다이닝
              </button>
              </div>

              {/* 검색 입력 필드 */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                {/* 목적지/호텔 */}
                <div className="lg:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {selectedType === 'dining' ? '식사를 어디서 하시나요?' : '어디로 여행 가시나요?'}
                  </label>
                  <input
                    type="text"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    placeholder={selectedType === 'dining' ? '호텔명을 입력하세요' : '목적지를 입력하세요'}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent transition-all h-12"
                  />
                </div>

                {/* 날짜 선택 */}
                <div className="lg:col-span-2 relative date-picker-container">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {selectedType === 'dining' ? '식사일정을 선택하세요' : '숙박일정을 선택하세요'}
                  </label>
                  {selectedType === 'dining' ? (
                    <div
                    className="grid grid-cols-2 gap-2 cursor-pointer"
                    onClick={() => setIsDatePickerOpen(true)}
                  >
                    <div className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white hover:border-[#3B82F6] transition-colors h-12 flex flex-col justify-center">
                      <div className="text-xs text-gray-600">다이닝</div>
                      <div className="text-sm text-gray-900 font-medium">
                        {checkIn ? formatDateDisplay(checkIn) : '날짜 선택'}
                      </div>
                    </div>
                  </div>
                  ) : (
                    <div
                      className="grid grid-cols-2 gap-2 cursor-pointer"
                      onClick={() => setIsDatePickerOpen(true)}
                    >
                      <div className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white hover:border-[#3B82F6] transition-colors h-12 flex flex-col justify-center">
                        <div className="text-xs text-gray-600">체크인</div>
                        <div className="text-sm text-gray-900 font-medium">
                          {checkIn ? formatDateDisplay(checkIn) : '날짜 선택'}
                        </div>
                      </div>
                      <div className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white hover:border-[#3B82F6] transition-colors h-12 flex flex-col justify-center">
                        <div className="text-xs text-gray-600">체크아웃</div>
                        <div className="text-sm text-gray-900 font-medium">
                          {checkOut ? formatDateDisplay(checkOut) : '날짜 선택'}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 날짜 선택 컴포넌트 */}
                  {isDatePickerOpen && (
                    <div className="absolute top-full left-0 right-0 z-50 mt-1">
                      <SearchCondition
                        isOpen={isDatePickerOpen}
                        onClose={() => setIsDatePickerOpen(false)}
                        checkIn={checkIn}
                        checkOut={checkOut}
                        onDateChange={handleDateChange}
                        selectedType={selectedType}
                        className="max-w-md" // 예시: 최대 너비를 md로 제한
                      />
                    </div>
                  )}
                </div>

                {/* 인원 선택 */}
                <div className="lg:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {`인원 ${adults}명`}
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
            </div>

            {/* 중고거래 시스템 버튼 - 2/10 비율 */}
            <div className="flex-[2] flex flex-col justify-center">
              <button
                onClick={() => window.location.href = '/used'}
                className="bg-gradient-to-br from-orange-400 to-red-500 hover:from-orange-500 hover:to-red-600 text-white rounded-2xl shadow-xl p-6 md:p-8 border border-orange-300 transition-all duration-300 hover:shadow-2xl hover:scale-105 h-full flex flex-col items-center justify-center"
              >
                <div className="text-4xl md:text-5xl mb-3">🏨</div>
                <div className="text-center">
                  <div className="text-lg md:text-xl font-bold mb-2">예약 양도</div>
                  <div className="text-sm md:text-base opacity-90">중고거래</div>
                  <div className="text-xs md:text-sm mt-2 opacity-75">싼 값에 양도</div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 메인 컨텐츠 */}
      <main className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* 가장 인기있는 숙소 섹션 */}
        <section className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
              가장 인기있는 숙소
            </h2>
            <p className="text-gray-600">많은 고객들이 선택한 베스트 호텔</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {popularHotels.map((hotel) => (
              <div
                key={hotel.id}
                className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 overflow-hidden group cursor-pointer"
                onClick={() => router.push(`/hotel/${hotel.id}`)}
              >
                {/* 이미지 */}
                <div className="relative h-48 overflow-hidden">
                  <Image
                    src={hotel.image}
                    alt={hotel.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {hotel.discount > 0 && (
                    <div className="absolute top-3 left-3 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                      {hotel.discount}% 할인
                    </div>
                  )}
                </div>

                {/* 내용 */}
                <div className="p-6">
                  <div className="mb-3">
                    <h3 className="text-lg font-bold text-gray-900 mb-1">{hotel.name}</h3>
                    <p className="text-sm text-gray-600">{hotel.location}</p>
                  </div>

                  {/* 평점 및 리뷰 */}
                  <div className="flex items-center mb-4">
                    <div className="flex items-center">
                      <span className="text-yellow-500 text-sm">⭐</span>
                      <span className="text-sm font-medium text-gray-900 ml-1">{hotel.rating}</span>
                    </div>
                    <span className="text-sm text-gray-500 ml-2">({hotel.reviews}개 리뷰)</span>
                  </div>

                  {/* 가격 */}
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">1박 기준</p>
                      <p className="text-xl font-bold text-[#3B82F6]">
                        {new Intl.NumberFormat('ko-KR').format(hotel.price)}원
                      </p>
                    </div>
                    <button className="bg-[#3B82F6] hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                      예약하기
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 여행 전 체크 섹션 */}
        <section className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
              여행 전 체크
            </h2>
            <p className="text-gray-600">여행 전에 필수 체크!</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {travelCheckItems.map((item, index) => (
              <div
                key={index}
                className={`${item.bgColor} rounded-2xl p-6 hover:shadow-xl transition-all cursor-pointer border border-transparent hover:border-gray-200`}
              >
                <div className={`${item.textColor} text-4xl font-bold mb-4`}>
                  {index === 0 ? '✈️' : index === 1 ? '🎫' : '💎'}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {item.title}
                </h3>
                <p className={`${item.textColor} font-semibold mb-2 text-sm`}>
                  {item.subtitle}
                </p>
                <p className="text-gray-600 text-sm">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* 푸터 */}
      <Footer />

    </div>
  );
};

export default CheckinHotel;
