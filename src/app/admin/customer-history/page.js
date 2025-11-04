'use client';

import { useState, useEffect, useRef, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import AdminLayout from '@/components/admin/AdminLayout';
import { Star, User, Calendar, Building2, DollarSign, Filter, Search } from 'lucide-react';
import axiosInstance from '@/lib/axios';

const CustomerHistoryContent = () => {
  const searchParams = useSearchParams();
  const [history, setHistory] = useState([]);
  const [filteredHistory, setFilteredHistory] = useState([]);
  const [stats, setStats] = useState({
    averageRating: 0,
    feedbackCount: 0,
    totalHistoryCount: 0
  });
  const [loading, setLoading] = useState(true);
  
  // 필터 상태 - 초기값을 쿼리 파라미터에서 가져오기
  const [customerIdSearch, setCustomerIdSearch] = useState(() => {
    return searchParams.get('customerId') || '';
  });
  const [statusFilter, setStatusFilter] = useState('all');
  const [ratingFilter, setRatingFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(() => {
    return !!searchParams.get('customerId');
  });

  const didFetchStats = useRef(false);
  const hasInitialLoad = useRef(false);

  const fetchCustomerHistory = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      if (customerIdSearch.trim()) {
        params.append('customerId', customerIdSearch.trim());
      }
      
      if (statusFilter !== 'all') {
        params.append('status', statusFilter);
      }
      
      if (ratingFilter !== 'all') {
        params.append('rating', ratingFilter);
      }

      const response = await axiosInstance.get(`/admin/customerHistory?${params.toString()}`);
      if (response.data.success) {
        setHistory(response.data.history || []);
        setFilteredHistory(response.data.history || []);
      }
    } catch (error) {
      console.error('고객 이용 이력 조회 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    fetchCustomerHistory();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const fetchCustomerHistoryStats = useCallback(async () => {
    try {
      if (didFetchStats.current) return;
      didFetchStats.current = true;
      
      const response = await axiosInstance.get('/admin/customerHistoryStats');
      if (response.data) {
        console.log(response.data);
        setStats({
          averageRating: response.data.averageRating || 0,
          feedbackCount: response.data.feedbackCount || 0,
          totalHistoryCount: response.data.totalHistoryCount || 0
        });
      }
    } catch (error) {
      console.error('고객 이용 이력 통계 조회 오류:', error);
    }
  }, []);

  // 초기 로드 시 쿼리 파라미터가 있으면 검색, 없으면 전체 조회
  useEffect(() => {
    if (!hasInitialLoad.current) {
      hasInitialLoad.current = true;
      const initialCustomerId = searchParams.get('customerId');
      if (initialCustomerId) {
        // 쿼리 파라미터가 있으면 초기 검색 실행
        fetchCustomerHistory();
      } else {
        // 쿼리 파라미터가 없으면 전체 데이터 조회
        fetchCustomerHistory();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchCustomerHistoryStats();
  }, [fetchCustomerHistoryStats]);

  const formatCurrency = (value) => {
    if (!value) return '₩0';
    return `₩${Number(value).toLocaleString()}`;
  };

  const formatDate = (date) => {
    if (!date) return '-';
    const d = new Date(date);
    const year = d.getFullYear();
    const month = d.getMonth() + 1;
    const day = d.getDate();
    return `${year}년 ${month}월 ${day}일`;
  };

  const formatDateShort = (date) => {
    if (!date) return '-';
    const d = new Date(date);
    const year = d.getFullYear();
    const month = d.getMonth() + 1;
    return `${year}년 ${month}월`;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 4:
        return 'bg-green-100 text-green-800';
      case 2:
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 4:
        return '완료';
      case 2:
        return '취소';
      default:
        return '알 수 없음';
    }
  };

  const getRatingText = (rating) => {
    if (!rating) return '';
    const num = Number(rating);
    if (num >= 5) return '매우 좋아요';
    if (num >= 3) return '좋아요';
    if (num >= 1) return '아쉬워요';
    return '싫어요';
  };

  const getRatingStars = (rating) => {
    if (!rating) return null;
    const ratingNum = typeof rating === 'number' ? rating : Number(rating);
    return Array.from({ length: 5 }, (_, i) => (
      <Star 
        key={i} 
        className={`w-5 h-5 ${i < ratingNum ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
      />
    ));
  };

  const calculateNights = (checkin, checkout) => {
    if (!checkin || !checkout) return 0;
    const checkinDate = new Date(checkin);
    const checkoutDate = new Date(checkout);
    const diffTime = Math.abs(checkoutDate - checkinDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getTimeAgo = (date) => {
    if (!date) return '';
    const reviewDate = new Date(date);
    const now = new Date();
    const diffTime = Math.abs(now - reviewDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 1) return '오늘';
    if (diffDays < 30) return `${diffDays}일 전`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)}개월 전`;
    return `${Math.floor(diffDays / 365)}년 전`;
  };

  if (loading && history.length === 0) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">데이터를 불러오는 중...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6 pb-8">
        {/* 페이지 헤더 */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">고객 이용 이력</h2>
            <p className="text-gray-600 mt-1">고객들의 숙박 이력과 피드백을 확인하세요</p>
          </div>
        </div>

        {/* 전체 평점 및 통계 헤더 (모바일 스타일) */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Star className="w-8 h-8 text-yellow-400 fill-current" />
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold text-gray-900">
                      평균: {stats.averageRating ? Number(stats.averageRating).toFixed(1) : '0.0'}
                    </span>
                    <span className="text-xl font-semibold text-gray-700">
                      {stats.averageRating ? getRatingText(Number(stats.averageRating)) : ''}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    {stats.totalHistoryCount.toLocaleString()}명의 이용이력 • {stats.feedbackCount.toLocaleString()}개의 리뷰 작성
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Filter className="w-4 h-4" />
                <span className="text-sm font-medium">필터</span>
              </button>
            </div>
          </div>
        </div>

        {/* 필터 섹션 (접기/펼치기) */}
        {showFilters && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Search className="w-4 h-4 inline mr-1" />
                    고객 ID 검색
                  </label>
                  <input
                    type="text"
                    placeholder="고객 ID로 검색..."
                    value={customerIdSearch}
                    onChange={(e) => setCustomerIdSearch(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div className="sm:w-48">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    상태 필터
                  </label>
                  <select 
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">전체</option>
                    <option value="4">완료</option>
                    <option value="2">취소</option>
                  </select>
                </div>
                
                <div className="sm:w-48">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    평점 필터
                  </label>
                  <select 
                    value={ratingFilter}
                    onChange={(e) => setRatingFilter(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">전체</option>
                    <option value="5">5점</option>
                    <option value="4">4점</option>
                    <option value="3">3점</option>
                    <option value="2">2점</option>
                    <option value="1">1점</option>
                  </select>
                </div>
              </div>
              
              {/* 검색 버튼 */}
              <div className="flex justify-end">
                <button
                  onClick={handleSearch}
                  disabled={loading}
                  className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Search className="w-4 h-4" />
                  <span className="font-medium">검색</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 리뷰 카드 목록 */}
        <div className="space-y-6">
          {filteredHistory.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
              <p className="text-gray-500 text-lg">
                {loading ? '데이터를 불러오는 중...' : '이용 이력이 없습니다.'}
              </p>
            </div>
          ) : (
            filteredHistory.map((item) => {
              const ratingNum = item.star ? Number(item.star) : null;
              const nights = calculateNights(item.checkinDate, item.checkoutDate);
              
              return (
                <div 
                  key={item.reservIdx} 
                  className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
                >
                  {/* 리뷰 카드 헤더 (평점 영역) */}
                  {item.star && (
                    <div className="bg-gradient-to-r from-yellow-50 to-orange-50 px-6 py-4 border-b border-gray-200">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <span className="text-3xl font-bold text-gray-900">{ratingNum.toFixed(1)}</span>
                          <span className="text-lg font-semibold text-gray-700">{getRatingText(ratingNum)}</span>
                        </div>
                        <div className="flex items-center gap-1 ml-auto">
                          {getRatingStars(item.star)}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="p-6">
                    <div className="flex flex-col lg:flex-row gap-6">
                      {/* 왼쪽: 리뷰어 및 예약 정보 */}
                      <div className="lg:w-64 flex-shrink-0">
                        {/* 리뷰어 프로필 */}
                        <div className="flex items-start gap-4 mb-4">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold text-lg flex-shrink-0">
                            {item.customerName ? item.customerName.charAt(0) : '?'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-gray-900 truncate">{item.customerName || '익명'}</div>
                            <div className="text-sm text-gray-500 truncate">ID: {item.customerId || '-'}</div>
                            {item.reviewCreatedAt && (
                              <div className="text-xs text-gray-400 mt-1">
                                {getTimeAgo(item.reviewCreatedAt)}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* 예약 정보 블록 */}
                        <div className="bg-gray-50 rounded-lg p-4 space-y-3 border border-gray-200">
                          <div className="flex items-start gap-2 text-sm">
                            <Building2 className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                            <div className="flex-1">
                              <div className="text-gray-500">객실</div>
                              <div className="font-medium text-gray-900">{item.roomName || '-'}</div>
                            </div>
                          </div>
                          
                          <div className="flex items-start gap-2 text-sm">
                            <Calendar className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                            <div className="flex-1">
                              <div className="text-gray-500">숙박일정</div>
                              <div className="font-medium text-gray-900">
                                {formatDateShort(item.checkinDate)} | {nights}박
                              </div>
                              <div className="text-xs text-gray-500 mt-0.5">
                                {formatDate(item.checkinDate)} ~ {formatDate(item.checkoutDate)}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-start gap-2 text-sm">
                            <DollarSign className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                            <div className="flex-1">
                              <div className="text-gray-500">예약금액</div>
                              <div className="font-medium text-gray-900">{formatCurrency(item.totalPrice)}</div>
                            </div>
                          </div>

                          <div className="pt-2 border-t border-gray-200">
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-gray-500">예약번호</span>
                              <span className="text-xs font-medium text-gray-900">#{item.reservIdx}</span>
                            </div>
                            <div className="mt-2">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(item.status)}`}>
                                {getStatusText(item.status)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* 오른쪽: 리뷰 내용 */}
                      <div className="flex-1 min-w-0">
                        {item.reviewContent ? (
                          <div className="space-y-4">
                            <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
                              <div className="text-sm leading-relaxed text-gray-700 whitespace-pre-wrap">
                                {item.reviewContent}
                              </div>
                            </div>
                            {item.reviewCreatedAt && (
                              <div className="text-xs text-gray-500">
                                작성일: {formatDate(item.reviewCreatedAt)}
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="bg-gray-50 rounded-lg p-8 border border-gray-200 border-dashed text-center">
                            <div className="text-gray-400">
                              <Star className="w-12 h-12 mx-auto mb-2 opacity-30" />
                              <p className="text-sm">아직 작성된 리뷰가 없습니다.</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* 결과 개수 표시 */}
        {filteredHistory.length > 0 && (
          <div className="text-center text-sm text-gray-500">
            총 {filteredHistory.length}개의 이용 이력이 있습니다.
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

const CustomerHistoryPage = () => {
  return (
    <Suspense fallback={
      <AdminLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">로딩 중...</p>
          </div>
        </div>
      </AdminLayout>
    }>
      <CustomerHistoryContent />
    </Suspense>
  );
};

export default CustomerHistoryPage;
