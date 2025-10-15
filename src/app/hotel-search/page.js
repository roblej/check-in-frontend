"use client";

import { useState, useEffect } from "react";
import Header from "@/components/Header";
import HotelDetailModal from "@/components/hotel/HotelDetailModal";

const HotelSearchPage = () => {
  const [searchParams, setSearchParams] = useState({
    destination: "서울",
    checkIn: "10.22.수",
    checkOut: "10.24.금",
    nights: 2,
    adults: 2,
  });

  const [sortBy, setSortBy] = useState("인기순");
  const [filters, setFilters] = useState({
    priceMin: 0,
    priceMax: 500000,
    starRatings: [],
    amenities: [],
    districts: [],
  });

  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [showMobileMap, setShowMobileMap] = useState(false);
  const [showFiltersPanel, setShowFiltersPanel] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedHotelId, setSelectedHotelId] = useState(null);
  const itemsPerPage = 12;

  // 샘플 호텔 데이터
  const hotels = [
    {
      id: 1,
      name: "신라스테이 광화문 (명동)",
      rating: 8.4,
      reviewCount: 3,
      reviews: "좋음",
      location: "워커 야주 좋음",
      district: "종로구",
      checkInTime: "무료취소 오후 없음 25.10.19.(일) 23:59 전까지",
      price: 250000,
      discount: 17,
      originalPrice: 300000,
      image: "/hotel1.jpg",
      badges: ["아이돌투한인기"],
      starRating: 4,
      amenities: ["무료 WiFi", "수영장"],
    },
    {
      id: 2,
      name: "롯데호텔 서울",
      rating: 8.7,
      reviewCount: 156,
      reviews: "매우 좋음",
      location: "명동역 도보 5분",
      district: "중구",
      checkInTime: "무료취소 오후 없음 25.10.19.(일) 23:59 전까지",
      price: 180000,
      discount: 18,
      originalPrice: 220000,
      image: "/hotel2.jpg",
      badges: [],
      starRating: 5,
      amenities: ["무료 WiFi", "수영장", "피트니스"],
    },
    {
      id: 3,
      name: "그랜드 하얏트 서울",
      rating: 8.5,
      reviewCount: 89,
      reviews: "좋음",
      location: "이태원역 도보 2분",
      district: "용산구",
      checkInTime: "무료취소 오후 없음 25.10.19.(일) 23:59 전까지",
      price: 160000,
      discount: 20,
      originalPrice: 200000,
      image: "/hotel3.jpg",
      badges: [],
      starRating: 5,
      amenities: ["무료 WiFi", "레스토랑"],
    },
    {
      id: 4,
      name: "웨스틴 조선 서울",
      rating: 9.0,
      reviewCount: 234,
      reviews: "훌륭함",
      location: "시청역 도보 1분",
      district: "중구",
      checkInTime: "무료취소 오후 없음 25.10.19.(일) 23:59 전까지",
      price: 200000,
      discount: 20,
      originalPrice: 250000,
      image: "/hotel4.jpg",
      badges: [],
      starRating: 5,
      amenities: ["무료 WiFi", "수영장", "스파"],
    },
    {
      id: 5,
      name: "파크 하얏트 서울",
      rating: 8.8,
      reviewCount: 67,
      reviews: "매우 좋음",
      location: "강남역 도보 7분",
      district: "강남구",
      checkInTime: "무료취소 오후 없음 25.10.19.(일) 23:59 전까지",
      price: 140000,
      discount: 22,
      originalPrice: 180000,
      image: "/hotel5.jpg",
      badges: [],
      starRating: 4,
      amenities: ["무료 WiFi", "피트니스"],
    },
  ];

  const [filteredHotels, setFilteredHotels] = useState(hotels);

  // 필터링
  useEffect(() => {
    let filtered = hotels.filter((hotel) => {
      if (hotel.price < filters.priceMin || hotel.price > filters.priceMax)
        return false;
      if (
        filters.starRatings.length > 0 &&
        !filters.starRatings.includes(hotel.starRating)
      )
        return false;
      if (
        filters.districts.length > 0 &&
        !filters.districts.includes(hotel.district)
      )
        return false;
      return true;
    });

    // 정렬
    if (sortBy === "낮은 가격순") {
      filtered.sort((a, b) => a.price - b.price);
    } else if (sortBy === "높은 가격순") {
      filtered.sort((a, b) => b.price - a.price);
    } else if (sortBy === "평점순") {
      filtered.sort((a, b) => b.rating - a.rating);
    }

    setFilteredHotels(filtered);
    setCurrentPage(1); // 필터 변경시 첫 페이지로
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortBy, filters]);

  const formatPrice = (price) => new Intl.NumberFormat("ko-KR").format(price);

  // 페이징 계산
  const totalPages = Math.ceil(filteredHotels.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentHotels = filteredHotels.slice(startIndex, endIndex);

  const toggleFilter = (type, value) => {
    setFilters((prev) => ({
      ...prev,
      [type]: prev[type].includes(value)
        ? prev[type].filter((v) => v !== value)
        : [...prev[type], value],
    }));
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* 간단한 검색 조건 바 (상단 고정) */}
      <div className="border-b bg-white sticky top-14 z-40 shadow-sm">
        <div className="px-4 py-2 flex items-center justify-between gap-3">
          <h1 className="text-lg font-bold whitespace-nowrap">
            호텔{" "}
            <span className="text-gray-700">{searchParams.destination}</span>
          </h1>
          <div className="flex items-center gap-2 text-xs overflow-x-auto">
            <button className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-50 whitespace-nowrap">
              {searchParams.checkIn} - {searchParams.checkOut}
            </button>
            <button className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-50 whitespace-nowrap">
              성인 {searchParams.adults}
            </button>
          </div>
        </div>
      </div>

      {/* 모바일 필터/지도 토글 */}
      <div className="lg:hidden bg-white border-b sticky top-24 z-30">
        <div className="grid grid-cols-2">
          <button
            onClick={() => {
              setShowMobileFilters(!showMobileFilters);
              setShowMobileMap(false);
            }}
            className={`py-3 text-sm font-medium ${
              showMobileFilters
                ? "bg-blue-50 text-blue-600 border-b-2 border-blue-600"
                : "text-gray-600"
            }`}
          >
            목록
          </button>
          <button
            onClick={() => {
              setShowMobileMap(!showMobileMap);
              setShowMobileFilters(false);
            }}
            className={`py-3 text-sm font-medium ${
              showMobileMap
                ? "bg-blue-50 text-blue-600 border-b-2 border-blue-600"
                : "text-gray-600"
            }`}
          >
            지도
          </button>
        </div>
      </div>

      {/* 메인 컨텐츠 */}
      <div className="flex h-[calc(100vh-4rem)]">
        {/* 좌측: 호텔 리스트 */}
        <div
          className={`flex-1 lg:max-w-[30%] flex flex-col ${
            showMobileMap ? "hidden lg:flex" : ""
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
              {currentHotels.map((hotel) => (
                <div
                  key={hotel.id}
                  className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow bg-white cursor-pointer"
                  onClick={() => setSelectedHotelId(hotel.id)}
                >
                  <div className="flex flex-col sm:flex-row">
                    {/* 호텔 이미지 */}
                    <div className="relative w-full sm:w-48 h-48 sm:h-auto bg-gradient-to-br from-blue-100 to-blue-200 flex-shrink-0">
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-4xl mb-2">🏨</span>
                        <span className="text-xs text-gray-500">
                          객실메이지
                        </span>
                      </div>
                      {hotel.badges.length > 0 && (
                        <div className="absolute top-2 left-2">
                          <span className="bg-yellow-400 text-xs px-2 py-1 rounded font-medium">
                            {hotel.badges[0]}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* 호텔 정보 */}
                    <div className="flex-1 p-4">
                      <div className="flex flex-col h-full">
                        {/* 호텔명 */}
                        <h3 className="font-bold text-lg mb-2 hover:text-blue-600 cursor-pointer">
                          {hotel.name}
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
                            {hotel.reviewCount}건평
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
                                  ₩{formatPrice(hotel.price)}
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
              ))}
            </div>

            {/* 페이징 */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-6 pb-4">
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1}
                  className="px-3 py-1 border rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  이전
                </button>
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`px-3 py-1 rounded text-sm ${
                      currentPage === i + 1
                        ? "bg-blue-500 text-white"
                        : "border hover:bg-gray-50"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 border rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  다음
                </button>
              </div>
            )}
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
                      value={filters.priceMin}
                      onChange={(e) =>
                        setFilters({
                          ...filters,
                          priceMin: Number(e.target.value),
                        })
                      }
                      className="w-28 px-3 py-2 border rounded text-sm"
                      placeholder="최소"
                    />
                    <span>~</span>
                    <input
                      type="number"
                      value={filters.priceMax}
                      onChange={(e) =>
                        setFilters({
                          ...filters,
                          priceMax: Number(e.target.value),
                        })
                      }
                      className="w-28 px-3 py-2 border rounded text-sm"
                      placeholder="최대"
                    />
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="500000"
                    step="10000"
                    value={filters.priceMax}
                    onChange={(e) =>
                      setFilters({
                        ...filters,
                        priceMax: Number(e.target.value),
                      })
                    }
                    className="w-full slider"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>₩{formatPrice(filters.priceMin)}</span>
                    <span>₩{formatPrice(filters.priceMax)}</span>
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
                          checked={filters.starRatings.includes(rating)}
                          onChange={() => toggleFilter("starRatings", rating)}
                          className="w-4 h-4 text-blue-600"
                        />
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <span
                              key={i}
                              className={`text-sm ${
                                i < rating ? "text-yellow-400" : "text-gray-300"
                              }`}
                            >
                              ★
                            </span>
                          ))}
                          <span className="text-sm text-gray-600 ml-1">
                            {rating}성급
                          </span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* 지역 */}
                <div className="mb-6">
                  <h4 className="font-semibold mb-3">지역</h4>
                  <div className="space-y-2">
                    {[
                      "종로구",
                      "중구",
                      "용산구",
                      "강남구",
                      "서초구",
                      "송파구",
                    ].map((district) => (
                      <label
                        key={district}
                        className="flex items-center gap-3 cursor-pointer p-2 hover:bg-gray-50 rounded"
                      >
                        <input
                          type="checkbox"
                          checked={filters.districts.includes(district)}
                          onChange={() => toggleFilter("districts", district)}
                          className="w-4 h-4 text-blue-600"
                        />
                        <span className="text-sm">{district}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* 편의시설 */}
                <div className="mb-6">
                  <h4 className="font-semibold mb-3">편의시설</h4>
                  <div className="space-y-2">
                    {[
                      "무료 WiFi",
                      "수영장",
                      "스파",
                      "피트니스",
                      "주차장",
                      "레스토랑",
                    ].map((amenity) => (
                      <label
                        key={amenity}
                        className="flex items-center gap-3 cursor-pointer p-2 hover:bg-gray-50 rounded"
                      >
                        <input
                          type="checkbox"
                          checked={filters.amenities.includes(amenity)}
                          onChange={() => toggleFilter("amenities", amenity)}
                          className="w-4 h-4 text-blue-600"
                        />
                        <span className="text-sm">{amenity}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* 적용 버튼 */}
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

        {/* 우측: 지도 */}
        <div
          className={`
          hidden lg:block lg:w-[70%] lg:flex-shrink-0 flex-1
          ${
            showMobileMap ? "!block fixed inset-0 z-50 w-full h-full top-0" : ""
          }
        `}
        >
          <div className="w-full h-full bg-gray-100 relative">
            {/* 모바일 닫기 버튼 */}
            {showMobileMap && (
              <button
                onClick={() => setShowMobileMap(false)}
                className="lg:hidden absolute top-4 left-4 z-10 bg-white p-3 rounded-full shadow-lg"
              >
                <span className="text-xl">←</span>
              </button>
            )}

            {/* 상단 토글 버튼 */}
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10 bg-yellow-500 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2">
              <span>→</span>
              <span className="font-medium">이번트 · 혜택 알림 받기</span>
              <button className="ml-2">✕</button>
            </div>

            {/* 지도 영역 */}
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center p-8">
                <div className="mb-4">
                  <svg
                    className="w-24 h-24 mx-auto text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-700 mb-2">
                  지도 영역
                </h3>
                <p className="text-gray-500 mb-6">
                  네이버 지도 API를 연동하여
                  <br />
                  호텔 위치를 표시합니다
                </p>
                <div className="space-y-2 text-sm text-gray-400">
                  <p>🗺️ 네이버 지도 / 카카오 지도</p>
                  <p>📍 호텔 위치 마커</p>
                  <p>🔍 확대/축소/이동</p>
                </div>
              </div>
            </div>

            {/* 하단 현재 지도에서 검색 버튼 */}
            <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2">
              <button className="bg-blue-500 text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-2 hover:bg-blue-600">
                <span className="animate-spin">⟳</span>
                <span className="font-medium">현재 지도에서 검색</span>
              </button>
            </div>

            {/* 우측 하단 축척 */}
            <div className="absolute bottom-6 right-6 bg-white px-3 py-1 rounded shadow text-xs">
              5km
            </div>
          </div>
        </div>
      </div>

      {/* 호텔 상세 모달 */}
      {selectedHotelId && (
        <HotelDetailModal
          hotelId={selectedHotelId}
          searchParams={searchParams}
          onClose={() => setSelectedHotelId(null)}
        />
      )}
    </div>
  );
};

export default HotelSearchPage;
