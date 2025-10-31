"use client";

import { useEffect, useRef, useState } from "react";

/**
 * 카카오 지도 컴포넌트 (여러 호텔 마커 표시)
 * @param {Object} props
 * @param {Array} props.hotels - 호텔 배열 (hotelLocation 포함)
 * @param {string} props.selectedHotelId - 현재 선택된 호텔 ID
 * @param {Function} props.onMarkerClick - 마커 클릭 시 호출할 함수 (hotelId 전달)
 */
const KakaoMapWithMarkers = ({ hotels = [], selectedHotelId, onMarkerClick }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const eventListenersRef = useRef([]);
  const onMarkerClickRef = useRef(onMarkerClick);
  const clickedMarkerIdRef = useRef(null);
  const clickTimeoutRef = useRef(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(null);

  // onMarkerClick ref 업데이트
  useEffect(() => {
    onMarkerClickRef.current = onMarkerClick;
  }, [onMarkerClick]);

  // 카카오맵 SDK 로드
  useEffect(() => {
    const loadKakaoMap = () => {
      if (window.kakao && window.kakao.maps) {
        setIsLoaded(true);
        return;
      }

      if (!process.env.NEXT_PUBLIC_KAKAO_MAP_API_KEY) {
        setError("카카오 지도 API 키가 설정되지 않았습니다.");
        return;
      }

      const script = document.createElement("script");
      script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_MAP_API_KEY}&autoload=false&libraries=services`;
      script.async = true;

      script.onload = () => {
        window.kakao.maps.load(() => {
          setIsLoaded(true);
        });
      };

      script.onerror = (error) => {
        console.error("카카오 지도 스크립트 로드 실패:", error);
        setError("카카오 지도 API를 불러올 수 없습니다.");
      };

      document.head.appendChild(script);
    };

    loadKakaoMap();
  }, []);

  // 지도 초기화 및 마커 표시
  useEffect(() => {
    const initializeMap = () => {
      if (!mapRef.current || !window.kakao || !window.kakao.maps || !isLoaded) return;

      // 기존 이벤트 리스너 제거
      eventListenersRef.current.forEach((listener) => {
        if (listener && window.kakao && window.kakao.maps && window.kakao.maps.event) {
          window.kakao.maps.event.removeListener(listener.marker, "click", listener.handler);
        }
      });
      eventListenersRef.current = [];

      // 기존 마커 제거
      markersRef.current.forEach((marker) => {
        if (marker && marker.setMap) {
          marker.setMap(null);
        }
      });
      markersRef.current = [];

      // 좌표가 있는 호텔 필터링
      const hotelsWithCoords = hotels
        .map((hotel) => {
          let mapY = null;
          let mapX = null;

          // hotelLocation에서 좌표 가져오기
          if (hotel.hotelLocation && hotel.hotelLocation.mapY && hotel.hotelLocation.mapX) {
            mapY = parseFloat(hotel.hotelLocation.mapY);
            mapX = parseFloat(hotel.hotelLocation.mapX);
          }
          // 직접 mapX, mapY가 있는 경우 (HotelcardResponse에서 온 경우)
          else if (hotel.mapY != null && hotel.mapX != null) {
            mapY = parseFloat(hotel.mapY);
            mapX = parseFloat(hotel.mapX);
          }

          // 좌표가 있으면 반환
          if (mapY && mapX && !isNaN(mapY) && !isNaN(mapX)) {
            return {
              ...hotel,
              mapY,
              mapX,
            };
          }
          return null;
        })
        .filter((hotel) => hotel !== null);

      if (hotelsWithCoords.length === 0) {
        // 좌표가 있는 호텔이 없으면 기본 지도 표시
        const defaultCenter = new window.kakao.maps.LatLng(37.5665, 126.9780); // 서울 시청
        const map = new window.kakao.maps.Map(mapRef.current, {
          center: defaultCenter,
          level: 6,
        });
        mapInstanceRef.current = map;
        return;
      }

      // 지도 생성 (첫 번째 호텔을 중심으로)
      const firstHotel = hotelsWithCoords[0];
      const center = new window.kakao.maps.LatLng(
        firstHotel.mapY,
        firstHotel.mapX
      );

      const map = new window.kakao.maps.Map(mapRef.current, {
        center: center,
        level: 6,
      });
      mapInstanceRef.current = map;

      // 모든 호텔 좌표로 bounds 설정
      const bounds = new window.kakao.maps.LatLngBounds();
      hotelsWithCoords.forEach((hotel) => {
        const position = new window.kakao.maps.LatLng(
          hotel.mapY,
          hotel.mapX
        );
        bounds.extend(position);
      });

      // 모든 마커를 볼 수 있도록 지도 범위 조정
      map.setBounds(bounds);

      // 마커 생성
      hotelsWithCoords.forEach((hotel) => {
        const position = new window.kakao.maps.LatLng(
          hotel.mapY,
          hotel.mapX
        );

        const isSelected = selectedHotelId === hotel.contentId;

        // 기본 마커 사용 (이미지 없이)
        const marker = new window.kakao.maps.Marker({
          map: map,
          position: position,
          title: hotel.title,
        });

        // 선택된 마커는 Z-index를 높여서 위에 표시
        if (isSelected) {
          marker.setZIndex(1);
        }

        markersRef.current.push(marker);

        // 마커 클릭 이벤트 (디바운싱으로 중복 실행 방지)
        const handleMarkerClick = () => {
          const contentId = hotel.contentId;
          
          // 같은 마커가 최근에 클릭되었으면 무시
          if (clickedMarkerIdRef.current === contentId) {
            return;
          }

          // 이전 타이머 클리어
          if (clickTimeoutRef.current) {
            clearTimeout(clickTimeoutRef.current);
          }

          // 클릭된 마커 ID 저장
          clickedMarkerIdRef.current = contentId;

          // 콜백 실행
          if (onMarkerClickRef.current) {
            onMarkerClickRef.current(contentId);
          }

          // 일정 시간 후 플래그 해제 (500ms)
          clickTimeoutRef.current = setTimeout(() => {
            clickedMarkerIdRef.current = null;
          }, 500);
        };

        window.kakao.maps.event.addListener(marker, "click", handleMarkerClick);
        
        // 리스너 추적을 위해 저장
        eventListenersRef.current.push({
          marker: marker,
          handler: handleMarkerClick,
        });
      });

      // 선택된 호텔이 있으면 해당 마커로 지도 중심 이동
      if (selectedHotelId) {
        const selectedHotel = hotelsWithCoords.find(
          (h) => h.contentId === selectedHotelId
        );
        if (selectedHotel) {
          const selectedPosition = new window.kakao.maps.LatLng(
            selectedHotel.mapY,
            selectedHotel.mapX
          );
          map.panTo(selectedPosition);
        }
      }
    };

    if (isLoaded && hotels.length > 0) {
      // DOM이 준비될 때까지 약간의 지연
      const timer = setTimeout(() => {
        initializeMap();
      }, 100);

      return () => clearTimeout(timer);
    } else if (isLoaded && hotels.length === 0 && mapRef.current) {
      // 호텔이 없으면 기본 지도를 표시
      const defaultCenter = new window.kakao.maps.LatLng(37.5665, 126.9780);
      const map = new window.kakao.maps.Map(mapRef.current, {
        center: defaultCenter,
        level: 6,
      });
      mapInstanceRef.current = map;
    }
  }, [isLoaded, hotels, selectedHotelId]);

  // 컴포넌트 언마운트 시 타이머 정리
  useEffect(() => {
    return () => {
      if (clickTimeoutRef.current) {
        clearTimeout(clickTimeoutRef.current);
      }
    };
  }, []);

  // 지도 크기 조정 (컨테이너 크기 변경 시)
  useEffect(() => {
    if (mapInstanceRef.current) {
      const timer = setTimeout(() => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.relayout();
        }
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [isLoaded]);

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100">
        <div className="text-center text-red-500 p-4">{error}</div>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative">
      <div
        ref={mapRef}
        className="w-full h-full rounded-lg overflow-hidden shadow-md"
      />
      <div className="absolute top-2 right-2 bg-white bg-opacity-90 px-2 py-1 rounded text-xs text-gray-600">
        카카오맵
      </div>
    </div>
  );
};

export default KakaoMapWithMarkers;

