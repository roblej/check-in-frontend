"use client";

import { useState, useEffect, useRef } from "react";
import RoomCard from "./RoomCard";
import LiveViewerCount from "./LiveViewerCount";
import HotelGallery from "./HotelGallery";
import HotelInfo from "./HotelInfo";
import HotelAmenities from "./HotelAmenities";
import HotelReviews from "./HotelReviews";
import HotelLocation from "./HotelLocation";
import HotelPolicy from "./HotelPolicy";
import { hotelAPI } from "@/lib/api/hotel";

/**
 * 호텔 상세 정보 컴포넌트
 * @param {Object} props
 * @param {number|string} props.contentId  - 호텔 ID
 * @param {Object} props.searchParams - 검색 파라미터 (체크인/체크아웃 등)
 * @param {boolean} props.isModal - 모달 모드 여부
 * @param {React.RefObject} props.scrollContainerRef - 외부 스크롤 컨테이너 ref
 */
const HotelDetail = ({
  contentId,
  searchParams = {},
  isModal = false,
  scrollContainerRef: externalScrollRef,
}) => {
  const [activeSection, setActiveSection] = useState("rooms");
  const [isScrollingToSection, setIsScrollingToSection] = useState(false);
  const [headerHeight, setHeaderHeight] = useState(0);
  const [hotelData, setHotelData] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const navRef = useRef(null);
  const headerRef = useRef(null);
  const sectionsRef = useRef({});
  const internalScrollRef = useRef(null);

  // 외부에서 전달된 scrollContainerRef가 있으면 사용, 없으면 내부 ref 사용
  const scrollContainerRef = externalScrollRef || internalScrollRef;

  const formatPrice = (price) =>
    new Intl.NumberFormat("ko-KR").format(Number(price || 0));

  // 데이터 로드: 호텔 상세 + 객실 목록(contentId, optional name)
  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      setIsLoading(true);
      setErrorMessage("");
      try {
        const [hotelRes, roomsRes] = await Promise.all([
          hotelAPI.getHotelDetail(contentId),
          hotelAPI.getHotelRooms(contentId, {
            name: searchParams?.roomName || undefined,
          }),
        ]);

        // 백엔드 응답 형태 정규화 가정: { data: {...} } or plain object
        const hotel = hotelRes?.data ?? hotelRes;
        const roomList = roomsRes?.data ?? roomsRes ?? [];

        // HotelInfo / HotelDetail 매핑
        const mappedHotel = {
          id: hotel?.contentId ?? contentId,
          name: hotel?.title ?? "",
          description: hotel?.hotelDetail?.scalelodging || "",
          location: hotel?.adress ?? "",
          rating: hotel?.rating ?? null, // 없으면 null
          reviewCount: hotel?.reviewCount ?? 0,
          starRating: hotel?.starRating ?? 0,
          checkInTime: hotel?.checkInTime ?? "",
          checkOutTime: hotel?.checkOutTime ?? "",
          amenities: [
            hotel?.hotelDetail?.foodplace,
            hotel?.hotelDetail?.parkinglodging,
            hotel?.hotelDetail?.reservationlodging,
          ].filter(Boolean),
          images: hotel?.images ?? (hotel?.imageUrl ? [hotel.imageUrl] : []),
          district: hotel?.areaCode ?? "",
        };

        // Room 매핑
        const mappedRooms = (Array.isArray(roomList) ? roomList : []).map(
          (room) => ({
            id: `${room.contentId}-${room.name}`,
            name: room.name,
            description: room.description || "",
            size: room.size || "",
            bedType: room.bedType || "",
            maxOccupancy: room.capacity ?? 2,
            amenities: Array.isArray(room.amenities) ? room.amenities : [],
            checkInInfo: mappedHotel.checkInTime
              ? `${mappedHotel.checkInTime} 이후 체크인`
              : "",
            originalPrice: Number(room.basePrice ?? 0),
            price: Number(room.basePrice ?? 0),
            discount: 0,
            imageUrl: room.imageUrl || "",
          })
        );

        if (isMounted) {
          setHotelData(mappedHotel);
          setRooms(mappedRooms);
        }
      } catch (err) {
        if (isMounted) {
          setErrorMessage("호텔 정보를 불러오지 못했습니다.");
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    if (contentId) fetchData();
    return () => {
      isMounted = false;
    };
  }, [contentId, searchParams?.roomName]);

  // 네비게이션 섹션
  const navSections = [
    { id: "rooms", label: "객실" },
    { id: "amenities", label: "편의시설" },
    { id: "reviews", label: "리뷰" },
    { id: "location", label: "위치" },
    { id: "policy", label: "정책" },
  ];

  /**
   * 헤더 높이 측정 및 업데이트
   * - 패널 모드: HotelDetail의 헤더만 측정
   * - 전체 페이지 모드: 메인 Header + HotelDetail 헤더 높이 합산
   */
  useEffect(() => {
    const updateHeaderHeight = () => {
      if (headerRef.current) {
        let totalHeight = headerRef.current.offsetHeight;

        // 전체 페이지 모드에서는 메인 Header 높이도 포함
        if (!isModal) {
          const mainHeader = document.querySelector("header");
          if (mainHeader) {
            totalHeight += mainHeader.offsetHeight;
          }
        }

        setHeaderHeight(totalHeight);
      }
    };

    // 초기 측정
    updateHeaderHeight();

    // 리사이즈 시 재측정
    window.addEventListener("resize", updateHeaderHeight);

    // 약간의 지연 후 재측정 (폰트 로딩 등을 고려)
    const timeoutId = setTimeout(updateHeaderHeight, 100);

    return () => {
      window.removeEventListener("resize", updateHeaderHeight);
      clearTimeout(timeoutId);
    };
  }, [isModal]);

  /**
   * 스크롤 이벤트 처리 - 현재 보이는 섹션 감지
   * requestAnimationFrame을 사용하여 성능 최적화 및 깜박임 방지
   */
  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const scrollElement = isModal ? scrollContainerRef.current : window;
          if (!scrollElement || !navRef.current) {
            ticking = false;
            return;
          }

          const scrollY = isModal ? scrollElement.scrollTop : window.scrollY;

          // 현재 보이는 섹션 감지 (사용자가 섹션 클릭으로 이동 중이 아닐 때만)
          if (!isScrollingToSection) {
            const headerHeight = headerRef.current
              ? headerRef.current.offsetHeight
              : 0;
            const navHeight = navRef.current ? navRef.current.offsetHeight : 0;
            const threshold = headerHeight + navHeight + 10;

            let currentSection = "rooms";
            let closestDistance = Infinity;

            // 각 섹션의 top과 threshold 사이의 거리를 계산해 가장 가까운 섹션 찾기
            Object.entries(sectionsRef.current).forEach(([key, element]) => {
              if (element) {
                const elementTop = element.offsetTop;
                const distance = Math.abs(scrollY + threshold - elementTop);

                if (distance < closestDistance) {
                  closestDistance = distance;
                  currentSection = key;
                }
              }
            });

            // 마지막 정책 섹션은 스크롤이 바닥에 닿았을 때 강제로 활성화
            const root = isModal
              ? scrollContainerRef.current
              : document.documentElement;
            const scrollTop = isModal ? root.scrollTop : root.scrollTop;
            const maxScroll = root.scrollHeight - root.clientHeight;

            if (scrollTop >= maxScroll - 20) {
              currentSection = "policy";
            }

            setActiveSection(currentSection);
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    const scrollElement = isModal ? scrollContainerRef.current : window;
    if (scrollElement) {
      scrollElement.addEventListener("scroll", handleScroll, { passive: true });
    }

    return () => {
      if (scrollElement) {
        scrollElement.removeEventListener("scroll", handleScroll);
      }
    };
  }, [isModal, scrollContainerRef, isScrollingToSection]);

  /**
   * 섹션 클릭 시 해당 섹션으로 스크롤
   * @param {string} sectionId - 이동할 섹션 ID
   */
  const scrollToSection = (sectionId) => {
    const element = sectionsRef.current[sectionId];
    if (element) {
      setActiveSection(sectionId);
      setIsScrollingToSection(true);

      const scrollElement = isModal ? scrollContainerRef.current : window;
      const headerHeight = headerRef.current
        ? headerRef.current.offsetHeight
        : 0;
      const navHeight = navRef.current ? navRef.current.offsetHeight : 0;

      // sticky 상태일 때와 아닐 때를 고려한 오프셋 계산
      const offsetTop = element.offsetTop - (headerHeight + navHeight + 10);

      if (isModal && scrollElement) {
        scrollElement.scrollTo({ top: offsetTop, behavior: "smooth" });
      } else {
        window.scrollTo({ top: offsetTop, behavior: "smooth" });
      }

      // 스크롤 완료 후 플래그 해제
      setTimeout(() => setIsScrollingToSection(false), 600);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-gray-600">불러오는 중...</div>
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-red-600" role="alert" aria-live="assertive">
          {errorMessage}
        </div>
      </div>
    );
  }

  if (!hotelData) return null;

  return (
    <div id={`hotel-${hotelData.id}`} className="bg-gray-50 min-h-screen">
      {/* Sticky 헤더 - 메인 Header 아래에 고정 */}
      <div
        ref={headerRef}
        className={`bg-white border-b sticky z-40 shadow-sm ${
          isModal ? "top-0" : "top-[56px]"
        }`}
      >
        <div className={`${isModal ? "px-4" : "max-w-7xl mx-auto px-4"} py-3`}>
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <h1
                className={`font-bold text-gray-900 truncate ${
                  isModal ? "text-lg" : "text-2xl"
                }`}
              >
                {hotelData.name}
              </h1>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <div className="flex items-center">
                  <span className="text-yellow-500 text-sm">⭐</span>
                  <span className="text-sm font-medium ml-1">
                    {hotelData.rating}
                  </span>
                  <span className="text-sm text-gray-500 ml-1">
                    ({hotelData.reviewCount})
                  </span>
                </div>
                <span className="text-sm text-gray-600 truncate">
                  {hotelData.location}
                </span>
              </div>
            </div>
            <div className="text-right ml-4 flex-shrink-0">
              <p className="text-sm text-gray-500">최저가</p>
              <p className="text-xl font-bold text-blue-600">
                ₩{formatPrice(rooms[0]?.price || 0)}
              </p>
              <LiveViewerCount contentId={hotelData.id} />
            </div>
          </div>
        </div>
      </div>

      {/* Sticky 네비게이션 - 헤더 바로 아래에 고정 (동적 높이) */}
      <div
        ref={navRef}
        className="bg-white border-b shadow-md sticky z-30"
        style={{ top: `${headerHeight}px` }}
      >
        <div className={`${isModal ? "px-4" : "max-w-7xl mx-auto px-4"}`}>
          <div className="flex gap-1 overflow-x-auto scrollbar-hide">
            {navSections.map((section) => (
              <button
                key={section.id}
                onClick={() => scrollToSection(section.id)}
                className={`${
                  isModal ? "px-3 py-2" : "px-6 py-3"
                } font-medium transition-colors whitespace-nowrap ${
                  activeSection === section.id
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                {section.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 컨텐츠 영역 */}
      <div
        className={`${
          isModal ? "px-4 py-4 pb-8" : "max-w-7xl mx-auto px-4 py-6 pt-6"
        }`}
      >
        {/* 호텔 이미지 갤러리 */}
        <HotelGallery images={hotelData.images ?? []} isModal={isModal} />

        {/* 호텔 소개 */}
        <HotelInfo hotelData={hotelData} />

        {/* 객실 섹션 */}
        <div ref={(el) => (sectionsRef.current["rooms"] = el)} className="mb-8">
          <h2 className="text-2xl font-bold mb-4">객실 선택</h2>
          <div className="space-y-4">
            {rooms.map((room) => (
              <RoomCard
                key={room.id}
                room={room}
                searchParams={searchParams}
                formatPrice={formatPrice}
              />
            ))}
          </div>
        </div>

        {/* 편의시설 섹션 */}
        <div ref={(el) => (sectionsRef.current["amenities"] = el)}>
          <HotelAmenities amenities={hotelData.amenities} />
        </div>

        {/* 리뷰 섹션 */}
        <div ref={(el) => (sectionsRef.current["reviews"] = el)}>
          <HotelReviews
            reviews={hotelData.reviews}
            rating={hotelData.rating}
            reviewCount={hotelData.reviewCount}
          />
        </div>

        {/* 위치 섹션 */}
        <div ref={(el) => (sectionsRef.current["location"] = el)}>
          <HotelLocation location={hotelData.location} />
        </div>

        {/* 정책 섹션 */}
        <div ref={(el) => (sectionsRef.current["policy"] = el)}>
          <HotelPolicy
            checkInTime={hotelData.checkInTime}
            checkOutTime={hotelData.checkOutTime}
          />
        </div>
      </div>
    </div>
  );
};

export default HotelDetail;
