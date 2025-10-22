import axiosInstance from "@/lib/axios";

export const mypageAPI = {
  // 예약 목록 조회 (상태별)
  getReservations: async (status) => {
    // status를 인자로 받아서 백엔드로 전달
    const response = await axiosInstance.get("/mypage/reservations", {
        params: { status } // status 인자 전달
    });
    return response.data;
  },

  // 예약 상세 조회
  getReservationDetail: async (reservationId) => {
    const response = await axiosInstance.get(`/mypage/reservations/${reservationId}`);
    return response.data;
  },

  // 사용자 프로필 조회
  getProfile: async () => {
    const response = await axiosInstance.get("/mypage/profile");
    return response.data;
  },
};