"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import SearchCondition from "@/components/hotelSearch/SearchCondition";
import { useRouter } from "next/navigation";

/**
 * 검색 조건 변경 모달 컴포넌트
 * @param {Object} props
 * @param {boolean} props.isOpen - 모달 열림 상태
 * @param {Function} props.onClose - 모달 닫기 함수
 * @param {Object} props.searchParams - 현재 검색 조건
 * @param {Function} [props.onSearchParamsChange] - 검색 조건 변경 콜백 (호텔 디테일용)
 * @param {boolean} [props.isPanelMode=false] - 패널 모드 여부
 */
const SearchConditionModal = ({
  isOpen,
  onClose,
  searchParams,
  onSearchParamsChange,
  isPanelMode = false,
}) => {
  const [localCheckIn, setLocalCheckIn] = useState(searchParams?.checkIn || "");
  const [localCheckOut, setLocalCheckOut] = useState(
    searchParams?.checkOut || ""
  );
  const [localAdults, setLocalAdults] = useState(searchParams?.adults || 2);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // 모달 열릴 때 body scroll lock
  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  const formatDateDisplay = (date) => {
    if (!date) return "";
    const d = new Date(date + "T00:00:00");
    return `${d.getMonth() + 1}.${d.getDate()}. ${
      ["일", "월", "화", "수", "목", "금", "토"][d.getDay()]
    }`;
  };

  const handleDateChange = (newCheckIn, newCheckOut) => {
    setLocalCheckIn(newCheckIn);
    setLocalCheckOut(newCheckOut);
    setIsDatePickerOpen(false);
  };

  const handleApply = () => {
    const nights =
      localCheckIn && localCheckOut
        ? Math.ceil(
            (new Date(localCheckOut) - new Date(localCheckIn)) /
              (1000 * 60 * 60 * 24)
          )
        : 1;

    const newParams = {
      ...searchParams,
      checkIn: localCheckIn,
      checkOut: localCheckOut,
      nights: nights,
      adults: localAdults,
    };

    // 호텔 디테일에서 사용하는 경우 로컬 콜백 사용
    if (onSearchParamsChange) {
      onSearchParamsChange(newParams);
    } else {
      // 호텔 검색 페이지에서 사용하는 경우 URL 업데이트
      if (window.location.pathname.includes("/hotel-search")) {
        const url = new URL(window.location);
        url.searchParams.set("checkIn", localCheckIn);
        url.searchParams.set("checkOut", localCheckOut);
        url.searchParams.set("adults", localAdults);
        router.push(url.pathname + url.search);
      }
    }

    onClose();
  };

  const datePickerModal =
    isDatePickerOpen && typeof window !== "undefined"
      ? createPortal(
          <div
            className="fixed inset-0 z-[10000] flex items-center justify-center p-4"
            style={{
              backgroundColor: "rgba(0, 0, 0, 0.3)",
              backdropFilter: "blur(4px)",
              WebkitBackdropFilter: "blur(4px)",
            }}
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setIsDatePickerOpen(false);
              }
            }}
          >
            <div
              className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-auto transition-all duration-200 ease-out"
              onClick={(e) => e.stopPropagation()}
            >
              <SearchCondition
                isOpen={isDatePickerOpen}
                onClose={() => setIsDatePickerOpen(false)}
                checkIn={localCheckIn}
                checkOut={localCheckOut}
                onDateChange={handleDateChange}
                selectedType="hotel"
                className="w-full"
              />
            </div>
          </div>,
          document.body
        )
      : null;

  if (!isOpen || !mounted) return null;
  const handleBackdropClick = (event) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  const modalCard = (
    <div
      className={`bg-white rounded-xl w-full ${
        isPanelMode ? "max-w-lg" : "max-w-md"
      } max-h-[80vh] overflow-hidden shadow-2xl transition-all duration-200 ease-out`}
      onClick={(event) => event.stopPropagation()}
    >
      {/* 모달 헤더 */}
      <div className="flex items-center justify-between p-4 border-b">
        <h3 className="text-lg font-bold text-gray-900">숙박일정</h3>
        <button
          onClick={onClose}
          className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors"
        >
          <svg
            className="w-5 h-5 text-gray-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      {/* 모달 내용 */}
      <div className="p-4 overflow-y-auto">
        {/* 체크인/체크아웃 선택 */}
        <div className="mb-4">
          <div className="grid grid-cols-2 gap-2">
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                체크인
              </label>
              <div
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white cursor-pointer hover:border-blue-500 transition-colors"
                onClick={() => setIsDatePickerOpen(true)}
              >
                <div className="text-sm text-gray-900">
                  {localCheckIn ? formatDateDisplay(localCheckIn) : "날짜 선택"}
                </div>
              </div>
            </div>
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                체크아웃
              </label>
              <div
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white cursor-pointer hover:border-blue-500 transition-colors"
                onClick={() => setIsDatePickerOpen(true)}
              >
                <div className="text-sm text-gray-900">
                  {localCheckOut
                    ? formatDateDisplay(localCheckOut)
                    : "날짜 선택"}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 인원 선택 */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            인원
          </label>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setLocalAdults(Math.max(1, localAdults - 1))}
              className="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors text-lg font-semibold"
            >
              -
            </button>
            <div className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-center font-medium">
              성인 {localAdults}명
            </div>
            <button
              onClick={() => setLocalAdults(localAdults + 1)}
              className="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors text-lg font-semibold"
            >
              +
            </button>
          </div>
        </div>

        {/* 적용 버튼 */}
        <button
          onClick={handleApply}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium transition-colors"
        >
          적용
        </button>
      </div>
    </div>
  );

  const modalOverlay = (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      role="dialog"
      aria-modal="true"
      aria-label="숙박일정 변경"
      onClick={handleBackdropClick}
    >
      {modalCard}
    </div>
  );

  if (typeof window === "undefined") {
    return null;
  }

  return (
    <>
      {createPortal(modalOverlay, document.body)}
      {datePickerModal}
    </>
  );
};

export default SearchConditionModal;
