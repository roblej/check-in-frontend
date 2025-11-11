"use client";

const STORAGE_KEY = "hotel:reservation:lockId";

const createLockId = () => {
  if (typeof window === "undefined") return null;
  if (window.crypto?.randomUUID) {
    return window.crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
    /[xy]/g,
    (character) => {
      const random = (Math.random() * 16) | 0;
      const value = character === "x" ? random : (random & 0x3) | 0x8;
      return value.toString(16);
    }
  );
};

export const getOrCreateTabLockId = () => {
  if (typeof window === "undefined") return null;
  const storage = window.sessionStorage;
  const existing = storage.getItem(STORAGE_KEY);
  if (existing) return existing;
  const newLockId = createLockId();
  if (!newLockId) return null;
  storage.setItem(STORAGE_KEY, newLockId);
  return newLockId;
};
