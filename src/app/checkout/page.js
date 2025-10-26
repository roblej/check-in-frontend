import { Suspense } from "react";
import CheckoutContent from "./CheckoutContent";

export const metadata = {
  title: "결제하기 | CheckIn",
  description: "호텔 예약 결제를 진행하세요",
};

const CheckoutPage = ({ searchParams }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-[720px] mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold mb-6">결제하기</h1>
        <Suspense fallback={
          <div className="p-4 bg-white rounded border">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        }>
          <CheckoutContent searchParams={searchParams} />
        </Suspense>
      </div>
    </div>
  );
};

export default CheckoutPage;