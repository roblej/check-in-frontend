'use client';

import { useState, useEffect, useRef } from 'react';
import { hotelAPI } from '@/lib/api/hotel';

const DartGameModal = ({ isOpen, onClose }) => {
  const [isThrowing, setIsThrowing] = useState(false);
  const [targetLocation, setTargetLocation] = useState(null);
  const [recommendedHotels, setRecommendedHotels] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [isCharging, setIsCharging] = useState(false);
  const [powerGauge, setPowerGauge] = useState(0);
  const [powerDirection, setPowerDirection] = useState(1); // 1: 증가, -1: 감소
  const dartRef = useRef(null);
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const gaugeIntervalRef = useRef(null);
  const hotelMarkersRef = useRef([]);

  // 한국관광공사 지역코드 매핑
  const areaCodeMap = {
    '서울': '1',
    '인천': '2',
    '대전': '3',
    '대구': '4',
    '광주': '5',
    '부산': '6',
    '울산': '7',
    '세종': '8',
    '경기': '31',
    '강원': '32',
    '충북': '33',
    '충남': '34',
    '경북': '35',
    '경남': '36',
    '전북': '37',
    '전남': '38',
    '제주': '39'
  };

  // 위도/경도를 기반으로 지역코드 가져오기
  const getAreaCodeFromCoords = async (lat, lng) => {
    return new Promise((resolve) => {
      if (!window.kakao || !window.kakao.maps || !window.kakao.maps.services) {
        console.error('Kakao Maps Services not loaded');
        resolve(null);
        return;
      }

      const geocoder = new window.kakao.maps.services.Geocoder();
      
      geocoder.coord2Address(lng, lat, (result, status) => {
        if (status === window.kakao.maps.services.Status.OK && result[0]) {
          const address = result[0].address;
          console.log('역지오코딩 결과:', address);
          
          // 시도 이름 추출 (region_1depth_name)
          const region = address.region_1depth_name;
          
          // 지역명에서 '특별시', '광역시', '특별자치시', '도' 제거
          const cleanRegion = region
            .replace('특별시', '')
            .replace('광역시', '')
            .replace('특별자치시', '')
            .replace('특별자치도', '')
            .replace('도', '')
            .trim();
          
          // 지역코드 매핑
          const areaCode = areaCodeMap[cleanRegion] || null;
          
          console.log('지역:', region, '-> 정제:', cleanRegion, '-> 코드:', areaCode);
          
          resolve({
            areaCode,
            regionName: region,
            address: address.address_name
          });
        } else {
          console.error('역지오코딩 실패');
          resolve(null);
        }
      });
    });
  };

  // 한국(대한민국) 육지 경계 좌표 (휴전선 이남)
  const koreaPolygon = [
    // 서해안 북부 (경기도)
    { lat: 37.7, lng: 126.4 }, // 1번 (이전 3번)
    { lat: 37.5, lng: 126.5 },
    { lat: 37.3, lng: 126.5 },
    
    // 서해안 북부 (경기 - 충남)
    { lat: 37.1, lng: 126.6 },
    { lat: 36.9, lng: 126.5 },
    { lat: 36.7, lng: 126.5 },
    { lat: 36.5, lng: 126.5 },
    { lat: 36.3, lng: 126.4 },
    { lat: 36.1, lng: 126.4 },
    
    // 서해안 남부 (충남 - 전북 - 전남)
    { lat: 35.9, lng: 126.5 },
    { lat: 35.7, lng: 126.4 },
    { lat: 35.5, lng: 126.3 },
    { lat: 35.3, lng: 126.3 },
    { lat: 35.1, lng: 126.2 },
    { lat: 34.9, lng: 126.2 },
    { lat: 34.8, lng: 126.3 },
    
    // 남해안 서부 (전남)
    { lat: 34.7, lng: 126.5 },
    { lat: 34.6, lng: 126.7 },
    { lat: 34.5, lng: 127.0 },
    { lat: 34.4, lng: 127.3 },
    { lat: 34.5, lng: 127.6 },
    
    // 남해안 중부 (경남)
    { lat: 34.6, lng: 128.0 },
    { lat: 34.7, lng: 128.4 },
    { lat: 34.9, lng: 128.8 },
    
    // 남해안 동부 (부산 - 울산)
    { lat: 35.0, lng: 129.1 },
    { lat: 35.2, lng: 129.2 },
    { lat: 35.4, lng: 129.3 },
    
    // 동해안 (경상도)
    { lat: 35.6, lng: 129.4 },
    { lat: 36.0, lng: 129.4 },
    { lat: 36.4, lng: 129.4 },
    { lat: 36.8, lng: 129.4 },
    { lat: 37.2, lng: 129.3 },
    
    // 동해안 북부 (강원도)
    { lat: 37.5, lng: 129.1 },
    { lat: 37.7, lng: 128.9 },
    { lat: 37.9, lng: 128.7 },
    { lat: 38.0, lng: 128.5 },
    
    // 북동쪽 (강원도 북부 - 휴전선 부근)
    { lat: 38.1, lng: 128.3 },
    { lat: 38.2, lng: 128.0 },
    { lat: 38.2, lng: 127.7 },
    { lat: 38.2, lng: 127.4 },
    { lat: 38.1, lng: 127.1 },
    { lat: 38.0, lng: 126.8 } // 44번 (이전 44번) - 3번과 연결됨
  ];

  const koreaBounds = {
    north: 38.2,
    south: 34.4,
    east: 129.4,
    west: 126.2,
    centerLat: 36.5,
    centerLng: 127.5
  };

  // 점이 폴리곤 내부에 있는지 확인하는 함수 (Ray Casting Algorithm)
  const isPointInPolygon = (point, polygon) => {
    let inside = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const xi = polygon[i].lng, yi = polygon[i].lat;
      const xj = polygon[j].lng, yj = polygon[j].lat;
      
      const intersect = ((yi > point.lat) !== (yj > point.lat))
        && (point.lng < (xj - xi) * (point.lat - yi) / (yj - yi) + xi);
      
      if (intersect) inside = !inside;
    }
    return inside;
  };

  // 카카오맵 초기화
  useEffect(() => {
    if (!isOpen || mapLoaded) return;

    const script = document.createElement('script');
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_MAP_API_KEY}&autoload=false&libraries=services`;
    script.async = true;

    script.onload = () => {
      window.kakao.maps.load(() => {
        const container = mapRef.current;
        const options = {
          center: new window.kakao.maps.LatLng(koreaBounds.centerLat, koreaBounds.centerLng),
          level: 13 // 한국 전체가 보이는 레벨
        };

        mapInstanceRef.current = new window.kakao.maps.Map(container, options);

        // 한국 육지 경계 폴리곤 그리기
        const polygonPath = koreaPolygon.map(coord => 
          new window.kakao.maps.LatLng(coord.lat, coord.lng)
        );

        const polygon = new window.kakao.maps.Polygon({
          path: polygonPath,
          strokeWeight: 4,
          strokeColor: '#ef4444',
          strokeOpacity: 0,
          fillColor: '#ef4444',
          fillOpacity: 0
        });

        polygon.setMap(mapInstanceRef.current);

        setMapLoaded(true);
      });
    };

    document.head.appendChild(script);

    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, [isOpen, mapLoaded]);

  // 파워 게이지 애니메이션
  useEffect(() => {
    if (isCharging) {
      gaugeIntervalRef.current = setInterval(() => {
        setPowerGauge(prev => {
          let newValue = prev + (powerDirection * 0.5);
          
          // 0과 10 사이를 왕복
          if (newValue >= 10) {
            setPowerDirection(-1);
            return 10;
          } else if (newValue <= 0) {
            setPowerDirection(1);
            return 0;
          }
          
          return newValue;
        });
      }, 50);
    } else {
      if (gaugeIntervalRef.current) {
        clearInterval(gaugeIntervalRef.current);
      }
    }

    return () => {
      if (gaugeIntervalRef.current) {
        clearInterval(gaugeIntervalRef.current);
      }
    };
  }, [isCharging, powerDirection]);

  // 스페이스바 이벤트 핸들러
  useEffect(() => {
    const handleSpaceBar = (e) => {
      if (e.code === 'Space' && mapLoaded && !isThrowing) {
        e.preventDefault();
        
        if (!isCharging) {
          // 차징 시작
          startCharging();
        } else {
          // 다트 던지기
          throwDart(powerGauge);
        }
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleSpaceBar);
    }

    return () => {
      window.removeEventListener('keydown', handleSpaceBar);
    };
  }, [isOpen, mapLoaded, isThrowing, isCharging, powerGauge]);

  // targetLocation이 업데이트되면 호텔 검색
  useEffect(() => {
    // 마커가 찍히고, 지역코드가 정상적으로 들어왔을 때 호텔 검색 실행
    if (targetLocation && targetLocation.areaCode) {
      searchHotelsNearLocation(targetLocation);
    }
  }, [targetLocation]);

  // 차징 시작
  const startCharging = () => {
    setIsCharging(true);
    setPowerGauge(0);
    setPowerDirection(1);

    // 지도를 기본 중심으로 복귀
    if (mapInstanceRef.current && window.kakao) {
      const centerPosition = new window.kakao.maps.LatLng(koreaBounds.centerLat, koreaBounds.centerLng);
      mapInstanceRef.current.panTo(centerPosition);
      mapInstanceRef.current.setLevel(13); // 줌 레벨 초기화
    }

    // 이전 마커 제거
    if (markerRef.current) {
      markerRef.current.setMap(null);
      markerRef.current = null;
    }

    // 이전 결과 초기화
    setTargetLocation(null);
    setRecommendedHotels([]);
  };

  // 랜덤 좌표 생성 (한국 육지 내부만)
  const generateRandomLocation = () => {
    // 최대 시도 횟수 (무한 루프 방지)
    const maxAttempts = 200;
    let attempts = 0;

    while (attempts < maxAttempts) {
      // 한국 전체 경계 내에서 완전 랜덤 좌표 생성
      const lat = koreaBounds.south + Math.random() * (koreaBounds.north - koreaBounds.south);
      const lng = koreaBounds.west + Math.random() * (koreaBounds.east - koreaBounds.west);

      const point = { lat, lng };

      // 생성된 좌표가 폴리곤(육지) 내부에 있는지 확인
      if (isPointInPolygon(point, koreaPolygon)) {
        return point;
      }

      attempts++;
    }

    // 최대 시도 후에도 실패하면, 폴리곤 꼭지점 중 하나를 랜덤으로 반환
    console.warn(`육지 좌표를 ${maxAttempts}번 시도 후에도 찾지 못했습니다. 폴리곤 꼭지점 중 하나를 반환합니다.`);
    return koreaPolygon[Math.floor(Math.random() * koreaPolygon.length)];
  };

  // 선분 위의 가장 가까운 점을 찾는 함수
  const findNearestPointOnSegment = (point, p1, p2) => {
    const dx = p2.lng - p1.lng;
    const dy = p2.lat - p1.lat;

    if (dx === 0 && dy === 0) {
        const dist = Math.sqrt(Math.pow(point.lng - p1.lng, 2) + Math.pow(point.lat - p1.lat, 2));
        return { distance: dist, closestPoint: p1 };
    }

    const t = ((point.lng - p1.lng) * dx + (point.lat - p1.lat) * dy) / (dx * dx + dy * dy);

    let closestPoint;
    if (t < 0) {
        closestPoint = p1;
    } else if (t > 1) {
        closestPoint = p2;
    } else {
        closestPoint = { lat: p1.lat + t * dy, lng: p1.lng + t * dx };
    }

    const distance = Math.sqrt(Math.pow(point.lng - closestPoint.lng, 2) + Math.pow(point.lat - closestPoint.lat, 2));
    return { distance, closestPoint };
  };

  // 폴리곤(다각형) 경계 위의 가장 가까운 점을 찾는 함수
  const findNearestPointOnPolygon = (point, polygon) => {
      let minDistance = Infinity;
      let nearestPoint = null;

      for (let i = 0; i < polygon.length; i++) {
          const p1 = polygon[i];
          const p2 = polygon[(i + 1) % polygon.length]; // 다음 꼭지점 (마지막->처음 연결)

          const { distance, closestPoint } = findNearestPointOnSegment(point, p1, p2);

          if (distance < minDistance) {
              minDistance = distance;
              nearestPoint = closestPoint;
          }
      }
      return nearestPoint;
  };

  // 다트 던지기
  const throwDart = (power) => {
    setIsCharging(false);
    setIsThrowing(true);
    setIsLoading(true);
    
    // 랜덤 위치 생성 (파워와 무관하게)
    const randomLocation = generateRandomLocation();
    
    // 지역코드 가져오기 (실패 시 대체 로직 포함)
    getAreaCodeFromCoords(randomLocation.lat, randomLocation.lng).then(async (locationInfo) => {
      if (locationInfo && locationInfo.areaCode) {
        setTargetLocation({
          ...randomLocation,
          ...locationInfo,
        });
      } else {
        // 지역코드를 찾지 못한 경우 (바다 등), 가장 가까운 육지 좌표로 재검색
        console.log('지역코드를 찾지 못했습니다. 가장 가까운 육지를 검색합니다.');
        const nearestPoint = findNearestPointOnPolygon(randomLocation, koreaPolygon);
        const nearestLocationInfo = await getAreaCodeFromCoords(nearestPoint.lat, nearestPoint.lng);

        setTargetLocation({
          ...randomLocation, // 다트는 원래 위치에 찍힘
          ...nearestLocationInfo, // 정보는 가장 가까운 육지 정보 사용
          fallbackMessage: `가장 가까운 육지인 '${nearestLocationInfo.regionName}' 지역의 정보를 표시합니다.`
        });
      }
    });

    // 지도에 마커를 먼저 생성 (보이지 않게)
    if (mapInstanceRef.current && window.kakao && dartRef.current) {
      const position = new window.kakao.maps.LatLng(randomLocation.lat, randomLocation.lng);
      
      // 기존 마커 제거
      if (markerRef.current) {
        markerRef.current.setMap(null);
      }

      // 임시 마커 생성 (투명하게)
      const imageSrc = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIyMCIgY3k9IjIwIiByPSIxNSIgZmlsbD0iI2VmNDQ0NCIgc3Ryb2tlPSIjZmZmIiBzdHJva2Utd2lkdGg9IjMiLz48Y2lyY2xlIGN4PSIyMCIgY3k9IjIwIiByPSI1IiBmaWxsPSIjZmZmIi8+PC9zdmc+';
      const imageSize = new window.kakao.maps.Size(40, 40);
      const imageOption = { offset: new window.kakao.maps.Point(20, 20) };
      
      const markerImage = new window.kakao.maps.MarkerImage(imageSrc, imageSize, imageOption);
      
      // 투명 마커 생성하여 위치 확인
      const tempMarker = new window.kakao.maps.Marker({
        position: position,
        map: mapInstanceRef.current,
        opacity: 0
      });
      
      // 마커의 실제 화면 위치 얻기
      setTimeout(() => {
        const projection = mapInstanceRef.current.getProjection();
        const overlayPoint = projection.containerPointFromCoords(position);
        
        // 지도 컨테이너의 위치
        const mapContainer = mapRef.current;
        const mapRect = mapContainer.getBoundingClientRect();
        
        // 다트의 시작 위치
        const dartRect = dartRef.current.getBoundingClientRect();
        const dartStartX = dartRect.left - mapRect.left;
        const dartStartY = dartRect.top - mapRect.top;
        
        // 목표 위치까지의 이동 거리
        const targetX = overlayPoint.x - dartStartX - 16; // 다트 크기 절반
        const targetY = overlayPoint.y - dartStartY - 16;
        
        // 파워에 따른 이동 속도 계산 (파워가 높을수록 빠르게)
        // 파워 0-3: 1.5초, 파워 4-7: 1초, 파워 8-10: 0.6초
        const duration = power < 3 ? 1.5 : 
                        power < 7 ? 1.0 : 
                                   0.6;
        
        // 다트 애니메이션 (파워에 따른 속도 적용)
        dartRef.current.style.transition = `all ${duration}s cubic-bezier(0.25, 0.46, 0.45, 0.94)`;
        dartRef.current.style.transform = `translate(${targetX}px, ${targetY}px) rotate(45deg) scale(1.2)`;
        dartRef.current.style.opacity = '1';
        
        // 임시 마커 제거
        tempMarker.setMap(null);
        
        // 애니메이션 완료 후 (파워에 따른 지연 시간 적용)
        setTimeout(() => {
          // 다트 숨기기
          if (dartRef.current) {
            dartRef.current.style.opacity = '0';
          }
          
          // 실제 마커 표시
          markerRef.current = new window.kakao.maps.Marker({
            position: position,
            image: markerImage,
            map: mapInstanceRef.current
          });

          // 지도 중심을 마커 위치로 부드럽게 이동
          mapInstanceRef.current.panTo(position);
          
          // 호텔 검색은 targetLocation이 업데이트될 때 useEffect에서 처리됩니다.
          
          setIsThrowing(false);
          
          // 다트 리셋
          setTimeout(() => {
            if (dartRef.current) {
              dartRef.current.style.transition = 'none';
              dartRef.current.style.transform = 'translate(0, 0) rotate(45deg) scale(1)';
              dartRef.current.style.opacity = '1';
            }
          }, 100);
        }, duration * 1000); // 파워에 따른 지연 시간 (초를 밀리초로 변환)
      }, 10);
    }
  };

  // 호텔 마커 제거
  const clearHotelMarkers = () => {
    hotelMarkersRef.current.forEach(marker => marker.setMap(null));
    hotelMarkersRef.current = [];
  };

  // 호텔 마커 표시
  const displayHotelMarkers = (hotels) => {
    if (!window.kakao || !window.kakao.maps || !mapInstanceRef.current) return;

    clearHotelMarkers();

    const geocoder = new window.kakao.maps.services.Geocoder();

    hotels.forEach((hotel, index) => {
      if (!hotel.adress) {
        console.warn('주소가 없는 호텔 데이터는 건너뜁니다:', hotel);
        return;
      }

      geocoder.addressSearch(hotel.adress, (result, status) => {
        if (status === window.kakao.maps.services.Status.OK) {
          const coords = new window.kakao.maps.LatLng(result[0].y, result[0].x);

          // 마커 이미지 설정 (숫자 마커)
          const imageSrc = 'https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/marker_number_blue.png';
          const imageSize = new window.kakao.maps.Size(36, 37);
          const imgOptions = {
            spriteSize: new window.kakao.maps.Size(36, 691),
            spriteOrigin: new window.kakao.maps.Point(0, (index * 46) + 10),
            offset: new window.kakao.maps.Point(13, 37)
          };
          const markerImage = new window.kakao.maps.MarkerImage(imageSrc, imageSize, imgOptions);

          const marker = new window.kakao.maps.Marker({
            map: mapInstanceRef.current,
            position: coords,
            title: hotel.title,
            image: markerImage
          });

          const infowindow = new window.kakao.maps.InfoWindow({
            content: `<div style="padding:5px;font-size:12px;min-width:150px;text-align:center;">${hotel.title}</div>`,
            disableAutoPan: true,
          });

          window.kakao.maps.event.addListener(marker, 'mouseover', () => {
            infowindow.open(mapInstanceRef.current, marker);
          });
          window.kakao.maps.event.addListener(marker, 'mouseout', () => {
            infowindow.close();
          });
          
          window.kakao.maps.event.addListener(marker, 'click', () => {
            window.open(`/hotel/${hotel.contentId}`, '_blank');
          });

          hotelMarkersRef.current.push(marker);
        } else {
          console.warn(`'${hotel.adress}' 주소에 대한 좌표 변환 실패`);
        }
      });
    });
  };

  // 추천 호텔 목록이 변경되면 마커 업데이트
  useEffect(() => {
    if (mapLoaded && recommendedHotels) {
      if (recommendedHotels.length > 0) {
        displayHotelMarkers(recommendedHotels);
      } else {
        clearHotelMarkers();
      }
    }
  }, [recommendedHotels, mapLoaded]);

  // 위치 기반 호텔 검색
  const searchHotelsNearLocation = async (location) => {
    try {
      console.log('호텔 검색 시작:', location);
      
      // areaCode가 있으면 해당 지역의 호텔 조회
      if (location.areaCode) {
        console.log('지역코드로 호텔 검색:', location.areaCode);
        const response = await hotelAPI.getHotelsByAreaCode(location.areaCode, 10);
        const hotels = response || [];
        
        console.log('검색된 호텔:', hotels);
        setRecommendedHotels(hotels);
      } else {
        // areaCode가 없으면 전국 호텔을 표시하지 않음
        console.log('지역코드 없음, 호텔 목록을 표시하지 않습니다.');
        setRecommendedHotels([]);
      }
    } catch (error) {
      console.error('호텔 검색 실패:', error);
      console.error('에러 상세:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      setRecommendedHotels([]);
    } finally {
      setIsLoading(false);
    }
  };

  // 다트 리셋
  const resetDart = () => {
    if (dartRef.current) {
      dartRef.current.style.transform = 'translate(0, 0) rotate(45deg)';
      dartRef.current.style.opacity = '1';
    }
    
    // 마커 제거
    if (markerRef.current) {
      markerRef.current.setMap(null);
      markerRef.current = null;
    }
    
    setTargetLocation(null);
    setRecommendedHotels([]);
  };

  // 모달이 닫힐 때 상태 리셋
  useEffect(() => {
    if (!isOpen) {
      resetDart();
    }
  }, [isOpen]);

  // ESC 키로 모달 닫기
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* 배경 오버레이 (블러 처리) */}
      <div 
        className="absolute inset-0 bg-transparent backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* 모달 컨텐츠 */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-7xl w-full max-h-[95vh] overflow-y-auto">
        {/* 모달 헤더 */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">
              🎯 어디갈지 모르겠다면?
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="모달 닫기"
            >
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <p className="text-gray-600 mt-2">
            다트를 던져서 랜덤한 한국 여행지를 발견해보세요!
          </p>
        </div>

        {/* 모달 바디 */}
        <div className="p-6">
          {/* 게임 영역 */}
          <div className="relative bg-gradient-to-br from-blue-100 to-green-100 rounded-2xl p-6 mb-6">
            <div className="flex gap-4">
              {/* 카카오맵 */}
              <div className="relative flex-1 h-[55vh] bg-gray-200 rounded-xl overflow-hidden">
                <div 
                  ref={mapRef}
                  className="w-full h-full"
                  style={{ minHeight: '384px' }}
                />
                
                {/* 로딩 상태 */}
                {!mapLoaded && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                      <p className="text-gray-600">지도를 불러오는 중...</p>
                    </div>
                  </div>
                )}

                {/* 다트 (지도 위에 오버레이) - 왼쪽 하단에서 시작 */}
                <div
                  ref={dartRef}
                  className="absolute bottom-4 left-4 w-10 h-10 transition-all duration-1000 ease-out z-10"
                  style={{
                    transform: 'translate(0, 0) rotate(45deg)',
                    opacity: 1
                  }}
                >
                  <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                    {/* 다트 몸통 */}
                    <path 
                      d="M16 2 L16 22" 
                      stroke="#dc2626" 
                      strokeWidth="3" 
                      fill="none"
                    />
                    {/* 다트 날개 (왼쪽) */}
                    <path 
                      d="M16 6 L10 12 L16 14 Z" 
                      fill="#ef4444" 
                      stroke="#dc2626" 
                      strokeWidth="1"
                    />
                    {/* 다트 날개 (오른쪽) */}
                    <path 
                      d="M16 6 L22 12 L16 14 Z" 
                      fill="#ef4444" 
                      stroke="#dc2626" 
                      strokeWidth="1"
                    />
                    {/* 다트 팁 (끝) */}
                    <circle 
                      cx="16" 
                      cy="2" 
                      r="2.5" 
                      fill="#dc2626"
                    />
                    {/* 다트 손잡이 */}
                    <rect 
                      x="14" 
                      y="22" 
                      width="4" 
                      height="6" 
                      fill="#7f1d1d" 
                      rx="2"
                    />
                    {/* 다트 깃털 (왼쪽) */}
                    <path 
                      d="M16 24 L11 30 L16 28 Z" 
                      fill="#fca5a5" 
                      stroke="#ef4444" 
                      strokeWidth="0.5"
                    />
                    {/* 다트 깃털 (오른쪽) */}
                    <path 
                      d="M16 24 L21 30 L16 28 Z" 
                      fill="#fca5a5" 
                      stroke="#ef4444" 
                      strokeWidth="0.5"
                    />
                  </svg>
                </div>
              </div>

              {/* 파워 게이지 바 (세로) */}
              <div className="flex flex-col items-center justify-between h-[55vh] py-4">
                {/* 상단: 숫자 라벨 */}
                <div className="text-center mb-2">
                  <span className="text-xs font-bold text-gray-700">10</span>
                </div>

                {/* 중앙: 세로 게이지 바 */}
                <div className="relative w-16 flex-1 bg-gray-200 rounded-full overflow-hidden shadow-inner">
                  {/* 배경 눈금 */}
                  <div className="absolute inset-0 flex flex-col">
                    {[...Array(10)].map((_, i) => (
                      <div 
                        key={i} 
                        className="flex-1 border-b border-gray-300"
                        style={{ 
                          backgroundColor: (9 - i) < 3 ? 'rgba(34, 197, 94, 0.2)' : 
                                         (9 - i) < 7 ? 'rgba(251, 191, 36, 0.2)' : 
                                                       'rgba(239, 68, 68, 0.2)'
                        }}
                      />
                    ))}
                  </div>
                  
                  {/* 파워 바 (아래에서 위로) */}
                  <div
                    className="absolute left-0 bottom-0 w-full transition-all duration-100 flex items-center justify-center"
                    style={{ 
                      height: `${(powerGauge / 10) * 100}%`,
                      background: powerGauge < 3 ? 'linear-gradient(to top, #22c55e, #16a34a)' :
                                 powerGauge < 7 ? 'linear-gradient(to top, #fbbf24, #f59e0b)' :
                                                 'linear-gradient(to top, #ef4444, #dc2626)'
                    }}
                  >
                    {powerGauge > 0 && (
                      <span className="text-white font-bold text-sm rotate-0">
                        {powerGauge.toFixed(1)}
                      </span>
                    )}
                  </div>
                </div>

                {/* 중간 숫자 */}
                <div className="absolute top-1/2 right-0 transform translate-x-6 -translate-y-1/2">
                  <span className="text-xs font-bold text-gray-700">5</span>
                </div>

                {/* 하단: 숫자 라벨 */}
                <div className="text-center mt-2">
                  <span className="text-xs font-bold text-gray-700">0</span>
                </div>

                {/* 파워 상태 텍스트 */}
                <div className="text-center mt-4">
                  <span className={`text-sm font-bold ${
                    powerGauge < 3 ? 'text-green-600' :
                    powerGauge < 7 ? 'text-yellow-600' :
                                    'text-red-600'
                  }`}>
                    {powerGauge < 3 ? '약함' :
                     powerGauge < 7 ? '중간' :
                                     '강함'}
                  </span>
                </div>
              </div>
            </div>

            {/* 컨트롤 버튼 및 안내 */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-4">
              {isCharging ? (
                <button
                  onClick={() => throwDart(powerGauge)}
                  disabled={isThrowing || isLoading}
                  className="px-8 py-3 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400 text-white font-bold rounded-full transition-colors shadow-lg animate-pulse"
                >
                  🎯 다트 던지기! (Space)
                </button>
              ) : (
                <button
                  onClick={startCharging}
                  disabled={isThrowing || isLoading || !mapLoaded}
                  className="px-8 py-3 bg-red-500 hover:bg-red-600 disabled:bg-gray-400 text-white font-bold rounded-full transition-colors shadow-lg"
                >
                  {isThrowing ? '다트 던지는 중...' : '🎯 게이지 시작 (Space)'}
                </button>
              )}
              
              {/* 안내 텍스트 */}
              <div className="px-4 py-2 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>💡</strong> 스페이스바로 게이지 시작 및 다트 던지기
                </p>
              </div>
            </div>

            {/* 스크롤 안내 */}
            {targetLocation && (
              <div className="text-center mt-4 animate-bounce">
                <p className="text-sm text-gray-600">
                  ⬇️ 아래로 스크롤하여 결과를 확인하세요 ⬇️
                </p>
              </div>
            )}
          </div>

          {/* 결과 영역 */}
          {targetLocation && (
            <div className="bg-gray-50 rounded-2xl p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                🎯 다트가 찍힌 곳
              </h3>
              
              <div className="mb-6">
                <div className="bg-white p-4 rounded-lg shadow-sm mb-4">
                  {targetLocation.fallbackMessage && (
                    <p className="text-sm text-orange-600 bg-orange-100 p-3 rounded-lg mb-3">
                      <strong>💡 알림:</strong> {targetLocation.fallbackMessage}
                    </p>
                  )}
                  {targetLocation.regionName && (
                    <p className="text-lg font-bold text-blue-600 mb-2">
                      🏛️ {targetLocation.regionName}
                    </p>
                  )}
                  {targetLocation.address && (
                    <p className="text-gray-700 mb-2">
                      <strong>📍 주소:</strong> {targetLocation.address}
                    </p>
                  )}
                  <p className="text-gray-600 mb-2">
                    <strong>🗺️ 좌표:</strong> 위도 {targetLocation.lat.toFixed(4)}, 경도 {targetLocation.lng.toFixed(4)}
                  </p>
                  {targetLocation.areaCode && (
                    <p className="text-sm text-gray-500">
                      <strong>🔢 지역코드:</strong> {targetLocation.areaCode}
                    </p>
                  )}
                  <p className="text-sm text-gray-500 mt-3">
                    다트가 찍힌 위치를 기준으로 근처 호텔을 추천해드립니다! 🏨
                  </p>
                </div>
                <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-800">
                    💡 <strong>Tip:</strong> 다른 지역을 탐색하려면 위로 스크롤하여 게이지를 다시 시작하세요!
                  </p>
                </div>
              </div>

              {/* 추천 호텔 */}
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">호텔을 찾는 중...</p>
                </div>
              ) : recommendedHotels.length > 0 ? (
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">
                    🏨 추천 호텔 ({recommendedHotels.length}개)
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {recommendedHotels.map((hotel, index) => (
                      <div 
                        key={hotel.contentId || index} 
                        className="bg-white rounded-lg overflow-hidden hover:shadow-lg transition-all duration-300 border border-gray-200 cursor-pointer"
                        onClick={() => window.open(`/hotel/${hotel.contentId}`, '_blank')}
                      >
                        {hotel.imageUrl && (
                          <div className="relative h-40 overflow-hidden">
                            <img 
                              src={hotel.imageUrl} 
                              alt={hotel.title}
                              className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                            />
                          </div>
                        )}
                        <div className="p-4">
                          <h5 className="font-bold text-gray-900 mb-2 line-clamp-1">{hotel.title}</h5>
                          <p className="text-sm text-gray-600 mb-3 line-clamp-2">{hotel.adress}</p>
                          
                          {/* 가격 정보 */}
                          {(hotel.minPrice || hotel.maxPrice) && (
                            <div className="border-t pt-3 mt-3">
                              <p className="text-xs text-gray-500 mb-1">1박 기준</p>
                              <div className="flex items-center justify-between">
                                {hotel.minPrice && hotel.maxPrice && hotel.minPrice !== hotel.maxPrice ? (
                                  <p className="text-lg font-bold text-blue-600">
                                    {new Intl.NumberFormat('ko-KR').format(hotel.minPrice)}원 ~
                                  </p>
                                ) : hotel.minPrice ? (
                                  <p className="text-lg font-bold text-blue-600">
                                    {new Intl.NumberFormat('ko-KR').format(hotel.minPrice)}원
                                  </p>
                                ) : (
                                  <p className="text-sm text-gray-500">가격 문의</p>
                                )}
                                <button className="text-sm bg-blue-500 text-white px-3 py-1 rounded-lg hover:bg-blue-600 transition-colors">
                                  보기
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p className="mb-2">이 지역의 호텔을 찾을 수 없습니다.</p>
                  <p className="text-sm">다른 지역을 시도해보세요!</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DartGameModal;
