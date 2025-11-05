'use client';

import { useState, useEffect } from 'react';
import MasterLayout from '@/components/master/MasterLayout';
import { MessageSquare, Clock, CheckCircle, AlertCircle, User, Mail, Calendar, X } from 'lucide-react';
import axiosInstance from '@/lib/axios';

const mockInquiryList = [
  {
    id: 1,
    username: '홍길동',
    email: 'hong@test.com',
    title: '호텔 예약 관련 문의',
    content: '예약을 취소하고 싶은데 어떻게 해야 하나요?',
    status: 'completed',
    category: '예약/취소',
    priority: 'high',
    createdAt: '2024-06-10 16:22',
    answeredAt: '2024-06-10 17:30',
    assignedTo: '김상담',
  },
  {
    id: 2,
    username: '이영희',
    email: 'lee@test.com',
    title: '회원 탈퇴 하고싶어요',
    content: '개인정보 보호를 위해 탈퇴를 원합니다.',
    status: 'in_progress',
    category: '회원정보',
    priority: 'medium',
    createdAt: '2024-06-12 10:05',
    assignedTo: '박고객',
  },
  {
    id: 3,
    username: '김철수',
    email: 'kim@test.com',
    title: '[사이트] 로그인 오류',
    content: '로그인할 때 계속 오류가 발생합니다.',
    status: 'completed',
    category: '기술지원',
    priority: 'high',
    createdAt: '2024-06-13 09:18',
    answeredAt: '2024-06-13 10:45',
    assignedTo: '이기술',
  },
  {
    id: 4,
    username: '박민수',
    email: 'park@test.com',
    title: '결제 관련 문의',
    content: '결제가 되지 않아서 문의드립니다.',
    status: 'pending',
    category: '결제',
    priority: 'high',
    createdAt: '2024-06-14 14:20',
    assignedTo: '미배정',
  },
  {
    id: 5,
    username: '최영미',
    email: 'choi@test.com',
    title: '호텔 시설 문의',
    content: '수영장 이용 가능한가요?',
    status: 'completed',
    category: '호텔정보',
    priority: 'low',
    createdAt: '2024-06-15 11:30',
    answeredAt: '2024-06-15 12:15',
    assignedTo: '김상담',
  },
];

