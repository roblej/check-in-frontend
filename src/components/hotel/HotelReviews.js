"use client";

/**
 * 호텔 리뷰 컴포넌트
 * @param {Object} props
 * @param {Array} props.reviews - 리뷰 배열
 * @param {number} props.rating - 평균 평점
 * @param {number} props.reviewCount - 리뷰 개수
 */
const HotelReviews = ({ reviews, rating, reviewCount }) => {
  return (
    <div className="bg-white rounded-lg p-6 mb-6 shadow">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">고객 리뷰</h2>
        <div className="flex items-center gap-2">
          <span className="text-3xl font-bold text-blue-600">{rating}</span>
          <div>
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <span
                  key={i}
                  className={`${
                    i < Math.floor(rating / 2)
                      ? "text-yellow-400"
                      : "text-gray-300"
                  }`}
                >
                  ★
                </span>
              ))}
            </div>
            <p className="text-sm text-gray-500">{reviewCount}개 리뷰</p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {reviews.map((review) => (
          <div
            key={review.id}
            className="border-b pb-4 last:border-b-0 hover:bg-gray-50 p-3 rounded-lg transition-colors"
          >
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
  );
};

export default HotelReviews;
