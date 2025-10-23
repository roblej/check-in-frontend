import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useCustomerStore = create(persist((set,get) => ({
        accessToken: "",
        inlogged: false,

        setAccessToken: (accessToken) => {set({ accessToken });},
        
        readAccessToken: () => {
            const accessToken = get().accessToken;
            const payloadBase64 = accessToken.split('.')[1];
            const decodedPayload = atob(payloadBase64);
            const userInfo = JSON.parse(decodedPayload);
            return userInfo;
        },
        resetAccessToken: () => set({ accessToken: "" }),

        setInlogged: (inlogged) => set({ inlogged }),
    }),{
        name: "customer-storage",
        partialize: (state) => ({
            inlogged: state.inlogged,

        }),
    }
)
);