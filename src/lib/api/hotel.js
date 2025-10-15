import axiosInstance from "@/lib/axios";

// 호텔 관련 API 함수들
export const hotelAPI = {
  // 호텔 목록 조회
  getHotels: async (params = {}) => {
    const response = await axiosInstance.get("/hotels", { params });
    return response.data;
  },

  // 호텔 상세 정보 조회
  getHotelDetail: async (hotelId) => {
    const response = await axiosInstance.get(`/hotels/${hotelId}`);
    return response.data;
  },

  // 호텔 객실 목록 조회
  getHotelRooms: async (hotelId, params = {}) => {
    const response = await axiosInstance.get(`/hotels/${hotelId}/rooms`, {
      params,
    });
    return response.data;
  },

  // 호텔 리뷰 조회
  getHotelReviews: async (hotelId, params = {}) => {
    const response = await axiosInstance.get(`/hotels/${hotelId}/reviews`, {
      params,
    });
    return response.data;
  },

  // 호텔 검색
  searchHotels: async (searchParams) => {
    const response = await axiosInstance.post("/hotels/search", searchParams);
    return response.data;
  },

  // 호텔 조회수 증가 (실시간)
  incrementHotelView: async (hotelId) => {
    const response = await axiosInstance.post(`/hotels/${hotelId}/view`);
    return response.data;
  },

  // 호텔 실시간 조회수 조회
  getHotelViews: async (hotelId) => {
    const response = await axiosInstance.get(`/hotels/${hotelId}/views`);
    return response.data;
  },

  // 여러 호텔의 실시간 조회수 조회
  getMultipleHotelViews: async (hotelIds) => {
    const response = await axiosInstance.post("/hotels/views", { hotelIds });
    return response.data;
  },
};
