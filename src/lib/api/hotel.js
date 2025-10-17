import axiosInstance from "@/lib/axios";

// 호텔 관련 API 함수들
export const hotelAPI = {
  // 호텔 목록 조회
  getHotels: async (params = {}) => {
    const response = await axiosInstance.get("/hotels", { params });
    return response.data;
  },

  // 호텔 상세 정보 조회
  getHotelDetail: async (contentId ) => {
    const response = await axiosInstance.get(`/hotels/${contentId }`);
    return response.data;
  },

  // 호텔 객실 목록 조회
  getHotelRooms: async (contentId , params = {}) => {
    const response = await axiosInstance.get(`/hotels/${contentId }/rooms`, {
      params,
    });
    return response.data;
  },

  // 호텔 리뷰 조회
  getHotelReviews: async (contentId , params = {}) => {
    const response = await axiosInstance.get(`/hotels/${contentId }/reviews`, {
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
  incrementHotelView: async (contentId ) => {
    const response = await axiosInstance.post(`/hotels/${contentId }/view`);
    return response.data;
  },

  // 호텔 실시간 조회수 조회
  getHotelViews: async (contentId ) => {
    const response = await axiosInstance.get(`/hotels/${contentId }/views`);
    return response.data;
  },

  // 여러 호텔의 실시간 조회수 조회
  getMultipleHotelViews: async (contentIds) => {
    const response = await axiosInstance.post("/hotels/views", { contentIds });
    return response.data;
  },
};
