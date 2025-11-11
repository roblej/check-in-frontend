"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { usePaymentStore } from "@/stores/paymentStore";
import axios from "@/lib/axios";
import { getOrCreateTabLockId } from "@/utils/lockId";

/**
 * 예약 락 생명주기만 관리하는 Wrapper
 * - 페이지 진입 시에는 아무것도 하지 않음 (RoomCard에서 이미 락 생성)
 * - 페이지 이탈 시에만 unlock 호출
 * - StrictMode 이중 마운트 영향 최소화
 */
export default function ReservationLockWrapper({ children }) {
  const router = useRouter();
  const { paymentDraft, clearPaymentDraft } = usePaymentStore();

  const isUnloadingRef = useRef(false);
  const isMountedRef = useRef(false);
  const hasUnlockedRef = useRef(false); // 중복 unlock 방지

  // 명시적 취소 핸들러 (취소 버튼용)
  const handleCancel = async () => {
    if (hasUnlockedRef.current) return;
    hasUnlockedRef.current = true;

    try {
      if (paymentDraft?.meta) {
        const contentId = paymentDraft.meta.contentId;
        const roomId = paymentDraft.meta.roomIdx || paymentDraft.meta.roomId;
        const checkIn = paymentDraft.meta.checkIn;
        const lockId = paymentDraft.meta.lockId || getOrCreateTabLockId();

        if (contentId && roomId && checkIn) {
          await axios.post("/reservations/unlock", {
            contentId: String(contentId),
            roomId: Number(roomId),
            checkIn: String(checkIn),
            lockId: lockId ? String(lockId) : undefined,
          });
          console.log("✅ 취소: 락 해제 완료");
        }
      }
    } catch (error) {
      console.warn("취소 시 락 해제 실패 (무시):", error);
    } finally {
      clearPaymentDraft();
      try {
        router.back();
      } catch {
        router.replace("/");
      }
    }
  };

  // 뒤로가기/닫기 시에만 unlock (새로고침은 무시)
  useEffect(() => {
    if (!paymentDraft?.meta) return;

    // 마운트 완료 표시 (비동기로 설정하여 StrictMode 초기 cleanup 구분)
    const timer = setTimeout(() => {
      isMountedRef.current = true;
    }, 0);

    // beforeunload 플래그 설정
    const handleBeforeUnloadFlag = () => {
      isUnloadingRef.current = true;
    };
    window.addEventListener("beforeunload", handleBeforeUnloadFlag);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("beforeunload", handleBeforeUnloadFlag);

      // StrictMode 초기 cleanup 무시 (아직 마운트 완료되지 않음)
      if (!isMountedRef.current) {
        console.log("⏭️ StrictMode 초기 cleanup: unlock 무시");
        return;
      }

      // 새로고침 중이면 unlock 안 보냄
      if (isUnloadingRef.current) {
        console.log("🔄 새로고침 감지: unlock 안 보냄");
        isUnloadingRef.current = false;
        return;
      }

      // 이미 unlock 했으면 중복 방지
      if (hasUnlockedRef.current) {
        console.log("⏭️ 이미 unlock 완료: 중복 방지");
        return;
      }

      // 뒤로가기/닫기로 추정 → unlock 시도
      hasUnlockedRef.current = true;
      const contentId = paymentDraft.meta.contentId;
      const roomId = paymentDraft.meta.roomIdx || paymentDraft.meta.roomId;
      const checkIn = paymentDraft.meta.checkIn;

      if (!contentId || !roomId || !checkIn) return;

      console.log("🔙 페이지 이탈 감지: unlock 시도");
      const payload = JSON.stringify({
        contentId: String(contentId),
        roomId: Number(roomId),
        checkIn: String(checkIn),
        lockId: paymentDraft.meta.lockId || getOrCreateTabLockId(),
      });

      const apiUrl = `${
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:8888"
      }/api/reservations/unlock`;

      if (navigator.sendBeacon) {
        const blob = new Blob([payload], { type: "application/json" });
        navigator.sendBeacon(apiUrl, blob);
        console.log("📡 sendBeacon으로 unlock 전송");
      }
    };
  }, [paymentDraft]);

  // children이 함수면 호출, 아니면 그대로 렌더링
  return typeof children === "function" ? children({ handleCancel }) : children;
}
