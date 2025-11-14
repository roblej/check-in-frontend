"use client";

import {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
  Suspense,
} from "react";
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
import axios from "@/lib/axios";
import { useSearchParams, useRouter } from "next/navigation";

const HotelSearchPageContent = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const {
    updateFromUrlParams,
    updateSearchParams,
    searchParams: storeSearchParams,
  } = useSearchStore();

  // URL에서 파라미터 추출 (메모이제이션으로 불필요한 재계산 방지)
  const urlDestination = searchParams.get("destination");
  const urlCheckIn = searchParams.get("checkIn");
  const urlCheckOut = searchParams.get("checkOut");
  const urlAdults = searchParams.get("adults");
  const urlDiningMode = searchParams.get("diningMode") === "true";
  const urlDiningDate = searchParams.get("diningDate");

  const urlParams = useMemo(
    () => ({
      destination: urlDestination,
      checkIn: urlCheckIn,
      checkOut: urlCheckOut,
      adults: urlAdults,
      diningMode: urlDiningMode,
      diningDate: urlDiningDate,
    }),
    [
      urlDestination,
      urlCheckIn,
      urlCheckOut,
      urlAdults,
      urlDiningMode,
      urlDiningDate,
    ]
  );

  const { destination, checkIn, checkOut, adults } = urlParams;

  // 다이닝 모드 상태
  const [isDiningMode, setIsDiningMode] = useState(urlDiningMode || false);

  // 다이닝 모드로 전환하기 전의 checkIn/checkOut 값 보존
  const savedHotelDatesRef = useRef({
    checkIn: null,
    checkOut: null,
  });

  // 초기 마운트 시 URL에서 checkIn/checkOut 값이 있으면 보존
  useEffect(() => {
    if (!urlDiningMode && (urlCheckIn || urlCheckOut)) {
      if (urlCheckIn) {
        savedHotelDatesRef.current.checkIn = urlCheckIn;
      }
      if (urlCheckOut) {
        savedHotelDatesRef.current.checkOut = urlCheckOut;
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // 초기 마운트 시에만 실행

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
  const [allSearchResults, setAllSearchResults] = useState([]); // 필터링을 위한 전체 검색 결과
  const [isSearching, setIsSearching] = useState(false);

  // URL에서 선택된 호텔 ID 가져오기 (새로고침 시 패널 유지)
  const selectedHotelId = searchParams.get("selectedHotel");
  const [selectedcontentId, setSelectedcontentId] = useState(selectedHotelId);

  // popstate 이벤트로 뒤로가기 처리 (스택형 히스토리 관리)
  const isPopStateRef = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handlePopState = (event) => {
      // popstate 이벤트 발생 플래그 설정
      isPopStateRef.current = true;

      // 현재 URL에서 selectedHotel 파라미터 읽기
      const currentUrl = new URL(window.location.href);
      const currentSelectedHotel = currentUrl.searchParams.get("selectedHotel");

      if (currentSelectedHotel) {
        // 이전 히스토리에 selectedHotel이 있으면 해당 호텔로 전환
        setSelectedcontentId(currentSelectedHotel);
      } else {
        // selectedHotel이 없으면 패널 닫기
        setSelectedcontentId(null);
      }

      // 다음 tick에서 플래그 초기화
      setTimeout(() => {
        isPopStateRef.current = false;
      }, 0);
    };

    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);
  // URL 파라미터를 Zustand 스토어에 동기화 (URL 변경 시에만)
  const prevUrlParamsRef = useRef(urlParams);
  useEffect(() => {
    const urlChanged =
      prevUrlParamsRef.current.destination !== urlParams.destination ||
      prevUrlParamsRef.current.checkIn !== urlParams.checkIn ||
      prevUrlParamsRef.current.checkOut !== urlParams.checkOut ||
      prevUrlParamsRef.current.adults !== urlParams.adults ||
      prevUrlParamsRef.current.diningMode !== urlParams.diningMode ||
      prevUrlParamsRef.current.diningDate !== urlParams.diningDate;

    if (
      urlChanged &&
      (urlParams.destination ||
        urlParams.checkIn ||
        urlParams.checkOut ||
        urlParams.adults ||
        urlParams.diningMode ||
        urlParams.diningDate)
    ) {
      // 다이닝 모드가 아닐 때 URL의 checkIn/checkOut이 있으면 보존
      if (!urlParams.diningMode && (urlParams.checkIn || urlParams.checkOut)) {
        if (urlParams.checkIn) {
          savedHotelDatesRef.current.checkIn = urlParams.checkIn;
        }
        if (urlParams.checkOut) {
          savedHotelDatesRef.current.checkOut = urlParams.checkOut;
        }
      }

      console.log("URL 파라미터를 스토어에 동기화:", {
        destination: urlParams.destination,
        checkIn: urlParams.checkIn,
        checkOut: urlParams.checkOut,
        adults: urlParams.adults,
        diningMode: urlParams.diningMode,
        diningDate: urlParams.diningDate,
      });
      
      // 다이닝 모드일 때는 checkIn/checkOut을 업데이트하지 않도록 수동으로 처리
      if (urlParams.diningMode) {
        // 다이닝 모드일 때는 checkIn/checkOut을 제외하고 업데이트
        // 스토어의 checkIn/checkOut은 유지 (빈 문자열로 덮어쓰지 않음)
        const currentCheckIn = storeSearchParams.checkIn;
        const currentCheckOut = storeSearchParams.checkOut;
        
        updateSearchParams({
          destination: urlParams.destination || "",
          diningDate: urlParams.diningDate || "",
          adults: parseInt(urlParams.adults || "2"),
          children: parseInt(urlParams.children || "0"),
          // checkIn/checkOut은 현재 스토어 값 유지 (변경하지 않음)
          checkIn: currentCheckIn,
          checkOut: currentCheckOut,
        });
      } else {
        // 호텔 모드일 때는 전체 업데이트
        updateFromUrlParams(searchParams);
      }
      
      prevUrlParamsRef.current = urlParams;
    }
  }, [urlParams, searchParams, updateFromUrlParams, storeSearchParams, updateSearchParams]);

  // URL에서 checkIn과 checkOut이 있을 때 nights 자동 계산 및 추가
  useEffect(() => {
    const urlCheckIn = searchParams.get("checkIn");
    const urlCheckOut = searchParams.get("checkOut");
    const urlNights = searchParams.get("nights");
    const urlDiningMode = searchParams.get("diningMode") === "true";

    // 다이닝 모드가 아니고, checkIn과 checkOut이 모두 있을 때만 계산
    if (!urlDiningMode && urlCheckIn && urlCheckOut) {
      const checkInDate = new Date(urlCheckIn);
      const checkOutDate = new Date(urlCheckOut);
      const calculatedNights = Math.ceil(
        (checkOutDate - checkInDate) / (1000 * 60 * 60 * 24)
      );

      // 계산된 nights와 URL의 nights가 다르면 업데이트
      if (calculatedNights > 0 && calculatedNights.toString() !== urlNights) {
        const urlParams = new URLSearchParams(searchParams.toString());
        urlParams.set("nights", calculatedNights.toString());
        router.replace(`?${urlParams.toString()}`, {
          scroll: false,
          shallow: true,
        });
      }
    } else if (urlDiningMode && urlNights) {
      // 다이닝 모드일 때는 nights 파라미터 제거
      const urlParams = new URLSearchParams(searchParams.toString());
      urlParams.delete("nights");
      router.replace(`?${urlParams.toString()}`, {
        scroll: false,
        shallow: true,
      });
    }
  }, [searchParams, router]);

  // URL에서 선택된 호텔 ID 동기화 (뒤로가기/앞으로가기 지원)
  useEffect(() => {
    // popstate 이벤트로 처리 중이면 건너뛰기
    if (isPopStateRef.current) {
      return;
    }

    const urlSelectedHotel = searchParams.get("selectedHotel");

    // URL과 상태가 다를 때만 동기화
    if (urlSelectedHotel !== selectedcontentId) {
      setSelectedcontentId(urlSelectedHotel);
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
  const [localDestination, setLocalDestination] = useState(
    localSearchParams.destination || ""
  );

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

  // 날짜 변경 핸들러 (적용 버튼 클릭 시 localStorage에 즉시 저장)
  const handleDateChange = useCallback(
    (newCheckIn, newCheckOut) => {
      // 적용 버튼 클릭 시 즉시 localStorage에 저장 (Zustand persist가 자동으로 저장)
      if (isDiningMode) {
        // 다이닝 모드: 단일 날짜만
        if (newCheckIn) {
          updateSearchParams({ diningDate: newCheckIn });
        } else {
          updateSearchParams({ diningDate: null });
        }
      } else {
        // 호텔 모드: 체크인/체크아웃
        updateSearchParams({
          checkIn: newCheckIn || "",
          checkOut: newCheckOut || "",
        });
      }
      // updateSearchParams가 Zustand store를 업데이트하고 persist가 자동으로 localStorage에 저장
      // localSearchParams는 storeSearchParams에서 가져온 값이므로 자동으로 반영됨
      setIsDatePickerOpen(false);
    },
    [isDiningMode, updateSearchParams]
  );

  // 검색 실행 핸들러
  const handleFilterSearch = useCallback(
    (e) => {
      e?.preventDefault();
      const urlParams = new URLSearchParams(searchParams.toString());

      // 페이지 파라미터 제거 (검색 시 항상 첫 페이지로)
      urlParams.delete("page");
      urlParams.delete("selectedHotel");

      if (localDestination) {
        urlParams.set("destination", localDestination);
      }

      if (isDiningMode) {
        urlParams.set("diningMode", "true");
        // 다이닝 날짜: localSearchParams > URL > 기본값 순서로 우선순위 적용
        const diningDate =
          localSearchParams.diningDate ||
          urlParams.get("diningDate") ||
          new Date().toISOString().split("T")[0];
        urlParams.set("diningDate", diningDate);
        urlParams.delete("checkIn");
        urlParams.delete("checkOut");
        urlParams.delete("nights"); // 다이닝 모드일 때는 nights 제거
      } else {
        // 호텔 모드: 체크인/체크아웃 (기본값 없음)
        const checkInDate =
          localSearchParams.checkIn ||
          urlParams.get("checkIn") ||
          "";
        const checkOutDate =
          localSearchParams.checkOut ||
          urlParams.get("checkOut") ||
          "";

        // 값이 있을 때만 URL에 설정
        if (checkInDate) {
          urlParams.set("checkIn", checkInDate);
        } else {
          urlParams.delete("checkIn");
        }
        
        if (checkOutDate) {
          urlParams.set("checkOut", checkOutDate);
        } else {
          urlParams.delete("checkOut");
        }
        
        urlParams.delete("diningDate");
        urlParams.delete("diningMode");

        // nights 계산 및 추가 (값이 모두 있을 때만)
        if (checkInDate && checkOutDate) {
          const nights = Math.ceil(
            (new Date(checkOutDate) - new Date(checkInDate)) /
              (1000 * 60 * 60 * 24)
          );
          urlParams.set("nights", nights.toString());
        } else {
          urlParams.delete("nights");
        }
      }

      if (localSearchParams.adults) {
        urlParams.set("adults", localSearchParams.adults.toString());
      } else if (urlParams.get("adults")) {
        // URL에 adults가 있으면 유지
        urlParams.set("adults", urlParams.get("adults"));
      } else {
        urlParams.set("adults", "2");
      }

      router.push(`/hotel-search?${urlParams.toString()}`);
    },
    [
      localDestination,
      localSearchParams.checkIn,
      localSearchParams.checkOut,
      localSearchParams.diningDate,
      localSearchParams.adults,
      router,
      isDiningMode,
      searchParams,
    ]
  );

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
  const hotel_url = "/hotel/search";

  // 호텔 데이터 (임시)
  const [filteredHotels, setFilteredHotels] = useState([]);

  // 페이지네이션 상태 (URL에서 초기값 읽기)
  const urlPage = searchParams.get("page");
  const [currentPage, setCurrentPage] = useState(() => {
    const page = urlPage ? parseInt(urlPage, 10) : 0;
    return isNaN(page) || page < 0 ? 0 : page;
  });
  const pageSize = 10;
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [lastTotalElements, setLastTotalElements] = useState(0); // 마지막 검색 결과의 totalElements 저장

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
  const lastFetchedKeyRef = useRef(null);
  const lastAllHotelsKeyRef = useRef(null); // getAllHotels 캐시 키
  const isFetchingAllHotelsRef = useRef(false); // getAllHotels 중복 호출 방지

  // 전체 호텔 데이터 가져오기 (필터링용) - 필터가 활성화되어 있을 때만 호출
  const getAllHotels = useCallback(
    async (destinationParam, force = false, totalElementsParam = null) => {
      const currentDestination =
        destinationParam || localSearchParams.destination;

      if (!currentDestination) {
        return null;
      }

      // 최소 2글자 이상 검증
      const trimmedDestination = currentDestination.trim();
      if (trimmedDestination.length < 2) {
        return null;
      }

      // 필터가 활성화되어 있는지 확인
      const hasActiveFilters =
        filters.priceMin > 0 ||
        filters.priceMax < 500000 ||
        filters.starRatings.length > 0 ||
        filters.amenities.length > 0;

      // 필터가 없고 강제 호출이 아니면 스킵
      if (!hasActiveFilters && !force) {
        return null;
      }

      // 캐시 키: destination + hasDining
      const cacheKey = `${trimmedDestination}_${isDiningMode}`;
      
      // 이미 같은 검색어로 전체 데이터를 가져왔으면 스킵
      if (!force && lastAllHotelsKeyRef.current === cacheKey) {
        return null;
      }

      // 이미 호출 중이면 스킵
      if (isFetchingAllHotelsRef.current) {
        return null;
      }

      try {
        isFetchingAllHotelsRef.current = true;
        lastAllHotelsKeyRef.current = cacheKey;

        // 실제 검색 결과 개수를 사용하여 size 설정
        // totalElementsParam이 있으면 사용, 없으면 lastTotalElements 사용, 둘 다 없으면 기본값 100 사용
        const sizeToUse = totalElementsParam || lastTotalElements || 100;
        // 최대 1000개로 제한 (너무 큰 요청 방지)
        const finalSize = Math.min(sizeToUse, 1000);

        const requestParams = {
          page: 0,
          size: finalSize,
        };
        if (isDiningMode) {
          requestParams.hasDining = true;
        }

        const res = await axios.post(
          hotel_url,
          {
            title: trimmedDestination,
          },
          {
            params: requestParams,
          }
        );

        if (res.data) {
          const hotels = res.data.content || res.data;
          const allHotels = Array.isArray(hotels) ? hotels : [];

          // 전체 검색 결과 저장 (필터링용)
          setAllSearchResults(allHotels);

          return allHotels;
        }
      } catch (error) {
        console.error("전체 호텔 데이터 가져오기 실패:", error);
        lastAllHotelsKeyRef.current = null; // 실패 시 재시도 가능하도록
        return null;
      } finally {
        isFetchingAllHotelsRef.current = false;
      }
    },
    [localSearchParams, isDiningMode, filters, lastTotalElements]
  );

  const getHotels = useCallback(
    async (destinationParam, page = currentPage) => {
      const currentDestination =
        destinationParam || localSearchParams.destination;

      if (!currentDestination) {
        return null;
      }

      // 최소 2글자 이상 검증
      const trimmedDestination = currentDestination.trim();
      if (trimmedDestination.length < 2) {
        console.log("검색어가 2글자 미만입니다. 검색을 수행하지 않습니다.");
        setIsSearching(false);
        setSearchResults([]);
        setAllSearchResults([]);
        setTotalPages(0);
        setTotalElements(0);
        return null;
      }

      // 캐시 키: destination + page + hasDining
      const cacheKey = `${trimmedDestination}_${page}_${isDiningMode}`;
      if (isFetchingRef.current || lastFetchedKeyRef.current === cacheKey) {
        return null;
      }

      try {
        isFetchingRef.current = true;
        lastFetchedKeyRef.current = cacheKey;
        setIsSearching(true); // 로딩 상태 시작

        console.log("=== getHotels 디버깅 ===");
        console.log("URL에서 받은 destination:", urlDestination);
        console.log("localSearchParams.destination:", currentDestination);
        console.log("현재 페이지:", page);
        console.log("페이지 크기:", pageSize);

        // 다이닝 모드일 때만 hasDining 파라미터 전달 (명시적으로 true)
        const requestParams = {
          page: page,
          size: pageSize,
        };
        if (isDiningMode) {
          requestParams.hasDining = true;
        }

        const res = await axios.post(
          hotel_url,
          {
            title: trimmedDestination,
          },
          {
            params: requestParams,
          }
        );

        if (res.data) {
          console.log("=== 호텔 검색 결과 ===");
          console.log("API 응답:", res.data);

          // Page 형식 응답 처리
          const hotels = res.data.content || res.data;
          const totalPagesValue = res.data.totalPages || 0;
          const totalElementsValue =
            res.data.totalElements ||
            (Array.isArray(hotels) ? hotels.length : 0);

          console.log(
            "호텔 목록 개수:",
            Array.isArray(hotels) ? hotels.length : 0
          );
          console.log("총 페이지 수:", totalPagesValue);
          console.log("총 호텔 개수:", totalElementsValue);

          setSearchResults(Array.isArray(hotels) ? hotels : []);
          setTotalPages(totalPagesValue);
          // totalElements는 필터링 로직에서 설정하므로 여기서는 설정하지 않음
          
          // totalElements를 저장하여 getAllHotels에서 사용
          if (totalElementsValue > 0) {
            setLastTotalElements(totalElementsValue);
          }

          // getAllHotels는 필터가 활성화되어 있을 때만 호출되도록 getAllHotels 내부에서 체크
          // 비동기로 호출하되 await하지 않아서 페이지 로딩을 블로킹하지 않음
          // totalElementsValue를 전달하여 정확한 크기로 요청
          getAllHotels(destinationParam, false, totalElementsValue).catch((error) => {
            // getAllHotels 내부에서 필터 체크를 하므로 에러는 무시해도 됨
            if (error) {
              console.error("전체 호텔 데이터 가져오기 실패:", error);
            }
          });

          return hotels;
        }
      } catch (error) {
        console.error("호텔 데이터 가져오기 실패:", error);
        lastFetchedKeyRef.current = null; // 실패 시 재시도 가능하도록
        return null;
      } finally {
        isFetchingRef.current = false;
        setIsSearching(false); // 로딩 상태 종료
      }
    },
    [localSearchParams, urlDestination, isDiningMode, pageSize, getAllHotels]
  ); // currentPage는 dependency에서 제거 (무한 루프 방지)

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
      getHotels(urlDestination, currentPage);
      return;
    }

    // URL에 destination이 있고, 변경된 경우
    if (urlDestination && urlDestination !== prevUrlDestinationRef.current) {
      hasInitializedRef.current = true;
      prevUrlDestinationRef.current = urlDestination;
      // URL 파라미터를 직접 사용하여 검색 실행 (스토어 동기화 완료를 기다리지 않음)
      getHotels(urlDestination, currentPage);
    }
    // 스토어의 destination이 변경된 경우 (URL이 없거나 같을 때)
    else if (
      storeDestination &&
      storeDestination !== prevDestinationRef.current
    ) {
      hasInitializedRef.current = true;
      prevDestinationRef.current = storeDestination;
      getHotels(storeDestination, currentPage);
    }
  }, [
    urlParams.destination,
    localSearchParams.destination,
    getHotels,
    currentPage,
  ]);

  // 페이지 변경 시 API 재호출 (전체 데이터는 가져오지 않음)
  useEffect(() => {
    if (localSearchParams.destination) {
      const trimmedDestination = localSearchParams.destination.trim();
      if (trimmedDestination.length >= 2) {
        lastFetchedKeyRef.current = null; // 페이지 변경 시 캐시 무효화
        getHotels(localSearchParams.destination, currentPage);
        // 페이지 변경 시에는 getAllHotels를 호출하지 않음 (이미 가져온 전체 데이터 사용)
      }
    }
  }, [currentPage, localSearchParams.destination, getHotels]); // currentPage 변경 시에만 실행

  // 다이닝 모드 변경 시 검색 다시 실행
  const prevDiningModeRef = useRef(isDiningMode);
  useEffect(() => {
    if (
      prevDiningModeRef.current !== isDiningMode &&
      localSearchParams.destination
    ) {
      prevDiningModeRef.current = isDiningMode;
      // 검색어가 있으면 다시 검색
      if (localSearchParams.destination) {
        lastFetchedKeyRef.current = null; // 강제 재검색
        getHotels(localSearchParams.destination, currentPage);
      }
    }
    prevDiningModeRef.current = isDiningMode;
  }, [isDiningMode, localSearchParams.destination, getHotels]);

  // 필터 모달이 열릴 때 전체 데이터 가져오기 (갯수 카운트를 위해)
  useEffect(() => {
    if (showFiltersPanel && localSearchParams.destination) {
      const trimmedDestination = localSearchParams.destination.trim();
      if (trimmedDestination.length >= 2 && allSearchResults.length === 0) {
        // 필터 모달이 열렸고 전체 데이터가 없으면 가져오기
        // lastTotalElements를 사용하여 정확한 크기로 요청
        getAllHotels(localSearchParams.destination, true, lastTotalElements).catch((error) => {
          console.error("필터 모달용 전체 호텔 데이터 가져오기 실패:", error);
        });
      }
    }
  }, [showFiltersPanel, localSearchParams.destination, allSearchResults.length, getAllHotels, lastTotalElements]);
  // 이전 필터/정렬 값 추적 (실제 변경 감지용)
  const prevFiltersRef = useRef(null);

  // 필터링 - 전체 검색 결과에 대해 필터링 적용
  useEffect(() => {
    // 필터가 적용되어 있으면 전체 검색 결과 사용, 없으면 현재 페이지 결과 사용
    const hasActiveFilters =
      filters.priceMin > 0 ||
      filters.priceMax < 500000 ||
      filters.starRatings.length > 0 ||
      filters.amenities.length > 0;

    // 필터가 활성화되어 있고 전체 검색 결과가 없으면 가져오기
    if (hasActiveFilters && allSearchResults.length === 0 && localSearchParams.destination) {
      const trimmedDestination = localSearchParams.destination.trim();
      if (trimmedDestination.length >= 2) {
        // lastTotalElements를 사용하여 정확한 크기로 요청
        getAllHotels(localSearchParams.destination, true, lastTotalElements).catch((error) => {
          console.error("필터링을 위한 전체 호텔 데이터 가져오기 실패:", error);
        });
        // 전체 데이터를 가져오는 동안 현재 페이지 결과만 표시
        setFilteredHotels(searchResults);
        return;
      }
    }

    // 전체 검색 결과가 없으면 필터링하지 않음 (getAllHotels가 완료될 때까지 대기)
    if (allSearchResults.length === 0 && searchResults.length > 0 && hasActiveFilters) {
      // 전체 검색 결과가 아직 로드되지 않았으면 현재 페이지 결과만 표시
      setFilteredHotels(searchResults);
      return;
    }

    // 필터가 없을 때도 전체 검색 결과가 있으면 사용 (전체 개수 표시를 위해)
    const hotels =
      allSearchResults.length > 0 ? allSearchResults : searchResults;
    console.log(
      "필터링 대상 호텔:",
      hotels.length,
      "전체 검색 결과:",
      allSearchResults.length,
      "현재 페이지:",
      searchResults.length
    );

    if (!Array.isArray(hotels) || hotels.length === 0) {
      setFilteredHotels([]);
      setTotalPages(0);
      setTotalElements(0);
      if (!prevFiltersRef.current) {
        prevFiltersRef.current = { sortBy, filters, searchResults };
      }
      return;
    }

    // 필터가 없을 때는 필터링 없이 전체 데이터 사용
    let filtered = hasActiveFilters
      ? hotels.filter((hotel) => {
          // 가격 필터링 (가격 정보가 있는 경우에만 필터링)
          // minPrice, maxPrice, price 중 하나라도 있으면 필터링 적용
          const hotelPrice =
            hotel.minPrice || hotel.maxPrice || hotel.price || null;
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

          // 편의시설 필터링 (주차, 식당)
          if (filters.amenities.length > 0) {
            const hasParking = filters.amenities.includes("주차");
            const hasRestaurant = filters.amenities.includes("식당");

            // 주차 필터 체크
            if (hasParking) {
              const parkinglodging = hotel.parkinglodging || "";
              if (!parkinglodging.includes("가능")) {
                return false;
              }
            }

            // 식당 필터 체크
            if (hasRestaurant) {
              const foodplace = hotel.foodplace || "";
              if (!foodplace || foodplace.trim() === "") {
                return false;
              }
            }
          }

          return true;
        })
      : hotels; // 필터가 없으면 필터링 없이 전체 데이터 사용

    // 중복 제거 (contentId 기준)
    const uniqueFiltered = [];
    const seenContentIds = new Set();
    for (const hotel of filtered) {
      const contentId = hotel.contentId;
      if (contentId && !seenContentIds.has(contentId)) {
        seenContentIds.add(contentId);
        uniqueFiltered.push(hotel);
      } else if (!contentId) {
        // contentId가 없는 경우도 포함 (중복 체크 불가)
        uniqueFiltered.push(hotel);
      }
    }
    filtered = uniqueFiltered;

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

    // 필터링된 결과를 페이지네이션
    const filteredTotalElements = filtered.length;
    const filteredTotalPages = Math.ceil(filteredTotalElements / pageSize);

    // 현재 페이지가 총 페이지 수를 초과하면 마지막 페이지로 조정
    const validCurrentPage =
      currentPage >= filteredTotalPages
        ? Math.max(0, filteredTotalPages - 1)
        : currentPage;

    const startIndex = validCurrentPage * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedFiltered = filtered.slice(startIndex, endIndex);

    console.log("=== 필터링 결과 디버깅 ===");
    console.log("필터링된 전체 개수:", filteredTotalElements);
    console.log("계산된 총 페이지 수:", filteredTotalPages);
    console.log("원래 현재 페이지:", currentPage);
    console.log("조정된 현재 페이지:", validCurrentPage);
    console.log("페이지 크기:", pageSize);
    console.log("현재 페이지에 표시될 항목 수:", paginatedFiltered.length);
    console.log("필터 적용 여부:", hasActiveFilters);

    setFilteredHotels(paginatedFiltered);
    setTotalPages(filteredTotalPages);

    // 현재 페이지가 조정되었으면 URL도 업데이트
    if (validCurrentPage !== currentPage) {
      setCurrentPage(validCurrentPage);
      const urlParams = new URLSearchParams(searchParams.toString());
      if (validCurrentPage > 0) {
        urlParams.set("page", validCurrentPage.toString());
      } else {
        urlParams.delete("page");
      }
      router.replace(`?${urlParams.toString()}`, {
        scroll: false,
        shallow: true,
      });
    }

    // 필터가 없을 때는 전체 검색 결과 개수 사용, 필터가 있을 때는 필터링된 개수 사용
    if (hasActiveFilters) {
      setTotalElements(filteredTotalElements);
    } else {
      // 필터가 없을 때는 전체 검색 결과 개수 사용
      const totalCount =
        allSearchResults.length > 0
          ? allSearchResults.length
          : filteredTotalElements;
      setTotalElements(totalCount);
    }

    // 필터/정렬이 실제로 변경되었을 때만 페이지 리셋 (첫 실행이 아닐 때만)
    // searchResults 변경은 제외 (검색 결과가 업데이트되는 것은 정상이며, 페이지를 리셋할 필요 없음)
    let filtersChanged = false;
    let sortByChanged = false;

    if (prevFiltersRef.current !== null) {
      filtersChanged =
        JSON.stringify(prevFiltersRef.current.filters) !==
        JSON.stringify(filters);
      sortByChanged = prevFiltersRef.current.sortBy !== sortBy;

      // 필터나 정렬이 변경되었을 때만 페이지 리셋
      if (filtersChanged || sortByChanged) {
        // 필터링이 변경되면 첫 페이지로 리셋
        setCurrentPage(0);
        setSelectedcontentId(null);

        // URL에서 page 파라미터 제거
        if (typeof window !== "undefined") {
          const urlParams = new URLSearchParams(window.location.search);
          if (urlParams.get("page")) {
            urlParams.delete("page");
            urlParams.delete("selectedHotel");
            router.replace(`?${urlParams.toString()}`, {
              scroll: false,
              shallow: true,
            });
          }
        }
      }
    }

    // 현재 값 저장 (searchResults는 저장하되, 변경 감지에는 사용하지 않음)
    prevFiltersRef.current = { sortBy, filters, searchResults };
  }, [
    sortBy,
    filters,
    searchResults,
    allSearchResults,
    currentPage,
    pageSize,
    router,
    localSearchParams.destination,
    getAllHotels,
  ]); // allSearchResults와 currentPage, pageSize 추가

  // 현재 페이지에 해당하는 호텔 (필터링 후 페이지네이션된 데이터)
  const currentPageHotels = useMemo(() => {
    return filteredHotels; // 필터링 후 페이지네이션된 데이터
  }, [filteredHotels]);

  // 페이지 변경 핸들러
  const handlePageChange = useCallback(
    (page) => {
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
      router.replace(`?${urlParams.toString()}`, {
        scroll: false,
        shallow: true,
      });
      // 페이지 변경 시 스크롤을 상단으로 이동
      if (typeof window !== "undefined") {
        const resultsPanel = document.querySelector("[data-hotel-results]");
        if (resultsPanel) {
          resultsPanel.scrollTop = 0;
        }
      }
    },
    [searchParams, router]
  );

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
  const handleHotelClick = useCallback(
    (hotelId) => {
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
        // URL 먼저 변경 (히스토리에 push)
        const urlParams = new URLSearchParams(searchParams.toString());
        urlParams.delete("selectedHotel");
        router.push(`?${urlParams.toString()}`, {
          scroll: false,
        });

        // 그 다음 상태 변경
        setSelectedcontentId(null);
        return;
      }

      // 다른 호텔 클릭 시 히스토리에 push (스택형 관리)
      const urlParams = new URLSearchParams(searchParams.toString());
      urlParams.set("selectedHotel", hotelId);
      // 현재 페이지 정보 유지
      if (currentPage > 0) {
        urlParams.set("page", currentPage.toString());
      }

      // router.push로 히스토리 스택에 추가
      router.push(`?${urlParams.toString()}`, { scroll: false });
      setSelectedcontentId(hotelId);
    },
    [selectedcontentId, searchParams, router, currentPage]
  );

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
  // URL 파라미터 우선, 그 다음 호텔별 저장값, 마지막으로 전역 스토어
  const currentHotelSearchParams = useMemo(() => {
    // URL 파라미터에서 직접 읽기
    const urlCheckIn = searchParams.get("checkIn");
    const urlCheckOut = searchParams.get("checkOut");
    const urlDiningDate = searchParams.get("diningDate");
    const urlDestination = searchParams.get("destination");
    const urlNights = searchParams.get("nights");
    const urlAdults = searchParams.get("adults");

    // 다이닝 모드: diningDate가 있으면 사용 (기존 로직 유지)
    if (isDiningMode && urlDiningDate) {
      const urlParams = {
        destination: urlDestination || "",
        diningDate: urlDiningDate || "",
        adults: parseInt(urlAdults || "2"),
      };

      // 호텔별 저장값이 있으면 병합
      if (selectedcontentId) {
        const hotelParams = hotelSearchParams[selectedcontentId];
        if (hotelParams && hotelParams.diningDate) {
          return { ...urlParams, ...hotelParams };
        }
      }

      return { ...localSearchParams, ...urlParams };
    }

    // 호텔 모드: URL에 체크인/체크아웃 날짜가 있으면 URL 파라미터 우선 사용
    if (urlCheckIn || urlCheckOut) {
      const urlParams = {
        destination: urlDestination || "",
        checkIn: urlCheckIn || "",
        checkOut: urlCheckOut || "",
        nights: parseInt(urlNights || "1"),
        adults: parseInt(urlAdults || "2"),
      };

      // 호텔별 저장값이 있으면 병합 (호텔별로 다른 날짜를 사용할 수 있도록)
      if (selectedcontentId) {
        const hotelParams = hotelSearchParams[selectedcontentId];
        if (hotelParams && (hotelParams.checkIn || hotelParams.checkOut)) {
          return { ...urlParams, ...hotelParams };
        }
      }

      return urlParams;
    }

    // URL에 날짜가 없으면 호텔별 저장값 또는 전역 스토어 사용
    if (!selectedcontentId) return localSearchParams;

    const hotelParams = hotelSearchParams[selectedcontentId];
    if (
      hotelParams &&
      (hotelParams.checkIn || hotelParams.checkOut || hotelParams.diningDate)
    ) {
      return { ...localSearchParams, ...hotelParams };
    }

    return localSearchParams;
  }, [
    selectedcontentId,
    hotelSearchParams,
    localSearchParams,
    searchParams,
    isDiningMode,
  ]);

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

  // 다이닝 모드 토글 핸들러
  const handleDiningModeToggle = useCallback(() => {
    const newDiningMode = !isDiningMode;
    setIsDiningMode(newDiningMode);

    const urlParams = new URLSearchParams(searchParams.toString());
    if (newDiningMode) {
      // 다이닝 모드로 전환하기 전에 현재 checkIn/checkOut 값을 보존
      // 우선순위: URL > 스토어 > savedHotelDatesRef
      const currentCheckIn = urlParams.get("checkIn") || localSearchParams.checkIn || savedHotelDatesRef.current.checkIn;
      const currentCheckOut = urlParams.get("checkOut") || localSearchParams.checkOut || savedHotelDatesRef.current.checkOut;
      
      // 값이 실제로 있을 때만 보존 (빈 문자열이나 null이 아닐 때)
      if (currentCheckIn && currentCheckIn.trim() !== "") {
        savedHotelDatesRef.current.checkIn = currentCheckIn;
      }
      if (currentCheckOut && currentCheckOut.trim() !== "") {
        savedHotelDatesRef.current.checkOut = currentCheckOut;
      }

      urlParams.set("diningMode", "true");
      // 다이닝 모드로 변경 시 체크인 날짜를 다이닝 날짜로 설정
      // URL에 이미 diningDate가 있으면 유지, 없으면 체크인 날짜 사용, 둘 다 없으면 오늘 날짜
      const diningDate =
        urlParams.get("diningDate") ||
        localSearchParams.diningDate ||
        currentCheckIn ||
        new Date().toISOString().split("T")[0];
      urlParams.set("diningDate", diningDate);
      urlParams.delete("checkIn");
      urlParams.delete("checkOut");
    } else {
      urlParams.delete("diningMode");
      urlParams.delete("diningDate");
      // 호텔 모드로 변경 시 체크인/체크아웃 설정
      // 보존된 값 > 스토어 값 > URL 순서로 우선순위 적용 (기본값 없음)
      const checkInDate =
        (savedHotelDatesRef.current.checkIn && savedHotelDatesRef.current.checkIn.trim() !== "") 
          ? savedHotelDatesRef.current.checkIn
          : (localSearchParams.checkIn && localSearchParams.checkIn.trim() !== "")
          ? localSearchParams.checkIn
          : urlParams.get("checkIn") || "";
      
      const checkOutDate =
        (savedHotelDatesRef.current.checkOut && savedHotelDatesRef.current.checkOut.trim() !== "")
          ? savedHotelDatesRef.current.checkOut
          : (localSearchParams.checkOut && localSearchParams.checkOut.trim() !== "")
          ? localSearchParams.checkOut
          : urlParams.get("checkOut") || "";

      // 값이 있을 때만 스토어와 URL에 설정
      if (checkInDate && checkOutDate) {
        // 스토어에 먼저 저장 (URL 업데이트 전에)
        updateSearchParams({
          checkIn: checkInDate,
          checkOut: checkOutDate,
        });

        urlParams.set("checkIn", checkInDate);
        urlParams.set("checkOut", checkOutDate);
      } else {
        // 값이 없으면 URL에서 삭제하고 스토어도 빈 값으로 설정
        urlParams.delete("checkIn");
        urlParams.delete("checkOut");
        updateSearchParams({
          checkIn: "",
          checkOut: "",
        });
      }
    }
    router.replace(`?${urlParams.toString()}`, {
      scroll: false,
      shallow: true,
    });
  }, [isDiningMode, searchParams, router, localSearchParams, updateSearchParams]);

  // URL에서 다이닝 모드 동기화
  useEffect(() => {
    setIsDiningMode(urlDiningMode || false);
  }, [urlDiningMode]);

  return (
    <div className="h-screen bg-gray-50 overflow-hidden flex flex-col">
      <Header />

      {/* 검색 조건 및 필터 바 */}
      <div className="bg-white border-b border-gray-200 flex-shrink-0 shadow-sm">
        <div className="max-w-[1020px] mx-auto px-4 py-2">
          <div className="flex flex-col gap-2 lg:flex-row lg:flex-nowrap lg:items-center lg:gap-3">
            {/* 줄 1: 다이닝 + 목적지 */}
            <div className="flex w-full flex-wrap gap-2 sm:flex-nowrap lg:flex-1">
              <button
                onClick={handleDiningModeToggle}
                className={`flex h-11 min-w-[88px] flex-none items-center justify-center rounded-md px-3 text-xs font-medium transition-colors whitespace-nowrap ${
                  isDiningMode
                    ? "bg-blue-500 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                다이닝
              </button>

              <input
                type="text"
                value={localDestination}
                onChange={(e) => setLocalDestination(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleFilterSearch(e);
                  }
                }}
                placeholder={isDiningMode ? "호텔명을 입력하세요" : "목적지"}
                className="h-11 min-w-[150px] flex-1 rounded-md border border-gray-200 bg-white px-3 text-sm text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* 줄 2: 날짜 + 인원 */}
            <div className="flex w-full flex-wrap gap-2 sm:flex-nowrap lg:flex-[0.9]">
              <div className="relative date-picker-container h-11 flex-1 min-w-[200px] sm:min-w-[220px] lg:min-w-[240px]">
                {isDiningMode ? (
                  <div
                    className="flex h-full items-center justify-between sm:justify-start gap-2 px-3 border border-gray-200 rounded-md bg-white hover:border-gray-300 cursor-pointer"
                    onClick={() => setIsDatePickerOpen(true)}
                  >
                    <div className="text-xs text-gray-500 min-w-[80px]">
                      {localSearchParams.diningDate || urlDiningDate
                        ? formatDateDisplay(
                            localSearchParams.diningDate || urlDiningDate
                          )
                        : "다이닝 날짜"}
                    </div>
                  </div>
                ) : (
                  <div
                    className="flex h-full items-center justify-between sm:justify-start gap-2 px-3 border border-gray-200 rounded-md bg-white hover:border-gray-300 cursor-pointer"
                    onClick={() => setIsDatePickerOpen(true)}
                  >
                    <div className="text-xs text-gray-500 min-w-[60px]">
                      {localSearchParams.checkIn
                        ? formatDateDisplay(localSearchParams.checkIn)
                        : "체크인"}
                    </div>
                    <span className="text-gray-300">-</span>
                    <div className="text-xs text-gray-500 min-w-[60px]">
                      {localSearchParams.checkOut
                        ? formatDateDisplay(localSearchParams.checkOut)
                        : "체크아웃"}
                    </div>
                  </div>
                )}

                {/* 날짜 선택 컴포넌트 */}
                {isDatePickerOpen && (
                  <div className="absolute top-full left-0 z-[9999] mt-1 w-full">
                    <SearchCondition
                      isOpen={isDatePickerOpen}
                      onClose={() => setIsDatePickerOpen(false)}
                      checkIn={
                        isDiningMode
                          ? localSearchParams.diningDate || urlDiningDate || ""
                          : localSearchParams.checkIn || ""
                      }
                      checkOut={
                        isDiningMode ? "" : localSearchParams.checkOut || ""
                      }
                      onDateChange={handleDateChange}
                      selectedType={isDiningMode ? "dining" : "hotel"}
                      className="w-full"
                    />
                  </div>
                )}
              </div>

              {/* 성인 인원 */}
              <div className="flex h-11 min-w-[160px] flex-1 items-center justify-between gap-2 rounded-md border border-gray-200 bg-white px-3 sm:flex-none sm:w-[170px] lg:w-[160px]">
                <button
                  onClick={() => {
                    const newAdults = Math.max(
                      1,
                      (localSearchParams.adults || 2) - 1
                    );
                    // 스토어에만 저장 (URL은 검색 버튼 클릭 시에만 업데이트)
                    updateSearchParams({ adults: newAdults });
                  }}
                  className="flex h-8 w-8 items-center justify-center rounded border border-gray-200 text-sm font-semibold hover:bg-gray-50"
                >
                  -
                </button>
                <div className="flex h-9 flex-1 items-center justify-center rounded-md border border-gray-200 bg-white px-3 text-sm font-medium text-center">
                  {localSearchParams.adults || 2}
                </div>
                <button
                  onClick={() => {
                    const newAdults = (localSearchParams.adults || 2) + 1;
                    // 스토어에만 저장 (URL은 검색 버튼 클릭 시에만 업데이트)
                    updateSearchParams({ adults: newAdults });
                  }}
                  className="flex h-8 w-8 items-center justify-center rounded border border-gray-200 text-sm font-semibold hover:bg-gray-50"
                >
                  +
                </button>
              </div>
            </div>

            {/* 줄 3: 검색 + 정렬/필터 */}
            <div className="flex w-full items-center gap-2 sm:gap-3 lg:ml-auto lg:w-auto lg:flex-nowrap">
              <button
                onClick={handleFilterSearch}
                disabled={isSearching}
                className={`flex h-11 flex-none items-center justify-center gap-2 rounded-md bg-blue-500 px-4 text-sm font-medium text-white transition-colors hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed ${
                  isSearching ? "min-w-[120px]" : "w-[106px]"
                }`}
              >
                {isSearching ? (
                  <>
                    <svg
                      className="animate-spin h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    <span>검색 중...</span>
                  </>
                ) : (
                  "검색"
                )}
              </button>

              <div className="flex flex-1 items-center gap-2 sm:gap-2 lg:w-auto lg:flex-none lg:justify-end">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="h-11 flex-1 min-w-[110px] max-w-[200px] rounded-md border border-gray-200 px-3 text-sm font-medium text-gray-700 transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 hover:border-gray-300 bg-white sm:min-w-[120px]"
                >
                  <option value="인기순">인기순</option>
                  <option value="낮은 가격순">낮은 가격순</option>
                  <option value="높은 가격순">높은 가격순</option>
                  <option value="평점순">평점순</option>
                </select>

                <button
                  onClick={() => setShowFiltersPanel(!showFiltersPanel)}
                  className="flex h-11 min-w-[100px] flex-none items-center gap-2 rounded-md border border-gray-200 px-4 text-sm font-medium text-gray-700 transition-colors hover:border-gray-300 hover:bg-gray-50 lg:min-w-[110px]"
                >
                  <span className="text-base">🔍</span>
                  <span>필터</span>
                </button>

                {(filters.priceMin > 0 ||
                  filters.priceMax < 500000 ||
                  filters.starRatings.length > 0 ||
                  filters.amenities.length > 0) && (
                  <button
                    onClick={handleFilterReset}
                    className="flex h-11 min-w-[90px] flex-none items-center rounded-md px-2.5 text-sm font-medium text-blue-600 transition-colors hover:bg-blue-50 hover:text-blue-700 lg:min-w-[100px]"
                  >
                    초기화
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 메인 컨텐츠 - 좌우 분할 */}
      <div className="flex flex-1 relative overflow-hidden">
        {/* 좌측: 호텔 검색 결과 (그리드) */}
        <div className="flex-1 lg:w-[20%] overflow-y-auto relative">
          {/* 검색 중 로딩 오버레이 */}
          {isSearching && (
            <div className="absolute inset-0 bg-white bg-opacity-80 z-50 flex items-center justify-center">
              <div className="flex flex-col items-center gap-3">
                <svg
                  className="animate-spin h-12 w-12 text-blue-500"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                <p className="text-sm font-medium text-gray-700">
                  호텔 검색 중...
                </p>
              </div>
            </div>
          )}
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
              totalElements={totalElements}
              pageSize={pageSize}
              onPageChange={handlePageChange}
              filters={filters}
              onFilterChange={handleFilterChange}
              onFilterReset={handleFilterReset}
              isLoading={isSearching}
              allSearchResults={allSearchResults}
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
          // 상태를 먼저 변경 (즉시 패널 닫기)
          setSelectedcontentId(null);

          // 그 다음 URL 변경 (히스토리에 push)
          const urlParams = new URLSearchParams(searchParams.toString());
          urlParams.delete("selectedHotel");
          router.push(`?${urlParams.toString()}`, { scroll: false });
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
    <Suspense
      fallback={
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
      }
    >
      <HotelSearchPageContent />
    </Suspense>
  );
};

export default HotelSearchPage;
