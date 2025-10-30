"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Header from "@/components/Header";
import DiningSearchClient from "./DiningSearchClient";
import { Suspense } from "react";

const DiningSearchPageContent = () => {
  const searchParams = useSearchParams();
  const [destination, setDestination] = useState(searchParams.get("destination") || "");
  const [diningDate, setDiningDate] = useState(searchParams.get("diningDate") || "");
  const [mealType, setMealType] = useState(searchParams.get("mealType") || "");
  const [adults, setAdults] = useState(searchParams.get("adults") || "");

  useEffect(() => {
    // 파라미터 초기화
    setDestination(searchParams.get("destination") || "");
    setDiningDate(searchParams.get("diningDate") || "");
    setMealType(searchParams.get("mealType") || "");
    setAdults(searchParams.get("adults") || "");
  }, [searchParams]);

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

const DiningSearchPage = () => {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    }>
      <DiningSearchPageContent />
    </Suspense>
  );
};

export default DiningSearchPage;