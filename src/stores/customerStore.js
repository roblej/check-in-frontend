import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useCustomerStore = create(persist((set,get) => ({
        accessToken: "",
        inlogged: false,

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

    }),{
        name: "customer-storage",
        partialize: (state) => ({
            inlogged: state.inlogged,
            accessToken: state.accessToken,

        }),
    }
)
);