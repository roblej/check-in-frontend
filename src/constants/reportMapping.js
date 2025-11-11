// 신고 카테고리 코드 정의
export const REPORT_CATEGORY_CODE = {
  INACCURATE_INFO: 1,        // 부정확한 정보 제공
  SERVICE_COMPLAINT: 2,       // 서비스 불만
  CLEANLINESS_ISSUE: 3,       // 청결 문제
  FACILITY_ISSUE: 4,          // 시설 문제
  OTHER: 99                   // 기타
};

// 호텔 정보 섹션 식별자
export const HOTEL_INFO_SECTION = {
  BASIC_INFO: 'basicInfo',           // 기본 정보 (호텔명, 주소, 연락처)
  ROOMS: 'rooms',                    // 객실 목록
  ROOM_IMAGES: 'roomImages',         // 객실 사진
  ROOM_NAMES: 'roomNames',           // 객실명
  ROOM_PRICES: 'roomPrices',         // 객실 가격
  HOTEL_IMAGES: 'hotelImages',       // 호텔 이미지
  EVENTS: 'events',                  // 이벤트
  DINING: 'dining'                   // 다이닝
};

// subCategory 문자열 → 신고 코드 매핑
export const SUB_CATEGORY_TO_CODE = {
  '부정확한 정보 제공': REPORT_CATEGORY_CODE.INACCURATE_INFO,
  '서비스 불만': REPORT_CATEGORY_CODE.SERVICE_COMPLAINT,
  '청결 문제': REPORT_CATEGORY_CODE.CLEANLINESS_ISSUE,
  '시설 문제': REPORT_CATEGORY_CODE.FACILITY_ISSUE,
  '기타': REPORT_CATEGORY_CODE.OTHER
};

// 신고 코드 → 호텔 정보 섹션 매핑
export const CATEGORY_CODE_TO_SECTION = {
  [REPORT_CATEGORY_CODE.INACCURATE_INFO]: {
    // 부정확한 정보 제공 → 키워드 기반 세부 매핑
    default: HOTEL_INFO_SECTION.ROOMS,
    keywords: {
      '사진': HOTEL_INFO_SECTION.ROOM_IMAGES,
      '이미지': HOTEL_INFO_SECTION.ROOM_IMAGES,
      '이름': HOTEL_INFO_SECTION.ROOM_NAMES,
      '명': HOTEL_INFO_SECTION.ROOM_NAMES,
      '가격': HOTEL_INFO_SECTION.ROOM_PRICES,
      '요금': HOTEL_INFO_SECTION.ROOM_PRICES,
      '주소': HOTEL_INFO_SECTION.BASIC_INFO,
      '연락처': HOTEL_INFO_SECTION.BASIC_INFO,
      '전화': HOTEL_INFO_SECTION.BASIC_INFO,
      '번호': HOTEL_INFO_SECTION.BASIC_INFO
    }
  },
  [REPORT_CATEGORY_CODE.SERVICE_COMPLAINT]: {
    // 서비스 불만 → 기본 정보만 (호텔 정보 확인용)
    default: HOTEL_INFO_SECTION.BASIC_INFO,
    keywords: {}
  },
  [REPORT_CATEGORY_CODE.CLEANLINESS_ISSUE]: {
    // 청결 문제 → 객실 정보 + 이미지
    default: HOTEL_INFO_SECTION.ROOMS,
    keywords: {
      '객실': HOTEL_INFO_SECTION.ROOMS,
      '방': HOTEL_INFO_SECTION.ROOMS,
      '사진': HOTEL_INFO_SECTION.ROOM_IMAGES,
      '이미지': HOTEL_INFO_SECTION.ROOM_IMAGES
    }
  },
  [REPORT_CATEGORY_CODE.FACILITY_ISSUE]: {
    // 시설 문제 → 호텔 이미지 + 기본 정보
    default: HOTEL_INFO_SECTION.HOTEL_IMAGES,
    keywords: {
      '객실': HOTEL_INFO_SECTION.ROOM_IMAGES,
      '방': HOTEL_INFO_SECTION.ROOM_IMAGES,
      '시설': HOTEL_INFO_SECTION.HOTEL_IMAGES,
      '사진': HOTEL_INFO_SECTION.HOTEL_IMAGES,
      '이미지': HOTEL_INFO_SECTION.HOTEL_IMAGES
    }
  },
  [REPORT_CATEGORY_CODE.OTHER]: {
    // 기타 → 전체 정보
    default: null,
    keywords: {}
  }
};

/**
 * 타겟 섹션과 관련된 섹션들 반환
 */
