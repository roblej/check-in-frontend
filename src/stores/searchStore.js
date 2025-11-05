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
        diningDate: "",
      },

      // 검색 조건 업데이트
      updateSearchParams: (params) =>
        set((state) => ({
          searchParams: { ...state.searchParams, ...params },
        })),

      // URL 쿼리 파라미터로부터 검색 조건 업데이트
      updateFromUrlParams: (urlParams) => {
        const searchData = {
          destination: urlParams.get("destination") || "",
          checkIn: urlParams.get("checkIn") || "",
          checkOut: urlParams.get("checkOut") || "",
          diningDate: urlParams.get("diningDate") || "",
          adults: parseInt(urlParams.get("adults") || "2"),
          children: parseInt(urlParams.get("children") || "0"),
        };

        // nights 계산
        if (searchData.checkIn && searchData.checkOut) {
          const nights = Math.ceil(
            (new Date(searchData.checkOut) - new Date(searchData.checkIn)) /
              (1000 * 60 * 60 * 24)
          );
          searchData.nights = nights > 0 ? nights : 1;
        }

        set({ searchParams: searchData });
        return searchData;
      },

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
            diningDate: "",
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

      // 호텔 검색 결과
      searchResults: [],

      // 호텔 검색 결과 설정
      setSearchResults: (hotels) => set({ searchResults: hotels }),

      // 호텔 검색 결과 초기화
      clearSearchResults: () => set({ searchResults: [] }),
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
