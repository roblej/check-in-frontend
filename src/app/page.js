'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Button from '@/components/Button';
//tttttt
const CheckinHotel = () => {
  const [destination, setDestination] = useState('');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [adults, setAdults] = useState(2);
  const [selectedType, setSelectedType] = useState('hotel');
  const [currentSlide, setCurrentSlide] = useState(0);

  const handleSearch = (e) => {
    e.preventDefault();
    console.log('검색:', { destination, checkIn, checkOut, adults });
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

  const partnerSites = [
    '부킹닷컴', '아고다', '호텔스닷컴', '호텔스컴바인', '익스피디아', 
    '트립닷컴', '호텔엔조이', '호텔패스', '라쿠텐', '아코르', 
    'Jalan', '하나투어', 'NOL', '모두투어', '트립비토즈', 
    '여기어때', '시크릿몰', '재패니칸', '인터콘티넨탈', '메리어트', '힐튼', '하얏트'
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
      subtitle: '항공 구매시 호텔 15% 할인',
      description: '여행 출발 전 언제든 사용 가능',
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

  return (
    <div className="min-h-screen bg-gray-50">
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

          {/* 검색 폼 */}
          <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 border border-gray-200">
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
                호텔모텔국내전용
              </button>
              <button
                onClick={() => setSelectedType('business')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedType === 'business'
                    ? 'bg-[#3B82F6] text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                해외출장
              </button>
            </div>

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
          </div>
        </div>
      </section>

      {/* 메인 컨텐츠 */}
      <main className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* 파트너사 로고 섹션 */}
        <section className="mb-16">
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
            {partnerSites.map((site, index) => (
              <button
                key={index}
                className="bg-white hover:bg-gray-50 border border-gray-200 p-4 rounded-xl text-center transition-all hover:shadow-md hover:border-gray-300 cursor-pointer"
              >
                <div className="text-xs md:text-sm font-medium text-gray-700">{site}</div>
              </button>
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