'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Pagination from '@/components/Pagination';
import { mypageAPI } from '@/lib/api/mypage';
import { 
  ChevronLeft, ChevronRight, Star, Pencil, Trash2, MapPin
} from 'lucide-react';

export default function MyReviewsPage() {
  const router = useRouter();

  // 탭: 작성 가능한 리뷰 / 내가 작성한 리뷰 (초기 포커스: 작성 가능한 리뷰)
  const [reviewTab, setReviewTab] = useState('writable');

  // 페이지네이션 상태
  const [writablePage, setWritablePage] = useState(0);
  const [writtenPage, setWrittenPage] = useState(0);
  const pageSize = 3; // 페이지당 3개 항목

  // 데이터 상태
  const [writableReviews, setWritableReviews] = useState([]);
  const [writableReviewsLoading, setWritableReviewsLoading] = useState(false);
  const [writtenReviews, setWrittenReviews] = useState([]);
  const [writtenReviewsLoading, setWrittenReviewsLoading] = useState(false);
  const [completedReservations, setCompletedReservations] = useState([]);
  const [completedLoading, setCompletedLoading] = useState(false);
  const [writtenReservationIdSet, setWrittenReservationIdSet] = useState(new Set());
  
  // 삭제 모달 상태
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [reviewToDelete, setReviewToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // 삭제 버튼 클릭 핸들러
  const handleDeleteClick = (review) => {
    setReviewToDelete(review);
    setDeleteModalOpen(true);
  };

  // 삭제 모달 닫기
  const handleCloseDeleteModal = () => {
    if (!isDeleting) {
      setDeleteModalOpen(false);
      setReviewToDelete(null);
    }
  };

  // 리뷰 삭제 실행
  const handleConfirmDelete = async () => {
    if (!reviewToDelete || isDeleting) return;
    
    setIsDeleting(true);
    try {
      await mypageAPI.deleteReview(reviewToDelete.reviewIdx);
      // 리뷰 목록에서 제거
      setWrittenReviews(prev => prev.filter(r => r.reviewIdx !== reviewToDelete.reviewIdx));
      // 작성한 리뷰 ID Set 업데이트
      setWrittenReservationIdSet(prev => {
        const newSet = new Set(prev);
        newSet.delete(reviewToDelete.reservationIdx);
        return newSet;
      });
      setDeleteModalOpen(false);
      setReviewToDelete(null);
    } catch (error) {
      console.error('리뷰 삭제 실패:', error);
      alert('리뷰 삭제에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsDeleting(false);
    }
  };

  // 초기 로드
  useEffect(() => {
    loadWritableReviews();
    loadWrittenReviews();
    loadCompletedReservations();
  }, []);

  // Body 스크롤 락 (모달 열릴 때 스크롤바 숨김)
  useEffect(() => {
    if (!deleteModalOpen) return;
    const originalOverflow = document.body.style.overflow;
    const originalPaddingRight = document.body.style.paddingRight;
    const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = 'hidden';
    if (scrollBarWidth > 0) {
      document.body.style.paddingRight = `${scrollBarWidth}px`;
    }
    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.paddingRight = originalPaddingRight;
    };
  }, [deleteModalOpen]);

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
    const reservationId = reservation.id || reservation.reservIdx || reservation.reservationNumber || reservation.reservationIdx;
    router.push(`/mypage/review/write?reservationId=${reservationId}`);
  };

  // 이용완료 예약 불러오기 (전체 데이터 가져오기)
  const loadCompletedReservations = async () => {
    setCompletedLoading(true);
    try {
      // 모든 페이지를 가져오기 위해 큰 size 값 사용
      // 또는 페이지네이션을 통해 모든 페이지를 순회
      let allReservations = [];
      let currentPage = 0;
      let hasMore = true;
      const pageSize = 50; // 한 번에 많이 가져오기
      
      while (hasMore) {
        const response = await mypageAPI.getReservations('completed', currentPage, pageSize);
        const reservations = response?.reservations || response?.content || [];
        allReservations = [...allReservations, ...reservations];
        
        // 페이지네이션 정보 확인
        if (response?.totalPages !== undefined) {
          // 백엔드가 Page 객체를 반환하는 경우
          hasMore = currentPage < response.totalPages - 1;
          currentPage++;
        } else {
          // 백엔드가 전체 리스트를 반환하는 경우
          hasMore = reservations.length === pageSize;
          currentPage++;
        }
      }
      
      setCompletedReservations(allReservations);
      console.log(`✅ 이용완료 예약 전체 로드: ${allReservations.length}개`);
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

  // 탭 변경 핸들러 (페이지 리셋)
  const handleTabChange = (tab) => {
    setReviewTab(tab);
    if (tab === 'writable') {
      setWritablePage(0);
    } else {
      setWrittenPage(0);
    }
  };

  // 작성 가능한 리뷰 목록 필터링 및 페이지네이션 계산
  const getWritableReservations = () => {
    return completedReservations.filter(r => {
      const id = r.reservIdx || r.id || r.reservationNumber;
      return !writtenReservationIdSet.has(id);
    });
  };

  const writableReservations = getWritableReservations();
  const writableTotalPages = Math.ceil(writableReservations.length / pageSize);
  const paginatedWritableReservations = writableReservations.slice(
    writablePage * pageSize,
    (writablePage + 1) * pageSize
  );

  // 작성한 리뷰 페이지네이션 계산
  const writtenTotalPages = Math.ceil(writtenReviews.length / pageSize);
  const paginatedWrittenReviews = writtenReviews.slice(
    writtenPage * pageSize,
    (writtenPage + 1) * pageSize
  );

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
        {/* <div className="bg-white border border-gray-200 rounded-xl p-3 mb-4">
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
        </div> */}

        {/* 탭 */}
        <div className="bg-white border border-gray-200 rounded-xl p-0 mb-4">
          <div className="flex gap-6 px-4">
            <button
              onClick={() => handleTabChange('writable')}
              className={`relative -mb-px px-0 py-3 text-sm font-medium border-b-2 ${
                reviewTab === 'writable' ? 'text-blue-600 border-blue-600' : 'text-gray-500 border-transparent hover:text-gray-700'
              }`}
            >
              작성 가능한 리뷰 ({writableReservations.length})
            </button>
            <button
              onClick={() => handleTabChange('written')}
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
          <>
            <div className="space-y-3 mb-6">
              {completedLoading ? (
                <div className="flex justify-center items-center py-8">
                  <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : paginatedWritableReservations.length === 0 ? (
                <div className="bg-white border border-gray-200 rounded-2xl p-10 text-center">
                  <div className="w-10 h-10 mx-auto mb-3 rounded-full bg-gray-100 flex items-center justify-center">
                    <span className="text-gray-400 text-xl">!</span>
                  </div>
                  <p className="text-gray-700 font-medium mb-1">작성 가능한 리뷰가 없습니다.</p>
                  <p className="text-gray-500 text-sm mb-4">이용 완료한 예약에 대해 리뷰를 작성해보세요.</p>
                  <button
                    onClick={() => router.push('/mypage?tab=completed')}
                    className="px-4 py-2 rounded-full border border-gray-300 text-gray-700 hover:bg-gray-50 text-sm"
                  >
                    예약 내역 보기
                  </button>
                </div>
              ) : (
                paginatedWritableReservations.map((r) => (
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
                          {/* <button className="p-1.5 rounded hover:bg-gray-50">
                            <ChevronRight className="w-4 h-4 text-gray-400" />
                          </button> */}
                        </div>
                    <div className="flex items-center gap-1 text-xs text-gray-500 mb-0.5">
                      <MapPin className="w-3 h-3" />
                      <span>{getRegion(r.adress, r.location)}</span>
                    </div>

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
                        onClick={() => handleWriteReview(r)}
                        className="flex-1 h-10 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm"
                      >
                        리뷰 쓰기
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
            {/* 작성 가능한 리뷰 페이지네이션 */}
            {!completedLoading && writableTotalPages > 0 && (
              <Pagination
                currentPage={writablePage}
                totalPages={writableTotalPages}
                totalElements={writableReservations.length}
                pageSize={pageSize}
                onPageChange={setWritablePage}
              />
            )}
          </>
        )}

        {reviewTab === 'written' && (
          <>
            {writtenReviewsLoading ? (
              <div className="flex justify-center items-center py-16">
                <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : paginatedWrittenReviews.length === 0 ? (
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
              <>
                <div className="space-y-3 mb-6">
                  {paginatedWrittenReviews.map((review) => (
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
                              <button
                                onClick={() => handleDeleteClick(review)}
                                className="p-1.5 rounded hover:bg-gray-50"
                                aria-label="리뷰 삭제"
                              >
                                <Trash2 className="w-4 h-4 text-gray-500" />
                              </button>
                              {/* <ChevronRight className="w-4 h-4 text-gray-400" /> */}
                            </div>
                          </div>
                          {/* 지역 */}
                          {(review.region || review.hotelInfo?.adress || review.location) && (
                            <div className="flex items-center gap-1 text-xs text-gray-500 mb-0.5">
                              <MapPin className="w-3 h-3" />
                              <span>{review.region || getRegion(review.hotelInfo?.adress, review.location)}</span>
                            </div>
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
                {/* 작성한 리뷰 페이지네이션 */}
                {writtenTotalPages > 1 && (
                  <Pagination
                    currentPage={writtenPage}
                    totalPages={writtenTotalPages}
                    totalElements={writtenReviews.length}
                    pageSize={pageSize}
                    onPageChange={setWrittenPage}
                  />
                )}
              </>
            )}
          </>
        )}
      </div>

      {/* 삭제 확인 모달 */}
      {deleteModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)' }}
        >
            <div 
              className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                리뷰 삭제
              </h3>
              <p className="text-gray-700 mb-6">
                정말로 이 리뷰를 삭제하시겠습니까?<br />
                삭제된 리뷰는 복구할 수 없습니다.
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={handleCloseDeleteModal}
                  disabled={isDeleting}
                  className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  취소
                </button>
                <button
                  onClick={handleConfirmDelete}
                  disabled={isDeleting}
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isDeleting ? '삭제 중...' : '삭제'}
                </button>
              </div>
            </div>
        </div>
      )}

      <Footer />
    </div>
  );
}


