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
    return {};
  } catch (error) {
    console.error("초기 데이터 로드 실패:", error);
    return {};
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
