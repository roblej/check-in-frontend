'use client';

import { Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useRecentViewedHotels } from '@/hooks/useRecentViewedHotels';
import Pagination from '@/components/Pagination';
import {
  Building2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import RecentHotelListCard from '../components/recent/RecentHotelListCard';

const FETCH_SIZE = 100;
const PAGE_SIZE = 10;

const SectionHeader = ({ totalCount }) => (
  <div className="space-y-3">
    <Link
      href="/mypage"
      className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
    >
      <ChevronLeft className="h-4 w-4" />
      마이페이지로 돌아가기
    </Link>
    <div>
      <h1 className="text-3xl font-bold text-gray-900">최근 본 호텔</h1>
      <p className="mt-2 text-gray-500">
        관심 있게 확인했던 호텔들을 한 곳에서 다시 살펴보세요.
      </p>
      <p className="mt-1 text-sm text-gray-400">
        최근 확인한 순서로 정렬돼요. <br/><br/>
        총 <span className="font-semibold text-gray-600">{totalCount}</span>건
      </p>
    </div>
  </div>
);

const EmptyState = () => (
  <div className="rounded-3xl border border-dashed border-gray-300 bg-white py-20 px-6 text-center flex flex-col items-center gap-4">
    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 text-gray-400">
      <Building2 className="h-8 w-8" />
    </div>
    <div>
      <h3 className="text-lg font-semibold text-gray-900">최근 본 호텔이 없습니다</h3>
      <p className="mt-1 text-sm text-gray-500">
        궁금한 호텔을 둘러보면 이곳에서 빠르게 찾아볼 수 있어요.
      </p>
    </div>
    <Link
      href="/hotel-search"
      className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
    >
      호텔 둘러보기
      <ChevronRight className="h-4 w-4" />
    </Link>
  </div>
);

function RecentHotelsContent() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const searchParamsString = searchParams.toString();
  const {
    hotels,
    totalCount,
    isLoading,
    loadRecentHotels,
    deleteRecentHotel,
    clearRecentHotels,
    syncLocalCacheFromStore,
  } = useRecentViewedHotels();
  const [currentPage, setCurrentPage] = useState(0);

  const setPageAndUpdateQuery = useCallback(
    (page) => {
      setCurrentPage(page);
      const params = new URLSearchParams(searchParamsString);
      if (page > 0) {
        params.set('page', String(page + 1));
      } else {
        params.delete('page');
      }
      const query = params.toString();
      if (typeof window !== 'undefined') {
        const newUrl = query ? `${pathname}?${query}` : pathname;
        window.history.replaceState(null, '', newUrl);
      }
    },
    [pathname, searchParamsString],
  );

  useEffect(() => {
    loadRecentHotels({ page: 0, size: FETCH_SIZE, replace: true }).catch(() => undefined);
  }, [loadRecentHotels]);

  useEffect(() => {
    syncLocalCacheFromStore();
  }, [syncLocalCacheFromStore, hotels]);

  const totalElements = hotels.length;
  const totalPages = Math.max(1, Math.ceil(totalElements / PAGE_SIZE));

  useEffect(() => {
    if (totalElements === 0) {
      setPageAndUpdateQuery(0);
      return;
    }
    const maxPage = Math.max(0, Math.ceil(totalElements / PAGE_SIZE) - 1);
    if (currentPage > maxPage) {
      setPageAndUpdateQuery(maxPage);
    }
  }, [totalElements, currentPage, setPageAndUpdateQuery]);

  useEffect(() => {
    if (totalElements === 0) {
      return;
    }
    const pageParam = searchParams.get('page');
    if (!pageParam) {
      if (currentPage !== 0) {
        setCurrentPage(0);
      }
      return;
    }
    const parsed = parseInt(pageParam, 10);
    if (Number.isNaN(parsed) || parsed < 1) {
      setPageAndUpdateQuery(0);
      return;
    }
    const normalized = Math.min(totalPages - 1, parsed - 1);
    if (normalized !== currentPage) {
      setCurrentPage(normalized);
    }
  }, [searchParamsString, totalElements, totalPages, currentPage, setPageAndUpdateQuery, searchParams]);

  const paginatedHotels = useMemo(() => {
    const start = currentPage * PAGE_SIZE;
    const end = start + PAGE_SIZE;
    return hotels.slice(start, end);
  }, [hotels, currentPage]);

  const handleDelete = async (hotel) => {
    if (!hotel?.recentViewedIdx) {
      return;
    }
    const confirmDelete = window.confirm('이 기록을 삭제하시겠습니까?');
    if (!confirmDelete) return;

    await deleteRecentHotel({
      recentViewedIdx: hotel.recentViewedIdx,
      contentId: hotel.contentId,
    });
    syncLocalCacheFromStore();
  };

  const handleClearAll = async () => {
    const confirmDelete = window.confirm('최근 본 호텔 기록을 모두 삭제하시겠습니까?');
    if (!confirmDelete) return;
    await clearRecentHotels();
  };

  return (
    <main className="bg-gray-50 min-h-screen">
      <div className="mx-auto w-full max-w-5xl px-4 py-12 space-y-4">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <SectionHeader totalCount={totalElements} />
          {totalElements > 0 && (
            <button
              type="button"
              onClick={handleClearAll}
              className="self-start rounded-2xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 transition-colors hover:bg-red-100 md:self-auto"
            >
              전체 삭제
            </button>
          )}
        </div>

        {isLoading ? (
          <div className="rounded-3xl border border-gray-200 bg-white py-16 text-center text-gray-500">
            최근 본 호텔을 불러오는 중입니다...
          </div>
        ) : totalElements === 0 ? (
          <EmptyState />
        ) : (
          <>
            <div className="space-y-4 pt-2">
              {paginatedHotels.map((hotel) => (
                <RecentHotelListCard
                  key={hotel?.recentViewedIdx || hotel?.contentId}
                  item={hotel}
                  onDelete={handleDelete}
                />
              ))}
            </div>
            <div className="flex justify-center pt-6">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalElements={totalElements}
              pageSize={PAGE_SIZE}
              onPageChange={(page) => {
                if (page < 0 || page >= totalPages) return;
                setPageAndUpdateQuery(page);
              }}
            />
            </div>
          </>
        )}
      </div>
    </main>
  );
}

export default function RecentHotelsPage() {
  return (
    <>
      <Header />
      <Suspense
        fallback={
          <main className="bg-gray-50 min-h-screen">
            <div className="mx-auto w-full max-w-5xl px-4 py-20 text-center text-gray-500">
              최근 본 호텔을 불러오는 중입니다...
            </div>
          </main>
        }
      >
        <RecentHotelsContent />
      </Suspense>
      <Footer />
    </>
  );
}
