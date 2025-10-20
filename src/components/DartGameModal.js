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

  // 한국 경계 좌표 (정확한 범위)
  const koreaBounds = {
    north: 38.6,
    south: 33.1,
    east: 131.9,
    west: 124.6,
    centerLat: 36.5,
    centerLng: 127.5
  };

  // 카카오맵 초기화
  useEffect(() => {
    if (!isOpen || mapLoaded) return;

    const script = document.createElement('script');
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_MAP_API_KEY}&autoload=false`;
    script.async = true;
    
    script.onload = () => {
      window.kakao.maps.load(() => {
        const container = mapRef.current;
        const options = {
          center: new window.kakao.maps.LatLng(koreaBounds.centerLat, koreaBounds.centerLng),
          level: 13 // 한국 전체가 보이는 레벨
        };
        
        mapInstanceRef.current = new window.kakao.maps.Map(container, options);
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

  // 차징 시작
  const startCharging = () => {
    setIsCharging(true);
    setPowerGauge(0);
    setPowerDirection(1);
  };

  // 파워에 따른 랜덤 좌표 생성 (한국 범위 내)
  const generateRandomLocation = (power) => {
    // 파워에 따라 분산 조절 (파워가 높을수록 넓은 범위)
    const powerFactor = power / 10;
    
    // 한국 중심에서 파워에 따라 범위 조절
    const latRange = (koreaBounds.north - koreaBounds.south) * powerFactor;
    const lngRange = (koreaBounds.east - koreaBounds.west) * powerFactor;
    
    // 중심에서 랜덤하게 퍼지도록
    const lat = koreaBounds.centerLat + (Math.random() - 0.5) * latRange;
    const lng = koreaBounds.centerLng + (Math.random() - 0.5) * lngRange;
    
    // 한국 경계 내로 제한
    const clampedLat = Math.max(koreaBounds.south, Math.min(koreaBounds.north, lat));
    const clampedLng = Math.max(koreaBounds.west, Math.min(koreaBounds.east, lng));
    
    return { lat: clampedLat, lng: clampedLng };
  };

  // 다트 던지기
  const throwDart = (power) => {
    setIsCharging(false);
    setIsThrowing(true);
    setIsLoading(true);
    
    // 파워에 따른 랜덤 위치 생성
    const randomLocation = generateRandomLocation(power);
    setTargetLocation(randomLocation);

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
        
        // 다트 애니메이션
        dartRef.current.style.transition = 'all 1s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
        dartRef.current.style.transform = `translate(${targetX}px, ${targetY}px) rotate(45deg) scale(1.2)`;
        dartRef.current.style.opacity = '1';
        
        // 임시 마커 제거
        tempMarker.setMap(null);
        
        // 애니메이션 완료 후
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
          
          // 해당 지역 호텔 검색
          searchHotelsNearLocation(randomLocation);
          
          setIsThrowing(false);
          
          // 다트 리셋
          setTimeout(() => {
            if (dartRef.current) {
              dartRef.current.style.transition = 'none';
              dartRef.current.style.transform = 'translate(0, 0) rotate(45deg) scale(1)';
              dartRef.current.style.opacity = '1';
            }
          }, 100);
        }, 1000);
      }, 10);
    }
  };

  // 위치 기반 호텔 검색
  const searchHotelsNearLocation = async (location) => {
    try {
      // 현재는 인기 호텔 중 랜덤하게 선택
      const response = await hotelAPI.getHotels();
      const hotels = response?.data || response || [];
      
      // 랜덤하게 3개 호텔 선택
      const shuffled = hotels.sort(() => 0.5 - Math.random());
      setRecommendedHotels(shuffled.slice(0, 3));
    } catch (error) {
      console.error('호텔 검색 실패:', error);
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
      {/* 배경 오버레이 */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />
      
      {/* 모달 컨텐츠 */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
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
            {/* 카카오맵 */}
            <div className="relative w-full h-96 bg-gray-200 rounded-xl overflow-hidden">
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

            {/* 파워 게이지 바 */}
            <div className="mt-6 mb-4">
              <div className="text-center mb-3">
                <h3 className="text-lg font-bold text-gray-900 mb-1">
                  🎯 다트 파워 게이지
                </h3>
                <p className="text-sm text-gray-600">
                  {isCharging ? 
                    '스페이스바를 다시 눌러 다트를 던지세요!' : 
                    '스페이스바를 눌러 게이지를 시작하세요!'}
                </p>
              </div>
              
              {/* 게이지 바 */}
              <div className="relative w-full h-12 bg-gray-200 rounded-full overflow-hidden shadow-inner">
                {/* 배경 눈금 */}
                <div className="absolute inset-0 flex">
                  {[...Array(10)].map((_, i) => (
                    <div 
                      key={i} 
                      className="flex-1 border-r border-gray-300"
                      style={{ 
                        backgroundColor: i < 3 ? 'rgba(34, 197, 94, 0.2)' : 
                                       i < 7 ? 'rgba(251, 191, 36, 0.2)' : 
                                               'rgba(239, 68, 68, 0.2)'
                      }}
                    />
                  ))}
                </div>
                
                {/* 파워 바 */}
                <div
                  className="absolute left-0 top-0 h-full transition-all duration-100 flex items-center justify-end pr-2"
                  style={{ 
                    width: `${(powerGauge / 10) * 100}%`,
                    background: powerGauge < 3 ? 'linear-gradient(90deg, #22c55e, #16a34a)' :
                               powerGauge < 7 ? 'linear-gradient(90deg, #fbbf24, #f59e0b)' :
                                               'linear-gradient(90deg, #ef4444, #dc2626)'
                  }}
                >
                  {powerGauge > 0 && (
                    <span className="text-white font-bold text-sm">
                      {powerGauge.toFixed(1)}
                    </span>
                  )}
                </div>

                {/* 게이지 숫자 라벨 */}
                <div className="absolute inset-0 flex items-center justify-between px-2 pointer-events-none">
                  <span className="text-xs font-bold text-gray-700">0</span>
                  <span className="text-xs font-bold text-gray-700">5</span>
                  <span className="text-xs font-bold text-gray-700">10</span>
                </div>
              </div>

              {/* 파워 상태 텍스트 */}
              <div className="text-center mt-2">
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

            {/* 컨트롤 버튼 */}
            <div className="flex justify-center gap-4 mt-4">
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
              
              {targetLocation && !isCharging && (
                <button
                  onClick={resetDart}
                  className="px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white font-medium rounded-full transition-colors"
                >
                  다시 던지기
                </button>
              )}
            </div>

            {/* 안내 텍스트 */}
            <div className="text-center mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>💡 사용법:</strong> 스페이스바를 누르면 게이지가 시작되고, 다시 누르면 다트를 던집니다!
              </p>
            </div>
          </div>

          {/* 결과 영역 */}
          {targetLocation && (
            <div className="bg-gray-50 rounded-2xl p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                🎯 다트가 찍힌 곳
              </h3>
              
              <div className="mb-6">
                <p className="text-gray-600 mb-2">
                  <strong>위치:</strong> 위도 {targetLocation.lat.toFixed(4)}, 경도 {targetLocation.lng.toFixed(4)}
                </p>
                <p className="text-sm text-gray-500">
                  이 지역 근처의 추천 호텔을 찾아보세요!
                </p>
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
                    🏨 추천 호텔
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {recommendedHotels.map((hotel, index) => (
                      <div key={index} className="bg-white rounded-lg p-4 hover:shadow-md transition-shadow">
                        <h5 className="font-semibold text-gray-900 mb-2">{hotel.title}</h5>
                        <p className="text-sm text-gray-600 mb-2">{hotel.adress}</p>
                        {hotel.imageUrl && (
                          <img 
                            src={hotel.imageUrl} 
                            alt={hotel.title}
                            className="w-full h-24 object-cover rounded"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>이 지역 근처의 호텔을 찾을 수 없습니다.</p>
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
