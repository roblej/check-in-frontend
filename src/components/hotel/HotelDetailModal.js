"use client";

import { useEffect, useRef } from "react";
import HotelDetail from "./HotelDetail";

const HotelDetailModal = ({ hotelId, searchParams, onClose }) => {
  const scrollContainerRef = useRef(null);

  // ESC 키로 모달 닫기
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleEsc);

    // 모달이 열려도 스크롤은 가능하게 유지
    // document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleEsc);
      // document.body.style.overflow = "unset";
    };
  }, [onClose]);

  return (
    <div className="hotel-detail-panel z-50 pointer-events-none">
      {/* 네이버 호텔처럼 지도 위에 오버레이되는 모달 패널 (반응형) */}
      <div className="h-full w-full bg-white shadow-2xl flex flex-col animate-slide-in-right pointer-events-auto lg:rounded-xl">
        {/* 모달 헤더 */}
        <div className="flex items-center justify-between px-6 py-4 border-b bg-white sticky top-0 z-10 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900">호텔 상세</h2>
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

        {/* 모달 컨텐츠 (스크롤 가능) */}
        <div ref={scrollContainerRef} className="flex-1 overflow-y-auto">
          <HotelDetail
            hotelId={hotelId}
            searchParams={searchParams}
            isModal={true}
            scrollContainerRef={scrollContainerRef}
          />
        </div>
      </div>
    </div>
  );
};

export default HotelDetailModal;
