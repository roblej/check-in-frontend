"use client";

import { useState, useEffect } from "react";
import Header from "@/components/Header";
import HotelDetailPanel from "@/components/hotel/HotelDetailPanel";
import HotelSearchResults from "@/components/hotelSearch/HotelSearchResults";
import { useSearchStore } from '@/stores/searchStore';
import axios from "axios";
import { useSearchParams } from 'next/navigation';

const HotelSearchPage = () => {
  const searchParams = useSearchParams();
  
  // URL에서 파라미터 추출
  const destination = searchParams.get('destination');
  const checkIn = searchParams.get('checkIn');
  const checkOut = searchParams.get('checkOut');
  const adults = searchParams.get('adults');
  
  console.log(destination, checkIn, checkOut, adults);
  const urlSearchParams = useSearchStore(state => state.searchParams);
  const searchResults = useSearchStore(state => state.searchResults);
  const [localSearchParams, setLocalSearchParams] = useState({
    destination: destination,
    checkIn: checkIn,
    checkOut: checkOut,
    nights: new Date(checkOut).getDate() - new Date(checkIn).getDate(),
    adults: adults || 2,
  });
  
  const [sortBy, setSortBy] = useState("인기순");
  const [filters, setFilters] = useState({
    priceMin: 0,
    priceMax: 500000,
    starRatings: [],
    amenities: [],
  });

  const [showFiltersPanel, setShowFiltersPanel] = useState(false);
  const [showMobileMap, setShowMobileMap] = useState(false);
  const [selectedcontentId, setSelectedcontentId] = useState(null);


  // 호텔 데이터 (임시)
  const [filteredHotels, setFilteredHotels] = useState([]);
 
  // 필터링
  useEffect(() => {
    const hotels = searchResults || [];
    if (!Array.isArray(hotels) || hotels.length === 0) {
      setFilteredHotels([]);
      return;
    }
    
    let filtered = hotels.filter((hotel) => {
      if (hotel.price < filters.priceMin || hotel.price > filters.priceMax)
        return false;
      if (filters.starRatings.length > 0 && !filters.starRatings.includes(hotel.starRating))
        return false;
      if (filters.amenities.length > 0 && !filters.amenities.some(amenity => hotel.amenities.includes(amenity)))
        return false;
      return true;
    });

    // 정렬
    switch (sortBy) {
      case "낮은 가격순":
        filtered.sort((a, b) => a.price - b.price);
        break;
      case "높은 가격순":
        filtered.sort((a, b) => b.price - a.price);
        break;
      case "평점순":
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      default: // 인기순
        filtered.sort((a, b) => b.reviewCount - a.reviewCount);
    }

    setFilteredHotels(filtered);
  }, [sortBy, filters, searchResults]);

  const formatPrice = (price) => new Intl.NumberFormat("ko-KR").format(price);


  const toggleFilter = (type, value) => {
    setFilters((prev) => ({
      ...prev,
      [type]: prev[type].includes(value)
        ? prev[type].filter((item) => item !== value)
        : [...prev[type], value],
    }));
  };

  const handleHotelClick = (hotelId) => {
    setSelectedcontentId(hotelId);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* 검색 조건 바 */}
      <div className="bg-white border-b">
        <div className="max-w-[1200px] mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700">
                  {localSearchParams.destination}
                </span>
                <span className="text-gray-400">|</span>
                <span className="text-sm text-gray-600">
                  {localSearchParams.checkIn} - {localSearchParams.checkOut}
                </span>
                <span className="text-gray-400">|</span>
                <span className="text-sm text-gray-600">
                  성인 {localSearchParams.adults}명
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button className="px-3 py-1 text-sm text-gray-600 hover:text-blue-600">
                검색 조건 변경
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 메인 컨텐츠 */}
      <div className="flex h-[calc(100vh-4rem)] relative">
        {/* 좌측: 호텔 검색 결과 */}
        <HotelSearchResults
          hotels={filteredHotels}
          formatPrice={formatPrice}
          handleHotelClick={handleHotelClick}
          sortBy={sortBy}
          setSortBy={setSortBy}
          days ={localSearchParams.nights}
          showFiltersPanel={showFiltersPanel}
          setShowFiltersPanel={setShowFiltersPanel}
          filteredHotels={filteredHotels}
        />

        {/* 우측: 지도 */}
        <div
          className={`
          hidden lg:block lg:flex-shrink-0 flex-1 lg:w-[70%]
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

            {/* 이벤트 알림 배너 */}
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2">
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
                      strokeWidth={1}
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
                <button className="bg-blue-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-600 transition-colors">
                  지도 보기
                </button>
              </div>
            </div>

            {/* 우측 하단 축척 */}
            <div className="absolute bottom-6 right-6 bg-white px-3 py-1 rounded shadow text-xs">
              5km
            </div>
          </div>
        </div>
      </div>

      {/* 호텔 상세 패널 */}
      {selectedcontentId && (
        <HotelDetailPanel
          contentId={selectedcontentId}
          searchParams={localSearchParams}
          onClose={() => setSelectedcontentId(null)}
        />
      )}
    </div>
  );
};

export default HotelSearchPage;