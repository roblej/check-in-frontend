'use client';

import { create } from 'zustand';

export const useRecentHotelsStore = create((set, get) => ({
  hotels: [],
  totalCount: 0,
  isLoading: false,
  error: null,
  lastLoadedPage: null,

  setHotels: (hotels) => set({ hotels }),
  appendHotels: (hotels) =>
    set((state) => ({
      hotels: mergeUniqueHotels(state.hotels, hotels),
    })),
  setTotalCount: (totalCount) => set({ totalCount }),
  setIsLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  setLastLoadedPage: (page) => set({ lastLoadedPage: page }),
  reset: () =>
    set({
      hotels: [],
      totalCount: 0,
      isLoading: false,
      error: null,
      lastLoadedPage: null,
    }),
}));

const mergeUniqueHotels = (existing, incoming) => {
  if (!Array.isArray(incoming) || incoming.length === 0) {
    return existing;
  }

  const map = new Map();
  existing.forEach((hotel) => {
    if (hotel?.contentId) {
      map.set(hotel.contentId, hotel);
    }
  });

  incoming.forEach((hotel) => {
    if (hotel?.contentId) {
      map.set(hotel.contentId, hotel);
    }
  });

  return Array.from(map.values()).sort((a, b) => {
    const aTime = new Date(a.viewedAt || 0).getTime();
    const bTime = new Date(b.viewedAt || 0).getTime();
    return bTime - aTime;
  });
};

