"use client";

import { useState, useEffect, useRef, useCallback } from "react";

/**
 * 호텔 네비게이션 및 스크롤 관리 커스텀 훅
 * @param {React.RefObject} scrollContainerRef - 스크롤 컨테이너 ref (div 또는 window)
 * @param {boolean} isModal - 모달 모드 여부
 * @returns {Object} 네비게이션 관련 상태 및 함수들
 */
export const useHotelNavigation = (scrollContainerRef, isModal, defaultSection = "rooms") => {
  const [activeSection, setActiveSection] = useState(defaultSection);
  const [isScrollingToSection, setIsScrollingToSection] = useState(false);
  const [headerHeight, setHeaderHeight] = useState(0);
  const [isBackNavigation, setIsBackNavigation] = useState(false);

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

        // 뒤로가기 중이거나 섹션 스크롤 중이면 섹션 감지 완전히 비활성화
        // 뒤로가기 시 브라우저의 스크롤 복원이 완료될 때까지 섹션 감지를 하지 않음
        if (isBackNavigation || isScrollingToSection) {
          ticking = false;
          return;
        }

        // window 또는 div 스크롤 처리
        const scrollY =
          scrollElement === window
            ? window.scrollY || document.documentElement.scrollTop
            : scrollElement.scrollTop;

        const threshold = headerHeight + 10;

        let currentSection = defaultSection;
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
        // 뒤로가기 중에는 바닥 감지 비활성화하여 스크롤이 맨 아래로 튕기는 것을 방지
        // 추가로, 스크롤 위치가 페이지 높이의 절반 이하일 때는 바닥 감지를 하지 않음
        // (뒤로가기로 돌아왔을 때 스크롤 위치가 낮으면 바닥 감지로 인해 맨 아래로 튕기는 것을 방지)
        if (!isBackNavigation) {
          const scrollTop =
            scrollElement === window
              ? window.scrollY || document.documentElement.scrollTop
              : scrollElement.scrollTop;

          const maxScroll =
            scrollElement === window
              ? document.documentElement.scrollHeight - window.innerHeight
              : scrollElement.scrollHeight - scrollElement.clientHeight;

          // 스크롤 위치가 페이지 높이의 절반 이상일 때만 바닥 감지 실행
          // 이렇게 하면 뒤로가기로 돌아왔을 때 스크롤 위치가 낮으면 바닥 감지가 실행되지 않음
          const pageHeight =
            scrollElement === window
              ? document.documentElement.scrollHeight
              : scrollElement.scrollHeight;
          const viewportHeight =
            scrollElement === window
              ? window.innerHeight
              : scrollElement.clientHeight;
          const halfPageHeight = (pageHeight - viewportHeight) / 2;

          // 스크롤이 절반 이상이고 바닥에 가까우면 마지막 섹션 활성화
          if (scrollTop >= halfPageHeight && scrollTop >= maxScroll - 20) {
            currentSection = "policy";
          }
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
  }, [
    scrollContainerRef,
    isScrollingToSection,
    headerHeight,
    isBackNavigation,
  ]);

  /**
   * 뒤로가기(popstate) 혹은 히스토리 복원 감지
   * → scroll 이벤트와 scrollToSection 둘 다 잠시 비활성화
   * → 브라우저가 자동으로 스크롤 위치를 복원하도록 함 (개입하지 않음)
   * → 단, 바닥 감지 로직은 비활성화하여 스크롤이 맨 아래로 튕기는 것을 방지
   */
  useEffect(() => {
    const navEntry = performance.getEntriesByType("navigation")[0];
    if (navEntry && navEntry.type === "back_forward") {
      console.log(
        "뒤로가기 감지됨 → scroll 이벤트 일시 비활성화 및 바닥 감지 비활성화"
      );
      setIsBackNavigation(true);
      setIsScrollingToSection(true);

      // 더 긴 시간 동안 비활성화하여 스크롤 복원이 완료될 때까지 기다림
      // 스크롤 복원이 완료된 후에도 잠시 더 기다려서 안정적으로 만듦
      setTimeout(() => {
        setIsBackNavigation(false);
        setIsScrollingToSection(false);
      }, 2000);
    }

    const handlePopState = () => {
      console.log(
        "popstate 발생 → scroll 이벤트 일시 비활성화 및 바닥 감지 비활성화"
      );
      setIsBackNavigation(true);
      setIsScrollingToSection(true);

      // 더 긴 시간 동안 비활성화하여 스크롤 복원이 완료될 때까지 기다림
      // 스크롤 복원이 완료된 후에도 잠시 더 기다려서 안정적으로 만듦
      setTimeout(() => {
        setIsBackNavigation(false);
        setIsScrollingToSection(false);
      }, 2000);
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  /**
   * 섹션 클릭 시 해당 섹션으로 스크롤
   */
  const scrollToSection = useCallback(
    (sectionId) => {
      // 섹션이 아직 렌더링되지 않았을 수 있으므로 약간의 지연 후 실행
      let retryCount = 0;
      const maxRetries = 10;

      const tryScroll = () => {
        const element = sectionsRef.current[sectionId];
        const scrollElement = scrollContainerRef.current;

        if (!element) {
          // 섹션이 아직 로드되지 않았다면 재시도 (최대 10회)
          if (retryCount < maxRetries) {
            retryCount++;
            setTimeout(tryScroll, 100);
            return;
          }
          console.warn(`섹션 ${sectionId}을 찾을 수 없습니다.`);
          return;
        }

        if (!scrollElement) {
          console.warn("스크롤 컨테이너를 찾을 수 없습니다.");
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
        if (scrollElement === window || scrollElement === window.document) {
          // window 스크롤 (전체 페이지 모드)
          const elementTop =
            element.getBoundingClientRect().top + window.scrollY;
          const offsetTop = elementTop - currentHeaderHeight;

          window.scrollTo({ top: Math.max(0, offsetTop), behavior: "smooth" });
        } else {
          // div 스크롤 (패널 모드)
          // requestAnimationFrame을 사용하여 레이아웃이 완료된 후 계산
          requestAnimationFrame(() => {
            const elementRect = element.getBoundingClientRect();
            const containerRect = scrollElement.getBoundingClientRect();

            // 요소가 컨테이너 내부에서 얼마나 떨어져 있는지 (뷰포트 기준)
            const relativeTop = elementRect.top - containerRect.top;
            // 현재 스크롤 위치
            const currentScrollTop = scrollElement.scrollTop;
            // 요소의 절대 위치 (스크롤 컨테이너 기준)
            // 뷰포트 기준 상대 위치를 현재 스크롤 위치에 더함
            const elementAbsoluteTop = currentScrollTop + relativeTop;
            // 헤더 높이를 고려한 목표 스크롤 위치
            // 헤더가 스크롤 컨테이너 상단에 고정되어 있다고 가정
            const targetScroll = Math.max(
              0,
              elementAbsoluteTop - currentHeaderHeight - 20
            );

            console.log("모달 스크롤 계산:", {
              sectionId,
              currentScrollTop,
              relativeTop,
              elementAbsoluteTop,
              currentHeaderHeight,
              targetScroll,
              elementTop: elementRect.top,
              containerTop: containerRect.top,
              scrollHeight: scrollElement.scrollHeight,
              clientHeight: scrollElement.clientHeight,
            });
            if (isScrollingToSection) {
              console.log("뒤로가기 중이라 div scroll도 실행 안 함");
              return;
            }

            if (targetScroll !== currentScrollTop) {
              scrollElement.scrollTo({
                top: targetScroll,
                behavior: "smooth",
              });
            }
          });
        }

        setTimeout(() => setIsScrollingToSection(false), 600);
      };

      // 즉시 시도
      tryScroll();
    },
    [scrollContainerRef, isModal, headerRef, navRef, isScrollingToSection]
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
