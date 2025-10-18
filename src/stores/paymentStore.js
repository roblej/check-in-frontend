import { create } from "zustand";

// 15 minutes in milliseconds
const FIFTEEN_MINUTES_MS = 15 * 60 * 1000;

export const usePaymentStore = create((set, get) => ({
  paymentDraft: null,
  expiresAt: null,

  setPaymentDraft: (draft) => {
    const expiresAt = Date.now() + FIFTEEN_MINUTES_MS;
    set({ paymentDraft: draft, expiresAt });
    try {
      localStorage.setItem(
        "payment:draft",
        JSON.stringify({ draft, expiresAt })
      );
    } catch (_) {}
  },

  clearPaymentDraft: () => {
    set({ paymentDraft: null, expiresAt: null });
    try {
      localStorage.removeItem("payment:draft");
    } catch (_) {}
  },

  loadFromStorage: () => {
    try {
      const raw = localStorage.getItem("payment:draft");
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (!parsed?.expiresAt || parsed.expiresAt < Date.now()) {
        set({ paymentDraft: null, expiresAt: null });
        localStorage.removeItem("payment:draft");
        return;
      }
      set({ paymentDraft: parsed.draft, expiresAt: parsed.expiresAt });
    } catch (_) {}
  },

  getRemainingMs: () => {
    const expiresAt = get().expiresAt;
    return expiresAt ? Math.max(0, expiresAt - Date.now()) : 0;
  },
}));
