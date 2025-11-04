"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { usePaymentStore } from "@/stores/paymentStore";
import axiosInstance from "@/lib/axios";

const RoomCard = ({ room, searchParams, formatPrice, isModal = false }) => {
  const router = useRouter();
  const { setPaymentDraft } = usePaymentStore();
  const isReadOnly = !!searchParams?.roomIdx; // roomIdx가 있으면 읽기 전용
  const [isLocking, setIsLocking] = useState(false); // 락 생성 중 상태

  // S3 기본 경로 상수
  const BASE_URL =
    "https://sist-checkin.s3.ap-northeast-2.amazonaws.com/hotelroom/";

  /**
   * @function getImageUrl
   * DB에 저장된 imageUrl(파일명)을 S3 전체 경로로 변환
   * 이미지가 없을 경우 default.jpg 로 대체
   */
  const getImageUrl = (imageUrl) => {
    if (!imageUrl) return `${BASE_URL}default.jpg`;
    return `${BASE_URL}${imageUrl}`;
  };

  // 숙박 일수에 따른 총 가격 계산 (추가 요금 포함)
  const nights = searchParams?.nights || 1;
  const roomPricePerNight = room.price || room.basePrice || 0;
  const totalPrice = roomPricePerNight * nights;

  // 예약 버튼 클릭 핸들러 (락 적용)
  const handleReservation = async () => {
    if (isLocking) return; // 이미 처리 중이면 무시

    setIsLocking(true);

    try {
      // 1단계: 예약 락 생성 준비
      const contentId =
        searchParams?.contentId || searchParams?.hotelId || room?.contentId;
      const roomId = room.roomIdx || room.id;
      const checkIn = String(searchParams?.checkIn || "");

      if (!contentId || !roomId || !checkIn) {
        alert("객실/날짜 정보가 올바르지 않습니다. 날짜를 다시 선택해주세요.");
        setIsLocking(false);
        return;
      }

      // 사전 상태 조회(선택) - 이미 잠금 중이면 UX 알림
      try {
        await axiosInstance.get("/reservations/lock/status", {
          params: {
            contentId: String(contentId),
            roomId: Number(roomId),
            checkIn,
          },
        });
      } catch (_) {}

      const lockResult = await axiosInstance.post("/reservations/lock", {
        contentId: String(contentId),
        roomId: Number(roomId),
        checkIn,
      });

      if (!lockResult.data.success) {
        alert(
          lockResult.data.message || "이미 다른 사용자가 예약 진행 중입니다."
        );
        setIsLocking(false);
        return;
      }

      // 2단계: 락 생성 성공 → 결제 정보 저장 후 이동
      const reservationData = {
        orderId: `hotel_${room.id || Date.now()}_${Math.random()
          .toString(36)
          .substr(2, 9)}`,
        orderName: `${searchParams?.hotelName || "호텔"} - ${room.name}`,
        customerId: "guest",
        email: "",
        finalAmount: totalPrice,
        meta: {
          type: "hotel_reservation",
          contentId: contentId,
          hotelName: searchParams?.hotelName,
          roomId: room.id,
          roomIdx: roomId,
          roomName: room.name,
          checkIn,
          checkOut: searchParams?.checkOut,
          guests: searchParams?.guests || searchParams?.adults || 2,
          nights: nights,
          roomPrice: room.basePrice || room.price,
          totalPrice: totalPrice,
          roomImage: room.imageUrl,
          amenities: room.amenities || [],
        },
      };

      setPaymentDraft(reservationData);
      router.push("/reservation");
    } catch (error) {
      console.error("예약 락 생성 실패:", error);
      if (error?.response?.status === 401) {
        alert("로그인이 필요합니다.");
        setIsLocking(false);
        return;
      }
      const errorMsg =
        error.response?.data?.message || "예약 처리 중 오류가 발생했습니다.";
      alert(errorMsg);
      setIsLocking(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow overflow-hidden">
      {/* 패널 모드는 세로, 일반 모드는 데스크톱에서 가로 */}
      <div className={`flex flex-col ${isModal ? "" : "md:flex-row"}`}>
        {/* 객실 이미지 */}
        <div
          className={`relative w-full flex-shrink-0 bg-gradient-to-br from-blue-100 to-blue-200 ${
            isModal ? "h-56" : "h-48 md:w-64 md:h-64"
          }`}
        >
          {room.imageUrl ? (
            <img
              src={getImageUrl(room.imageUrl)}
              alt={room.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.src = `${BASE_URL}default.jpg`;
              }}
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-5xl mb-2">🛏️</span>
              <span className="text-xs text-gray-600">{room.name}</span>
            </div>
          )}
          {room.discount > 0 && (
            <div className="absolute top-3 left-3 bg-red-500 text-white px-2 py-1 rounded text-xs font-semibold">
              {room.discount}% 할인
            </div>
          )}
        </div>

        {/* 객실 정보 */}
        <div className={`flex-1 flex flex-col ${isModal ? "p-4" : "p-5"}`}>
          {/* 상단: 객실명 & 기본 정보 */}
          <div className="mb-3">
            <h3
              className={`font-bold text-gray-900 mb-2 ${
                isModal ? "text-lg" : "text-xl"
              }`}
            >
              {room.name}
            </h3>
            <div
              className={`flex items-center gap-3 text-gray-600 mb-2 ${
                isModal ? "text-xs flex-wrap" : "text-sm gap-4"
              }`}
            >
              <span>👥 최대 {room.capacity || room.maxOccupancy}인</span>
              {room.size && <span>📏 {room.size}</span>}
              {room.bedType && <span>🛏️ {room.bedType}</span>}
            </div>
            {room.description && !isModal && (
              <p className="text-sm text-gray-600 mb-3">{room.description}</p>
            )}
          </div>

          {/* 예약 가능성 메시지 */}
          {room.availabilityMessage && (
            <div
              className={`mb-2 rounded-lg font-medium ${
                isModal ? "p-2 text-xs" : "p-3 text-sm"
              } ${
                room.isAvailable
                  ? "bg-green-50 text-green-800 border border-green-200"
                  : "bg-red-50 text-red-800 border border-red-200"
              }`}
            >
              {room.availabilityMessage}
            </div>
          )}

          {/* 추가 요금 표시 */}
          {room.additionalFee > 0 && (
            <div
              className={`mb-2 bg-yellow-50 text-yellow-900 rounded-lg border border-yellow-200 ${
                isModal ? "p-2 text-xs" : "p-3 text-sm"
              }`}
            >
              <div className="flex items-center gap-2">
                <span>⚠️</span>
                <span>
                  기본 {room.capacity}인 초과 시 추가 요금:
                  <span className="font-bold ml-1">
                    ₩{formatPrice(room.additionalFee)}
                  </span>
                </span>
              </div>
            </div>
          )}

          {/* 객실 옵션 - 2x2 그리드 */}
          <div
            className={`grid grid-cols-2 gap-2 ${isModal ? "mb-2" : "mb-4"}`}
          >
            <div
              className={`px-3 py-2 text-xs font-medium rounded-lg text-center ${
                !room.isAvailable
                  ? "bg-gray-100 text-gray-400"
                  : room.refundable
                  ? "bg-green-50 text-green-700 border border-green-200"
                  : "bg-gray-100 text-gray-500"
              }`}
            >
              {room.refundable ? "✓ 환불 가능" : "✗ 환불 불가"}
            </div>
            <div
              className={`px-3 py-2 text-xs font-medium rounded-lg text-center ${
                !room.isAvailable
                  ? "bg-gray-100 text-gray-400"
                  : room.breakfastIncluded
                  ? "bg-orange-50 text-orange-700 border border-orange-200"
                  : "bg-gray-100 text-gray-500"
              }`}
            >
              {room.breakfastIncluded ? "✓ 조식 포함" : "✗ 조식 불포함"}
            </div>
            <div
              className={`px-3 py-2 text-xs font-medium rounded-lg text-center ${
                !room.isAvailable
                  ? "bg-gray-100 text-gray-400"
                  : room.smoking
                  ? "bg-red-50 text-red-700 border border-red-200"
                  : "bg-blue-50 text-blue-700 border border-blue-200"
              }`}
            >
              {room.smoking ? "🚬 흡연 가능" : "🚭 금연"}
            </div>
            <div
              className={`px-3 py-2 text-xs font-medium rounded-lg text-center ${
                !room.isAvailable
                  ? "bg-gray-100 text-gray-400"
                  : "bg-blue-50 text-blue-700 border border-blue-200"
              }`}
            >
              {room.roomCount > 1 ? `${room.roomCount}개 객실` : "1개 객실"}
            </div>
          </div>

          {/* 편의시설 - 패널 모드에서는 최대 4개만 표시 */}
          {room.amenities?.length > 0 && (
            <div
              className={`flex flex-wrap gap-2 ${isModal ? "mb-2" : "mb-3"}`}
            >
              {(isModal ? room.amenities.slice(0, 4) : room.amenities).map(
                (amenity, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                  >
                    {amenity}
                  </span>
                )
              )}
              {isModal && room.amenities.length > 4 && (
                <span className="px-2 py-1 text-gray-500 text-xs">
                  +{room.amenities.length - 4}
                </span>
              )}
            </div>
          )}

          {/* 체크인 정보 */}
          {room.checkInInfo && !isModal && (
            <p className="text-xs text-green-600 mb-4">✓ {room.checkInInfo}</p>
          )}

          {/* 하단: 가격 & 예약 버튼 */}
          <div
            className={`mt-auto border-t border-gray-100 ${
              isModal ? "pt-3" : "pt-4"
            }`}
          >
            <div
              className={`flex items-center justify-between ${
                isModal ? "gap-2" : "gap-4"
              }`}
            >
              {/* 가격 정보 */}
              <div className="flex flex-col">
                {room.originalPrice > room.price && (
                  <span
                    className={`text-gray-400 line-through ${
                      isModal ? "text-xs" : "text-sm"
                    }`}
                  >
                    ₩{formatPrice(room.originalPrice * nights)}
                  </span>
                )}
                {room.additionalFee > 0 && (
                  <span className="text-xs text-gray-500">
                    기본: ₩{formatPrice((room.basePrice || 0) * nights)}
                  </span>
                )}
                <div className="flex items-baseline gap-2">
                  <span
                    className={`font-bold text-gray-900 ${
                      isModal ? "text-xl" : "text-2xl"
                    }`}
                  >
                    ₩{formatPrice(totalPrice)}
                  </span>
                  <span
                    className={`text-gray-500 ${
                      isModal ? "text-xs" : "text-sm"
                    }`}
                  >
                    / {nights}박
                  </span>
                </div>
              </div>

              {/* 예약 버튼 */}
              {!isReadOnly && (
                <button
                  onClick={handleReservation}
                  disabled={!room.isAvailable || isLocking}
                  className={`rounded-lg font-semibold transition-all shadow-md whitespace-nowrap ${
                    isModal ? "px-6 py-2 text-sm" : "px-8 py-3"
                  } ${
                    room.isAvailable && !isLocking
                      ? "bg-blue-600 hover:bg-blue-700 text-white hover:shadow-lg"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  {isLocking ? (
                    <span className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      예약 중...
                    </span>
                  ) : room.isAvailable ? (
                    "예약하기"
                  ) : (
                    "예약 불가"
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomCard;
