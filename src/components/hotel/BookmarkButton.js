"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCustomerStore } from "@/stores/customerStore";
import axiosInstance from "@/lib/axios";

/**
 * 찜하기 버튼 컴포넌트
 * @param {Object} props
 * @param {string|number} props.contentId - 호텔 ID
 * @param {string} [props.size="small"] - 버튼 크기 ("small" | "medium" | "large")
 * @param {string} [props.className] - 추가 CSS 클래스
 */
let cachedBookmarkedIds = null;
let bookmarksFetchPromise = null;

const BookmarkButton = ({ contentId, size = "small", className = "" }) => {
  const router = useRouter();
  const inlogged = useCustomerStore((state) => state.inlogged);
  const [bookmarkedHotels, setBookmarkedHotels] = useState(new Set());
  const hotelsave_url = "/bookmark/hotelbookmark/save";
  const hotelbookmarklist_url = "/bookmark/hotelbookmark/list";
  const hotelbookmarkdelete_url = "/bookmark/hotelbookmark/delete";

  // 로그인 상태일 때 북마크 목록 가져오기
  useEffect(() => {
    const resetCache = () => {
      cachedBookmarkedIds = null;
      bookmarksFetchPromise = null;
      setBookmarkedHotels(new Set());
    };

    if (!inlogged) {
      resetCache();
      return;
    }

    const applyBookmarks = (ids) => {
      if (!Array.isArray(ids)) return;
      setBookmarkedHotels(new Set(ids));
    };

    const fetchBookmarks = async () => {
      try {
        const res = await axiosInstance.get(hotelbookmarklist_url);
        if (res.data && Array.isArray(res.data)) {
          cachedBookmarkedIds = res.data.map(
            (bookmark) => bookmark.contentId || bookmark
          );
          applyBookmarks(cachedBookmarkedIds);
        } else {
          cachedBookmarkedIds = [];
          setBookmarkedHotels(new Set());
        }
      } catch (e) {
        //북마크 에러
        cachedBookmarkedIds = [];
        setBookmarkedHotels(new Set());
      } finally {
        bookmarksFetchPromise = null;
      }
    };

    if (cachedBookmarkedIds) {
      applyBookmarks(cachedBookmarkedIds);
      return;
    }

    if (!bookmarksFetchPromise) {
      bookmarksFetchPromise = fetchBookmarks();
    } else {
      bookmarksFetchPromise.then(() => {
        if (cachedBookmarkedIds) applyBookmarks(cachedBookmarkedIds);
      });
    }
  }, [inlogged]);

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

  const isBookmarked = bookmarkedHotels.has(contentId);

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
        .get(hotelbookmarkdelete_url, { params: { contentId: contentId } })
        .then((res) => {
          console.log("북마크 삭제:", res.data);
          // 삭제 성공 시 상태 업데이트
          if (res.data && res.data.includes("success")) {
            setBookmarkedHotels((prev) => {
              const newSet = new Set(prev);
              newSet.delete(contentId);
              return newSet;
            });
            if (cachedBookmarkedIds) {
              cachedBookmarkedIds = cachedBookmarkedIds.filter(
                (id) => id !== contentId
              );
            }
          }
        })
        .catch((e) => {

        });
    } else {
      // 빈 하트일 때: 북마크 추가
      axiosInstance
        .get(hotelsave_url, { params: { contentId: contentId } })
        .then((res) => {
          //찜하기 클릭시
          // res.data에 success가 포함되어 있으면 찜하기 상태 업데이트
          if (res.data && res.data.includes("success")) {
            setBookmarkedHotels((prev) => {
              const newSet = new Set(prev);
              newSet.add(contentId);
              return newSet;
            });
            if (cachedBookmarkedIds) {
              cachedBookmarkedIds = Array.from(
                new Set([...cachedBookmarkedIds, contentId])
              );
            }
          }
        })
        .catch((e) => {
          //찜 에러
        });
    }
  };

  return (
    <button
      onClick={handleClick}
      className={`${sizeClasses[size]} bg-white rounded-full flex items-center justify-center shadow-md hover:shadow-lg transition-all duration-200 hover:scale-110 ${className}`}
      aria-label="찜하기"
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

export default BookmarkButton;
