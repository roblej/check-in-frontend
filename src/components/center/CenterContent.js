'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Pagination from '@/components/Pagination';
import { HelpCircle, MessageCircle, Plus, ChevronDown } from 'lucide-react';
import { centerAPI } from '@/lib/api/center';

const CenterContent = ({ initialFaqs, initialInquiries, initialSearchParams }) => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('FAQ');
  const [faqs, setFaqs] = useState(initialFaqs || []);
  const [inquiries, setInquiries] = useState(initialInquiries || []);
  
  // 초기 데이터 설정
  useEffect(() => {
    setFaqs(initialFaqs || []);
  }, [initialFaqs]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeSearchTerm, setActiveSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('전체');
  const [loading, setLoading] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState(null);
  const [expandedAnswer, setExpandedAnswer] = useState(null);
  const [answers, setAnswers] = useState({});
  
  // 페이징 상태
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [pageSize] = useState(5);

  // FAQ 카테고리
  const faqCategories = ['전체', '예약/취소', '회원정보', '결제', '기술지원', '호텔정보'];
  
  // 1대1 문의 카테고리
  const inquiryCategories = ['전체', '예약/취소', '회원정보', '결제', '기술지원', '호텔정보', '기타'];

  // FAQ 데이터 로드
  const fetchFaqs = useCallback(async () => {
    try {
      const data = await centerAPI.getFAQs({
        mainCategory: 'FAQ',
        subCategory: categoryFilter === '전체' ? null : categoryFilter,
        title: activeSearchTerm || null,
        page: currentPage,
        size: pageSize,
      });
      
      const convertedFaqs = (data.content || []).map(item => ({
        id: item.centerIdx,
        category: item.subCategory || '기타',
        question: item.title,
        answer: item.content,
        createdAt: item.createdAt ? new Date(item.createdAt).toLocaleString('ko-KR') : '',
      }));
      setFaqs(convertedFaqs);
      setTotalPages(data.totalPages || 0);
      setTotalElements(data.totalElements || 0);
    } catch (error) {
      console.error('FAQ 조회 실패:', error);
    }
  }, [activeSearchTerm, categoryFilter, currentPage, pageSize]);

  // 1대1 문의 데이터 로드
  const fetchInquiries = useCallback(async () => {
    try {
      const data = await centerAPI.getInquiries({
        mainCategory: '문의',
        subCategory: categoryFilter === '전체' ? null : categoryFilter,
        title: activeSearchTerm || null,
        page: currentPage,
        size: pageSize,
      });
      
      const convertedInquiries = (data.content || []).map(item => ({
        id: item.centerIdx,
        category: item.subCategory || '기타',
        title: item.title,
        content: item.content,
        status: item.status === 0 ? '대기' : item.status === 1 ? '처리중' : '완료',
        createdAt: item.createdAt ? new Date(item.createdAt).toLocaleString('ko-KR') : '',
      }));
      setInquiries(convertedInquiries);
      setTotalPages(data.totalPages || 0);
      setTotalElements(data.totalElements || 0);
    } catch (error) {
      console.error('1대1 문의 조회 실패:', error);
    }
  }, [activeSearchTerm, categoryFilter, currentPage, pageSize]);

  // 탭 변경 시 데이터 로드
  useEffect(() => {
    setLoading(true);
    if (activeTab === 'FAQ') {
      fetchFaqs().finally(() => setLoading(false));
    } else {
      fetchInquiries().finally(() => setLoading(false));
    }
  }, [activeTab, fetchFaqs, fetchInquiries]);

  // FAQ 토글
  const toggleFaq = (faqId) => {
    setExpandedFaq(expandedFaq === faqId ? null : faqId);
  };

  // 답변 토글
  const toggleAnswer = async (inquiryId) => {
    if (expandedAnswer === inquiryId) {
      // 답변 닫기
      setExpandedAnswer(null);
    } else {
      // 답변 열기
      setExpandedAnswer(inquiryId);
      
      // 답변이 아직 로드되지 않았다면 로드
      if (!answers[inquiryId]) {
        try {
          const answerData = await centerAPI.getAnswer(inquiryId);
          setAnswers(prev => ({
            ...prev,
            [inquiryId]: answerData
          }));
        } catch (error) {
          console.error('답변 조회 실패:', error);
          // 답변을 찾을 수 없는 경우 빈 객체로 설정
          setAnswers(prev => ({
            ...prev,
            [inquiryId]: null
          }));
        }
      }
    }
  };

  // 검색 핸들러
  const handleSearch = () => {
    setActiveSearchTerm(searchTerm);
    setCurrentPage(0); // 검색 시 첫 페이지로 이동
    setLoading(true);
    if (activeTab === 'FAQ') {
      fetchFaqs().finally(() => setLoading(false));
    } else {
      fetchInquiries().finally(() => setLoading(false));
    }
  };

  // 페이지 변경 핸들러
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // 필터 초기화
  const handleResetFilters = () => {
    setSearchTerm('');
    setActiveSearchTerm('');
    setCategoryFilter('전체');
    setCurrentPage(0);
  };

  return (
    <>
      {/* 탭 네비게이션 */}
      <div className="flex justify-center mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-1">
          <button
            onClick={() => setActiveTab('FAQ')}
            className={`px-6 py-3 rounded-md font-medium transition-colors ${
              activeTab === 'FAQ'
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 hover:text-blue-600'
            }`}
          >
            <HelpCircle className="w-5 h-5 inline mr-2" />
            FAQ
          </button>
          <button
            onClick={() => setActiveTab('문의')}
            className={`px-6 py-3 rounded-md font-medium transition-colors ${
              activeTab === '문의'
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 hover:text-blue-600'
            }`}
          >
            <MessageCircle className="w-5 h-5 inline mr-2" />
            1대1 문의
          </button>
        </div>
      </div>

      {/* 검색 및 필터 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <input
                type="text"
                placeholder={activeTab === 'FAQ' ? '질문을 검색하세요...' : '문의 제목을 검색하세요...'}
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
                {(activeTab === 'FAQ' ? faqCategories : inquiryCategories).map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              {activeSearchTerm || categoryFilter !== '전체' ? (
                <span>
                  검색 조건: 
                  {activeSearchTerm && <span className="ml-1 px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">&quot;{activeSearchTerm}&quot;</span>}
                  {categoryFilter !== '전체' && <span className="ml-1 px-2 py-1 bg-green-100 text-green-800 rounded text-xs">카테고리: {categoryFilter}</span>}
                </span>
              ) : (
                <span>전체 {activeTab === 'FAQ' ? 'FAQ' : '문의'}를 표시하고 있습니다.</span>
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

      {/* 콘텐츠 영역 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="px-6 py-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-2">로딩 중...</p>
          </div>
        ) : activeTab === 'FAQ' ? (
          /* FAQ 탭 */
          <div>
            {faqs.length === 0 ? (
              <div className="px-6 py-8 text-gray-400 text-center">
                조건에 맞는 FAQ가 없습니다.
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {faqs.map((faq) => (
                  <div key={faq.id} className="p-6">
                    <button
                      onClick={() => toggleFaq(faq.id)}
                      className="w-full text-left flex items-center justify-between"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                            {faq.category}
                          </span>
                          <span className="text-xs text-gray-500">{faq.createdAt}</span>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900">
                          {faq.question}
                        </h3>
                      </div>
                      <ChevronDown 
                        className={`w-5 h-5 text-gray-400 transition-transform ${
                          expandedFaq === faq.id ? 'rotate-180' : ''
                        }`} 
                      />
                    </button>
                    <div 
                      className="overflow-hidden transition-all duration-500 ease-in-out"
                      style={{
                        maxHeight: expandedFaq === faq.id ? '500px' : '0px',
                        opacity: expandedFaq === faq.id ? 1 : 0,
                        transform: expandedFaq === faq.id ? 'translateY(0)' : 'translateY(-10px)'
                      }}
                    >
                      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                        <p className="text-gray-700 leading-relaxed">{faq.answer}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {/* FAQ 페이징 */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalElements={totalElements}
                  pageSize={pageSize}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </div>
        ) : (
          /* 1대1 문의 탭 */
          <div>
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">1대1 문의</h3>
                <button 
                  onClick={() => router.push('/center/inquiry')}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  새 문의하기
                </button>
              </div>
            </div>
            
            {inquiries.length === 0 ? (
              <div className="px-6 py-8 text-gray-400 text-center">
                조건에 맞는 문의가 없습니다.
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {inquiries.map((inquiry) => (
                  <div key={inquiry.id} className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                            {inquiry.category}
                          </span>
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            inquiry.status === '완료' ? 'bg-blue-100 text-blue-800' :
                            inquiry.status === '처리중' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {inquiry.status}
                          </span>
                          <span className="text-xs text-gray-500">{inquiry.createdAt}</span>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          {inquiry.title}
                        </h3>
                        <p className="text-gray-600 line-clamp-2">
                          {inquiry.content}
                        </p>
                        {inquiry.status === '완료' && (
                          <button
                            onClick={() => toggleAnswer(inquiry.id)}
                            className="mt-3 flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium transition-colors"
                          >
                            <ChevronDown 
                              className={`w-4 h-4 transition-transform ${
                                expandedAnswer === inquiry.id ? 'rotate-180' : ''
                              }`} 
                            />
                            {expandedAnswer === inquiry.id ? '답변 숨기기' : '답변 보기'}
                          </button>
                        )}
                      </div>
                    </div>
                    {/* 답변 영역 */}
                    {expandedAnswer === inquiry.id && (
                      <div 
                        className="overflow-hidden transition-all duration-500 ease-in-out mt-4"
                        style={{
                          maxHeight: expandedAnswer === inquiry.id ? '500px' : '0px',
                          opacity: expandedAnswer === inquiry.id ? 1 : 0,
                          transform: expandedAnswer === inquiry.id ? 'translateY(0)' : 'translateY(-10px)'
                        }}
                      >
                        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                          {answers[inquiry.id] ? (
                            <div>
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-sm font-semibold text-blue-900">관리자 답변</span>
                              </div>
                              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                                {answers[inquiry.id].content}
                              </p>
                            </div>
                          ) : answers[inquiry.id] === null ? (
                            <p className="text-gray-500">답변을 찾을 수 없습니다.</p>
                          ) : (
                            <div className="flex items-center justify-center py-4">
                              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                              <span className="ml-2 text-gray-600">답변을 불러오는 중...</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
            
            {/* 1대1 문의 페이징 */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalElements={totalElements}
                  pageSize={pageSize}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* 도움말 섹션 */}
      <div className="mt-8 bg-blue-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">도움이 필요하신가요?</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center">
            <HelpCircle className="w-6 h-6 text-blue-600 mr-3" />
            <div>
              <p className="font-medium text-blue-900">FAQ</p>
              <p className="text-sm text-blue-700">자주 묻는 질문을 확인해보세요</p>
            </div>
          </div>
          <div className="flex items-center">
            <MessageCircle className="w-6 h-6 text-blue-600 mr-3" />
            <div>
              <p className="font-medium text-blue-900">1대1 문의</p>
              <p className="text-sm text-blue-700">직접 문의하여 답변을 받아보세요</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CenterContent;

