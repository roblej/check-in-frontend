import { Suspense } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ReservationClient from "./ReservationClient";

export default async function Page() {
  // URL 파라미터를 완전히 제거하고 세션 스토리지만 사용
  // 클라이언트에서 세션 스토리지에서 데이터를 읽어옴

  // 기본 초기 데이터 (클라이언트에서 세션 스토리지로 덮어씌움)
  const diningInfo = {
    diningIdx: null,
    contentId: null,
    diningName: "",
    hotelName: "",
    hotelAddress: "",
    diningDate: "",
    diningTime: "",
    guests: 2,
    basePrice: 0,
    imageUrl: "",
    openTime: "11:00:00",
    closeTime: "21:00:00",
    slotDuration: 60,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">다이닝 예약</h1>
        <Suspense fallback={<div className="flex items-center justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>}>
          <ReservationClient diningInfo={diningInfo} />
        </Suspense>
      </div>
      <Footer />
    </div>
  );
}

