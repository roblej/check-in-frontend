"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { hotelAPI } from "@/lib/api/hotel";
import { getOrCreateSessionId } from "@/lib/redisSession";

/**
 * 호텔 실시간 조회수 플로팅 패널 컴포넌트
 *
 * 특징:
 * - 화면 우측 하단에 고정 위치
 * - X 버튼으로 닫기 가능
 * - 30초마다 실시간 조회수 업데이트
 * - 조회수가 0일 때는 표시하지 않음
 * - 애니메이션과 함께 부드러운 UX 제공
 */
const LiveViewerPanel = ({ contentId }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);
  
  // sessionStorage에서 캐싱된 sessionId 가져오기
  const sessionId = getOrCreateSessionId();

  // TanStack Query로 30초마다 실시간 조회수 refetch
  const { data, isLoading, isError } = useQuery({
    queryKey: ["hotelViews", contentId],
    queryFn: async () => {
      try {
        const response = await hotelAPI.getHotelViews(contentId, sessionId);
        return response?.data?.views ?? response ?? 0;
      } catch (err) {
        //조회수 조회 실패 무시됨
        return 0;
      }
    },
    refetchInterval: 30000, // 30초마다 자동 갱신
    staleTime: 30000, // 30초 동안 캐시 유지
    gcTime: 60000, // 메모리 캐시 유지 시간
    enabled: !!contentId && !!sessionId && isVisible, // 패널이 보일 때만 쿼리 실행
    retry: false, // 실패 시 재시도 안 함
  });

  // 조회수가 0이거나 로딩/에러 상태일 때는 패널 숨김
  const viewCount = typeof data === 'number' ? data : 0;
  if (!isVisible || isLoading || isError || viewCount === 0) {
    return null;
  }

  /**
   * 패널 닫기 핸들러
   */
  const handleClose = () => {
    setIsVisible(false);
  };

  /**
   * 패널 최소화/확대 토글 핸들러
   */
  const handleToggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <div
        className={`
        bg-white rounded-lg shadow-lg border border-gray-200
        transform transition-all duration-300 ease-in-out
        ${isMinimized ? "w-12 h-12" : "w-64"}
        hover:shadow-xl hover:scale-105
      `}
      >
        {/* 헤더 영역 */}
        <div className="flex items-center justify-between p-3 border-b border-gray-100">
          {!isMinimized && (
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-gray-700">
                실시간 조회
              </span>
            </div>
          )}

          <div className="flex items-center gap-1">
            {/* 최소화/확대 버튼 */}
            <button
              onClick={handleToggleMinimize}
              className="p-1 hover:bg-gray-100 rounded transition-colors"
              aria-label={isMinimized ? "패널 확대" : "패널 최소화"}
            >
              {isMinimized ? (
                <svg
                  className="w-4 h-4 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
                  />
                </svg>
              ) : (
                <svg
                  className="w-4 h-4 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20 12H4"
                  />
                </svg>
              )}
            </button>

            {/* 닫기 버튼 */}
            <button
              onClick={handleClose}
              className="p-1 hover:bg-gray-100 rounded transition-colors"
              aria-label="패널 닫기"
            >
              <svg
                className="w-4 h-4 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* 컨텐츠 영역 */}
        {!isMinimized && (
          <div className="p-3">
            <div className="flex items-center justify-center">
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600 mb-1">
                  {viewCount.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">명이 보고 있어요</div>
                <div className="text-xs text-gray-500 mt-1">
                  실시간 업데이트
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 최소화 상태일 때 조회수만 표시 */}
        {isMinimized && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="text-sm font-bold text-red-600">{viewCount}</div>
              <div className="w-1 h-1 bg-red-500 rounded-full mx-auto mt-1 animate-pulse"></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LiveViewerPanel;
