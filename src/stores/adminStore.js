import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useAdminStore = create(persist((set, get) => ({
  adminIdx: null,
  contentId: null,
  isAdminLoggedIn: false,

  // adminIdx 설정
  setAdminIdx: (adminIdx) => set({ adminIdx }),

  // contentId 설정
  setContentId: (contentId) => set({ contentId }),

  // 관리자 로그인 상태 설정
  setAdminLoggedIn: (isLoggedIn) => set({ isAdminLoggedIn: isLoggedIn }),

  // adminIdx로 contentId 가져오기
  // 반환값: { contentId: string | null, status: 'APPROVED' | 'PENDING_APPROVAL' | 'NO_HOTEL', ... }
  fetchContentIdByAdminIdx: async (adminIdx) => {
    try {
      const response = await fetch(`/api/admin/hotel/${adminIdx}`);
      if (response.ok) {
        const data = await response.json();
        
        if (data.success && data.status === 'APPROVED' && data.contentId) {
          // contentId가 있는 경우 (승인 완료)
          set({ 
            contentId: data.contentId,
            adminIdx: adminIdx
          });
          return {
            contentId: data.contentId,
            status: 'APPROVED',
            hasPendingRequest: false
          };
        } else if (data.status === 'PENDING_APPROVAL') {
          // 승인 대기 중인 경우
          return {
            contentId: null,
            status: 'PENDING_APPROVAL',
            hasPendingRequest: true,
            registrationIdx: data.registrationIdx,
            regiDate: data.regiDate,
            message: data.message
          };
        } else if (data.status === 'NO_HOTEL') {
          // 호텔 미등록인 경우
          return {
            contentId: null,
            status: 'NO_HOTEL',
            hasPendingRequest: false,
            message: data.message
          };
        }
      }
      return {
        contentId: null,
        status: 'NO_HOTEL',
        hasPendingRequest: false
      };
    } catch (error) {
      console.error('contentId 조회 실패:', error);
      return {
        contentId: null,
        status: 'NO_HOTEL',
        hasPendingRequest: false
      };
    }
  },

  // 관리자 정보 초기화
  resetAdminData: () => set({ 
    adminIdx: null, 
    contentId: null, 
    isAdminLoggedIn: false 
  }),

  // 현재 adminIdx 가져오기
  getAdminIdx: () => get().adminIdx,

  // 현재 contentId 가져오기
  getContentId: () => get().contentId,

  // 관리자 로그인 상태 확인
  isLoggedIn: () => get().isAdminLoggedIn,

}), {
  name: "admin-storage",
  partialize: (state) => ({
    adminIdx: state.adminIdx,
    contentId: state.contentId,
    isAdminLoggedIn: state.isAdminLoggedIn,
  }),
}));
