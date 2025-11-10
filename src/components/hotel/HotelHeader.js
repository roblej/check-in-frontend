"use client";

import LiveViewerCount from "./LiveViewerCount";
import BookmarkButton from "./BookmarkButton";

/**
 * 호텔 헤더 컴포넌트 - 호텔명, 평점, 가격 등 표시
 * @param {Object} props
 * @param {Object} props.hotelData - 호텔 데이터
 * @param {string|number} props.contentId - 호텔 ID
 * @param {Array} props.rooms - 객실 목록
 * @param {Object} props.searchParams - 검색 파라미터
 * @param {Function} props.formatPrice - 가격 포맷팅 함수
 * @param {boolean} props.isModal - 모달 모드 여부
 * @param {Function} [props.onClose] - 모달 닫기 콜백
 */
const HotelHeader = ({
  hotelData,
  contentId,
  rooms,
  searchParams,
  formatPrice,
  isModal,
  onClose,
}) => {
  if (isModal) {
    return null;
  }

  // 평균가 계산
  // const averagePrice =
  //   Array.isArray(rooms) && rooms.length > 0
  //     ? (rooms[0]?.basePrice || rooms[0]?.price || 0) *
  //       (searchParams?.nights || 1)
  //     : 0;
  /** 최저가 계산 */
  const lowestPrice =
    Array.isArray(rooms) && rooms.length > 0
      ? Math.min(...rooms.map((r) => r.basePrice || r.price || 0)) *
        (searchParams?.nights || 1)
      : 0;

  return (
    <div
      className={`bg-white border-b border-gray-200 z-40 shadow-sm flex-shrink-0`}
    >
      <div className="px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">
                {hotelData?.name || "호텔 정보"}
              </h1>
              {contentId && (
                <BookmarkButton
                  contentId={contentId}
                  size="medium"
                  className="shadow-md"
                />
              )}
            </div>
            {contentId && (
              <div className="text-sm text-gray-600">
                <LiveViewerCount contentId={contentId} showAlways />
              </div>
            )}
          </div>

          <div className="text-right leading-tight">
            <div className="text-sm text-gray-500">최저가</div>
            <div className="text-2xl font-bold text-blue-600">
              ₩{formatPrice(lowestPrice)}~
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HotelHeader;
