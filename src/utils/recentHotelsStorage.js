'use client';

const STORAGE_KEY = 'recentHotels';
const MAX_ITEMS = 50;

export const loadRecentHotelsFromStorage = () => {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .filter((item) => item && item.contentId)
      .sort((a, b) => {
        const aTime = new Date(a.viewedAt || 0).getTime();
        const bTime = new Date(b.viewedAt || 0).getTime();
        return bTime - aTime;
      });
  } catch (error) {
    console.error('최근 본 호텔 로컬 스토리지 로드 실패:', error);
    return [];
  }
};

export const saveRecentHotelsToStorage = (items) => {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    const normalized = Array.isArray(items) ? items.slice(0, MAX_ITEMS) : [];
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
  } catch (error) {
    console.error('최근 본 호텔 로컬 스토리지 저장 실패:', error);
  }
};

export const upsertRecentHotelToStorage = (hotel) => {
  if (typeof window === 'undefined' || !hotel?.contentId) {
    return;
  }

  const now = new Date().toISOString();

  const current = loadRecentHotelsFromStorage().filter(
    (item) => item.contentId !== hotel.contentId,
  );

  const newItem = {
    recentViewedIdx: hotel.recentViewedIdx ?? null,
    contentId: hotel.contentId,
    hotelName: hotel.hotelName ?? hotel.name ?? '',
    address: hotel.address ?? hotel.location ?? '',
    imageUrl: hotel.imageUrl ?? hotel.thumbnail ?? '',
    minPrice: hotel.minPrice ?? hotel.price ?? null,
    viewedAt: hotel.viewedAt ?? now,
  };

  const next = [newItem, ...current].slice(0, MAX_ITEMS);
  saveRecentHotelsToStorage(next);
};

export const removeRecentHotelFromStorage = (contentId) => {
  if (typeof window === 'undefined') {
    return;
  }

  const current = loadRecentHotelsFromStorage().filter(
    (item) => item.contentId !== contentId,
  );
  saveRecentHotelsToStorage(current);
};

export const clearRecentHotelsStorage = () => {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.removeItem(STORAGE_KEY);
};

