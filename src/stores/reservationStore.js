import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useReservationStore = create(
  persist(
    (set, get) => ({
      itemsById: {},
      setReservation: (reserv) =>
        set((state) => ({
          itemsById: {
            ...state.itemsById,
            [reserv.reservIdx || reserv.id]: {
              ...(state.itemsById[reserv.reservIdx || reserv.id] || {}),
              ...reserv,
            },
          },
        })),
      updateReservationStatus: (reservIdx, patch) =>
        set((state) => ({
          itemsById: {
            ...state.itemsById,
            [reservIdx]: {
              ...(state.itemsById[reservIdx] || { reservIdx, status: 1 }),
              ...patch,
            },
          },
        })),
      getReservation: (reservIdx) => get().itemsById[reservIdx],
    }),
    { name: "reservation-store" }
  )
);
