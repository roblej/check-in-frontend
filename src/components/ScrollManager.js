"use client";
import useScrollToTop from "@/app/hooks/useScrollToTop";

/**
 * SSR 페이지에서도 클라이언트 스크롤 초기화를 담당하는 컴포넌트
 */
export default function ScrollManager() {
  useScrollToTop();
  return null; // 렌더링 안 함, 훅만 실행
}
