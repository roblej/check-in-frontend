"use client";

/**
 * 호텔 편의시설 컴포넌트
 * @param {Object} props
 * @param {string[]} [props.amenities=[]] - 편의시설 배열
 */
const HotelAmenities = ({ amenities = [] }) => {
  // 안전한 배열 처리 및 빈 값 필터링
  const safeAmenities = Array.isArray(amenities)
    ? amenities.filter((item) => item && typeof item === "string")
    : [];

  if (safeAmenities.length === 0) {
    return (
      <div className="bg-white rounded-lg p-6 mb-6 shadow">
        <h2 className="text-2xl font-bold mb-4">편의시설</h2>
        <div className="text-center py-8 text-gray-500">
          등록된 편의시설 정보가 없습니다.
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg p-6 mb-6 shadow">
      <h2 className="text-2xl font-bold mb-4">편의시설</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {safeAmenities.map((amenity, idx) => (
          <div
            key={idx}
            className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
          >
            <span className="text-2xl text-green-600">✓</span>
            <span className="text-gray-700">{amenity}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HotelAmenities;
