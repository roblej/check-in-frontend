"use client";

import { useState, useEffect, useCallback, useMemo, useRef, Suspense } from "react";
import Header from "@/components/Header";
import HotelDetailPanel from "@/components/hotel/HotelDetailPanel";
import HotelSearchResults from "@/components/hotelSearch/HotelSearchResults";
import KakaoMapWithMarkers from "@/components/hotelSearch/KakaoMapWithMarkers";
import SearchCondition from "@/components/hotelSearch/SearchCondition";
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

  // URL에서 파라미터 추출 (메모이제이션으로 불필요한 재계산 방지)
  const urlDestination = searchParams.get("destination");
  const urlCheckIn = searchParams.get("checkIn");
  const urlCheckOut = searchParams.get("checkOut");
  const urlAdults = searchParams.get("adults");
  
  const urlParams = useMemo(() => ({
    destination: urlDestination,
    checkIn: urlCheckIn,
    checkOut: urlCheckOut,
    adults: urlAdults,
  }), [urlDestination, urlCheckIn, urlCheckOut, urlAdults]);
  
  const { destination, checkIn, checkOut, adults } = urlParams;
  
  // URL 파라미터 변경 시에만 로그 출력
  const prevUrlParamsForLogRef = useRef(urlParams);
  useEffect(() => {
    const changed = 
      prevUrlParamsForLogRef.current.destination !== urlParams.destination ||
      prevUrlParamsForLogRef.current.checkIn !== urlParams.checkIn ||
      prevUrlParamsForLogRef.current.checkOut !== urlParams.checkOut ||
      prevUrlParamsForLogRef.current.adults !== urlParams.adults;
    
    if (changed) {
      console.log("URL 파라미터:", { destination, checkIn, checkOut, adults });
      prevUrlParamsForLogRef.current = urlParams;
    }
  }, [urlParams, destination, checkIn, checkOut, adults]);

  const [searchResults, setSearchResults] = useState([]);

  // URL에서 선택된 호텔 ID 가져오기 (새로고침 시 패널 유지)
  const selectedHotelId = searchParams.get("selectedHotel");
  const [selectedcontentId, setSelectedcontentId] = useState(selectedHotelId);

  // URL 파라미터를 Zustand 스토어에 동기화 (URL 변경 시에만)
  const prevUrlParamsRef = useRef(urlParams);
  useEffect(() => {
    const urlChanged = 
      prevUrlParamsRef.current.destination !== urlParams.destination ||
      prevUrlParamsRef.current.checkIn !== urlParams.checkIn ||
      prevUrlParamsRef.current.checkOut !== urlParams.checkOut ||
      prevUrlParamsRef.current.adults !== urlParams.adults;
    
    if (urlChanged && (urlParams.destination || urlParams.checkIn || urlParams.checkOut || urlParams.adults)) {
      console.log("URL 파라미터를 스토어에 동기화:", {
        destination: urlParams.destination,
        checkIn: urlParams.checkIn,
        checkOut: urlParams.checkOut,
        adults: urlParams.adults,
      });
      updateFromUrlParams(searchParams);
      prevUrlParamsRef.current = urlParams;
    }
  }, [urlParams, searchParams, updateFromUrlParams]);

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
  const [showFiltersPanel, setShowFiltersPanel] = useState(false);
  const [showMobileMap, setShowMobileMap] = useState(false);
  const [filters, setFilters] = useState({
    priceMin: 0,
    priceMax: 500000,
    starRatings: [],
    amenities: [],
  });
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [localDestination, setLocalDestination] = useState(localSearchParams.destination || "");

  // localSearchParams 변경 시 localDestination 동기화
  useEffect(() => {
    setLocalDestination(localSearchParams.destination || "");
  }, [localSearchParams.destination]);

  // 날짜 포맷팅 함수
  const formatDateDisplay = useCallback((date) => {
    if (!date) return "";
    const d = new Date(date + "T00:00:00");
    return `${d.getMonth() + 1}.${d.getDate()}. ${
      ["일", "월", "화", "수", "목", "금", "토"][d.getDay()]
    }`;
  }, []);

  // 날짜 변경 핸들러
  const handleDateChange = useCallback((newCheckIn, newCheckOut) => {
    const urlParams = new URLSearchParams(searchParams.toString());
    urlParams.set("checkIn", newCheckIn);
    urlParams.set("checkOut", newCheckOut);
    if (newCheckIn && newCheckOut) {
      const nights = Math.ceil(
        (new Date(newCheckOut) - new Date(newCheckIn)) / (1000 * 60 * 60 * 24)
      );
      urlParams.set("nights", nights.toString());
    }
    router.replace(`?${urlParams.toString()}`, { scroll: false, shallow: true });
    setIsDatePickerOpen(false);
  }, [searchParams, router]);

  // 검색 실행 핸들러
  const handleFilterSearch = useCallback((e) => {
    e?.preventDefault();
    const urlParams = new URLSearchParams();
    if (localDestination) {
      urlParams.set("destination", localDestination);
    }
    if (localSearchParams.checkIn) {
      urlParams.set("checkIn", localSearchParams.checkIn);
    }
    if (localSearchParams.checkOut) {
      urlParams.set("checkOut", localSearchParams.checkOut);
    }
    if (localSearchParams.adults) {
      urlParams.set("adults", localSearchParams.adults.toString());
    }
    router.push(`/hotel-search?${urlParams.toString()}`);
  }, [localDestination, localSearchParams.checkIn, localSearchParams.checkOut, localSearchParams.adults, router]);

  // 외부 클릭 시 날짜 선택기 닫기
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (isDatePickerOpen && !e.target.closest(".date-picker-container")) {
        setIsDatePickerOpen(false);
      }
    };
    if (isDatePickerOpen) {
      document.addEventListener("click", handleOutsideClick);
      return () => document.removeEventListener("click", handleOutsideClick);
    }
  }, [isDatePickerOpen]);

  const [searchHotels, setSearchHotels] = useState([]);
  const hotel_url = "api/hotel/search";

  // 호텔 데이터 (임시)
  const [filteredHotels, setFilteredHotels] = useState([]);

  // 페이지네이션 상태 (URL에서 초기값 읽기)
  const urlPage = searchParams.get("page");
  const [currentPage, setCurrentPage] = useState(() => {
    const page = urlPage ? parseInt(urlPage, 10) : 0;
    return isNaN(page) || page < 0 ? 0 : page;
  });
  const pageSize = 10;
  
  // URL에서 페이지 정보 동기화 (URL 변경 시에만, 무한 루프 방지)
  useEffect(() => {
    const urlPage = searchParams.get("page");
    const page = urlPage ? parseInt(urlPage, 10) : 0;
    const validPage = isNaN(page) || page < 0 ? 0 : page;
    // 현재 상태와 다를 때만 업데이트
    setCurrentPage((prevPage) => {
      if (prevPage !== validPage) {
        return validPage;
      }
      return prevPage;
    });
  }, [searchParams]); // currentPage를 dependency에서 제거하여 무한 루프 방지

  // API 호출 중복 방지 플래그
  const isFetchingRef = useRef(false);
  const lastFetchedDestinationRef = useRef(null);
  
  const getHotels = useCallback(async (destinationParam) => {
    // 이미 호출 중이거나 같은 destination으로 이미 호출했으면 스킵
    const currentDestination = destinationParam || localSearchParams.destination;
    if (isFetchingRef.current || lastFetchedDestinationRef.current === currentDestination) {
      return null;
    }

    if (!currentDestination) {
      return null;
    }

    try {
      isFetchingRef.current = true;
      lastFetchedDestinationRef.current = currentDestination;
      
      console.log("=== getHotels 디버깅 ===");
      console.log("URL에서 받은 destination:", urlDestination);
      console.log(
        "localSearchParams.destination:",
        currentDestination
      );
      console.log("전체 localSearchParams:", localSearchParams);

      const res = await axios.post(hotel_url, {
        title: currentDestination,
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
      lastFetchedDestinationRef.current = null; // 실패 시 재시도 가능하도록
      return null;
    } finally {
      isFetchingRef.current = false;
    }
  }, [localSearchParams, urlDestination]);

  // destination 변경 시에만 호텔 데이터 가져오기
  // URL 파라미터와 스토어 모두 확인하여 검색 실행
  const prevDestinationRef = useRef(localSearchParams.destination);
  const prevUrlDestinationRef = useRef(urlParams.destination);
  const hasInitializedRef = useRef(false);
  
  useEffect(() => {
    // URL 파라미터에서 destination이 있고, 스토어의 destination과 다르면 스토어 업데이트 대기
    const urlDestination = urlParams.destination;
    const storeDestination = localSearchParams.destination;
    
    // 초기 마운트 시 URL에 destination이 있으면 즉시 검색 실행
    if (!hasInitializedRef.current && urlDestination) {
      hasInitializedRef.current = true;
      prevUrlDestinationRef.current = urlDestination;
      prevDestinationRef.current = storeDestination || urlDestination;
      if (urlDestination !== lastFetchedDestinationRef.current) {
        getHotels(urlDestination);
      }
      return;
    }
    
    // URL에 destination이 있고, 변경된 경우
    if (urlDestination && urlDestination !== prevUrlDestinationRef.current) {
      hasInitializedRef.current = true;
      prevUrlDestinationRef.current = urlDestination;
      // URL 파라미터를 직접 사용하여 검색 실행 (스토어 동기화 완료를 기다리지 않음)
      if (urlDestination !== lastFetchedDestinationRef.current) {
        getHotels(urlDestination);
      }
    }
    // 스토어의 destination이 변경된 경우 (URL이 없거나 같을 때)
    else if (storeDestination && storeDestination !== prevDestinationRef.current) {
      hasInitializedRef.current = true;
      prevDestinationRef.current = storeDestination;
      if (storeDestination !== lastFetchedDestinationRef.current) {
        getHotels(storeDestination);
      }
    }
  }, [urlParams.destination, localSearchParams.destination, getHotels]);
  // 이전 필터/정렬 값 추적 (실제 변경 감지용)
  const prevFiltersRef = useRef(null);
  
  // 필터링
  useEffect(() => {
    const hotels = searchResults || [];
    console.log("hotels:", hotels);
    if (!Array.isArray(hotels) || hotels.length === 0) {
      setFilteredHotels([]);
      if (!prevFiltersRef.current) {
        prevFiltersRef.current = { sortBy, filters, searchResults };
      }
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
    
    // 필터/정렬이 실제로 변경되었을 때만 페이지 리셋 (첫 실행이 아닐 때만)
    // searchResults 변경은 제외 (검색 결과가 업데이트되는 것은 정상이며, 페이지를 리셋할 필요 없음)
    let filtersChanged = false;
    let sortByChanged = false;
    
    if (prevFiltersRef.current !== null) {
      filtersChanged = JSON.stringify(prevFiltersRef.current.filters) !== JSON.stringify(filters);
      sortByChanged = prevFiltersRef.current.sortBy !== sortBy;
      
      // 필터나 정렬이 변경되었을 때만 페이지 리셋
      if (filtersChanged || sortByChanged) {
        // 필터링이 변경되면 첫 페이지로 리셋
        setCurrentPage(0);
        setSelectedcontentId(null);
        
        // URL에서 page 파라미터 제거
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get("page")) {
          urlParams.delete("page");
          urlParams.delete("selectedHotel");
          router.replace(`?${urlParams.toString()}`, { scroll: false, shallow: true });
        }
      }
    }
    
    // 현재 값 저장 (searchResults는 저장하되, 변경 감지에는 사용하지 않음)
    prevFiltersRef.current = { sortBy, filters, searchResults };
  }, [sortBy, filters, searchResults, router]); // searchResults는 필터링에 필요하지만 페이지 리셋에는 사용하지 않음

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
    // 페이지 변경 시 호텔 상세 패널 닫기
    setSelectedcontentId(null);
    // URL 먼저 업데이트 (상태는 URL 동기화 useEffect에서 처리)
    const urlParams = new URLSearchParams(searchParams.toString());
    urlParams.delete("selectedHotel");
    if (page > 0) {
      urlParams.set("page", page.toString());
    } else {
      urlParams.delete("page");
    }
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
    // 현재 페이지 정보 유지
    if (currentPage > 0) {
      urlParams.set("page", currentPage.toString());
    }
    router.replace(`?${urlParams.toString()}`, { scroll: false ,shallow: true,});
  }, [selectedcontentId, searchParams, router, currentPage]);

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
      <div className="bg-white border-b border-gray-200 flex-shrink-0 shadow-sm">
        <div className="max-w-[1200px] mx-auto px-4 py-3">
          <div className="flex flex-col lg:flex-row lg:items-center gap-4">
            {/* 왼쪽: 검색 폼 */}
            <div className="flex items-center gap-3 flex-1 min-w-0">
              {/* 목적지 */}
              <input
                type="text"
                value={localDestination}
                onChange={(e) => setLocalDestination(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleFilterSearch(e);
                  }
                }}
                placeholder="목적지"
                className="px-3 py-1.5 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white text-gray-700 min-w-[100px]"
              />

              {/* 체크인/체크아웃 */}
              <div className="relative date-picker-container">
                <div
                  className="flex items-center gap-2 px-3 py-1.5 border border-gray-200 rounded-md hover:border-gray-300 cursor-pointer bg-white"
                  onClick={() => setIsDatePickerOpen(true)}
                >
                  <div className="text-xs text-gray-500 min-w-[60px]">
                    {localSearchParams.checkIn ? formatDateDisplay(localSearchParams.checkIn) : "체크인"}
                  </div>
                  <span className="text-gray-300">-</span>
                  <div className="text-xs text-gray-500 min-w-[60px]">
                    {localSearchParams.checkOut ? formatDateDisplay(localSearchParams.checkOut) : "체크아웃"}
                  </div>
                </div>

                {/* 날짜 선택 컴포넌트 */}
                {isDatePickerOpen && (
                  <div className="absolute top-full left-0 z-50 mt-1">
                    <SearchCondition
                      isOpen={isDatePickerOpen}
                      onClose={() => setIsDatePickerOpen(false)}
                      checkIn={localSearchParams.checkIn || ""}
                      checkOut={localSearchParams.checkOut || ""}
                      onDateChange={handleDateChange}
                      selectedType="hotel"
                      className="max-w-md"
                    />
                  </div>
                )}
              </div>

              {/* 성인 인원 */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const newAdults = Math.max(1, (localSearchParams.adults || 2) - 1);
                    const urlParams = new URLSearchParams(searchParams.toString());
                    urlParams.set("adults", newAdults.toString());
                    router.replace(`?${urlParams.toString()}`, { scroll: false, shallow: true });
                  }}
                  className="w-8 h-8 rounded border border-gray-200 flex items-center justify-center hover:bg-gray-50 text-sm font-semibold"
                >
                  -
                </button>
                <div className="px-3 py-1.5 border border-gray-200 rounded-md text-sm font-medium min-w-[40px] text-center bg-white">
                  {localSearchParams.adults || 2}
                </div>
                <button
                  onClick={() => {
                    const newAdults = (localSearchParams.adults || 2) + 1;
                    const urlParams = new URLSearchParams(searchParams.toString());
                    urlParams.set("adults", newAdults.toString());
                    router.replace(`?${urlParams.toString()}`, { scroll: false, shallow: true });
                  }}
                  className="w-8 h-8 rounded border border-gray-200 flex items-center justify-center hover:bg-gray-50 text-sm font-semibold"
                >
                  +
                </button>
              </div>

              {/* 검색 버튼 */}
              <button
                onClick={handleFilterSearch}
                className="px-4 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-md text-sm font-medium transition-colors"
              >
                검색
              </button>
            </div>

            {/* 필터 (우측 정렬) */}
            <div className="flex items-center gap-3 lg:ml-auto w-full lg:w-auto">
              {/* 정렬 */}
              <div className="flex items-center gap-2">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-1.5 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white text-gray-700 font-medium hover:border-gray-300 transition-colors"
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
                className="px-4 py-1.5 border border-gray-200 rounded-md hover:bg-gray-50 flex items-center gap-2 text-sm font-medium text-gray-700 hover:border-gray-300 transition-colors"
              >
                <span className="text-base">🔍</span>
                <span>필터</span>
              </button>

              {/* 필터 초기화 (활성 필터가 있을 때만 표시) */}
              {(filters.priceMin > 0 || filters.priceMax < 500000 || filters.starRatings.length > 0 || filters.amenities.length > 0) && (
                <button
                  onClick={handleFilterReset}
                  className="px-3 py-1.5 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors font-medium"
                >
                  초기화
                </button>
              )}

              {/* 총 개수 (최우측) */}
              <div className="text-sm text-gray-600 ml-2 pl-3 border-l border-gray-200">
                {filteredHotels.length > 0 ? (
                  <span className="font-medium">총 <span className="font-bold text-blue-600">{filteredHotels.length}</span>개</span>
                ) : (
                  <span className="text-gray-400">검색 결과 없음</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 메인 컨텐츠 - 좌우 분할 */}
      <div className="flex flex-1 relative overflow-hidden">
        {/* 좌측: 호텔 검색 결과 (그리드) */}
        <div className="flex-1 lg:w-[20%] overflow-y-auto">
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
        <div className="hidden lg:block lg:w-[80%] lg:flex-shrink-0 border-l border-gray-100">
          <div className="w-full h-full bg-gray-100 relative">
            {/* 카카오맵 영역 */}
            <KakaoMapWithMarkers
              hotels={currentPageHotels}
              selectedHotelId={selectedcontentId}
              onMarkerClick={handleHotelClick}
              isModalOpen={!!selectedcontentId}
              modalWidth={selectedcontentId ? 555 : 0}
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
