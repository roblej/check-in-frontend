'use client';

const HotelFilters = ({ 
  priceRange, 
  setPriceRange, 
  selectedFilters, 
  setSelectedFilters 
}) => {
  const formatPrice = (price) => {
    return new Intl.NumberFormat('ko-KR').format(price);
  };

  const handleStarRatingChange = (stars, checked) => {
    if (checked) {
      setSelectedFilters(prev => ({
        ...prev,
        starRating: [...prev.starRating, stars]
      }));
    } else {
      setSelectedFilters(prev => ({
        ...prev,
        starRating: prev.starRating.filter(s => s !== stars)
      }));
    }
  };

  const handleAmenityChange = (amenity, checked) => {
    if (checked) {
      setSelectedFilters(prev => ({
        ...prev,
        amenities: [...prev.amenities, amenity]
      }));
    } else {
      setSelectedFilters(prev => ({
        ...prev,
        amenities: prev.amenities.filter(a => a !== amenity)
      }));
    }
  };

  const clearAllFilters = () => {
    setPriceRange([0, 500000]);
    setSelectedFilters({
      starRating: [],
      amenities: [],
      location: []
    });
  };

  const hasActiveFilters = () => {
    return priceRange[0] > 0 || 
           priceRange[1] < 500000 || 
           selectedFilters.starRating.length > 0 || 
           selectedFilters.amenities.length > 0;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-4">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">필터</h3>
        {hasActiveFilters() && (
          <button
            onClick={clearAllFilters}
            className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
          >
            모두 지우기
          </button>
        )}
      </div>
      
      {/* 가격 범위 */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-700 mb-3">가격 범위</h4>
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <input
              type="number"
              min="0"
              max="500000"
              step="10000"
              value={priceRange[0]}
              onChange={(e) => setPriceRange([parseInt(e.target.value) || 0, priceRange[1]])}
              className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-500">~</span>
            <input
              type="number"
              min="0"
              max="500000"
              step="10000"
              value={priceRange[1]}
              onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value) || 500000])}
              className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <input
            type="range"
            min="0"
            max="500000"
            step="10000"
            value={priceRange[1]}
            onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>₩{formatPrice(priceRange[0])}</span>
            <span>₩{formatPrice(priceRange[1])}</span>
          </div>
        </div>
      </div>

      {/* 별점 */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-700 mb-3">별점</h4>
        <div className="space-y-2">
          {[5, 4, 3, 2].map((stars) => (
            <label key={stars} className="flex items-center cursor-pointer hover:bg-gray-50 p-1 rounded">
              <input
                type="checkbox"
                checked={selectedFilters.starRating.includes(stars)}
                onChange={(e) => handleStarRatingChange(stars, e.target.checked)}
                className="mr-3 text-blue-600 focus:ring-blue-500"
              />
              <div className="flex items-center">
                <div className="flex mr-2">
                  {[...Array(5)].map((_, index) => (
                    <span
                      key={index}
                      className={`text-sm ${
                        index < stars ? 'text-yellow-400' : 'text-gray-300'
                      }`}
                    >
                      ★
                    </span>
                  ))}
                </div>
                <span className="text-sm text-gray-600">{stars}성급 이상</span>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* 편의시설 */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-700 mb-3">편의시설</h4>
        <div className="space-y-2">
          {[
            { name: '무료 WiFi', icon: '📶' },
            { name: '수영장', icon: '🏊' },
            { name: '스파', icon: '🧖' },
            { name: '피트니스', icon: '💪' },
            { name: '주차장', icon: '🅿️' },
            { name: '레스토랑', icon: '🍽️' },
            { name: '비즈니스 센터', icon: '💼' },
            { name: '룸서비스', icon: '🛎️' }
          ].map((amenity) => (
            <label key={amenity.name} className="flex items-center cursor-pointer hover:bg-gray-50 p-1 rounded">
              <input
                type="checkbox"
                checked={selectedFilters.amenities.includes(amenity.name)}
                onChange={(e) => handleAmenityChange(amenity.name, e.target.checked)}
                className="mr-3 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-600 flex items-center gap-2">
                <span>{amenity.icon}</span>
                <span>{amenity.name}</span>
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* 지역 */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-700 mb-3">지역</h4>
        <div className="space-y-2">
          {[
            '강남구', '서초구', '중구', '용산구', '마포구', 
            '종로구', '성동구', '광진구', '송파구', '강동구'
          ].map((location) => (
            <label key={location} className="flex items-center cursor-pointer hover:bg-gray-50 p-1 rounded">
              <input
                type="checkbox"
                checked={selectedFilters.location.includes(location)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedFilters(prev => ({
                      ...prev,
                      location: [...prev.location, location]
                    }));
                  } else {
                    setSelectedFilters(prev => ({
                      ...prev,
                      location: prev.location.filter(l => l !== location)
                    }));
                  }
                }}
                className="mr-3 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-600">{location}</span>
            </label>
          ))}
        </div>
      </div>

      {/* 특별 혜택 */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-700 mb-3">특별 혜택</h4>
        <div className="space-y-2">
          <label className="flex items-center cursor-pointer hover:bg-gray-50 p-1 rounded">
            <input
              type="checkbox"
              className="mr-3 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-600 flex items-center gap-2">
              <span>🎯</span>
              <span>무료 취소</span>
            </span>
          </label>
          <label className="flex items-center cursor-pointer hover:bg-gray-50 p-1 rounded">
            <input
              type="checkbox"
              className="mr-3 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-600 flex items-center gap-2">
              <span>💰</span>
              <span>최저가 보장</span>
            </span>
          </label>
          <label className="flex items-center cursor-pointer hover:bg-gray-50 p-1 rounded">
            <input
              type="checkbox"
              className="mr-3 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-600 flex items-center gap-2">
              <span>⭐</span>
              <span>추천 호텔</span>
            </span>
          </label>
        </div>
      </div>
    </div>
  );
};

export default HotelFilters;
