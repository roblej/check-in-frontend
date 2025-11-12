'use client';

import { useMemo } from 'react';
import { Clock, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import RecentHotelCard from './RecentHotelCard';
import RecentHotelCardSkeleton from './RecentHotelCardSkeleton';

export default function RecentHotelsSection({
  hotels = [],
  isLoading = false,
  onSeeAll,
}) {
  const router = useRouter();

  const displayHotels = useMemo(
    () => (Array.isArray(hotels) ? hotels.slice(0, 3) : []),
    [hotels],
  );

  const handleSeeAll = () => {
    if (onSeeAll) {
      onSeeAll();
      return;
    }
    router.push('/mypage/recent-hotels');
  };

  return (
    <section className="flex h-full flex-col rounded-2xl border border-gray-200 bg-white p-6 shadow-lg">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-xl font-bold text-gray-900">
          <Clock className="h-6 w-6 text-blue-600" />
          최근 본 호텔
        </h2>
        <button
          type="button"
          onClick={handleSeeAll}
          className="flex items-center gap-1 text-sm font-medium text-blue-600 transition-colors hover:text-blue-700"
        >
          전체보기
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div className="flex flex-1 flex-col gap-3">
        {isLoading ? (
          <>
            <RecentHotelCardSkeleton />
            <RecentHotelCardSkeleton />
            <RecentHotelCardSkeleton />
          </>
        ) : displayHotels.length > 0 ? (
          displayHotels.map((hotel) => (
            <RecentHotelCard
              key={hotel?.contentId || hotel?.recentViewedIdx}
              hotel={hotel}
              onClick={(item) => router.push(`/hotel/${item.contentId}`)}
            />
          ))
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 bg-gray-50 py-10 text-sm text-gray-500">
            최근에 본 호텔이 없습니다.
            <span className="mt-1 text-xs text-gray-400">
              마음에 드는 호텔을 탐색해보세요!
            </span>
          </div>
        )}
      </div>
    </section>
  );
}

