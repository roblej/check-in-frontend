"use client";

import Image from "next/image";
import { useState } from "react";

const HotelSearchResults = ({ 
  hotels, 
  formatPrice, 
  handleHotelClick, 
  sortBy, 
  setSortBy, 
  showFiltersPanel, 
  setShowFiltersPanel,
  filteredHotels
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <>
      {/* 접기/펼치기 토글 버튼 - 네이버 스타일 */}
      <button
        onClick={toggleCollapse}
        className={`fixed top-1/2 transform -translate-y-1/2 z-30 bg-white border border-gray-300 rounded shadow-md hover:shadow-lg transition-all duration-200 ${
          isCollapsed ? "left-0" : "left-[30%]"
        }`}
        style={{ 
          width: "36px", 
          height: "36px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}
      >
        <span className="text-gray-600 text-sm">
          {isCollapsed ? "▶" : "◀"}
        </span>
      </button>

      {/* 호텔 검색 결과 패널 */}
      <div
        className={`transition-all duration-300 ease-in-out ${
          isCollapsed 
            ? "w-0 overflow-hidden" 
            : "flex-1 lg:w-[30%] lg:max-w-[30%]"
        } flex flex-col ${
          isCollapsed ? "hidden" : "block"
        }`}
      >
        {/* 호텔 리스트 상단 (검색 조건 & 정렬) */}
        <div className="p-4 border-b bg-white flex-shrink-0">
          {/* 주변 필터 */}
          <div className="flex items-center gap-2 text-xs mb-3 overflow-x-auto pb-2">
            <span className="text-gray-600 whitespace-nowrap">주변</span>
            <button className="px-2 py-1 border border-gray-300 rounded whitespace-nowrap hover:bg-gray-50 text-xs">
              인천
            </button>
            <button className="px-2 py-1 border border-gray-300 rounded whitespace-nowrap hover:bg-gray-50 text-xs">
              인천국제공항
            </button>
            <button className="px-2 py-1 border border-gray-300 rounded whitespace-nowrap hover:bg-gray-50 text-xs">
              김포공항
            </button>
            <button className="px-2 py-1 border border-gray-300 rounded whitespace-nowrap hover:bg-gray-50 text-xs">
              서울 중심지
            </button>
          </div>

          {/* 정렬 & 필터 */}
          <div className="flex items-center justify-between">
            <p className="text-xs text-red-500">2박 세금포함 가격</p>
            <div className="flex items-center gap-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-2 py-1 border border-gray-300 rounded text-xs bg-white"
              >
                <option value="인기순">인기순</option>
                <option value="낮은 가격순">낮은 가격순</option>
                <option value="높은 가격순">높은 가격순</option>
                <option value="평점순">평점순</option>
              </select>
              <button
                onClick={() => setShowFiltersPanel(!showFiltersPanel)}
                className="px-3 py-1 border border-gray-300 rounded text-xs bg-white hover:bg-gray-50 flex items-center gap-1"
              >
                <span>🔍</span>
                <span>필터</span>
              </button>
            </div>
          </div>
        </div>

        {/* 스크롤 가능한 호텔 리스트 */}
        <div className="flex-1 overflow-y-auto p-4">
          {/* 트래블클럽 배너 */}
          <div className="mb-4 p-3 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center gap-2">
              <span className="bg-green-600 text-white text-xs px-2 py-0.5 rounded font-bold">
                N
              </span>
              <span className="font-medium text-sm">트래블클럽 배너 ⓘ</span>
            </div>
          </div>

          {/* 호텔 카드 리스트 */}
          <div className="space-y-4">
            {Array.isArray(hotels) && hotels.length > 0 ? (
              hotels.map((hotel) => (
              <div
                key={hotel.contentId}
                className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow bg-white cursor-pointer"
                onClick={() => handleHotelClick(hotel.contentId)}
              >
                <div className="flex flex-col sm:flex-row">
                  {/* 호텔 이미지 */}
                  <div className="relative w-full sm:w-48 h-48 sm:h-auto bg-gradient-to-br from-blue-100 to-blue-200 flex-shrink-0">
                    <Image 
                      src={hotel.imageUrl} 
                      alt="hotel image" 
                      className="w-full h-full object-cover rounded-lg"
                      width={400}
                      height={300}
                    />
                    {/* {hotel.badges.length > 0 && (
                      <div className="absolute top-2 left-2">
                        <span className="bg-yellow-400 text-xs px-2 py-1 rounded font-medium">
                          {hotel.badges[0]}
                        </span>
                      </div>
                    )} */}
                  </div>

                  {/* 호텔 정보 */}
                  <div className="flex-1 p-4">
                    <div className="flex flex-col h-full">
                      {/* 호텔명 */}
                      <h3 className="font-bold text-lg mb-2 hover:text-blue-600 cursor-pointer">
                        {hotel.title}
                      </h3>

                      {/* 평점 */}
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex items-center">
                          <span className="text-yellow-500 mr-1">★</span>
                          <span className="font-bold text-blue-600">
                            {hotel.rating}
                          </span>
                        </div>
                        <span className="text-sm text-gray-600">
                          {hotel.adress}
                        </span>
                        <span className="text-sm text-gray-600">
                          {hotel.reviews}
                        </span>
                        <span className="text-sm text-gray-500">
                          {hotel.location}
                        </span>
                      </div>

                      {/* 체크인 정보 */}
                      <p className="text-xs text-gray-500 mb-3">
                        {hotel.checkInTime}
                      </p>

                      {/* 하단: 가격 및 예약 */}
                      <div className="mt-auto">
                        <div className="flex items-end justify-between">
                          <div>
                            <div className="flex items-baseline gap-2">
                              <span className="text-2xl font-bold text-gray-900">
                                {/* 방 가격을 가져와서 가격 평균 표시*/}
                                {/* ₩{formatPrice(hotel.price)} */}
                              </span>
                              {hotel.discount > 0 && (
                                <span className="text-sm text-red-500 font-medium">
                                  {hotel.discount}%
                                </span>
                              )}
                            </div>
                            {hotel.originalPrice > hotel.price && (
                              <div className="text-sm text-gray-500 line-through">
                                ₩{formatPrice(hotel.originalPrice)}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              ))
            ) : (
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">🏨</div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                  검색 결과가 없습니다
                </h3>
                <p className="text-gray-500">
                  다른 검색 조건으로 다시 시도해보세요.
                </p>
              </div>
            )}
          </div>

        </div>

        {/* 필터 패널 (하단에서 올라옴 - 오버레이 없음) */}
        {showFiltersPanel && (
          <div className="fixed bottom-0 left-0 right-0 lg:left-0 lg:right-auto lg:w-[30%] bg-white rounded-t-2xl lg:rounded-tr-2xl shadow-2xl z-50 max-h-[80vh] overflow-y-auto border-2 border-blue-500">
            <div className="p-6">
              {/* 헤더 */}
              <div className="flex items-center justify-between mb-6 pb-4 border-b">
                <h3 className="text-xl font-bold">필터</h3>
                <button
                  onClick={() => setShowFiltersPanel(false)}
                  className="text-2xl text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

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

              {/* 하단 버튼 */}
              <div className="sticky bottom-0 bg-white pt-4 border-t">
                <button
                  onClick={() => setShowFiltersPanel(false)}
                  className="w-full bg-blue-500 text-white py-3 rounded-lg font-semibold hover:bg-blue-600"
                >
                  {filteredHotels.length}개 호텔 보기
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default HotelSearchResults;
