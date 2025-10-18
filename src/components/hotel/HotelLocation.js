"use client";

/**
 * 호텔 위치 컴포넌트
 * @param {Object} props
 * @param {string} [props.location=""] - 호텔 주소
 */
const HotelLocation = ({ location = "" }) => {
  if (!location) {
    return (
      <div className="bg-white rounded-lg p-6 mb-6 shadow">
        <h2 id="location-heading" className="text-2xl font-bold mb-4">
          위치
        </h2>
        <div className="text-center py-8 text-gray-500">
          위치 정보가 없습니다.
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg p-6 mb-6 shadow">
      <h2 id="location-heading" className="text-2xl font-bold mb-4">
        위치
      </h2>
      <p className="text-gray-700 mb-4">{location}</p>
      <div className="w-full h-64 bg-gray-200 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <span className="text-4xl mb-2 block">🗺️</span>
          <span className="text-gray-500">지도 영역</span>
        </div>
      </div>
    </div>
  );
};

export default HotelLocation;
