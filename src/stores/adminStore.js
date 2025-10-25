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
  fetchContentIdByAdminIdx: async (adminIdx) => {
    try {
      const response = await fetch(`/api/admin/hotel/${adminIdx}`);
      if (response.ok) {
        const contentId = await response.text(); // String으로 받기
        if (contentId) {
          set({ 
            contentId: contentId,
            adminIdx: adminIdx
          });
          return contentId;
        }
      }
      return null;
    } catch (error) {
      console.error('contentId 조회 실패:', error);
      return null;
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
