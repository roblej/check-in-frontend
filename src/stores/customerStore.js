import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useCustomerStore = create(
    persist(
        (set,get) => ({
        customer: {
            customerIdx: "",
            id: "",
            rank: "",
            birthday: "",
            nickname: "",
            name: "",
            gender: "",
            phone: "",
            email: "",
            cash: "",
            status: "",
            totalPrice: "",
            point: "",
            provider: "",
            joinDate: "",
            inlogged: false,
            
        },

            setCustomer: (customerData) => {
                // 구조 분해 할당을 이용해 필요한 필드만 추출 (password는 버림)
                const { 
                    customerIdx, id, rank, birthday, nickname, 
                    name, gender, phone, email, cash, 
                    status, totalPrice, point, provider, joinDate , inlogged
                } = customerData;
                
                // 추출된 필드만 담긴 새로운 객체를 상태로 설정합니다.
                set({ 
                    customer: {
                        customerIdx, id, rank, birthday, nickname, 
                        name, gender, phone, email, cash, 
                        status, totalPrice, point, provider, joinDate , inlogged
                    } 
                });
            },

        getCustomer: () => get().customer,

        resetCustomer: () => set({ customer: {
            customerIdx: "",
            id: "",
            rank: "",
            birthday: "",
            nickname: "",
            name: "",
            gender: "",
            phone: "",
            email: "",
            cash: "",
            status: "",
            totalPrice: "",
            point: "",
            provider: "",
            joinDate: "",
            inlogged: false,
        } }),

    }),{
        name: "customer-storage",
    }
    )
);