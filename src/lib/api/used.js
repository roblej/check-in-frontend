import axiosInstance from '@/lib/axios';

// 양도거래 관련 API 함수들
export const usedAPI = {
  // 양도거래 목록 조회
  getUsedItems: async (params = {}) => {
    const response = await axiosInstance.get("/used/list", { params });
    return response.data;
  },

  // 양도거래 검색
  searchUsedItems: async (searchParams) => {
    const response = await axiosInstance.post("/used/search", searchParams);
    return response.data;
  },

  // 거래 가능 여부 체크
  checkAvailability: async (usedItemIdx) => {
    const response = await axiosInstance.get(`/used/${usedItemIdx}/availability`);
    return response.data;
  },

  // 거래 생성
  createTrade: async (tradeData) => {
    const response = await axiosInstance.post("/used/trade", tradeData);
    return response.data;
  },

  // 거래 확정
  confirmTrade: async (usedTradeIdx) => {
    const response = await axiosInstance.post(`/used/trade/${usedTradeIdx}/confirm`);
    return response.data;
  },

  // 거래 취소
  cancelTrade: async (usedTradeIdx, reason) => {
    const response = await axiosInstance.post(`/used/trade/${usedTradeIdx}/cancel`, {
      reason
    });
    return response.data;
  },

  // 거래 삭제
  deleteTrade: async (usedTradeIdx, reason, timestamp) => {
    const response = await axiosInstance.delete(`/used/trade/${usedTradeIdx}/delete`, {
      data: { reason, timestamp }
    });
    return response.data;
  },

  // 거래 상태 조회
  getTradeStatus: async (usedTradeIdx) => {
    const response = await axiosInstance.get(`/used/trade/${usedTradeIdx}/status`);
    return response.data;
  },

  // 구매자 거래 목록
  getBuyerTrades: async (buyerIdx) => {
    const response = await axiosInstance.get(`/used/buyer/${buyerIdx}/trades`);
    return response.data;
  },

  // 판매자 거래 목록
  getSellerTrades: async (sellerIdx) => {
    const response = await axiosInstance.get(`/used/seller/${sellerIdx}/trades`);
    return response.data;
  },

  // 결제 내역 저장
  createPayment: async (paymentData) => {
    const response = await axiosInstance.post("/used/payment", paymentData);
    return response.data;
  },

  // 양도거래 등록
  registerUsedItem: async (itemData) => {
    const response = await axiosInstance.post("/used/register", itemData);
    return response.data;
  },

  // 양도거래 수정
  updateUsedItem: async (usedItemIdx, itemData) => {
    const response = await axiosInstance.put(`/used/${usedItemIdx}`, itemData);
    return response.data;
  },

  // 양도거래 취소
  cancelUsedItem: async (usedItemIdx) => {
    const response = await axiosInstance.post(`/used/${usedItemIdx}/cancel`);
    return response.data;
  },

  // 양도거래 등록 여부 확인
  checkRegistered: async (reservIdx) => {
    const response = await axiosInstance.get(`/used/check/${reservIdx}`);
    return response.data;
  },

  // 사용자 정보 가져오기
  getCustomerInfo: async () => {
    const response = await axiosInstance.get('/customer/me');
    return response.data;
  },

  // 판매자의 양도거래 아이템 목록 조회 (마이페이지용)
  getSellerItems: async () => {
    const response = await axiosInstance.get('/used/seller/items');
    return response.data;
  },

  // 결제 페이지 진입 시 락 생성
  createPaymentPageLock: async (usedTradeIdx, buyerIdx = null) => {
    const response = await axiosInstance.post(`/used/trade/${usedTradeIdx}/lock`, {
      buyerIdx
    });
    return response.data;
  },

  // 결제 페이지 이탈 시 락 해제
  releasePaymentPageLock: async (usedTradeIdx, buyerIdx = null) => {
    const response = await axiosInstance.post(`/used/trade/${usedTradeIdx}/unlock`, {
      buyerIdx
    });
    return response.data;
  },
};

