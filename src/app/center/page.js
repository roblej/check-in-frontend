'use client';

import { useState, useEffect, useCallback } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { HelpCircle, MessageCircle, Search, Plus, ChevronDown } from 'lucide-react';

const CenterPage = () => {
  const [activeTab, setActiveTab] = useState('FAQ');
  const [faqs, setFaqs] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('전체');
  const [loading, setLoading] = useState(true);
  const [expandedFaq, setExpandedFaq] = useState(null);

  // FAQ 카테고리
  const faqCategories = ['전체', '예약/취소', '회원정보', '결제', '기술지원', '호텔정보'];
  
  // 1대1 문의 카테고리
  const inquiryCategories = ['전체', '예약/취소', '회원정보', '결제', '기술지원', '호텔정보', '기타'];

  // FAQ 데이터 로드
  const fetchFaqs = useCallback(async () => {
    try {
      const response = await fetch('/api/center/posts/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mainCategory: 'FAQ',
          subCategory: categoryFilter === '전체' ? null : categoryFilter,
          title: searchTerm || null,
          page: 0,
          size: 100,
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        const convertedFaqs = (data.content || []).map(item => ({
          id: item.centerIdx,
          category: item.subCategory || '기타',
          question: item.title,
          answer: item.content,
          createdAt: item.createdAt ? new Date(item.createdAt).toLocaleString('ko-KR') : '',
        }));
        setFaqs(convertedFaqs);
      }
    } catch (error) {
      console.error('FAQ 조회 실패:', error);
    }
  }, [searchTerm, categoryFilter]);

  // 1대1 문의 데이터 로드
  const fetchInquiries = useCallback(async () => {
    try {
      const response = await fetch('/api/center/posts/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mainCategory: '문의',
          subCategory: categoryFilter === '전체' ? null : categoryFilter,
          title: searchTerm || null,
          page: 0,
          size: 100,
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        const convertedInquiries = (data.content || []).map(item => ({
          id: item.centerIdx,
          category: item.subCategory || '기타',
          title: item.title,
          content: item.content,
          status: item.status === 0 ? '대기' : item.status === 1 ? '처리중' : '완료',
          createdAt: item.createdAt ? new Date(item.createdAt).toLocaleString('ko-KR') : '',
        }));
        setInquiries(convertedInquiries);
      }
    } catch (error) {
      console.error('1대1 문의 조회 실패:', error);
    }
  }, [searchTerm, categoryFilter]);

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

  // 검색 핸들러
  const handleSearch = () => {
    setLoading(true);
    if (activeTab === 'FAQ') {
      fetchFaqs().finally(() => setLoading(false));
    } else {
      fetchInquiries().finally(() => setLoading(false));
    }
  };

  // 필터 초기화
  const handleResetFilters = () => {
    setSearchTerm('');
    setCategoryFilter('전체');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* 페이지 헤더 */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">고객센터</h1>
          <p className="text-gray-600">궁금한 점이 있으시면 FAQ를 확인하거나 1대1 문의를 이용해주세요</p>
        </div>

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
                {searchTerm || categoryFilter !== '전체' ? (
                  <span>
                    검색 조건: 
                    {searchTerm && <span className="ml-1 px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">&quot;{searchTerm}&quot;</span>}
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
                      {expandedFaq === faq.id && (
                        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                          <p className="text-gray-700 leading-relaxed">{faq.answer}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            /* 1대1 문의 탭 */
            <div>
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">1대1 문의</h3>
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
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
                        </div>
                      </div>
                    </div>
                  ))}
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
      </div>

      <Footer />
    </div>
  );
};

export default CenterPage;
