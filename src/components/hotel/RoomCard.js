"use client";

import { useRouter } from "next/navigation";
import { usePaymentStore } from "@/stores/paymentStore";

const RoomCard = ({ room, searchParams, formatPrice }) => {
  const router = useRouter();
  const { setPaymentDraft } = usePaymentStore();
  const isReadOnly = !!searchParams?.roomIdx; // roomIdx가 있으면 읽기 전용

  // 숙박 일수에 따른 총 가격 계산
  const nights = searchParams?.nights || 1;
  const totalPrice = (room.basePrice || room.price) * nights;

  // 예약 버튼 클릭 핸들러
  const handleReservation = () => {
    const reservationData = {
      orderId: `hotel_${room.id || Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 9)}`,
      orderName: `${searchParams?.hotelName || "호텔"} - ${room.name}`,
      customerId: "guest", // 로그인된 사용자 ID로 변경 필요
      email: "", // 사용자 이메일로 변경 필요
      finalAmount: totalPrice,
      meta: {
        type: "hotel_reservation",
        contentId: searchParams?.contentId || searchParams?.hotelId,
        hotelName: searchParams?.hotelName,
        roomId: room.id,
        roomName: room.name,
        checkIn: searchParams?.checkIn,
        checkOut: searchParams?.checkOut,
        guests: searchParams?.guests || 2,
        nights: nights,
        roomPrice: room.basePrice || room.price,
        totalPrice: totalPrice,
        roomImage: room.imageUrl,
        amenities: room.amenities || [],
      },
    };

    // 결제 정보를 스토어에 저장
    setPaymentDraft(reservationData);

    // 결제 페이지로 이동
    router.push("/reservation");
  };

  return (
    <div className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
      {/* 모바일은 세로, 데스크톱은 2열 그리드로 균형 배치 */}
      <div className="flex flex-col md:grid md:grid-cols-[16rem,1fr] md:items-stretch">
        {/* 객실 이미지 */}
        <div className="relative w-full md:w-auto h-48 md:h-auto md:min-h-[12rem] bg-gradient-to-br from-blue-100 to-blue-200">
          {room.imageUrl ? (
            <img
              src={room.imageUrl}
              alt={room.name}
              className="w-full h-full object-cover rounded-l-lg"
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
        <div className="flex-1 p-5 md:pt-6">
          <div className="flex justify-between items-start mb-3">
            <div>
              <h3 className="text-lg font-bold mb-2">{room.name}</h3>
              <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                <span>👥 최대 {room.capacity || room.maxOccupancy}인</span>
                {room.size && <span>📏 {room.size}</span>}
                {room.bedType && <span>🛏️ {room.bedType}</span>}
              </div>
              {room.description && (
                <p className="text-sm text-gray-600 mb-3">{room.description}</p>
              )}

              {/* 객실 옵션 표시 */}
              <div className="flex flex-wrap gap-2 mb-3">
                {room.refundable && (
                  <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                    환불 가능
                  </span>
                )}
                {room.breakfastIncluded && (
                  <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded-full">
                    조식 포함
                  </span>
                )}
                {room.smoking && (
                  <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full">
                    흡연실
                  </span>
                )}
                {room.roomCount && room.roomCount > 1 && (
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                    {room.roomCount}개 객실
                  </span>
                )}
              </div>
            </div>
            {/* 우측 가격/버튼을 데스크톱에서 세로 정렬해 균형감 */}
            <div className="hidden md:flex flex-col items-end gap-2 ml-4">
              {room.originalPrice > room.price && (
                <div className="text-sm text-gray-400 line-through">
                  ₩{formatPrice(room.originalPrice)}
                </div>
              )}
              <div className="flex items-baseline gap-2">
                <span className="text-1.7xl font-bold text-gray-900">
                  ₩{formatPrice(totalPrice)}
                </span>
                <span className="text-sm text-gray-500">/ {nights}박</span>
              </div>
              {!isReadOnly && (
                <button
                  onClick={handleReservation}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-medium transition-colors shadow-md"
                >
                  예약하기
                </button>
              )}
            </div>
          </div>

          {/* 편의시설 */}
          <div className="flex flex-wrap gap-2 mb-4">
            {room.amenities.map((amenity, idx) => (
              <span
                key={idx}
                className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded"
              >
                {amenity}
              </span>
            ))}
          </div>

          {/* 체크인 정보 */}
          <p className="text-xs text-green-600 mb-4">✓ {room.checkInInfo}</p>

          {/* 가격 및 예약 - 모바일 하단 배치 */}
          <div className="md:hidden flex items-center justify-between border-t pt-3 mt-2">
            <div className="flex-1">
              {room.originalPrice > room.price && (
                <div className="text-sm text-gray-400 line-through mb-1">
                  ₩{formatPrice(room.originalPrice)}
                </div>
              )}
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-gray-900">
                  ₩{formatPrice(totalPrice)}
                </span>
                <span className="text-sm text-gray-500">/ {nights}박</span>
              </div>
            </div>
            {!isReadOnly && (
              <button
                onClick={handleReservation}
                className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-2 rounded-lg font-medium transition-colors shadow-md"
              >
                예약하기
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomCard;
