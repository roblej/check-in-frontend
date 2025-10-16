"use client";

import { useState, useEffect } from "react";
import { hotelAPI } from "@/lib/api/hotel";

const LiveViewerCount = ({ hotelId }) => {
  const [viewCount, setViewCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!hotelId) return;

    // 컴포넌트가 화면에 보일 때 조회수 증가
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !isVisible) {
            setIsVisible(true);
            // 조회수 증가
            hotelAPI.incrementHotelView(hotelId).catch(console.error);
          } else if (!entry.isIntersecting && isVisible) {
            setIsVisible(false);
          }
        });
      },
      { threshold: 0.5 }
    );

    const element = document.getElementById(`hotel-${hotelId}`);
    if (element) {
      observer.observe(element);
    }

    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, [hotelId, isVisible]);

  useEffect(() => {
    if (!hotelId) return;

    // 초기 조회수 로드
    const loadViewCount = async () => {
      try {
        const data = await hotelAPI.getHotelViews(hotelId);
        setViewCount(data.views || 0);
      } catch (error) {
        console.error("조회수 로드 실패:", error);
      }
    };

    loadViewCount();

    // 10초마다 조회수 업데이트
    const interval = setInterval(loadViewCount, 10000);

    return () => clearInterval(interval);
  }, [hotelId]);

  if (viewCount === 0) return null;

  return (
    <div className="flex items-center gap-1 text-sm text-gray-600">
      <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
      <span>현재 {viewCount}명이 보고 있어요</span>
    </div>
  );
};

export default LiveViewerCount;
