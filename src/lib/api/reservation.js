import axiosInstance from "@/lib/axios";

/**
 * 예약 락 관련 API
 */
export const reservationLockAPI = {
  /**
   * 예약 락 생성 (예약하기 버튼 클릭 시)
   * @param {string} contentId - 호텔 ID
   * @param {number} roomId - 객실 ID
   * @returns {Promise} 락 생성 결과
   */
  createLock: async (contentId, roomId) => {
    const response = await axiosInstance.post("/reservations/lock", {
      contentId,
      roomId,
    });
    return response.data;
  },

  /**
   * 예약 락 해제 (페이지 이탈 또는 결제 완료 시)
   * @param {string} contentId - 호텔 ID
   * @param {number} roomId - 객실 ID
   * @param {number} customerIdx - 고객 식별자 (선택)
   * @returns {Promise} 락 해제 결과
   */
  releaseLock: async (contentId, roomId, customerIdx = null) => {
    const response = await axiosInstance.post("/reservations/unlock", {
      contentId,
      roomId,
      customerIdx,
    });
    return response.data;
  },

  /**
   * 락 상태 조회 (디버깅용)
   * @param {string} contentId - 호텔 ID
   * @param {number} roomId - 객실 ID
   * @returns {Promise} 락 상태
   */
  getLockStatus: async (contentId, roomId) => {
    const response = await axiosInstance.get("/reservations/lock/status", {
      params: { contentId, roomId },
    });
    return response.data;
  },
};
