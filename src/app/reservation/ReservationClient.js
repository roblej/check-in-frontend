"use client";

import Image from "next/image";
import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { usePaymentStore } from "@/stores/paymentStore";
import axios from "@/lib/axios";
import { userAPI } from "@/lib/api/user";
import { reservationLockAPI } from "@/lib/api/reservation";
import {
  getReservationIdentifiers,
  logReservationIdentifiers,
  clearLockState,
} from "@/utils/lockId";
import TossPaymentsWidget from "@/components/payment/TossPaymentsWidget";
import PaymentSummary from "@/components/payment/PaymentSummary";
import ReservationLockWrapper from "./ReservationLockWrapper";

const roomImageBaseUrl = process.env.NEXT_PUBLIC_ROOM_IMAGE_BASE_URL;
if (!roomImageBaseUrl) {
  throw new Error(
    "NEXT_PUBLIC_ROOM_IMAGE_BASE_URL 환경 변수가 설정되어 있지 않습니다."
  );
}
const ensureTrailingSlash = (url) => (url.endsWith("/") ? url : `${url}/`);
const ROOM_IMAGE_BASE_URL = ensureTrailingSlash(roomImageBaseUrl);

const ReservationClient = () => {
  const router = useRouter();
  const { paymentDraft, expiresAt, loadFromStorage, clearPaymentDraft } =
    usePaymentStore();

  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);

  // 결제 정보 상태
  const [paymentInfo, setPaymentInfo] = useState({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    specialRequests: "",
    agreeTerms: false,
    agreePrivacy: false,
    customerIdx: null,
    customerCash: 0,
    customerPoint: 0,
    useCash: 0,
    usePoint: 0,
  });

  // 쿠폰 상태 (목록 + 단일 선택)
  const [availableCoupons, setAvailableCoupons] = useState([]);
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [isCouponLoading, setIsCouponLoading] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // 타이머 관리 (10분 = 600초)
  const [remainingSeconds, setRemainingSeconds] = useState(600);
  const timerRef = useRef(null);

  // 결제 정보 로드 + 로드 완료 플래그
  const [draftReady, setDraftReady] = useState(false);
  useEffect(() => {
    try {
      loadFromStorage();
    } finally {
      setDraftReady(true);
    }
  }, [loadFromStorage]);

  // 락 관리는 ReservationLockWrapper에서 처리

  // 결제 정보가 없으면 홈으로 리다이렉트 (로드 완료 후)
  useEffect(() => {
    if (draftReady && !paymentDraft) {
      router.push("/");
    }
  }, [draftReady, paymentDraft, router]);

  /**
   * 시간 만료 시 Lock 해제 처리
   */
  const handleTimeExpired = useCallback(async () => {
    try {
      if (paymentDraft?.meta) {
        const { sessionId, tabId } = getReservationIdentifiers({
          lockStartedAtOverride: paymentDraft.meta.lockInitialAt,
        });

        logReservationIdentifiers("ReservationClient: handleTimeExpired", {
          sessionId,
          tabId,
          lockId: paymentDraft.meta.lockId,
          lockInitialAt: paymentDraft.meta.lockInitialAt,
        });

        await reservationLockAPI.releaseLock({
          contentId: paymentDraft.meta.contentId || paymentDraft.meta.hotelId,
          roomId: paymentDraft.meta.roomIdx || paymentDraft.meta.roomId,
          customerIdx: paymentInfo.customerIdx,
          checkIn: paymentDraft.meta.checkIn,
          checkOut: paymentDraft.meta.checkOut,
          lockId: paymentDraft.meta.lockId,
          sessionId,
          tabId,
          initialLockAt: paymentDraft.meta.lockInitialAt,
        });
      }
      alert("결제 시간이 만료되었습니다. 다시 예약해주세요.");
    } catch (error) {
      console.error("Lock 해제 실패:", error);
    } finally {
      clearPaymentDraft();
      clearLockState();
    }
  }, [paymentDraft, paymentInfo.customerIdx, clearPaymentDraft]);

  /**
   * 타이머 초기화 및 관리
   * - 10분(600초)부터 시작
   * - 1초마다 감소
   * - 이벤트 발생 시 1초 추가 감소
   */
  useEffect(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    if (!paymentDraft) {
      setRemainingSeconds(0);
      return;
    }

    if (!expiresAt) {
      setRemainingSeconds(0);
      handleTimeExpired();
      return;
    }

    let expiredHandled = false;

    const updateRemaining = () => {
      const diffMs = expiresAt - Date.now();
      const seconds = Math.max(0, Math.floor(diffMs / 1000));
      setRemainingSeconds(seconds);
      if (seconds <= 0 && !expiredHandled) {
        expiredHandled = true;
        handleTimeExpired();
        return false;
      }
      return seconds > 0;
    };

    updateRemaining();

    timerRef.current = setInterval(() => {
      const stillActive = updateRemaining();
      if (!stillActive && timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [paymentDraft, expiresAt, handleTimeExpired]);

  // httpOnly 쿠키에서 사용자 정보 가져오기
  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const response = await axios.get("/customer/me");

        if (response.status === 200) {
          const userData = response.data;
          setCustomer(userData);

          setPaymentInfo((prev) => ({
            ...prev,
            customerIdx: userData.customerIdx,
            customerName: userData.name || "",
            customerEmail: userData.email || "",
            customerPhone: userData.phone || "",
            customerCash: parseInt(userData.cash) || 0,
            customerPoint: parseInt(userData.point) || 0,
          }));
        } else if (response.status === 401) {
          console.log("인증이 필요합니다 (백엔드에서 처리)");
          return;
        }
      } catch (error) {
        console.error("사용자 정보 가져오기 실패:", error);
        return;
      } finally {
        setLoading(false);
      }
    };

    fetchUserInfo();
  }, [router]);

  // 고객 보유 쿠폰 목록 조회
  useEffect(() => {
    const fetchCoupons = async () => {
      if (!paymentInfo.customerIdx) return;
      try {
        setIsCouponLoading(true);
        const data = await userAPI.getMyCoupons();
        // 기대 응답 형태 정규화: { data: Coupon[] } 또는 Array
        const list = Array.isArray(data?.data)
          ? data.data
          : Array.isArray(data)
          ? data
          : [];
        // 사용 가능(status==0 등)만 필터링(백엔드 규약에 따라 조정 가능)
        const normalized = list
          .filter(
            (c) =>
              c.status === 0 || c.status === "0" || c.status === "AVAILABLE"
          )
          .map((c) => ({
            couponIdx: c.couponIdx ?? c.id ?? c.templateIdx,
            name: c.templateName ?? c.name ?? "쿠폰",
            discountAmount: Number(c.discount ?? c.discountAmount ?? 0),
            endDate: c.endDate ?? c.expiresAt ?? null,
          }));
        setAvailableCoupons(normalized);
      } catch (e) {
        // 조용히 무시 (알림 표시 안 함)
      } finally {
        setIsCouponLoading(false);
      }
    };
    fetchCoupons();
  }, [paymentInfo.customerIdx]);

  // 고정된 키들 생성
  const paymentKeys = useMemo(
    () => ({
      customerKey: `customer_${paymentDraft?.meta?.hotelId || "default"}`,
      orderId: paymentDraft?.orderId || "",
    }),
    [paymentDraft]
  );

  // 결제 금액 계산 (쿠폰 최우선 적용)
  const paymentAmounts = useMemo(() => {
    if (!paymentDraft)
      return {
        totalAmount: 0,
        couponDiscount: 0,
        useCash: 0,
        usePoint: 0,
        actualPaymentAmount: 0,
      };

    const totalAmount = paymentDraft.finalAmount;
    const couponDiscount = appliedCoupon?.discountAmount || 0;

    // 쿠폰 적용 후 남은 금액
    const afterCoupon = Math.max(0, totalAmount - couponDiscount);

    const maxCash = Math.min(paymentInfo.useCash, paymentInfo.customerCash);
    const maxPoint = Math.min(paymentInfo.usePoint, paymentInfo.customerPoint);

    // 쿠폰 적용 후 남은 금액에서 캐시/포인트 차감
    const availableCashPoint = maxCash + maxPoint;
    const actualPaymentAmount = Math.max(0, afterCoupon - availableCashPoint);

    return {
      totalAmount,
      couponDiscount,
      useCash: maxCash,
      usePoint: maxPoint,
      actualPaymentAmount,
      availableCashPoint,
      afterCoupon,
    };
  }, [
    paymentDraft,
    appliedCoupon,
    paymentInfo.useCash,
    paymentInfo.usePoint,
    paymentInfo.customerCash,
    paymentInfo.customerPoint,
  ]);

  // 폼 유효성 검사
  const isFormValid = useMemo(() => {
    if (!paymentInfo.customerName.trim()) return false;
    if (!paymentInfo.customerEmail.trim()) return false;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(paymentInfo.customerEmail))
      return false;
    if (!paymentInfo.customerPhone.trim()) return false;
    if (!/^[0-9-+\s]+$/.test(paymentInfo.customerPhone)) return false;
    if (!paymentInfo.agreeTerms) return false;
    if (!paymentInfo.agreePrivacy) return false;
    return true;
  }, [paymentInfo]);

  // 조기 반환 대신, 본문 UI를 조건부로 구성해 훅 순서를 보장
  let gateContent = null;
  if (loading || isLoading) {
    gateContent = (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">
            {isLoading
              ? "결제를 처리하는 중입니다..."
              : "사용자 정보를 불러오는 중..."}
          </p>
          {isLoading && (
            <p className="text-sm text-gray-500 mt-2">잠시만 기다려주세요</p>
          )}
        </div>
      </div>
    );
  } else if (!customer) {
    gateContent = (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">로그인이 필요합니다.</p>
          <button
            onClick={() => router.push("/login")}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
          >
            로그인하기
          </button>
        </div>
      </div>
    );
  } else if (!paymentDraft) {
    gateContent = (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">결제 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  // 폼 유효성 검사 (에러 메시지 포함)
  const validateForm = () => {
    const newErrors = {};

    if (!paymentInfo.customerName.trim()) {
      newErrors.customerName = "예약자 이름을 입력해주세요.";
    }

    if (!paymentInfo.customerEmail.trim()) {
      newErrors.customerEmail = "이메일을 입력해주세요.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(paymentInfo.customerEmail)) {
      newErrors.customerEmail = "올바른 이메일 형식을 입력해주세요.";
    }

    if (!paymentInfo.customerPhone.trim()) {
      newErrors.customerPhone = "전화번호를 입력해주세요.";
    } else if (!/^[0-9-+\s]+$/.test(paymentInfo.customerPhone)) {
      newErrors.customerPhone = "올바른 전화번호 형식을 입력해주세요.";
    }

    if (!paymentInfo.agreeTerms) {
      newErrors.agreeTerms = "이용약관에 동의해주세요.";
    }

    if (!paymentInfo.agreePrivacy) {
      newErrors.agreePrivacy = "개인정보처리방침에 동의해주세요.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * UTF-8 바이트 길이 계산 (utf8mb4 기준)
   * @param {string} str - 문자열
   * @returns {number} - 바이트 길이
   */
  const getUtf8ByteLength = (str) => {
    let byteLength = 0;
    for (let i = 0; i < str.length; i++) {
      const code = str.charCodeAt(i);
      if (code <= 0x7f) {
        byteLength += 1; // ASCII
      } else if (code <= 0x7ff) {
        byteLength += 2;
      } else if (code >= 0xd800 && code <= 0xdfff) {
        // Surrogate pair (이모지 등)
        byteLength += 4;
        i++; // Skip next char
      } else {
        byteLength += 3; // 한글 등
      }
    }
    return byteLength;
  };

  /**
   * 입력 필드 변경 핸들러
   */
  const handleInputChange = (field, value) => {
    // specialRequests 1000자(바이트) 제한
    if (field === "specialRequests") {
      const byteLength = getUtf8ByteLength(value);
      if (byteLength > 1000) {
        alert("특별 요청사항은 최대 1000자(영문 기준)까지 입력 가능합니다.");
        return;
      }
    }

    setPaymentInfo((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  /**
   * 캐시 사용량 변경 핸들러
   * - 쿠폰 포함 90% 제한 검증
   */
  const handleCashChange = (value) => {
    const totalAmount = paymentDraft?.finalAmount || 0;
    const cashAmount = Math.max(
      0,
      Math.min(parseInt(value) || 0, paymentInfo.customerCash)
    );

    // 쿠폰 포함 90% 제한 검증
    const currentPoint = paymentInfo.usePoint || 0;
    const couponAmount = appliedCoupon?.discountAmount || 0;
    const totalUsage = couponAmount + cashAmount + currentPoint;
    const maxAllowed = Math.floor(totalAmount * 0.9);

    if (totalUsage > maxAllowed) {
      alert(
        "쿠폰, 포인트, 캐시를 합쳐서 상품 금액의 90% 이상 사용할 수 없습니다."
      );
      return;
    }

    setPaymentInfo((prev) => ({
      ...prev,
      useCash: cashAmount,
    }));
  };

  /**
   * 포인트 사용량 변경 핸들러
   * - 쿠폰 포함 90% 제한 검증
   */
  const handlePointChange = (value) => {
    const totalAmount = paymentDraft?.finalAmount || 0;
    const pointAmount = Math.max(
      0,
      Math.min(parseInt(value) || 0, paymentInfo.customerPoint)
    );

    // 쿠폰 포함 90% 제한 검증
    const currentCash = paymentInfo.useCash || 0;
    const couponAmount = appliedCoupon?.discountAmount || 0;
    const totalUsage = couponAmount + currentCash + pointAmount;
    const maxAllowed = Math.floor(totalAmount * 0.9);

    if (totalUsage > maxAllowed) {
      alert(
        "쿠폰, 포인트, 캐시를 합쳐서 상품 금액의 90% 이상 사용할 수 없습니다."
      );
      return;
    }

    setPaymentInfo((prev) => ({
      ...prev,
      usePoint: pointAmount,
    }));
  };

  /**
   * 전체 캐시 사용
   * - 쿠폰 포함 90% 제한 적용
   */
  const useAllCash = () => {
    const totalAmount = paymentDraft?.finalAmount || 0;
    const maxAllowed = Math.floor(totalAmount * 0.9);
    const currentPoint = paymentInfo.usePoint || 0;
    const couponAmount = appliedCoupon?.discountAmount || 0;
    const availableForCash = Math.max(
      0,
      maxAllowed - couponAmount - currentPoint
    );
    const maxCash = Math.min(
      paymentInfo.customerCash,
      availableForCash,
      totalAmount
    );

    if (couponAmount + currentPoint + maxCash > maxAllowed) {
      alert(
        "쿠폰, 포인트, 캐시를 합쳐서 상품 금액의 90% 이상 사용할 수 없습니다."
      );
      return;
    }

    setPaymentInfo((prev) => ({
      ...prev,
      useCash: maxCash,
    }));
  };

  /**
   * 전체 포인트 사용
   * - 쿠폰 포함 90% 제한 적용
   */
  const useAllPoint = () => {
    const totalAmount = paymentDraft?.finalAmount || 0;
    const maxAllowed = Math.floor(totalAmount * 0.9);
    const currentCash = paymentInfo.useCash || 0;
    const couponAmount = appliedCoupon?.discountAmount || 0;
    const availableForPoint = Math.max(
      0,
      maxAllowed - couponAmount - currentCash
    );
    const maxPoint = Math.min(
      paymentInfo.customerPoint,
      availableForPoint,
      totalAmount
    );

    if (couponAmount + currentCash + maxPoint > maxAllowed) {
      alert(
        "쿠폰, 포인트, 캐시를 합쳐서 상품 금액의 90% 이상 사용할 수 없습니다."
      );
      return;
    }

    setPaymentInfo((prev) => ({
      ...prev,
      usePoint: maxPoint,
    }));
  };

  /**
   * 쿠폰 적용 핸들러
   */
  const handleSelectCoupon = (coupon) => {
    if (!coupon) return;
    const totalAmount = paymentDraft?.finalAmount || 0;
    const maxAllowed = Math.floor(totalAmount * 0.9);
    const currentCash = paymentInfo.useCash || 0;
    const currentPoint = paymentInfo.usePoint || 0;
    if (
      (coupon.discountAmount || 0) + currentCash + currentPoint >
      maxAllowed
    ) {
      alert(
        "쿠폰, 포인트, 캐시를 합쳐서 상품 금액의 90% 이상 사용할 수 없습니다."
      );
      return;
    }
    setAppliedCoupon(coupon);
  };

  /**
   * 쿠폰 취소 핸들러
   */
  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
  };

  // 토스페이먼츠 결제 성공 처리
  const handlePaymentSuccess = async (paymentResult) => {
    try {
      setIsLoading(true);

      // 백엔드 DTO(PaymentRequestDto) 스펙에 맞춰 평탄화하여 전송
      const identifiers = getReservationIdentifiers({
        lockStartedAtOverride: paymentDraft.meta.lockInitialAt,
      });
      logReservationIdentifiers("ReservationClient: handlePaymentSuccess", {
        sessionId: identifiers.sessionId,
        tabId: identifiers.tabId,
        lockId: paymentDraft.meta.lockId,
        lockInitialAt:
          paymentDraft.meta.lockInitialAt || identifiers.lockStartedAt,
      });

      const payload = {
        paymentKey: paymentResult.paymentKey,
        orderId: paymentResult.orderId,
        amount: paymentAmounts.actualPaymentAmount, // 카드 결제 금액
        type: "hotel_reservation",
        customerIdx: paymentInfo.customerIdx,
        contentId: paymentDraft.meta.contentId,
        roomId: paymentDraft.meta.roomIdx || paymentDraft.meta.roomId,
        checkIn: paymentDraft.meta.checkIn,
        checkOut: paymentDraft.meta.checkOut,
        lockId: paymentDraft.meta.lockId || null,
        sessionId: identifiers.sessionId,
        tabId: identifiers.tabId,
        lockInitialAt:
          paymentDraft.meta.lockInitialAt || identifiers.lockStartedAt,
        guests: paymentDraft.meta.guests,
        nights: paymentDraft.meta.nights,
        roomPrice: paymentDraft.meta.roomPrice,
        // totalPrice는 쿠폰 할인 전 원래 금액 (백엔드에서 쿠폰 할인을 차감하기 위해 필요)
        totalPrice: paymentDraft.finalAmount,
        customerName: paymentInfo.customerName,
        customerEmail: paymentInfo.customerEmail,
        customerPhone: paymentInfo.customerPhone,
        specialRequests: paymentInfo.specialRequests,
        method:
          paymentAmounts.actualPaymentAmount > 0 ? "mixed" : "cash_point_only",
        pointsUsed: Number(paymentAmounts.usePoint || 0),
        cashUsed: Number(paymentAmounts.useCash || 0),
        couponIdx: appliedCoupon?.couponIdx || null,
        couponDiscount: appliedCoupon?.discountAmount || 0,
      };
      // 디버깅을 위한 콘솔 출력 (민감정보 제외)
      console.log("[CONFIRM] payload:", {
        orderId: payload.orderId,
        amount: payload.amount,
        type: payload.type,
        customerIdx: payload.customerIdx,
        contentId: payload.contentId,
        roomId: payload.roomId,
        totalPrice: payload.totalPrice,
        pointsUsed: payload.pointsUsed,
        cashUsed: payload.cashUsed,
        couponIdx: payload.couponIdx,
        couponDiscount: payload.couponDiscount,
        specialRequestsLen: payload.specialRequests?.length || 0,
      });
      try {
        if (typeof window !== "undefined") {
          sessionStorage.setItem("lastPaymentPayload", JSON.stringify(payload));
        }
      } catch {}
      await axios.post("/payments/confirm", payload);

      clearPaymentDraft();
      const params = new URLSearchParams({
        orderId: paymentResult.orderId,
        paymentKey: paymentResult.paymentKey,
        amount: paymentAmounts.actualPaymentAmount.toString(),
        type: "hotel_reservation",
        confirmed: "1",
      });
      router.push(`/checkout/success?${params.toString()}`);
    } catch (error) {
      console.error("결제 완료 처리 오류:", error);
      alert(
        "결제는 완료되었지만 처리 중 오류가 발생했습니다. 고객센터에 문의해주세요."
      );
    } finally {
      setIsLoading(false);
    }
  };

  // 토스페이먼츠 결제 실패 처리
  const handlePaymentFail = (error) => {
    console.error("결제 실패:", error);
    router.push(
      `/checkout/fail?error=${encodeURIComponent(
        error.message || "결제가 취소되었습니다."
      )}`
    );
  };

  // 포인트/캐시 전액 사용 시 결제 버튼 비활성화
  const isCashPointOnly = paymentAmounts.actualPaymentAmount <= 0;

  if (gateContent) return gateContent;

  const getRoomImageUrl = () => {
    if (!paymentDraft?.meta) return `${ROOM_IMAGE_BASE_URL}default.jpg`;
    const imagePath = paymentDraft.meta.roomImage;
    if (!imagePath || imagePath.trim() === "") {
      return `${ROOM_IMAGE_BASE_URL}default.jpg`;
    }
    return imagePath.startsWith("http")
      ? imagePath
      : `${ROOM_IMAGE_BASE_URL}${imagePath}`;
  };

  return (
    <ReservationLockWrapper>
      {({ handleCancel }) => (
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              호텔 예약 결제
            </h1>
            <p className="text-gray-600">
              예약 정보를 확인하고 결제를 진행해주세요.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* 호텔 정보 및 예약자 정보 */}
            <div className="lg:col-span-2 space-y-6">
              {/* 호텔 정보 */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  예약 정보
                </h2>
                <div className="flex gap-6">
                  <div className="relative h-36 w-40 flex-shrink-0 overflow-hidden rounded-lg">
                    <Image
                      src={getRoomImageUrl()}
                      alt={paymentDraft.meta.roomName || "호텔 이미지"}
                      fill
                      sizes="160px"
                      className="object-cover"
                      onError={(event) => {
                        event.currentTarget.src = `${ROOM_IMAGE_BASE_URL}default.jpg`;
                      }}
                    />
                  </div>

                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {paymentDraft.meta.hotelName}
                    </h3>
                    <p className="text-gray-600 mb-2">
                      {paymentDraft.meta.roomName}
                    </p>
                    <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                      <div>
                        <span className="font-medium">체크인:</span>{" "}
                        {paymentDraft.meta.checkIn}
                      </div>
                      <div>
                        <span className="font-medium">체크아웃:</span>{" "}
                        {paymentDraft.meta.checkOut}
                      </div>
                      <div>
                        <span className="font-medium">숙박 일수:</span>{" "}
                        {paymentDraft.meta.nights}박
                      </div>
                      <div>
                        <span className="font-medium">게스트:</span>{" "}
                        {paymentDraft.meta.guests}명
                      </div>
                      <div>
                        <span className="font-medium">객실 가격:</span> ₩
                        {paymentDraft.meta.roomPrice.toLocaleString()}/박
                      </div>
                      <div>
                        <span className="font-medium">총 가격:</span> ₩
                        {paymentDraft.meta.totalPrice.toLocaleString()}
                      </div>
                    </div>

                    {/* 편의시설 */}
                    {paymentDraft.meta.amenities &&
                      paymentDraft.meta.amenities.length > 0 && (
                        <div className="mt-3">
                          <span className="text-sm font-medium text-gray-700">
                            편의시설:
                          </span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {paymentDraft.meta.amenities.map((amenity, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded"
                              >
                                {amenity}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                  </div>
                </div>
              </div>

              {/* 예약자 정보 */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  예약자 정보
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      예약자 이름 *
                    </label>
                    <input
                      type="text"
                      value={paymentInfo.customerName}
                      onChange={(e) =>
                        handleInputChange("customerName", e.target.value)
                      }
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.customerName
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                      placeholder="예약자 이름을 입력하세요"
                    />
                    {errors.customerName && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.customerName}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      이메일 *
                    </label>
                    <input
                      type="email"
                      value={paymentInfo.customerEmail}
                      onChange={(e) =>
                        handleInputChange("customerEmail", e.target.value)
                      }
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.customerEmail
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                      placeholder="이메일을 입력하세요"
                    />
                    {errors.customerEmail && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.customerEmail}
                      </p>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      전화번호 *
                    </label>
                    <input
                      type="tel"
                      value={paymentInfo.customerPhone}
                      onChange={(e) =>
                        handleInputChange("customerPhone", e.target.value)
                      }
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.customerPhone
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                      placeholder="전화번호를 입력하세요"
                    />
                    {errors.customerPhone && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.customerPhone}
                      </p>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      특별 요청사항
                    </label>
                    <textarea
                      value={paymentInfo.specialRequests}
                      onChange={(e) =>
                        handleInputChange("specialRequests", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="특별 요청사항이 있으시면 입력해주세요"
                      rows={3}
                    />
                  </div>
                </div>
              </div>

              {/* 약관 동의 */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  약관 동의
                </h2>
                <div className="space-y-3">
                  <label className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={paymentInfo.agreeTerms}
                      onChange={(e) =>
                        handleInputChange("agreeTerms", e.target.checked)
                      }
                      className="mt-1"
                    />
                    <span className="text-sm text-gray-700">
                      <span className="text-red-500">*</span> 호텔 이용약관에
                      동의합니다.
                    </span>
                  </label>
                  {errors.agreeTerms && (
                    <p className="text-red-500 text-sm">{errors.agreeTerms}</p>
                  )}

                  <label className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={paymentInfo.agreePrivacy}
                      onChange={(e) =>
                        handleInputChange("agreePrivacy", e.target.checked)
                      }
                      className="mt-1"
                    />
                    <span className="text-sm text-gray-700">
                      <span className="text-red-500">*</span> 개인정보처리방침에
                      동의합니다.
                    </span>
                  </label>
                  {errors.agreePrivacy && (
                    <p className="text-red-500 text-sm">
                      {errors.agreePrivacy}
                    </p>
                  )}
                </div>
                <p className="mt-4 text-xs text-gray-600">
                  포인트 악용 시 계정 정지 및 환불 불가합니다. 쿠폰은 환불 시
                  복구되지 않습니다.
                </p>
              </div>

              {/* 토스페이먼츠 결제 위젯 */}
              {isFormValid && paymentAmounts.actualPaymentAmount > 0 && (
                <TossPaymentsWidget
                  key={paymentKeys.orderId}
                  clientKey={process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY}
                  customerKey={paymentKeys.customerKey}
                  amount={paymentAmounts.actualPaymentAmount}
                  orderId={paymentKeys.orderId}
                  orderName={paymentDraft.orderName}
                  customerName={paymentInfo.customerName}
                  customerEmail={paymentInfo.customerEmail}
                  customerMobilePhone={paymentInfo.customerPhone}
                  hotelInfo={{
                    contentId: paymentDraft.meta.contentId,
                    hotelName: paymentDraft.meta.hotelName,
                    roomId:
                      paymentDraft.meta.roomIdx || paymentDraft.meta.roomId,
                    roomIdx:
                      paymentDraft.meta.roomIdx || paymentDraft.meta.roomId,
                    roomName: paymentDraft.meta.roomName,
                    checkIn: paymentDraft.meta.checkIn,
                    checkOut: paymentDraft.meta.checkOut,
                    guests: paymentDraft.meta.guests,
                    nights: paymentDraft.meta.nights,
                    roomPrice: paymentDraft.meta.roomPrice,
                    totalPrice: paymentDraft.meta.totalPrice,
                    roomImage: paymentDraft.meta.roomImage,
                    amenities: paymentDraft.meta.amenities,
                  }}
                  customerInfo={{
                    customerIdx: paymentInfo.customerIdx,
                    name: paymentInfo.customerName,
                    email: paymentInfo.customerEmail,
                    phone: paymentInfo.customerPhone,
                    specialRequests: paymentInfo.specialRequests,
                    useCash: paymentAmounts.useCash,
                    usePoint: paymentAmounts.usePoint,
                    actualPaymentAmount: paymentAmounts.actualPaymentAmount,
                    couponIdx: appliedCoupon?.couponIdx || null,
                    couponDiscount: appliedCoupon?.discountAmount || 0,
                  }}
                  onSuccess={handlePaymentSuccess}
                  onFail={handlePaymentFail}
                />
              )}
            </div>

            {/* 가격 요약 */}
            <div className="lg:col-span-1">
              <PaymentSummary
                paymentDraft={paymentDraft}
                remainingSeconds={remainingSeconds}
                customerCash={paymentInfo.customerCash}
                customerPoint={paymentInfo.customerPoint}
                useCash={paymentInfo.useCash}
                usePoint={paymentInfo.usePoint}
                onCashChange={handleCashChange}
                onPointChange={handlePointChange}
                onUseAllCash={useAllCash}
                onUseAllPoint={useAllPoint}
                availableCoupons={availableCoupons}
                onSelectCoupon={handleSelectCoupon}
                onRemoveCoupon={handleRemoveCoupon}
                appliedCoupon={appliedCoupon}
                isCouponLoading={isCouponLoading}
                paymentAmounts={paymentAmounts}
                isFormValid={isFormValid}
                isLoading={isLoading}
                isCashPointOnly={isCashPointOnly}
                onPaymentClick={async () => {
                  // 캐시/포인트 전액 사용 시 경고
                  if (isCashPointOnly) {
                    alert(
                      "포인트 및 캐시만으로는 전액 결제할 수 없습니다. 최소 10%는 카드로 결제해야 합니다."
                    );
                    return;
                  }

                  // 성공 페이지 병합을 위한 직전 결제 페이로드 저장 (모바일 리다이렉트 대비)
                  try {
                    const lastPayload = {
                      // 공통 결제 필드
                      type: "hotel_reservation",
                      customerIdx: paymentInfo.customerIdx,
                      customerEmail: paymentInfo.customerEmail,
                      customerName: paymentInfo.customerName,
                      customerPhone: paymentInfo.customerPhone,
                      // 호텔 메타
                      contentId: paymentDraft?.meta?.contentId,
                      roomId:
                        paymentDraft?.meta?.roomIdx ||
                        paymentDraft?.meta?.roomId,
                      checkIn: paymentDraft?.meta?.checkIn,
                      checkOut: paymentDraft?.meta?.checkOut,
                      guests: paymentDraft?.meta?.guests,
                      nights: paymentDraft?.meta?.nights,
                      roomPrice: paymentDraft?.meta?.roomPrice,
                      // 금액 정보 (원래 금액)
                      totalPrice:
                        paymentDraft?.finalAmount ||
                        paymentAmounts?.totalAmount,
                      // 고객 입력값
                      specialRequests: paymentInfo.specialRequests || "",
                      pointsUsed: Number(paymentAmounts?.usePoint || 0),
                      cashUsed: Number(paymentAmounts?.useCash || 0),
                      // 쿠폰
                      couponIdx: appliedCoupon?.couponIdx ?? null,
                      couponDiscount: Number(
                        appliedCoupon?.discountAmount || 0
                      ),
                    };
                    if (typeof window !== "undefined") {
                      sessionStorage.setItem(
                        "lastPaymentPayload",
                        JSON.stringify(lastPayload)
                      );
                    }
                    console.log("[PAY] lastPaymentPayload 저장:", {
                      pointsUsed: lastPayload.pointsUsed,
                      cashUsed: lastPayload.cashUsed,
                      specialRequestsLen:
                        lastPayload.specialRequests?.length || 0,
                      couponIdx: lastPayload.couponIdx,
                      couponDiscount: lastPayload.couponDiscount,
                    });
                  } catch (e) {
                    console.warn("lastPaymentPayload 저장 실패(무시):", e);
                  }

                  if (window.tossPaymentHandler) {
                    try {
                      await window.tossPaymentHandler();
                    } catch (error) {
                      console.error("결제 요청 실패:", error);
                      alert("결제 요청 중 오류가 발생했습니다.");
                    }
                  } else {
                    alert(
                      "토스페이먼츠가 아직 로드되지 않았습니다. 잠시 후 다시 시도해주세요."
                    );
                  }
                }}
                onValidateForm={validateForm}
                onCancel={handleCancel}
              />
            </div>
          </div>
        </div>
      )}
    </ReservationLockWrapper>
  );
};

export default ReservationClient;
