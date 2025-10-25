import axiosInstance from "@/lib/axios";

// 다이닝 관련 API 함수들
export const diningAPI = {
  // 다이닝 목록 조회
  getDinings: async (params = {}) => {
    const response = await axiosInstance.get("/dining/list", { params });
    return response.data;
  },

  // 다이닝 상세 정보 조회
  getDiningDetail: async (diningIdx) => {
    const response = await axiosInstance.get(`/dining/${diningIdx}`);
    return response.data;
  },

  // 호텔별 다이닝 목록 조회
  getDiningsByHotel: async (contentid) => {
    const response = await axiosInstance.get(`/dining/hotel/${contentid}`);
    return response.data;
  },

  // 다이닝 검색 (호텔 주소, 호텔 이름, 다이닝 이름으로 검색)
  searchDinings: async (destination, params = {}) => {
    const response = await axiosInstance.get("/dining/search", {
      params: { destination, ...params }
    });
    return response.data;
  },

  // 복합 조건으로 다이닝 검색
  searchDiningsWithFilters: async (searchParams) => {
    const response = await axiosInstance.post("/dining/search", searchParams);
    return response.data;
  },

  // 가격 범위로 다이닝 검색
  searchDiningsByPrice: async (priceMin, priceMax, params = {}) => {
    const response = await axiosInstance.get("/dining/search/price", {
      params: { priceMin, priceMax, ...params }
    });
    return response.data;
  },

  // 식사 시간대별 다이닝 검색
  searchDiningsByMealType: async (mealType, params = {}) => {
    const response = await axiosInstance.get("/dining/search/meal-type", {
      params: { mealType, ...params }
    });
    return response.data;
  },
};
