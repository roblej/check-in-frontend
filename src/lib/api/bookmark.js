import axiosInstance from '@/lib/axios';

export const bookmarkAPI = {
  getHotelBookmarks: async () => {
    const response = await axiosInstance.get('/bookmark/hotelbookmark/list');
    return response.data;
  },

  deleteHotelBookmark: async (contentId) => {
    const response = await axiosInstance.get('/bookmark/hotelbookmark/delete', {
      params: { contentId },
    });
    return response.data;
  },

  getRoomBookmarks: async () => {
    const response = await axiosInstance.get('/bookmark/roombookmark/list');
    return response.data;
  },

  deleteRoomBookmark: async (roomIdx) => {
    const response = await axiosInstance.get('/bookmark/roombookmark/delete', {
      params: { roomIdx },
    });
    return response.data;
  },
};

