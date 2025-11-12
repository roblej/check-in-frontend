import { create } from "zustand";

// 10 minutes in milliseconds (600 seconds)
const TEN_MINUTES_MS = 10 * 60 * 1000;

export const usePaymentStore = create((set, get) => ({
  paymentDraft: null,
  expiresAt: null,

  setPaymentDraft: (draft) => {
    const deriveExpiresAt = () => {
      const rawMetaExpire =
        draft?.meta?.lockExpiresAt ?? draft?.meta?.lockExpireTime;
      if (typeof rawMetaExpire === "number") {
        if (Number.isFinite(rawMetaExpire)) {
          return rawMetaExpire;
        }
      } else if (typeof rawMetaExpire === "string") {
        const parsed = Date.parse(rawMetaExpire);
        if (!Number.isNaN(parsed)) {
          return parsed;
        }
      }
      const legacyExpire = draft?.meta?.expiresAt;
      if (typeof legacyExpire === "number") {
        return legacyExpire;
      }
      if (typeof legacyExpire === "string") {
        const parsedLegacy = Date.parse(legacyExpire);
        if (!Number.isNaN(parsedLegacy)) {
          return parsedLegacy;
        }
      }
      return Date.now() + TEN_MINUTES_MS;
    };

    const expiresAt = deriveExpiresAt();
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
