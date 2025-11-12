"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { usePaymentStore } from "@/stores/paymentStore";
import axios from "@/lib/axios";
import { reservationLockAPI } from "@/lib/api/reservation";
import {
  getReservationIdentifiers,
  logReservationIdentifiers,
  setLockStartedAt,
  clearLockState,
} from "@/utils/lockId";

/**
 * 예약 락 생명주기만 관리하는 Wrapper
 * - 페이지 진입 시에는 아무것도 하지 않음 (RoomCard에서 이미 락 생성)
 * - 페이지 이탈 시에만 unlock 호출
 * - StrictMode 이중 마운트 영향 최소화
 */
const TEN_MINUTES_MS = 10 * 60 * 1000;

export default function ReservationLockWrapper({ children }) {
  const router = useRouter();
  const { paymentDraft, clearPaymentDraft, setPaymentDraft } =
    usePaymentStore();

  const isUnloadingRef = useRef(false);
  const isMountedRef = useRef(false);
  const hasUnlockedRef = useRef(false); // 중복 unlock 방지
  const hasEnsuredLockRef = useRef(false);
  const lockMetaRef = useRef(null);

  useEffect(() => {
    if (paymentDraft?.meta) {
      lockMetaRef.current = paymentDraft.meta;
      hasUnlockedRef.current = false;
    } else {
      lockMetaRef.current = null;
      hasEnsuredLockRef.current = false;
      clearLockState();
    }
  }, [paymentDraft]);

  // 명시적 취소 핸들러 (취소 버튼용)
  const handleCancel = async () => {
    if (hasUnlockedRef.current) return;
    hasUnlockedRef.current = true;

    try {
      if (paymentDraft?.meta) {
        const contentId = paymentDraft.meta.contentId;
        const roomId = paymentDraft.meta.roomIdx || paymentDraft.meta.roomId;
        const checkIn = paymentDraft.meta.checkIn;
        const identifiers = getReservationIdentifiers({
          lockStartedAtOverride: paymentDraft.meta.lockInitialAt,
        });
        logReservationIdentifiers(
          "ReservationLockWrapper: handleCancel",
          identifiers
        );

        const lockId = paymentDraft.meta.lockId || identifiers.lockId;
        const checkOut = paymentDraft.meta.checkOut;

        if (contentId && roomId && checkIn && checkOut) {
          await axios.post("/reservations/unlock", {
            contentId: String(contentId),
            roomId: Number(roomId),
            checkIn: String(checkIn),
            checkOut: String(checkOut),
            lockId: lockId ? String(lockId) : undefined,
            sessionId: identifiers.sessionId,
            tabId: identifiers.tabId,
            initialLockAt:
              paymentDraft.meta.lockInitialAt || identifiers.lockStartedAt,
          });
          console.log("✅ 취소: 락 해제 완료");
        }
      }
    } catch (error) {
      console.warn("취소 시 락 해제 실패 (무시):", error);
    } finally {
      clearPaymentDraft();
      clearLockState();
      try {
        router.back();
      } catch {
        router.replace("/");
      }
    }
  };

  useEffect(() => {
    if (!paymentDraft?.meta) return;
    if (hasEnsuredLockRef.current) return;

    const { contentId, roomIdx, roomId, checkIn, checkOut } = paymentDraft.meta;

    if (!contentId || !(roomIdx || roomId) || !checkIn || !checkOut) {
      return;
    }

    let cancelled = false;

    const ensureLock = async () => {
      try {
        const previousInitial = paymentDraft.meta.lockInitialAt;
        const nowIso = new Date().toISOString();
        const shouldResetWindow =
          !previousInitial ||
          Number.isNaN(Date.parse(previousInitial)) ||
          Date.now() - Date.parse(previousInitial) >= TEN_MINUTES_MS;
        const targetInitial = shouldResetWindow ? nowIso : previousInitial;

        if (shouldResetWindow) {
          setLockStartedAt(targetInitial);
        }

        const identifiers = getReservationIdentifiers({
          lockStartedAtOverride: targetInitial,
        });

        logReservationIdentifiers(
          "ReservationLockWrapper: ensureLock",
          identifiers
        );

        const result = await reservationLockAPI.createLock({
          contentId: String(contentId),
          roomId: Number(roomIdx || roomId),
          checkIn: String(checkIn),
          checkOut: String(checkOut),
          lockId: paymentDraft.meta.lockId || identifiers.lockId,
          sessionId: identifiers.sessionId,
          tabId: identifiers.tabId,
          initialLockAt:
            paymentDraft.meta.lockInitialAt && !shouldResetWindow
              ? paymentDraft.meta.lockInitialAt
              : identifiers.lockStartedAt,
        });

        if (!result?.success) {
          try {
            const status = await reservationLockAPI.getLockStatus({
              contentId: String(contentId),
              roomId: Number(roomIdx || roomId),
              checkIn: String(checkIn),
              checkOut: String(checkOut),
            });

            const lockInfo = status?.lockInfo || {};
            const lockOwnerSession = lockInfo?.sessionId;
            const lockOwnerTab = lockInfo?.tabId;
            const lockInfoId = lockInfo?.lockId;

            const sameOwner =
              status?.isLocked &&
              lockInfoId &&
              (lockInfoId ===
                (paymentDraft.meta.lockId || identifiers.lockId) ||
                (lockOwnerSession &&
                  lockOwnerTab &&
                  lockOwnerSession === identifiers.sessionId &&
                  lockOwnerTab === identifiers.tabId));

            if (sameOwner) {
              const resolvedInitialAt =
                lockInfo?.initialLockAt ||
                paymentDraft.meta.lockInitialAt ||
                identifiers.lockStartedAt ||
                new Date().toISOString();

              setLockStartedAt(resolvedInitialAt);

              const initialMs = Date.parse(resolvedInitialAt);
              const computedLockExpiresAt =
                Number.isFinite(initialMs) && initialMs > 0
                  ? initialMs + TEN_MINUTES_MS
                  : Date.now() + TEN_MINUTES_MS;

              if (!cancelled) {
                hasEnsuredLockRef.current = true;
                const nextMeta = {
                  ...paymentDraft.meta,
                  lockId: lockInfoId,
                  lockInitialAt: resolvedInitialAt,
                  lockExpireTime:
                    lockInfo?.expireTime ||
                    paymentDraft.meta.lockExpireTime ||
                    null,
                  lockExpiresAt: computedLockExpiresAt,
                };
                lockMetaRef.current = nextMeta;
                setPaymentDraft({
                  ...paymentDraft,
                  meta: nextMeta,
                });
              }
              return;
            }
          } catch (error) {
            console.warn("락 상태 조회 실패:", error);
          }

          if (!cancelled) {
            alert(
              result?.message ||
                "예약 정보를 이어받지 못했습니다. 다시 예약을 시작해주세요."
            );
            clearPaymentDraft();
            clearLockState();
            router.replace("/");
          }
          return;
        }

        const resolvedLockId =
          result.lockId ||
          paymentDraft.meta.lockId ||
          identifiers.lockId ||
          null;
        const resolvedInitialAt =
          result.initialLockAt ||
          paymentDraft.meta.lockInitialAt ||
          identifiers.lockStartedAt ||
          new Date().toISOString();

        setLockStartedAt(resolvedInitialAt);

        const initialMs = Date.parse(resolvedInitialAt);
        const computedLockExpiresAt =
          Number.isFinite(initialMs) && initialMs > 0
            ? initialMs + TEN_MINUTES_MS
            : Date.now() + TEN_MINUTES_MS;

        if (cancelled) return;

        hasEnsuredLockRef.current = true;
        const nextMeta = {
          ...paymentDraft.meta,
          lockId: resolvedLockId,
          lockInitialAt: resolvedInitialAt,
          lockExpireTime:
            result.expireTime || paymentDraft.meta.lockExpireTime || null,
          lockExpiresAt: computedLockExpiresAt,
        };
        lockMetaRef.current = nextMeta;
        setPaymentDraft({
          ...paymentDraft,
          meta: nextMeta,
        });
      } catch (error) {
        if (cancelled) return;
        alert("예약 정보를 이어받지 못했습니다. 다시 예약을 시작해주세요.");
        clearPaymentDraft();
        clearLockState();
        router.replace("/");
      }
    };

    ensureLock();

    return () => {
      cancelled = true;
    };
  }, [paymentDraft, clearPaymentDraft, router, setPaymentDraft]);

  useEffect(() => {
    if (!paymentDraft) {
      hasEnsuredLockRef.current = false;
    }
  }, [paymentDraft]);

  // 뒤로가기/닫기 시에만 unlock (새로고침은 무시)
  useEffect(() => {
    // 마운트 완료 표시 (비동기로 설정하여 StrictMode 초기 cleanup 구분)
    const timer = setTimeout(() => {
      isMountedRef.current = true;
    }, 0);

    const sendUnlockBeacon = () => {
      const meta = lockMetaRef.current;
      if (!meta) return;

      const contentId = meta.contentId;
      const roomId = meta.roomIdx || meta.roomId;
      const checkIn = meta.checkIn;
      const checkOut = meta.checkOut;

      if (!contentId || !roomId || !checkIn || !checkOut) return;

      const identifiers = getReservationIdentifiers({
        lockStartedAtOverride: meta.lockInitialAt,
      });
      logReservationIdentifiers(
        "ReservationLockWrapper: sendUnlockBeacon",
        identifiers
      );

      const payload = JSON.stringify({
        contentId: String(contentId),
        roomId: Number(roomId),
        checkIn: String(checkIn),
        checkOut: String(checkOut),
        lockId: meta.lockId || identifiers.lockId,
        sessionId: identifiers.sessionId,
        tabId: identifiers.tabId,
        initialLockAt: meta.lockInitialAt || identifiers.lockStartedAt,
      });

      const baseUrl =
        process.env.NEXT_PUBLIC_FRONT_URL ||
        process.env.NEXT_PUBLIC_API_URL ||
        (typeof window !== "undefined"
          ? window.location.origin
          : "http://localhost:8888");
      const apiUrl = `${baseUrl}/api/reservations/unlock`;

      if (navigator.sendBeacon) {
        const blob = new Blob([payload], { type: "application/json" });
        navigator.sendBeacon(apiUrl, blob);
        console.log("📡 sendBeacon으로 unlock 전송");
      }
    };

    const handleBeforeUnloadFlag = () => {
      if (hasUnlockedRef.current) return;
      isUnloadingRef.current = true;
      hasUnlockedRef.current = true;
      sendUnlockBeacon();
    };
    window.addEventListener("beforeunload", handleBeforeUnloadFlag);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("beforeunload", handleBeforeUnloadFlag);

      if (!isMountedRef.current) {
        console.log("⏭️ StrictMode 초기 cleanup: unlock 무시");
        return;
      }

      if (isUnloadingRef.current) {
        isUnloadingRef.current = false;
        return;
      }

      if (hasUnlockedRef.current) {
        console.log("⏭️ 이미 unlock 완료: 중복 방지");
        return;
      }

      hasUnlockedRef.current = true;
      sendUnlockBeacon();
    };
  }, []);

  // children이 함수면 호출, 아니면 그대로 렌더링
  return typeof children === "function" ? children({ handleCancel }) : children;
}
