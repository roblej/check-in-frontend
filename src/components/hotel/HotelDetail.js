"use client";

import { useState, useEffect, useRef, useCallback } from "react";
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
 * @typedef {Object} SearchParams
 * @property {string} [roomName] - 객실 이름 검색
 * @property {string} [checkIn] - 체크인 날짜
 * @property {string} [checkOut] - 체크아웃 날짜
 */

/**
 * @typedef {Object} Room
 * @property {string} id - 객실 고유 ID
 * @property {string} name - 객실 이름
 * @property {string} description - 객실 설명
 * @property {string} size - 객실 크기
 * @property {string} bedType - 침대 타입
 * @property {number} maxOccupancy - 최대 수용 인원
 * @property {string[]} amenities - 편의시설 목록
 * @property {string} checkInInfo - 체크인 정보
 * @property {number} originalPrice - 원가
 * @property {number} price - 판매가
 * @property {number} discount - 할인율
 * @property {string} imageUrl - 객실 이미지 URL
 */

/**
 * @typedef {Object} HotelData
 * @property {string|number} id - 호텔 ID
 * @property {string} name - 호텔 이름
 * @property {string} description - 호텔 설명
 * @property {string} location - 호텔 위치
 * @property {number} rating - 평점
 * @property {number} reviewCount - 리뷰 개수
 * @property {number} starRating - 별점
 * @property {string} checkInTime - 체크인 시간
 * @property {string} checkOutTime - 체크아웃 시간
 * @property {string[]} amenities - 편의시설 목록
 * @property {string[]} images - 이미지 URL 목록
 * @property {string} district - 지역 코드
 */

