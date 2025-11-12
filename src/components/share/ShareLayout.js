'use client';

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import KakaoMapWithMarkers from "@/components/hotelSearch/KakaoMapWithMarkers";
import HotelDetailPanel from "@/components/hotel/HotelDetailPanel";

const ShareLayout = ({ hotels = [], initialSelectedHotelId = null }) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [selectedHotelId, setSelectedHotelId] = useState(initialSelectedHotelId);
  const [detailSearchParams, setDetailSearchParams] = useState({ adults: 2, nights: 1 });

  const hotelsMap = useMemo(() => {
    const map = new Map();
    hotels.forEach((hotel) => {
      if (hotel?.contentId) {
        map.set(String(hotel.contentId), hotel);
      }
    });
    return map;
  }, [hotels]);

  useEffect(() => {
    const urlSelectedHotel = searchParams.get("selectedHotel");
    if (!urlSelectedHotel) {
      setSelectedHotelId(null);
      return;
    }

    if (hotelsMap.has(urlSelectedHotel)) {
      setSelectedHotelId(urlSelectedHotel);
    }
  }, [searchParams, hotelsMap]);

  const updateSelectedHotelInUrl = useCallback(
    (contentId) => {
      const params = new URLSearchParams(window.location.search);
      if (contentId) {
        params.set("selectedHotel", contentId);
      } else {
        params.delete("selectedHotel");
      }
      router.replace(`?${params.toString()}`, { scroll: false });
    },
    [router]
  );

  const handleCardClick = useCallback(
    (contentId) => {
      if (!contentId || !hotelsMap.has(String(contentId))) return;
      const asString = String(contentId);
      setSelectedHotelId(asString);
      updateSelectedHotelInUrl(asString);
    },
    [hotelsMap, updateSelectedHotelInUrl]
  );

  const handleMarkerClick = useCallback(
    (contentId) => {
      handleCardClick(contentId);
    },
    [handleCardClick]
  );

  const handleDetailClose = useCallback(() => {
    setSelectedHotelId(null);
    updateSelectedHotelInUrl(null);
  }, [updateSelectedHotelInUrl]);

  const formatPrice = useCallback((price) => {
    if (price == null) return "-";
    return new Intl.NumberFormat("ko-KR").format(price);
  }, []);

  const handleReserveClick = useCallback(
    (event, contentId) => {
      event.stopPropagation();
      router.push(`/hotel/${contentId}`);
    },
    [router]
  );

  const renderHotelCard = (hotel, index) => {
    const isSelected = selectedHotelId === String(hotel.contentId);

    return (
      <div
        key={hotel.contentId || `${hotel.title}_${index}`}
        className={`cursor-pointer overflow-hidden rounded-2xl border bg-white shadow-lg transition-all duration-300 hover:shadow-xl ${
          isSelected ? "border-blue-500 ring-2 ring-blue-200" : "border-gray-200"
        }`}
        onClick={() => handleCardClick(hotel.contentId)}
      >
        <div className="relative h-48 overflow-hidden">
          {hotel.imageUrl ? (
            <Image
              src={hotel.imageUrl}
              alt={hotel.title}
              fill
              sizes="(max-width:768px) 100vw, (max-width:1024px) 50vw, 33vw"
              priority={index === 0}
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gray-200 text-4xl text-gray-400">
              🏨
            </div>
          )}
        </div>

        <div className="p-6">
          <div className="mb-3">
            <h3 className="mb-1 text-lg font-bold text-gray-900">{hotel.title}</h3>
            <p className="text-sm text-gray-600">{hotel.adress}</p>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">1박 최저가</p>
              {hotel.minPrice ? (
                hotel.maxPrice && hotel.maxPrice !== hotel.minPrice ? (
                  <p className="text-xl font-bold text-blue-500">
                    ₩{formatPrice(hotel.minPrice)} ~
                  </p>
                ) : (
                  <p className="text-xl font-bold text-blue-500">
                    ₩{formatPrice(hotel.minPrice)}
                  </p>
                )
              ) : hotel.price ? (
                <p className="text-xl font-bold text-blue-500">₩{formatPrice(hotel.price)}</p>
              ) : (
                <p className="text-xl font-bold text-blue-500">가격 문의</p>
              )}
            </div>
            <button
              type="button"
              onClick={(event) => handleReserveClick(event, hotel.contentId)}
              className="rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-600 focus:outline-none focus:ring"
            >
              예약하기
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="flex-shrink-0 border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-[1200px] px-4 py-6">
          <h1 className="text-2xl font-bold text-gray-900">공유 호텔 목록</h1>
          <p className="mt-1 text-sm text-gray-600">
            친구가 공유한 호텔 목록입니다. 호텔을 클릭하면 상세 정보를 확인할 수 있어요.
          </p>
        </div>
      </div>

      <div className="relative flex flex-1 overflow-hidden">
        <div className="flex-1 overflow-y-auto lg:w-[20%]">
          <div className="p-4">
            {hotels.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-4 py-12 text-center text-gray-500">
                공유된 호텔이 없습니다.
              </div>
            ) : (
              <div className="space-y-6" data-hotel-results>
                {hotels.map(renderHotelCard)}
              </div>
            )}
          </div>
        </div>

        <div className="hidden border-l border-gray-100 lg:block lg:w-[80%] lg:flex-shrink-0">
          <KakaoMapWithMarkers
            hotels={hotels}
            selectedHotelId={selectedHotelId}
            onMarkerClick={handleMarkerClick}
            isModalOpen={!!selectedHotelId}
            modalWidth={selectedHotelId ? 555 : 0}
          />
        </div>
      </div>

      <HotelDetailPanel
        contentId={selectedHotelId}
        searchParams={detailSearchParams}
        onClose={handleDetailClose}
        onSearchParamsChange={(newParams) =>
          setDetailSearchParams((prev) => ({ ...prev, ...newParams }))
        }
      />
    </>
  );
};

export default ShareLayout;
