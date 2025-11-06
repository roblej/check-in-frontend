"use client";

import LiveViewerCount from "./LiveViewerCount";

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
  // 평균가 계산
  // const averagePrice =
  //   Array.isArray(rooms) && rooms.length > 0
  //     ? (rooms[0]?.basePrice || rooms[0]?.price || 0) *
  //       (searchParams?.nights || 1)
  //     : 0;
  /** 최저가 계산 */
  const lowestPrice =
      Array.isArray(rooms) && rooms.length > 0
          ? Math.min(...rooms.map(r => r.basePrice || r.price || 0)) *
          (searchParams?.nights || 1)
          : 0;

  return (
    <div className={`bg-white border-b border-gray-200 z-40 shadow-sm flex-shrink-0`}>
      <div
        className={`${
          isModal ? "px-2.5" : "px-4 sm:px-6 lg:px-8"
        } py-3`}
      >
        <div className="flex items-center justify-between">
          {/* 호텔 기본 정보 */}
          <div className="flex-1 min-w-0">
            <h1
              className={`font-bold text-gray-900 truncate ${
                isModal ? "text-lg" : "text-2xl"
              }`}
            >
              {hotelData?.name}
            </h1>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              {hotelData?.rating > 0 && (
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
              {hotelData?.location && (
                <span className="text-sm text-gray-600 truncate">
                  {hotelData.location}
                </span>
              )}
            </div>
          </div>

          {/* 가격 및 조회수 */}
          {isModal ? (
            <div className="flex items-start gap-4 ml-4">
              <div className="flex flex-col items-end gap-1">
                <LiveViewerCount contentId={contentId} />
                <p className="text-sm text-gray-500 mt-1">최저가</p>
                <p className="text-xl font-bold text-blue-600">
                  ₩{formatPrice(lowestPrice)}~
                </p>
              </div>
              {onClose && (
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  aria-label="닫기"
                >
                  <svg
                    className="w-6 h-6 text-gray-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-6 ml-4">
              <LiveViewerCount contentId={contentId} />
              <div className="text-right">
                <p className="text-sm text-gray-500">최저가</p>
                <p className="text-xl font-bold text-blue-600">
                  ₩{formatPrice(lowestPrice)}~
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HotelHeader;
