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
const PopularHotels = () => {
  const router = useRouter();
  const api_url = "/api/hotel/popular";
  const [popularHotels, setPopularHotels] = useState([]);
  useEffect(() => {
    axios.get(api_url).then(res => {
      console.log(res.data);
      setPopularHotels(res.data);
    });
  }, []);
  // 인기 호텔 데이터
  const popularHotels1 = [
    {
      id: 1,
      name: "그랜드 하얏트 서울",
      location: "서울 강남구",
      price: 450000,
      rating: 4.8,
      reviews: 1247,
      image:
        "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=300&fit=crop",
      discount: 15,
    },
    {
      id: 2,
      name: "롯데호텔 부산",
      location: "부산 해운대구",
      price: 280000,
      rating: 4.6,
      reviews: 892,
      image:
        "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400&h=300&fit=crop",
      discount: 20,
    },
    {
      id: 3,
      name: "신라호텔 제주",
      location: "제주 제주시",
      price: 380000,
      rating: 4.9,
      reviews: 1563,
      image:
        "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400&h=300&fit=crop",
      discount: 10,
    },
    {
      id: 4,
      name: "웨스틴 조선 서울",
      location: "서울 중구",
      price: 520000,
      rating: 4.7,
      reviews: 743,
      image:
        "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop",
      discount: 12,
    },
    {
      id: 5,
      name: "파크 하얏트 서울",
      location: "서울 용산구",
      price: 420000,
      rating: 4.5,
      reviews: 634,
      image:
        "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=400&h=300&fit=crop",
      discount: 18,
    },
    {
      id: 6,
      name: "켄싱턴호텔 여수",
      location: "전남 여수시",
      price: 320000,
      rating: 4.4,
      reviews: 456,
      image:
        "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop",
      discount: 25,
    },
  ];

  /**
   * 호텔 카드 클릭 핸들러
   */
  const handleHotelClick = (contentId) => {
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
        {popularHotels.map((hotel) => (
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
                    {hotel.starRating}
                  </span>
                </div>
                <span className="text-sm text-gray-500 ml-2">
                  ({hotel.reviewCount}개 리뷰)
                </span>
              </div>

              {/* 가격 */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">1박 기준</p>
                  <p className="text-xl font-bold text-[#3B82F6]">
                    {new Intl.NumberFormat("ko-KR").format(hotel.originalPrice)}원
                  </p>
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
