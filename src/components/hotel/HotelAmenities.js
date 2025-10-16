"use client";

/**
 * 호텔 편의시설 컴포넌트
 * @param {Object} props
 * @param {Array} props.amenities - 편의시설 배열
 */
const HotelAmenities = ({ amenities }) => {
  return (
    <div className="bg-white rounded-lg p-6 mb-6 shadow">
      <h2 className="text-2xl font-bold mb-4">편의시설</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {amenities.map((amenity, idx) => (
          <div
            key={idx}
            className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
          >
            <span className="text-2xl">✓</span>
            <span className="text-gray-700">{amenity}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HotelAmenities;
