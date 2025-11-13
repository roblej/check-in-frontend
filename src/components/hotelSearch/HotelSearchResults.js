"use client";

import { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import HotelFilters from "./HotelFilters";
import Pagination from "../Pagination";

const HotelSearchResults = ({
  hotels,
  formatPrice,
  handleHotelClick,
  handleHotelDetailOpen,
  sortBy,
  setSortBy,
  days,
  showFiltersPanel,
  setShowFiltersPanel,
  filteredHotels,
  currentPage = 0,
  totalPages = 0,
  totalElements = 0,
  pageSize = 10,
  onPageChange,
  filters,
  onFilterChange,
  onFilterReset,
  isLoading = false,
  allSearchResults = [], // 로컬 필터 미리보기용 전체 검색 결과
}) => {
  // 로컬 필터 상태 (실제 적용 전까지 임시 저장)
  const [localFilters, setLocalFilters] = useState(filters);

  // 로컬 필터로 미리보기 개수 계산
  const previewCount = useMemo(() => {
    if (allSearchResults.length === 0) {
      return totalElements;
    }

    const hasActiveFilters = 
      localFilters.priceMin > 0 ||
      localFilters.priceMax < 500000 ||
      localFilters.starRatings.length > 0 ||
      localFilters.amenities.length > 0;

    if (!hasActiveFilters) {
      return allSearchResults.length;
    }

    const filtered = allSearchResults.filter((hotel) => {
      // 가격 필터링
      const hotelPrice = hotel.minPrice || hotel.maxPrice || hotel.price || null;
      if (hotelPrice !== null) {
        const price = Number(hotelPrice);
        if (price < localFilters.priceMin || price > localFilters.priceMax) {
          return false;
        }
      }

      // 별점 필터링
      if (
        localFilters.starRatings.length > 0 &&
        hotel.starRating !== undefined &&
        !localFilters.starRatings.includes(hotel.starRating)
      ) {
        return false;
      }

      // 편의시설 필터링
      if (localFilters.amenities.length > 0) {
        const hasParking = localFilters.amenities.includes("주차");
        const hasRestaurant = localFilters.amenities.includes("식당");

        if (hasParking) {
          const parkinglodging = hotel.parkinglodging || "";
          if (!parkinglodging.includes("가능")) {
            return false;
          }
        }

        if (hasRestaurant) {
          const foodplace = hotel.foodplace || "";
          if (!foodplace || foodplace.trim() === "") {
            return false;
          }
        }
      }

      return true;
    });

    return filtered.length;
  }, [localFilters, allSearchResults, totalElements]);

  // 로컬 필터 변경 핸들러
  const handleLocalFilterChange = (newLocalFilters) => {
    setLocalFilters(newLocalFilters);
  };

  // 필터 적용 핸들러 (n개 호텔 보기 버튼 클릭 시)
  const handleApplyFilters = () => {
    onFilterChange(localFilters);
    setShowFiltersPanel(false);
  };
  return (
    <>
      {/* 호텔 카드 그리드 */}
      <div className="space-y-6" data-hotel-results>
        {/* 호텔 카드 그리드 */}
        <div className="grid grid-cols-1 gap-6">
          {isLoading ? (
            <div className="col-span-full text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                검색 중...
              </h3>
              <p className="text-gray-500">
                호텔 정보를 불러오는 중입니다.
              </p>
            </div>
          ) : Array.isArray(hotels) && hotels.length > 0 ? (
            hotels.map((hotel, index) => (
              <div
                key={hotel.contentId}
                className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 overflow-hidden group cursor-pointer"
                onClick={() => handleHotelClick(hotel.contentId)}
              >
                {/* 이미지 */}
                <div className="relative h-48 overflow-hidden">
                  {hotel.imageUrl ? (
                    <Image
                      src={hotel.imageUrl}
                      alt={hotel.title || "hotel image"}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      priority={index < 3}
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-400 text-4xl">🏨</span>
                    </div>
                  )}
                </div>

                {/* 내용 */}
                <div className="p-6">
                  <div className="mb-3">
                    <h3 className="text-lg font-bold text-gray-900 mb-1">
                      {hotel.title}
                    </h3>
                    <p className="text-sm text-gray-600">{hotel.adress || '주소 정보 없음'}</p>
                  </div>

                  {/* 평점 및 리뷰 */}
                  {(hotel.rating || hotel.reviewCount) && (
                    <div className="flex items-center mb-4">
                      {hotel.rating && (
                        <div className="flex items-center">
                          <span className="text-yellow-500 text-sm">⭐</span>
                          <span className="text-sm font-medium text-gray-900 ml-1">
                            {hotel.rating}
                          </span>
                        </div>
                      )}
                      {hotel.reviewCount && (
                        <span className="text-sm text-gray-500 ml-2">
                          (리뷰 {hotel.reviewCount}개)
                        </span>
                      )}
                    </div>
                  )}

                  {/* 가격 */}
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">{days || 1}박 기준</p>
                      {hotel.minPrice ? (
                        hotel.maxPrice && hotel.maxPrice !== hotel.minPrice ? (
                          <p className="text-xl font-bold text-[#3B82F6]">
                            ₩{formatPrice(hotel.minPrice)} ~
                          </p>
                        ) : (
                          <p className="text-xl font-bold text-[#3B82F6]">
                            ₩{formatPrice(hotel.minPrice)}
                          </p>
                        )
                      ) : hotel.price ? (
                        <p className="text-xl font-bold text-[#3B82F6]">
                          ₩{formatPrice(hotel.price)}
                        </p>
                      ) : (
                        <p className="text-xl font-bold text-[#3B82F6]">
                          가격 문의
                        </p>
                      )}
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleHotelClick(hotel.contentId);
                      }}
                      className="bg-[#3B82F6] hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                      예약하기
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
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

        {/* Pagination */}
        {onPageChange && totalPages >= 1 && (
          <div className="mt-6">
            <Pagination
              currentPage={currentPage || 0}
              totalPages={totalPages || 0}
              totalElements={totalElements || 0}
              pageSize={pageSize || 10}
              onPageChange={onPageChange}
            />
          </div>
        )}
      </div>

      {/* 필터 패널 (모달) */}
      {showFiltersPanel && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* 헤더 */}
              <div className="flex items-center justify-between mb-6 pb-4 border-b">
                <h3 className="text-xl font-bold">
                  필터 {previewCount > 0 && <span className="text-blue-500">({previewCount}개)</span>}
                </h3>
                <button
                  onClick={() => setShowFiltersPanel(false)}
                  className="text-2xl text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              {/* HotelFilters 컴포넌트 사용 */}
              <HotelFilters
                filters={filters}
                onFilterChange={onFilterChange}
                onReset={onFilterReset}
                onLocalFilterChange={handleLocalFilterChange}
              />

              {/* 하단 버튼 */}
              <div className="sticky bottom-0 bg-white pt-4 border-t flex gap-3">
                <button
                  onClick={() => {
                    // 취소 시 로컬 필터를 원래 필터로 복원
                    setLocalFilters(filters);
                    setShowFiltersPanel(false);
                  }}
                  className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                >
                  취소
                </button>
                <button
                  onClick={handleApplyFilters}
                  className="flex-1 bg-blue-500 text-white py-3 rounded-lg font-semibold hover:bg-blue-600 transition-colors"
                >
                  {previewCount}개 호텔 보기
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default HotelSearchResults;
