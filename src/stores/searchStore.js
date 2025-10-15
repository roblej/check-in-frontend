import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useSearchStore = create(
  persist(
    (set, get) => ({
      // 검색 조건
      searchParams: {
        destination: "",
        checkIn: "",
        checkOut: "",
        nights: 1,
        adults: 2,
        children: 0,
      },

      // 검색 조건 업데이트
      updateSearchParams: (params) =>
        set((state) => ({
          searchParams: { ...state.searchParams, ...params },
        })),

      // 검색 조건 초기화
      resetSearchParams: () =>
        set({
          searchParams: {
            destination: "",
            checkIn: "",
            checkOut: "",
            nights: 1,
            adults: 2,
            children: 0,
          },
        }),

      // 최근 검색 기록
      recentSearches: [],

      // 최근 검색 추가
      addRecentSearch: (searchData) =>
        set((state) => ({
          recentSearches: [
            searchData,
            ...state.recentSearches
              .filter(
                (item) =>
                  item.destination !== searchData.destination ||
                  item.checkIn !== searchData.checkIn
              )
              .slice(0, 9), // 최대 10개 유지
          ],
        })),

      // 최근 검색 삭제
      removeRecentSearch: (index) =>
        set((state) => ({
          recentSearches: state.recentSearches.filter((_, i) => i !== index),
        })),

      // 최근 검색 전체 삭제
      clearRecentSearches: () => set({ recentSearches: [] }),
    }),
    {
      name: "search-storage",
      partialize: (state) => ({
        searchParams: state.searchParams,
        recentSearches: state.recentSearches,
      }),
    }
  )
);
