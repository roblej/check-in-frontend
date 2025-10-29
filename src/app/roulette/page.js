"use client";

import { useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import RouletteGame from "@/components/roulette/RouletteGame";

const RoulettePage = () => {
  // 메타데이터 설정 (클라이언트 컴포넌트에서 사용)
  useEffect(() => {
    document.title = "룰렛 게임 | CheckIn";
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute("content", "룰렛을 돌려서 상금을 받아보세요!");
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <RouletteGame />
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default RoulettePage;

