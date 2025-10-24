"use client";

import { useState } from "react";

const HotelLocation = ({ location, area, updateFormData, errors, initialData }) => {
  const [mapLoaded, setMapLoaded] = useState(false);

  const handleAddressSearch = () => {
    // 실제 구현 시 카카오맵 API를 사용하여 주소 검색
    console.log('주소 검색:', location.detailedAddress);
  };

  const handleMapClick = (lat, lng) => {
    updateFormData("location", { 
      latitude: lat.toString(), 
      longitude: lng.toString() 
    });
  };

  return (
    <div className="space-y-8">
      {/* 지도 */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">위치 정보</h3>
        <p className="text-sm text-gray-500 mb-4">
          호텔의 정확한 위치를 지도에서 확인하고 설정하세요.
        </p>

        {/* 지도 영역 */}
        <div className="bg-gray-100 rounded-lg h-96 flex items-center justify-center">
          {mapLoaded ? (
            <div className="text-center">
              <div className="text-gray-400 text-6xl mb-4">🗺️</div>
              <p className="text-gray-500">지도가 로드되었습니다</p>
              <p className="text-sm text-gray-400">클릭하여 위치를 설정하세요</p>
            </div>
          ) : (
            <div className="text-center">
              <div className="text-gray-400 text-6xl mb-4">📍</div>
              <p className="text-gray-500 mb-4">지도를 로딩 중입니다...</p>
              <button
                onClick={() => setMapLoaded(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                지도 로드하기
              </button>
            </div>
          )}
        </div>

        {/* 좌표 정보 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              위도
            </label>
            <input
              type="text"
              value={location.latitude}
              onChange={(e) => updateFormData("location", { latitude: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="37.5665"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              경도
            </label>
            <input
              type="text"
              value={location.longitude}
              onChange={(e) => updateFormData("location", { longitude: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="126.9780"
            />
          </div>
        </div>
      </div>

      {/* 상세 주소 */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">상세 주소</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              상세 주소
            </label>
            <div className="flex space-x-2">
              <input
                type="text"
                value={location.detailedAddress}
                onChange={(e) => updateFormData("location", { detailedAddress: e.target.value })}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="상세 주소를 입력하세요"
              />
              <button
                onClick={handleAddressSearch}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
              >
                검색
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 교통편 안내 */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">교통편 안내</h3>
        <div className="space-y-6">
          {/* 주차 정보 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              주차 정보
            </label>
            <textarea
              value={location.parkingInfo}
              onChange={(e) => updateFormData("location", { parkingInfo: e.target.value })}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="주차장 위치, 요금, 운영시간 등을 입력하세요"
            />
          </div>

          {/* 대중교통 안내 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              대중교통 안내
            </label>
            <textarea
              value={location.publicTransport}
              onChange={(e) => updateFormData("location", { publicTransport: e.target.value })}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="지하철, 버스 등 대중교통 이용 방법을 입력하세요"
            />
          </div>
        </div>
      </div>

      {/* 주변 시설 */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">주변 시설</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              관광지
            </label>
            <textarea
              value={area.nearbyAttractions}
              onChange={(e) => updateFormData("area", { nearbyAttractions: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="주변 관광지나 명소를 입력하세요"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              쇼핑/식당
            </label>
            <textarea
              value={area.transportation}
              onChange={(e) => updateFormData("area", { transportation: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="주변 쇼핑몰, 식당 등을 입력하세요"
            />
          </div>
        </div>
      </div>

      {/* 교통편별 상세 안내 */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">교통편별 상세 안내</h3>
        <div className="space-y-4">
          {/* 공항에서 */}
          <div className="border border-gray-200 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">✈️ 공항에서</h4>
            <textarea
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="인천공항, 김포공항에서의 교통편 안내"
            />
          </div>

          {/* 기차역에서 */}
          <div className="border border-gray-200 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">🚄 기차역에서</h4>
            <textarea
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="KTX, 일반열차역에서의 교통편 안내"
            />
          </div>

          {/* 버스터미널에서 */}
          <div className="border border-gray-200 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">🚌 버스터미널에서</h4>
            <textarea
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="고속버스, 시외버스터미널에서의 교통편 안내"
            />
          </div>

          {/* 자가용 이용시 */}
          <div className="border border-gray-200 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">🚗 자가용 이용시</h4>
            <textarea
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="고속도로, 주요 도로에서의 길찾기 안내"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default HotelLocation;
