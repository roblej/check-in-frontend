import axiosInstance from "@/lib/axios";

// 호텔 관련 API 함수들
export const hotelAPI = {
  // 호텔 목록 조회
  getHotels: async (params = {}) => {
    const response = await axiosInstance.get("/api/hotels", { params });
    return response.data;
  },

  // 호텔 상세 정보 조회
  getHotelDetail: async (contentId) => {
    const response = await axiosInstance.get(`/api/hotels/${contentId}`);
    return response.data;
  },

  // 호텔 객실 목록 조회
  getHotelRooms: async (contentId, params = {}) => {
    const response = await axiosInstance.get(`/api/hotels/${contentId}/rooms`, {
      params,
    });
    return response.data;
  },

  // 호텔 리뷰 조회
  getHotelReviews: async (contentId, params = {}) => {
    const response = await axiosInstance.get(
      `/api/hotels/${contentId}/reviews`,
      {
        params,
      }
    );
    return response.data;
  },

  // 호텔 검색
  searchHotels: async (searchParams) => {
    const response = await axiosInstance.post(
      "/api/hotels/search",
      searchParams
    );
    return response.data;
  },

  // 호텔 조회수 증가 (실시간)
  incrementHotelView: async (contentId) => {
    const response = await axiosInstance.post(`/api/hotels/${contentId}/view`);
    return response.data;
  },

  // 호텔 실시간 조회수 조회
  getHotelViews: async (contentId) => {
    const response = await axiosInstance.get(`/api/hotels/${contentId}/views`);
    return response.data;
  },

  // 여러 호텔의 실시간 조회수 조회
  getMultipleHotelViews: async (contentIds) => {
    const response = await axiosInstance.post("/api/hotels/views", {
      contentIds,
    });
    return response.data;
  },

  // 호텔 이미지 목록 조회
  getHotelImages: async (contentId) => {
    const response = await axiosInstance.get(`/api/hotels/${contentId}/images`);
    return response.data;
  },

  // 호텔 편의시설 및 위치 정보 조회
  getHotelFacilities: async (contentId) => {
    const response = await axiosInstance.get(
      `/api/hotels/${contentId}/facilities`
    );
    return response.data;
  },

  // 지역코드로 호텔 목록 조회
  getHotelsByAreaCode: async (areaCode, limit = 10) => {
    const response = await axiosInstance.get("/api/hotel/area", {
      params: { areaCode, limit },
    });
    return response.data;
  },
};
