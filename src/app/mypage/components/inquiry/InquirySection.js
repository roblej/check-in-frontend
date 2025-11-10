'use client';

import { useState, useMemo, useEffect } from 'react';
import { MessageSquare, ChevronDown, ChevronUp } from 'lucide-react';
import { centerAPI } from '@/lib/api/center';
import Pagination from '@/components/Pagination';

export default function InquirySection({ inquiries, onCreateInquiry, loading }) {
  const [activeTab, setActiveTab] = useState('site'); // 'site', 'room', 'report'
  const [expandedAnswers, setExpandedAnswers] = useState({});
  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = 5; // 페이지당 5개

  // 탭별 개수 계산
  const tabCounts = useMemo(() => {
    const siteCount = inquiries.filter(
      (inquiry) => inquiry.mainCategory === '문의' && !inquiry.contentId
    ).length;
    const roomCount = inquiries.filter(
      (inquiry) => inquiry.mainCategory === '문의' && inquiry.contentId
    ).length;
    const reportCount = inquiries.filter(
      (inquiry) => inquiry.mainCategory === '신고'
    ).length;
    return { site: siteCount, room: roomCount, report: reportCount };
  }, [inquiries]);

  // 탭별로 문의 필터링
  const filteredInquiries = useMemo(() => {
    return inquiries.filter((inquiry) => {
      if (activeTab === 'site') {
        // 사이트문의: mainCategory가 '문의'이고 contentId가 없음
        return inquiry.mainCategory === '문의' && !inquiry.contentId;
      } else if (activeTab === 'room') {
        // 객실문의: mainCategory가 '문의'이고 contentId가 있음
        return inquiry.mainCategory === '문의' && inquiry.contentId;
      } else if (activeTab === 'report') {
        // 객실신고: mainCategory가 '신고'
        return inquiry.mainCategory === '신고';
      }
      return false;
    });
  }, [inquiries, activeTab]);

  // 페이지네이션 계산
  const totalPages = Math.ceil(filteredInquiries.length / pageSize);
  const totalElements = filteredInquiries.length;
  
  // 현재 페이지에 표시할 문의 목록
  const paginatedInquiries = useMemo(() => {
    const startIndex = currentPage * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredInquiries.slice(startIndex, endIndex);
  }, [filteredInquiries, currentPage, pageSize]);

  // 탭 변경 시 첫 페이지로 리셋
  useEffect(() => {
    setCurrentPage(0);
  }, [activeTab]);

  // 답변 토글 핸들러
  const toggleAnswer = async (centerIdx) => {
    if (expandedAnswers[centerIdx]) {
      // 이미 열려있으면 닫기
      setExpandedAnswers((prev) => {
        const newState = { ...prev };
        delete newState[centerIdx];
        return newState;
      });
    } else {
      // 닫혀있으면 답변 가져오기
      try {
        const answerData = await centerAPI.getAnswer(centerIdx);
        setExpandedAnswers((prev) => ({
          ...prev,
          [centerIdx]: answerData?.content || answerData?.answer || '답변이 없습니다.',
        }));
      } catch (error) {
        console.error('답변 가져오기 실패:', error);
        setExpandedAnswers((prev) => ({
          ...prev,
          [centerIdx]: '답변을 불러오는데 실패했습니다.',
        }));
      }
    }
  };

  // 상태 텍스트 변환
  const getStatusText = (status) => {
    if (status === 0) return '대기중';
    if (status === 1) return '처리중';
    if (status === 2) return '답변완료';
    return '대기중';
  };

  // 상태 색상 변환
  const getStatusColor = (status) => {
    if (status === 0) return 'bg-yellow-100 text-yellow-700';
    if (status === 1) return 'bg-blue-100 text-blue-700';
    if (status === 2) return 'bg-green-100 text-green-700';
    return 'bg-gray-100 text-gray-700';
  };

  // 날짜 포맷팅
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  return (
    <section className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <MessageSquare className="w-6 h-6 text-blue-600" />
          1:1 문의 내역
        </h2>
        <button
          onClick={onCreateInquiry}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
        >
          새 문의하기
        </button>
      </div>

      {/* 탭 토글 */}
      <div className="flex gap-2 mb-6 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('site')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'site'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          사이트문의
          {tabCounts.site > 0 && (
            <span className="ml-2 text-xs text-gray-500">({tabCounts.site})</span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('room')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'room'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          객실문의
          {tabCounts.room > 0 && (
            <span className="ml-2 text-xs text-gray-500">({tabCounts.room})</span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('report')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'report'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          객실신고
          {tabCounts.report > 0 && (
            <span className="ml-2 text-xs text-gray-500">({tabCounts.report})</span>
          )}
        </button>
      </div>

      {/* 문의 목록 */}
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : filteredInquiries.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          {activeTab === 'site' && '작성한 사이트문의가 없습니다.'}
          {activeTab === 'room' && '작성한 객실문의가 없습니다.'}
          {activeTab === 'report' && '작성한 객실신고가 없습니다.'}
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {paginatedInquiries.map((inquiry) => (
              <div
                key={inquiry.centerIdx || inquiry.id}
                className="border border-gray-200 rounded-xl p-5 hover:shadow-md transition-all"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-bold text-gray-900">{inquiry.title}</h3>
                      <span
                        className={`px-2 py-0.5 text-xs font-medium rounded ${getStatusColor(
                          inquiry.status
                        )}`}
                      >
                        {getStatusText(inquiry.status)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mb-3">
                      {formatDate(inquiry.createdAt || inquiry.date)}
                    </p>
                    <p className="text-sm text-gray-700 mb-3 line-clamp-2">{inquiry.content}</p>

                    {/* 답변 토글 버튼 */}
                    {inquiry.status === 2 && (
                      <button
                        onClick={() => toggleAnswer(inquiry.centerIdx || inquiry.id)}
                        className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium mb-2"
                      >
                        {expandedAnswers[inquiry.centerIdx || inquiry.id] ? (
                          <>
                            <ChevronUp className="w-4 h-4" />
                            답변 숨기기
                          </>
                        ) : (
                          <>
                            <ChevronDown className="w-4 h-4" />
                            답변 보기
                          </>
                        )}
                      </button>
                    )}

                    {/* 답변 내용 */}
                    {expandedAnswers[inquiry.centerIdx || inquiry.id] && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-2">
                        <p className="text-sm text-gray-700">
                          <span className="font-semibold text-blue-600">답변:</span>{' '}
                          {expandedAnswers[inquiry.centerIdx || inquiry.id]}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* 페이지네이션 */}
          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalElements={totalElements}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
            />
          )}
        </>
      )}
    </section>
  );
}

