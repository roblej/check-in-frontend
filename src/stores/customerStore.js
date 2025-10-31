import { create } from "zustand";
import { persist } from "zustand/middleware";

//애초에 persit 로컬 스토리지에 존재하는거니 뺼 가능성 큼큼
export const useCustomerStore = create(persist((set,get) => ({
        accessToken: "",
        inlogged: false,
        lastVerified: null, // 마지막 검증 시간만 저장

        setAccessToken: (accessToken) => set({ accessToken }),
        getAccessToken: () => {return get().accessToken;},
        readAccessToken: () => {
            const accessToken = get().accessToken;
            const payloadBase64 = accessToken.split('.')[1];
            
            // Base64 디코딩 후 UTF-8 디코딩
            const decodedPayload = atob(payloadBase64);
            const utf8Payload = decodeURIComponent(escape(decodedPayload));
            const userInfo = JSON.parse(utf8Payload);
            
            return userInfo;
        },
        resetAccessToken: () => set({ accessToken: "" }),

        setInlogged: (inlogged) => set({ inlogged }),

        isInlogged: () => get().inlogged,

        // 백엔드에서 실제 토큰 검증 (사용자 데이터는 반환만 하고 저장하지 않음)
        verifyTokenWithBackend: async () => {
            try {
                const response = await fetch('/api/customer/me', {
                    credentials: 'include' // HttpOnly 쿠키 포함
                });
                
                if (response.ok) {
                    const userData = await response.json();
                    const now = Date.now();
                    set({ 
                        inlogged: true, 
                        lastVerified: now 
                    });
                    return { success: true, userData };
                } else if (response.status === 401) {
                    set({ inlogged: false, lastVerified: null });
                    return { success: false, error: 'unauthorized' };
                } else {
                    return { success: false, error: 'server_error' };
                }
            } catch (error) {
                console.error('토큰 검증 실패:', error);
                set({ inlogged: false, lastVerified: null });
                return { success: false, error: 'network_error' };
            }
        },

        // 최근 검증 여부 확인 (5분 이내)
        isRecentlyVerified: () => {
            const { lastVerified } = get();
            const now = Date.now();
            const fiveMinutes = 5 * 60 * 1000; // 5분
            
            return lastVerified && (now - lastVerified) < fiveMinutes;
        },

    }),{
        name: "customer-storage",
        partialize: (state) => ({
            inlogged: state.inlogged,
            lastVerified: state.lastVerified,
            accessToken: state.accessToken,
        }),
    }
)
);