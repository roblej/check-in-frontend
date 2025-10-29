"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { hotelAPI } from "@/lib/api/hotel";

/**
 * 호텔 데이터 fetching 커스텀 훅
 * @param {string|number} contentId - 호텔 ID
 * @param {Object} searchParams - 검색 파라미터
 * @param {Function} [onLoadingChange] - 로딩 상태 변경 콜백
 * @returns {Object} 호텔 데이터, 객실 목록, 로딩 상태 등
 */
export const useHotelData = (contentId, searchParams, onLoadingChange) => {
  const [hotelData, setHotelData] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const abortControllerRef = useRef(null);

  /**
   * 가격 포맷팅 함수
   */
  const formatPrice = useCallback(
    (price) => new Intl.NumberFormat("ko-KR").format(Number(price || 0)),
    []
  );

  /**
   * 백엔드 호텔 데이터를 프론트엔드 형식으로 매핑
   */
  const mapHotelData = useCallback(
    (hotel) => {
      if (!hotel) return null;

      return {
        id: hotel.contentId ?? contentId,
        name: hotel.title ?? "",
        description: hotel.hotelDetail?.scalelodging || "",
        location: hotel.adress ?? "",
        rating: hotel.rating ?? 0,
        reviewCount: hotel.reviewCount ?? 0,
        starRating: hotel.starRating ?? 0,
        checkInTime: hotel.checkInTime ?? "",
        checkOutTime: hotel.checkOutTime ?? "",
        amenities: [
          hotel.hotelDetail?.foodplace,
          hotel.hotelDetail?.parkinglodging,
          hotel.hotelDetail?.reservationlodging,
        ].filter(Boolean),
        images: hotel.images ?? (hotel.imageUrl ? [hotel.imageUrl] : []),
        district: hotel.areaCode ?? "",
      };
    },
    [contentId]
  );

  /**
   * 수용인원 초과 시 추가 요금 계산
   */
  const calculateAdditionalFee = useCallback((capacity, adults) => {
    if (adults <= capacity) return 0;

    const excessGuests = adults - capacity;

    if (capacity === 4 || capacity === 8) {
      return excessGuests * 10000;
    }

    return 0;
  }, []);

  /**
   * 백엔드 객실 데이터를 프론트엔드 형식으로 매핑 (예약 가능성 포함)
   */
  const mapRoomDataWithAvailability = useCallback(
    (
      roomList,
      checkInTime,
      roomIdx = null,
      hasAvailabilityData = false,
      adults = 0
    ) => {
      const safeRoomList = Array.isArray(roomList) ? roomList : [];

      const filteredRooms = roomIdx
        ? safeRoomList.filter((room) => room.roomIdx == roomIdx)
        : safeRoomList;

      return filteredRooms.map((room, index) => {
        // 예약 가능성 메시지 처리
        let availabilityMessage = room.availabilityMessage || "";
        let isAvailable = true;

        if (
          availabilityMessage.includes("불가능") ||
          availabilityMessage.includes("예약된")
        ) {
          isAvailable = false;
        } else if (hasAvailabilityData && room.status === 0) {
          isAvailable = false;
        } else if (!hasAvailabilityData && room.status === 0) {
          isAvailable = false;
        }

        // 추가 요금 계산
        const additionalFee = calculateAdditionalFee(
          room.capacity || 4,
          adults
        );
        const totalPrice = (room.basePrice || 0) + additionalFee;

        return {
          id: room.roomIdx
            ? `${room.contentId}-${room.roomIdx}`
            : `${room.contentId}-${room.name}-${index}`,
          roomIdx: room.roomIdx,
          contentId: room.contentId,
          name: room.name || "",
          description: room.description || "",
          size: room.size || "",
          bedType: room.bedType || "",
          capacity: room.capacity || 2,
          maxOccupancy: room.capacity || 2,
          amenities: Array.isArray(room.amenities) ? room.amenities : [],
          checkInInfo: checkInTime ? `${checkInTime} 이후 체크인` : "",
          originalPrice: Number(room.basePrice ?? 0),
          price: totalPrice,
          basePrice: Number(room.basePrice ?? 0),
          additionalFee: additionalFee,
          discount: 0,
          imageUrl: room.imageUrl || "",
          refundable: room.refundable === 1 || room.refundable === true,
          breakfastIncluded:
            room.breakfastIncluded === 1 || room.breakfastIncluded === true,
          smoking: room.smoking === 1 || room.smoking === true,
          roomCount: room.roomCount || 1,
          status: room.status || 1,
          availabilityMessage: availabilityMessage,
          isAvailable: isAvailable,
        };
      });
    },
    [calculateAdditionalFee]
  );

  // 데이터 로드
  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      setHotelData(null);
      setRooms([]);
      setErrorMessage("");
      setIsLoading(true);
      onLoadingChange?.(true);

      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      abortControllerRef.current = new AbortController();

      try {
        const hasDateRange = searchParams?.checkIn && searchParams?.checkOut;

        const [hotelRes, roomsRes] = await Promise.all([
          hotelAPI.getHotelDetail(contentId, {
            signal: abortControllerRef.current.signal,
          }),
          hotelAPI.getHotelRooms(contentId, {
            name: searchParams?.roomName || undefined,
            checkinDate: hasDateRange ? searchParams.checkIn : undefined,
            checkoutDate: hasDateRange ? searchParams.checkOut : undefined,
            signal: abortControllerRef.current.signal,
          }),
        ]);

        const hotel = hotelRes?.data ?? hotelRes;
        const roomList = roomsRes?.data ?? roomsRes;

        const mappedHotel = mapHotelData(hotel);
        const mappedRooms = mapRoomDataWithAvailability(
          roomList,
          mappedHotel?.checkInTime,
          searchParams?.roomIdx,
          hasDateRange,
          searchParams?.adults || 0
        );

        if (isMounted) {
          setHotelData(mappedHotel);
          setRooms(mappedRooms);
        }
      } catch (err) {
        if (err.name === "AbortError") {
          return;
        }

        if (isMounted) {
          if (err.code === "ECONNABORTED" || err.message?.includes("timeout")) {
            setErrorMessage(
              "서버 응답이 지연되고 있습니다. 잠시 후 다시 시도해주세요."
            );
          } else {
            setErrorMessage("호텔 정보를 불러오지 못했습니다.");
          }
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
          onLoadingChange?.(false);
        }
      }
    };

    if (contentId) fetchData();

    return () => {
      isMounted = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [
    contentId,
    searchParams,
    mapHotelData,
    mapRoomDataWithAvailability,
    onLoadingChange,
  ]);

  return {
    hotelData,
    rooms,
    isLoading,
    errorMessage,
    formatPrice,
  };
};
