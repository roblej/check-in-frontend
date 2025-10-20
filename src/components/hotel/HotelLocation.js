"use client";

import KakaoMap from "./KakaoMap";

/**
 * 호텔 위치 컴포넌트
 * @param {Object} props
 * @param {string} [props.location=""] - 호텔 주소
 */
const HotelLocation = ({ location = "" }) => {
  console.log("HotelLocation 받은 주소:", location);
  if (!location) {
    return (
      <div className="bg-white rounded-lg p-6 mb-6 shadow">
        <h2 id="location-heading" className="text-2xl font-bold mb-4">
          위치
        </h2>
        <div className="text-center py-8 text-gray-500">
          <span className="text-4xl mb-2 block">📍</span>
          <p>위치 정보가 없습니다.</p>
        </div>
      </div>
    );
  }
  console.log("HotelLocation → 전달된 location:", location);
  return (
    <div className="bg-white rounded-lg p-6 mb-6 shadow">
      <h2 id="location-heading" className="text-2xl font-bold mb-4">
        위치
      </h2>

      {/* 주소 정보 */}
      <div className="mb-4 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center space-x-2 mb-2">
          <span className="text-2xl">📍</span>
          <span className="font-medium text-gray-700">주소</span>
        </div>
        <p className="text-gray-600">{location}</p>
      </div>

      {/* 카카오 지도 */}
      <div>
        <div className="flex items-center space-x-2 mb-3">
          <span className="text-2xl">🗺️</span>
          <span className="font-medium text-gray-700">지도</span>
        </div>
        <KakaoMap address={location} width="100%" height="300px" />
      </div>
    </div>
  );
};

export default HotelLocation;
