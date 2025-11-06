"use client";
import { useEffect, useRef, useCallback, useState } from "react";
import HotelDetail from "./HotelDetail";

/**
 * 호텔 상세 패널 - 패널은 고정, 내용만 교체
 */
const HotelDetailPanel = ({
  contentId,
  searchParams,
  onClose,
  onSearchParamsChange,
}) => {
  const scrollContainerRef = useRef(null);
  const [currentContentId, setCurrentContentId] = useState(contentId);
  const [isLoading, setIsLoading] = useState(false);
  const [isFading, setIsFading] = useState(false);

  /** 닫기 */
  const handleClose = useCallback(() => {
    // 즉시 상태 초기화하여 불필요한 렌더링 방지
    setCurrentContentId(null);
    setIsLoading(false);
    setIsFading(false);

    // 바로 닫기 (애니메이션 없음)
    onClose();
  }, [onClose]);

  /** ESC 닫기 */
  useEffect(() => {
    const handleEsc = (e) => e.key === "Escape" && handleClose();
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [handleClose]);

  /** contentId 변경 감지 → fade-out + 로딩 표시 → 내부 교체 */
  useEffect(() => {
    // contentId가 null이 되면 즉시 초기화 (닫기 시)
    if (!contentId) {
      setCurrentContentId(null);
      setIsLoading(false);
      setIsFading(false);
      return;
    }

    // contentId가 있고, 현재 contentId와 다를 때만 교체 (다른 호텔 선택 시)
    if (contentId !== currentContentId) {
      // fade-out & 로딩 시작
      setIsFading(true);
      setIsLoading(true);

      // 약간의 지연 후 내부 contentId 교체
      setTimeout(() => {
        setCurrentContentId(contentId);
      }, 150);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contentId]); // currentContentId 제거하여 무한 루프 방지

  /** HotelDetail의 실제 API 로딩 상태 전달 */
  const handleLoadingChange = useCallback((loading) => {
    setIsLoading(loading);
    if (!loading) {
      // 새 데이터 도착 후 fade-in
      setTimeout(() => setIsFading(false), 100);
    }
  }, []);

  // contentId가 없으면 패널 즉시 숨김 (애니메이션 없이)
  if (!contentId) {
    return null;
  }

  // currentContentId도 null이면 즉시 숨김 (닫기 중)
  if (!currentContentId) {
    return null;
  }

  return (
    <>
      {/* 모바일 오버레이 */}
      <div
        className="hotel-detail-panel-overlay fixed inset-0 bg-black bg-opacity-30 z-40 animate-fade-in lg:hidden"
        onClick={handleClose}
        aria-hidden="true"
      />
      {/* 패널 자체는 절대 unmount 안 됨 */}
      <div
        className="hotel-detail-panel fixed top-0 right-0 h-full bg-white shadow-2xl flex flex-col z-50 animate-slide-in-right overflow-hidden
                    w-full sm:top-0 sm:h-full
                    lg:right-auto lg:w-[555px] lg:left-[calc(20%+24px)] lg:top-[calc(56px+56px+24px)] lg:h-[calc(100vh-56px-56px-48px)]
                    lg:rounded-xl lg:max-w-[555px]"
      >
        {/* 헤더 */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white flex-shrink-0 rounded-t-xl">
          <h2 className="text-xl font-bold text-gray-900">호텔 상세</h2>
          <button
            onClick={handleClose}
            className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors shadow-sm"
            aria-label="닫기"
          >
            <svg
              className="w-5 h-5 text-gray-600"
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

        {/* 내용 (fade 전환) */}
        <div
          ref={scrollContainerRef}
          className={`flex-1 overflow-y-auto relative fade-transition ${
            isFading ? "fade-out" : "fade-in"
          }`}
          style={{ scrollBehavior: "smooth" }}
        >
          <HotelDetail
            contentId={currentContentId}
            searchParams={searchParams}
            isModal={true}
            scrollContainerRef={scrollContainerRef}
            onSearchParamsChange={onSearchParamsChange}
            onLoadingChange={handleLoadingChange}
          />
        </div>

        {/* 하단 고정 여백 영역 */}
        <div className="flex-shrink-0 bg-gray-50 rounded-b-xl px-2.5 pb-2.5"></div>

        {/* 로딩 스피너 (fade-out 중 바로 표시됨) */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/70 z-10">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500" />
          </div>
        )}
      </div>
    </>
  );
};

export default HotelDetailPanel;
