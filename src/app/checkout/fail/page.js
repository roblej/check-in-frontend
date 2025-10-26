import { Suspense } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FailContent from "./FailContent";

const FailPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <Suspense fallback={
        <div className="max-w-2xl mx-auto px-4 py-20">
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <div className="text-gray-400 text-6xl mb-6">⏳</div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              로딩 중...
            </h1>
            <p className="text-gray-600">
              결제 정보를 불러오는 중입니다.
            </p>
          </div>
        </div>
      }>
        <FailContent />
      </Suspense>

      <Footer />
    </div>
  );
};

export default FailPage;