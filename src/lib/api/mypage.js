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

  // 작성 가능한 리뷰 조회
  getWritableReviews: async () => {
    const response = await axiosInstance.get("/mypage/writable-reviews");
    return response.data;
  },

  // 이미 리뷰 작성했는지 확인
  hasReview: async (reservationId) => {
    try {
      const response = await axiosInstance.get(`/reviews/check/${reservationId}`);
      return response.data.hasReview || false;
    } catch (error) {
      console.error('리뷰 작성 여부 확인 실패:', error);
      return false;
    }
  },

  // 리뷰 작성
  createReview: async (reviewData) => {
    const response = await axiosInstance.post("/reviews", reviewData);
    return response.data;
  },

  // 내가 작성한 리뷰 조회
  getMyReviews: async () => {
    const response = await axiosInstance.get("/reviews/my-reviews");
    return response.data;
  },

  // 리뷰 수정
  updateReview: async (reviewId, payload) => {
    const response = await axiosInstance.put(`/reviews/${reviewId}`, payload);
    return response.data;
  },
};