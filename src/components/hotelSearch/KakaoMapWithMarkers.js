"use client";

import { useEffect, useRef, useState } from "react";

/**
 * 카카오 지도 컴포넌트 (여러 호텔 마커 표시)
 * @param {Object} props
 * @param {Array} props.hotels - 호텔 배열 (hotelLocation 포함)
 * @param {string} props.selectedHotelId - 현재 선택된 호텔 ID
 * @param {Function} props.onMarkerClick - 마커 클릭 시 호출할 함수 (hotelId 전달)
 * @param {boolean} props.isModalOpen - 모달이 열려있는지 여부
 * @param {number} props.modalWidth - 모달의 너비 (픽셀)
 */
const KakaoMapWithMarkers = ({ hotels = [], selectedHotelId, onMarkerClick, isModalOpen = false, modalWidth = 0 }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const eventListenersRef = useRef([]);
  const onMarkerClickRef = useRef(onMarkerClick);
  const clickedMarkerIdRef = useRef(null);
  const clickTimeoutRef = useRef(null);
  const idleHandlerRef = useRef(null);
  const isModalOpenRef = useRef(isModalOpen);
  const modalWidthRef = useRef(modalWidth);
  const centerUpdateTimeoutRef = useRef(null);
  const lastSelectedHotelIdRef = useRef(null);
  const lastModalStateRef = useRef({ isOpen: isModalOpen, width: modalWidth });
  const isUpdatingCenterRef = useRef(false);
  const lastHotelsRef = useRef([]); // 이전 호텔 목록 추적
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(null);

  // 모달 상태를 ref로 동기화
  useEffect(() => {
    isModalOpenRef.current = isModalOpen;
    modalWidthRef.current = modalWidth;
  }, [isModalOpen, modalWidth]);

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

      // 초기화 중 플래그 설정 (중복 실행 방지)
      isUpdatingCenterRef.current = true;

      // 기존 이벤트 리스너 제거
      eventListenersRef.current.forEach((listener) => {
        if (listener && window.kakao && window.kakao.maps && window.kakao.maps.event) {
          window.kakao.maps.event.removeListener(listener.marker, "click", listener.handler);
        }
      });
      eventListenersRef.current = [];

      // 기존 idle 이벤트 리스너 제거
      if (mapInstanceRef.current && idleHandlerRef.current) {
        window.kakao.maps.event.removeListener(mapInstanceRef.current, 'idle', idleHandlerRef.current);
        idleHandlerRef.current = null;
      }

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

      // 지도가 이미 존재하는지 확인
      let map = mapInstanceRef.current;
      
      if (!map) {
        // 지도 생성 (첫 번째 호텔을 중심으로)
        const firstHotel = hotelsWithCoords[0];
        const center = new window.kakao.maps.LatLng(
          firstHotel.mapY,
          firstHotel.mapX
        );

        map = new window.kakao.maps.Map(mapRef.current, {
          center: center,
          level: 6,
        });
        mapInstanceRef.current = map;

        // 모든 호텔 좌표로 bounds 설정 (초기화 시에만, 선택된 호텔이 없을 때만)
        if (!selectedHotelId) {
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
          
          // 초기 bounds 설정 후 모달이 열려있을 때 중앙 조정
          if (isModalOpenRef.current && modalWidthRef.current > 0) {
            map.relayout();
            
            setTimeout(() => {
              if (mapInstanceRef.current && mapRef.current) {
                const map = mapInstanceRef.current;
                const projection = map.getProjection();
                
                const currentCenter = map.getCenter();
                const centerPoint = projection.pointFromCoords(currentCenter);
                
                // 지도 컨테이너의 실제 크기 가져오기
                const mapContainer = mapRef.current;
                const mapWidth = mapContainer.clientWidth || mapContainer.offsetWidth;
                
                // 지도 크기 기반으로 정확한 오프셋 계산
                const mapCenterX = mapWidth / 2;
                const adjustedCenterX = (mapWidth - modalWidthRef.current) / 2;
                const offsetX = adjustedCenterX - mapCenterX;
                
                const adjustedPoint = new window.kakao.maps.Point(
                  centerPoint.x + offsetX,
                  centerPoint.y
                );
                
                const adjustedCenter = projection.coordsFromPoint(adjustedPoint);
                
                // 부드러운 애니메이션으로 중앙으로 이동
                map.panTo(adjustedCenter);
                
                // 애니메이션 완료 후 플래그 해제
                setTimeout(() => {
                  isUpdatingCenterRef.current = false;
                }, 400);
              }
            }, 150);
          } else {
            setTimeout(() => {
              isUpdatingCenterRef.current = false;
            }, 100);
          }
        } else {
          setTimeout(() => {
            isUpdatingCenterRef.current = false;
          }, 100);
        }
      } else {
        // 지도가 이미 존재하는 경우
        // 검색 결과가 변경되었는지 확인 (호텔 목록의 ID들을 비교)
        const currentHotelIds = hotelsWithCoords.map(h => h.contentId).sort();
        const lastHotelIds = lastHotelsRef.current.map(h => h.contentId).sort();
        const hotelsChanged = 
          currentHotelIds.length !== lastHotelIds.length ||
          currentHotelIds.some((id, index) => id !== lastHotelIds[index]);
        
        if (hotelsChanged && hotelsWithCoords.length > 0) {
          // 검색 결과가 변경되었으면 새로운 bounds로 이동
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
          
          // 모달이 열려있을 때 중앙 조정
          if (isModalOpenRef.current && modalWidthRef.current > 0) {
            map.relayout();
            
            setTimeout(() => {
              if (mapInstanceRef.current && mapRef.current) {
                const map = mapInstanceRef.current;
                const projection = map.getProjection();
                
                const currentCenter = map.getCenter();
                const centerPoint = projection.pointFromCoords(currentCenter);
                
                const mapContainer = mapRef.current;
                const mapWidth = mapContainer.clientWidth || mapContainer.offsetWidth;
                
                const mapCenterX = mapWidth / 2;
                const adjustedCenterX = (mapWidth - modalWidthRef.current) / 2;
                const offsetX = adjustedCenterX - mapCenterX;
                
                const adjustedPoint = new window.kakao.maps.Point(
                  centerPoint.x + offsetX,
                  centerPoint.y
                );
                
                const adjustedCenter = projection.coordsFromPoint(adjustedPoint);
                
                map.panTo(adjustedCenter);
                
                setTimeout(() => {
                  isUpdatingCenterRef.current = false;
                }, 400);
              }
            }, 150);
          } else {
            setTimeout(() => {
              isUpdatingCenterRef.current = false;
            }, 300);
          }
        } else {
          // 검색 결과가 변경되지 않았으면 플래그만 해제
          setTimeout(() => {
            isUpdatingCenterRef.current = false;
          }, 100);
        }
        
        // 현재 호텔 목록 저장
        lastHotelsRef.current = hotelsWithCoords;
      }

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

      // 선택된 호텔에 대한 처리는 별도 useEffect에서 수행
      // 초기화 완료 후 플래그 해제는 setTimeout으로 지연
      // 현재 호텔 목록 저장 (지도가 새로 생성된 경우)
      if (!mapInstanceRef.current || map === mapInstanceRef.current) {
        lastHotelsRef.current = hotelsWithCoords;
      }
      
      setTimeout(() => {
        isUpdatingCenterRef.current = false;
      }, 300);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, hotels]); // selectedHotelId는 별도 useEffect에서 처리하여 중복 실행 방지

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

  // 선택된 호텔 변경 또는 모달 상태 변경 시 지도 중심 이동 및 모달 고려한 중앙 조정
  useEffect(() => {
    if (!mapInstanceRef.current || !isLoaded || hotels.length === 0) return;
    if (isUpdatingCenterRef.current) return; // 이미 업데이트 중이면 스킵

    // 기존 타이머 클리어
    if (centerUpdateTimeoutRef.current) {
      clearTimeout(centerUpdateTimeoutRef.current);
      centerUpdateTimeoutRef.current = null;
    }

    // 같은 호텔이 연속으로 선택되고 모달 상태가 변경되지 않으면 스킵
    const modalStateChanged = 
      lastModalStateRef.current.isOpen !== isModalOpen || 
      lastModalStateRef.current.width !== modalWidth;
    
    // 모달이 닫힌 경우 감지 (이전에는 열려있었고 지금은 닫혀있는 경우)
    const modalJustClosed = lastModalStateRef.current.isOpen && !isModalOpen;

    if (selectedHotelId === lastSelectedHotelIdRef.current && !modalStateChanged) {
      return;
    }

    lastSelectedHotelIdRef.current = selectedHotelId;
    lastModalStateRef.current = { isOpen: isModalOpen, width: modalWidth };

    // 기존 idle 이벤트 리스너 제거
    if (idleHandlerRef.current && mapInstanceRef.current) {
      window.kakao.maps.event.removeListener(mapInstanceRef.current, 'idle', idleHandlerRef.current);
      idleHandlerRef.current = null;
    }

    // 디바운싱을 위한 타이머 설정 (중복 실행 방지)
    centerUpdateTimeoutRef.current = setTimeout(() => {
      if (!mapInstanceRef.current || isUpdatingCenterRef.current) return;
      
      isUpdatingCenterRef.current = true;

      try {
        // 호텔 배열에서 좌표 찾기
        const hotelsWithCoords = hotels
          .map((hotel) => {
            let mapY = null;
            let mapX = null;
            if (hotel.hotelLocation && hotel.hotelLocation.mapY && hotel.hotelLocation.mapX) {
              mapY = parseFloat(hotel.hotelLocation.mapY);
              mapX = parseFloat(hotel.hotelLocation.mapX);
            } else if (hotel.mapY != null && hotel.mapX != null) {
              mapY = parseFloat(hotel.mapY);
              mapX = parseFloat(hotel.mapX);
            }
            if (mapY && mapX && !isNaN(mapY) && !isNaN(mapX)) {
              return { ...hotel, mapY, mapX };
            }
            return null;
          })
          .filter((hotel) => hotel !== null);

        if (hotelsWithCoords.length === 0) {
          isUpdatingCenterRef.current = false;
          return;
        }

        const map = mapInstanceRef.current;

        // 선택된 호텔이 있는 경우
        if (selectedHotelId) {
          const selectedHotel = hotelsWithCoords.find(
            (h) => h.contentId === selectedHotelId
          );

          if (selectedHotel) {
            const selectedPosition = new window.kakao.maps.LatLng(
              selectedHotel.mapY,
              selectedHotel.mapX
            );

            // 모달이 열려있을 때는 (전체 지도 영역 - 모달 크기)의 중앙에 위치
            if (isModalOpenRef.current && modalWidthRef.current > 0) {
              // relayout을 먼저 호출하여 지도 크기 업데이트
              map.relayout();
              
              // 지도 크기 업데이트 대기 후 직접 계산
              setTimeout(() => {
                if (!mapInstanceRef.current || !mapRef.current) {
                  isUpdatingCenterRef.current = false;
                  return;
                }
                
                const map = mapInstanceRef.current;
                const projection = map.getProjection();
                
                // 지도 컨테이너의 실제 크기 가져오기
                const mapContainer = mapRef.current;
                const mapWidth = mapContainer.clientWidth || mapContainer.offsetWidth;
                
                // 선택된 호텔 위치를 픽셀 좌표로 변환
                const hotelPoint = projection.pointFromCoords(selectedPosition);
                
                // 모달을 제외한 영역의 중앙 픽셀 좌표 계산
                // 지도 영역의 중앙 = 지도 너비 / 2, 모달 고려 = (지도 너비 - 모달 너비) / 2
                const mapCenterX = mapWidth / 2;
                const adjustedCenterX = (mapWidth - modalWidthRef.current) / 2;
                
                // 호텔 위치에서 조정된 중앙까지의 오프셋 계산
                const offsetX = adjustedCenterX - mapCenterX;
                const adjustedPoint = new window.kakao.maps.Point(
                  hotelPoint.x + offsetX,
                  hotelPoint.y
                );
                
                // 픽셀 좌표를 지도 좌표로 변환
                const adjustedCenter = projection.coordsFromPoint(adjustedPoint);
                
                // 부드러운 애니메이션으로 중앙으로 이동
                map.panTo(adjustedCenter);
                
                // 애니메이션 완료 후 플래그 해제 (panTo는 약 300ms 소요)
                setTimeout(() => {
                  isUpdatingCenterRef.current = false;
                }, 400);
              }, 150);
            } else {
              // 모달이 닫혀있으면 선택된 호텔을 전체 지도 중앙에 부드럽게 이동
              if (modalJustClosed) {
                // 모달이 방금 닫힌 경우: relayout 후 선택된 호텔을 중앙으로 이동
                map.relayout();
                
                setTimeout(() => {
                  if (!mapInstanceRef.current || !mapRef.current) {
                    isUpdatingCenterRef.current = false;
                    return;
                  }
                  
                  const map = mapInstanceRef.current;
                  
                  // 부드럽게 선택된 호텔 위치로 이동 (전체 지도 중앙)
                  map.panTo(selectedPosition);
                  
                  // 애니메이션 완료 후 전체 호텔들을 볼 수 있도록 bounds 조정
                  setTimeout(() => {
                    if (!mapInstanceRef.current) return;
                    
                    const bounds = new window.kakao.maps.LatLngBounds();
                    hotelsWithCoords.forEach((hotel) => {
                      const position = new window.kakao.maps.LatLng(
                        hotel.mapY,
                        hotel.mapX
                      );
                      bounds.extend(position);
                    });
                    
                    bounds.extend(selectedPosition);
                    
                    // 부드럽게 bounds 조정
                    mapInstanceRef.current.setBounds(bounds);
                    isUpdatingCenterRef.current = false;
                  }, 400);
                }, 150);
              } else {
                // 모달이 이미 닫혀있던 경우: 전체 호텔들을 한눈에 볼 수 있도록 bounds 조정
                const bounds = new window.kakao.maps.LatLngBounds();
                hotelsWithCoords.forEach((hotel) => {
                  const position = new window.kakao.maps.LatLng(
                    hotel.mapY,
                    hotel.mapX
                  );
                  bounds.extend(position);
                });
                
                bounds.extend(selectedPosition);
                
                map.setBounds(bounds);
                isUpdatingCenterRef.current = false;
              }
            }
          } else {
            isUpdatingCenterRef.current = false;
          }
        } else {
          // 선택된 호텔이 없는 경우 - 전체 호텔들을 한눈에 볼 수 있도록 bounds 조정
          const bounds = new window.kakao.maps.LatLngBounds();
          hotelsWithCoords.forEach((hotel) => {
            const position = new window.kakao.maps.LatLng(
              hotel.mapY,
              hotel.mapX
            );
            bounds.extend(position);
          });
          
          map.setBounds(bounds);
          
          // 모달이 열려있을 때는 bounds 조정 후 모달 고려한 중앙으로 조정
          if (isModalOpenRef.current && modalWidthRef.current > 0) {
            map.relayout();
            
            setTimeout(() => {
              if (!mapInstanceRef.current || !mapRef.current) {
                isUpdatingCenterRef.current = false;
                return;
              }
              
              const map = mapInstanceRef.current;
              const projection = map.getProjection();
              const currentCenter = map.getCenter();
              const centerPoint = projection.pointFromCoords(currentCenter);
              
              // 지도 컨테이너의 실제 크기 가져오기
              const mapContainer = mapRef.current;
              const mapWidth = mapContainer.clientWidth || mapContainer.offsetWidth;
              
              // 지도 크기 기반으로 정확한 오프셋 계산
              const mapCenterX = mapWidth / 2;
              const adjustedCenterX = (mapWidth - modalWidthRef.current) / 2;
              const offsetX = adjustedCenterX - mapCenterX;
              
              const adjustedPoint = new window.kakao.maps.Point(
                centerPoint.x + offsetX,
                centerPoint.y
              );
              
              const adjustedCenter = projection.coordsFromPoint(adjustedPoint);
              
              // 부드러운 애니메이션으로 중앙으로 이동
              map.panTo(adjustedCenter);
              
              // 애니메이션 완료 후 플래그 해제
              setTimeout(() => {
                isUpdatingCenterRef.current = false;
              }, 400);
            }, 150);
          } else if (modalJustClosed) {
            // 모달이 방금 닫힌 경우: bounds를 전체 지도 중앙으로 부드럽게 이동
            map.relayout();
            
            setTimeout(() => {
              if (!mapInstanceRef.current || !mapRef.current) {
                isUpdatingCenterRef.current = false;
                return;
              }
              
              const map = mapInstanceRef.current;
              const projection = map.getProjection();
              const currentCenter = map.getCenter();
              const centerPoint = projection.pointFromCoords(currentCenter);
              
              // 지도 컨테이너의 실제 크기 가져오기
              const mapContainer = mapRef.current;
              const mapWidth = mapContainer.clientWidth || mapContainer.offsetWidth;
              
              // 현재 중심에서 전체 지도 중앙으로 오프셋 계산
              // 모달이 열려있을 때는 왼쪽으로 이동했으므로, 닫히면 다시 중앙으로
              const mapCenterX = mapWidth / 2;
              const adjustedCenterX = mapWidth / 2; // 전체 지도 중앙
              
              // 현재 중심의 픽셀 좌표에서 중앙까지의 오프셋 계산
              // 이전에 왼쪽으로 이동했던 만큼 오른쪽으로 이동
              const previousOffset = -(modalWidthRef.current / 2); // 이전 오프셋 (음수였음)
              const offsetX = -previousOffset; // 반대 방향으로 이동
              
              const adjustedPoint = new window.kakao.maps.Point(
                centerPoint.x + offsetX,
                centerPoint.y
              );
              
              const adjustedCenter = projection.coordsFromPoint(adjustedPoint);
              
              // 부드러운 애니메이션으로 전체 지도 중앙으로 이동
              map.panTo(adjustedCenter);
              
              // 애니메이션 완료 후 플래그 해제
              setTimeout(() => {
                isUpdatingCenterRef.current = false;
              }, 400);
            }, 150);
          } else {
            isUpdatingCenterRef.current = false;
          }
        }
      } catch (error) {
        console.error('지도 중심 이동 오류:', error);
        isUpdatingCenterRef.current = false;
      }
    }, 200); // 200ms 디바운싱

    // cleanup 함수
    return () => {
      if (centerUpdateTimeoutRef.current) {
        clearTimeout(centerUpdateTimeoutRef.current);
        centerUpdateTimeoutRef.current = null;
      }
      if (idleHandlerRef.current && mapInstanceRef.current) {
        window.kakao.maps.event.removeListener(mapInstanceRef.current, 'idle', idleHandlerRef.current);
        idleHandlerRef.current = null;
      }
    };
  }, [selectedHotelId, isLoaded, hotels, isModalOpen, modalWidth]); // 모든 의존성 명시

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

