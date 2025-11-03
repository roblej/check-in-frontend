'use client';

import { useState, useEffect, useRef } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Star, CheckCircle } from 'lucide-react';
import axiosInstance from '@/lib/axios';

const CustomerFeedbackPage = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [filteredFeedbacks, setFilteredFeedbacks] = useState([]);
  const [stats, setStats] = useState({
    totalFeedback: 0,
    inProgressFeedback: 0,
    resolvedFeedback: 0
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showAnswerInput, setShowAnswerInput] = useState({});
  const [answerContents, setAnswerContents] = useState({});
  const [isSubmitting, setIsSubmitting] = useState({});

  const didFetch = useRef(false);

  useEffect(() => {
    if (didFetch.current) return;
    didFetch.current = true;
    
    fetchFeedbacks();
    fetchFeedbackStats();
  }, []);

  const fetchFeedbacks = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/admin/feedback');
      if (response.data.success) {
        setFeedbacks(response.data.feedbacks || []);
        setFilteredFeedbacks(response.data.feedbacks || []);
      }
    } catch (error) {
      console.error('피드백 목록 조회 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFeedbackStats = async () => {
    try {
      const response = await axiosInstance.get('/admin/feedbackStats');
      if (response.data) {
        setStats({
          totalFeedback: response.data.totalFeedback || 0,
          inProgressFeedback: response.data.inProgressFeedback || 0,
          resolvedFeedback: response.data.resolvedFeedback || 0
        });
      }
    } catch (error) {
      console.error('피드백 통계 조회 오류:', error);
    }
  };

  useEffect(() => {
    let filtered = feedbacks;

    // 검색어 필터링
    if (searchTerm.trim()) {
      filtered = filtered.filter(feedback =>
        (feedback.customerName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (feedback.customerId || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (feedback.reservIdx || '').toString().includes(searchTerm) ||
        (feedback.content || '').toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // 상태 필터링
    if (statusFilter !== 'all') {
      filtered = filtered.filter(feedback => feedback.status === statusFilter);
    }

    // 카테고리 필터링
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(feedback => feedback.category === categoryFilter);
    }

    setFilteredFeedbacks(filtered);
  }, [feedbacks, searchTerm, statusFilter, categoryFilter]);

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    } catch (error) {
      return dateString;
    }
  };

  const getRatingValue = (star) => {
    if (!star) return 0;
    const rating = typeof star === 'number' ? star : Number(star);
    return Math.round(rating);
  };

  const handleAnswerClick = (reviewIdx, reviewAnswerIdx, currentContent) => {
    const isEditMode = !!reviewAnswerIdx;
    const key = reviewIdx;
    
    if (showAnswerInput[key]) {
      // 입력창이 이미 표시되어 있는 경우
      const content = answerContents[key] || '';
      
      if (content.trim()) {
        // 내용이 있으면 저장
        if (isEditMode) {
          updateReviewAnswer(reviewAnswerIdx, content, reviewIdx);
        } else {
          createReviewAnswer(reviewIdx, content);
        }
      }
      // 내용이 없으면 입력창 유지
    } else {
      // 입력창 표시
      setShowAnswerInput(prev => ({ ...prev, [key]: true }));
      if (isEditMode && currentContent) {
        setAnswerContents(prev => ({ ...prev, [key]: currentContent }));
      }
    }
  };

  const createReviewAnswer = async (reviewIdx, content) => {
    try {
      setIsSubmitting(prev => ({ ...prev, [reviewIdx]: true }));
      const response = await axiosInstance.post(`/admin/feedback/${reviewIdx}/answer`, {
        content: content.trim()
      });
      
      if (response.data.success) {
        // 목록 새로고침
        await fetchFeedbacks();
        setShowAnswerInput(prev => {
          const newState = { ...prev };
          delete newState[reviewIdx];
          return newState;
        });
        setAnswerContents(prev => {
          const newState = { ...prev };
          delete newState[reviewIdx];
          return newState;
        });
      }
    } catch (error) {
      console.error('답변 작성 오류:', error);
      alert(error.response?.data?.message || '답변 작성 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(prev => ({ ...prev, [reviewIdx]: false }));
    }
  };

  const updateReviewAnswer = async (reviewAnswerIdx, content, reviewIdx) => {
    try {
      setIsSubmitting(prev => ({ ...prev, [reviewAnswerIdx]: true }));
      const response = await axiosInstance.put(`/admin/feedback/answer/${reviewAnswerIdx}`, {
        content: content.trim()
      });
      
      if (response.data.success) {
        // 목록 새로고침
        await fetchFeedbacks();
        if (reviewIdx) {
          setShowAnswerInput(prev => {
            const newState = { ...prev };
            delete newState[reviewIdx];
            return newState;
          });
          setAnswerContents(prev => {
            const newState = { ...prev };
            delete newState[reviewIdx];
            return newState;
          });
        }
      }
    } catch (error) {
      console.error('답변 수정 오류:', error);
      alert(error.response?.data?.message || '답변 수정 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(prev => ({ ...prev, [reviewAnswerIdx]: false }));
    }
  };

  const handleCancelAnswer = (reviewIdx) => {
    setShowAnswerInput(prev => {
      const newState = { ...prev };
      delete newState[reviewIdx];
      return newState;
    });
    setAnswerContents(prev => {
      const newState = { ...prev };
      delete newState[reviewIdx];
      return newState;
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'new':
        return 'bg-blue-100 text-blue-800';
      case 'in-progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      case 'urgent':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'new':
        return '신규';
      case 'in-progress':
        return '처리중';
      case 'resolved':
        return '해결됨';
      case 'urgent':
        return '긴급';
      default:
        return '알 수 없음';
    }
  };

  const getCategoryText = (category) => {
    switch (category) {
      case 'service':
        return '서비스';
      case 'facility':
        return '시설';
      case 'room':
        return '객실';
      case 'cleaning':
        return '청소';
      default:
        return '기타';
    }
  };

  const getRatingStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star 
        key={i} 
        className={`w-4 h-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
      />
    ));
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* 페이지 헤더 */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900">고객 피드백</h2>
          <p className="text-gray-600">고객들의 피드백을 확인하고 응답하세요</p>
        </div>

        {/* 피드백 통계 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="text-3xl mr-4">💬</div>
              <div>
                <p className="text-sm font-medium text-gray-600">총 피드백</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalFeedback}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="text-3xl mr-4">🟡</div>
              <div>
                <p className="text-sm font-medium text-gray-600">처리중</p>
                <p className="text-2xl font-bold text-gray-900">{stats.inProgressFeedback}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="text-green-600 mr-4"><CheckCircle size={32} /></div>
              <div>
                <p className="text-sm font-medium text-gray-600">해결됨</p>
                <p className="text-2xl font-bold text-gray-900">{stats.resolvedFeedback}</p>
              </div>
            </div>
          </div>
        </div>

        {/* 검색 및 필터 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                피드백 검색
              </label>
              <input
                type="text"
                placeholder="고객명, 예약번호, 피드백 내용으로 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent"
              />
            </div>
            
            <div className="sm:w-48">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                상태 필터
              </label>
              <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent"
              >
                <option value="all">전체</option>
                <option value="new">신규</option>
                <option value="in-progress">처리중</option>
                <option value="resolved">해결됨</option>
              </select>
            </div>
            
            <div className="sm:w-48">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                카테고리
              </label>
              <select 
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent"
              >
                <option value="all">전체</option>
                <option value="service">서비스</option>
                <option value="facility">시설</option>
                <option value="room">객실</option>
                <option value="cleaning">청소</option>
              </select>
            </div>
          </div>
        </div>

        {/* 피드백 목록 */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">데이터를 불러오는 중...</p>
            </div>
          </div>
        ) : filteredFeedbacks.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <p className="text-gray-500 text-lg">피드백이 없습니다.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredFeedbacks.map((feedback) => {
              const rating = getRatingValue(feedback.star);
              return (
                <div key={feedback.reviewIdx} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{feedback.customerName || '익명'}</h3>
                        <span className="text-sm text-gray-500">예약: #{feedback.reservIdx}</span>
                        {feedback.roomNumber && (
                          <span className="text-sm text-gray-500">객실: {feedback.roomNumber}호</span>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-4 mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-600">평점:</span>
                          <span className="text-sm display-flex">{getRatingStars(rating)}</span>
                        </div>
                        <span className="text-sm text-gray-500">카테고리: {getCategoryText(feedback.category)}</span>
                        <span className="text-sm text-gray-500">작성일: {formatDate(feedback.createdAt)}</span>
                      </div>
                    </div>
                    
                    <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(feedback.status)}`}>
                      {getStatusText(feedback.status)}
                    </span>
                  </div>
                  
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">피드백 내용</h4>
                    <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                      {feedback.content || '내용이 없습니다.'}
                    </p>
                  </div>
                  
                  {/* 답변 입력창 */}
                  {showAnswerInput[feedback.reviewIdx] && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">
                        {feedback.response ? '답변 수정' : '답변 작성'}
                      </h4>
                      <textarea
                        value={answerContents[feedback.reviewIdx] || ''}
                        onChange={(e) => setAnswerContents(prev => ({
                          ...prev,
                          [feedback.reviewIdx]: e.target.value
                        }))}
                        placeholder="답변을 입력해주세요..."
                        rows={4}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      />
                    </div>
                  )}
                  
                  {feedback.response && !showAnswerInput[feedback.reviewIdx] && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">관리자 응답</h4>
                      <p className="text-sm text-gray-700 bg-blue-50 p-3 rounded-lg">
                        {feedback.response}
                      </p>
                    </div>
                  )}
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAnswerClick(feedback.reviewIdx, feedback.reviewAnswerIdx, feedback.response)}
                      disabled={isSubmitting[feedback.reviewIdx] || isSubmitting[feedback.reviewAnswerIdx]}
                      className={`px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                        feedback.response 
                          ? 'bg-yellow-600 text-white hover:bg-yellow-700' 
                          : 'bg-[#3B82F6] text-white hover:bg-blue-600'
                      }`}
                    >
                      {isSubmitting[feedback.reviewIdx] || isSubmitting[feedback.reviewAnswerIdx] 
                        ? '처리 중...' 
                        : showAnswerInput[feedback.reviewIdx]
                          ? '답변하기'
                          : feedback.response 
                            ? '답변 수정' 
                            : '응답하기'
                      }
                    </button>
                    {showAnswerInput[feedback.reviewIdx] && (
                      <button
                        onClick={() => handleCancelAnswer(feedback.reviewIdx)}
                        className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        취소
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default CustomerFeedbackPage;
