"use client";

import { useState, useEffect, useRef, useCallback } from "react";

/**
 * 호텔 네비게이션 및 스크롤 관리 커스텀 훅
 * @param {React.RefObject} scrollContainerRef - 스크롤 컨테이너 ref (div 또는 window)
 * @param {boolean} isModal - 모달 모드 여부
 * @returns {Object} 네비게이션 관련 상태 및 함수들
 */
export const useHotelNavigation = (scrollContainerRef, isModal) => {
  const [activeSection, setActiveSection] = useState("rooms");
  const [isScrollingToSection, setIsScrollingToSection] = useState(false);
  const [headerHeight, setHeaderHeight] = useState(0);

  const navRef = useRef(null);
  const headerRef = useRef(null);
  const sectionsRef = useRef({});

  const navSections = [
    { id: "rooms", label: "객실" },
    { id: "amenities", label: "편의시설" },
    { id: "reviews", label: "리뷰" },
    { id: "location", label: "위치" },
    { id: "policy", label: "정책" },
  ];

  /**
   * 헤더 높이 측정 및 업데이트
   */
  useEffect(() => {
    const updateHeaderHeight = () => {
      if (!headerRef.current || !navRef.current) return;

      let totalHeight =
        headerRef.current.offsetHeight + navRef.current.offsetHeight;

      // 전체 페이지 모드에서는 메인 Header 높이도 포함
      if (!isModal) {
        const mainHeader = document.querySelector("header");
        if (mainHeader) {
          totalHeight += mainHeader.offsetHeight;
        }
      }

      setHeaderHeight(totalHeight);
    };

    // 초기 측정
    updateHeaderHeight();

    // resize 이벤트
    window.addEventListener("resize", updateHeaderHeight);

    // 여러 시점에 재측정 (레이아웃 변경 대응)
    const timeouts = [
      setTimeout(updateHeaderHeight, 100),
      setTimeout(updateHeaderHeight, 300),
      setTimeout(updateHeaderHeight, 500),
    ];

    return () => {
      window.removeEventListener("resize", updateHeaderHeight);
      timeouts.forEach(clearTimeout);
    };
  }, [isModal]);

  /**
   * 스크롤 이벤트 처리 - 현재 보이는 섹션 감지
   */
  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (ticking) return;

      ticking = true;
      requestAnimationFrame(() => {
        const scrollElement = scrollContainerRef.current;
        if (!scrollElement || !navRef.current) {
          ticking = false;
          return;
        }

        if (isScrollingToSection) {
          ticking = false;
          return;
        }

        // window 또는 div 스크롤 처리
        const scrollY =
          scrollElement === window
            ? window.scrollY || document.documentElement.scrollTop
            : scrollElement.scrollTop;

        const threshold = headerHeight + 10;

        let currentSection = "rooms";
        let closestDistance = Infinity;

        Object.entries(sectionsRef.current).forEach(([key, element]) => {
          if (!element) return;

          // window 스크롤일 때는 페이지 기준 offsetTop 사용
          const elementTop =
            scrollElement === window
              ? element.getBoundingClientRect().top + window.scrollY
              : element.offsetTop;

          const distance = Math.abs(scrollY + threshold - elementTop);

          if (distance < closestDistance) {
            closestDistance = distance;
            currentSection = key;
          }
        });

        // 스크롤이 바닥에 닿으면 마지막 섹션 활성화
        const scrollTop =
          scrollElement === window
            ? window.scrollY || document.documentElement.scrollTop
            : scrollElement.scrollTop;

        const maxScroll =
          scrollElement === window
            ? document.documentElement.scrollHeight - window.innerHeight
            : scrollElement.scrollHeight - scrollElement.clientHeight;

        if (scrollTop >= maxScroll - 20) {
          currentSection = "policy";
        }

        setActiveSection(currentSection);
        ticking = false;
      });
    };

    const scrollElement = scrollContainerRef.current;
    if (scrollElement) {
      if (scrollElement === window) {
        window.addEventListener("scroll", handleScroll, { passive: true });
      } else {
        scrollElement.addEventListener("scroll", handleScroll, {
          passive: true,
        });
      }
    }

    return () => {
      if (scrollElement) {
        if (scrollElement === window) {
          window.removeEventListener("scroll", handleScroll);
        } else {
          scrollElement.removeEventListener("scroll", handleScroll);
        }
      }
    };
  }, [scrollContainerRef, isScrollingToSection, headerHeight]);

  /**
   * 섹션 클릭 시 해당 섹션으로 스크롤
   */
  const scrollToSection = useCallback(
    (sectionId) => {
      const element = sectionsRef.current[sectionId];
      const scrollElement = scrollContainerRef.current;

      if (!element) {
        return;
      }

      if (!scrollElement) {
        return;
      }

      setActiveSection(sectionId);
      setIsScrollingToSection(true);

      // 현재 headerHeight 실시간 계산
      let currentHeaderHeight = 0;
      if (headerRef.current && navRef.current) {
        currentHeaderHeight =
          headerRef.current.offsetHeight + navRef.current.offsetHeight;
        if (!isModal) {
          const mainHeader = document.querySelector("header");
          if (mainHeader) {
            currentHeaderHeight += mainHeader.offsetHeight;
          }
        }
      }

      // 스크롤 실행
      if (scrollElement === window) {
        // window 스크롤 (전체 페이지 모드)
        const elementTop = element.getBoundingClientRect().top + window.scrollY;
        const offsetTop = elementTop - currentHeaderHeight;

        window.scrollTo({ top: Math.max(0, offsetTop), behavior: "smooth" });
      } else {
        // div 스크롤 (패널 모드)
        const containerRect = scrollElement.getBoundingClientRect();
        const elementRect = element.getBoundingClientRect();
        const relativeTop = elementRect.top - containerRect.top;
        const currentScroll = scrollElement.scrollTop;
        const targetScroll = currentScroll + relativeTop - currentHeaderHeight;

        scrollElement.scrollTo({
          top: Math.max(0, targetScroll),
          behavior: "smooth",
        });
      }

      setTimeout(() => setIsScrollingToSection(false), 600);
    },
    [scrollContainerRef, isModal, headerRef, navRef]
  );

  /**
   * 섹션 ref 설정 함수
   */
  const setSectionRef = useCallback((sectionId) => {
    return (el) => {
      sectionsRef.current[sectionId] = el;
    };
  }, []);

  return {
    activeSection,
    navSections,
    navRef,
    headerRef,
    headerHeight,
    scrollToSection,
    setSectionRef,
  };
};
