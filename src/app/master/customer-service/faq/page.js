'use client';

import { useState, useEffect, useCallback } from 'react';
import MasterLayout from '@/components/master/MasterLayout';
import Pagination from '@/components/Pagination';
import { HelpCircle, Plus, Edit, Trash2, Eye, EyeOff, Search, Filter } from 'lucide-react';

const mockFaqList = [
  {
    id: 1,
    category: '예약/취소',
    question: '호텔 예약을 취소하고 싶어요',
    answer: '예약 취소는 마이페이지 > 예약 내역에서 가능합니다. 취소 정책에 따라 수수료가 부과될 수 있습니다.',
    order: 1,
    createdAt: '2024-06-10 16:22',
    updatedAt: '2024-06-10 16:22',
  },
  {
    id: 2,
    category: '회원정보',
    question: '비밀번호를 잊어버렸어요',
    answer: '로그인 페이지에서 "비밀번호 찾기"를 클릭하여 이메일로 재설정 링크를 받으실 수 있습니다.',
    order: 2,
    createdAt: '2024-06-12 10:05',
    updatedAt: '2024-06-12 10:05',
  },
  {
    id: 3,
    category: '결제',
    question: '결제 방법은 어떤 것들이 있나요?',
    answer: '신용카드, 체크카드, 계좌이체, 간편결제(카카오페이, 네이버페이) 등을 지원합니다.',
    order: 3,
    createdAt: '2024-06-13 09:18',
    updatedAt: '2024-06-13 09:18',
  },
  {
    id: 4,
    category: '기술지원',
    question: '사이트가 느려요',
    answer: '인터넷 연결 상태를 확인해주세요. 문제가 지속되면 고객센터로 문의해주세요.',
    order: 4,
    createdAt: '2024-06-14 14:20',
    updatedAt: '2024-06-14 14:20',
  },
  {
    id: 5,
    category: '호텔정보',
    question: '체크인/체크아웃 시간은 언제인가요?',
    answer: '일반적으로 체크인은 오후 3시, 체크아웃은 오전 11시입니다. 호텔마다 다를 수 있으니 예약 시 확인해주세요.',
    order: 5,
    createdAt: '2024-06-15 11:30',
    updatedAt: '2024-06-15 11:30',
  },
  {
    id: 6,
    category: '예약/취소',
    question: '예약 변경은 어떻게 하나요?',
    answer: '예약 변경은 마이페이지에서 가능하며, 변경 가능 기간과 수수료는 예약 정책을 확인해주세요.',
    order: 6,
    createdAt: '2024-06-16 09:15',
    updatedAt: '2024-06-16 09:15',
  },
];

const categories = ['전체', '예약/취소', '회원정보', '결제', '기술지원', '호텔정보'];

