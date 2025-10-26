"use client";

import { Suspense } from "react";
import Header from "@/components/Header";
import DiningSearchClient from "./DiningSearchClient";

const DiningSearchPageContent = ({ searchParams }) => {
  // URL 파라미터 추출
  const destination = searchParams?.destination || "";
  const diningDate = searchParams?.diningDate || "";
  const mealType = searchParams?.mealType || "";
  const adults = searchParams?.adults || "";

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <DiningSearchClient 
        destination={destination}
        diningDate={diningDate}
        mealType={mealType}
        adults={adults}
      />
    </div>
  );
};

const DiningSearchPage = ({ searchParams }) => {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    }>
      <DiningSearchPageContent searchParams={searchParams} />
    </Suspense>
  );
};

export default DiningSearchPage;