"use client";
import { useEffect } from "react";

/**
 * 페이지 진입 시 스크롤을 맨 위로 초기화하는 훅
 */
export default function useScrollToTop() {
  useEffect(() => {
    const timer = setTimeout(() => {
      window.scrollTo(0, 0);
    }, 0); // DOM paint 이후 실행
    return () => clearTimeout(timer);
  }, []);
}


