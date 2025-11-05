import axiosInstance from "@/lib/axios";

// 사용자 관련 API 함수들
export const userAPI = {
  // 사용자 프로필 조회 (백엔드 /api/customer/me 사용)
  getProfile: async () => {
    const response = await axiosInstance.get("/customer/me");
    return response.data;
  },

  // 사용자 기본정보 수정
  updateBasicInfo: async (data) => {
    const response = await axiosInstance.put("/customer/profile", data);
    return response.data;
  },

  // 비밀번호 변경
  changePassword: async (data) => {
    const response = await axiosInstance.put("/customer/changePassword", data);
    return response.data;
  },

  // 보유 쿠폰 목록 조회 (고객 본인)
  getMyCoupons: async () => {
    const response = await axiosInstance.get("/coupons/my");
    return response.data;
  },
};
