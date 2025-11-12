"use client";

const SESSION_ID_KEY = "hotel:reservation:sessionId";
const TAB_ID_KEY = "hotel:reservation:tabId";
const LOCK_ID_KEY = "hotel:reservation:lockId";
const LOCK_STARTED_AT_KEY = "hotel:reservation:lockStartedAt";

const createIdentifier = () => {
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

const getSessionStorage = () => {
  if (typeof window === "undefined") return null;
  try {
    return window.sessionStorage;
  } catch {
    return null;
  }
};

const getOrCreateStorageValue = (storage, key) => {
  if (!storage) return null;
  const existing = storage.getItem(key);
  if (existing) return existing;
  const generated = createIdentifier();
  if (!generated) return null;
  storage.setItem(key, generated);
  return generated;
};

export const getOrCreateSessionId = () => {
  const storage = getSessionStorage();
  return getOrCreateStorageValue(storage, SESSION_ID_KEY);
};

export const getOrCreateTabId = () => {
  const storage = getSessionStorage();
  return getOrCreateStorageValue(storage, TAB_ID_KEY);
};

export const getOrCreateTabLockId = () => {
  const storage = getSessionStorage();
  return getOrCreateStorageValue(storage, LOCK_ID_KEY);
};

export const setLockStartedAt = (isoString) => {
  const storage = getSessionStorage();
  if (!storage || !isoString) return;
  storage.setItem(LOCK_STARTED_AT_KEY, isoString);
};

export const getLockStartedAt = () => {
  const storage = getSessionStorage();
  if (!storage) return null;
  return storage.getItem(LOCK_STARTED_AT_KEY);
};

export const clearLockState = () => {
  const storage = getSessionStorage();
  if (!storage) return;
  storage.removeItem(LOCK_ID_KEY);
  storage.removeItem(LOCK_STARTED_AT_KEY);
};

export const getReservationIdentifiers = (options = {}) => {
  const { lockStartedAtOverride } = options;
  const storage = getSessionStorage();

  const sessionId = getOrCreateSessionId();
  const tabId = getOrCreateTabId();
  const lockId = getOrCreateTabLockId();

  let lockStartedAt = getLockStartedAt();
  if (lockStartedAtOverride) {
    lockStartedAt = lockStartedAtOverride;
    setLockStartedAt(lockStartedAtOverride);
  } else if (!lockStartedAt && storage) {
    const nowIso = new Date().toISOString();
    storage.setItem(LOCK_STARTED_AT_KEY, nowIso);
    lockStartedAt = nowIso;
  }

  return { sessionId, tabId, lockId, lockStartedAt };
};

export const logReservationIdentifiers = (label, identifiers) => {
  if (typeof console === "undefined") return;
  const payload =
    identifiers ??
    getReservationIdentifiers({
      lockStartedAtOverride: getLockStartedAt(),
    });
  console.info(`[reservation-lock] ${label}`, payload);
};
