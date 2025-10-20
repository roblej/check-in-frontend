"use client";

import { useEffect, useRef, useState } from "react";

/**
 * 카카오 지도 컴포넌트
 * @param {Object} props
 * @param {string} props.address - 지도에 표시할 주소
 * @param {string} [props.width="100%"] - 지도 너비
 * @param {string} [props.height="300px"] - 지도 높이
 */
const KakaoMap = ({ address, width = "100%", height = "300px" }) => {
  const mapRef = useRef(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(null);
  const mapInstance = useRef(null); // 지도 인스턴스 저장용

  useEffect(() => {
    /**
     * 카카오맵 SDK 로드 함수
     * SDK가 이미 로드되어 있다면 바로 지도 초기화
     */
    const loadKakaoMap = () => {
      if (window.kakao && window.kakao.maps) {
        setIsLoaded(true);
        initializeMap();
      } else {
        // API 키가 없으면 에러 표시
        if (!process.env.NEXT_PUBLIC_KAKAO_MAP_API_KEY) {
          setError("카카오 지도 API 키가 설정되지 않았습니다.");
          return;
        }

        // 카카오 지도 API 스크립트 로드
        const script = document.createElement("script");
        script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_MAP_API_KEY}&autoload=false&libraries=services`;
        script.async = true;

        script.onload = () => {
          window.kakao.maps.load(() => {
            setIsLoaded(true);
            initializeMap();
          });
        };

        script.onerror = (error) => {
          console.error("카카오 지도 스크립트 로드 실패:", error);
          setError("카카오 지도 API를 불러올 수 없습니다.");
        };

        document.head.appendChild(script);
      }
    };

    /**
     * 지도 초기화 함수
     * 주소를 좌표로 변환 후 지도 및 마커 생성
     */
    const initializeMap = () => {
      const normalized = (address || "").trim();

      if (!mapRef.current) {
        setTimeout(() => {
          if (mapRef.current) {
            initializeMap();
          }
        }, 200);
        return;
      }

      if (!normalized) {
        return;
      }

      try {
        const geocoder = new window.kakao.maps.services.Geocoder();
        geocoder.addressSearch(normalized, (result, status) => {
          if (
            status === window.kakao.maps.services.Status.OK &&
            Array.isArray(result) &&
            result.length > 0
          ) {
            const coords = new window.kakao.maps.LatLng(
              result[0].y,
              result[0].x
            );

            // 지도 생성
            const map = new window.kakao.maps.Map(mapRef.current, {
              center: coords,
              level: 3, // 지도 확대 레벨
            });

            mapInstance.current = map;

            // 마커 생성
            const marker = new window.kakao.maps.Marker({
              position: coords,
            });

            // 마커를 지도에 표시
            marker.setMap(map);

            // 인포윈도우 생성
            const infowindow = new window.kakao.maps.InfoWindow({
              content: `<div style="padding:10px; font-size:12px;">${address}</div>`,
            });

            // 마커 클릭 시 인포윈도우 표시
            window.kakao.maps.event.addListener(marker, "click", () => {
              infowindow.open(map, marker);
            });

            // 지도 크기 조정 (렌더 타이밍 대응)
            map.relayout();
            setTimeout(() => {
              map.relayout();
              map.setCenter(coords);
            }, 150);
          } else {
            // 주소 실패 시 기본 좌표(서울 시청)로 표시
            const fallbackCoords = new window.kakao.maps.LatLng(
              37.5665,
              126.978
            );
            const map = new window.kakao.maps.Map(mapRef.current, {
              center: fallbackCoords,
              level: 5,
            });

            mapInstance.current = map;

            const marker = new window.kakao.maps.Marker({
              position: fallbackCoords,
            });
            marker.setMap(map);

            const infowindow = new window.kakao.maps.InfoWindow({
              content:
                '<div style="padding:10px; font-size:12px;">주소를 찾지 못해 기본 위치를 표시합니다</div>',
            });

            window.kakao.maps.event.addListener(marker, "click", () => {
              infowindow.open(map, marker);
            });

            map.relayout();
            setTimeout(() => {
              map.relayout();
              map.setCenter(fallbackCoords);
            }, 150);

            setError("주소를 찾을 수 없습니다.");
          }
        });
      } catch (err) {
        console.error("지도 초기화 오류:", err);
        setError("지도를 불러올 수 없습니다.");
      }
    };

    if (address) {
      // DOM 요소가 마운트될 때까지 대기
      const timer = setTimeout(() => {
        loadKakaoMap();
      }, 100);

      return () => {
        clearTimeout(timer);
        // 컴포넌트 언마운트 시 정리
        if (mapRef.current) mapRef.current.innerHTML = "";
      };
    }

    return () => {
      // 컴포넌트 언마운트 시 정리
      if (mapRef.current) mapRef.current.innerHTML = "";
    };
  }, [address]);

  /**
   * IntersectionObserver를 통해
   * 지도 섹션이 뷰포트에 나타날 때 자동으로 relayout() 실행
   */
  useEffect(() => {
    if (!isLoaded || !mapInstance.current || !mapRef.current) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            mapInstance.current.relayout();
          }, 150);
        }
      });
    });

    observer.observe(mapRef.current);
    return () => observer.disconnect();
  }, [isLoaded]);

  /** 주소가 비어있는 경우 */
  if (!address) {
    return (
      <div
        className="bg-gray-100 rounded-lg flex items-center justify-center"
        style={{ width, height }}
      >
        <div className="text-center text-gray-500">
          <span className="text-4xl mb-2 block">📍</span>
          <p>주소 정보가 없습니다</p>
        </div>
      </div>
    );
  }

  /** 지도 로드 실패 시 */
  if (error) {
    return (
      <div
        className="bg-gray-100 rounded-lg flex items-center justify-center"
        style={{ width, height }}
      >
        <div className="text-center text-gray-500">
          <span className="text-4xl mb-2 block">🗺️</span>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  /** 지도 로딩 중 */
  if (!isLoaded) {
    return (
      <div
        className="bg-gray-100 rounded-lg flex items-center justify-center animate-pulse"
        style={{ width, height }}
      >
        <div className="text-center text-gray-500">
          <span className="text-4xl mb-2 block">🗺️</span>
          <p>지도를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  /** 지도 렌더링 */
  return (
    <div className="relative">
      <div
        ref={mapRef}
        className="rounded-lg overflow-hidden shadow-md"
        style={{ width, height }}
      />
      <div className="absolute top-2 right-2 bg-white bg-opacity-90 px-2 py-1 rounded text-xs text-gray-600">
        카카오맵
      </div>
    </div>
  );
};

export default KakaoMap;
