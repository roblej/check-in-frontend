"use client";

import { useState, useEffect, useRef } from "react";
import { hotelAPI } from "@/lib/api/hotel";

/**
 * @typedef {Object} Review
 * @property {string|number} id - 리뷰 고유 ID
 * @property {string} userName - 작성자 이름
 * @property {string} date - 작성 날짜
 * @property {string} roomType - 객실 타입
 * @property {number} rating - 평점 (1-5)
 * @property {string} comment - 리뷰 내용
 * @property {string[]} [images=[]] - 리뷰 이미지 URL 배열
 */

/**
 * 호텔 리뷰 컴포넌트
 * @param {Object} props
 * @param {string|number} props.contentId - 호텔 ID
 * @param {Review[]} [props.reviews=[]] - 리뷰 배열 (선택적, 없으면 API로 가져옴)
 * @param {number} [props.rating=0] - 평균 평점 (1-5) (선택적, 없으면 API로 가져옴)
 * @param {number} [props.reviewCount=0] - 리뷰 개수 (선택적, 없으면 API로 가져옴)
 */
const HotelReviews = ({
  contentId,
  reviews = [],
  rating = 0,
  reviewCount = 0,
}) => {
  const [localReviews, setLocalReviews] = useState([]);
  const [localRating, setLocalRating] = useState(0);
  const [localReviewCount, setLocalReviewCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null); // 선택된 이미지 배열 (모달용)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0); // 모달에서 표시할 이미지 인덱스
  const loadedContentIdRef = useRef(null); // 로드한 contentId 추적 (ref로 무한 루프 방지)
  const prevPropsRef = useRef({ reviews: [], rating: 0, reviewCount: 0 }); // 이전 props 값 추적

  // 이름 마스킹 함수 (한글/영어 구분)
  const maskUserName = (userName) => {
    if (!userName || userName === "익명") return "익명";

    // 한글 체크 (유니코드 범위: AC00-D7AF)
    const isKorean = /[가-힣]/.test(userName);

    if (isKorean) {
      // 한글이면 첫 글자만 표시하고 나머지는 ***
      return userName.charAt(0) + "***";
    } else {
      // 영어면 앞 3글자만 표시하고 나머지는 ***
      if (userName.length <= 3) {
        return userName.charAt(0) + "***";
      }
      return userName.substring(0, 3) + "***";
    }
  };

  // contentId가 변경되면 리셋
  useEffect(() => {
    if (contentId && contentId !== loadedContentIdRef.current) {
      setLocalReviews([]);
      setLocalRating(0);
      setLocalReviewCount(0);
      setShowAll(false);
      setSelectedImage(null);
      setSelectedImageIndex(0);
      loadedContentIdRef.current = null;
    }
  }, [contentId]);

  // 리뷰 데이터 로드 (contentId가 변경될 때만)
  useEffect(() => {
    const loadReviews = async () => {
      if (!contentId) return;

      // 같은 contentId를 이미 로드했으면 다시 로드하지 않음
      if (contentId === loadedContentIdRef.current) {
        return;
      }

      // props로 전달된 데이터가 있으면 사용
      const reviewsStr = JSON.stringify(reviews);
      const prevReviewsStr = JSON.stringify(prevPropsRef.current.reviews);

      if (reviews.length > 0 && reviewsStr !== prevReviewsStr) {
        setLocalReviews(reviews);
        setLocalRating(rating);
        setLocalReviewCount(reviewCount);
        loadedContentIdRef.current = contentId;
        prevPropsRef.current = { reviews, rating, reviewCount };
        return;
      }

      // 없으면 API로 가져오기
      setIsLoading(true);
      try {
        const [reviewsData, summaryData] = await Promise.all([
          hotelAPI.getHotelReviews(contentId),
          hotelAPI.getHotelReviewSummary(contentId),
        ]);

        const reviewsList = Array.isArray(reviewsData)
          ? reviewsData
          : reviewsData?.data || [];
        const summary = summaryData?.data || summaryData || {};

        setLocalReviews(reviewsList);
        setLocalRating(summary.rating || 0);
        setLocalReviewCount(summary.reviewCount || 0);
        loadedContentIdRef.current = contentId;
        prevPropsRef.current = {
          reviews: reviewsList,
          rating: summary.rating || 0,
          reviewCount: summary.reviewCount || 0,
        };
      } catch (error) {
        console.error("리뷰 로드 실패:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadReviews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contentId]);

  // 안전한 배열 처리
  const safeReviews = Array.isArray(localReviews) ? localReviews : [];
  const safeRating = Number(localRating) || 0;
  const safeReviewCount = Number(localReviewCount) || 0;

  // 표시할 리뷰 개수 결정 (1~2개면 모두, 3개 이상이면 showAll에 따라)
  const displayCount =
    safeReviews.length <= 2
      ? safeReviews.length
      : showAll
      ? safeReviews.length
      : 3;
  const displayReviews = safeReviews.slice(0, displayCount);
  const hasMore = safeReviews.length > 3;

  // 별점 표시 (1-5 스케일)
  const renderStars = (ratingValue) => {
    const safeRating = Math.max(1, Math.min(5, Number(ratingValue) || 0));
    const fullStars = Math.floor(safeRating);
    const hasHalfStar = safeRating % 1 >= 0.5;

    return (
      <div className="flex items-center gap-0.5">
        {[...Array(5)].map((_, i) => {
          if (i < fullStars) {
            return (
              <span key={i} className="text-red-500 text-base">
                ★
              </span>
            );
          } else if (i === fullStars && hasHalfStar) {
            return (
              <span key={i} className="text-red-500 text-base">
                ★
              </span>
            );
          } else {
            return (
              <span key={i} className="text-gray-300 text-base">
                ★
              </span>
            );
          }
        })}
      </div>
    );
  };

  // 더보기 버튼 핸들러
  const handleShowMore = () => {
    setShowAll(true);
  };

  return (
    <div className="bg-white rounded-lg p-6 mb-6 shadow" id="reviews">
      {/* 전체 평점 헤더 */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b">
        <h2 className="text-2xl font-bold">고객 리뷰</h2>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-red-500 text-2xl">★</span>
            <span className="text-3xl font-bold text-gray-900">
              {safeRating.toFixed(1)}
            </span>
          </div>
          <div className="text-sm text-gray-500">{safeReviewCount}개 리뷰</div>
        </div>
      </div>

      {/* 로딩 상태 */}
      {isLoading && (
        <div className="text-center py-8 text-gray-500">
          리뷰를 불러오는 중...
        </div>
      )}

      {/* 리뷰 목록 */}
      {!isLoading && (
        <div
          className={`space-y-6 ${safeReviews.length <= 2 ? "space-y-4" : ""}`}
        >
          {displayReviews.length > 0 ? (
            displayReviews.map((review) => {
              const reviewImages = Array.isArray(review.images)
                ? review.images.filter((img) => img)
                : [];
              const reviewRating = Number(review.rating) || 0;

              return (
                <div
                  key={review.id}
                  className="border-b pb-6 last:border-b-0 hover:bg-gray-50 p-4 rounded-lg transition-colors"
                >
                  {/* 리뷰 헤더 (사용자 정보, 날짜, 객실 타입) */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3 flex-1">
                      {/* 프로필 이미지 (기본 아바타) */}
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                        {review.userName?.charAt(0)?.toUpperCase() || "익"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-gray-900">
                            {maskUserName(review.userName)}
                          </span>
                          <span className="text-sm text-gray-500">
                            {review.date || ""}
                          </span>
                          {review.roomType && (
                            <span className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600">
                              {review.roomType}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    {/* 개인 평점 */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {renderStars(reviewRating)}
                      <span className="text-sm font-medium text-gray-700">
                        {reviewRating.toFixed(1)}
                      </span>
                    </div>
                  </div>

                  {/* 리뷰 이미지 갤러리 */}
                  {reviewImages.length > 0 && (
                    <div className="mb-4">
                      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
                        {reviewImages.slice(0, 3).map((imageUrl, idx) => (
                          <div
                            key={idx}
                            className="flex-shrink-0 w-32 h-32 rounded-lg overflow-hidden bg-gray-100 cursor-pointer hover:opacity-90 transition-opacity"
                            onClick={() => {
                              setSelectedImage(reviewImages);
                              setSelectedImageIndex(idx);
                            }}
                          >
                            <img
                              src={imageUrl}
                              alt={`리뷰 이미지 ${idx + 1}`}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.style.display = "none";
                              }}
                            />
                          </div>
                        ))}
                        {reviewImages.length > 3 && (
                          <div
                            className="flex-shrink-0 w-32 h-32 rounded-lg overflow-hidden bg-gray-100 relative cursor-pointer hover:opacity-90 transition-opacity"
                            onClick={() => {
                              setSelectedImage(reviewImages);
                              setSelectedImageIndex(3);
                            }}
                          >
                            <img
                              src={reviewImages[3]}
                              alt={`리뷰 이미지 4`}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.style.display = "none";
                              }}
                            />
                            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center text-white font-semibold">
                              +{reviewImages.length - 3}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* 리뷰 내용 */}
                  <p className="text-gray-700 leading-relaxed">
                    {review.comment || ""}
                  </p>
                </div>
              );
            })
          ) : (
            <div className="text-center py-8 text-gray-500">
              아직 등록된 리뷰가 없습니다.
            </div>
          )}

          {/* 더보기 버튼 */}
          {hasMore && !showAll && (
            <div className="flex justify-center pt-4">
              <button
                onClick={handleShowMore}
                className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors"
                aria-label="더보기"
              >
                리뷰 더보기 ({safeReviews.length - 3}개)
              </button>
            </div>
          )}
        </div>
      )}

      {/* 이미지 모달 */}
      {selectedImage && selectedImage.length > 0 && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-4xl w-full h-full flex items-center justify-center">
            {/* 닫기 버튼 */}
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors z-10"
              aria-label="닫기"
            >
              <svg
                className="w-8 h-8"
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

            {/* 이미지 */}
            <div className="relative w-full h-full flex items-center justify-center">
              <img
                src={selectedImage[selectedImageIndex]}
                alt={`리뷰 이미지 ${selectedImageIndex + 1}`}
                className="max-w-full max-h-full object-contain"
                onClick={(e) => e.stopPropagation()}
              />
            </div>

            {/* 이전 버튼 */}
            {selectedImage.length > 1 && selectedImageIndex > 0 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedImageIndex(selectedImageIndex - 1);
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-black bg-opacity-70 hover:bg-opacity-90 text-white rounded-full p-3 shadow-lg border border-white border-opacity-30 transition-all hover:scale-110"
                aria-label="이전 이미지"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={3}
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
            )}

            {/* 다음 버튼 */}
            {selectedImage.length > 1 &&
              selectedImageIndex < selectedImage.length - 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedImageIndex(selectedImageIndex + 1);
                  }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-black bg-opacity-70 hover:bg-opacity-90 text-white rounded-full p-3 shadow-lg border border-white border-opacity-30 transition-all hover:scale-110"
                  aria-label="다음 이미지"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={3}
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              )}

            {/* 이미지 인덱스 표시 */}
            {selectedImage.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black bg-opacity-50 text-white px-4 py-2 rounded-full text-sm">
                {selectedImageIndex + 1} / {selectedImage.length}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default HotelReviews;
