'use client';
import { useRouter } from 'next/navigation';

export default function DartGameSection() {
  const router = useRouter();

  const handleNavigate = () => {
    router.push('/dart-game');
  };

  return (
    <section className="mb-16">
      <div className="text-center mb-8">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
          🎯 어디갈지 모르겠다면?
        </h2>
        <p className="text-gray-600 mb-6">다트를 던져서 랜덤한 여행지를 발견해보세요!</p>
        <button
          onClick={handleNavigate}
          className="px-8 py-4 bg-[#3B82F6] hover:bg-blue-600 text-white font-bold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
        >
          🎯 다트 던지고 여행지 찾기
        </button>
      </div>
    </section>
  );
}
