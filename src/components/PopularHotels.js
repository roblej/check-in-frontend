"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import axiosInstance from "@/lib/axios";
import { useState, useEffect, useRef } from "react";
import { useCustomerStore } from "@/stores/customerStore";
/**
 * 인기 호텔 섹션 컴포넌트
 *
 * 기능:
 * - 인기 호텔 목록 표시
 * - 호텔 클릭 시 상세 페이지로 이동
 * - 할인율, 평점, 리뷰 수 표시
 */
// 인기 호텔 컴포넌트
const PopularHotels = () => {
  const router = useRouter();
  const inlogged = useCustomerStore((state) => state.inlogged);
  const [popularHotels, setPopularHotels] = useState([]);
  const [bookmarkedHotels, setBookmarkedHotels] = useState(new Set());
  const didFetch = useRef(false);
  const hotelsave_url = "/bookmark/hotelbookmark/save";
  const hotelbookmarklist_url = "/bookmark/hotelbookmark/list";
  const hotelbookmarkdelete_url = "/bookmark/hotelbookmark/delete";
  
  // 인기 호텔 데이터 가져오기
  useEffect(() => {
    if (didFetch.current) return;
    didFetch.current = true;

    axiosInstance.get('/hotel/popular').then(res => {
      console.log('PopularHotels API 응답:', res.data);
      setPopularHotels(res.data);
    }).catch(err => {
      console.error('PopularHotels API 에러:', err.response?.data?.message || err.message);
    });
  }, []);

  // 로그인 상태일 때 북마크 목록 가져오기
  useEffect(() => {
    if (inlogged) {
      axiosInstance.get(hotelbookmarklist_url).then(res => {
        console.log('북마크 목록 API 응답:', res.data);
        // 북마크 목록에서 contentId 추출하여 Set에 추가
        if (res.data && Array.isArray(res.data)) {
          const bookmarkContentIds = res.data.map(bookmark => bookmark.contentId || bookmark);
          setBookmarkedHotels(new Set(bookmarkContentIds));
        }
      }).catch(err => {
        console.error('북마크 목록 API 에러:', err.response?.data?.message || err.message);
      });
    } else {
      // 로그아웃 상태일 때: 북마크 목록 초기화
      setBookmarkedHotels(new Set());
    }
  }, [inlogged]);

  /**
   * 호텔 카드 클릭 핸들러
   */
  const handleHotelClick = (contentId) => {
    console.log('PopularHotels 호텔 클릭:', {
      contentId,
      targetUrl: `/hotel/${contentId}`
    });
    router.push(`/hotel/${contentId}`);
  };

  return (
    <section className="mb-16">
      <div className="text-center mb-8">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
          가장 인기있는 숙소
        </h2>
        <p className="text-gray-600">많은 고객들이 선택한 베스트 호텔</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {popularHotels.map((hotel, index) => (
          <div
            key={hotel.contentId}
            className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 overflow-hidden group cursor-pointer"
            onClick={() => handleHotelClick(hotel.contentId)}
          >
            {/* 이미지 */}
            <div className="relative h-48 overflow-hidden">
              <Image
                src={hotel.imageUrl}
                alt={hotel.title}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                priority={index === 0}
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
              {/* 하트 버튼 */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  const isBookmarked = bookmarkedHotels.has(hotel.contentId);
                  
                  if (isBookmarked) {
                    // 꽉 찬 하트일 때: 북마크 삭제
                    axiosInstance.get(hotelbookmarkdelete_url, {params: {contentId: hotel.contentId}}).then(res => {
                      console.log('북마크 삭제:', res.data);
                      // 삭제 성공 시 상태 업데이트
                      if (res.data && res.data.includes('success')) {
                        setBookmarkedHotels(prev => {
                          const newSet = new Set(prev);
                          newSet.delete(hotel.contentId);
                          return newSet;
                        });
                      }
                    }).catch(err => {
                      console.error('북마크 삭제 에러:', err.response?.data?.message || err.message);
                    });
                  } else {
                    // 빈 하트일 때: 북마크 추가
                    axiosInstance.get(hotelsave_url, {params: {contentId: hotel.contentId}}).then(res => {
                      console.log('찜하기 클릭:', res.data);
                      // res.data에 success가 포함되어 있으면 찜하기 상태 업데이트
                      if (res.data && res.data.includes('success')) {
                        setBookmarkedHotels(prev => {
                          const newSet = new Set(prev);
                          newSet.add(hotel.contentId);
                          return newSet;
                        });
                      }
                    }).catch(err => {
                      console.error('찜하기 기능 에러:', err.response?.data?.message || err.message);
                    });
                  }
                }}
                className="absolute top-2 right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md hover:shadow-lg transition-all duration-200 hover:scale-110 z-10"
                aria-label="찜하기"
              >
                {bookmarkedHotels.has(hotel.contentId) ? (
                  // 꽉 찬 하트
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="#FF0000"
                    stroke="#FF0000"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                  </svg>
                ) : (
                  // 빈 하트
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#FF0000"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                  </svg>
                )}
              </button>
            </div>

            {/* 내용 */}
            <div className="p-6">
              <div className="mb-3">
                <h3 className="text-lg font-bold text-gray-900 mb-1">
                  {hotel.title}
                </h3>
                <p className="text-sm text-gray-600">{hotel.adress}</p>
              </div>

              {/* 평점 및 리뷰 */}
              <div className="flex items-center mb-4">
                <div className="flex items-center">
                  <span className="text-yellow-500 text-sm">⭐</span>
                  <span className="text-sm font-medium text-gray-900 ml-1">
                    4.5
                  </span>
                </div>
                <span className="text-sm text-gray-500 ml-2">
                  (리뷰 준비중)
                </span>
              </div>

              {/* 가격 */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">1박 기준</p>
                  {hotel.minPrice && hotel.maxPrice ? (
                    hotel.minPrice === hotel.maxPrice ? (
                      <p className="text-xl font-bold text-[#3B82F6]">
                        {new Intl.NumberFormat("ko-KR").format(hotel.minPrice)}원
                      </p>
                    ) : (
                      <p className="text-xl font-bold text-[#3B82F6]">
                        {new Intl.NumberFormat("ko-KR").format(hotel.minPrice)}원 ~
                      </p>
                    )
                  ) : hotel.minPrice ? (
                    <p className="text-xl font-bold text-[#3B82F6]">
                      {new Intl.NumberFormat("ko-KR").format(hotel.minPrice)}원 ~
                    </p>
                  ) : (
                    <p className="text-xl font-bold text-[#3B82F6]">
                      가격 문의
                    </p>
                  )}
                </div>
                <button className="bg-[#3B82F6] hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                  예약하기
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default PopularHotels;