export default function FaqManagementPage() {
  const [faqs, setFaqs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('전체');
  const [selectedFaqs, setSelectedFaqs] = useState([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState(null);
  
  // 실제 필터링에 사용되는 상태 (검색 버튼 클릭시 업데이트)
  const [activeSearchTerm, setActiveSearchTerm] = useState('');
  const [activeCategoryFilter, setActiveCategoryFilter] = useState('전체');
  
  // 페이지네이션 상태
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(10); // 페이지당 표시할 FAQ 수
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  // 새 FAQ 추가 폼 상태
  const [newFaq, setNewFaq] = useState({
    category: '',
    question: '',
    answer: '',
    order: 0,
  });

  const fetchFaqs = useCallback(async (page = 0, size = pageSize, searchTerm = null, category = null) => {
    try {
      // 백엔드 API 호출 - FAQ 카테고리만 조회 (페이지네이션 적용)
      const response = await fetch('/api/center/posts/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mainCategory: 'FAQ',
          subCategory: category,
          title: searchTerm,
          page: page,
          size: size,
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        
        // 백엔드 데이터를 프론트엔드 형식으로 변환
        const convertedFaqs = (data.content || []).map(item => ({
          id: item.centerIdx,
          centerIdx: item.centerIdx,
          category: item.subCategory || '기타',
          question: item.title,
          answer: item.content,
          order: item.priority || 0,
          createdAt: item.createdAt ? new Date(item.createdAt).toLocaleString('ko-KR') : '',
          updatedAt: item.updatedAt ? new Date(item.updatedAt).toLocaleString('ko-KR') : '',
        }));
        
        setFaqs(convertedFaqs);
        
        // 페이지네이션 정보 업데이트
        setTotalPages(data.totalPages || 0);
        setTotalElements(data.totalElements || 0);
      } else {
        // API 실패시 목 데이터 사용
        setFaqs(mockFaqList);
        setTotalPages(Math.ceil(mockFaqList.length / pageSize));
        setTotalElements(mockFaqList.length);
      }
    } catch (error) {
      console.error('FAQ 조회 실패:', error);
      // 에러시 목 데이터 사용
      setFaqs(mockFaqList);
      setTotalPages(Math.ceil(mockFaqList.length / pageSize));
      setTotalElements(mockFaqList.length);
    }
  }, [pageSize]);

  useEffect(() => {
    // API 호출만 수행
    fetchFaqs();
  }, [fetchFaqs]);

  // 서버 사이드 페이지네이션을 사용하므로 클라이언트 사이드 필터링 제거
  // faqs는 이미 현재 페이지의 데이터만 포함


  // 검색 버튼 클릭 핸들러
  const handleSearch = () => {
    setActiveSearchTerm(searchTerm);
    setActiveCategoryFilter(categoryFilter);
    setCurrentPage(0); // 검색 시 첫 페이지로 이동
    // API 호출하여 검색 결과 가져오기
    const searchValue = searchTerm.trim() || null;
    const categoryValue = categoryFilter === '전체' ? null : categoryFilter;
    fetchFaqs(0, pageSize, searchValue, categoryValue);
  };

  // 필터 초기화 핸들러
  const handleResetFilters = () => {
    setSearchTerm('');
    setCategoryFilter('전체');
    setActiveSearchTerm('');
    setActiveCategoryFilter('전체');
    setCurrentPage(0); // 필터 초기화 시 첫 페이지로 이동
    // API 호출하여 전체 데이터 가져오기
    fetchFaqs(0, pageSize, null, null);
  };

  // 페이지 변경 핸들러
  const handlePageChange = (page) => {
    setCurrentPage(page);
    setSelectedFaqs([]); // 페이지 변경 시 선택 해제
    // API 호출하여 해당 페이지 데이터 가져오기
    const searchValue = activeSearchTerm.trim() || null;
    const categoryValue = activeCategoryFilter === '전체' ? null : activeCategoryFilter;
    fetchFaqs(page, pageSize, searchValue, categoryValue);
  };

  const handleSelectFaq = (faqId) => {
    setSelectedFaqs(prev => 
      prev.includes(faqId) 
        ? prev.filter(id => id !== faqId)
        : [...prev, faqId]
    );
  };

  const handleSelectAll = () => {
    if (selectedFaqs.length === faqs.length) {
      setSelectedFaqs([]);
    } else {
      setSelectedFaqs(faqs.map(faq => faq.id));
    }
  };

  const handleBulkAction = (action) => {
    if (selectedFaqs.length === 0) {
      alert('FAQ를 선택해주세요.');
      return;
    }
    
    switch (action) {
      case 'delete':
        if (confirm(`${selectedFaqs.length}개의 FAQ를 삭제하시겠습니까?`)) {
          alert(`${selectedFaqs.length}개의 FAQ를 삭제했습니다.`);
        }
        break;
      default:
        break;
    }
    setSelectedFaqs([]);
  };

  const handleFaqAction = async (faqId, action) => {
    const faq = faqs.find(f => f.id === faqId);
    
    switch (action) {
      case 'edit':
        setEditingFaq(faq);
        setIsEditModalOpen(true);
        break;
      case 'delete':
        if (confirm(`${faq.question}를 삭제하시겠습니까?`)) {
          try {
            const response = await fetch(`/api/center/posts/${faq.centerIdx}`, {
              method: 'DELETE',
            });

            if (response.ok) {
              alert(`${faq.question}를 삭제했습니다.`);
              const searchValue = activeSearchTerm.trim() || null;
              const categoryValue = activeCategoryFilter === '전체' ? null : activeCategoryFilter;
              fetchFaqs(currentPage, pageSize, searchValue, categoryValue); // 목록 새로고침
            } else {
              alert('FAQ 삭제에 실패했습니다.');
            }
          } catch (error) {
            console.error('FAQ 삭제 실패:', error);
            alert('FAQ 삭제 중 오류가 발생했습니다.');
          }
        }
        break;
      default:
        break;
    }
  };

  const handleAddFaq = async () => {
    if (!newFaq.category || !newFaq.question || !newFaq.answer) {
      alert('모든 필드를 입력해주세요.');
      return;
    }
    
    try {
      const response = await fetch('/api/center/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: newFaq.question,
          adminIdx: 2,
          mainCategory: 'FAQ',
          subCategory: newFaq.category,
          content: newFaq.answer,
          priority: 0,
        }),
      });

      if (response.ok) {
        alert('새 FAQ가 추가되었습니다.');
        setNewFaq({ category: '', question: '', answer: '', order: 0 });
        setIsAddModalOpen(false);
        const searchValue = activeSearchTerm.trim() || null;
        const categoryValue = activeCategoryFilter === '전체' ? null : activeCategoryFilter;
        fetchFaqs(currentPage, pageSize, searchValue, categoryValue); // 목록 새로고침
      } else {
        alert('FAQ 추가에 실패했습니다.');
      }
    } catch (error) {
      console.error('FAQ 추가 실패:', error);
      alert('FAQ 추가 중 오류가 발생했습니다.');
    }
  };

  const handleEditFaq = async () => {
    if (!editingFaq.category || !editingFaq.question || !editingFaq.answer) {
      alert('모든 필드를 입력해주세요.');
      return;
    }
    
    try {
      const response = await fetch(`/api/center/posts/${editingFaq.centerIdx}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: editingFaq.question,
          mainCategory: 'FAQ',
          subCategory: editingFaq.category,
          content: editingFaq.answer,
          priority: editingFaq.order,
          status: 2, // 완료 상태
        }),
      });

      if (response.ok) {
        alert('FAQ가 수정되었습니다.');
        setIsEditModalOpen(false);
        setEditingFaq(null);
        const searchValue = activeSearchTerm.trim() || null;
        const categoryValue = activeCategoryFilter === '전체' ? null : activeCategoryFilter;
        fetchFaqs(currentPage, pageSize, searchValue, categoryValue); // 목록 새로고침
      } else {
        alert('FAQ 수정에 실패했습니다.');
      }
    } catch (error) {
      console.error('FAQ 수정 실패:', error);
      alert('FAQ 수정 중 오류가 발생했습니다.');
    }
  };

  // 통계 계산 - 서버에서 받은 전체 개수 사용
  const totalFaqs = totalElements;

  return (
    <MasterLayout>
      <div className="space-y-6">
        {/* 페이지 헤더 */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">FAQ 관리</h2>
            <p className="text-gray-600">자주묻는질문을 관리하고 고객 지원을 개선하세요</p>
          </div>
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="bg-[#7C3AED] text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            FAQ 추가
          </button>
        </div>

        {/* 통계 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-gray-900">{totalFaqs}</div>
                <div className="text-sm text-gray-600">전체 FAQ</div>
              </div>
              <HelpCircle className="w-8 h-8 text-purple-600" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-blue-600">{categories.length - 1}</div>
                <div className="text-sm text-gray-600">카테고리</div>
              </div>
              <Filter className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-green-600">{currentPage + 1}</div>
                <div className="text-sm text-gray-600">현재 페이지</div>
              </div>
              <Search className="w-8 h-8 text-green-600" />
            </div>
          </div>
        </div>

        {/* 검색 및 필터 */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <input
                  type="text"
                  placeholder="질문, 답변 내용으로 검색..."
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
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
            </div>
            
            {/* 검색 버튼 영역 */}
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-600">
                {activeSearchTerm || activeCategoryFilter !== '전체' ? (
                  <span>
                    검색 조건: 
                    {activeSearchTerm && <span className="ml-1 px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">&quot;{activeSearchTerm}&quot;</span>}
                    {activeCategoryFilter !== '전체' && <span className="ml-1 px-2 py-1 bg-green-100 text-green-800 rounded text-xs">카테고리: {activeCategoryFilter}</span>}
                  </span>
                ) : (
                  <span>전체 FAQ를 표시하고 있습니다.</span>
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
        {selectedFaqs.length > 0 && (
          <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
            <div className="flex items-center justify-between">
              <span className="text-sm text-purple-700">
                {selectedFaqs.length}개의 FAQ가 선택됨
              </span>
              <div className="flex gap-2">
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

        {/* FAQ 아코디언 목록 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {faqs.length === 0 ? (
            <div className="px-6 py-8 text-gray-400 text-center">
              조건에 맞는 FAQ가 없습니다.
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {faqs.map((faq) => (
                <div key={faq.id} className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <input
                        type="checkbox"
                        checked={selectedFaqs.includes(faq.id)}
                        onChange={() => handleSelectFaq(faq.id)}
                        className="mt-1 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                            {faq.category}
                          </span>
                          <span className="text-xs text-gray-500">순서: {faq.order}</span>
                          <span className="text-xs text-gray-500">수정: {faq.updatedAt}</span>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-3">
                          {faq.question}
                        </h3>
                        <div className="p-4 bg-gray-50 rounded-lg">
                          <p className="text-gray-700 leading-relaxed">{faq.answer}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <button 
                        onClick={() => handleFaqAction(faq.id, 'edit')}
                        className="p-2 text-gray-400 hover:text-[#7C3AED] transition-colors"
                        title="수정"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleFaqAction(faq.id, 'delete')}
                        className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                        title="삭제"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 페이지네이션 */}
        {totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalElements={totalElements}
            pageSize={pageSize}
            onPageChange={handlePageChange}
          />
        )}

        {/* FAQ 추가 모달 */}
        {isAddModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <h3 className="text-lg font-semibold mb-4">새 FAQ 추가</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">카테고리</label>
                  <select
                    value={newFaq.category}
                    onChange={(e) => setNewFaq({...newFaq, category: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="">카테고리 선택</option>
                    {categories.slice(1).map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">질문</label>
                  <input
                    type="text"
                    value={newFaq.question}
                    onChange={(e) => setNewFaq({...newFaq, question: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="질문을 입력하세요"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">답변</label>
                  <textarea
                    value={newFaq.answer}
                    onChange={(e) => setNewFaq({...newFaq, answer: e.target.value})}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="답변을 입력하세요"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">순서</label>
                  <input
                    type="number"
                    value={newFaq.order}
                    onChange={(e) => setNewFaq({...newFaq, order: parseInt(e.target.value) || 0})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="표시 순서"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  취소
                </button>
                <button
                  onClick={handleAddFaq}
                  className="px-4 py-2 bg-[#7C3AED] text-white rounded-lg hover:bg-purple-700"
                >
                  추가
                </button>
              </div>
            </div>
          </div>
        )}

        {/* FAQ 수정 모달 */}
        {isEditModalOpen && editingFaq && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <h3 className="text-lg font-semibold mb-4">FAQ 수정</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">카테고리</label>
                  <select
                    value={editingFaq.category}
                    onChange={(e) => setEditingFaq({...editingFaq, category: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    {categories.slice(1).map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">질문</label>
                  <input
                    type="text"
                    value={editingFaq.question}
                    onChange={(e) => setEditingFaq({...editingFaq, question: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">답변</label>
                  <textarea
                    value={editingFaq.answer}
                    onChange={(e) => setEditingFaq({...editingFaq, answer: e.target.value})}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">순서</label>
                  <input
                    type="number"
                    value={editingFaq.order}
                    onChange={(e) => setEditingFaq({...editingFaq, order: parseInt(e.target.value) || 0})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  취소
                </button>
                <button
                  onClick={handleEditFaq}
                  className="px-4 py-2 bg-[#7C3AED] text-white rounded-lg hover:bg-purple-700"
                >
                  수정
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </MasterLayout>
  );
}
