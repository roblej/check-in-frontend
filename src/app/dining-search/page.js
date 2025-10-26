import { Suspense } from "react";
import Header from "@/components/Header";
import DiningSearchClient from "./DiningSearchClient";

export const metadata = {
  title: "다이닝 검색 | CheckIn",
  description: "호텔 다이닝을 검색하고 예약하세요",
};

const DiningSearchPage = ({ searchParams }) => {
  // URL 파라미터 추출
  const destination = searchParams?.destination || "";
  const diningDate = searchParams?.diningDate || "";
  const mealType = searchParams?.mealType || "";
  const adults = searchParams?.adults || "";

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <Suspense fallback={
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      }>
        <DiningSearchClient 
          destination={destination}
          diningDate={diningDate}
          mealType={mealType}
          adults={adults}
        />
      </Suspense>
    </div>
  );
};

export default DiningSearchPage;