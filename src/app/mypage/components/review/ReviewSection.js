'use client';

import { ChevronRight, Star, Edit, Trash2 } from 'lucide-react';

export default function ReviewSection({
  isReviewOpen,
  setIsReviewOpen,
  reviewTab,
  setReviewTab,
  writableReviews,
  writableReviewsLoading,
  writtenReviews,
  writtenReviewsLoading,
  onWriteReview,
  onOpenEditModal,
  onNavigateToReviews
}) {
  if (!isReviewOpen) {
    return (
      <button
        onClick={onNavigateToReviews}
        aria-label="내 리뷰 페이지로 이동"
        className="w-full bg-white rounded-2xl shadow-lg p-9 mb-6 border border-gray-200 flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <span className="text-lg font-semibold text-gray-900">내 리뷰</span>
        <ChevronRight className="w-6 h-6 text-gray-400" />
      </button>
    );
  }

  return (
    <section className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <Star className="w-6 h-6 text-blue-600" />
          내 리뷰
        </h2>
        <button onClick={() => setIsReviewOpen(false)} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500">
          <ChevronRight className="w-5 h-5 rotate-180" />
        </button>
      </div>

      <div className="flex gap-2 mb-6 border-b border-gray-200">
        <button
          onClick={() => setReviewTab('writable')}
          className={`px-6 py-3 font-medium transition-all border-b-2 ${
            reviewTab === 'writable'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          작성 가능한 리뷰 ({writableReviews.length})
        </button>
        <button
          onClick={() => setReviewTab('written')}
          className={`px-6 py-3 font-medium transition-all border-b-2 ${
            reviewTab === 'written'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          내가 작성한 리뷰 ({writtenReviews.length})
        </button>
      </div>

      <div className="space-y-5">
        {reviewTab === 'writable' ? (
          writableReviewsLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <span className="ml-3 text-gray-600">데이터를 불러오는 중...</span>
            </div>
          ) : writableReviews.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">작성 가능한 리뷰가 없습니다.</p>
            </div>
          ) : (
            writableReviews.map((review) => (
              <div key={review.reservationIdx} className="border border-blue-200 bg-blue-50 rounded-xl p-7">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{review.hotelName}</h3>
                    <p className="text-base text-gray-500">{review.location} · 체크아웃: {review.checkOutDate}</p>
                  </div>
                  {review.daysLeft !== undefined && review.daysLeft > 0 && (
                    <span className="px-3 py-1 bg-orange-100 text-orange-700 text-xs font-medium rounded-full">
                      {review.daysLeft}일 남음
                    </span>
                  )}
                </div>
                <button
                  onClick={() => onWriteReview({ id: review.reservationIdx })}
                  className="flex-1 px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors text-base"
                >
                  리뷰 작성
                </button>
              </div>
            ))
          )
        ) : (
          writtenReviewsLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <span className="ml-3 text-gray-600">데이터를 불러오는 중...</span>
            </div>
          ) : writtenReviews.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">작성한 리뷰가 없습니다.</p>
            </div>
          ) : (
            writtenReviews.map((review) => (
              <div key={review.reviewIdx} className="border border-gray-200 rounded-xl p-7">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {review.hotelName || review.hotelInfo?.title || '호텔 정보 없음'}
                    </h3>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-5 h-5 ${i < (review.star || 0) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                          />
                        ))}
                      </div>
                      <span className="text-base text-gray-500">
                        {review.createdAt ? new Date(review.createdAt).toLocaleDateString('ko-KR') : ''}
                      </span>
                      {review.isEdited && (
                        <span className="text-xs leading-none px-2 py-1 rounded bg-gray-100 text-gray-600">수정됨</span>
                      )}
                    </div>
                    <p className="text-gray-700 mb-4 text-base leading-relaxed">{review.content}</p>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => onOpenEditModal(review)}
                      className="p-2.5 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <Edit className="w-5 h-5 text-gray-600" />
                    </button>
                    <button className="p-2.5 hover:bg-red-50 rounded-lg transition-colors">
                      <Trash2 className="w-5 h-5 text-red-600" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )
        )}
      </div>
    </section>
  );
}

