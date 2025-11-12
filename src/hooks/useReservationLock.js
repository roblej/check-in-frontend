"use client";

import { useEffect, useRef, useCallback } from "react";
import { reservationLockAPI } from "@/lib/api/reservation";
import { getOrCreateTabLockId } from "@/utils/lockId";

/**
 * 예약 락 관리 커스텀 훅
 *
 * 기능:
 * - 예약하기 버튼 클릭 시 락 생성
 * - 페이지 이탈 시 자동 락 해제 (beforeunload)
 * - 컴포넌트 언마운트 시 락 해제
 *
 * @param {string} contentId - 호텔 ID
 * @param {number} roomId - 객실 ID
 * @param {boolean} enabled - 락 활성화 여부
 * @returns {Object} { createLock, releaseLock, isLocked }
 */
const useReservationLock = (
  contentId,
  roomId,
  checkIn,
  checkOut,
  enabled = true
) => {
  const lockCreatedRef = useRef(false);
  const lockDataRef = useRef({ contentId: null, roomId: null, lockId: null });

  /**
   * 예약 락 생성
   */
  const createLock = useCallback(async () => {
    if (!enabled || !contentId || !roomId || !checkIn) {
      console.warn("락 생성 조건 미충족:", {
        enabled,
        contentId,
        roomId,
        checkIn,
      });
      return { success: false, message: "락 생성 조건이 충족되지 않았습니다." };
    }

    try {
      const lockId = getOrCreateTabLockId();
      const result = await reservationLockAPI.createLock(
        contentId,
        roomId,
        checkIn,
        checkOut,
        lockId
      );

      if (result.success) {
        lockCreatedRef.current = true;
        lockDataRef.current = { contentId, roomId, lockId };
        console.log("✅ 예약 락 생성 성공:", result);
      } else {
        console.warn("⚠️ 예약 락 생성 실패:", result.message);
      }

      return result;
    } catch (error) {
      console.error("❌ 예약 락 생성 중 오류:", error);
      return {
        success: false,
        message:
          error.response?.data?.message || "락 생성 중 오류가 발생했습니다.",
      };
    }
  }, [contentId, roomId, checkIn, enabled]);

  /**
   * 예약 락 해제
   */
  const releaseLock = useCallback(async () => {
    const {
      contentId: lockContentId,
      roomId: lockRoomId,
      lockId,
    } = lockDataRef.current;

    if (!lockCreatedRef.current || !lockContentId || !lockRoomId) {
      console.log("락이 생성되지 않았거나 이미 해제됨");
      return { success: true, message: "락이 없습니다." };
    }

    try {
      const result = await reservationLockAPI.releaseLock(
        lockContentId,
        lockRoomId,
        null,
        checkIn,
        checkOut,
        lockId
      );

      if (result.success) {
        lockCreatedRef.current = false;
        lockDataRef.current = { contentId: null, roomId: null, lockId: null };
        console.log("✅ 예약 락 해제 성공:", result);
      }

      return result;
    } catch (error) {
      console.error("❌ 예약 락 해제 중 오류:", error);
      return {
        success: false,
        message:
          error.response?.data?.message || "락 해제 중 오류가 발생했습니다.",
      };
    }
  }, [checkIn]);

  /**
   * beforeunload 이벤트 핸들러 (페이지 이탈 시 락 해제)
   */
  useEffect(() => {
    if (!enabled) return;

    const handleBeforeUnload = () => {
      const {
        contentId: lockContentId,
        roomId: lockRoomId,
        lockId,
      } = lockDataRef.current;

      if (lockCreatedRef.current && lockContentId && lockRoomId) {
        // Beacon API 사용 (비동기 요청이 완료되지 않아도 전송 보장)
        const data = JSON.stringify({
          contentId: lockContentId,
          roomId: lockRoomId,
          checkIn,
          checkOut,
          lockId,
        });

        const apiUrl = `${
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:8888"
        }/api/reservations/unlock`;

        // sendBeacon은 POST 요청만 지원, withCredentials 자동 포함
        if (navigator.sendBeacon) {
          const blob = new Blob([data], { type: "application/json" });
          navigator.sendBeacon(apiUrl, blob);
          console.log("🚪 페이지 이탈: Beacon으로 락 해제 요청 전송");
        } else {
          // Beacon 미지원 브라우저는 동기 XHR (권장하지 않음, 대부분 브라우저는 Beacon 지원)
          const xhr = new XMLHttpRequest();
          xhr.open("POST", apiUrl, false); // 동기 요청
          xhr.setRequestHeader("Content-Type", "application/json");
          xhr.send(data);
          console.log("🚪 페이지 이탈: XHR로 락 해제 요청 전송");
        }
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [enabled, checkIn]);

  /**
   * 컴포넌트 언마운트 시 락 해제
   */
  useEffect(() => {
    return () => {
      if (lockCreatedRef.current) {
        releaseLock();
      }
    };
  }, [releaseLock]);

  return {
    createLock,
    releaseLock,
    isLocked: lockCreatedRef.current,
  };
};

export default useReservationLock;
