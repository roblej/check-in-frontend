import axiosInstance from "@/lib/axios";

export const mypageAPI = {
  // 예약 목록 조회 (상태별) - 페이지네이션 지원
  getReservations: async (status, page = 0, size = 5, type = 'hotel') => {
    // status와 페이지네이션 파라미터를 인자로 받아서 백엔드로 전달
    const response = await axiosInstance.get("/mypage/reservations", {
        params: { 
          status,  // status 인자 전달
          page,    // 페이지 번호 (0부터 시작)
          size,    // 페이지 크기
          type     // hotel 또는 dining
        }
    });
    return response.data;
  },

  // 예약 상세 조회
  getReservationDetail: async (reservationId, type = 'hotel') => {
    const response = await axiosInstance.get(`/mypage/reservations/${reservationId}`, {
      params: { type }
    });
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

  // 리뷰 이미지 업로드
  uploadReviewImages: async (images) => {
    const formData = new FormData();
    images.forEach((image) => {
      formData.append('images', image);
    });
    
    const response = await axiosInstance.post("/imageUpload/review/images", formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
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

  // 리뷰 삭제
  deleteReview: async (reviewId) => {
    const response = await axiosInstance.delete(`/reviews/${reviewId}`);
    return response.data;
  },

  // 다이닝 예약 상세 조회 (취소용)
  getDiningReservationDetailForCancel: async (reservationId) => {
    const response = await axiosInstance.get(`/reservations/dining/${reservationId}/detail`);
    return response.data;
  },

  // 다이닝 예약 취소
  cancelDiningReservation: async (reservationId, cancelReason) => {
    const response = await axiosInstance.post(`/reservations/dining/${reservationId}/cancel`, {
      cancelReason: cancelReason,
    });
    return response.data;
  },
};