/**
 * 호텔 상세 정보 컴포넌트
 * @param {Object} props
 * @param {number|string} props.contentId - 호텔 ID
 * @param {SearchParams} [props.searchParams={}] - 검색 파라미터
 * @param {boolean} [props.isModal=false] - 모달 모드 여부
 * @param {React.RefObject} [props.scrollContainerRef] - 외부 스크롤 컨테이너 ref
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

  /**
   * 가격 포맷팅 함수
   * @param {number|string} price - 포맷팅할 가격
   * @returns {string} 포맷팅된 가격 문자열
   */
  const formatPrice = useCallback(
    (price) => new Intl.NumberFormat("ko-KR").format(Number(price || 0)),
    []
  );

  /**
   * 백엔드 호텔 데이터를 프론트엔드 형식으로 매핑
   * @param {Object} hotel - 백엔드 호텔 데이터
   * @returns {HotelData} 매핑된 호텔 데이터
   */
  const mapHotelData = useCallback((hotel) => {
    if (!hotel) return null;

    return {
      id: hotel.contentId ?? contentId,
      name: hotel.title ?? "",
      description: hotel.hotelDetail?.scalelodging || "",
      location: hotel.adress ?? "",
      rating: hotel.rating ?? 0,
      reviewCount: hotel.reviewCount ?? 0,
      starRating: hotel.starRating ?? 0,
      checkInTime: hotel.checkInTime ?? "",
      checkOutTime: hotel.checkOutTime ?? "",
      amenities: [
        hotel.hotelDetail?.foodplace,
        hotel.hotelDetail?.parkinglodging,
        hotel.hotelDetail?.reservationlodging,
      ].filter(Boolean),
      images: hotel.images ?? (hotel.imageUrl ? [hotel.imageUrl] : []),
      district: hotel.areaCode ?? "",
    };
  }, [contentId]);

  /**
   * 백엔드 객실 데이터를 프론트엔드 형식으로 매핑
   * @param {Object[]} roomList - 백엔드 객실 데이터 배열
   * @param {string} checkInTime - 체크인 시간
   * @param {string|number} [roomIdx] - 특정 객실 ID (선택사항)
   * @returns {Room[]} 매핑된 객실 데이터 배열
   */
  const mapRoomData = useCallback((roomList, checkInTime, roomIdx = null) => {
    const safeRoomList = Array.isArray(roomList) ? roomList : [];

    // roomIdx가 있으면 해당 객실만 필터링
    const filteredRooms = roomIdx 
      ? safeRoomList.filter(room => room.roomIdx == roomIdx)
      : safeRoomList;

        console.log('mapRoomData 필터링 결과:', {
          roomIdx: roomIdx,
          totalRooms: safeRoomList.length,
          filteredRooms: filteredRooms.length,
          filteredRoomIds: filteredRooms.map(r => r.roomIdx)
        });

        return filteredRooms.map((room, index) => ({
      id: room.roomIdx
        ? `${room.contentId}-${room.roomIdx}`
        : `${room.contentId}-${room.name}-${index}`,
      name: room.name || "",
      description: room.description || "",
      size: room.size || "",
      bedType: room.bedType || "",
      maxOccupancy: room.capacity ?? 2,
      amenities: Array.isArray(room.amenities) ? room.amenities : [],
      checkInInfo: checkInTime ? `${checkInTime} 이후 체크인` : "",
      originalPrice: Number(room.basePrice ?? 0),
      price: Number(room.basePrice ?? 0),
      discount: 0,
      imageUrl: room.imageUrl || "",
    }));
  }, []);

  // 데이터 로드: 호텔 상세 + 객실 목록
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

        // 백엔드 응답 정규화
        const hotel = hotelRes?.data ?? hotelRes;
        const roomList = roomsRes?.data ?? roomsRes;

        console.log('HotelDetail - API 응답:', {
          contentId: contentId,
          hotel: hotel,
          roomList: roomList,
          roomListLength: roomList?.length || 0
        });

        // 데이터 매핑
        const mappedHotel = mapHotelData(hotel);
        
        console.log('HotelDetail - roomIdx 필터링:', {
          contentId: contentId,
          roomIdx: searchParams?.roomIdx,
          totalRooms: roomList?.length || 0,
          searchParams: searchParams
        });
        
        const mappedRooms = mapRoomData(roomList, mappedHotel?.checkInTime, searchParams?.roomIdx);

        if (isMounted) {
          setHotelData(mappedHotel);
          setRooms(mappedRooms);
        }
      } catch (err) {
        console.error("호텔 데이터 로드 실패:", err);
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
  }, [contentId, searchParams, mapHotelData, mapRoomData]);

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
   * - 모달 모드: HotelDetail의 헤더만 측정
   * - 전체 페이지 모드: 메인 Header + HotelDetail 헤더 높이 합산
   */
  useEffect(() => {
    const updateHeaderHeight = () => {
      if (!headerRef.current) return;

      let totalHeight = headerRef.current.offsetHeight;

      // 전체 페이지 모드에서는 메인 Header 높이도 포함
      if (!isModal) {
        const mainHeader = document.querySelector("header");
        if (mainHeader) {
          totalHeight += mainHeader.offsetHeight;
        }
      }

      setHeaderHeight(totalHeight);
    };

    updateHeaderHeight();
    window.addEventListener("resize", updateHeaderHeight);

    // 폰트 로딩 등을 고려한 지연 재측정
    const timeoutId = setTimeout(updateHeaderHeight, 100);

    return () => {
      window.removeEventListener("resize", updateHeaderHeight);
      clearTimeout(timeoutId);
    };
  }, [isModal]);

  /**
   * 스크롤 이벤트 처리 - 현재 보이는 섹션 감지
   * requestAnimationFrame을 사용하여 성능 최적화
   */
  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (ticking) return;

      ticking = true;
      requestAnimationFrame(() => {
        const scrollElement = isModal ? scrollContainerRef.current : window;
        if (!scrollElement || !navRef.current) {
          ticking = false;
          return;
        }

        // 사용자가 수동으로 섹션 이동 중이면 감지 스킵
        if (isScrollingToSection) {
          ticking = false;
          return;
        }

        const scrollY = isModal ? scrollElement.scrollTop : window.scrollY;
        const headerHeight = headerRef.current?.offsetHeight ?? 0;
        const navHeight = navRef.current?.offsetHeight ?? 0;
        const threshold = headerHeight + navHeight + 10;

        let currentSection = "rooms";
        let closestDistance = Infinity;

        // 가장 가까운 섹션 찾기
        Object.entries(sectionsRef.current).forEach(([key, element]) => {
          if (!element) return;

          const elementTop = element.offsetTop;
          const distance = Math.abs(scrollY + threshold - elementTop);

          if (distance < closestDistance) {
            closestDistance = distance;
            currentSection = key;
          }
        });

        // 스크롤이 바닥에 닿으면 마지막 섹션 활성화
        const root = isModal
          ? scrollContainerRef.current
          : document.documentElement;
        const scrollTop = root.scrollTop;
        const maxScroll = root.scrollHeight - root.clientHeight;

        if (scrollTop >= maxScroll - 20) {
          currentSection = "policy";
        }

        setActiveSection(currentSection);
        ticking = false;
      });
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
   * @param {string} sectionId - 이동할 섹션 ID ("rooms" | "amenities" | "reviews" | "location" | "policy")
   */
  const scrollToSection = useCallback(
    (sectionId) => {
      const element = sectionsRef.current[sectionId];
      if (!element) return;

      setActiveSection(sectionId);
      setIsScrollingToSection(true);

      const scrollElement = isModal ? scrollContainerRef.current : window;
      const headerHeight = headerRef.current?.offsetHeight ?? 0;
      const navHeight = navRef.current?.offsetHeight ?? 0;
      const offsetTop = element.offsetTop - (headerHeight + navHeight + 10);

      if (isModal && scrollElement) {
        scrollElement.scrollTo({ top: offsetTop, behavior: "smooth" });
      } else {
        window.scrollTo({ top: offsetTop, behavior: "smooth" });
      }

      // 스크롤 완료 후 플래그 해제 (600ms는 smooth scroll 완료 시간)
      setTimeout(() => setIsScrollingToSection(false), 600);
    },
    [isModal, scrollContainerRef]
  );

  // 로딩 상태
  if (isLoading) {
    return (
      <div className="bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">호텔 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  // 에러 상태
  if (errorMessage) {
    return (
      <div className="bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center" role="alert" aria-live="assertive">
          <p className="text-red-600 text-lg font-medium mb-2">{errorMessage}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  // 데이터 없음
  if (!hotelData) {
    return (
      <div className="bg-gray-50 min-h-screen flex items-center justify-center">
        <p className="text-gray-600">호텔 정보를 찾을 수 없습니다.</p>
      </div>
    );
  }

  return (
    <div id={`hotel-${hotelData.id}`} className="bg-gray-50 min-h-screen">
      {/* Sticky 헤더 */}
      <div
        ref={headerRef}
        className={`bg-white border-b sticky z-40 shadow-sm ${
          isModal ? "top-0" : "top-[56px]"
        }`}
      >
        <div className={`${isModal ? "max-w-6xl mx-auto px-4 sm:px-6 lg:px-8" : "max-w-7xl mx-auto px-4"} py-3`}>
          <div className="flex items-center justify-between">
            {/* 호텔 기본 정보 */}
            <div className="flex-1 min-w-0">
              <h1
                className={`font-bold text-gray-900 truncate ${
                  isModal ? "text-lg" : "text-2xl"
                }`}
              >
                {hotelData.name}
              </h1>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                {hotelData.rating > 0 && (
                  <div className="flex items-center">
                    <span className="text-yellow-500 text-sm">⭐</span>
                    <span className="text-sm font-medium ml-1">
                      {hotelData.rating.toFixed(1)}
                    </span>
                    <span className="text-sm text-gray-500 ml-1">
                      ({hotelData.reviewCount})
                    </span>
                  </div>
                )}
                {hotelData.location && (
                  <span className="text-sm text-gray-600 truncate">
                    {hotelData.location}
                  </span>
                )}
              </div>
            </div>

            {/* 가격 및 조회수 */}
            <div className="text-right ml-4 flex-shrink-0">
              <p className="text-sm text-gray-500">최저가</p>
              <p className="text-xl font-bold text-blue-600">
                ₩
                {formatPrice(
                  Array.isArray(rooms) && rooms.length > 0
                    ? rooms[0]?.price || 0
                    : 0
                )}
              </p>
              <LiveViewerCount contentId={hotelData.id} />
            </div>
          </div>
        </div>
      </div>

      {/* Sticky 네비게이션 */}
      <div
        ref={navRef}
        className="bg-white border-b shadow-md sticky z-30"
        style={{ top: `${headerHeight}px` }}
      >
        <div className={`${isModal ? "max-w-6xl mx-auto px-4 sm:px-6 lg:px-8" : "max-w-7xl mx-auto px-4"}`}>
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
                aria-label={`${section.label} 섹션으로 이동`}
              >
                {section.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 메인 컨텐츠 */}
      <div
        className={`${
          isModal ? "max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 pb-8" : "max-w-7xl mx-auto px-4 py-6 pt-6"
        }`}
      >
        {/* 이미지 갤러리 */}
        <HotelGallery images={hotelData.images} isModal={isModal} />

        {/* 호텔 기본 정보 */}
        <HotelInfo hotelData={hotelData} />

        {/* 객실 목록 */}
        <section
          ref={(el) => (sectionsRef.current["rooms"] = el)}
          className="mb-8"
          aria-labelledby="rooms-heading"
        >
          <h2 id="rooms-heading" className="text-2xl font-bold mb-4">
            {searchParams?.roomIdx ? '객실 확인' : '객실 선택'}
          </h2>
          <div className="space-y-4">
            {Array.isArray(rooms) && rooms.length > 0 ? (
              rooms.map((room) => (
                <RoomCard
                  key={room.id}
                  room={room}
                  searchParams={searchParams}
                  formatPrice={formatPrice}
                />
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                등록된 객실이 없습니다.
              </div>
            )}
          </div>
        </section>

        {/* 편의시설 */}
        <section
          ref={(el) => (sectionsRef.current["amenities"] = el)}
          aria-labelledby="amenities-heading"
        >
          <HotelAmenities amenities={hotelData.amenities} />
        </section>

        {/* 리뷰 */}
        <section
          ref={(el) => (sectionsRef.current["reviews"] = el)}
          aria-labelledby="reviews-heading"
        >
          <HotelReviews
            reviews={hotelData.reviews}
            rating={hotelData.rating}
            reviewCount={hotelData.reviewCount}
          />
        </section>

        {/* 위치 정보 */}
        <section
          ref={(el) => (sectionsRef.current["location"] = el)}
          aria-labelledby="location-heading"
        >
          <HotelLocation location={hotelData.location} />
        </section>

        {/* 호텔 정책 */}
        <section
          ref={(el) => (sectionsRef.current["policy"] = el)}
          aria-labelledby="policy-heading"
        >
          <HotelPolicy
            checkInTime={hotelData.checkInTime}
            checkOutTime={hotelData.checkOutTime}
          />
        </section>
      </div>
    </div>
  );
};

export default HotelDetail;
