"use client";

import { useEffect, useRef } from "react";
import HotelDetail from "./HotelDetail";

/**
 * 호텔 상세 패널 컴포넌트 (네이버 호텔 스타일)
 * - 모달이 아닌 사이드 패널 형태
 * - 배경 오버레이 없음 (다른 요소 클릭 가능)
 * - 호텔 리스트와 지도가 그대로 보임
 *
 * @param {Object} props
 * @param {number|string} props.hotelId - 호텔 ID
 * @param {Object} props.searchParams - 검색 파라미터
 * @param {Function} props.onClose - 패널 닫기 함수
 */
const HotelDetailPanel = ({ hotelId, searchParams, onClose }) => {
  const scrollContainerRef = useRef(null);

  // ESC 키로 패널 닫기
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleEsc);

    return () => {
      window.removeEventListener("keydown", handleEsc);
    };
  }, [onClose]);

  return (
    <>
      {/* 모바일: 전체 화면 모달 (배경 오버레이 있음) */}
      <div
        className="fixed inset-0 bg-black bg-opacity-30 z-40 animate-fade-in lg:hidden"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* 네이버 호텔 스타일 패널 */}
      <div
        className="fixed top-0 right-0 h-full bg-white shadow-2xl flex flex-col z-50 animate-slide-in-right
                   w-full 
                   lg:left-[calc(30%+1rem)] lg:right-auto lg:w-[555px] 
                   lg:top-[120px] lg:h-[calc(100vh-140px)] 
                   lg:rounded-xl lg:max-w-[555px]"
        role="complementary"
        aria-labelledby="panel-title"
      >
        {/* 패널 헤더 */}
        <div className="flex items-center justify-between px-6 py-4 border-b bg-white flex-shrink-0">
          <h2 id="panel-title" className="text-xl font-bold text-gray-900">
            호텔 상세
          </h2>
          <button
            onClick={onClose}
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

        {/* 패널 컨텐츠 (스크롤 가능) */}
        <div
          ref={scrollContainerRef}
          className="flex-1 overflow-y-auto relative"
          style={{ scrollBehavior: "smooth" }}
        >
          <HotelDetail
            hotelId={hotelId}
            searchParams={searchParams}
            isModal={true}
            scrollContainerRef={scrollContainerRef}
          />
        </div>
      </div>
    </>
  );
};

export default HotelDetailPanel;
