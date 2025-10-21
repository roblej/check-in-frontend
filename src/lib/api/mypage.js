import axiosInstance from "@/lib/axios";

export const mypageAPI = {
  getReservations: async (status) => {
    // status를 인자로 받아서 백엔드로 전달
    const response = await axiosInstance.get("/users/reservations", {
        params: { status } // status 인자 전달
    });
    return response.data;
  },

  // 사용자 프로필 조회
  getProfile: async () => {
    const response = await axiosInstance.get("/users/profile");
    return response.data;
  },
};