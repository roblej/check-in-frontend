"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import RoomCard from "./RoomCard";
import LiveViewerCount from "./LiveViewerCount";

const HotelDetail = ({
  hotelId,
  searchParams = {},
  isModal = false,
  scrollContainerRef: externalScrollRef,
}) => {
  const [activeSection, setActiveSection] = useState("rooms");
  const [isNavFixed, setIsNavFixed] = useState(false);
  const [isScrollingToSection, setIsScrollingToSection] = useState(false);

  const navRef = useRef(null);
  const sectionsRef = useRef({});
  const internalScrollRef = useRef(null);

  // 외부에서 전달된 scrollContainerRef가 있으면 사용, 없으면 내부 ref 사용
  const scrollContainerRef = externalScrollRef || internalScrollRef;

  // 임시 호텔 데이터 (실제로는 axios로 API 호출)
  const hotelData = {
    id: hotelId || 1,
    name: "신라스테이 광화문",
    rating: 8.4,
    reviewCount: 245,
    location: "서울 종로구 삼봉로 71",
    district: "종로구",
    description:
      "광화문 중심부에 위치한 프리미엄 비즈니스 호텔입니다. 모든 객실에서 서울의 아름다운 전망을 감상하실 수 있습니다.",
    checkInTime: "15:00",
    checkOutTime: "11:00",
    starRating: 4,
    amenities: [
      "무료 WiFi",
      "수영장",
      "피트니스 센터",
      "레스토랑",
      "주차장",
      "비즈니스 센터",
    ],
    images: [
      "/hotel-main.jpg",
      "/hotel-room.jpg",
      "/hotel-lobby.jpg",
      "/hotel-pool.jpg",
    ],
    rooms: [
      {
        id: 1,
        name: "스탠다드 더블",
        size: "27㎡",
        bedType: "더블",
        maxOccupancy: 2,
        price: 180000,
        originalPrice: 220000,
        discount: 18,
        amenities: ["무료 WiFi", "미니바", "금연", "욕조"],
        images: ["/room1.jpg", "/room1-2.jpg"],
        description: "편안한 휴식을 위한 기본형 객실입니다.",
        checkInInfo: "무료 취소 2024.10.19(일) 23:59 전까지",
      },
      {
        id: 2,
        name: "디럭스 트윈",
        size: "32㎡",
        bedType: "트윈",
        maxOccupancy: 2,
        price: 220000,
        originalPrice: 280000,
        discount: 21,
        amenities: ["무료 WiFi", "미니바", "금연", "욕조", "발코니"],
        images: ["/room2.jpg", "/room2-2.jpg"],
        description: "넓은 공간과 편안한 침대 2개가 제공되는 객실입니다.",
        checkInInfo: "무료 취소 2024.10.19(일) 23:59 전까지",
      },
      {
        id: 3,
        name: "이그제큐티브 스위트",
        size: "52㎡",
        bedType: "킹",
        maxOccupancy: 3,
        price: 380000,
        originalPrice: 450000,
        discount: 16,
        amenities: [
          "무료 WiFi",
          "미니바",
          "금연",
          "욕조",
          "거실",
          "네스프레소",
        ],
        images: ["/room3.jpg", "/room3-2.jpg"],
        description: "거실과 침실이 분리된 프리미엄 객실입니다.",
        checkInInfo: "무료 취소 2024.10.19(일) 23:59 전까지",
      },
      {
        id: 4,
        name: "프리미엄 디럭스",
        size: "38㎡",
        bedType: "더블",
        maxOccupancy: 2,
        price: 280000,
        originalPrice: 340000,
        discount: 18,
        amenities: ["무료 WiFi", "미니바", "금연", "욕조", "시티뷰"],
        images: ["/room4.jpg", "/room4-2.jpg"],
        description: "도심 전망을 감상할 수 있는 프리미엄 객실입니다.",
        checkInInfo: "무료 취소 2024.10.19(일) 23:59 전까지",
      },
    ],
    reviews: [
      {
        id: 1,
        rating: 9.0,
        userName: "김**",
        date: "2024.10.10",
        roomType: "스탠다드 더블",
        comment:
          "위치도 좋고 깨끗해서 만족스러웠습니다. 직원분들도 친절하시고 조식도 훌륭했어요!",
      },
      {
        id: 2,
        rating: 8.5,
        userName: "이**",
        date: "2024.10.08",
        roomType: "디럭스 트윈",
        comment: "가족 여행으로 이용했는데 방이 넓고 편안했습니다.",
      },
      {
        id: 3,
        rating: 7.5,
        userName: "박**",
        date: "2024.10.05",
        roomType: "프리미엄 디럭스",
        comment: "전체적으로 좋았지만 가격대비 아쉬운 부분도 있었어요.",
      },
    ],
  };

  const formatPrice = (price) => new Intl.NumberFormat("ko-KR").format(price);

  // 네비게이션 섹션
  const navSections = [
    { id: "rooms", label: "객실" },
    { id: "amenities", label: "편의시설" },
    { id: "reviews", label: "리뷰" },
    { id: "location", label: "위치" },
    { id: "policy", label: "정책" },
  ];

  // 스크롤 이벤트 처리
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
          const navTop = navRef.current.offsetTop;
          const shouldBeFixed = scrollY > navTop;

          // 깜박거림 방지를 위해 상태 변경을 최소화
          if (shouldBeFixed !== isNavFixed) {
            setIsNavFixed(shouldBeFixed);
          }

          // 현재 보이는 섹션 감지
          const navHeight = navRef.current ? navRef.current.offsetHeight : 0;
          const threshold = (isModal ? 80 : 64) + navHeight + 10;

          // 현재 보이는 섹션 감지 부분
          if (!isScrollingToSection) {
            let currentSection = "rooms";
            let closestDistance = Infinity;

            // 각 섹션의 top과 threshold 사이의 거리를 계산해 가장 가까운 섹션 찾기
            Object.entries(sectionsRef.current).forEach(([key, element]) => {
              if (element) {
                const distance = Math.abs(
                  scrollY + threshold - element.offsetTop
                );
                if (distance < closestDistance) {
                  closestDistance = distance;
                  currentSection = key;
                }
              }
            });

            // 마지막 정책 섹션은 스크롤이 바닥에 닿았을 때 강제로 활성화
            // 스크롤 바닥 감지
            const root = isModal
              ? scrollContainerRef.current
              : document.documentElement;
            const scrollTop = isModal ? root.scrollTop : root.scrollTop; // window.scrollY 대신 root.scrollTop
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
  }, [isNavFixed, isModal, scrollContainerRef, isScrollingToSection]);

  //사용자가 목차를 클릭해서 이동했을때 스크롤 중 인상태를 기억해놓음
  const scrollToSection = (sectionId) => {
    const element = sectionsRef.current[sectionId];
    if (element) {
      setActiveSection(sectionId); // 클릭시 활성화화시킴
      setIsScrollingToSection(true); // 스크롤중 상태를 기억해놓음

      const scrollElement = isModal ? scrollContainerRef.current : window;
      const navHeight = navRef.current ? navRef.current.offsetHeight : 0;
      const headerHeight = isModal ? 80 : 64;
      const offsetTop = element.offsetTop - (headerHeight + navHeight + 10);

      const done = () => setTimeout(() => setIsScrollingToSection(false), 400);

      if (isModal && scrollElement) {
        scrollElement.scrollTo({ top: offsetTop, behavior: "smooth" });
        done();
      } else {
        window.scrollTo({ top: offsetTop, behavior: "smooth" });
        done();
      }
    }
  };

  return (
    <div id={`hotel-${hotelData.id}`} className="bg-gray-50 min-h-screen">
      {/* Sticky 헤더 */}
      <div
        className={`bg-white border-b ${
          isModal ? "" : "sticky top-0 z-40"
        } shadow-sm`}
      >
        <div className={`${isModal ? "px-4" : "max-w-7xl mx-auto px-4"} py-3`}>
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <h1 className="text-lg font-bold text-gray-900 truncate">
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
                ₩{formatPrice(hotelData.rooms[0].price)}
              </p>
              <LiveViewerCount hotelId={hotelData.id} />
            </div>
          </div>
        </div>
      </div>

      {/* Sticky 네비게이션 */}
      <div
        ref={navRef}
        className={`bg-white border-b ${
          isModal
            ? "modal-sticky-nav shadow-md"
            : isNavFixed
            ? "sticky top-[4rem] z-30 shadow-md"
            : ""
        }`}
      >
        <div className={`${isModal ? "px-4" : "max-w-7xl mx-auto px-4"}`}>
          <div className="flex gap-1 overflow-x-auto">
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

      <div
        className={`${
          isModal ? "px-4 py-4" : "max-w-7xl mx-auto px-4 py-6 pt-6"
        }`}
      >
        {/* 호텔 이미지 갤러리 */}
        <div
          className={`mb-6 grid grid-cols-2 md:grid-cols-4 gap-2 ${
            isModal ? "h-48" : "h-80"
          }`}
        >
          <div className="col-span-2 row-span-2 relative bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg overflow-hidden">
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-6xl mb-3">🏨</span>
              <span className="text-sm text-gray-600">메인 이미지</span>
            </div>
          </div>
          {[1, 2, 3, 4].map((idx) => (
            <div
              key={idx}
              className="relative bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg overflow-hidden"
            >
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-3xl">🖼️</span>
              </div>
            </div>
          ))}
        </div>

        {/* 호텔 소개 */}
        <div className="bg-white rounded-lg p-6 mb-6 shadow">
          <h2 className="text-2xl font-bold mb-3">{hotelData.name}</h2>
          <p className="text-gray-600 mb-4">{hotelData.description}</p>
          <div className="flex items-center gap-6 text-sm">
            <div>
              <span className="text-gray-500">체크인:</span>
              <span className="font-medium ml-2">{hotelData.checkInTime}</span>
            </div>
            <div>
              <span className="text-gray-500">체크아웃:</span>
              <span className="font-medium ml-2">{hotelData.checkOutTime}</span>
            </div>
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <span
                  key={i}
                  className={`text-sm ${
                    i < hotelData.starRating
                      ? "text-yellow-400"
                      : "text-gray-300"
                  }`}
                >
                  ★
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* 객실 섹션 */}
        <div ref={(el) => (sectionsRef.current["rooms"] = el)} className="mb-8">
          <h2 className="text-2xl font-bold mb-4">객실 선택</h2>
          <div className="space-y-4">
            {hotelData.rooms.map((room) => (
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
        <div
          ref={(el) => (sectionsRef.current["amenities"] = el)}
          className="bg-white rounded-lg p-6 mb-6 shadow"
        >
          <h2 className="text-2xl font-bold mb-4">편의시설</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {hotelData.amenities.map((amenity, idx) => (
              <div
                key={idx}
                className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
              >
                <span className="text-2xl">✓</span>
                <span className="text-gray-700">{amenity}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 리뷰 섹션 */}
        <div
          ref={(el) => (sectionsRef.current["reviews"] = el)}
          className="bg-white rounded-lg p-6 mb-6 shadow"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">고객 리뷰</h2>
            <div className="flex items-center gap-2">
              <span className="text-3xl font-bold text-blue-600">
                {hotelData.rating}
              </span>
              <div>
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <span
                      key={i}
                      className={`${
                        i < Math.floor(hotelData.rating / 2)
                          ? "text-yellow-400"
                          : "text-gray-300"
                      }`}
                    >
                      ★
                    </span>
                  ))}
                </div>
                <p className="text-sm text-gray-500">
                  {hotelData.reviewCount}개 리뷰
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {hotelData.reviews.map((review) => (
              <div key={review.id} className="border-b pb-4 last:border-b-0">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <span className="font-medium">{review.userName}</span>
                    <span className="text-sm text-gray-500">{review.date}</span>
                    <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                      {review.roomType}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-yellow-500">⭐</span>
                    <span className="font-medium">{review.rating}</span>
                  </div>
                </div>
                <p className="text-gray-700">{review.comment}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 위치 섹션 */}
        <div
          ref={(el) => (sectionsRef.current["location"] = el)}
          className="bg-white rounded-lg p-6 mb-6 shadow"
        >
          <h2 className="text-2xl font-bold mb-4">위치</h2>
          <p className="text-gray-700 mb-4">{hotelData.location}</p>
          <div className="w-full h-64 bg-gray-200 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <span className="text-4xl mb-2 block">🗺️</span>
              <span className="text-gray-500">지도 영역</span>
            </div>
          </div>
        </div>

        {/* 정책 섹션 */}
        <div
          ref={(el) => (sectionsRef.current["policy"] = el)}
          className="bg-white rounded-lg p-6 shadow"
        >
          <h2 className="text-2xl font-bold mb-4">이용 정책</h2>
          <div className="space-y-4 text-gray-700">
            <div>
              <h3 className="font-semibold mb-2">체크인/체크아웃</h3>
              <p className="text-sm">• 체크인: {hotelData.checkInTime} 이후</p>
              <p className="text-sm">
                • 체크아웃: {hotelData.checkOutTime} 이전
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">취소 정책</h3>
              <p className="text-sm">• 체크인 3일 전까지 무료 취소 가능</p>
              <p className="text-sm">• 이후 취소 시 1박 요금이 부과됩니다</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">아동 정책</h3>
              <p className="text-sm">• 모든 연령의 아동 투숙 가능</p>
              <p className="text-sm">
                • 7세 이하 아동 무료 (기존 침대 이용 시)
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">반려동물</h3>
              <p className="text-sm">• 반려동물 동반 불가</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HotelDetail;