export default function InquiryListPage() {
  const [inquiries, setInquiries] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  
  // 실제 필터링에 사용되는 상태 (검색 버튼 클릭시 업데이트)
  const [activeSearchTerm, setActiveSearchTerm] = useState('');
  const [activeStatusFilter, setActiveStatusFilter] = useState('all');
  const [activeCategoryFilter, setActiveCategoryFilter] = useState('all');
  const [activePriorityFilter, setActivePriorityFilter] = useState('all');
  
  // 모달 상태
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [replyText, setReplyText] = useState('');

  useEffect(() => {
    fetchInquiries();
  }, []);

  const fetchInquiries = async () => {
    try {
      // 백엔드 API 호출 - 문의 카테고리만 조회
      const response = await fetch('/api/center/posts/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mainCategory: '문의',
          page: 0,
          size: 100,
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        // 백엔드 데이터를 프론트엔드 형식으로 변환
        const convertedInquiries = (data.content || []).map(item => ({
          id: item.centerIdx,
          username: item.customerIdx ? `고객${item.customerIdx}` : '관리자',
          email: item.customerIdx ? `customer${item.customerIdx}@test.com` : 'admin@test.com',
          title: item.title,
          content: item.content,
          status: item.status === 0 ? 'pending' : item.status === 1 ? 'in_progress' : 'completed',
          category: item.subCategory || '기타',
          priority: item.priority === 0 ? 'low' : item.priority === 1 ? 'medium' : 'high',
          createdAt: item.createdAt ? new Date(item.createdAt).toLocaleString('ko-KR') : '',
          answeredAt: item.status === 2 ? item.updatedAt : null,
          assignedTo: item.adminIdx ? `관리자${item.adminIdx}` : '미배정',
        }));
        setInquiries(convertedInquiries);
      } else {
        // API 실패시 목 데이터 사용
        setInquiries(mockInquiryList);
      }
    } catch (error) {
      console.error('문의 조회 실패:', error);
      // 에러시 목 데이터 사용
      setInquiries(mockInquiryList);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-purple-100 text-purple-800';
      case 'in_progress':
        return 'bg-purple-200 text-purple-900';
      case 'pending':
        return 'bg-purple-300 text-purple-900';
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

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'bg-purple-600 text-white';
      case 'medium':
        return 'bg-purple-400 text-white';
      case 'low':
        return 'bg-purple-200 text-purple-900';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityText = (priority) => {
    switch (priority) {
      case 'high':
        return '높음';
      case 'medium':
        return '보통';
      case 'low':
        return '낮음';
      default:
        return '알 수 없음';
    }
  };

  const filteredInquiries = inquiries.filter(inquiry => {
    const matchesSearch = inquiry.username.toLowerCase().includes(activeSearchTerm.toLowerCase()) ||
                         inquiry.email.toLowerCase().includes(activeSearchTerm.toLowerCase()) ||
                         inquiry.title.toLowerCase().includes(activeSearchTerm.toLowerCase());
    const matchesStatus = activeStatusFilter === 'all' || inquiry.status === activeStatusFilter;
    const matchesCategory = activeCategoryFilter === 'all' || inquiry.category === activeCategoryFilter;
    const matchesPriority = activePriorityFilter === 'all' || inquiry.priority === activePriorityFilter;
    return matchesSearch && matchesStatus && matchesCategory && matchesPriority;
  });

  // 검색 버튼 클릭 핸들러
  const handleSearch = () => {
    setActiveSearchTerm(searchTerm);
    setActiveStatusFilter(statusFilter);
    setActiveCategoryFilter(categoryFilter);
    setActivePriorityFilter(priorityFilter);
  };

  // 필터 초기화 핸들러
  const handleResetFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setCategoryFilter('all');
    setPriorityFilter('all');
    setActiveSearchTerm('');
    setActiveStatusFilter('all');
    setActiveCategoryFilter('all');
    setActivePriorityFilter('all');
  };


  const handleBulkAction = (action) => {
    if (selectedInquiries.length === 0) {
      alert('문의를 선택해주세요.');
      return;
    }
    
    switch (action) {
      case 'assign':
        alert(`${selectedInquiries.length}건의 문의를 배정합니다.`);
        break;
      case 'complete':
        alert(`${selectedInquiries.length}건의 문의를 완료 처리합니다.`);
        break;
      case 'delete':
        if (confirm(`${selectedInquiries.length}건의 문의를 삭제하시겠습니까?`)) {
          alert(`${selectedInquiries.length}건의 문의를 삭제했습니다.`);
        }
        break;
      default:
        break;
    }
    setSelectedInquiries([]);
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
      const response = await axiosInstance.post(`/master/inquiry/${selectedInquiry.id}/answer`, {
        content: replyText.trim()
      });
      
      if (response.data.success) {
        alert('답변이 성공적으로 전송되었습니다.');
        
        // 문의 상태를 완료로 변경
        setInquiries(prev => prev.map(inquiry => 
          inquiry.id === selectedInquiry.id 
            ? { ...inquiry, status: 'completed', answeredAt: new Date().toLocaleString('ko-KR') }
            : inquiry
        ));
        
        // 목록 새로고침
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
  const highPriorityInquiries = inquiries.filter(i => i.priority === 'high').length;

  return (
    <MasterLayout>
      <div className="space-y-6">
        {/* 페이지 헤더 */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">1:1 문의 관리</h2>
            <p className="text-gray-600">회원들의 1:1 문의를 관리하고 답변하세요</p>
          </div>
        </div>

        {/* 통계 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-gray-900">{totalInquiries}</div>
                <div className="text-sm text-gray-600">전체 문의</div>
              </div>
              <MessageSquare className="w-8 h-8 text-purple-600" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-purple-600">{completedInquiries}</div>
                <div className="text-sm text-gray-600">답변 완료</div>
              </div>
              <CheckCircle className="w-8 h-8 text-purple-600" />
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
                <div className="text-2xl font-bold text-green-600">{pendingInquiries}</div>
                <div className="text-sm text-gray-600">대기중</div>
              </div>
              <AlertCircle className="w-8 h-8 text-green-600" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-red-600">{highPriorityInquiries}</div>
                <div className="text-sm text-gray-600">긴급 문의</div>
              </div>
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
          </div>
        </div>

        {/* 검색 및 필터 */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="md:col-span-2">
                <input
                  type="text"
                  placeholder="회원명, 이메일, 제목으로 검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <div>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="all">모든 상태</option>
                  <option value="pending">대기중</option>
                  <option value="in_progress">처리중</option>
                  <option value="completed">답변 완료</option>
                </select>
              </div>
              <div>
                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="all">모든 우선순위</option>
                  <option value="high">높음</option>
                  <option value="medium">보통</option>
                  <option value="low">낮음</option>
                </select>
              </div>
            </div>
            
            {/* 검색 버튼 영역 */}
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-600">
                {activeSearchTerm || activeCategoryFilter !== 'all' || activeStatusFilter !== 'all' || activePriorityFilter !== 'all' ? (
                  <span>
                    검색 조건:
                    {activeSearchTerm && <span className="ml-1 px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">&quot;{activeSearchTerm}&quot;</span>}
                    {activeCategoryFilter !== 'all' && <span className="ml-1 px-2 py-1 bg-green-100 text-green-800 rounded text-xs">카테고리: {activeCategoryFilter}</span>}
                    {activeStatusFilter !== 'all' && <span className="ml-1 px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs">상태: {getStatusText(activeStatusFilter)}</span>}
                    {activePriorityFilter !== 'all' && <span className="ml-1 px-2 py-1 bg-red-100 text-red-800 rounded text-xs">우선순위: {getPriorityText(activePriorityFilter)}</span>}
                  </span>
                ) : (
                  <span>전체 문의를 표시하고 있습니다.</span>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleSearch}
                  className="bg-[#7C3AED] text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
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
                    회원 정보
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    분류/우선순위
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    상태/담당자
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    작성일시
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
                        <div className="text-xs text-gray-400 mt-1">{inquiry.category}</div>
                        <button 
                          onClick={() => handleViewInquiry(inquiry.id)}
                          className="text-[#7C3AED] hover:text-purple-800 text-xs mt-1"
                        >
                          상세보기
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{inquiry.username}</div>
                        <div className="text-sm text-gray-500">{inquiry.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(inquiry.priority)}`}>
                          {getPriorityText(inquiry.priority)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1">
                          {getStatusIcon(inquiry.status)}
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(inquiry.status)}`}>
                            {getStatusText(inquiry.status)}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500">담당: {inquiry.assignedTo}</div>
                        {inquiry.answeredAt && (
                          <div className="text-xs text-gray-400">답변: {inquiry.answeredAt}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{inquiry.createdAt}</div>
                    </td>
                  </tr>
                ))}
                {filteredInquiries.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-gray-400 text-center">
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
          <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
              {/* 모달 헤더 */}
              <div className="flex justify-between items-center p-6 border-b border-gray-200">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{selectedInquiry.title}</h3>
                  <p className="text-sm text-gray-600">{selectedInquiry.username} • {selectedInquiry.email}</p>
                </div>
                <button
                  onClick={handleCloseModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* 모달 내용 */}
              <div className="p-6 overflow-y-auto max-h-[60vh]">
                <div className="space-y-6">
                  {/* 문의 정보 */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center gap-4 mb-3">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedInquiry.status)}`}>
                        {getStatusText(selectedInquiry.status)}
                      </span>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(selectedInquiry.priority)}`}>
                        {getPriorityText(selectedInquiry.priority)}
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                      rows={6}
                    />
                  </div>
                </div>
              </div>

              {/* 모달 푸터 */}
              <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
                <button
                  onClick={handleCloseModal}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  취소
                </button>
                <button
                  onClick={handleSendReply}
                  className="px-4 py-2 bg-[#7C3AED] text-white rounded-lg hover:bg-purple-700"
                >
                  답변 전송
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </MasterLayout>
  );
}
