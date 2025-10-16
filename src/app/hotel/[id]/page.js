import { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import HotelDetail from "@/components/hotel/HotelDetail";
import StructuredData from "@/components/SEO/StructuredData";

// 동적 메타데이터 생성
export async function generateMetadata({ params }) {
  const hotelId = params.id;

  // 실제로는 API에서 호텔 정보를 가져와야 함
  const hotelData = {
    id: hotelId,
    name: "신라스테이 광화문",
    description: "광화문 중심부에 위치한 프리미엄 비즈니스 호텔입니다.",
    location: "서울 종로구",
    rating: 8.4,
    price: 180000,
    images: ["/hotel-main.jpg"],
  };

  return {
    title: `${hotelData.name} - 체크인`,
    description: hotelData.description,
    keywords: `호텔, ${hotelData.location}, 숙박, 예약, ${hotelData.name}`,
    openGraph: {
      title: `${hotelData.name} - 체크인`,
      description: hotelData.description,
      images: hotelData.images,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${hotelData.name} - 체크인`,
      description: hotelData.description,
      images: hotelData.images,
    },
    alternates: {
      canonical: `/hotel/${hotelId}`,
    },
  };
}

const HotelDetailPage = ({ params, searchParams }) => {
  const hotelId = params.id;

  // URL에서 검색 파라미터 가져오기
  const searchParamsData = {
    destination: searchParams?.destination || "",
    checkIn: searchParams?.checkIn || "",
    checkOut: searchParams?.checkOut || "",
    nights: parseInt(searchParams?.nights || "1"),
    adults: parseInt(searchParams?.adults || "2"),
  };

  // 임시 호텔 데이터 (실제로는 API에서 가져와야 함)
  const hotelData = {
    id: hotelId,
    name: "신라스테이 광화문",
    description: "광화문 중심부에 위치한 프리미엄 비즈니스 호텔입니다.",
    location: "서울 종로구 삼봉로 71",
    district: "종로구",
    rating: 8.4,
    reviewCount: 245,
    starRating: 4,
    checkInTime: "15:00",
    checkOutTime: "11:00",
    amenities: ["무료 WiFi", "수영장", "피트니스 센터", "레스토랑", "주차장"],
    images: ["/hotel-main.jpg"],
    rooms: [
      {
        name: "스탠다드 더블",
        description: "편안한 휴식을 위한 기본형 객실입니다.",
        price: 180000,
      },
    ],
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <StructuredData hotelData={hotelData} />
      <Header />
      <HotelDetail hotelId={hotelId} searchParams={searchParamsData} />
      <Footer />
    </div>
  );
};

export default HotelDetailPage;
