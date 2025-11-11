"use client";

import { useMemo, useEffect } from "react";
import { Calendar, ChevronDown, MapPin } from "lucide-react";

import Pagination from "@/components/Pagination";

export default function ReservationSection({
  reservationTab,
  setReservationTab,
  reservationType,
  setReservationType,
  reservationCounts,
  reservations,
  diningReservations,
  usedItems,
  usedItemsLoading,
  sortBy,
  setSortBy,
  currentPage,
  setCurrentPage,
  pageSize,
  totalPages,
  totalElements,
  setTotalPages,
  setTotalElements,
  reservationsLoading,
  handlePageChange,
  isReviewWritten,
  isTradeRegistered,
  isTradeCompleted,
  isReported,
  handleReservationDetail,
  handleHotelLocation,
  handleCancelReservation,
  handleWriteReview,
  handleRebook,
  handleReport,
  handleRegisterTrade,
  handleEditTrade,
}) {
  const isDining = reservationType === "dining";
  const isUsed = reservationTab === "used";
  const currentReservations = isDining
    ? diningReservations[reservationTab]
    : reservations[reservationTab];

  const sortedReservations = useMemo(() => {
    let allReservations = [...(currentReservations || [])];
    const currentSortBy = sortBy[reservationTab];

    // 중고거래 탭인 경우 상태 필터링
    if (isUsed) {
      // 상태 필터 적용
      if (currentSortBy !== "all") {
        const statusFilter = parseInt(currentSortBy);
        allReservations = allReservations.filter(
          (reservation) => reservation.usedItemStatus === statusFilter
        );
      }
      // 상태별로 필터링 후 체크인 날짜 기준 내림차순 정렬
      return allReservations.sort((a, b) => {
        const aDate = new Date((a.checkIn || "").replace(/\./g, "-") || a.checkIn);
        const bDate = new Date((b.checkIn || "").replace(/\./g, "-") || b.checkIn);
        return bDate - aDate; // 최신순
      });
    }

    // 일반 탭의 경우 기존 정렬 로직
    return allReservations.sort((a, b) => {
      switch (currentSortBy) {
        case "checkinDesc": {
          const aDate = new Date(
            ((isDining ? a.reservationDate : a.checkIn) || "").replace(
              /\./g,
              "-"
            ) || (isDining ? a.reservationDate : a.checkIn)
          );
          const bDate = new Date(
            ((isDining ? b.reservationDate : b.checkIn) || "").replace(
              /\./g,
              "-"
            ) || (isDining ? b.reservationDate : b.checkIn)
          );
          return bDate - aDate;
        }
        case "checkinAsc": {
          const aDate = new Date(
            ((isDining ? a.reservationDate : a.checkIn) || "").replace(
              /\./g,
              "-"
            ) || (isDining ? a.reservationDate : a.checkIn)
          );
          const bDate = new Date(
            ((isDining ? b.reservationDate : b.checkIn) || "").replace(
              /\./g,
              "-"
            ) || (isDining ? b.reservationDate : b.checkIn)
          );
          return aDate - bDate;
        }
        case "priceDesc":
          return (
            (b.totalPrice || b.totalprice || 0) -
            (a.totalPrice || a.totalprice || 0)
          );
        case "priceAsc":
          return (
            (a.totalPrice || a.totalprice || 0) -
            (b.totalPrice || b.totalprice || 0)
          );
        case "checkoutDesc": {
          if (isDining) {
            const aDate = new Date(
              (a.reservationDate || "").replace(/\./g, "-") || a.reservationDate
            );
            const bDate = new Date(
              (b.reservationDate || "").replace(/\./g, "-") || b.reservationDate
            );
            return bDate - aDate;
          }
          const aDate = new Date(
            (a.checkOut || "").replace(/\./g, "-") || a.checkOut
          );
          const bDate = new Date(
            (b.checkOut || "").replace(/\./g, "-") || b.checkOut
          );
          return bDate - aDate;
        }
        case "reviewFirst": {
          const aHasReview = isReviewWritten(a);
          const bHasReview = isReviewWritten(b);
          if (aHasReview === bHasReview) {
            if (isDining) {
              const aDate = new Date(
                (a.reservationDate || "").replace(/\./g, "-") ||
                  a.reservationDate
              );
              const bDate = new Date(
                (b.reservationDate || "").replace(/\./g, "-") ||
                  b.reservationDate
              );
              return bDate - aDate;
            }
            const aDate = new Date(
              (a.checkOut || "").replace(/\./g, "-") || a.checkOut
            );
            const bDate = new Date(
              (b.checkOut || "").replace(/\./g, "-") || b.checkOut
            );
            return bDate - aDate;
          }
          return aHasReview ? 1 : -1;
        }
        default:
          return 0;
      }
    });
  }, [currentReservations, isDining, reservationTab, sortBy, isReviewWritten, isUsed]);

  const paginatedReservations = useMemo(() => {
    const startIndex = currentPage * pageSize;
    const endIndex = startIndex + pageSize;
    return sortedReservations.slice(startIndex, endIndex);
  }, [currentPage, pageSize, sortedReservations]);

  const totalItems = sortedReservations.length;
  const totalPagesCount = useMemo(() => {
    if (pageSize <= 0) return 0;
    return Math.ceil(totalItems / pageSize);
  }, [pageSize, totalItems]);

  useEffect(() => {
    setTotalPages(totalPagesCount);
    setTotalElements(totalItems);
  }, [setTotalElements, setTotalPages, totalItems, totalPagesCount]);

  const renderReservationCards = () =>
    paginatedReservations.map((reservation) => {
      // 중고거래 탭인 경우 판매 가격 사용, 그 외에는 실제 결제 금액 사용
      const totalPayment = isUsed && reservation.usedItemPrice !== undefined && reservation.usedItemPrice !== null
        ? reservation.usedItemPrice
        : (reservation.totalPrice ?? reservation.totalprice ?? 0);
      const paidCash = reservation.cashUsed ?? 0;
      const paidPoints = reservation.pointsUsed ?? 0;
      const refundAmount = reservation.refundAmount ?? 0;
      const refundCash = reservation.refundCash ?? 0;
      const refundPoint = reservation.refundPoint ?? 0;
      const paymentLabel = isUsed
        ? "판매 가격"
        : (reservationTab === "cancelled" ? "총 결제금액" : "실제 결제 금액");
      const showRefundInfo =
        reservationTab === "cancelled" &&
        reservation.refundAmount !== null &&
        reservation.refundAmount !== undefined;

      return (
        <div
          key={reservation.id || reservation.reservationNumber}
          className="border border-gray-200 rounded-xl p-5 hover:shadow-md transition-all"
        >
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">
                {isDining
                  ? reservation.diningName || reservation.hotelName
                  : reservation.hotelName}
              </h3>
              <p className="text-sm text-gray-500 flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                {reservation.location}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {reservationTab === "upcoming" &&
                reservation.status === "예약확정" &&
                !isTradeCompleted(reservation) &&
                reservationType === "hotel" && (
                  <button
                    onClick={() =>
                      isTradeRegistered(reservation)
                        ? handleEditTrade(reservation)
                        : handleRegisterTrade(reservation)
                    }
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                      isTradeRegistered(reservation)
                        ? "bg-blue-50 hover:bg-blue-100 text-blue-600"
                        : "bg-green-50 hover:bg-green-100 text-green-600"
                    }`}
                  >
                    {isTradeRegistered(reservation)
                      ? "양도거래 수정"
                      : "양도거래 등록"}
                  </button>
                )}
              {isUsed &&
                reservation.usedItemStatus === 0 && // 판매중 상태
                reservationType === "hotel" && (
                  <button
                    onClick={() => handleEditTrade(reservation)}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap bg-blue-50 hover:bg-blue-100 text-blue-600"
                  >
                    판매게시물 수정
                  </button>
                )}
              {reservationTab === "completed" &&
                reservation.status === "이용완료" &&
                reservationType === "hotel" &&
                reservation.contentId &&
                !isReported(reservation) && (
                  <button
                    onClick={() => handleReport(reservation)}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap bg-red-50 hover:bg-red-100 text-red-600"
                  >
                    신고
                  </button>
                )}
              {reservationTab === "completed" &&
                reservation.status === "이용완료" &&
                reservationType === "hotel" &&
                reservation.contentId &&
                isReported(reservation) && (
                  <span className="px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-100 text-gray-500 whitespace-nowrap">
                    신고 완료
                  </span>
                )}
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  // 중고거래 탭인 경우 UsedItem 상태 표시
                  isUsed && reservation.usedItemStatus !== undefined && reservation.usedItemStatus !== null
                    ? reservation.usedItemStatus === 0
                      ? "bg-blue-100 text-blue-700" // 판매중
                      : reservation.usedItemStatus === 1
                      ? "bg-yellow-100 text-yellow-700" // 거래중
                      : reservation.usedItemStatus === 2
                      ? "bg-green-100 text-green-700" // 판매완료
                      : reservation.usedItemStatus === 3
                      ? "bg-gray-100 text-gray-700" // 기간만료
                      : reservation.usedItemStatus === 4
                      ? "bg-red-100 text-red-700" // 판매취소
                      : "bg-gray-100 text-gray-700"
                    : reservation.status === "예약확정"
                    ? "bg-blue-100 text-blue-700"
                    : reservation.status === "이용완료"
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {isUsed && reservation.usedItemStatus !== undefined && reservation.usedItemStatus !== null
                  ? reservation.usedItemStatus === 0
                    ? "판매중"
                    : reservation.usedItemStatus === 1
                    ? "거래중"
                    : reservation.usedItemStatus === 2
                    ? "판매완료"
                    : reservation.usedItemStatus === 3
                    ? "기간만료"
                    : reservation.usedItemStatus === 4
                    ? "판매취소"
                    : reservation.status
                  : reservation.status}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
            {reservationType === "dining" ? (
              <>
                <div>
                  <span className="text-gray-500">예약 날짜</span>
                  <p className="font-medium text-gray-900">
                    {reservation.reservationDate || reservation.checkIn}
                  </p>
                </div>
                <div>
                  <span className="text-gray-500">예약 시간</span>
                  <p className="font-medium text-gray-900">
                    {reservation.reservationTime || "-"}
                  </p>
                </div>
                <div>
                  <span className="text-gray-500">인원 수</span>
                  <p className="font-medium text-gray-900">
                    {reservation.guest || 1}명
                  </p>
                </div>
                <div>
                  <span className="text-gray-500">{paymentLabel}</span>
                  <p className="font-bold text-blue-600">
                    {totalPayment.toLocaleString()}원
                  </p>
                </div>
              </>
            ) : (
              <>
                <div>
                  <span className="text-gray-500">체크인</span>
                  <p className="font-medium text-gray-900">
                    {reservation.checkIn}
                  </p>
                </div>
                <div>
                  <span className="text-gray-500">체크아웃</span>
                  <p className="font-medium text-gray-900">
                    {reservation.checkOut}
                  </p>
                </div>
                <div>
                  <span className="text-gray-500">객실타입</span>
                  <p className="font-medium text-gray-900">
                    {reservation.roomType}
                  </p>
                </div>
                <div>
                  <span className="text-gray-500">{paymentLabel}</span>
                  {reservationTab === "cancelled" ? (
                    <p className="font-bold text-blue-600">
                      {totalPayment.toLocaleString()}원
                      <span className="block text-xs text-gray-500">
                        (캐시:{paidCash.toLocaleString()}원 / 포인트:
                        {paidPoints.toLocaleString()}원)
                      </span>
                    </p>
                  ) : (
                    <p className="font-bold text-blue-600">
                      {totalPayment.toLocaleString()}원
                    </p>
                  )}
                </div>
              </>
            )}
          </div>

          <div className="flex gap-2">
            {reservationTab === "upcoming" && (
              <>
                <button
                  onClick={() =>
                    handleReservationDetail(reservation.id, reservationType)
                  }
                  className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                >
                  예약 상세보기
                </button>
                {!isDining && (
                  <button
                    onClick={() => handleHotelLocation(reservation)}
                    className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
                  >
                    호텔 위치보기
                  </button>
                )}
                <button
                  onClick={() => handleCancelReservation(reservation)}
                  className="flex-1 px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg font-medium transition-colors"
                >
                  예약 취소
                </button>
              </>
            )}
            {reservationTab === "completed" && (
              <>
                <button
                  onClick={() =>
                    !isReviewWritten(reservation) &&
                    handleWriteReview(reservation)
                  }
                  disabled={isReviewWritten(reservation)}
                  className={`flex-1 px-4 py-2.5 rounded-lg font-medium transition-colors ${
                    isReviewWritten(reservation)
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700 text-white"
                  }`}
                >
                  리뷰 작성
                </button>
                {!isDining && (
                  <button
                    onClick={() => handleRebook(reservation)}
                    className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
                  >
                    재예약하기
                  </button>
                )}
              </>
            )}
            {reservationTab === "cancelled" && (
              <div className="flex-1 text-sm space-y-1">
                {showRefundInfo && (
                  <p className="text-gray-600">
                    환불 금액:{" "}
                    <span className="font-bold text-blue-600">
                      {refundAmount.toLocaleString()}원
                    </span>
                    {reservationType !== "dining" && (
                      <span className="ml-1 text-xs text-gray-500">
                        (캐시:{refundCash.toLocaleString()}원 / 포인트:
                        {refundPoint.toLocaleString()}원)
                      </span>
                    )}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      );
    });

  const renderEmptyState = () => (
    <div className="text-center py-12">
      <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
        <Calendar className="w-8 h-8 text-gray-400" />
      </div>
      <p className="text-gray-500 text-lg font-medium">
        내역이 존재하지 않습니다
      </p>
    </div>
  );

  const currentReservationsLength = sortedReservations.length;

  return (
    <section
      id="reservation-section"
      className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-gray-200"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Calendar className="w-6 h-6 text-blue-600" />
            예약 내역
          </h2>
          <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => {
                setReservationType("hotel");
                setCurrentPage(0);
              }}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
                reservationType === "hotel"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              숙소
            </button>
            <button
              onClick={() => {
                setReservationType("dining");
                setCurrentPage(0);
              }}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
                reservationType === "dining"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              다이닝
            </button>
          </div>
        </div>
        <div className="relative">
          <select
            value={sortBy[reservationTab]}
            onChange={(e) => {
              setSortBy((prev) => ({
                ...prev,
                [reservationTab]: e.target.value,
              }));
              setCurrentPage(0);
            }}
            className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 text-sm font-medium text-gray-700 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer"
          >
            {reservationTab === "upcoming" && (
              <>
                <option value="checkinAsc">체크인 날짜 가까운 순</option>
                <option value="checkinDesc">체크인 날짜 먼 순</option>
                <option value="priceDesc">높은 가격순</option>
                <option value="priceAsc">낮은 가격순</option>
              </>
            )}
            {reservationTab === "completed" && (
              <>
                <option value="checkoutDesc">최근 방문 순</option>
                <option value="checkinDesc">체크인 날짜 최신순</option>
                <option value="checkinAsc">체크인 날짜 오래된순</option>
                <option value="priceDesc">높은 가격순</option>
                <option value="priceAsc">낮은 가격순</option>
                <option value="reviewFirst">리뷰 작성 안한 내역순</option>
              </>
            )}
            {reservationTab === "cancelled" && (
              <>
                <option value="checkinDesc">취소 날짜 최신순</option>
                <option value="checkinAsc">취소 날짜 오래된순</option>
                <option value="priceDesc">높은 가격순</option>
                <option value="priceAsc">낮은 가격순</option>
              </>
            )}
            {isUsed && (
              <>
                <option value="all">전체</option>
                <option value="0">판매중</option>
                <option value="1">거래중</option>
                <option value="2">판매완료</option>
                <option value="3">기간만료</option>
                <option value="4">판매취소</option>
              </>
            )}
          </select>
          <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
        </div>
      </div>

      <div className="flex gap-2 mb-6 border-b border-gray-200">
        <button
          onClick={() => {
            setReservationTab("upcoming");
            setCurrentPage(0);
          }}
          className={`px-6 py-3 font-medium transition-all border-b-2 ${
            reservationTab === "upcoming"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          이용 예정 (
          {reservationType === "dining"
            ? diningReservations.upcoming.length
            : reservationCounts.upcoming || reservations.upcoming.length}
          )
        </button>
        <button
          onClick={() => {
            setReservationTab("completed");
            setCurrentPage(0);
          }}
          className={`px-6 py-3 font-medium transition-all border-b-2 ${
            reservationTab === "completed"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          이용 완료 (
          {reservationType === "dining"
            ? diningReservations.completed.length
            : reservationCounts.completed || reservations.completed.length}
          )
        </button>
        <button
          onClick={() => {
            setReservationTab("cancelled");
            setCurrentPage(0);
          }}
          className={`px-6 py-3 font-medium transition-all border-b-2 ${
            reservationTab === "cancelled"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          취소/환불 (
          {reservationType === "dining"
            ? diningReservations.cancelled.length
            : reservationCounts.cancelled || reservations.cancelled.length}
          )
        </button>
        {/* 중고거래 탭 (숙소일 때만 표시) */}
        {!isDining && (
          <button
            onClick={() => {
              setReservationTab("used");
              setCurrentPage(0);
            }}
            className={`px-6 py-3 font-medium transition-all border-b-2 ${
              reservationTab === "used"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            중고거래 ({reservationCounts?.used || reservations?.used?.length || 0})
          </button>
        )}
      </div>

      <div className="space-y-4">
        {reservationsLoading && (
          <div className="flex justify-center items-center py-12">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="ml-3 text-gray-600">데이터를 불러오는 중...</span>
          </div>
        )}

        {!reservationsLoading && currentReservationsLength === 0 && renderEmptyState()}

        {!reservationsLoading && currentReservationsLength > 0 && renderReservationCards()}
      </div>

      {!reservationsLoading && totalPages > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalElements={totalElements}
          pageSize={pageSize}
          onPageChange={handlePageChange}
        />
      )}
    </section>
  );
}
