"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { centerAPI } from "@/lib/api/center";
import { MessageCircle, Plus, Lock } from "lucide-react";

/**
 * 호텔 문의 컴포넌트
 * @param {Object} props
 * @param {string|number} props.contentId - 호텔 ID
 */
const HotelInquiries = ({ contentId }) => {
  const router = useRouter();
  const [inquiries, setInquiries] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const loadedContentIdRef = useRef(null);

  // 현재 로그인한 사용자 정보 가져오기
  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const response = await fetch('/api/customer/me', {
          credentials: 'include'
        });

        if (response.ok) {
          const userData = await response.json();
          setCurrentUser(userData);
        }
      } catch (error) {
        console.error('사용자 정보 가져오기 실패:', error);
      }
    };

    fetchUserInfo();
  }, []);

  // contentId가 변경되면 리셋
  useEffect(() => {
    if (contentId && contentId !== loadedContentIdRef.current) {
      setInquiries([]);
      setShowAll(false);
      loadedContentIdRef.current = null;
    }
  }, [contentId]);

  // 문의 데이터 로드
  useEffect(() => {
    const loadInquiries = async () => {
      if (!contentId) return;

      // 같은 contentId를 이미 로드했으면 다시 로드하지 않음
      if (contentId === loadedContentIdRef.current) {
        return;
      }

      setIsLoading(true);
      try {
        const data = await centerAPI.getInquiries({
          mainCategory: '문의',
          subCategory: null,
          title: null,
          contentId: contentId, // 호텔 문의는 contentId를 명시적으로 전달
          page: 0,
          size: 100, // 충분히 많은 데이터 가져오기
        });

        // hide 처리: hide가 1이면 작성자만 볼 수 있음
        const inquiriesList = (data.content || []).filter(item => {
          if (item.hide === true || item.hide === 1) {
            // 현재 사용자가 작성자인지 확인
            if (currentUser && currentUser.customerIdx === item.customerIdx) {
              return true; // 작성자는 볼 수 있음
            }
            return false; // 다른 사용자는 볼 수 없음
          }
          
          return true; // hide가 0이면 모두 볼 수 있음
        });

        setInquiries(inquiriesList);
        loadedContentIdRef.current = contentId;
      } catch (error) {
        console.error("문의 로드 실패:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadInquiries();
  }, [contentId, currentUser]);

  // 이름 마스킹 함수
  const maskUserName = (userName) => {
    if (!userName || userName === "익명") return "익명";
    const isKorean = /[가-힣]/.test(userName);
    if (isKorean) {
      return userName.charAt(0) + "***";
    } else {
      if (userName.length <= 3) {
        return userName.charAt(0) + "***";
      }
      return userName.substring(0, 3) + "***";
    }
  };

  // 안전한 배열 처리
  const safeInquiries = Array.isArray(inquiries) ? inquiries : [];

  // 표시할 문의 개수 결정
  const displayCount =
    safeInquiries.length <= 2
      ? safeInquiries.length
      : showAll
      ? safeInquiries.length
      : 3;
  const displayInquiries = safeInquiries.slice(0, displayCount);
  const hasMore = safeInquiries.length > 3;

  // 더보기 버튼 핸들러
  const handleShowMore = () => {
    setShowAll(true);
  };

  // 문의하기 버튼 핸들러
  const handleInquiryClick = () => {
    router.push(`/center/inquiry?contentId=${contentId}`);
  };

  return (
    <div className="bg-white rounded-lg p-6 mb-6 shadow" id="inquiries">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b">
        <h2 className="text-2xl font-bold">호텔 문의</h2>
        <button
          onClick={handleInquiryClick}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
        >
          <Plus className="w-5 h-5" />
          문의하기
        </button>
      </div>

      {/* 로딩 상태 */}
      {isLoading && (
        <div className="text-center py-8 text-gray-500">
          문의를 불러오는 중...
        </div>
      )}

      {/* 문의 목록 */}
      {!isLoading && (
        <div
          className={`space-y-6 ${safeInquiries.length <= 2 ? "space-y-4" : ""}`}
        >
          {displayInquiries.length > 0 ? (
            displayInquiries.map((inquiry) => {
              const isAuthor = currentUser && currentUser.customerIdx === inquiry.customerIdx;
              const isHidden = inquiry.hide === true || inquiry.hide === 1;

              return (
                <div
                  key={inquiry.centerIdx}
                  className="border-b pb-6 last:border-b-0 hover:bg-gray-50 p-4 rounded-lg transition-colors"
                >
                  {/* 문의 헤더 */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3 flex-1">
                      {/* 프로필 이미지 */}
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                        <MessageCircle className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-gray-900">
                            {isAuthor ? inquiry.customer?.nickname || '나' : maskUserName(inquiry.customer?.nickname || '익명')}
                          </span>
                          {isHidden && (
                            <span className="flex items-center gap-1 text-xs bg-gray-100 px-2 py-1 rounded text-gray-600">
                              <Lock className="w-3 h-3" />
                              비공개
                            </span>
                          )}
                          <span className="text-sm text-gray-500">
                            {inquiry.createdAt ? new Date(inquiry.createdAt).toLocaleDateString('ko-KR') : ''}
                          </span>
                          {inquiry.subCategory && (
                            <span className="text-xs bg-blue-100 px-2 py-1 rounded text-blue-600">
                              {inquiry.subCategory}
                            </span>
                          )}
                          <span className={`text-xs px-2 py-1 rounded ${
                            inquiry.status === 2 ? 'bg-green-100 text-green-800' :
                            inquiry.status === 1 ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {inquiry.status === 2 ? '완료' : inquiry.status === 1 ? '처리중' : '대기'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 문의 내용 */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      {inquiry.title}
                    </h3>
                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                      {inquiry.content}
                    </p>
                  </div>

                </div>
              );
            })
          ) : (
            <div className="text-center py-8 text-gray-500">
              아직 등록된 문의가 없습니다.
            </div>
          )}

          {/* 더보기 버튼 */}
          {hasMore && !showAll && (
            <div className="flex justify-center pt-4">
              <button
                onClick={handleShowMore}
                className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors"
                aria-label="더보기"
              >
                문의 더보기 ({safeInquiries.length - 3}개)
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default HotelInquiries;

