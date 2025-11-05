import { create } from "zustand";

/**
 * 페이지별 스크롤 위치를 저장하는 전역 store
 */
export const useScrollStore = create((set) => ({
    positions: {}, // { pathname: scrollY }

    savePosition: (path, y) =>
        set((state) => ({
            positions: { ...state.positions, [path]: y },
        })),

    getPosition: (path) => {
        return get().positions[path] || 0;
    },
}));
