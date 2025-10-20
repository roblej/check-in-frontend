"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useState, useEffect } from "react";
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
  const api_url = "/api/hotel/popular";
  const [popularHotels, setPopularHotels] = useState([]);

  // 인기 호텔 데이터 가져오기
  useEffect(() => {
    axios.get(api_url).then(res => {
      console.log('PopularHotels API 응답:', res.data);
      setPopularHotels(res.data);
    }).catch(err => {
      console.error('PopularHotels API 에러:', err);
    });
  }, []);

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
