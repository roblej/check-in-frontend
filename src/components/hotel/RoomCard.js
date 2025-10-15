const RoomCard = ({ room, searchParams, formatPrice }) => {
  return (
    <div className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
      {/* 모바일은 세로, 데스크톱은 2열 그리드로 균형 배치 */}
      <div className="flex flex-col md:grid md:grid-cols-[16rem,1fr] md:items-stretch">
        {/* 객실 이미지 */}
        <div className="relative w-full md:w-auto h-48 md:h-auto md:min-h-[12rem] bg-gradient-to-br from-blue-100 to-blue-200">
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-5xl mb-2">🛏️</span>
            <span className="text-xs text-gray-600">{room.name}</span>
          </div>
          {room.discount > 0 && (
            <div className="absolute top-3 left-3 bg-red-500 text-white px-2 py-1 rounded text-xs font-semibold">
              {room.discount}% 할인
            </div>
          )}
        </div>

        {/* 객실 정보 */}
        <div className="flex-1 p-5 md:pt-6">
          <div className="flex justify-between items-start mb-3">
            <div>
              <h3 className="text-lg font-bold mb-2">{room.name}</h3>
              <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                <span>📏 {room.size}</span>
                <span>🛏️ {room.bedType}</span>
                <span>👥 최대 {room.maxOccupancy}인</span>
              </div>
              <p className="text-sm text-gray-600 mb-3">{room.description}</p>
            </div>
            {/* 우측 가격/버튼을 데스크톱에서 세로 정렬해 균형감 */}
            <div className="hidden md:flex flex-col items-end gap-2 ml-4">
              {room.originalPrice > room.price && (
                <div className="text-sm text-gray-400 line-through">
                  ₩{formatPrice(room.originalPrice)}
                </div>
              )}
              <div className="flex items-baseline gap-2">
                <span className="text-1.7xl font-bold text-gray-900">
                  ₩{formatPrice(room.price)}
                </span>
                <span className="text-sm text-gray-500">
                  / {searchParams.nights || 1}박
                </span>
              </div>
              <button className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-medium transition-colors shadow-md">
                예약하기
              </button>
            </div>
          </div>

          {/* 편의시설 */}
          <div className="flex flex-wrap gap-2 mb-4">
            {room.amenities.map((amenity, idx) => (
              <span
                key={idx}
                className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded"
              >
                {amenity}
              </span>
            ))}
          </div>

          {/* 체크인 정보 */}
          <p className="text-xs text-green-600 mb-4">✓ {room.checkInInfo}</p>

          {/* 가격 및 예약 - 모바일 하단 배치 */}
          <div className="md:hidden flex items-center justify-between border-t pt-3 mt-2">
            <div className="flex-1">
              {room.originalPrice > room.price && (
                <div className="text-sm text-gray-400 line-through mb-1">
                  ₩{formatPrice(room.originalPrice)}
                </div>
              )}
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-gray-900">
                  ₩{formatPrice(room.price)}
                </span>
                <span className="text-sm text-gray-500">
                  / {searchParams.nights || 1}박
                </span>
              </div>
            </div>
            <button className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-2 rounded-lg font-medium transition-colors shadow-md">
              예약하기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomCard;
