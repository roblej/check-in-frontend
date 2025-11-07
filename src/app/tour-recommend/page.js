'use client';

import { useState, useEffect, useRef } from 'react';
import { hotelAPI } from '@/lib/api/hotel';
import Header from '@/components/Header';
import { MessageCircle, Send, MapPin, Hotel, Loader2, X } from 'lucide-react';
import Link from 'next/link';

export default function TourRecommendPage() {
  const [keyword, setKeyword] = useState('');
  const [recommendations, setRecommendations] = useState([]);
  const [selectedTour, setSelectedTour] = useState(null);
  const [tourNearbyHotels, setTourNearbyHotels] = useState([]);
  const [isTourHotelsLoading, setIsTourHotelsLoading] = useState(false);
  const [isTourDetailLoading, setIsTourDetailLoading] = useState(false);
  const [selectedTourDetail, setSelectedTourDetail] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [nearbyTours, setNearbyTours] = useState([]);
  const [isTourLoading, setIsTourLoading] = useState(false);
  const [showDetailPanel, setShowDetailPanel] = useState(false);
  const [targetLocation, setTargetLocation] = useState(null); // 관광지 좌표 저장용
  
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const tourMarkersRef = useRef([]);
  const messagesEndRef = useRef(null);

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

  // 카카오맵 초기화
  useEffect(() => {
    const loadMap = () => {
      if (!window.kakao || !window.kakao.maps) {
        console.error('카카오맵을 불러올 수 없습니다.');
        return;
      }

      window.kakao.maps.load(() => {
        const container = mapRef.current;
        if (!container) return;

        const options = {
          center: new window.kakao.maps.LatLng(36.5, 127.5), // 한국 중심
          level: 7,
        };

        const map = new window.kakao.maps.Map(container, options);
        mapInstanceRef.current = map;
        setMapLoaded(true);
      });
    };

    // 카카오맵 스크립트가 이미 로드되어 있는지 확인
    if (window.kakao && window.kakao.maps) {
      loadMap();
    } else {
      // 스크립트가 없으면 동적으로 로드
      const script = document.createElement('script');
      script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_MAP_API_KEY}&autoload=false`;
      script.async = true;
      script.onload = () => {
        window.kakao.maps.load(loadMap);
      };
      document.head.appendChild(script);
    }
  }, []);

  // 관광지 마커 제거
  const clearTourMarkers = () => {
    tourMarkersRef.current.forEach(marker => marker.setMap(null));
    tourMarkersRef.current = [];
  };

  // 관광지 마커 표시
  const displayTourMarkers = (tours) => {
    if (!window.kakao || !window.kakao.maps || !mapInstanceRef.current) return;
    clearTourMarkers();

    tours.forEach((t) => {
      const x = parseFloat(t.mapx);
      const y = parseFloat(t.mapy);
      if (!Number.isFinite(x) || !Number.isFinite(y)) return;

      const pos = new window.kakao.maps.LatLng(y, x);

      const marker = new window.kakao.maps.Marker({
        position: pos,
        map: mapInstanceRef.current,
        title: t.title || "tour",
      });

      const iw = new window.kakao.maps.InfoWindow({
        content: `<div style="padding:6px 10px;font-size:12px;">${t.title || "tour"}</div>`,
        disableAutoPan: true,
      });

      window.kakao.maps.event.addListener(marker, 'mouseover', () => iw.open(mapInstanceRef.current, marker));
      window.kakao.maps.event.addListener(marker, 'mouseout', () => iw.close());
      window.kakao.maps.event.addListener(marker, 'click', () => {
        handleSelectTour(t);
      });

      tourMarkersRef.current.push(marker);
    });
  };

  // 관광지가 화면에 가득 차도록 지도 영역 맞춤
  const fitMapToTours = (tours) => {
    if (!window.kakao || !window.kakao.maps || !mapInstanceRef.current) return;
    if (!Array.isArray(tours) || tours.length === 0) return;
    const bounds = new window.kakao.maps.LatLngBounds();
    let added = 0;
    tours.forEach((t) => {
      const x = parseFloat(t.mapx);
      const y = parseFloat(t.mapy);
      if (Number.isFinite(x) && Number.isFinite(y)) {
        bounds.extend(new window.kakao.maps.LatLng(y, x));
        added += 1;
      }
    });
    if (added > 0) {
      mapInstanceRef.current.setBounds(bounds);
    }
  };

  // 챗봇으로 관광지 추천 요청
  const handleRecommend = async (e) => {
    e?.preventDefault();
    if (!keyword.trim()) return;

    setIsLoading(true);
    setRecommendations([]);
    setNearbyTours([]);
    clearTourMarkers();
    setSelectedTour(null);
    setShowDetailPanel(false);

    try {
      const response = await fetch('/api/chat/recommend', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ keyword: keyword.trim() }),
      });

      if (!response.ok) {
        const error = await response.json();
        alert(error.message || '추천 요청 실패');
        return;
      }

      const data = await response.json();
      const recs = data.recommendations || [];
      setRecommendations(recs);

      // 추천된 관광지들을 TourAPI로 검색
      if (recs.length > 0) {
        await searchToursByRecommendations(recs);
      }
    } catch (error) {
      console.error('추천 요청 실패:', error);
      alert('추천 요청 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // 추천된 관광지들을 TourAPI로 검색 (여러 방법 시도) 및 AI 설명 매칭
  const searchToursByRecommendations = async (recs) => {
    try {
      setIsTourLoading(true);
      const allTours = [];
      const foundTourNames = new Set(); // 중복 방지
      const aiDescriptionMap = new Map(); // AI 설명 매핑 (name -> description)

      // AI 추천의 설명을 맵에 저장
      recs.forEach(rec => {
        if (rec.name && rec.description) {
          aiDescriptionMap.set(rec.name, rec.description);
        }
      });

      for (const rec of recs) {
        const areaCode = areaCodeMap[rec.location] || null;
        const contentTypeId = rec.contentTypeId || '12';
        let found = false;

        // 방법 1: 정확한 이름 + 지역코드 + contentTypeId로 검색
        if (areaCode) {
          const searchParams1 = new URLSearchParams({
            keyword: rec.name,
            numOfRows: '10',
            arrange: 'A',
            areaCode: areaCode,
            contentTypeId: contentTypeId,
          });

          const url1 = `/api/tour/search?${searchParams1.toString()}`;
          const res1 = await fetch(url1);

          if (res1.ok) {
            const data1 = await res1.json();
            const items1 = Array.isArray(data1.items) ? data1.items : [];
            items1.forEach(item => {
              const tourName = item.title || item.name;
              if (tourName && !foundTourNames.has(tourName)) {
                // AI 설명 매칭 (이름이 정확히 일치하거나 포함되는 경우)
                if (tourName === rec.name || tourName.includes(rec.name) || rec.name.includes(tourName)) {
                  item.aiDescription = rec.description;
                }
                allTours.push(item);
                foundTourNames.add(tourName);
                found = true;
              }
            });
          }
        }

        // 방법 2: 정확한 이름 + 지역코드만으로 검색 (contentTypeId 없이)
        if (!found && areaCode) {
          const searchParams2 = new URLSearchParams({
            keyword: rec.name,
            numOfRows: '10',
            arrange: 'A',
            areaCode: areaCode,
          });

          const url2 = `/api/tour/search?${searchParams2.toString()}`;
          const res2 = await fetch(url2);

          if (res2.ok) {
            const data2 = await res2.json();
            const items2 = Array.isArray(data2.items) ? data2.items : [];
            items2.forEach(item => {
              const tourName = item.title || item.name;
              if (tourName && !foundTourNames.has(tourName)) {
                // AI 설명 매칭
                if (tourName === rec.name || tourName.includes(rec.name) || rec.name.includes(tourName)) {
                  item.aiDescription = rec.description;
                }
                allTours.push(item);
                foundTourNames.add(tourName);
                found = true;
              }
            });
          }
        }

        // 방법 3: 정확한 이름만으로 검색 (지역코드, contentTypeId 없이)
        if (!found) {
          const searchParams3 = new URLSearchParams({
            keyword: rec.name,
            numOfRows: '10',
            arrange: 'A',
          });

          const url3 = `/api/tour/search?${searchParams3.toString()}`;
          const res3 = await fetch(url3);

          if (res3.ok) {
            const data3 = await res3.json();
            const items3 = Array.isArray(data3.items) ? data3.items : [];
            items3.forEach(item => {
              const tourName = item.title || item.name;
              if (tourName && !foundTourNames.has(tourName)) {
                // AI 설명 매칭
                if (tourName === rec.name || tourName.includes(rec.name) || rec.name.includes(tourName)) {
                  item.aiDescription = rec.description;
                }
                allTours.push(item);
                foundTourNames.add(tourName);
                found = true;
              }
            });
          }
        }

        // 방법 4: 이름의 일부만으로 검색 (정확한 이름이 없을 때)
        if (!found && rec.name.length > 2) {
          // 이름의 앞부분 2글자 이상으로 검색
          const partialName = rec.name.substring(0, Math.min(rec.name.length, 5));
          const searchParams4 = new URLSearchParams({
            keyword: partialName,
            numOfRows: '10',
            arrange: 'A',
          });

          if (areaCode) {
            searchParams4.set('areaCode', areaCode);
          }

          const url4 = `/api/tour/search?${searchParams4.toString()}`;
          const res4 = await fetch(url4);

          if (res4.ok) {
            const data4 = await res4.json();
            const items4 = Array.isArray(data4.items) ? data4.items : [];
            // 부분 일치 검색 결과 중 가장 유사한 것만 선택
            items4.forEach(item => {
              const tourName = item.title || item.name;
              if (tourName && tourName.includes(partialName) && !foundTourNames.has(tourName)) {
                // AI 설명 매칭
                if (tourName === rec.name || tourName.includes(rec.name) || rec.name.includes(tourName)) {
                  item.aiDescription = rec.description;
                }
                allTours.push(item);
                foundTourNames.add(tourName);
                found = true;
              }
            });
          }
        }

        // 방법 5: 지역명만으로 검색 (이름으로 찾지 못했을 때)
        if (!found && areaCode) {
          const searchParams5 = new URLSearchParams({
            keyword: rec.location,
            numOfRows: '5',
            arrange: 'A',
            areaCode: areaCode,
          });

          const url5 = `/api/tour/search?${searchParams5.toString()}`;
          const res5 = await fetch(url5);

          if (res5.ok) {
            const data5 = await res5.json();
            const items5 = Array.isArray(data5.items) ? data5.items : [];
            // 첫 번째 결과만 추가 (지역 대표 관광지)
            if (items5.length > 0) {
              const item = items5[0];
              const tourName = item.title || item.name;
              if (tourName && !foundTourNames.has(tourName)) {
                // AI 설명 매칭
                if (tourName === rec.name || tourName.includes(rec.name) || rec.name.includes(tourName)) {
                  item.aiDescription = rec.description;
                }
                allTours.push(item);
                foundTourNames.add(tourName);
              }
            }
          }
        }
      }

      setNearbyTours(allTours);

      if (allTours.length > 0) {
        displayTourMarkers(allTours);
        fitMapToTours(allTours);
      }
    } catch (error) {
      console.error('관광지 검색 실패:', error);
    } finally {
      setIsTourLoading(false);
    }
  };

  // 관광지 선택 핸들러
  const handleSelectTour = async (tour) => {
    setSelectedTour(tour);
    setShowDetailPanel(true);
    setIsTourDetailLoading(true);
    
    // 좌표 저장 및 areaCode 가져오기
    const x = parseFloat(tour.mapx);
    const y = parseFloat(tour.mapy);
    if (Number.isFinite(x) && Number.isFinite(y)) {
      const locationInfo = await getAreaCodeFromCoords(y, x);
      setTargetLocation({
        lat: y,
        lng: x,
        areaCode: locationInfo?.areaCode || tour.areacode || null
      });
      
      if (mapInstanceRef.current && window.kakao) {
        mapInstanceRef.current.panTo(new window.kakao.maps.LatLng(y, x));
      }
    }
    
    fetchTourDetail(tour);
    fetchHotelsNearTour(tour);
  };

  // 상세 정보 조회
  const fetchTourDetail = async (tour) => {
    try {
      setIsTourDetailLoading(true);
      const contentId = tour.contentid || tour.contentId;
      const contentTypeId = tour.contenttypeid || tour.contentTypeId;
      if (!contentId || !contentTypeId) {
        setSelectedTourDetail(null);
        return;
      }
      const url = `/api/tour/detail?contentId=${encodeURIComponent(contentId)}&contentTypeId=${encodeURIComponent(contentTypeId)}`;
      const res = await fetch(url);
      if (!res.ok) {
        setSelectedTourDetail(null);
        return;
      }
      const data = await res.json();
      setSelectedTourDetail(data);
    } catch (e) {
      console.error('관광지 상세 조회 실패:', e);
      setSelectedTourDetail(null);
    } finally {
      setIsTourDetailLoading(false);
    }
  };

  // 선택된 관광지 인근 호텔 조회 (DartGameModal과 동일한 로직)
  const fetchHotelsNearTour = async (tour) => {
    try {
      setIsTourHotelsLoading(true);
      const x = parseFloat(tour.mapx);
      const y = parseFloat(tour.mapy);
      
      // areaCode 우선순위: tour.areacode > targetLocation.areaCode > null
      const areaCode = tour.areacode || targetLocation?.areaCode || null;
      
      const response = await hotelAPI.getHotelsByAreaCode(
        areaCode,
        10,
        y,
        x
      );
      
      // 거리 보강(응답에 없으면 계산)
      const withDistance = (response || []).map((h) => {
        if (typeof h.distance === 'number') return h;
        if (typeof h.lat === 'number' && typeof h.lng === 'number') {
          const d = haversineKm(y, x, h.lat, h.lng);
          return { ...h, distance: d };
        }
        return h;
      });
      
      setTourNearbyHotels(withDistance);
    } catch (e) {
      console.error('관광지 인근 호텔 조회 실패:', e);
      setTourNearbyHotels([]);
    } finally {
      setIsTourHotelsLoading(false);
    }
  };

  // 하버사인 거리 계산(km)
  const haversineKm = (lat1, lon1, lat2, lon2) => {
    const toRad = (v) => (v * Math.PI) / 180;
    const R = 6371;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = Math.sin(dLat/2)**2 + Math.cos(toRad(lat1))*Math.cos(toRad(lat2))*Math.sin(dLon/2)**2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // 값이 없을 때 "정보 없음"으로 출력하는 헬퍼
  const valueOrNA = (v) => {
    if (v === null || v === undefined) return '정보 없음';
    const s = String(v).trim();
    return s.length === 0 ? '정보 없음' : s;
  };

  // <br> 태그를 개행으로 치환
  const br2nl = (v) => {
    const s = valueOrNA(v);
    return s.replace(/<br\s*\/?>(\s*)/gi, '\n');
  };

  // 스크롤을 맨 아래로
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [recommendations, nearbyTours]);

  return (
    <div className="h-screen bg-gray-50 overflow-hidden flex flex-col">
      <Header />
      
      {/* 상단 검색 바 */}
      <div className="bg-white border-b flex-shrink-0">
        <div className="max-w-[1200px] mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <MessageCircle className="w-6 h-6 text-blue-600" />
              AI 관광지 추천
            </h1>
            <div className="flex-1">
              <form onSubmit={handleRecommend} className="flex gap-2">
                <input
                  type="text"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder="예: 해변, 맛집, 박물관, 힐링..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  disabled={isLoading || !keyword.trim()}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                  추천받기
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* 메인 컨텐츠 - 좌우 분할 */}
      <div className="flex flex-1 relative overflow-hidden">
        {/* 좌측: 검색 결과 */}
        <div className="flex-1 lg:w-[20%] overflow-y-auto border-r border-gray-100">
          <div className="p-4 space-y-4">
            {/* 검색된 관광지 목록 */}
            {isTourLoading ? (
              <div className="bg-white rounded-lg shadow-sm p-4 text-center">
                <Loader2 className="w-6 h-6 animate-spin mx-auto text-blue-600" />
                <p className="text-gray-600 mt-2 text-sm">관광지 검색 중...</p>
              </div>
            ) : nearbyTours.length > 0 ? (
              <div className="bg-white rounded-lg shadow-sm p-4">
                <h2 className="text-lg font-bold text-gray-900 mb-3">
                  검색된 관광지 ({nearbyTours.length}개)
                </h2>
                <div className="space-y-2 max-h-[600px] overflow-y-auto">
                  {nearbyTours.map((tour, idx) => (
                    <div
                      key={idx}
                      onClick={() => handleSelectTour(tour)}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedTour?.contentid === tour.contentid || selectedTour?.contentId === tour.contentid
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <h3 className="font-semibold text-gray-900 text-sm">{tour.title || tour.name}</h3>
                      {tour.aiDescription && (
                        <p className="text-xs text-blue-600 mt-1 line-clamp-2 italic">
                          💡 {tour.aiDescription}
                        </p>
                      )}
                      {tour.addr1 && (
                        <p className="text-xs text-gray-600 mt-1 line-clamp-1">{tour.addr1}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            {recommendations.length === 0 && nearbyTours.length === 0 && !isLoading && (
              <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">키워드를 입력하여 관광지를 추천받아보세요!</p>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* 우측: 지도 */}
        <div className={`hidden lg:block lg:flex-shrink-0 transition-all duration-300 ${
          showDetailPanel ? 'lg:w-[calc(80%-555px-24px)]' : 'lg:w-[80%]'
        }`}>
          <div className="w-full h-full bg-gray-100 relative">
            <div ref={mapRef} className="w-full h-full" />
            {!mapLoaded && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
                <div className="text-center">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
                  <p className="text-gray-600">지도를 불러오는 중...</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 관광지 상세 패널 - 지도 영역 내부에 배치 */}
      {showDetailPanel && selectedTour && (
        <div className="fixed top-[56px] right-0 w-full lg:w-[555px] lg:left-[calc(20%+24px)] lg:top-[calc(56px+56px+24px)] lg:h-[calc(100vh-56px-56px-48px)] bg-white shadow-2xl z-50 rounded-xl overflow-hidden flex flex-col">
          {/* 패널 헤더 */}
          <div className="flex-shrink-0 border-b border-gray-200 px-6 py-4 flex items-center justify-between bg-white rounded-t-xl">
            <h2 className="text-xl font-bold text-gray-900">관광지 상세 정보</h2>
            <button
              onClick={() => {
                setShowDetailPanel(false);
                setSelectedTour(null);
              }}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {/* 패널 내용 */}
          <div className="flex-1 overflow-y-auto px-6 py-4 pb-4">
              {isTourDetailLoading ? (
                <div className="text-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto text-blue-600" />
                  <p className="text-gray-600 mt-2">로딩 중...</p>
                </div>
              ) : selectedTourDetail ? (
                <div className="space-y-4">
                  {/* 관광지 이미지 */}
                  {(selectedTourDetail.images?.[0]?.originimgurl || selectedTour?.firstimage) && (
                    <div className="h-56 overflow-hidden rounded-xl">
                      <img 
                        src={selectedTourDetail.images?.[0]?.originimgurl || selectedTour.firstimage} 
                        alt={selectedTourDetail.title || selectedTour.title} 
                        className="w-full h-full object-cover" 
                      />
                    </div>
                  )}
                  
                  <div>
                    <h3 className="font-semibold text-gray-900 text-lg">
                      {selectedTourDetail.title || selectedTourDetail.common?.title || selectedTour.title}
                    </h3>
                    {(selectedTourDetail.addr1 || selectedTourDetail.common?.addr1 || selectedTour?.addr1) && (
                      <p className="text-sm text-gray-600 mt-1 flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {selectedTourDetail.addr1 || selectedTourDetail.common?.addr1 || selectedTour?.addr1}
                        {selectedTourDetail.common?.addr2 && ` ${selectedTourDetail.common.addr2}`}
                      </p>
                    )}
                    {selectedTour.aiDescription && (
                      <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm text-blue-900 italic">
                          💡 <strong>AI 추천:</strong> {selectedTour.aiDescription}
                        </p>
                      </div>
                    )}
                  </div>
                  
                  {(selectedTourDetail.overview || selectedTourDetail.common?.overview) && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">개요</h4>
                      <div 
                        className="text-sm text-gray-700 leading-relaxed prose prose-sm max-w-none"
                        dangerouslySetInnerHTML={{ 
                          __html: selectedTourDetail.common?.overview || br2nl(selectedTourDetail.overview) 
                        }}
                      />
                    </div>
                  )}
                  
                  {selectedTourDetail.intro && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">상세 정보</h4>
                      <div className="text-sm text-gray-700 space-y-2">
                        {selectedTourDetail.intro.infocenter && (
                          <p><strong>문의:</strong> {valueOrNA(selectedTourDetail.intro.infocenter)}</p>
                        )}
                        {selectedTourDetail.intro.usetime && (
                          <p><strong>이용시간:</strong> {valueOrNA(selectedTourDetail.intro.usetime)}</p>
                        )}
                        {selectedTourDetail.intro.restdate && (
                          <p><strong>휴무일:</strong> {valueOrNA(selectedTourDetail.intro.restdate)}</p>
                        )}
                        {selectedTourDetail.intro.usefee && (
                          <p><strong>이용요금:</strong> {valueOrNA(selectedTourDetail.intro.usefee)}</p>
                        )}
                        {selectedTourDetail.intro.parking && (
                          <p><strong>주차:</strong> {valueOrNA(selectedTourDetail.intro.parking)}</p>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {selectedTourDetail.common?.homepage && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">홈페이지</h4>
                      <div 
                        className="text-sm text-blue-600 underline" 
                        dangerouslySetInnerHTML={{ __html: selectedTourDetail.common.homepage }} 
                      />
                    </div>
                  )}

                  {/* 가까운 호텔 */}
                  <div className="border-t border-gray-200 pt-4">
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <Hotel className="w-5 h-5" />
                      가까운 호텔
                    </h4>
                    {isTourHotelsLoading ? (
                      <div className="text-center py-6">
                        <Loader2 className="w-6 h-6 animate-spin mx-auto text-blue-600" />
                        <p className="text-gray-600 mt-2 text-sm">호텔 검색 중...</p>
                      </div>
                    ) : tourNearbyHotels.length > 0 ? (
                      <div className="space-y-3">
                        <div className="text-sm text-gray-600 mb-1">인근 호텔 {tourNearbyHotels.length}개 추천</div>
                        <div className="max-h-96 overflow-y-auto space-y-3">
                          {tourNearbyHotels.map((hotel, idx) => (
                            <div
                              key={hotel.contentId || idx}
                              className="border border-gray-200 rounded-lg overflow-hidden hover:shadow transition cursor-pointer"
                              onClick={() => window.open(`/hotel/${hotel.contentId}`, '_blank')}
                            >
                              {hotel.imageUrl && (
                                <div className="h-32 overflow-hidden">
                                  <img src={hotel.imageUrl} alt={hotel.title || hotel.hotelName || hotel.name} className="w-full h-full object-cover" />
                                </div>
                              )}
                              <div className="p-3">
                                <div className="font-semibold text-gray-900 line-clamp-1">{hotel.title || hotel.hotelName || hotel.name}</div>
                                {typeof hotel.distance === 'number' && (
                                  <div className="text-xs text-green-600 mt-1">관광지로부터 {hotel.distance.toFixed(1)}km</div>
                                )}
                                {(hotel.adress || hotel.address) && (
                                  <div className="text-xs text-gray-600 line-clamp-2 mt-1">{hotel.adress || hotel.address}</div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-6 text-gray-500 text-sm">
                        가까운 호텔이 없습니다.
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  상세 정보를 불러올 수 없습니다.
                </div>
              )}
          </div>
        </div>
      )}
    </div>
  );
}
