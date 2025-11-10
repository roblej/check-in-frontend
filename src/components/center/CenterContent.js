"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Pagination from "@/components/Pagination";
import {
  HelpCircle,
  MessageCircle,
  Plus,
  ChevronDown,
  AlertTriangle,
  FileText,
} from "lucide-react";
import { centerAPI } from "@/lib/api/center";
import TermsContent from "./TermsContent";

const TAB_SLUG_MAP = {
  FAQ: "faq",
  문의: "inquiry",
  신고: "report",
  약관: "terms",
};

const SLUG_TAB_MAP = Object.entries(TAB_SLUG_MAP).reduce(
  (accumulator, [label, slug]) => {
    accumulator[slug] = label;
    return accumulator;
  },
  {}
);

const DEFAULT_TAB = "FAQ";

const CenterContent = ({
  initialFaqs,
  initialInquiries,
  initialSearchParams,
}) => {
  const router = useRouter();

  const normalizeTab = useCallback((value) => {
    if (typeof value !== "string") {
      return DEFAULT_TAB;
    }

    const lowerValue = value.toLowerCase();
    if (SLUG_TAB_MAP[lowerValue]) {
      return SLUG_TAB_MAP[lowerValue];
    }

    if (TAB_SLUG_MAP[value]) {
      return value;
    }

    return DEFAULT_TAB;
  }, []);

  const getTabSlug = useCallback((tab) => {
    return TAB_SLUG_MAP[tab] || TAB_SLUG_MAP[DEFAULT_TAB];
  }, []);

  const createQueryUrl = useCallback(
    (tab, page, query) => {
      const params = new URLSearchParams();
      params.set("tab", getTabSlug(tab));
      params.set("page", String(page));
      if (query) {
        params.set("query", query);
      }
      return `/center?${params.toString()}`;
    },
    [getTabSlug]
  );

  const parsePageIndex = useCallback((pageValue) => {
    const parsed = Number(pageValue);
    if (Number.isNaN(parsed) || parsed < 1) {
      return 0;
    }
    return parsed - 1;
  }, []);

  const initialQuery =
    typeof initialSearchParams?.query === "string"
      ? initialSearchParams.query
      : "";

  const [activeTab, setActiveTab] = useState(() =>
    normalizeTab(initialSearchParams?.tab)
  );
  const [faqs, setFaqs] = useState(initialFaqs || []);
  const [inquiries, setInquiries] = useState(initialInquiries || []);
  const [reports, setReports] = useState([]);

  useEffect(() => {
    setFaqs(initialFaqs || []);
  }, [initialFaqs]);

  const [searchTerm, setSearchTerm] = useState(initialQuery);
  const [activeSearchTerm, setActiveSearchTerm] = useState(initialQuery);
  const [categoryFilter, setCategoryFilter] = useState("전체");
  const [loading, setLoading] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState(null);
  const [expandedAnswer, setExpandedAnswer] = useState(null);
  const [answers, setAnswers] = useState({});

  const [currentPage, setCurrentPage] = useState(() =>
    parsePageIndex(initialSearchParams?.page)
  );
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [pageSize] = useState(5);

  useEffect(() => {
    const normalizedTab = normalizeTab(initialSearchParams?.tab);
    const parsedPage = parsePageIndex(initialSearchParams?.page);
    const nextQuery =
      normalizedTab === "약관"
        ? ""
        : typeof initialSearchParams?.query === "string"
        ? initialSearchParams.query
        : "";

    setActiveTab(normalizedTab);
    setCurrentPage(parsedPage);
    setSearchTerm(nextQuery);
    setActiveSearchTerm(nextQuery);
  }, [initialSearchParams, normalizeTab, parsePageIndex]);

  // FAQ 카테고리
  const faqCategories = [
    "전체",
    "예약/취소",
    "회원정보",
    "결제",
    "기술지원",
    "호텔정보",
  ];

  // 1대1 문의 카테고리
  const inquiryCategories = [
    "전체",
    "예약/취소",
    "회원정보",
    "결제",
    "기술지원",
    "호텔정보",
    "기타",
  ];

  // 신고 카테고리
  const reportCategories = [
    "전체",
    "부정확한 정보 제공",
    "서비스 불만",
    "청결 문제",
    "시설 문제",
    "기타",
  ];

  // FAQ 데이터 로드
  const fetchFaqs = useCallback(async () => {
    try {
      const data = await centerAPI.getFAQs({
        mainCategory: "FAQ",
        subCategory: categoryFilter === "전체" ? null : categoryFilter,
        title: activeSearchTerm || null,
        page: currentPage,
        size: pageSize,
      });

      const convertedFaqs = (data.content || []).map((item) => ({
        id: item.centerIdx,
        category: item.subCategory || "기타",
        question: item.title,
        answer: item.content,
        createdAt: item.createdAt
          ? new Date(item.createdAt).toLocaleString("ko-KR")
          : "",
      }));
      setFaqs(convertedFaqs);
      setTotalPages(data.totalPages || 0);
      setTotalElements(data.totalElements || 0);
    } catch (error) {
      alert("FAQ 정보를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.");
    }
  }, [activeSearchTerm, categoryFilter, currentPage, pageSize]);

  // 1대1 문의 데이터 로드 (사이트 문의만 - contentId가 null인 것만)
  // 백엔드에서 자동으로 contentId가 null인 것만 필터링해줌
  const fetchInquiries = useCallback(async () => {
    try {
      const data = await centerAPI.getInquiries({
        mainCategory: "문의",
        subCategory: categoryFilter === "전체" ? null : categoryFilter,
        title: activeSearchTerm || null,
        page: currentPage,
        size: pageSize,
      });

      const convertedInquiries = (data.content || []).map((item) => ({
        id: item.centerIdx,
        category: item.subCategory || "기타",
        title: item.title,
        content: item.content,
        status:
          item.status === 0 ? "대기" : item.status === 1 ? "처리중" : "완료",
        createdAt: item.createdAt
          ? new Date(item.createdAt).toLocaleString("ko-KR")
          : "",
      }));

      setInquiries(convertedInquiries);
      setTotalPages(data.totalPages || 0);
      setTotalElements(data.totalElements || 0);
    } catch (error) {
      alert("1대1 문의를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.");
    }
  }, [activeSearchTerm, categoryFilter, currentPage, pageSize]);

  // 신고 데이터 로드
  const fetchReports = useCallback(async () => {
    try {
      const data = await centerAPI.getInquiries({
        mainCategory: "신고",
        subCategory: categoryFilter === "전체" ? null : categoryFilter,
        title: activeSearchTerm || null,
        page: currentPage,
        size: pageSize,
      });

      const convertedReports = (data.content || []).map((item) => ({
        id: item.centerIdx,
        category: item.subCategory || "기타",
        title: item.title,
        content: item.content,
        contentId: item.contentId,
        status:
          item.status === 0 ? "대기" : item.status === 1 ? "처리중" : "완료",
        createdAt: item.createdAt
          ? new Date(item.createdAt).toLocaleString("ko-KR")
          : "",
      }));
      setReports(convertedReports);
      setTotalPages(data.totalPages || 0);
      setTotalElements(data.totalElements || 0);
    } catch (error) {
      alert("신고 내역을 불러오지 못했습니다. 잠시 후 다시 시도해주세요.");
    }
  }, [activeSearchTerm, categoryFilter, currentPage, pageSize]);

  // 탭 변경 시 데이터 로드
  useEffect(() => {
    if (activeTab === "약관") {
      setLoading(false);
      return;
    }

    setLoading(true);

    if (activeTab === "FAQ") {
      fetchFaqs().finally(() => setLoading(false));
      return;
    }

    if (activeTab === "문의") {
      fetchInquiries().finally(() => setLoading(false));
      return;
    }

    if (activeTab === "신고") {
      fetchReports().finally(() => setLoading(false));
    }
  }, [activeTab, fetchFaqs, fetchInquiries, fetchReports]);

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
          setAnswers((prev) => ({
            ...prev,
            [inquiryId]: answerData,
          }));
        } catch (error) {
          alert("답변을 불러오지 못했습니다. 잠시 후 다시 시도해주세요.");
          setAnswers((prev) => ({
            ...prev,
            [inquiryId]: null,
          }));
        }
      }
    }
  };

  // 검색 핸들러
  const handleSearch = () => {
    if (activeTab === "약관") {
      setSearchTerm("");
      setActiveSearchTerm("");
      router.push(createQueryUrl(activeTab, 1, ""));
      return;
    }

    const trimmedSearch = searchTerm.trim();
    setActiveSearchTerm(trimmedSearch);
    setCurrentPage(0);
    router.push(createQueryUrl(activeTab, 1, trimmedSearch));
  };

  // 페이지 변경 핸들러
  const handlePageChange = (page) => {
    if (activeTab === "약관") {
      return;
    }

    if (page < 0 || page === currentPage || page >= totalPages) {
      return;
    }

    setCurrentPage(page);
    router.push(createQueryUrl(activeTab, page + 1, activeSearchTerm));
  };

  // 필터 초기화
  const handleResetFilters = () => {
    setSearchTerm("");
    setActiveSearchTerm("");
    setCategoryFilter("전체");
    setCurrentPage(0);
    setExpandedFaq(null);
    setExpandedAnswer(null);
    setAnswers({});
    router.push(createQueryUrl(activeTab, 1, ""));
  };

  const handleTabChange = (tab) => {
    const normalizedTab = normalizeTab(tab);
    setActiveTab(normalizedTab);
    setSearchTerm("");
    setActiveSearchTerm("");
    setCategoryFilter("전체");
    setCurrentPage(0);
    setExpandedFaq(null);
    setExpandedAnswer(null);
    setAnswers({});
    router.push(createQueryUrl(normalizedTab, 1, ""));
  };

  const activeCategories =
    activeTab === "FAQ"
      ? faqCategories
      : activeTab === "문의"
      ? inquiryCategories
      : activeTab === "신고"
      ? reportCategories
      : ["전체"];

  return (
    <>
      {/* 탭 네비게이션 */}
      <div className="flex justify-center mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-1">
          <button
            type="button"
            onClick={() => handleTabChange("FAQ")}
            className={`px-6 py-3 rounded-md font-medium transition-colors ${
              activeTab === "FAQ"
                ? "bg-blue-600 text-white"
                : "text-gray-600 hover:text-blue-600"
            }`}
          >
            <HelpCircle className="w-5 h-5 inline mr-2" />
            FAQ
          </button>
          <button
            type="button"
            onClick={() => handleTabChange("문의")}
            className={`px-6 py-3 rounded-md font-medium transition-colors ${
              activeTab === "문의"
                ? "bg-blue-600 text-white"
                : "text-gray-600 hover:text-blue-600"
            }`}
          >
            <MessageCircle className="w-5 h-5 inline mr-2" />
            1대1 문의
          </button>
          <button
            type="button"
            onClick={() => handleTabChange("신고")}
            className={`px-6 py-3 rounded-md font-medium transition-colors ${
              activeTab === "신고"
                ? "bg-blue-600 text-white"
                : "text-gray-600 hover:text-blue-600"
            }`}
          >
            <AlertTriangle className="w-5 h-5 inline mr-2" />내 신고
          </button>
          <button
            type="button"
            onClick={() => handleTabChange("약관")}
            className={`px-6 py-3 rounded-md font-medium transition-colors ${
              activeTab === "약관"
                ? "bg-blue-600 text-white"
                : "text-gray-600 hover:text-blue-600"
            }`}
          >
            <FileText className="w-5 h-5 inline mr-2" />
            이용약관
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
                placeholder={
                  activeTab === "FAQ"
                    ? "질문을 검색하세요..."
                    : activeTab === "문의"
                    ? "문의 제목을 검색하세요..."
                    : activeTab === "신고"
                    ? "신고 제목을 검색하세요..."
                    : "이용약관 페이지에서는 검색이 제공되지 않습니다."
                }
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                disabled={activeTab === "약관"}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
            </div>
            <div>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                disabled={activeTab === "약관"}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                {activeCategories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              {activeTab !== "약관" &&
                (activeSearchTerm || categoryFilter !== "전체" ? (
                  <span>
                    검색 조건:
                    {activeSearchTerm && (
                      <span className="ml-1 px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                        &quot;{activeSearchTerm}&quot;
                      </span>
                    )}
                    {categoryFilter !== "전체" && (
                      <span className="ml-1 px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                        카테고리: {categoryFilter}
                      </span>
                    )}
                  </span>
                ) : (
                  <span>
                    전체{" "}
                    {activeTab === "FAQ"
                      ? "FAQ"
                      : activeTab === "문의"
                      ? "문의"
                      : "신고"}
                    를 표시하고 있습니다.
                  </span>
                ))}
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleSearch}
                disabled={activeTab === "약관"}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:hover:bg-gray-300 disabled:cursor-not-allowed"
              >
                검색
              </button>
              <button
                type="button"
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
        ) : activeTab === "FAQ" ? (
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
                          <span className="text-xs text-gray-500">
                            {faq.createdAt}
                          </span>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900">
                          {faq.question}
                        </h3>
                      </div>
                      <ChevronDown
                        className={`w-5 h-5 text-gray-400 transition-transform ${
                          expandedFaq === faq.id ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                    <div
                      className="overflow-hidden transition-all duration-500 ease-in-out"
                      style={{
                        maxHeight: expandedFaq === faq.id ? "500px" : "0px",
                        opacity: expandedFaq === faq.id ? 1 : 0,
                        transform:
                          expandedFaq === faq.id
                            ? "translateY(0)"
                            : "translateY(-10px)",
                      }}
                    >
                      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                        <p className="text-gray-700 leading-relaxed">
                          {faq.answer}
                        </p>
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
        ) : activeTab === "문의" ? (
          /* 1대1 문의 탭 */
          <div>
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  1대1 문의
                </h3>
                <button
                  onClick={() => router.push("/center/inquiry")}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />새 문의하기
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
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              inquiry.status === "완료"
                                ? "bg-blue-100 text-blue-800"
                                : inquiry.status === "처리중"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {inquiry.status}
                          </span>
                          <span className="text-xs text-gray-500">
                            {inquiry.createdAt}
                          </span>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          {inquiry.title}
                        </h3>
                        <p className="text-gray-600 line-clamp-2">
                          {inquiry.content}
                        </p>
                        {inquiry.status === "완료" && (
                          <button
                            onClick={() => toggleAnswer(inquiry.id)}
                            className="mt-3 flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium transition-colors"
                          >
                            <ChevronDown
                              className={`w-4 h-4 transition-transform ${
                                expandedAnswer === inquiry.id
                                  ? "rotate-180"
                                  : ""
                              }`}
                            />
                            {expandedAnswer === inquiry.id
                              ? "답변 숨기기"
                              : "답변 보기"}
                          </button>
                        )}
                      </div>
                    </div>
                    {/* 답변 영역 */}
                    {expandedAnswer === inquiry.id && (
                      <div
                        className="overflow-hidden transition-all duration-500 ease-in-out mt-4"
                        style={{
                          maxHeight:
                            expandedAnswer === inquiry.id ? "500px" : "0px",
                          opacity: expandedAnswer === inquiry.id ? 1 : 0,
                          transform:
                            expandedAnswer === inquiry.id
                              ? "translateY(0)"
                              : "translateY(-10px)",
                        }}
                      >
                        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                          {answers[inquiry.id] ? (
                            <div>
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-sm font-semibold text-blue-900">
                                  관리자 답변
                                </span>
                              </div>
                              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                                {answers[inquiry.id].content}
                              </p>
                            </div>
                          ) : answers[inquiry.id] === null ? (
                            <p className="text-gray-500">
                              답변을 찾을 수 없습니다.
                            </p>
                          ) : (
                            <div className="flex items-center justify-center py-4">
                              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                              <span className="ml-2 text-gray-600">
                                답변을 불러오는 중...
                              </span>
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
        ) : activeTab === "신고" ? (
          /* 신고 탭 */
          <div>
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">내 신고</h3>
              </div>
            </div>

            {reports.length === 0 ? (
              <div className="px-6 py-8 text-gray-400 text-center">
                조건에 맞는 신고가 없습니다.
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {reports.map((report) => (
                  <div key={report.id} className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                            {report.category}
                          </span>
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              report.status === "완료"
                                ? "bg-blue-100 text-blue-800"
                                : report.status === "처리중"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {report.status}
                          </span>
                          <span className="text-xs text-gray-500">
                            {report.createdAt}
                          </span>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          {report.title}
                        </h3>
                        <p className="text-gray-600 line-clamp-3">
                          {report.content}
                        </p>
                        {report.contentId && (
                          <button
                            onClick={() =>
                              router.push(`/hotel/${report.contentId}`)
                            }
                            className="mt-3 text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
                          >
                            신고한 호텔 보기 →
                          </button>
                        )}
                        {report.status === "완료" && (
                          <button
                            onClick={() => toggleAnswer(report.id)}
                            className="mt-3 flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium transition-colors"
                          >
                            <ChevronDown
                              className={`w-4 h-4 transition-transform ${
                                expandedAnswer === report.id ? "rotate-180" : ""
                              }`}
                            />
                            {expandedAnswer === report.id
                              ? "답변 숨기기"
                              : "답변 보기"}
                          </button>
                        )}
                      </div>
                    </div>
                    {/* 답변 영역 */}
                    {expandedAnswer === report.id && (
                      <div
                        className="overflow-hidden transition-all duration-500 ease-in-out mt-4"
                        style={{
                          maxHeight:
                            expandedAnswer === report.id ? "500px" : "0px",
                          opacity: expandedAnswer === report.id ? 1 : 0,
                          transform:
                            expandedAnswer === report.id
                              ? "translateY(0)"
                              : "translateY(-10px)",
                        }}
                      >
                        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                          {answers[report.id] ? (
                            <div>
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-sm font-semibold text-blue-900">
                                  관리자 답변
                                </span>
                              </div>
                              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                                {answers[report.id].content}
                              </p>
                            </div>
                          ) : answers[report.id] === null ? (
                            <p className="text-gray-500">
                              답변을 찾을 수 없습니다.
                            </p>
                          ) : (
                            <div className="flex items-center justify-center py-4">
                              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                              <span className="ml-2 text-gray-600">
                                답변을 불러오는 중...
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* 신고 페이징 */}
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
          <div className="p-6">
            <TermsContent />
          </div>
        )}
      </div>

      {/* 도움말 섹션 */}
      <div className="mt-8 bg-blue-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">
          도움이 필요하신가요?
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center">
            <HelpCircle className="w-6 h-6 text-blue-600 mr-3" />
            <div>
              <p className="font-medium text-blue-900">FAQ</p>
              <p className="text-sm text-blue-700">
                자주 묻는 질문을 확인해보세요
              </p>
            </div>
          </div>
          <div className="flex items-center">
            <MessageCircle className="w-6 h-6 text-blue-600 mr-3" />
            <div>
              <p className="font-medium text-blue-900">1대1 문의</p>
              <p className="text-sm text-blue-700">
                직접 문의하여 답변을 받아보세요
              </p>
            </div>
          </div>
          <div className="flex items-center">
            <AlertTriangle className="w-6 h-6 text-red-600 mr-3" />
            <div>
              <p className="font-medium text-red-900">신고</p>
              <p className="text-sm text-red-700">
                호텔 관련 문제를 신고하세요
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CenterContent;
