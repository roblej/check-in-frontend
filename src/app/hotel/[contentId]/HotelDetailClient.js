"use client";

import { useEffect, useState } from "react";
import HotelDetail from "@/components/hotel/HotelDetail";
import { useSearchStore } from "@/stores/searchStore";

/**
 * 호텔 상세 페이지의 클라이언트 컴포넌트
 * URL 쿼리 파라미터를 로컬 상태로 관리하여 전체 스토어에 영향 없음
 */
const HotelDetailClient = ({ contentId, searchParams }) => {
  const { searchParams: storeSearchParams } = useSearchStore();

  // 호텔 상세 페이지 전용 로컬 상태 (전체 스토어와 분리)
  const [localSearchParams, setLocalSearchParams] = useState(() => {
    return {
      destination:
        searchParams?.destination || storeSearchParams.destination || "",
      checkIn: searchParams?.checkIn || storeSearchParams.checkIn || "",
      checkOut: searchParams?.checkOut || storeSearchParams.checkOut || "",
      nights: parseInt(searchParams?.nights || storeSearchParams.nights || "1"),
      adults: parseInt(searchParams?.adults || storeSearchParams.adults || "2"),
    };
  });

  // URL 파라미터가 변경될 때만 로컬 상태 업데이트
  useEffect(() => {
    if (searchParams && Object.keys(searchParams).length > 0) {
      console.log("호텔 상세 페이지 - 로컬 상태 업데이트:", searchParams);

      setLocalSearchParams({
        destination: searchParams.destination || "",
        checkIn: searchParams.checkIn || "",
        checkOut: searchParams.checkOut || "",
        nights: parseInt(searchParams.nights || "1"),
        adults: parseInt(searchParams.adults || "2"),
      });
    }
  }, [searchParams]);

  return (
    <HotelDetail
      contentId={contentId}
      searchParams={localSearchParams}
      isModal={false}
    />
  );
};

export default HotelDetailClient;
