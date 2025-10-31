"use client";

import { useState, useEffect, useCallback, useMemo, useRef, Suspense } from "react";
import Header from "@/components/Header";
import HotelDetailPanel from "@/components/hotel/HotelDetailPanel";
import HotelSearchResults from "@/components/hotelSearch/HotelSearchResults";
import KakaoMapWithMarkers from "@/components/hotelSearch/KakaoMapWithMarkers";
import { useSearchStore } from "@/stores/searchStore";
import {
  createHotelDetailUrl,
  formatSearchParamsForUrl,
} from "@/utils/urlUtils";
import axios from "axios";
import { useSearchParams, useRouter } from "next/navigation";

const HotelSearchPageContent = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { updateFromUrlParams, searchParams: storeSearchParams } =
    useSearchStore();

  // URL에서 파라미터 추출
  const destination = searchParams.get("destination");
  const checkIn = searchParams.get("checkIn");
  const checkOut = searchParams.get("checkOut");
  const adults = searchParams.get("adults");

  console.log("URL 파라미터:", { destination, checkIn, checkOut, adults });

  const [searchResults, setSearchResults] = useState([]);

  // URL에서 선택된 호텔 ID 가져오기 (새로고침 시 패널 유지)
  const selectedHotelId = searchParams.get("selectedHotel");
  const [selectedcontentId, setSelectedcontentId] = useState(selectedHotelId);

  // URL 파라미터를 Zustand 스토어에 동기화
  useEffect(() => {
    if (destination || checkIn || checkOut || adults) {
      console.log("URL 파라미터를 스토어에 동기화:", {
        destination,
        checkIn,
        checkOut,
        adults,
      });
      updateFromUrlParams(searchParams);
    }
  }, [
    destination,
    checkIn,
    checkOut,
    adults,
    searchParams,
    updateFromUrlParams,
  ]);

  // URL에서 선택된 호텔 ID 동기화 (뒤로가기/앞으로가기 지원)
  useEffect(() => {
    const urlSelectedHotel = searchParams.get("selectedHotel");
    //중복 갱신 방지
    if (
    urlSelectedHotel === selectedcontentId ||
    (!urlSelectedHotel && !selectedcontentId)
  ) {
    return;
  }
  }, [searchParams, selectedcontentId]);

  // 각 호텔별 독립적인 검색 조건 관리 (localStorage에서 복원)
  const [hotelSearchParams, setHotelSearchParams] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("hotelSearchParams");
      return saved ? JSON.parse(saved) : {};
    }
    return {};
  });

  // 스토어에서 검색 파라미터 가져오기
  const localSearchParams = storeSearchParams;

  const [sortBy, setSortBy] = useState("인기순");
  const [filters, setFilters] = useState({
    priceMin: 0,
    priceMax: 500000,
    starRatings: [],
    amenities: [],
  });

  const [showFiltersPanel, setShowFiltersPanel] = useState(false);
  const [showMobileMap, setShowMobileMap] = useState(false);

  const [searchHotels, setSearchHotels] = useState([]);
  const hotel_url = "api/hotel/search";

  // 호텔 데이터 (임시)
  const [filteredHotels, setFilteredHotels] = useState([]);

  // 페이지네이션 상태
  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = 10;

  const getHotels = useCallback(async () => {
    try {
      console.log("=== getHotels 디버깅 ===");
      console.log("URL에서 받은 destination:", destination);
      console.log(
        "localSearchParams.destination:",
        localSearchParams.destination
      );
      console.log("전체 localSearchParams:", localSearchParams);

      if (!localSearchParams.destination) {
        console.log("destination이 없어서 API 호출하지 않음");
        return null;
      }

      const res = await axios.post(hotel_url, {
        title: localSearchParams.destination,
      });
      if (res.data) {
        console.log("=== 호텔 검색 결과 ===");
        console.log("총 호텔 개수:", Array.isArray(res.data) ? res.data.length : 0);
        console.log("호텔 데이터:", res.data);
        setSearchResults(res.data);
        return res.data;
      }
    } catch (error) {
      console.error("호텔 데이터 가져오기 실패:", error);
      return null;
    }
  }, [destination, localSearchParams]);

  useEffect(
    function () {
      if (localSearchParams.destination) {
        getHotels();
      }
    },
    [localSearchParams.destination, getHotels]
  );
  // 필터링
  useEffect(() => {
    const hotels = searchResults || [];
    console.log("hotels:", hotels);
    if (!Array.isArray(hotels) || hotels.length === 0) {
      setFilteredHotels([]);
      return;
    }

    let filtered = hotels.filter((hotel) => {
      // 가격 필터링 (가격 정보가 있는 경우에만 필터링)
      // minPrice, maxPrice, price 중 하나라도 있으면 필터링 적용
      const hotelPrice = hotel.minPrice || hotel.maxPrice || hotel.price || null;
      if (hotelPrice !== null) {
        const price = Number(hotelPrice);
        if (price < filters.priceMin || price > filters.priceMax) {
          return false;
        }
      }
      
      // 별점 필터링
      if (
        filters.starRatings.length > 0 &&
        hotel.starRating !== undefined &&
        !filters.starRatings.includes(hotel.starRating)
      ) {
        return false;
      }
      
      // 편의시설 필터링
      if (filters.amenities.length > 0) {
        const hotelAmenities = hotel.amenities || [];
        if (!Array.isArray(hotelAmenities)) {
          return false;
        }
        if (!filters.amenities.some((amenity) => hotelAmenities.includes(amenity))) {
          return false;
        }
      }
      
      return true;
    });

    // 정렬
    switch (sortBy) {
      case "낮은 가격순":
        filtered.sort((a, b) => {
          const priceA = Number(a.minPrice || a.maxPrice || a.price || 0);
          const priceB = Number(b.minPrice || b.maxPrice || b.price || 0);
          return priceA - priceB;
        });
        break;
      case "높은 가격순":
        filtered.sort((a, b) => {
          const priceA = Number(a.minPrice || a.maxPrice || a.price || 0);
          const priceB = Number(b.minPrice || b.maxPrice || b.price || 0);
          return priceB - priceA;
        });
        break;
      case "평점순":
        filtered.sort((a, b) => {
          const ratingA = Number(a.rating || 0);
          const ratingB = Number(b.rating || 0);
          return ratingB - ratingA;
        });
        break;
      default: // 인기순
        filtered.sort((a, b) => {
          const reviewA = Number(a.reviewCount || 0);
          const reviewB = Number(b.reviewCount || 0);
          return reviewB - reviewA;
        });
    }

    setFilteredHotels(filtered);
    // 필터링이 변경되면 첫 페이지로 리셋
    setCurrentPage(0);
  }, [sortBy, filters, searchResults]);

  // 현재 페이지에 해당하는 호텔 계산
  const currentPageHotels = useMemo(() => {
    const startIndex = currentPage * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredHotels.slice(startIndex, endIndex);
  }, [filteredHotels, currentPage, pageSize]);

  // 전체 페이지 수 계산
  const totalPages = useMemo(() => {
    const pages = Math.ceil(filteredHotels.length / pageSize);
    console.log('=== 페이지네이션 계산 ===');
    console.log('필터링된 호텔 개수:', filteredHotels.length);
    console.log('페이지 크기:', pageSize);
    console.log('총 페이지 수:', pages);
    console.log('페이지네이션 표시 여부:', pages > 1 ? 'YES' : 'NO (페이지가 1개 이하)');
    return pages;
  }, [filteredHotels.length, pageSize]);

  // 페이지 변경 핸들러
  const handlePageChange = useCallback((page) => {
    setCurrentPage(page);
    // 페이지 변경 시 호텔 상세 패널 닫기
    setSelectedcontentId(null);
    // URL에서 selectedHotel 파라미터 제거
    const urlParams = new URLSearchParams(searchParams.toString());
    urlParams.delete("selectedHotel");
    router.replace(`?${urlParams.toString()}`, { scroll: false, shallow: true });
    // 페이지 변경 시 스크롤을 상단으로 이동
    const resultsPanel = document.querySelector('[data-hotel-results]');
    if (resultsPanel) {
      resultsPanel.scrollTop = 0;
    }
  }, [searchParams, router]);

  const formatPrice = (price) => new Intl.NumberFormat("ko-KR").format(price);

  const toggleFilter = (type, value) => {
    setFilters((prev) => ({
      ...prev,
      [type]: prev[type].includes(value)
        ? prev[type].filter((item) => item !== value)
        : [...prev[type], value],
    }));
  };

  // 필터 변경 핸들러
  const handleFilterChange = useCallback((newFilterValues) => {
    setFilters((prev) => ({
      ...prev,
      ...newFilterValues,
    }));
  }, []);

  // 필터 초기화 핸들러
  const handleFilterReset = useCallback(() => {
    setFilters({
      priceMin: 0,
      priceMax: 500000,
      starRatings: [],
      amenities: [],
    });
  }, []);

  const processingRef = useRef(null);
  const handleHotelClick = useCallback((hotelId) => {
    // 중복 클릭 방지: 현재 처리 중인 호텔 ID 추적 (useRef 사용)
    if (processingRef.current === hotelId) {
      return;
    }
    processingRef.current = hotelId;
    
    // 약간의 지연 후 처리 중 플래그 해제
    setTimeout(() => {
      processingRef.current = null;
    }, 500);

    // 이미 같은 호텔이 선택되어 있으면 패널 닫기
    if (selectedcontentId === hotelId) {
      // URL 먼저 변경
      const urlParams = new URLSearchParams(searchParams.toString());
      urlParams.delete("selectedHotel");
      router.replace(`?${urlParams.toString()}`, {
        scroll: false,shallow: true, });

      // 그 다음 상태 변경
      setSelectedcontentId(null);
      return;
    }

    // 다른 호텔 클릭 시 즉시 전환 (패널은 고정, 내용만 교체)
    setSelectedcontentId(hotelId);
    const urlParams = new URLSearchParams(searchParams.toString());
    urlParams.set("selectedHotel", hotelId);
    router.replace(`?${urlParams.toString()}`, { scroll: false ,shallow: true,});
  }, [selectedcontentId, searchParams, router]);

  // 호텔별 검색 조건 업데이트 함수 (localStorage에 저장)
  const updateHotelSearchParams = (hotelId, newParams) => {
    setHotelSearchParams((prev) => {
      const updated = {
        ...prev,
        [hotelId]: { ...prev[hotelId], ...newParams },
      };

      // localStorage에 저장
      if (typeof window !== "undefined") {
        localStorage.setItem("hotelSearchParams", JSON.stringify(updated));
      }

      return updated;
    });
  };

  // 현재 선택된 호텔의 검색 조건 가져오기 (메모이제이션)
  const currentHotelSearchParams = useMemo(() => {
    if (!selectedcontentId) return localSearchParams;

    const hotelParams = hotelSearchParams[selectedcontentId];
    if (hotelParams) {
      return { ...localSearchParams, ...hotelParams };
    }

    return localSearchParams;
  }, [selectedcontentId, hotelSearchParams, localSearchParams]);

  // 호텔 상세 페이지로 이동하는 함수
  const handleHotelDetailOpen = useCallback(
    (contentId) => {
      const urlParams = formatSearchParamsForUrl(localSearchParams);
      const detailUrl = createHotelDetailUrl(contentId, urlParams);

      console.log("호텔 상세 페이지로 이동:", detailUrl);
      router.push(detailUrl);
    },
    [localSearchParams, router]
  );

  return (
    <div className="h-screen bg-gray-50 overflow-hidden flex flex-col">
      <Header />

      {/* 검색 조건 및 필터 바 */}
      <div className="bg-white border-b flex-shrink-0">
        <div className="max-w-[1200px] mx-auto px-4 py-3">
          {/* 검색 조건 */}
          <div className="flex items-center justify-between mb-3">
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

          {/* 필터 및 정렬 */}
          <div className="flex flex-wrap gap-4 items-center justify-between pt-3 border-t border-gray-200">
            <div className="flex flex-wrap gap-4 items-center">
              {/* 정렬 필터 */}
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700">정렬:</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                >
                  <option value="인기순">인기순</option>
                  <option value="낮은 가격순">낮은 가격순</option>
                  <option value="높은 가격순">높은 가격순</option>
                  <option value="평점순">평점순</option>
                </select>
              </div>

              {/* 필터 버튼 */}
              <button
                onClick={() => setShowFiltersPanel(!showFiltersPanel)}
                className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2 text-sm font-medium text-gray-700"
              >
                <span>🔍</span>
                <span>필터</span>
              </button>
            </div>

            {/* 결과 개수 및 필터 초기화 */}
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-500">
                {filteredHotels.length > 0 ? (
                  <span>총 <span className="font-semibold text-orange-600">{filteredHotels.length}</span>개의 호텔</span>
                ) : (
                  <span className="text-gray-400">검색 결과가 없습니다</span>
                )}
              </div>
              
              {(filters.priceMin > 0 || filters.priceMax < 500000 || filters.starRatings.length > 0 || filters.amenities.length > 0) && (
                <button
                  onClick={handleFilterReset}
                  className="px-3 py-2 text-sm text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors border border-gray-300 hover:border-orange-300"
                >
                  필터 초기화
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 메인 컨텐츠 - 좌우 분할 */}
      <div className="flex flex-1 relative overflow-hidden">
        {/* 좌측: 호텔 검색 결과 (그리드) */}
        <div className="flex-1 lg:w-[30%] overflow-y-auto">
          <div className="p-4">
            <HotelSearchResults
              hotels={currentPageHotels}
              formatPrice={formatPrice}
              handleHotelClick={handleHotelClick}
              handleHotelDetailOpen={handleHotelDetailOpen}
              sortBy={sortBy}
              setSortBy={setSortBy}
              days={localSearchParams.nights}
              showFiltersPanel={showFiltersPanel}
              setShowFiltersPanel={setShowFiltersPanel}
              filteredHotels={filteredHotels}
              currentPage={currentPage}
              totalPages={totalPages}
              totalElements={filteredHotels.length}
              pageSize={pageSize}
              onPageChange={handlePageChange}
              filters={filters}
              onFilterChange={handleFilterChange}
              onFilterReset={handleFilterReset}
            />
          </div>
        </div>

        {/* 우측: 지도 */}
        <div className="hidden lg:block lg:w-[70%] lg:flex-shrink-0 border-l border-gray-200">
          <div className="w-full h-full bg-gray-100 relative">
            {/* 카카오맵 영역 */}
            <KakaoMapWithMarkers
              hotels={currentPageHotels}
              selectedHotelId={selectedcontentId}
              onMarkerClick={handleHotelClick}
            />
          </div>
        </div>
      </div>

      {/* 호텔 상세 패널 - 항상 렌더링하되 내부에서 표시 제어 */}
      <HotelDetailPanel
        contentId={selectedcontentId}
        searchParams={currentHotelSearchParams}
        onClose={() => {
          // URL 먼저 변경 (리렌더 방지)
          const urlParams = new URLSearchParams(searchParams.toString());
          urlParams.delete("selectedHotel");
          router.replace(`?${urlParams.toString()}`, { scroll: false,shallow: true, });

          // 그 다음 상태 변경 (즉시)
          setSelectedcontentId(null);
        }}
        onSearchParamsChange={(newParams) => {
          updateHotelSearchParams(selectedcontentId, newParams);
        }}
      />
    </div>
  );
};

const HotelSearchPage = () => {
  return (
    <Suspense fallback={
      <div className="h-screen bg-gray-50 overflow-hidden flex flex-col">
        <div className="bg-white border-b flex-shrink-0">
          <div className="max-w-[1200px] mx-auto px-4 py-3">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            </div>
          </div>
        </div>
        <div className="flex flex-1 relative overflow-hidden">
          <div className="animate-pulse">
            <div className="h-full bg-gray-100"></div>
          </div>
        </div>
      </div>
    }>
      <HotelSearchPageContent />
    </Suspense>
  );
};

export default HotelSearchPage;
