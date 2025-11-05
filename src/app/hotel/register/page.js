import { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import HotelRegistrationClient from "./HotelRegistrationClient";

export const metadata = {
  title: "호텔 등록 - 체크인",
  description: "새로운 호텔을 등록하고 운영을 시작하세요",
  keywords: "호텔 등록, 숙박업소 등록, 체크인",
};

// SSR로 초기 데이터 로드
async function getInitialData() {
  try {
    // 객실 타입 데이터
    const roomTypes = [
      { id: 1, name: "스탠다드", description: "기본적인 시설을 갖춘 객실" },
      { id: 2, name: "디럭스", description: "넓은 공간과 추가 편의시설" },
      { id: 3, name: "스위트", description: "침실과 거실이 분리된 고급 객실" },
      { id: 4, name: "패밀리", description: "가족 단위 고객을 위한 객실" }
    ];

    return {
      roomTypes
    };
  } catch (error) {
    console.error("초기 데이터 로드 실패:", error);
    return {
      roomTypes: []
    };
  }
}

const HotelRegistrationPage = async () => {
  const initialData = await getInitialData();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <HotelRegistrationClient initialData={initialData} />
      <Footer />
    </div>
  );
};

export default HotelRegistrationPage;
