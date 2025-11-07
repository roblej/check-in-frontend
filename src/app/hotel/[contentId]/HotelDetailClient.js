"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import HotelDetail from "@/components/hotel/HotelDetail";
import { useSearchStore } from "@/stores/searchStore";

/**
 * 호텔 상세 페이지의 클라이언트 컴포넌트
 * URL 쿼리 파라미터를 로컬 상태로 관리하여 전체 스토어에 영향 없음
 * 호텔별로 로컬스토리지에 검색 조건 저장
 */
const HotelDetailClient = ({ contentId, searchParams: serverSearchParams }) => {
  const { searchParams: storeSearchParams } = useSearchStore();
  const clientSearchParams = useSearchParams(); // 클라이언트에서 URL 파라미터 읽기

  // 호텔별 로컬스토리지 키
  const hotelStorageKey = `hotel_${contentId}_searchParams`;

  // 초기값 설정: 서버 URL 파라미터 -> 호텔별 로컬스토리지 -> 전역 스토어
  // 클라이언트 URL 파라미터는 useEffect에서 처리
  const [localSearchParams, setLocalSearchParams] = useState(() => {
    // 1. 서버 URL 파라미터 확인
    if (serverSearchParams && Object.keys(serverSearchParams).length > 0) {
      const hasDateParams =
        serverSearchParams.checkIn || serverSearchParams.checkOut;
      if (hasDateParams) {
        return {
          destination: serverSearchParams.destination || "",
          checkIn: serverSearchParams.checkIn || "",
          checkOut: serverSearchParams.checkOut || "",
          nights: parseInt(serverSearchParams.nights || "1"),
          adults: parseInt(serverSearchParams.adults || "2"),
        };
      }
    }

    // 2. 호텔별 로컬스토리지 확인
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(`hotel_${contentId}_searchParams`);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.checkIn || parsed.checkOut) {
            return {
              destination: parsed.destination || "",
              checkIn: parsed.checkIn || "",
              checkOut: parsed.checkOut || "",
              nights: parseInt(parsed.nights || "1"),
              adults: parseInt(parsed.adults || "2"),
            };
          }
        }
      } catch (e) {
        console.warn("호텔별 검색 조건 복원 실패:", e);
      }
    }

    // 3. 전역 스토어 확인 (localStorage에서 직접 읽기)
    // zustand persist는 {state: {...}, version: 0} 형식으로 저장됨
    if (typeof window !== "undefined") {
      try {
        const storeData = localStorage.getItem("search-storage");
        if (storeData) {
          const parsed = JSON.parse(storeData);
          // zustand persist 형식 확인
          const globalParams =
            parsed?.state?.searchParams || parsed?.searchParams;
          if (globalParams && (globalParams.checkIn || globalParams.checkOut)) {
            return {
              destination: globalParams.destination || "",
              checkIn: globalParams.checkIn || "",
              checkOut: globalParams.checkOut || "",
              nights: parseInt(globalParams.nights || "1"),
              adults: parseInt(globalParams.adults || "2"),
            };
          }
        }
      } catch (e) {
        console.warn("전역 검색 조건 복원 실패:", e);
      }
    }

    // 4. 기본값 (빈 값으로 설정, useEffect에서 URL이나 전역 스토어에서 복원)
    return {
      destination: "",
      checkIn: "",
      checkOut: "",
      nights: 1,
      adults: 2,
    };
  });

  // 전역 스토어에서 초기값이 없을 때 복원
  // zustand persist는 비동기로 로드되므로 전역 스토어가 준비될 때까지 기다림
  const [hasInitializedFromStore, setHasInitializedFromStore] = useState(false);

  // URL 파라미터와 전역 스토어에서 값 복원 (마운트 후 한 번만 실행)
  useEffect(() => {
    // 이미 초기화했으면 건너뛰기
    if (hasInitializedFromStore) return;

    const hasLocalDates =
      localSearchParams.checkIn || localSearchParams.checkOut;

    // 클라이언트 URL 파라미터 확인
    const urlCheckIn = clientSearchParams?.get("checkIn");
    const urlCheckOut = clientSearchParams?.get("checkOut");
    const hasUrlDates = urlCheckIn || urlCheckOut;

    // URL에 날짜가 있으면 사용
    if (!hasLocalDates && hasUrlDates) {
      const urlParams = {
        destination: clientSearchParams?.get("destination") || "",
        checkIn: urlCheckIn || "",
        checkOut: urlCheckOut || "",
        nights: parseInt(clientSearchParams?.get("nights") || "1"),
        adults: parseInt(clientSearchParams?.get("adults") || "2"),
      };
      setLocalSearchParams(urlParams);
      setHasInitializedFromStore(true);
      return;
    }

    // 전역 스토어에서 복원
    const hasStoreDates =
      storeSearchParams.checkIn || storeSearchParams.checkOut;

    if (!hasLocalDates && !hasUrlDates && hasStoreDates) {
      const initialParams = {
        destination: storeSearchParams.destination || "",
        checkIn: storeSearchParams.checkIn || "",
        checkOut: storeSearchParams.checkOut || "",
        nights: parseInt(storeSearchParams.nights || "1"),
        adults: parseInt(storeSearchParams.adults || "2"),
      };
      setLocalSearchParams(initialParams);
      setHasInitializedFromStore(true);
    } else if (hasLocalDates || hasUrlDates) {
      // 이미 로컬 값이나 URL 값이 있으면 초기화 완료
      setHasInitializedFromStore(true);
    }
  }, [
    localSearchParams.checkIn,
    localSearchParams.checkOut,
    storeSearchParams,
    clientSearchParams,
    hasInitializedFromStore,
  ]);

  // 검색 조건 변경 시 호텔별 로컬스토리지에 저장
  const handleSearchParamsChange = useCallback(
    (newParams) => {
      setLocalSearchParams(newParams);

      // 호텔별 로컬스토리지에 저장
      if (
        typeof window !== "undefined" &&
        (newParams.checkIn || newParams.checkOut)
      ) {
        try {
          localStorage.setItem(hotelStorageKey, JSON.stringify(newParams));
        } catch (e) {
          console.warn("호텔별 검색 조건 저장 실패:", e);
        }
      }
    },
    [hotelStorageKey]
  );

  // URL 파라미터가 변경될 때 로컬 상태 업데이트 (체크인/체크아웃이 있을 때만)
  useEffect(() => {
    // 클라이언트 URL 파라미터 확인
    const urlCheckIn = clientSearchParams?.get("checkIn");
    const urlCheckOut = clientSearchParams?.get("checkOut");
    const hasUrlDates = urlCheckIn || urlCheckOut;

    // URL에 날짜가 있고, 현재 로컬 값과 다르면 업데이트
    if (hasUrlDates) {
      const newParams = {
        destination: clientSearchParams?.get("destination") || "",
        checkIn: urlCheckIn || "",
        checkOut: urlCheckOut || "",
        nights: parseInt(clientSearchParams?.get("nights") || "1"),
        adults: parseInt(clientSearchParams?.get("adults") || "2"),
      };

      // 값이 변경된 경우에만 업데이트
      if (
        localSearchParams.checkIn !== newParams.checkIn ||
        localSearchParams.checkOut !== newParams.checkOut
      ) {
        setLocalSearchParams(newParams);
        setHasInitializedFromStore(true);
        // URL에서 온 경우에도 로컬스토리지에 저장
        if (typeof window !== "undefined") {
          try {
            localStorage.setItem(hotelStorageKey, JSON.stringify(newParams));
          } catch (e) {
            console.warn("호텔별 검색 조건 저장 실패:", e);
          }
        }
      }
    }
  }, [
    clientSearchParams,
    hotelStorageKey,
    localSearchParams.checkIn,
    localSearchParams.checkOut,
  ]);

  return (
    <HotelDetail
      contentId={contentId}
      searchParams={localSearchParams}
      isModal={false}
      onSearchParamsChange={handleSearchParamsChange}
    />
  );
};

export default HotelDetailClient;
