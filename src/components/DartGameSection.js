'use client';
import { useState } from 'react';
import DartGameModal from "@/components/DartGameModal";

export default function DartGameSection() {
  const [isDartModalOpen, setIsDartModalOpen] = useState(false);

  return (
    <>
      <section className="mb-16">
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            🎯 어디갈지 모르겠다면?
          </h2>
          <p className="text-gray-600 mb-6">다트를 던져서 랜덤한 여행지를 발견해보세요!</p>
          <button
            onClick={() => setIsDartModalOpen(true)}
            className="px-8 py-4 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white font-bold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
          >
            🎯 다트 던지고 여행지 찾기
          </button>
        </div>
      </section>

      <DartGameModal 
        isOpen={isDartModalOpen} 
        onClose={() => setIsDartModalOpen(false)} 
      />
    </>
  );
}
