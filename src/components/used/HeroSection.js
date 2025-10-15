'use client';

import Button from '../Button';

const HeroSection = ({ 
  destination, 
  setDestination, 
  checkIn, 
  setCheckIn, 
  checkOut, 
  setCheckOut, 
  adults, 
  setAdults, 
  onSearch 
}) => {
  const handleSearch = (e) => {
    e.preventDefault();
    if (onSearch) {
      onSearch({ destination, checkIn, checkOut, adults });
    }
  };

  return (
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
                    type="button"
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
                    type="button"
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
              type="submit"
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
  );
};

export default HeroSection;
