'use client';

import { useCallback } from 'react';
import { recentHotelsAPI } from '@/lib/api/recentHotels';
import { useCustomerStore } from '@/stores/customerStore';
import { upsertRecentHotelToStorage } from '@/utils/recentHotelsStorage';

export const useRecordHotelView = () => {
  const inlogged = useCustomerStore((state) => state.inlogged);

  const recordHotelView = useCallback(
    async (hotel) => {
      if (!hotel?.contentId) {
        return;
      }

      if (inlogged) {
        try {
          await recentHotelsAPI.recordRecentHotel(hotel.contentId);
        } catch (error) {
          console.error('최근 본 호텔 기록 실패:', error);
        }
      } else {
        upsertRecentHotelToStorage(hotel);
      }
    },
    [inlogged],
  );

  return recordHotelView;
};

