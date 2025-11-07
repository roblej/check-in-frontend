import axiosInstance from "@/lib/axios";

// 호텔 관련 API 함수들
export const hotelAPI = {
  // 호텔 목록 조회
  getHotels: async (params = {}) => {
    const response = await axiosInstance.get("/hotels", { params });
    return response.data;
  },

  // 호텔 상세 정보 조회
  getHotelDetail: async (contentId, config = {}) => {
    const response = await axiosInstance.get(`/hotels/${contentId}`, config);
    return response.data;
  },

  // 호텔 객실 목록 조회 (날짜 파라미터 포함 지원)
  getHotelRooms: async (contentId, config = {}) => {
    const { params = {}, ...restConfig } = config;
    const response = await axiosInstance.get(`/hotels/${contentId}/rooms`, {
      params: {
        ...params,
        checkinDate: params.checkinDate,
        checkoutDate: params.checkoutDate,
      },
      ...restConfig,
    });
    return response.data;
  },

  // 호텔 객실 예약 가능성 조회 (날짜 기반)
  getRoomAvailability: async (contentId, checkinDate, checkoutDate) => {
    const response = await axiosInstance.get(
      `/hotels/${contentId}/rooms/availability`,
      {
        params: {
          checkinDate,
          checkoutDate,
        },
      }
    );
    return response.data;
  },

  // 호텔 리뷰 조회
  getHotelReviews: async (contentId, config = {}) => {
    const { params, ...restConfig } = config;
    const response = await axiosInstance.get(`/hotels/${contentId}/reviews`, {
      params,
      ...restConfig,
    });
    return response.data;
  },

  // 호텔 리뷰 요약 정보 조회 (평균 평점, 리뷰 수 등)
  getHotelReviewSummary: async (contentId, config = {}) => {
    const { params, ...restConfig } = config;
    const response = await axiosInstance.get(
      `/hotels/${contentId}/reviews/summary`,
      {
        params,
        ...restConfig,
      }
    );
    return response.data;
  },

  // 호텔 검색
  searchHotels: async (searchParams) => {
    const response = await axiosInstance.post("/hotels/search", searchParams);
    return response.data;
  },
  /**
   * Redis 관련 실시간 조회 관련 api임
   * */
  //진입 시 세션 등록
  enterHotel: async (contentId, sessionId) => {
    const res = await axiosInstance.post(`/hotels/${contentId}/views`, {
      sessionId,
    });
    return res.data;
  },
  // 이탈 시 세션 제거 (DELETE)
  leaveHotel: async (contentId, sessionId) => {
    const res = await axiosInstance.delete(`/hotels/${contentId}/views`, {
      data: { sessionId },
    });
    return res.data;
  },

  /** 현재 조회자 수 조회 (선택적으로 sessionId 전달하여 TTL 갱신) */
  getHotelViews: async (contentId, sessionId = null) => {
    const params = sessionId ? { sessionId } : {};
    const res = await axiosInstance.get(`/hotels/${contentId}/views`, {
      params,
    });
    return res.data;
  },
  // 여러 호텔의 실시간 조회수 조회 (선택) 안쓸 가능성 큼
  getMultipleHotelViews: async (contentIds) => {
    const response = await axiosInstance.post("/hotels/views", {
      contentIds,
    });
    return response.data;
  },

  // 호텔 이미지 목록 조회
  getHotelImages: async (contentId) => {
    const response = await axiosInstance.get(`/hotels/${contentId}/images`);
    return response.data;
  },

  // 호텔 편의시설 및 위치 정보 조회
  getHotelFacilities: async (contentId) => {
    const response = await axiosInstance.get(`/hotels/${contentId}/facilities`);
    return response.data;
  },

  // 지역코드로 호텔 목록 조회
  getHotelsByAreaCode: async (areaCode, limit = 10, lat = null, lng = null) => {
    const params = { areaCode, limit };
    if (lat !== null && lng !== null) {
      params.lat = lat;
      params.lng = lng;
    }
    const response = await axiosInstance.get("hotel/area", {
      params,
    });
    return response.data;
  },

  // 사업자별 호텔 정보 조회
  getHotelByAdminIdx: async (adminIdx) => {
    const response = await axiosInstance.get(`/hotels/admin/${adminIdx}`);
    return response.data;
  },
};
