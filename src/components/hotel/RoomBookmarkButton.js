"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCustomerStore } from "@/stores/customerStore";
import axiosInstance from "@/lib/axios";

/**
 * 방 찜하기 버튼 컴포넌트
 * @param {Object} props
 * @param {string|number} props.roomIdx - 방 ID
 * @param {string|number} props.contentId - 호텔 ID
 * @param {string} [props.size="small"] - 버튼 크기 ("small" | "medium" | "large")
 * @param {string} [props.className] - 추가 CSS 클래스
 */
const RoomBookmarkButton = ({
  roomIdx,
  contentId,
  size = "small",
  className = "",
}) => {
  const router = useRouter();
  const inlogged = useCustomerStore((state) => state.inlogged);
  const [bookmarkedRooms, setBookmarkedRooms] = useState(new Set());
  const roomsave_url = "/bookmark/roombookmark/save";
  const roombookmarklist_url = "/bookmark/roombookmark/onelist";
  const roombookmarkdelete_url = "/bookmark/roombookmark/delete";

  // 로그인 상태일 때 북마크 목록 가져오기
  useEffect(() => {
    if (inlogged && contentId) {
      axiosInstance
        .get(roombookmarklist_url, { params: { contentId: contentId } })
        .then((res) => {
          // 북마크 목록에서 roomIdx 추출하여 Set에 추가
          if (res.data && Array.isArray(res.data)) {
            const bookmarkRoomIds = res.data.map(
              (bookmark) => bookmark.roomIdx || bookmark
            );
            setBookmarkedRooms(new Set(bookmarkRoomIds));
          }
        })
        .catch((err) => {
          //방 북마크 에러
        });
    } else {
      // 로그아웃 상태일 때: 북마크 목록 초기화
      setBookmarkedRooms(new Set());
    }
  }, [inlogged, contentId]);

  // 크기별 스타일 설정
  const sizeClasses = {
    small: "w-6 h-6",
    medium: "w-8 h-8",
    large: "w-10 h-10",
  };

  const iconSizes = {
    small: "16",
    medium: "20",
    large: "24",
  };

  const isBookmarked = bookmarkedRooms.has(roomIdx);

  const handleClick = (e) => {
    e.stopPropagation();

    // 로그인하지 않은 경우 확인 후 로그인 페이지로 이동
    if (!inlogged) {
      const shouldLogin = confirm(
        "로그인이 필요합니다.\n로그인 페이지로 이동하시겠습니까?"
      );
      if (shouldLogin) {
        // 현재 URL을 returnUrl로 전달
        const currentUrl =
          typeof window !== "undefined"
            ? window.location.pathname + window.location.search
            : "/";
        router.push(`/login?returnUrl=${encodeURIComponent(currentUrl)}`);
      }
      return;
    }

    if (isBookmarked) {
      // 꽉 찬 하트일 때: 북마크 삭제
      axiosInstance
        .get(roombookmarkdelete_url, { params: { roomIdx: roomIdx } })
        .then((res) => {
          // 삭제 성공 시 상태 업데이트
          if (res.data && res.data.includes("success")) {
            setBookmarkedRooms((prev) => {
              const newSet = new Set(prev);
              newSet.delete(roomIdx);
              return newSet;
            });
          }
        })
        .catch((err) => {
          //북마크 삭제 에러
        });
    } else {
      // 빈 하트일 때: 북마크 추가
      axiosInstance
        .get(roomsave_url, {
          params: { roomIdx: roomIdx, contentId: contentId },
        })
        .then((res) => {
          //방 찜하기 클릭
          // res.data에 success가 포함되어 있으면 찜하기 상태 업데이트
          if (res.data && res.data.includes("success")) {
            setBookmarkedRooms((prev) => {
              const newSet = new Set(prev);
              newSet.add(roomIdx);
              return newSet;
            });
          }
        })
        .catch((err) => {
          //방찜 에러
        });
    }
  };

  return (
    <button
      onClick={handleClick}
      className={`${sizeClasses[size]} bg-white rounded-full flex items-center justify-center shadow-md hover:shadow-lg transition-all duration-200 hover:scale-110 ${className}`}
      aria-label="방 찜하기"
    >
      {isBookmarked ? (
        // 꽉 찬 하트
        <svg
          width={iconSizes[size]}
          height={iconSizes[size]}
          viewBox="0 0 24 24"
          fill="#FF0000"
          stroke="#FF0000"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
        </svg>
      ) : (
        // 빈 하트
        <svg
          width={iconSizes[size]}
          height={iconSizes[size]}
          viewBox="0 0 24 24"
          fill="none"
          stroke="#FF0000"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
        </svg>
      )}
    </button>
  );
};

export default RoomBookmarkButton;
