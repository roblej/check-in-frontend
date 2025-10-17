"use client";

import { useState, useEffect } from "react";
import { hotelAPI } from "@/lib/api/hotel";

/**
 * 호텔 실시간 조회수 표시 컴포넌트 (ISR + Redis + TanStack Query)
 *
 * 흐름:
 * 1. 페이지 진입 시 → 백엔드에 view 등록 (1회)
 * 2. TanStack Query로 30초마다 /views API 호출
 * 3. Redis TTL 1분 동안 유지
 */

const LiveViewerCount = ({ contentId  }) => {
  const [viewCount, setViewCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!contentId ) return;

    // 컴포넌트가 화면에 보일 때 조회수 증가
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !isVisible) {
            setIsVisible(true);
            // 조회수 증가
            hotelAPI.incrementHotelView(contentId ).catch(console.error);
          } else if (!entry.isIntersecting && isVisible) {
            setIsVisible(false);
          }
        });
      },
      { threshold: 0.5 }
    );

    const element = document.getElementById(`hotel-${contentId }`);
    if (element) {
      observer.observe(element);
    }

    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, [contentId , isVisible]);

  useEffect(() => {
    if (!contentId ) return;

    // 초기 조회수 로드
    const loadViewCount = async () => {
      try {
        const data = await hotelAPI.getHotelViews(contentId );
        setViewCount(data.views || 0);
      } catch (error) {
        console.error("조회수 로드 실패:", error);
      }
    };

    loadViewCount();

    // 10초마다 조회수 업데이트
    const interval = setInterval(loadViewCount, 10000);

    return () => clearInterval(interval);
  }, [contentId ]);

  if (viewCount === 0) return null;

  return (
    <div className="flex items-center gap-1 text-sm text-gray-600">
      <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
      <span>현재 {viewCount}명이 보고 있어요</span>
    </div>
  );
};

export default LiveViewerCount;
