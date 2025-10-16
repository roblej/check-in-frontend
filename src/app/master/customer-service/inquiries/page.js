'use client';

import { useState, useEffect } from 'react';
import MasterLayout from '@/components/master/MasterLayout';
import { MessageSquare, Clock, CheckCircle, AlertCircle, User, Mail, Calendar } from 'lucide-react';

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
  const [selectedInquiries, setSelectedInquiries] = useState([]);
  
  // 실제 필터링에 사용되는 상태 (검색 버튼 클릭시 업데이트)
  const [activeSearchTerm, setActiveSearchTerm] = useState('');
  const [activeStatusFilter, setActiveStatusFilter] = useState('all');
  const [activeCategoryFilter, setActiveCategoryFilter] = useState('all');
  const [activePriorityFilter, setActivePriorityFilter] = useState('all');

  useEffect(() => {
    // TODO: 실제 API 연동시 여기에서 fetch 후 setInquiries 호출
    setInquiries(mockInquiryList);
  }, []);

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

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
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

  const handleSelectInquiry = (inquiryId) => {
    setSelectedInquiries(prev => 
      prev.includes(inquiryId) 
        ? prev.filter(id => id !== inquiryId)
        : [...prev, inquiryId]
    );
  };

  const handleSelectAll = () => {
    if (selectedInquiries.length === filteredInquiries.length) {
      setSelectedInquiries([]);
    } else {
      setSelectedInquiries(filteredInquiries.map(inquiry => inquiry.id));
    }
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

  const handleInquiryAction = (inquiryId, action) => {
    const inquiry = inquiries.find(i => i.id === inquiryId);
    
    switch (action) {
      case 'view':
        alert(`${inquiry.title} 상세보기`);
        break;
      case 'reply':
        alert(`${inquiry.title} 답변하기`);
        break;
      case 'assign':
        alert(`${inquiry.title} 담당자 배정`);
        break;
      case 'complete':
        alert(`${inquiry.title} 완료 처리`);
        break;
      default:
        break;
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
          <button className="bg-[#7C3AED] text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors">
            답변 템플릿 관리
          </button>
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
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                {activeSearchTerm || activeStatusFilter !== 'all' || activePriorityFilter !== 'all' ? (
                  <span>
                    검색 조건: 
                    {activeSearchTerm && <span className="ml-1 px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">"{activeSearchTerm}"</span>}
                    {activeStatusFilter !== 'all' && <span className="ml-1 px-2 py-1 bg-green-100 text-green-800 rounded text-xs">상태: {getStatusText(activeStatusFilter)}</span>}
                    {activePriorityFilter !== 'all' && <span className="ml-1 px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs">우선순위: {getPriorityText(activePriorityFilter)}</span>}
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

        {/* 일괄 작업 버튼 */}
        {selectedInquiries.length > 0 && (
          <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
            <div className="flex items-center justify-between">
              <span className="text-sm text-purple-700">
                {selectedInquiries.length}건의 문의가 선택됨
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => handleBulkAction('assign')}
                  className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  담당자 배정
                </button>
                <button
                  onClick={() => handleBulkAction('complete')}
                  className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
                >
                  완료 처리
                </button>
                <button
                  onClick={() => handleBulkAction('delete')}
                  className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
                >
                  삭제
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 문의 목록 테이블 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedInquiries.length === filteredInquiries.length && filteredInquiries.length > 0}
                      onChange={handleSelectAll}
                      className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                    />
                  </th>
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    액션
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredInquiries.map((inquiry) => (
                  <tr key={inquiry.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedInquiries.includes(inquiry.id)}
                        onChange={() => handleSelectInquiry(inquiry.id)}
                        className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{inquiry.title}</div>
                        <div className="text-sm text-gray-500 truncate max-w-xs">{inquiry.content}</div>
                        <div className="text-xs text-gray-400 mt-1">{inquiry.category}</div>
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
                    <td className="px-6 py-4 text-sm font-medium">
                      <div className="flex flex-col gap-1">
                        <button 
                          onClick={() => handleInquiryAction(inquiry.id, 'view')}
                          className="text-[#7C3AED] hover:text-purple-800 text-left"
                        >
                          상세보기
                        </button>
                        <button 
                          onClick={() => handleInquiryAction(inquiry.id, 'reply')}
                          className="text-blue-600 hover:text-blue-800 text-left"
                        >
                          답변하기
                        </button>
                        <button 
                          onClick={() => handleInquiryAction(inquiry.id, 'assign')}
                          className="text-green-600 hover:text-green-800 text-left"
                        >
                          담당자 배정
                        </button>
                        <button 
                          onClick={() => handleInquiryAction(inquiry.id, 'complete')}
                          className="text-orange-600 hover:text-orange-800 text-left"
                        >
                          완료 처리
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredInquiries.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-gray-400 text-center">
                      조건에 맞는 문의가 없습니다.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </MasterLayout>
  );
}
