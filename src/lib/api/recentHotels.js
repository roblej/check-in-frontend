'use client';

import axiosInstance from '@/lib/axios';

export const recentHotelsAPI = {
  async recordRecentHotel(contentId) {
    const { data } = await axiosInstance.post('/recentHotels', { contentId });
    return data;
  },

  async getRecentHotels({ page = 0, size = 20 } = {}) {
    const { data } = await axiosInstance.get('/recentHotels', {
      params: { page, size },
    });
    return data;
  },

  async getRecentHotelsCount() {
    const { data } = await axiosInstance.get('/recentHotels/count');
    return data;
  },

  async deleteRecentHotel(recentViewedIdx) {
    const { data } = await axiosInstance.delete(`/recentHotels/${recentViewedIdx}`);
    return data;
  },

  async clearRecentHotels() {
    const { data } = await axiosInstance.delete('/recentHotels');
    return data;
  },
};

