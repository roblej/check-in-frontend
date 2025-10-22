import axiosInstance from "@/lib/axios";

// 사용자 관련 API 함수들
export const userAPI = {
  // 사용자 프로필 조회
  getProfile: async () => {
    const response = await axiosInstance.get("/users/profile");
    return response.data;
  },

  // 사용자 기본정보 수정
  updateBasicInfo: async (data) => {
    const response = await axiosInstance.put("/users/profile", data);
    return response.data;
  },
};

