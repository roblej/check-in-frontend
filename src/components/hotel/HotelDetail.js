"use client";

import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import RoomCard from "./RoomCard";
import HotelGallery from "./HotelGallery";
import HotelInfo from "./HotelInfo";
import HotelAmenities from "./HotelAmenities";
import HotelReviews from "./HotelReviews";
import HotelLocation from "./HotelLocation";
import HotelPolicy from "./HotelPolicy";
import HotelHeader from "./HotelHeader";
import BookingSummary from "./BookingSummary";
import HotelNavBar from "./HotelNavBar";
import SearchConditionModal from "./SearchConditionModal";
import { useSearchStore } from "@/stores/searchStore";
import { updateUrlParams, formatSearchParamsForUrl } from "@/utils/urlUtils";
import { useHotelData } from "./hooks/useHotelData";
import { useHotelNavigation } from "./hooks/useHotelNavigation";

/**
 * 호텔 상세 정보 컴포넌트
 * @param {Object} props
 * @param {number|string} props.contentId - 호텔 ID
 * @param {Object} [props.searchParams={}] - 검색 파라미터
 * @param {boolean} [props.isModal=false] - 모달 모드 여부
 * @param {React.RefObject} [props.scrollContainerRef] - 외부 스크롤 컨테이너 ref
 * @param {Function} [props.onSearchParamsChange] - 검색 조건 변경 콜백
 * @param {Function} [props.onLoadingChange] - 로딩 상태 변경 콜백
 * @param {Function} [props.onClose] - 모달 닫기 콜백
 */
