import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useCustomerStore = create(
    (
        (set,get) => ({
        accessToken: "",
        inlogged: false,

        setAccessToken: (accessToken) => set({ accessToken }),
        
        readAccessToken: () => {
            const accessToken = get().accessToken;
            const payloadBase64 = accessToken.split('.')[1];
            const decodedPayload = atob(payloadBase64);
            const userInfo = JSON.parse(decodedPayload);
            return userInfo;
        },
    }),{
        name: "customer-storage",
    }
    )
);