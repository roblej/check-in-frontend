'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { MessageSquare, Clock, CheckCircle, AlertCircle, X, User } from 'lucide-react';
import axiosInstance from '@/lib/axios';

export default function CustomerInquiriesPage() {
  const [inquiries, setInquiries] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  
  // 실제 필터링에 사용되는 상태 (검색 버튼 클릭시 업데이트)
  const [activeSearchTerm, setActiveSearchTerm] = useState('');
  const [activeStatusFilter, setActiveStatusFilter] = useState('all');
  const [activeCategoryFilter, setActiveCategoryFilter] = useState('all');
  
  // 모달 상태
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInquiries();
  }, []);

  const fetchInquiries = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.post('/center/posts/search', {
        mainCategory: '문의',
        page: 0,
        size: 1000,
      });
      
      if (response.data && response.data.content) {
        // 관리자가 소유한 호텔의 문의만 표시 (백엔드에서 필터링됨)
        const convertedInquiries = response.data.content
          .map(item => ({
            id: item.centerIdx,
            customerIdx: item.customerIdx,
            title: item.title,
            content: item.content,
            status: item.status === 0 ? 'pending' : item.status === 1 ? 'in_progress' : 'completed',
            category: item.subCategory || '기타',
            createdAt: item.createdAt ? new Date(item.createdAt).toLocaleString('ko-KR') : '',
            updatedAt: item.updatedAt ? new Date(item.updatedAt).toLocaleString('ko-KR') : null,
          }));
        setInquiries(convertedInquiries);
      }
    } catch (error) {
      console.error('문의 조회 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'completed':
        return '답변 완료';
      case 'in_progress':
        return '처리중';
      case 'pending':
        return '대기중';
      default:
        return '알 수 없음';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'in_progress':
        return <Clock className="w-4 h-4" />;
      case 'pending':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <MessageSquare className="w-4 h-4" />;
    }
  };

  const filteredInquiries = inquiries.filter(inquiry => {
    const matchesSearch = inquiry.title.toLowerCase().includes(activeSearchTerm.toLowerCase()) ||
                         inquiry.content.toLowerCase().includes(activeSearchTerm.toLowerCase());
    const matchesStatus = activeStatusFilter === 'all' || inquiry.status === activeStatusFilter;
    const matchesCategory = activeCategoryFilter === 'all' || inquiry.category === activeCategoryFilter;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  // 검색 버튼 클릭 핸들러
  const handleSearch = () => {
    setActiveSearchTerm(searchTerm);
    setActiveStatusFilter(statusFilter);
    setActiveCategoryFilter(categoryFilter);
  };

  // 필터 초기화 핸들러
  const handleResetFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setCategoryFilter('all');
    setActiveSearchTerm('');
    setActiveStatusFilter('all');
    setActiveCategoryFilter('all');
  };

  // 모달 열기
  const handleViewInquiry = (inquiryId) => {
    const inquiry = inquiries.find(i => i.id === inquiryId);
    setSelectedInquiry(inquiry);
    setIsModalOpen(true);
    setReplyText('');
  };

  // 모달 닫기
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedInquiry(null);
    setReplyText('');
  };

  // 답변 전송
  const handleSendReply = async () => {
    if (!replyText.trim()) {
      alert('답변 내용을 입력해주세요.');
      return;
    }
    
    if (!selectedInquiry) {
      alert('문의 정보를 찾을 수 없습니다.');
      return;
    }
    
    try {
      const response = await axiosInstance.post(`/center/${selectedInquiry.id}/answer`, {
        content: replyText.trim()
      });
      
      if (response.data.success) {
        alert('답변이 성공적으로 전송되었습니다.');
        await fetchInquiries();
        handleCloseModal();
      } else {
        alert(response.data.message || '답변 전송에 실패했습니다.');
      }
    } catch (error) {
      console.error('답변 전송 오류:', error);
      alert(error.response?.data?.message || '답변 전송 중 오류가 발생했습니다.');
    }
  };

  // 통계 계산
  const totalInquiries = inquiries.length;
  const completedInquiries = inquiries.filter(i => i.status === 'completed').length;
  const pendingInquiries = inquiries.filter(i => i.status === 'pending').length;
  const inProgressInquiries = inquiries.filter(i => i.status === 'in_progress').length;

  if (loading) {
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
      <div className="space-y-6">
        {/* 페이지 헤더 */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">고객 문의사항</h2>
            <p className="text-gray-600">고객들의 문의를 관리하고 답변하세요</p>
          </div>
        </div>

        {/* 통계 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-gray-900">{totalInquiries}</div>
                <div className="text-sm text-gray-600">전체 문의</div>
              </div>
              <MessageSquare className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-green-600">{completedInquiries}</div>
                <div className="text-sm text-gray-600">답변 완료</div>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-blue-600">{inProgressInquiries}</div>
                <div className="text-sm text-gray-600">처리중</div>
              </div>
              <Clock className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-yellow-600">{pendingInquiries}</div>
                <div className="text-sm text-gray-600">대기중</div>
              </div>
              <AlertCircle className="w-8 h-8 text-yellow-600" />
            </div>
          </div>
        </div>

        {/* 검색 및 필터 */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <input
                  type="text"
                  placeholder="제목, 내용으로 검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">모든 카테고리</option>
                  <option value="예약/취소">예약/취소</option>
                  <option value="회원정보">회원정보</option>
                  <option value="결제">결제</option>
                  <option value="기술지원">기술지원</option>
                  <option value="호텔정보">호텔정보</option>
                  <option value="기타">기타</option>
                </select>
              </div>
              <div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">모든 상태</option>
                  <option value="pending">대기중</option>
                  <option value="in_progress">처리중</option>
                  <option value="completed">답변 완료</option>
                </select>
              </div>
            </div>
            
            {/* 검색 버튼 영역 */}
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-600">
                {activeSearchTerm || activeCategoryFilter !== 'all' || activeStatusFilter !== 'all' ? (
                  <span>
                    검색 조건:
                    {activeSearchTerm && <span className="ml-1 px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">&quot;{activeSearchTerm}&quot;</span>}
                    {activeCategoryFilter !== 'all' && <span className="ml-1 px-2 py-1 bg-green-100 text-green-800 rounded text-xs">카테고리: {activeCategoryFilter}</span>}
                    {activeStatusFilter !== 'all' && <span className="ml-1 px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs">상태: {getStatusText(activeStatusFilter)}</span>}
                  </span>
                ) : (
                  <span>전체 문의를 표시하고 있습니다.</span>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleSearch}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  검색
                </button>
                <button
                  onClick={handleResetFilters}
                  className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                >
                  초기화
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 문의 목록 테이블 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    문의 정보
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    고객 ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    분류
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    상태
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    작성일시
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    액션
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredInquiries.map((inquiry) => (
                  <tr key={inquiry.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{inquiry.title}</div>
                        <div className="text-sm text-gray-500 truncate max-w-xs">{inquiry.content}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-900">고객 {inquiry.customerIdx || '-'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-900">{inquiry.category}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        {getStatusIcon(inquiry.status)}
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(inquiry.status)}`}>
                          {getStatusText(inquiry.status)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{inquiry.createdAt}</div>
                    </td>
                    <td className="px-6 py-4">
                      <button 
                        onClick={() => handleViewInquiry(inquiry.id)}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        상세보기
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredInquiries.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-gray-400 text-center">
                      조건에 맞는 문의가 없습니다.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* 상세보기 모달 */}
        {isModalOpen && selectedInquiry && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
              {/* 모달 헤더 */}
              <div className="flex justify-between items-center p-6 border-b border-gray-200">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{selectedInquiry.title}</h3>
                  <p className="text-sm text-gray-600 flex items-center gap-2 mt-1">
                    <User className="w-4 h-4" />
                    고객 {selectedInquiry.customerIdx}
                  </p>
                </div>
                <button
                  onClick={handleCloseModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* 모달 내용 */}
              <div className="p-6 overflow-y-auto flex-1">
                <div className="space-y-6">
                  {/* 문의 정보 */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center gap-4 mb-3">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedInquiry.status)}`}>
                        {getStatusText(selectedInquiry.status)}
                      </span>
                      <span className="text-xs text-gray-500">{selectedInquiry.category}</span>
                    </div>
                    <div className="text-sm text-gray-700 whitespace-pre-wrap">
                      {selectedInquiry.content}
                    </div>
                    <div className="text-xs text-gray-500 mt-2">
                      작성일: {selectedInquiry.createdAt}
                    </div>
                  </div>

                  {/* 답변 입력 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      답변 작성
                    </label>
                    <textarea
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="문의에 대한 답변을 작성해주세요..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      rows={6}
                    />
                  </div>
                </div>
              </div>

              {/* 모달 푸터 */}
              <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
                <button
                  onClick={handleCloseModal}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  취소
                </button>
                <button
                  onClick={handleSendReply}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  답변 전송
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

