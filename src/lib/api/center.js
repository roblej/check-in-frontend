import axiosInstance from '@/lib/axios';

export const centerAPI = {
  // 문의 등록
  createInquiry: async (inquiryData) => {
    const response = await axiosInstance.post("/center/posts", inquiryData);
    return response.data;
  },

  // 문의 목록 조회
  getInquiries: async (searchParams) => {
    const response = await axiosInstance.post("/center/posts/search", {
      ...searchParams,
      // contentId가 있으면 포함, 없으면 포함하지 않음 (백엔드에서 null로 처리)
    });
    return response.data;
  },

  // 문의 상세 조회
  getInquiryDetail: async (centerIdx) => {
    const response = await axiosInstance.get(`/center/posts/${centerIdx}`);
    return response.data;
  },

  // 문의 수정
  updateInquiry: async (centerIdx, inquiryData) => {
    const response = await axiosInstance.put(`/center/posts/${centerIdx}`, inquiryData);
    return response.data;
  },

  // 문의 삭제
  deleteInquiry: async (centerIdx) => {
    const response = await axiosInstance.delete(`/center/posts/${centerIdx}`);
    return response.data;
  },

  // FAQ 조회
  getFAQs: async (searchParams) => {
    const response = await axiosInstance.post("/center/posts/search", searchParams);
    return response.data;
  },

  // 답변 조회
  getAnswer: async (centerIdx) => {
    const response = await axiosInstance.get(`/center/posts/${centerIdx}/answer`);
    return response.data;
  },

  // 호텔 신고 중복 확인
  checkReportExists: async (contentId) => {
    const response = await axiosInstance.get(`/center/reports/check/${contentId}`);
    return response.data;
  },
};

