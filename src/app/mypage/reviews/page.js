'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { mypageAPI } from '@/lib/api/mypage';
import { 
  ChevronLeft, ChevronRight, Star, Pencil
} from 'lucide-react';

export default function MyReviewsPage() {
  const router = useRouter();

  // 탭: 작성 가능한 리뷰 / 내가 작성한 리뷰 (초기 포커스: 작성 가능한 리뷰)
  const [reviewTab, setReviewTab] = useState('writable');

  // 데이터 상태
  const [writableReviews, setWritableReviews] = useState([]);
  const [writableReviewsLoading, setWritableReviewsLoading] = useState(false);
  const [writtenReviews, setWrittenReviews] = useState([]);
  const [writtenReviewsLoading, setWrittenReviewsLoading] = useState(false);
  const [completedReservations, setCompletedReservations] = useState([]);
  const [completedLoading, setCompletedLoading] = useState(false);
  const [writtenReservationIdSet, setWrittenReservationIdSet] = useState(new Set());

  // 초기 로드
  useEffect(() => {
    loadWritableReviews();
    loadWrittenReviews();
    loadCompletedReservations();
  }, []);

  // 작성 가능한 리뷰 불러오기
  const loadWritableReviews = async () => {
    setWritableReviewsLoading(true);
    try {
      const response = await mypageAPI.getWritableReviews();
      setWritableReviews(response.reviews || []);
    } catch (error) {
      console.error('작성 가능한 리뷰 로드 실패:', error);
    } finally {
      setWritableReviewsLoading(false);
    }
  };

  // 작성한 리뷰 불러오기
  const loadWrittenReviews = async () => {
    setWrittenReviewsLoading(true);
    try {
      const response = await mypageAPI.getMyReviews();
      const reviews = response.reviews || [];
      setWrittenReviews(reviews);
      const idSet = new Set(reviews.map(r => r.reservationIdx));
      setWrittenReservationIdSet(idSet);
    } catch (error) {
      console.error('작성한 리뷰 로드 실패:', error);
    } finally {
      setWrittenReviewsLoading(false);
    }
  };

  const handleWriteReview = (reservation) => {
    router.push(`/mypage/review/write?reservationId=${reservation.id || reservation.reservationIdx}`);
  };

  // 이용완료 예약 불러오기
  const loadCompletedReservations = async () => {
    setCompletedLoading(true);
    try {
      const response = await mypageAPI.getReservations('completed');
      setCompletedReservations(response?.reservations || []);
    } catch (e) {
      console.error('이용완료 예약 로드 실패:', e);
    } finally {
      setCompletedLoading(false);
    }
  };

  const getNightsText = (checkIn, checkOut) => {
    if (!checkIn || !checkOut) return '';
    const toDate = (s) => {
      if (typeof s !== 'string') return new Date(s);
      // "2025.10.20" 형태 허용
      const normalized = s.replace(/\./g, '-');
      return new Date(normalized);
    };
    const inDate = toDate(checkIn);
    const outDate = toDate(checkOut);
    const diff = Math.max(0, Math.round((outDate - inDate) / (1000 * 60 * 60 * 24)));
    return `(${diff}박)`;
  };

  const getHotelThumb = (r) => {
    if (!r) return '/next.svg';
    // 우선순위: thumbnailUrl > imageUrl > contentId 기반 썸네일
    if (r.thumbnailUrl) return r.thumbnailUrl;
    if (r.imageUrl) return r.imageUrl;
    if (r.hotelInfo?.imageUrl) return r.hotelInfo.imageUrl;
    const contentId = r.contentId || r.contentid || r.contentID || r.hotelInfo?.contentId;
    if (contentId) return `/api/hotels/${contentId}/thumbnail`;
    console.log('썸네일 없음');
    console.log(r);
    return '/next.svg';
  };

  // 주소/지역에서 시(도)까지만 추출
  const getRegion = (adress, location) => {
    const source = (adress || location || '').toString().trim();
    if (!source) return '';
    const tokens = source.split(/\s+/);
    return tokens[0] || '';
  };

  // 날짜 포맷 (LocalDate 또는 문자열 → YYYY.MM.DD)
  const formatDate = (d) => {
    if (!d) return '';
    const dt = typeof d === 'string' ? new Date(d) : new Date(d);
    if (isNaN(dt.getTime())) return String(d);
    const y = dt.getFullYear();
    const m = String(dt.getMonth() + 1).padStart(2, '0');
    const day = String(dt.getDate()).padStart(2, '0');
    return `${y}.${m}.${day}`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-3xl mx-auto px-4 py-6">
        {/* 상단 타이틀 바 (뒤로가기) */}
        <div className="flex items-center gap-2 mb-4">
          <button
            onClick={() => router.push('/mypage')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="마이페이지로 돌아가기"
          >
            <ChevronLeft className="w-5 h-5 text-gray-700" />
          </button>
          <h1 className="text-lg font-bold text-gray-900">내 리뷰</h1>
        </div>

        {/* 정렬/필터 바 (UI 전용) */}
        <div className="bg-white border border-gray-200 rounded-xl p-3 mb-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 text-sm">
              <button className="px-3 py-1.5 rounded-full bg-gray-100 text-gray-700 font-medium">최근 방문순</button>
              <button className="px-3 py-1.5 rounded-full hover:bg-gray-100 text-gray-600">조회수 높은순</button>
            </div>
            <div className="ml-auto flex items-center gap-2 text-sm">
              <label className="inline-flex items-center gap-2 text-gray-700">
                <input type="checkbox" className="accent-blue-600" />
                사진 리뷰만
              </label>
            </div>
          </div>
          <div className="mt-3 flex items-center gap-2 text-xs">
            <button className="px-3 py-1 rounded-full bg-blue-600 text-white">호텔 {writtenReviews.length}</button>
            <button className="px-3 py-1 rounded-full bg-gray-100 text-gray-700">모텔 0</button>
          </div>
        </div>

        {/* 탭 */}
        <div className="bg-white border border-gray-200 rounded-xl p-0 mb-4">
          <div className="flex gap-6 px-4">
            <button
              onClick={() => setReviewTab('writable')}
              className={`relative -mb-px px-0 py-3 text-sm font-medium border-b-2 ${
                reviewTab === 'writable' ? 'text-blue-600 border-blue-600' : 'text-gray-500 border-transparent hover:text-gray-700'
              }`}
            >
              작성 가능한 리뷰 ({writableReviews.length})
            </button>
            <button
              onClick={() => setReviewTab('written')}
              className={`relative -mb-px px-0 py-3 text-sm font-medium border-b-2 ${
                reviewTab === 'written' ? 'text-blue-600 border-blue-600' : 'text-gray-500 border-transparent hover:text-gray-700'
              }`}
            >
              내가 작성한 리뷰 ({writtenReviews.length})
            </button>
          </div>
        </div>

        {/* 내용 */}
        {/* 이용완료 예약 목록 (리뷰 유도) - 작성 가능한 리뷰 탭에서만 표시, 이미 작성한 예약은 제외 */}
        {reviewTab === 'writable' && (
          <div className="space-y-3 mb-6">
            {completedLoading ? (
              <div className="flex justify-center items-center py-8">
                <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              completedReservations
                .filter(r => {
                  const id = r.reservIdx || r.id || r.reservationNumber;
                  return !writtenReservationIdSet.has(id);
                })
                .map((r) => (
                  <div key={r.id || r.reservIdx || r.reservationNumber} className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
                    <div className="flex items-start gap-3">
                      <img
                        src={getHotelThumb(r)}
                        alt={r.hotelName || 'thumbnail'}
                        className="w-16 h-16 rounded-lg object-cover flex-shrink-0 bg-gray-100"
                        onError={(e) => { e.currentTarget.src = '/next.svg'; }}
                      />
                      <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="px-2 py-0.5 text-[11px] rounded bg-emerald-500 text-white shrink-0">이용완료</span>
                        <p className="font-semibold text-gray-900 truncate">
                          {r.hotelName}
                        </p>
                      </div>
                          <button className="p-1.5 rounded hover:bg-gray-50">
                            <ChevronRight className="w-4 h-4 text-gray-400" />
                          </button>
                        </div>
                    <p className="text-xs text-gray-500 mb-0.5">{getRegion(r.adress, r.location)}</p>
                    <p className="text-xs text-gray-600">{r.checkIn} - {r.checkOut} {getNightsText(r.checkIn, r.checkOut)}</p>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center justify-between gap-2">
                      <button
                        onClick={() => router.push(`/mypage/reservation/${r.id || r.reservationNumber || r.reservIdx}`)}
                        className="flex-1 h-10 rounded-lg border border-gray-300 text-gray-700 text-sm hover:bg-gray-50"
                      >
                        예약 상세 확인
                      </button>
                      <button
                        onClick={() => router.push('/mypage?tab=completed')}
                        className="flex-1 h-10 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm"
                      >
                        리뷰 쓰기
                      </button>
                    </div>
                  </div>
                ))
            )}
          </div>
        )}

        {reviewTab === 'writable' ? (
          writableReviewsLoading ? (
            <div className="flex justify-center items-center py-16">
              <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : writableReviews.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-2xl p-10 text-center">
              <div className="w-10 h-10 mx-auto mb-3 rounded-full bg-gray-100 flex items-center justify-center">
                <span className="text-gray-400 text-xl">!</span>
              </div>
              <p className="text-gray-700 font-medium mb-1">작성한 리뷰가 없습니다.</p>
              <p className="text-gray-500 text-sm mb-4">나의 발자취를 소중한 기록으로 남겨보세요.</p>
              <button
                onClick={() => router.push('/mypage?tab=completed')}
                className="px-4 py-2 rounded-full border border-gray-300 text-gray-700 hover:bg-gray-50 text-sm"
              >
                리뷰쓰기
              </button>
            </div>
          ) : null
        ) : (
          writtenReviewsLoading ? (
            <div className="flex justify-center items-center py-16">
              <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : writtenReviews.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-2xl p-10 text-center">
              <div className="w-10 h-10 mx-auto mb-3 rounded-full bg-gray-100 flex items-center justify-center">
                <span className="text-gray-400 text-xl">!</span>
              </div>
              <p className="text-gray-700 font-medium mb-1">작성한 리뷰가 없습니다.</p>
              <p className="text-gray-500 text-sm mb-4">나의 발자취를 소중한 기록으로 남겨보세요.</p>
              <button
                onClick={() => router.push('/mypage?tab=completed')}
                className="px-4 py-2 rounded-full border border-gray-300 text-gray-700 hover:bg-gray-50 text-sm"
              >
                리뷰쓰기
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {writtenReviews.map((review) => (
                <div key={review.reviewIdx} className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
                  <div className="flex items-start gap-3">
                    <img
                      src={getHotelThumb({
                        thumbnailUrl: review.thumbnailUrl,
                        contentId: review.contentId || review.hotelInfo?.contentId
                      })}
                      alt={review.hotelName || review.hotelInfo?.title || 'thumbnail'}
                      className="w-16 h-16 rounded-lg object-cover flex-shrink-0 bg-gray-100"
                      onError={(e) => { e.currentTarget.src = '/next.svg'; }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-semibold text-gray-900 truncate">
                          {review.hotelName || review.hotelInfo?.title || '호텔 정보 없음'}
                        </p>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => router.push(`/mypage/review/edit?reviewId=${review.reviewIdx}`)}
                            className="p-1.5 rounded hover:bg-gray-50"
                            aria-label="리뷰 수정"
                          >
                            <Pencil className="w-4 h-4 text-gray-500" />
                          </button>
                          <ChevronRight className="w-4 h-4 text-gray-400" />
                        </div>
                      </div>
                      {/* 지역 */}
                      {(review.region || review.hotelInfo?.adress || review.location) && (
                        <p className="text-xs text-gray-500 mb-0.5">{review.region || getRegion(review.hotelInfo?.adress, review.location)}</p>
                      )}
                      {/* 체크인 - 체크아웃 + (박수) */}
                      {(review.checkInDate && review.checkOutDate) && (
                        <p className="text-xs text-gray-600 mb-0.5">
                          {formatDate(review.checkInDate)} - {formatDate(review.checkOutDate)} {getNightsText(review.checkInDate, review.checkOutDate)}
                        </p>
                      )}
                      {review.createdAt && (
                        <p className="text-xs text-gray-500 mb-1">작성일: {new Date(review.createdAt).toLocaleDateString('ko-KR')}</p>
                      )}
                      {/* 별점 + 리뷰내용 (날짜 아래) */}
                      <div className="mt-1">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className={`w-4 h-4 ${i < (review.star || 0) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                            ))}
                          </div>
                          {/* 작성일은 상단에 별도 표기 */}
                        </div>
                        <p className="text-sm text-gray-700 whitespace-pre-line">{review.content}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </div>

      <Footer />
    </div>
  );
}


