"use client";

/**
 * 예약 조건 요약 컴포넌트
 * @param {Object} props
 * @param {Object} props.searchParams - 검색 파라미터
 * @param {Function} props.onEdit - 편집 버튼 클릭 핸들러
 */
const BookingSummary = ({ searchParams, onEdit }) => {
  if (
    !searchParams ||
    (!searchParams.checkIn && !searchParams.checkOut && !searchParams.adults)
  ) {
    return null;
  }

  return (
    <div className="border-t border-gray-200 bg-gray-50 px-2.5 py-3">
      <div
        className="flex items-center justify-between bg-white rounded-lg border border-gray-200 px-4 py-3 cursor-pointer hover:border-blue-500 transition-colors"
        onClick={onEdit}
      >
        <div className="flex items-center gap-4 text-sm text-gray-900">
          {searchParams.checkIn && searchParams.checkOut ? (
            <>
              <span className="font-medium">
                {new Date(searchParams.checkIn).toLocaleDateString("ko-KR", {

                  month: "2-digit",
                  day: "2-digit",
                  weekday: "short",
                })}
              </span>
              <span>~</span>
              <span className="font-medium">
                {new Date(searchParams.checkOut).toLocaleDateString("ko-KR", {
                  month: "2-digit",
                  day: "2-digit",
                  weekday: "short",
                })}
              </span>
            </>
          ) : (
            <span className="text-gray-500">날짜 미선택</span>
          )}
          <span className="text-gray-400">|</span>
          <span className="font-medium">{searchParams.nights || 1}박</span>
          <span className="text-gray-400">|</span>
          <span className="font-medium">성인 {searchParams.adults || 2}명</span>
        </div>
        <div className="flex items-center gap-2">
          <svg
            className="w-4 h-4 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </div>

    </div>
  );
};

export default BookingSummary;
