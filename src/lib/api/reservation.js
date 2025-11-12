import axiosInstance from "@/lib/axios";

/**
 * 예약 락 관련 API
 */
export const reservationLockAPI = {
  /**
   * 예약 락 생성 (예약하기 버튼 클릭 시)
   * @returns {Promise} 락 생성 결과
   */
  createLock: async ({
    contentId,
    roomId,
    checkIn,
    checkOut,
    lockId,
    sessionId,
    tabId,
    initialLockAt,
  }) => {
    const payload = {
      contentId,
      roomId,
      checkIn,
      checkOut,
    };

    if (lockId) {
      payload.lockId = lockId;
    }
    if (sessionId) {
      payload.sessionId = sessionId;
    }
    if (tabId) {
      payload.tabId = tabId;
    }
    if (initialLockAt) {
      payload.initialLockAt = initialLockAt;
    }

    console.info("[reservation-lock] createLock ->", payload);
    const response = await axiosInstance.post("/reservations/lock", payload);
    return response.data;
  },

  /**
   * 예약 락 해제 (페이지 이탈 또는 결제 완료 시)
   * @returns {Promise} 락 해제 결과
   */
  releaseLock: async ({
    contentId,
    roomId,
    customerIdx = null,
    checkIn,
    checkOut,
    lockId,
    sessionId,
    tabId,
    initialLockAt,
  }) => {
    const payload = {
      contentId,
      roomId,
      checkIn,
      checkOut,
    };

    if (customerIdx) {
      payload.customerIdx = customerIdx;
    }

    if (lockId) {
      payload.lockId = lockId;
    }
    if (sessionId) {
      payload.sessionId = sessionId;
    }
    if (tabId) {
      payload.tabId = tabId;
    }
    if (initialLockAt) {
      payload.initialLockAt = initialLockAt;
    }

    console.info("[reservation-lock] releaseLock ->", payload);
    const response = await axiosInstance.post("/reservations/unlock", payload);
    return response.data;
  },

  /**
   * 락 상태 조회 (디버깅용)
   * @param {string} contentId - 호텔 ID
   * @param {number} roomId - 객실 ID
   * @returns {Promise} 락 상태
   */
  getLockStatus: async ({ contentId, roomId, checkIn, checkOut }) => {
    const response = await axiosInstance.get("/reservations/lock/status", {
      params: { contentId, roomId, checkIn, checkOut },
    });
    return response.data;
  },
};
