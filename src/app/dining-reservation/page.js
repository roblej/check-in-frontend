import { Suspense } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ReservationClient from "./ReservationClient";

export default async function Page({ searchParams }) {
  const sp = await searchParams;
  const getNum = (key, def) => {
    const v = sp?.get ? sp.get(key) : sp?.[key];
    const n = parseInt(v ?? "" + "");
    return Number.isNaN(n) ? def : n;
  };
  const getStr = (key, def) => {
    const v = sp?.get ? sp.get(key) : sp?.[key];
    return v ?? def;
  };

  const diningInfo = {
    diningIdx: getStr("diningIdx", null),
    contentId: getStr("contentId", null),
    diningName: getStr("diningName", ""),
    hotelName: getStr("hotelName", ""),
    hotelAddress: getStr("hotelAddress", ""),
    diningDate: getStr("diningDate", ""),
    diningTime: getStr("diningTime", ""),
    guests: getNum("guests", 2),
    basePrice: getNum("basePrice", 0),
    imageUrl: getStr("imageUrl", ""),
    openTime: getStr("openTime", "11:00:00"),
    closeTime: getStr("closeTime", "21:00:00"),
    slotDuration: getNum("slotDuration", 60),
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

