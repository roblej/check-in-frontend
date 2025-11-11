"use client";

import { useEffect, useRef } from "react";
import { HOTEL_INFO_SECTION } from "@/constants/reportMapping";
import { Building2, MapPin, Phone, Bed, DollarSign, Image as ImageIcon } from "lucide-react";

const HotelInfoView = ({ 
  hotelInfo, 
  focusSection, 
  highlightSections = [], 
  autoScroll = false,
  matchedRooms = []  // 매칭된 객실명 배열
}) => {
  const sectionRefs = useRef({});
  
  useEffect(() => {
    if (autoScroll && focusSection) {
      // 포커스 섹션으로 자동 스크롤
      setTimeout(() => {
        const targetElement = sectionRefs.current[focusSection];
        if (targetElement) {
          targetElement.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center' 
          });
        }
      }, 100);
    }
  }, [focusSection, autoScroll]);
  
  const isHighlighted = (section) => {
    return highlightSections.includes(section);
  };
  
  if (!hotelInfo) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">호텔 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* 기본 정보 */}
      <div 
        ref={el => sectionRefs.current[HOTEL_INFO_SECTION.BASIC_INFO] = el}
        className={`p-4 rounded-lg border-2 transition-all ${
          isHighlighted(HOTEL_INFO_SECTION.BASIC_INFO) 
            ? 'bg-yellow-50 border-yellow-400 shadow-md' 
            : 'bg-gray-50 border-gray-200'
        }`}
      >
        <div className="flex items-center gap-2 mb-3">
          <Building2 className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-bold text-gray-900">기본 정보</h3>
          {isHighlighted(HOTEL_INFO_SECTION.BASIC_INFO) && (
            <span className="ml-2 px-2 py-0.5 text-xs font-semibold bg-yellow-400 text-yellow-900 rounded">
              관련 정보
            </span>
          )}
        </div>
        <div className="space-y-2 text-sm">
          <div className="flex items-start gap-2">
            <span className="font-medium text-gray-700 min-w-[80px]">호텔명:</span>
            <span className="text-gray-900">{hotelInfo.title || '-'}</span>
          </div>
          <div className="flex items-start gap-2">
            <MapPin className="w-4 h-4 text-gray-500 mt-0.5" />
            <span className="font-medium text-gray-700 min-w-[80px]">주소:</span>
            <span className="text-gray-900">{hotelInfo.adress || '-'}</span>
          </div>
          <div className="flex items-start gap-2">
            <Phone className="w-4 h-4 text-gray-500 mt-0.5" />
            <span className="font-medium text-gray-700 min-w-[80px]">연락처:</span>
            <span className="text-gray-900">{hotelInfo.tel || '-'}</span>
          </div>
          {hotelInfo.imageUrl && (
            <div className="mt-3">
              <img 
                src={hotelInfo.imageUrl} 
                alt={hotelInfo.title || '호텔 대표 이미지'} 
                className="w-full max-w-md h-48 object-cover rounded-lg"
              />
            </div>
          )}
        </div>
      </div>
      
      {/* 객실 목록 */}
      {hotelInfo.rooms && hotelInfo.rooms.length > 0 && (
        <div 
          ref={el => sectionRefs.current[HOTEL_INFO_SECTION.ROOMS] = el}
          className={`p-4 rounded-lg border-2 transition-all ${
            isHighlighted(HOTEL_INFO_SECTION.ROOMS) || 
            isHighlighted(HOTEL_INFO_SECTION.ROOM_IMAGES) ||
            isHighlighted(HOTEL_INFO_SECTION.ROOM_NAMES) ||
            isHighlighted(HOTEL_INFO_SECTION.ROOM_PRICES)
              ? 'bg-yellow-50 border-yellow-400 shadow-md' 
              : 'bg-gray-50 border-gray-200'
          }`}
        >
          <div className="flex items-center gap-2 mb-3">
            <Bed className="w-5 h-5 text-gray-600" />
            <h3 className="text-lg font-bold text-gray-900">객실 목록</h3>
            {(isHighlighted(HOTEL_INFO_SECTION.ROOMS) || 
              isHighlighted(HOTEL_INFO_SECTION.ROOM_IMAGES) ||
              isHighlighted(HOTEL_INFO_SECTION.ROOM_NAMES) ||
              isHighlighted(HOTEL_INFO_SECTION.ROOM_PRICES)) && (
              <span className="ml-2 px-2 py-0.5 text-xs font-semibold bg-yellow-400 text-yellow-900 rounded">
                관련 정보
              </span>
            )}
          </div>
          <div className="space-y-4">
            {hotelInfo.rooms.map((room, idx) => {
              // 매칭된 객실인지 확인
              const isMatchedRoom = matchedRooms.length > 0 && 
                matchedRooms.some(matchedName => 
                  room.name && room.name.toLowerCase().includes(matchedName.toLowerCase())
                );
              
              return (
              <div 
                key={room.roomIdx || idx}
                className={`p-4 rounded-lg border ${
                  isMatchedRoom
                    ? 'bg-red-50 border-red-400 shadow-lg' 
                    : isHighlighted(HOTEL_INFO_SECTION.ROOMS) || 
                      isHighlighted(HOTEL_INFO_SECTION.ROOM_IMAGES) ||
                      isHighlighted(HOTEL_INFO_SECTION.ROOM_NAMES) ||
                      isHighlighted(HOTEL_INFO_SECTION.ROOM_PRICES)
                    ? 'bg-yellow-100 border-yellow-300' 
                    : 'bg-white border-gray-200'
                }`}
              >
                {/* 객실명 강조 */}
                <div className={`mb-2 flex items-center gap-2 ${
                  isMatchedRoom
                    ? 'font-bold text-red-700 text-lg' 
                    : isHighlighted(HOTEL_INFO_SECTION.ROOM_NAMES) 
                    ? 'font-bold text-red-600 text-lg' 
                    : 'font-semibold text-gray-900'
                }`}>
                  <span>객실명: {room.name || room.roomName || `객실 ${idx + 1}`}</span>
                  {isMatchedRoom && (
                    <span className="px-2 py-0.5 text-xs font-semibold bg-red-500 text-white rounded">
                      신고된 객실
                    </span>
                  )}
                </div>
                
                {/* 가격 강조 */}
                <div className={`mb-2 ${
                  isHighlighted(HOTEL_INFO_SECTION.ROOM_PRICES) 
                    ? 'font-bold text-red-600 text-lg' 
                    : 'text-gray-700'
                }`}>
                  <DollarSign className="w-4 h-4 inline mr-1" />
                  가격: {room.price ? `${room.price.toLocaleString('ko-KR')}원` : '-'}
                </div>
                
                {/* 객실 정보 */}
                <div className="text-sm text-gray-600 space-y-1">
                  {room.bedType && (
                    <div>침대 타입: {room.bedType}</div>
                  )}
                  {room.maxOccupancy && (
                    <div>최대 인원: {room.maxOccupancy}명</div>
                  )}
                </div>
                
                {/* 객실 사진 강조 */}
                {isHighlighted(HOTEL_INFO_SECTION.ROOM_IMAGES) && room.images && room.images.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-yellow-300">
                    <div className="flex items-center gap-2 mb-2">
                      <ImageIcon className="w-4 h-4 text-yellow-700" />
                      <p className="text-sm font-semibold text-yellow-700">⚠️ 신고된 객실 사진</p>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {room.images.map((img, imgIdx) => (
                        <img 
                          key={imgIdx}
                          src={img.imageUrl || img} 
                          alt={`${room.name || `객실 ${idx + 1}`} 사진 ${imgIdx + 1}`}
                          className="w-full h-32 object-cover rounded-lg border-2 border-yellow-400"
                        />
                      ))}
                    </div>
                  </div>
                )}
                
                {/* 일반 객실 사진 (강조되지 않은 경우) */}
                {!isHighlighted(HOTEL_INFO_SECTION.ROOM_IMAGES) && room.images && room.images.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {room.images.slice(0, 3).map((img, imgIdx) => (
                        <img 
                          key={imgIdx}
                          src={img.imageUrl || img} 
                          alt={`${room.name || `객실 ${idx + 1}`} 사진 ${imgIdx + 1}`}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
            })}
          </div>
        </div>
      )}
      
      {/* 호텔 이미지 */}
      {hotelInfo.images && hotelInfo.images.length > 0 && (
        <div 
          ref={el => sectionRefs.current[HOTEL_INFO_SECTION.HOTEL_IMAGES] = el}
          className={`p-4 rounded-lg border-2 transition-all ${
            isHighlighted(HOTEL_INFO_SECTION.HOTEL_IMAGES) 
              ? 'bg-yellow-50 border-yellow-400 shadow-md' 
              : 'bg-gray-50 border-gray-200'
          }`}
        >
          <div className="flex items-center gap-2 mb-3">
            <ImageIcon className="w-5 h-5 text-gray-600" />
            <h3 className="text-lg font-bold text-gray-900">호텔 이미지</h3>
            {isHighlighted(HOTEL_INFO_SECTION.HOTEL_IMAGES) && (
              <span className="ml-2 px-2 py-0.5 text-xs font-semibold bg-yellow-400 text-yellow-900 rounded">
                관련 정보
              </span>
            )}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {hotelInfo.images.map((img, idx) => (
              <img 
                key={idx}
                src={img.originUrl || img.smallUrl || img} 
                alt={`호텔 이미지 ${idx + 1}`}
                className="w-full h-40 object-cover rounded-lg"
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default HotelInfoView;

