"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useScrollStore } from "@/stores/scrollStore";

/**
 * 페이지 이동 시 스크롤 위치 저장 및 복원
 */
export default function useScrollRestoration() {
    const pathname = usePathname();
    const { savePosition, positions } = useScrollStore();

    useEffect(() => {
        // 페이지 진입 시 저장된 위치로 스크롤 복원
        const saved = positions[pathname];
        if (saved) {
            window.scrollTo(0, saved);
        }

        // 언마운트 직전에 현재 스크롤 위치 저장
        return () => {
            savePosition(pathname, window.scrollY);
        };
    }, [pathname]);
}
