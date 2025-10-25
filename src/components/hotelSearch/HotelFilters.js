'use client';

const HotelFilters = () => {
  return (
    <>
      {/* 가격 범위 */}
      <div className="mb-6">
        <h4 className="font-semibold mb-3">가격 범위</h4>
        <div className="flex items-center gap-2 mb-3">
          <input
            type="number"
            className="w-28 px-3 py-2 border rounded text-sm"
            placeholder="최소"
          />
          <span>~</span>
          <input
            type="number"
            className="w-28 px-3 py-2 border rounded text-sm"
            placeholder="최대"
          />
        </div>
        <input
          type="range"
          min="0"
          max="500000"
          step="10000"
          className="w-full slider"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>₩0</span>
          <span>₩500,000</span>
        </div>
      </div>

      {/* 별점 */}
      <div className="mb-6">
        <h4 className="font-semibold mb-3">별점</h4>
        <div className="space-y-2">
          {[5, 4, 3, 2].map((rating) => (
            <label
              key={rating}
              className="flex items-center gap-3 cursor-pointer p-2 hover:bg-gray-50 rounded"
            >
              <input
                type="checkbox"
                className="rounded"
              />
              <span className="flex items-center">
                {[...Array(rating)].map((_, i) => (
                  <span key={i} className="text-yellow-400">★</span>
                ))}
              </span>
              <span className="text-sm">{rating}성급 이상</span>
            </label>
          ))}
        </div>
      </div>

      {/* 편의시설 */}
      <div className="mb-6">
        <h4 className="font-semibold mb-3">편의시설</h4>
        <div className="grid grid-cols-2 gap-2">
          {["무료 WiFi", "주차장", "수영장", "피트니스", "레스토랑", "바"].map((amenity) => (
            <label
              key={amenity}
              className="flex items-center gap-2 cursor-pointer p-2 hover:bg-gray-50 rounded"
            >
              <input
                type="checkbox"
                className="rounded"
              />
              <span className="text-sm">{amenity}</span>
            </label>
          ))}
        </div>
      </div>
    </>
  );
};

export default HotelFilters;
