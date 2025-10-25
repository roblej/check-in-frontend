'use client';

import { useState, useRef, useEffect } from 'react';
import HotelDetail from './HotelDetail';

const HotelDetailModal = ({ 
  isOpen, 
  onClose, 
  contentId, 
  roomIdx = null,
  searchParams = {} 
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const scrollContainerRef = useRef(null);

  // 모달 열기/닫기 애니메이션
  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      // body 스크롤 방지
      document.body.style.overflow = 'hidden';
    } else {
      setIsVisible(false);
      // body 스크롤 복원
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // ESC 키로 모달 닫기
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // roomIdx가 있으면 해당 객실만 보이도록 필터링된 searchParams 전달
  const filteredSearchParams = roomIdx 
    ? { ...searchParams, roomIdx }
    : searchParams;

  return (
    <div 
      className={`fixed inset-0 z-50 transition-opacity duration-300 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="hotel-modal-title"
    >
      {/* 배경 오버레이 */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
        aria-hidden="true"
      />
      
      {/* 모달 컨텐츠 - 현재 컨텐츠 패널 넓이와 동일 */}
      <div 
        className={`relative w-full h-full bg-white transform transition-transform duration-300 ${
          isVisible ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        {/* 모달 헤더 */}
        <div className="sticky top-0 z-40 bg-white border-b border-gray-200">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
            <h2 id="hotel-modal-title" className="text-lg font-semibold text-gray-900">
              호텔 상세 정보
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="모달 닫기"
            >
              <svg
                className="w-6 h-6 text-gray-600"
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

        {/* 스크롤 가능한 컨텐츠 영역 */}
        <div 
          ref={scrollContainerRef}
          className="h-[calc(100vh-60px)] overflow-y-auto"
        >
          <HotelDetail
            contentId={contentId}
            searchParams={filteredSearchParams}
            isModal={true}
            scrollContainerRef={scrollContainerRef}
          />
        </div>
      </div>
    </div>
  );
};

export default HotelDetailModal;