const HotelDetail = ({
  contentId,
  searchParams = {},
  isModal = false,
  scrollContainerRef: externalScrollRef,
  onSearchParamsChange,
  onLoadingChange,
  onClose,
}) => {
  const router = useRouter();
  const urlSearchParams = useSearchParams();
  const { updateSearchParams } = useSearchStore();

  const [localSearchParams, setLocalSearchParams] = useState(searchParams);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [headerHeight, setHeaderHeight] = useState(0);

  const internalScrollRef = useRef(null);

  // 전체 페이지 모드에서는 window를 스크롤 컨테이너로 사용
  const [windowScrollRef, setWindowScrollRef] = useState({ current: null });

  useEffect(() => {
    if (!isModal && typeof window !== "undefined") {
      setWindowScrollRef({ current: window });
    }
  }, [isModal]);

  const scrollContainerRef = isModal
    ? externalScrollRef || internalScrollRef
    : windowScrollRef;

  // 다이닝 모드일 때 diningDate를 checkIn과 checkOut으로 변환
  const displaySearchParams = useMemo(() => {
    const diningDate = urlSearchParams.get("diningDate");
    const isDiningMode = urlSearchParams.get("diningMode") === "true";

    if (isDiningMode && diningDate) {
      // 다이닝 모드일 때 diningDate를 checkIn과 checkOut 둘 다에 설정
      return {
        ...localSearchParams,
        checkIn: diningDate,
        checkOut: diningDate,
        nights: 1,
      };
    }

    return localSearchParams;
  }, [localSearchParams, urlSearchParams]);

  // 커스텀 훅 사용
  const { hotelData, rooms, dinings, isLoading, errorMessage, formatPrice } =
    useHotelData(contentId, localSearchParams, onLoadingChange);

  const {
    activeSection,
    navSections: baseNavSections,
    navRef,
    headerRef,
    scrollToSection,
    setSectionRef,
  } = useHotelNavigation(scrollContainerRef, isModal, "rooms");

  // 다이닝이 있으면 네비게이션 섹션에 추가 (객실보다 먼저)
  const navSections = useMemo(() => {
    const sections = [];
    if (Array.isArray(dinings) && dinings.length > 0) {
      sections.push({ id: "dinings", label: "다이닝" });
    }
    sections.push(...baseNavSections);
    return sections;
  }, [dinings, baseNavSections]);

  // 모달 모드에서 헤더 높이 계산
  useEffect(() => {
    if (isModal && headerRef.current) {
      const updateHeaderHeight = () => {
        if (headerRef.current) {
          setHeaderHeight(headerRef.current.offsetHeight);
        }
      };
      // 여러 시점에 측정 (레이아웃 완료 대기)
      const timeouts = [
        setTimeout(updateHeaderHeight, 0),
        setTimeout(updateHeaderHeight, 100),
        setTimeout(updateHeaderHeight, 300),
      ];
      window.addEventListener("resize", updateHeaderHeight);
      return () => {
        window.removeEventListener("resize", updateHeaderHeight);
        timeouts.forEach(clearTimeout);
      };
    }
  }, [isModal, hotelData, headerRef]);

  /**
   * 로컬 검색 조건 업데이트 함수
   */
  const updateLocalSearchParams = useCallback(
    (newParams) => {
      const updatedParams = { ...localSearchParams, ...newParams };
      setLocalSearchParams(updatedParams);

      if (onSearchParamsChange) {
        onSearchParamsChange(updatedParams);
        return;
      }

      if (isModal) {
        return;
      }

      const urlParams = formatSearchParamsForUrl(updatedParams);
      const newUrl = updateUrlParams(urlParams);
      router.replace(newUrl, { scroll: false });
    },
    [localSearchParams, isModal, router, onSearchParamsChange]
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
          <p className="text-red-600 text-lg font-medium mb-2">
            {errorMessage}
          </p>
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
    <div
      id={`hotel-${hotelData.id}`}
      className={`${
        isModal ? "flex flex-col w-full bg-white" : "min-h-screen bg-gray-50"
      }`}
      style={
        isModal
          ? {
              minHeight: "calc(100% + 1px)",
            }
          : undefined
      }
    >
      {/* 고정 헤더 */}
      <div
        ref={headerRef}
        className={`w-full flex-shrink-0 ${
          isModal ? "relative z-40 bg-white" : "sticky z-40 bg-gray-50"
        }`}
        style={!isModal ? { top: "56px" } : undefined}
      >
        <div
          className={
            isModal ? "px-2.5" : "max-w-6xl mx-auto px-4 sm:px-6 lg:px-8"
          }
        >
          <HotelHeader
            hotelData={hotelData}
            contentId={contentId}
            rooms={rooms}
            searchParams={localSearchParams}
            formatPrice={formatPrice}
            isModal={isModal}
            onClose={onClose}
          />

          {/* 검색 조건 표시 */}
          <BookingSummary
            searchParams={displaySearchParams}
            onEdit={() => setIsSearchModalOpen(true)}
          />
        </div>
      </div>

      {/* 고정 네비게이션 */}
      <div
        ref={navRef}
        className={`w-full flex-shrink-0 ${
          isModal
            ? "sticky top-0 z-30 shadow-sm bg-white"
            : "sticky z-30 bg-gray-50"
        }`}
        style={
          isModal
            ? {
                position: "sticky",
                top: "0",
                alignSelf: "flex-start",
                width: "100%",
              }
            : !isModal
            ? {
                top:
                  (headerRef.current?.offsetHeight || 0) +
                  (typeof window !== "undefined"
                    ? document.querySelector("header")?.offsetHeight || 56
                    : 56) +
                  "px",
              }
            : undefined
        }
      >
        <div
          className={
            isModal ? "px-2.5" : "max-w-6xl mx-auto px-4 sm:px-6 lg:px-8"
          }
        >
          <HotelNavBar
            sections={navSections}
            activeSection={activeSection}
            onSectionClick={scrollToSection}
            isModal={isModal}
          />
        </div>
      </div>

      {/* 메인 컨텐츠 */}
      <div
        ref={isModal ? null : null}
        className={`${
          isModal
            ? "flex-1 px-2.5 py-4 pb-0.5"
            : "max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pt-6"
        }`}
        style={
          isModal
            ? {
                scrollbarWidth: "thin",
                scrollbarColor: "#d1d5db #f3f4f6",
              }
            : undefined
        }
      >
        {/* 이미지 갤러리 */}
        <HotelGallery contentId={contentId} isModal={isModal} />

        {/* 호텔 기본 정보 - 패널 모드에서는 숨김 */}
        {!isModal && <HotelInfo hotelData={hotelData} />}

        {/* 다이닝 목록 - 객실보다 먼저 표시 */}
        {Array.isArray(dinings) && dinings.length > 0 && (
          <section
            ref={setSectionRef("dinings")}
            className="mb-8"
            aria-labelledby="dinings-heading"
          >
            <h2 id="dinings-heading" className="text-2xl font-bold mb-4">
              다이닝
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {dinings.map((dining) => (
                <div
                  key={dining.diningIdx}
                  className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow md:col-span-2"
                >
                  {dining.imageUrl && (
                    <div className="relative h-48 w-full">
                      <img
                        src={dining.imageUrl}
                        alt={dining.name || "다이닝"}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="p-4">
                    <h3 className="text-lg font-semibold mb-2">
                      {dining.name || "다이닝"}
                    </h3>
                    {dining.description && (
                      <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                        {dining.description}
                      </p>
                    )}
                    <div className="flex items-center justify-between">
                      <div>
                        {dining.openTime && dining.closeTime && (
                          <p className="text-sm text-gray-500">
                            운영시간: {String(dining.openTime).substring(0, 5)}{" "}
                            - {String(dining.closeTime).substring(0, 5)}
                          </p>
                        )}
                        {dining.basePrice && (
                          <p className="text-lg font-bold text-blue-600 mt-1">
                            ₩{formatPrice(dining.basePrice)} / 인
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => {
                          // URL에서 다이닝 날짜 직접 읽기
                          const diningDateFromUrl =
                            urlSearchParams.get("diningDate");
                          const diningDate =
                            diningDateFromUrl ||
                            localSearchParams.diningDate ||
                            localSearchParams.checkIn ||
                            new Date().toISOString().split("T")[0];

                          // 세션 스토리지에 다이닝 예약 정보 저장 (URL 파라미터 숨기기)
                          const reservationData = {
                            diningIdx: dining.diningIdx,
                            contentId: contentId,
                            diningName: dining.name || "",
                            hotelName:
                              hotelData?.name || hotelData?.title || "",
                            hotelAddress:
                              hotelData?.address || hotelData?.adress || "",
                            diningDate: diningDate,
                            diningTime: "",
                            guests: localSearchParams.adults || 2,
                            basePrice: dining.basePrice || 0,
                            imageUrl: dining.imageUrl || "",
                            openTime: dining.openTime || "11:00:00",
                            closeTime: dining.closeTime || "21:00:00",
                            slotDuration: dining.slotDuration || 60,
                          };

                          sessionStorage.setItem(
                            "dining_reservation",
                            JSON.stringify(reservationData)
                          );

                          // URL 파라미터 없이 이동
                          router.push("/dining-reservation");
                        }}
                        className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors"
                      >
                        예약하기
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 객실 목록 */}
        <section
          ref={setSectionRef("rooms")}
          className="mb-8"
          aria-labelledby="rooms-heading"
        >
          <h2 id="rooms-heading" className="text-2xl font-bold mb-4">
            {localSearchParams?.roomIdx ? "객실 확인" : "객실 선택"}
          </h2>
          <div className="space-y-4">
            {Array.isArray(rooms) && rooms.length > 0 ? (
              rooms.map((room) => (
                <RoomCard
                  key={room.id}
                  room={room}
                  searchParams={localSearchParams}
                  formatPrice={formatPrice}
                  isModal={isModal}
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
          ref={setSectionRef("amenities")}
          aria-labelledby="amenities-heading"
        >
          <HotelAmenities contentId={contentId} />
        </section>

        {/* 리뷰 */}
        <section
          ref={setSectionRef("reviews")}
          aria-labelledby="reviews-heading"
        >
          <HotelReviews
            contentId={contentId}
            reviews={hotelData.reviews}
            rating={hotelData.rating}
            reviewCount={hotelData.reviewCount}
          />
        </section>

        {/* 위치 정보 */}
        <section
          ref={setSectionRef("location")}
          aria-labelledby="location-heading"
        >
          <HotelLocation location={hotelData.location} />
        </section>

        {/* 호텔 정책 */}
        <section ref={setSectionRef("policy")} aria-labelledby="policy-heading">
          <HotelPolicy
            checkInTime={hotelData.checkInTime}
            checkOutTime={hotelData.checkOutTime}
          />
        </section>
      </div>

      {/* 검색 조건 변경 모달 */}
      {isSearchModalOpen && (
        <SearchConditionModal
          isOpen={isSearchModalOpen}
          onClose={() => setIsSearchModalOpen(false)}
          searchParams={localSearchParams}
          onSearchParamsChange={updateLocalSearchParams}
          isPanelMode={isModal}
        />
      )}
    </div>
  );
};

export default HotelDetail;
