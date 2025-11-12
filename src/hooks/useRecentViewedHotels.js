'use client';

import { useCallback, useMemo } from 'react';
import { recentHotelsAPI } from '@/lib/api/recentHotels';
import { useRecentHotelsStore } from '@/stores/recentHotelsStore';
import { useCustomerStore } from '@/stores/customerStore';
import {
  clearRecentHotelsStorage,
  loadRecentHotelsFromStorage,
  removeRecentHotelFromStorage,
  saveRecentHotelsToStorage,
} from '@/utils/recentHotelsStorage';

const DEFAULT_PAGE_SIZE = 20;

const normalizeHotel = (item) => ({
  recentViewedIdx: item?.recentViewedIdx ?? null,
  contentId: item?.contentId ?? '',
  hotelName: item?.hotelName ?? item?.name ?? '',
  address: item?.address ?? item?.location ?? '',
  imageUrl: item?.imageUrl ?? item?.thumbnail ?? '',
  minPrice: item?.minPrice ?? item?.price ?? null,
  viewedAt: item?.viewedAt ?? new Date().toISOString(),
});

export const useRecentViewedHotels = () => {
  const inlogged = useCustomerStore((state) => state.inlogged);

  const {
    hotels,
    totalCount,
    isLoading,
    error,
    lastLoadedPage,
    setHotels,
    appendHotels,
    setTotalCount,
    setIsLoading,
    setError,
    setLastLoadedPage,
    reset,
  } = useRecentHotelsStore();

  const loadFromServer = useCallback(
    async ({ page = 0, size = DEFAULT_PAGE_SIZE, replace = false } = {}) => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await recentHotelsAPI.getRecentHotels({ page, size });
        const items = Array.isArray(response?.data) ? response.data : [];
        const normalized = items.map(normalizeHotel);

        if (replace || page === 0) {
          setHotels(normalized);
        } else {
          appendHotels(normalized);
        }

        setTotalCount(response?.totalElements ?? normalized.length);
        setLastLoadedPage(response?.page ?? page);

        return normalized;
      } catch (err) {
        console.error('최근 본 호텔 조회 실패:', err);
        setError(err);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [appendHotels, setError, setHotels, setIsLoading, setLastLoadedPage, setTotalCount],
  );

  const loadFromStorage = useCallback(
    ({ page = 0, size = DEFAULT_PAGE_SIZE, replace = false, limit } = {}) => {
      const all = loadRecentHotelsFromStorage();
      const sorted = all.sort((a, b) => {
        const aTime = new Date(a.viewedAt || 0).getTime();
        const bTime = new Date(b.viewedAt || 0).getTime();
        return bTime - aTime;
      });

      let paginated = sorted;
      if (limit) {
        paginated = sorted.slice(0, limit);
      } else {
        const start = page * size;
        const end = start + size;
        paginated = sorted.slice(start, end);
      }

      const normalized = paginated.map(normalizeHotel);

      if (replace || page === 0) {
        setHotels(normalized);
      } else {
        appendHotels(normalized);
      }

      setTotalCount(sorted.length);
      setLastLoadedPage(page);

      return normalized;
    },
    [appendHotels, setHotels, setLastLoadedPage, setTotalCount],
  );

  const loadRecentHotels = useCallback(
    async ({ page = 0, size = DEFAULT_PAGE_SIZE, replace = false, limit } = {}) => {
      setIsLoading(true);
      try {
        if (inlogged) {
          return await loadFromServer({ page, size: limit ?? size, replace });
        }
        return loadFromStorage({ page, size, replace, limit });
      } finally {
        if (!inlogged) {
          setIsLoading(false);
        }
      }
    },
    [inlogged, loadFromServer, loadFromStorage, setIsLoading],
  );

  const reloadRecentHotels = useCallback(async () => {
    reset();
    return loadRecentHotels({ page: 0, replace: true });
  }, [loadRecentHotels, reset]);

  const deleteRecentHotel = useCallback(
    async ({ recentViewedIdx, contentId }) => {
      if (inlogged) {
        if (!recentViewedIdx) {
          console.warn('recentViewedIdx가 없어 서버 삭제를 수행할 수 없습니다.');
          return;
        }
        try {
          await recentHotelsAPI.deleteRecentHotel(recentViewedIdx);
          const next = hotels.filter((hotel) => hotel.recentViewedIdx !== recentViewedIdx);
          setHotels(next);
          setTotalCount(Math.max(0, totalCount - 1));
        } catch (err) {
          console.error('최근 본 호텔 삭제 실패:', err);
          throw err;
        }
      } else {
        if (!contentId) {
          return;
        }
        removeRecentHotelFromStorage(contentId);
        const nextList = hotels.filter((hotel) => hotel.contentId !== contentId);
        setHotels(nextList);
        setTotalCount(nextList.length);
      }
    },
    [hotels, inlogged, setHotels, setTotalCount, totalCount],
  );

  const clearRecentHotels = useCallback(async () => {
    if (inlogged) {
      try {
        await recentHotelsAPI.clearRecentHotels();
      } catch (err) {
        console.error('최근 본 호텔 전체 삭제 실패:', err);
        throw err;
      }
    } else {
      clearRecentHotelsStorage();
    }
    reset();
  }, [inlogged, reset]);

  const syncLocalCacheFromStore = useCallback(() => {
    if (inlogged) {
      return;
    }
    saveRecentHotelsToStorage(hotels);
  }, [hotels, inlogged]);

  const hasMore = useMemo(() => {
    if (inlogged) {
      return hotels.length < totalCount;
    }
    return false;
  }, [hotels.length, inlogged, totalCount]);

  return {
    hotels,
    totalCount,
    isLoading,
    error,
    lastLoadedPage,
    hasMore,
    loadRecentHotels,
    reloadRecentHotels,
    deleteRecentHotel,
    clearRecentHotels,
    syncLocalCacheFromStore,
  };
};

