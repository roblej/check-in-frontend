"use client";

import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { hotelAPI } from "@/lib/api/hotel";
import { getOrCreateSessionId} from "@/lib/redisSession";

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
  // sessionStorage에서 캐싱된 sessionId 가져오기
  const sessionId = getOrCreateSessionId();
  
  // 진입 시 세션 등록만 (이탈 시 수동 제거하지 않음 - TTL 3분으로 자동 만료)
  useEffect(() => {
    if (!contentId || !sessionId) return;

    // 진입시 Redis 등록 API 호출 (실패해도 조용히 처리)
    const registerSession = async () => {
      try {
        await hotelAPI.enterHotel(contentId, sessionId);
      } catch (err) {
        // 타임아웃이나 네트워크 오류는 무시 (조회수는 선택적 기능)
        console.warn("조회자 등록 실패 (무시됨):", err.message);
      }
    };
    
    registerSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contentId]);

  // TanStack Query로 20초마다 실시간 조회수 refetch (sessionId 전달하여 TTL 갱신)
  const { data, isLoading, isError } = useQuery({
    queryKey: ["hotelViews", contentId],
    queryFn: async () => {
      try {
        const response = await hotelAPI.getHotelViews(contentId, sessionId);
        return response?.data?.views ?? response ?? 0;
      } catch (err) {
        console.warn("조회수 조회 실패 (무시됨):", err.message);
        return 0;
      }
    },
    refetchInterval: 20000, // 20초마다 자동 갱신
    enabled: !!contentId && !!sessionId, // contentId와 sessionId가 있을 때만 쿼리 실행
    retry: false, // 실패 시 재시도 안 함
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
  const viewCount = typeof data === 'number' ? data : 0;
  if (!showAlways && viewCount === 0) return null;

  // 현재 조회자 수 표시
  return (
    <div className="flex items-center gap-1 text-sm text-gray-600">
      <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
      <span>현재 {viewCount}명이 보고 있어요</span>
    </div>
  );
};

export default LiveViewerCount;
