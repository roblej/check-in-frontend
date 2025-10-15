'use client';

import Button from './Button';

const HotelCard = ({ hotel, onBook }) => {
  const formatPrice = (price) => {
    return new Intl.NumberFormat('ko-KR').format(price);
  };

  const renderStars = (rating) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    return (
      <div className="flex items-center">
        {[...Array(5)].map((_, index) => {
          if (index < fullStars) {
            return <span key={index} className="text-yellow-400 text-xs sm:text-sm">★</span>;
          } else if (index === fullStars && hasHalfStar) {
            return <span key={index} className="text-yellow-400 text-xs sm:text-sm">☆</span>;
          } else {
            return <span key={index} className="text-gray-300 text-xs sm:text-sm">☆</span>;
          }
        })}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-200 hover:border-blue-300">
      {/* 모바일: 세로 레이아웃, 데스크톱: 가로 레이아웃 */}
      <div className="flex flex-col sm:flex-row">
        {/* 호텔 이미지 */}
        <div className="w-full sm:w-64 md:w-80 h-48 sm:h-52 flex-shrink-0 relative">
          <div className="w-full h-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
            <div className="text-center">
              <div className="text-3xl sm:text-4xl mb-2">🏨</div>
              <span className="text-gray-500 text-xs sm:text-sm">호텔 이미지</span>
            </div>
          </div>
          
          {/* 배지들 */}
          <div className="absolute top-2 sm:top-3 left-2 sm:left-3 flex flex-col gap-1 sm:gap-2">
            {hotel.isRecommended && (
              <span className="bg-blue-500 text-white text-xs font-medium px-2 py-1 rounded-full shadow-sm">
                추천
              </span>
            )}
            {hotel.isBestPrice && (
              <span className="bg-green-500 text-white text-xs font-medium px-2 py-1 rounded-full shadow-sm">
                최저가
              </span>
            )}
          </div>

          {/* 할인율 */}
          {hotel.discount > 0 && (
            <div className="absolute top-2 sm:top-3 right-2 sm:right-3">
              <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-sm">
                {hotel.discount}% 할인
              </span>
            </div>
          )}
        </div>

        {/* 호텔 정보 */}
        <div className="flex-1 p-4 sm:p-5 md:p-6">
          <div className="flex flex-col h-full">
            {/* 상단: 호텔명, 위치, 평점 */}
            <div className="mb-3 sm:mb-4">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 hover:text-blue-600 transition-colors cursor-pointer line-clamp-1">
                {hotel.name}
              </h3>
              
              <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-gray-600 mb-2">
                <span className="flex items-center gap-1">
                  <span>📍</span>
                  <span>{hotel.location}</span>
                </span>
                <span className="hidden sm:inline">•</span>
                <span className="flex items-center gap-1">
                  <span>🚶</span>
                  <span>{hotel.distance}</span>
                </span>
              </div>

              {/* 평점 */}
              <div className="flex items-center gap-2 mb-2">
                {renderStars(hotel.rating)}
                <span className="text-xs sm:text-sm font-medium text-gray-700">{hotel.rating}</span>
                <span className="text-xs sm:text-sm text-gray-500">({hotel.reviewCount.toLocaleString()})</span>
              </div>

              {/* 별점 표시 */}
              <div className="flex items-center gap-1">
                <div className="flex">
                  {[...Array(5)].map((_, index) => (
                    <span
                      key={index}
                      className={`text-xs sm:text-sm ${
                        index < hotel.starRating ? 'text-yellow-400' : 'text-gray-300'
                      }`}
                    >
                      ★
                    </span>
                  ))}
                </div>
                <span className="text-xs text-gray-600">{hotel.starRating}성급</span>
              </div>
            </div>

            {/* 편의시설 */}
            <div className="mb-3 sm:mb-4">
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {hotel.amenities.slice(0, 4).map((amenity, index) => (
                  <span
                    key={index}
                    className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full hover:bg-gray-200 transition-colors"
                  >
                    {amenity}
                  </span>
                ))}
                {hotel.amenities.length > 4 && (
                  <span className="text-gray-500 text-xs px-2 py-1">
                    +{hotel.amenities.length - 4}
                  </span>
                )}
              </div>
            </div>

            {/* 하단: 가격 및 예약 버튼 */}
            <div className="mt-auto">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-3">
                <div className="flex-1">
                  <div className="flex flex-wrap items-baseline gap-2 mb-1">
                    <span className="text-xl sm:text-2xl font-bold text-gray-900">
                      ₩{formatPrice(hotel.price)}
                    </span>
                    {hotel.originalPrice > hotel.price && (
                      <span className="text-xs sm:text-sm text-gray-500 line-through">
                        ₩{formatPrice(hotel.originalPrice)}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">1박 기준 • 세금 포함</p>
                </div>
                
                <div className="flex sm:flex-col items-center sm:items-end gap-2">
                  <Button
                    variant="primary"
                    size="md"
                    className="flex-1 sm:flex-none px-6 sm:px-8 py-2.5 sm:py-3 font-semibold text-sm whitespace-nowrap"
                    onClick={() => onBook && onBook(hotel)}
                  >
                    예약하기
                  </Button>
                  <button className="text-xs sm:text-sm text-blue-600 hover:text-blue-800 transition-colors px-2 whitespace-nowrap">
                    상세보기
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HotelCard;
