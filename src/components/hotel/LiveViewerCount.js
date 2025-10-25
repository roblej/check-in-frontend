"use client";

import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { hotelAPI } from "@/lib/api/hotel";

/**
 * 호텔 실시간 조회수 표시 컴포넌트 (ISR + Redis + TanStack Query)
 *
 * 흐름:
 * 1. 페이지 진입 시 → 백엔드에 view 등록 (1회)
 * 2. TanStack Query로 30초마다 /views API 호출
 * 3. Redis TTL 3분 동안 유지
 * 리팩터링 예정사항 viewcount 중첩 현상 아마 백엔드에서 sessionid를
 * 제대로 기억 못하는듯
 * @param {string} contentId - 호텔 ID
 * @param {boolean} showAlways - 항상 표시할지 여부 (기본값: false, 조회수가 0일 때는 숨김)
 */
const LiveViewerCount = ({ contentId, showAlways = true }) => {
  // 진입 시 및 이탈 처리
  useEffect(() => {
    if (!contentId)
      return;

    //진입시 Redis 등록 + 조회
    hotelAPI.getHotelViews(contentId).catch((err)=>
      console.error("조회자 등록 실패:",err)
    );
    // 페이지 이탈시 Redis 세션 제거
    return ()=>{
      hotelAPI.leaveHotel(contentId).catch(()=>
        console.warn("이탈 처리 실패(만료된 세션일 가능성도 있음")
      );
    };
  }, [contentId]);

  // TanStack Query로 30초마다 실시간 조회수 refetch
  const { data, isLoading, isError } = useQuery({
    queryKey: ["hotelViews", contentId],
    queryFn: () => hotelAPI.getHotelViews(contentId),
    refetchInterval: 10000, // 10초마다 자동 갱신 (더 빠른 테스트를 위해)
    staleTime: 10000, // 10초 동안 캐시 유지
    gcTime: 30000, // 메모리 캐시 유지 시간
    enabled: !!contentId, // contentId가 있을 때만 쿼리 실행
  });

  // 로딩 상태일 때는 로딩 표시
  if (isLoading) {
    return (
      <div className="flex items-center gap-1 text-sm text-gray-400">
        <div className="w-2 h-2 bg-gray-300 rounded-full animate-pulse"></div>
        <span>조회수 로딩 중...</span>
      </div>
    );
  }

  // 에러 상태일 때는 에러 표시
  if (isError) {
    return (
      <div className="flex items-center gap-1 text-sm text-gray-400">
        <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
        <span>조회수 확인 불가</span>
      </div>
    );
  }

  // 조회수가 0이고 showAlways가 false일 때는 표시하지 않음
  if (!showAlways && (!data || data === 0)) return null;

  // 현재 조회자 수 표시
  return (
    <div className="flex items-center gap-1 text-sm text-gray-600">
      <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
      <span>현재 {data || 0}명이 보고 있어요</span>
    </div>
  );
};

export default LiveViewerCount;