const getRelatedSections = (targetSection) => {
  const relatedMap = {
    [HOTEL_INFO_SECTION.ROOM_IMAGES]: [
      HOTEL_INFO_SECTION.ROOMS,
      HOTEL_INFO_SECTION.ROOM_IMAGES
    ],
    [HOTEL_INFO_SECTION.ROOM_NAMES]: [
      HOTEL_INFO_SECTION.ROOMS,
      HOTEL_INFO_SECTION.ROOM_NAMES
    ],
    [HOTEL_INFO_SECTION.ROOM_PRICES]: [
      HOTEL_INFO_SECTION.ROOMS,
      HOTEL_INFO_SECTION.ROOM_PRICES
    ],
    [HOTEL_INFO_SECTION.BASIC_INFO]: [
      HOTEL_INFO_SECTION.BASIC_INFO
    ],
    [HOTEL_INFO_SECTION.ROOMS]: [
      HOTEL_INFO_SECTION.ROOMS,
      HOTEL_INFO_SECTION.ROOM_IMAGES
    ],
    [HOTEL_INFO_SECTION.HOTEL_IMAGES]: [
      HOTEL_INFO_SECTION.HOTEL_IMAGES,
      HOTEL_INFO_SECTION.BASIC_INFO
    ]
  };
  
  return relatedMap[targetSection] || [targetSection];
};

/**
 * 신고 내용에서 객실명 추출
 * @param {string} content - 신고 내용
 * @param {Array} roomNames - 호텔의 모든 객실명 배열
 * @returns {Array} 매칭된 객실명 배열
 */
export const extractRoomNamesFromContent = (content, roomNames) => {
  if (!content || !roomNames || roomNames.length === 0) {
    return [];
  }
  
  const contentLower = content.toLowerCase();
  const matchedRooms = [];
  
  // 객실명이 신고 내용에 포함되어 있는지 확인
  roomNames.forEach(roomName => {
    if (roomName && contentLower.includes(roomName.toLowerCase())) {
      matchedRooms.push(roomName);
    }
  });
  
  // 객실 번호 패턴 찾기 (예: "101호", "101번", "객실 101" 등)
  const roomNumberPattern = /(\d+)\s*(호|번|룸|방|객실)/gi;
  const roomNumbers = content.match(roomNumberPattern);
  if (roomNumbers) {
    roomNumbers.forEach(num => {
      // 숫자만 추출
      const number = num.match(/\d+/)?.[0];
      if (number) {
        // 객실명에 해당 번호가 포함된 객실 찾기
        roomNames.forEach(roomName => {
          if (roomName && roomName.includes(number) && !matchedRooms.includes(roomName)) {
            matchedRooms.push(roomName);
          }
        });
      }
    });
  }
  
  return matchedRooms;
};

/**
 * 신고 정보를 기반으로 포커스할 섹션 결정
 * @param {Object} report - 신고 객체 { category (subCategory), content }
 * @param {Array} roomNames - 호텔의 모든 객실명 배열 (선택적)
 * @returns {Object} { section, highlight, autoScroll, categoryCode, matchedRooms }
 */
export const getFocusSection = (report, roomNames = []) => {
  // 1. subCategory 문자열 → 코드 변환
  const categoryCode = SUB_CATEGORY_TO_CODE[report.category] || REPORT_CATEGORY_CODE.OTHER;
  
  // 2. 카테고리별 매핑 정보 가져오기
  const mapping = CATEGORY_CODE_TO_SECTION[categoryCode];
  
  if (!mapping) {
    return {
      section: null,
      highlight: [],
      autoScroll: false,
      categoryCode: REPORT_CATEGORY_CODE.OTHER,
      matchedRooms: []
    };
  }
  
  // 3. 신고 내용에서 객실명 추출
  const matchedRooms = extractRoomNamesFromContent(report.content, roomNames);
  
  // 4. 키워드 기반 세부 섹션 결정
  let targetSection = mapping.default;
  
  if (report.content && mapping.keywords) {
    const contentLower = report.content.toLowerCase();
    
    // 키워드 매칭 (우선순위 순서대로)
    for (const [keyword, section] of Object.entries(mapping.keywords)) {
      if (contentLower.includes(keyword)) {
        targetSection = section;
        break;  // 첫 번째 매칭된 키워드 사용
      }
    }
  }
  
  // 5. 하이라이트할 관련 섹션들 결정
  const highlightSections = targetSection ? getRelatedSections(targetSection) : [];
  
  return {
    section: targetSection,
    highlight: highlightSections,
    autoScroll: true,
    categoryCode,
    matchedRooms  // 매칭된 객실명 배열
  };
};

