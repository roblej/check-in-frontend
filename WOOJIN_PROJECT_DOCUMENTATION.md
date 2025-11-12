# 🏨 호텔 예약 관리 시스템 - Frontend (Admin & Master)

> **담당자**: [작성자명]  
> **작업 범위**: 호텔 관리자(Admin) 및 사이트 운영자(Master) 프론트엔드 구현  
> **작업 기간**: 2024-10 ~ 2025-01  
> **개발 목표**: 직관적이고 효율적인 관리자 대시보드 및 운영 도구 구축

---

## 📁 주요 작업 파일

```
frontend/src/app/
├── admin/                          # 호텔 관리자 페이지
│   ├── page.js                     # 대시보드 (통계, 최근 예약)
│   ├── rooms/                      # 객실 현황 및 관리
│   │   └── page.js                 # 객실 상태 조회, 빠른 상태 변경
│   ├── revenue/                    # 매출 관리
│   │   └── page.js                 # 매출 통계, 월별 추이 차트
│   ├── reservations/               # 예약 관리
│   │   └── page.js                 # 예약 목록, 상세 조회
│   ├── checkin/                    # 체크인 처리
│   │   └── page.js                 # 체크인 대기 목록, 처리
│   ├── checkout/                   # 체크아웃 처리
│   ├── settings/                   # 호텔 설정
│   │   └── page.js                 # 호텔 정보 수정, 객실/다이닝 관리
│   └── customers/                  # 고객 관리
│
├── master/                         # 사이트 운영자 페이지
│   ├── page.js                     # 마스터 대시보드 (전체 통계)
│   ├── statistics/                 # 통계 분석
│   │   └── page.js                 # 매출/예약 통계, 지역별/등급별 분석
│   ├── hotel-approval/            # 호텔 승인 관리
│   │   └── page.js                 # 호텔 등록 요청 목록
│   ├── hotel-approval-detail/     # 호텔 승인 상세
│   │   └── [registrationIdx]/     # 탭 기반 지연 로딩
│   │       └── page.js
│   ├── hotels/                    # 호텔 목록 관리
│   ├── center/                     # 고객 지원 센터
│   │   ├── reports/               # 신고 관리
│   │   │   └── page.js            # 신고 목록, 상세 조회, 호텔 정보 하이라이트
│   │   ├── faq/                   # FAQ 관리
│   │   └── inquiries/            # 문의 관리
│   └── members/                   # 회원 관리
│
└── components/
    ├── admin/
    │   ├── AdminLayout.js         # 관리자 레이아웃 (사이드바, 헤더)
    │   └── ReservationDetailModal.js
    └── master/
        ├── MasterLayout.js        # 마스터 레이아웃
        └── reports/
            └── HotelInfoView.js  # 신고 상세 - 호텔 정보 뷰
```

---

## 🎯 주요 기능

### 1️⃣ Admin - 객실 현황 및 빠른 상태 관리

**목적**: 호텔 관리자가 일별 객실 현황을 한눈에 확인하고, 빠르게 상태를 변경할 수 있는 기능

**핵심 구현**:

```javascript
// frontend/src/app/admin/rooms/page.js

// URL 쿼리 파라미터로 날짜 선택
const searchParams = useSearchParams();
const selectedDate = searchParams.get('date') || new Date().toISOString().split('T')[0];

// 중복 요청 방지 (useRef 활용)
const didFetch = useRef(false);
const lastFetchedDateRef = useRef(null);

useEffect(() => {
  if (didFetch.current && lastFetchedDateRef.current === selectedDate) return;
  didFetch.current = true;
  lastFetchedDateRef.current = selectedDate;
  fetchRoomStatus();
}, [selectedDate]);

// 빠른 상태 변경 (카드에서 직접 토글)
const handleStatusToggle = async (room, newStatus) => {
  try {
    const response = await axiosInstance.post('/admin/roomStatus', {
      roomIdx: room.roomIdx,
      status: newStatus
    });
    
    if (response.data.success) {
      alert(`${room.name}의 상태가 변경되었습니다.`);
      fetchRoomStatus(); // 즉시 반영
    }
  } catch (error) {
    console.error('상태 변경 오류:', error);
    alert('상태 변경 중 오류가 발생했습니다.');
  }
};
```

**주요 특징**:

- ✅ **URL 쿼리 파라미터 활용**: `useSearchParams`로 날짜 선택 상태 관리
- ✅ **중복 요청 방지**: `useRef`로 동일 날짜 중복 API 호출 방지
- ✅ **즉시 반영**: 상태 변경 후 자동 새로고침으로 UI 동기화
- ✅ **실시간 예약 정보**: 객실별 예약자명, 인원수, 요청사항 표시
- ✅ **빠른 액션**: 카드에서 직접 토글 버튼으로 상태 변경

---

### 2️⃣ Admin - 매출 관리 및 동적 연도 제한

**목적**: 호텔의 매출 데이터가 존재하는 연도만 선택 가능하도록 제한하여 불필요한 API 호출 방지

**핵심 구현**:

```javascript
// frontend/src/app/admin/revenue/page.js

const [summary, setSummary] = useState({ 
  todayRevenue: 0, 
  todayPayments: 0, 
  monthlyRevenue: [], 
  minYear: null  // 서비스 시작 연도 (백엔드에서 전달)
});

const minYear = summary.minYear || 2000;
const currentYear = new Date().getFullYear();

// 연도 선택 시 해당 연도 데이터만 요청
const lastFetchedYear = useRef(null);

useEffect(() => {
  // 같은 연도를 중복 요청하지 않도록 체크
  if (lastFetchedYear.current === selectedYear) {
    return;
  }
  
  lastFetchedYear.current = selectedYear;
  fetchSummary(selectedYear);
}, [selectedYear]);

// 연도 입력 제한
<input
  type="number"
  min={minYear}        // 서비스 시작 연도
  max={currentYear}    // 현재 연도
  value={selectedYear}
  onChange={(e) => {
    const inputValue = parseInt(e.target.value || `${currentYear}`, 10);
    const year = Math.min(Math.max(inputValue, minYear), currentYear);
    setSelectedYear(year);
  }}
/>
```

**주요 특징**:

- ✅ **동적 연도 제한**: 백엔드에서 전달된 `minYear` 기반으로 선택 범위 제한
- ✅ **하이브리드 데이터 표시**: 서비스 시작 연도는 시작 월부터, 이후 연도는 1~12월 전체 표시
- ✅ **현재 연도 처리**: 현재 연도는 현재 월까지만 표시 (미래 월 숨김)
- ✅ **중복 요청 방지**: `useRef`로 동일 연도 중복 API 호출 방지
- ✅ **Recharts 차트**: 월별 매출 추이를 ComposedChart로 시각화

---

### 3️⃣ Master - 신고 관리 및 스마트 섹션 하이라이트

**목적**: 신고 내용을 분석하여 관련된 호텔 정보 섹션을 자동으로 하이라이트하고 포커스

**핵심 구현**:

```javascript
// frontend/src/constants/reportMapping.js

// 신고 카테고리 → 호텔 정보 섹션 매핑
export const CATEGORY_CODE_TO_SECTION = {
  [REPORT_CATEGORY_CODE.INACCURATE_INFO]: {
    default: HOTEL_INFO_SECTION.ROOMS,
    keywords: {
      '사진': HOTEL_INFO_SECTION.ROOM_IMAGES,
      '이름': HOTEL_INFO_SECTION.ROOM_NAMES,
      '가격': HOTEL_INFO_SECTION.ROOM_PRICES,
      '주소': HOTEL_INFO_SECTION.BASIC_INFO
    }
  },
  // ...
};

// 신고 내용에서 객실명 추출 (정규식 활용)
export const extractRoomNamesFromContent = (content, roomNames) => {
  const contentLower = content.toLowerCase();
  const matchedRooms = [];
  
  // 객실명 직접 매칭
  roomNames.forEach(roomName => {
    if (roomName && contentLower.includes(roomName.toLowerCase())) {
      matchedRooms.push(roomName);
    }
  });
  
  // 객실 번호 패턴 찾기 (예: "101호", "101번", "객실 101")
  const roomNumberPattern = /(\d+)\s*(호|번|룸|방|객실)/gi;
  const roomNumbers = content.match(roomNumberPattern);
  // ...
  
  return matchedRooms;
};

// frontend/src/app/master/center/reports/page.js

// 신고 상세 조회 시 호텔 정보와 포커스 정보 로드
const loadReportDetail = async (report) => {
  try {
    setHotelLoading(true);
    
    // 1. 호텔 정보 조회
    const hotelResponse = await hotelAPI.getHotelInfo(report.contentId);
    setHotelInfo(hotelResponse);
    
    // 2. 포커스 섹션 결정
    const roomNames = hotelResponse.rooms?.map(r => r.name) || [];
    const focusInfo = getFocusSection(report, roomNames);
    setFocusInfo(focusInfo);
    
    // 3. 자동 스크롤
    if (focusInfo.autoScroll && focusInfo.section) {
      setTimeout(() => {
        const element = document.getElementById(focusInfo.section);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 300);
    }
  } catch (error) {
    console.error('신고 상세 로드 실패:', error);
  } finally {
    setHotelLoading(false);
  }
};
```

**주요 특징**:

- ✅ **키워드 기반 섹션 매핑**: 신고 내용의 키워드를 분석하여 관련 섹션 자동 결정
- ✅ **객실명 추출**: 정규식을 활용한 패턴 매칭으로 객실명 자동 추출
- ✅ **자동 스크롤**: 관련 섹션으로 자동 스크롤하여 사용자 편의성 향상
- ✅ **시각적 하이라이트**: 관련 섹션을 배경색으로 강조 표시
- ✅ **카테고리별 전략**: 신고 카테고리별로 다른 섹션 매핑 전략 적용

---

### 4️⃣ Master - 호텔 승인 상세 (탭 기반 지연 로딩)

**목적**: 초기 로딩 속도 개선을 위해 기본 정보만 먼저 로드하고, 탭 클릭 시 해당 섹션 데이터 로드

**핵심 구현**:

```javascript
// frontend/src/app/master/hotel-approval-detail/[registrationIdx]/page.js

// 탭별 데이터 로드 상태 추적
const [loadedTabs, setLoadedTabs] = useState(new Set());
const [loadingTabs, setLoadingTabs] = useState(new Set());

// 초기 로드: 기본 정보만 (빠른 로딩)
useEffect(() => {
  const loadHotelBasicInfo = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/master/hotelApproval/${registrationIdx}`);
      
      if (response.data.success && response.data.data) {
        const hotelData = response.data.data;
        
        // 기본 정보만 설정 (images, rooms, dining은 빈 배열)
        setFormData(prev => ({
          ...prev,
          hotelInfo: { ...prev.hotelInfo, ...hotelData.hotelInfo },
          hotelDetail: hotelData.hotelDetail || prev.hotelDetail,
          area: hotelData.area || prev.area,
          rooms: [],      // 나중에 로드
          images: [],     // 나중에 로드
          events: [],     // 나중에 로드
          dining: []      // 나중에 로드
        }));
      }
    } catch (error) {
      console.error("호텔 정보 로드 실패:", error);
    } finally {
      setLoading(false);
    }
  };

  if (registrationIdx) {
    loadHotelBasicInfo();
  }
}, [registrationIdx]);

// 탭별 데이터 지연 로딩
const loadTabData = async (tabName) => {
  // 이미 로드된 탭이면 스킵
  if (loadedTabs.has(tabName)) {
    return;
  }

  try {
    setLoadingTabs(prev => new Set(prev).add(tabName));
    
    const response = await axiosInstance.get(
      `/master/hotelApproval/${registrationIdx}/tab/${tabName}`
    );
    
    if (response.data.success && response.data.data) {
      const tabData = response.data.data;
      
      setFormData(prev => ({
        ...prev,
        [tabName]: tabData[tabName] || prev[tabName]
      }));
      
      setLoadedTabs(prev => new Set(prev).add(tabName));
    }
  } catch (error) {
    console.error(`${tabName} 탭 데이터 로드 실패:`, error);
  } finally {
    setLoadingTabs(prev => {
      const next = new Set(prev);
      next.delete(tabName);
      return next;
    });
  }
};

// 탭 변경 시 데이터 로드
const handleTabChange = (tabName) => {
  setCurrentTab(tabName);
  
  // 탭별 데이터 로드 (이미지, 객실, 다이닝)
  if (['images', 'rooms', 'dining'].includes(tabName)) {
    loadTabData(tabName);
  }
};
```

**주요 특징**:

- ✅ **초기 로딩 최적화**: 기본 정보만 먼저 로드하여 화면 표시 속도 향상
- ✅ **탭 기반 지연 로딩**: 사용자가 탭을 클릭할 때만 해당 데이터 로드
- ✅ **중복 로드 방지**: `Set`으로 이미 로드된 탭 추적하여 중복 요청 방지
- ✅ **로딩 상태 관리**: 탭별 로딩 상태를 독립적으로 관리하여 UX 개선
- ✅ **컴포넌트 재사용**: `HotelRegistrationForm` 컴포넌트를 읽기 전용으로 재사용

---

### 5️⃣ Admin - 호텔 설정 (다이닝 운영시간 UI 개선)

**목적**: 사용자 입력 오류를 방지하기 위해 시간 선택을 드롭다운으로 제공

**핵심 구현**:

```javascript
// frontend/src/components/master/approve/HotelDining.js

// 시간 선택 드롭다운 생성 (30분 단위)
const generateTimeOptions = () => {
  const options = [];
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const timeString = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
      options.push(timeString);
    }
  }
  return options;
};

// 운영시간 파싱 (HH:mm 형식)
const parseOperatingHours = (operatingHours) => {
  if (!operatingHours || typeof operatingHours !== 'string') {
    return { openTime: '09:00', closeTime: '18:00' };
  }
  
  const parts = operatingHours.split('-');
  if (parts.length === 2) {
    return {
      openTime: parts[0].trim(),
      closeTime: parts[1].trim()
    };
  }
  
  return { openTime: '09:00', closeTime: '18:00' };
};

// 운영시간 저장 (백엔드 전송 형식)
const formatOperatingHours = (openTime, closeTime) => {
  return `${openTime}-${closeTime}`;
};

// UI
<div className="grid grid-cols-2 gap-4">
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      오픈 시간
    </label>
    <select
      value={openTime}
      onChange={(e) => {
        setOpenTime(e.target.value);
        const formatted = formatOperatingHours(e.target.value, closeTime);
        onChange({ ...dining, operatingHours: formatted });
      }}
      className="w-full border border-gray-300 rounded-md px-3 py-2"
    >
      {generateTimeOptions().map(time => (
        <option key={time} value={time}>{time}</option>
      ))}
    </select>
  </div>
  
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      마감 시간
    </label>
    <select
      value={closeTime}
      onChange={(e) => {
        setCloseTime(e.target.value);
        const formatted = formatOperatingHours(openTime, e.target.value);
        onChange({ ...dining, operatingHours: formatted });
      }}
      className="w-full border border-gray-300 rounded-md px-3 py-2"
    >
      {generateTimeOptions().map(time => (
        <option key={time} value={time}>{time}</option>
      ))}
    </select>
  </div>
</div>
```

**주요 특징**:

- ✅ **입력 오류 방지**: 드롭다운으로 유효한 시간만 선택 가능
- ✅ **30분 단위**: 실무에서 자주 사용하는 30분 단위 시간 선택
- ✅ **데이터 파싱**: 백엔드에서 받은 `operatingHours` 문자열을 `openTime`/`closeTime`으로 분리
- ✅ **데이터 포맷팅**: 프론트엔드에서 `openTime`/`closeTime`을 `operatingHours` 형식으로 변환하여 전송
- ✅ **비활성화 상태 표시**: `status = 1`인 다이닝도 표시하되 시각적으로 구분

---

### 6️⃣ Axios 인터셉터를 통한 통합 에러 처리

**목적**: 모든 API 요청에 대한 일관된 에러 처리 및 인증 토큰 관리

**핵심 구현**:

```javascript
// frontend/src/lib/axios.js

// 요청 인터셉터: 토큰 자동 추가
axiosInstance.interceptors.request.use(
  (config) => {
    const token = typeof window !== "undefined"
      ? localStorage.getItem("accessToken")
      : null;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 응답 인터셉터: 에러 처리
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      // 401 에러: 인증 실패 → 토큰 제거
      if (error.response.status === 401) {
        if (typeof window !== "undefined") {
          localStorage.removeItem("accessToken");
        }
      }

      // 403 에러: 권한 없음 (호텔 미등록 관리자)
      if (error.response.status === 403) {
        const data = error.response.data;
        if (data && data.redirect) {
          if (typeof window !== "undefined") {
            alert(data.message || "호텔이 등록되지 않은 관리자입니다.");
            window.location.href = '/';
          }
        }
      }

      // 500 에러: 서버 오류
      if (error.response.status === 500) {
        console.error("서버 오류가 발생했습니다.");
      }
    }

    return Promise.reject(error);
  }
);
```

**주요 특징**:

- ✅ **자동 토큰 관리**: 모든 요청에 토큰 자동 추가
- ✅ **통합 에러 처리**: 401, 403, 500 등 공통 에러 처리
- ✅ **서버/클라이언트 구분**: SSR 환경에서도 올바른 baseURL 사용
- ✅ **withCredentials**: 쿠키 기반 인증 지원
- ✅ **타임아웃 설정**: 10초 타임아웃으로 무한 대기 방지

---

## 🐛 트러블 슈팅

### 1️⃣ useSearchParams와 Suspense 문제

**오류 상황**:

```javascript
// ❌ 오류 발생
const searchParams = useSearchParams(); // Next.js 13+ App Router에서 Suspense 필요
```

**원인 분석**:

- Next.js 13+ App Router에서 `useSearchParams`는 동적 렌더링을 트리거
- `Suspense`로 감싸지 않으면 빌드/런타임 오류 발생 가능

**해결 과정**:

```javascript
// ✅ 해결: Suspense로 감싸기
'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

const RoomsInner = () => {
  const searchParams = useSearchParams();
  // ...
};

const RoomsPage = () => {
  return (
    <Suspense fallback={<div>로딩 중...</div>}>
      <RoomsInner />
    </Suspense>
  );
};

export default RoomsPage;
```

**교훈**:

- Next.js App Router의 동적 함수(`useSearchParams`, `useParams` 등)는 `Suspense`로 감싸야 함
- 클라이언트 컴포넌트(`'use client'`)에서도 필요할 수 있음

---

### 2️⃣ useEffect 중복 실행 문제

**오류 상황**:

```javascript
// ❌ 문제: Strict Mode에서 useEffect가 2번 실행됨
useEffect(() => {
  fetchData(); // 개발 환경에서 2번 호출됨
}, []);
```

**원인 분석**:

- React Strict Mode는 개발 환경에서 컴포넌트를 2번 렌더링하여 부작용 검증
- `useEffect`가 의도치 않게 2번 실행되어 중복 API 호출 발생

**해결 과정**:

```javascript
// ✅ 해결: useRef로 중복 실행 방지
const didFetch = useRef(false);
const lastFetchedDateRef = useRef(null);

useEffect(() => {
  // 같은 날짜를 중복 요청하지 않도록 체크
  if (didFetch.current && lastFetchedDateRef.current === selectedDate) {
    return;
  }
  
  didFetch.current = true;
  lastFetchedDateRef.current = selectedDate;
  fetchRoomStatus();
}, [selectedDate]);
```

**교훈**:

- `useRef`를 활용하여 중복 실행 방지
- 의존성 배열의 값이 변경될 때만 실행되도록 조건 추가
- 프로덕션 환경에서는 Strict Mode가 비활성화되지만, 개발 환경에서도 올바르게 동작하도록 구현

---

### 3️⃣ 다이닝 운영시간 파싱 오류

**오류 상황**:

- 백엔드에서 `operatingHours`를 `"09:00-18:00"` 형식으로 전송
- 프론트엔드에서 `openTime`, `closeTime`으로 분리하여 표시해야 함
- 저장 시 다시 `"09:00-18:00"` 형식으로 변환해야 함

**원인 분석**:

- 백엔드와 프론트엔드 간 데이터 형식 불일치
- 파싱 로직이 없어서 빈 값 또는 오류 발생

**해결 과정**:

```javascript
// ✅ 해결: 파싱 및 포맷팅 함수 구현
const parseOperatingHours = (operatingHours) => {
  if (!operatingHours || typeof operatingHours !== 'string') {
    return { openTime: '09:00', closeTime: '18:00' };
  }
  
  const parts = operatingHours.split('-');
  if (parts.length === 2) {
    return {
      openTime: parts[0].trim(),
      closeTime: parts[1].trim()
    };
  }
  
  return { openTime: '09:00', closeTime: '18:00' };
};

const formatOperatingHours = (openTime, closeTime) => {
  return `${openTime}-${closeTime}`;
};

// 사용
const { openTime, closeTime } = parseOperatingHours(dining.operatingHours);
// 저장 시
const formatted = formatOperatingHours(openTime, closeTime);
```

**교훈**:

- 백엔드와 프론트엔드 간 데이터 형식 명확히 정의
- 파싱/포맷팅 함수를 별도로 분리하여 재사용성 향상
- 기본값 설정으로 예외 상황 처리

---

### 4️⃣ fetch vs axiosInstance 혼용 문제

**오류 상황**:

- 일부 페이지에서 `fetch` 사용, 일부에서 `axiosInstance` 사용
- `fetch`는 401 에러 시 자동 리다이렉트가 없어서 일관성 부족

**원인 분석**:

- `axiosInstance`는 인터셉터로 통합 에러 처리가 되어 있음
- `fetch`는 수동으로 에러 처리를 해야 함

**해결 과정**:

```javascript
// ❌ 이전: fetch 사용
const response = await fetch('/api/master/reports');
const data = await response.json();

// ✅ 변경: axiosInstance 사용
const response = await axiosInstance.get('/master/reports');
const data = response.data;

// 장점:
// 1. 자동 토큰 추가 (요청 인터셉터)
// 2. 401/403 에러 자동 처리 (응답 인터셉터)
// 3. 타임아웃 설정
// 4. withCredentials 자동 설정
```

**교훈**:

- 프로젝트 전반에 걸쳐 일관된 HTTP 클라이언트 사용
- `axiosInstance`의 인터셉터를 활용하여 공통 로직 중앙화
- 에러 처리 일관성 확보

---

### 5️⃣ 탭 기반 지연 로딩 구현 시 상태 관리 복잡도

**오류 상황**:

- 탭별 데이터 로드 상태를 여러 `useState`로 관리하여 복잡도 증가
- 이미 로드된 탭을 다시 클릭하면 중복 요청 발생

**원인 분석**:

- 탭별 로드 상태를 개별적으로 관리하여 추적 어려움
- 로드 완료 여부를 확인하는 로직 누락

**해결 과정**:

```javascript
// ✅ 해결: Set을 활용한 로드 상태 관리
const [loadedTabs, setLoadedTabs] = useState(new Set());
const [loadingTabs, setLoadingTabs] = useState(new Set());

const loadTabData = async (tabName) => {
  // 이미 로드된 탭이면 스킵
  if (loadedTabs.has(tabName)) {
    return;
  }

  try {
    // 로딩 시작
    setLoadingTabs(prev => new Set(prev).add(tabName));
    
    const response = await axiosInstance.get(`/master/hotelApproval/${id}/tab/${tabName}`);
    
    if (response.data.success) {
      setFormData(prev => ({
        ...prev,
        [tabName]: response.data.data[tabName]
      }));
      
      // 로드 완료 표시
      setLoadedTabs(prev => new Set(prev).add(tabName));
    }
  } catch (error) {
    console.error(`${tabName} 탭 데이터 로드 실패:`, error);
  } finally {
    // 로딩 종료
    setLoadingTabs(prev => {
      const next = new Set(prev);
      next.delete(tabName);
      return next;
    });
  }
};
```

**교훈**:

- `Set`을 활용하여 중복 체크 및 상태 관리 간소화
- 로딩 상태와 로드 완료 상태를 분리하여 관리
- 불변성을 유지하면서 상태 업데이트 (`new Set(prev).add()`)

---

## 🚀 향후 개선 사항

### 단기 (1-2주)

1. **성능 최적화**
   - [ ] React.memo를 활용한 불필요한 리렌더링 방지
   - [ ] useMemo, useCallback으로 계산 비용 최적화
   - [ ] 이미지 lazy loading 적용

2. **에러 처리 강화**
   - [ ] 전역 에러 바운더리 구현
   - [ ] 사용자 친화적인 에러 메시지 표시
   - [ ] 네트워크 오류 시 재시도 로직

3. **접근성 개선**
   - [ ] 키보드 네비게이션 지원
   - [ ] ARIA 속성 추가
   - [ ] 스크린 리더 호환성 검증

---

### 중기 (1개월)

1. **상태 관리 개선**
   - [ ] Zustand 또는 Context API로 전역 상태 관리
   - [ ] 서버 상태는 React Query로 관리
   - [ ] 로컬 상태는 useState로 유지

2. **테스트 코드 작성**
   - [ ] 단위 테스트 (Jest + React Testing Library)
   - [ ] 통합 테스트 (주요 사용자 플로우)
   - [ ] E2E 테스트 (Playwright)

3. **타입 안정성**
   - [ ] TypeScript 마이그레이션
   - [ ] API 응답 타입 정의
   - [ ] Props 타입 명시

---

### 장기 (2개월+)

1. **모니터링 및 분석**
   - [ ] Sentry 에러 추적 연동
   - [ ] 사용자 행동 분석 (Google Analytics)
   - [ ] 성능 모니터링 (Web Vitals)

2. **PWA 지원**
   - [ ] Service Worker 구현
   - [ ] 오프라인 지원
   - [ ] 푸시 알림

3. **국제화 (i18n)**
   - [ ] 다국어 지원 (next-intl)
   - [ ] 날짜/시간 포맷 지역화
   - [ ] 통화 포맷 지역화

---

## 💼 개발자 포트폴리오 강점

### 1. 성능 최적화 및 사용자 경험 개선

**도전**: 초기 로딩 속도 개선 및 불필요한 API 호출 방지

**해결**:

- **탭 기반 지연 로딩**: 호텔 승인 상세 화면에서 기본 정보만 먼저 로드하고, 탭 클릭 시 해당 데이터만 로드
- **중복 요청 방지**: `useRef`를 활용하여 동일한 파라미터로 중복 API 호출 방지
- **동적 연도 제한**: 매출 데이터가 존재하는 연도만 선택 가능하도록 제한하여 불필요한 요청 방지
- **하이브리드 데이터 표시**: 서비스 시작 연도는 시작 월부터, 이후 연도는 전체 표시하여 사용자 혼란 방지

**역량**:

- ✅ 성능 최적화 사고
- ✅ 사용자 경험 개선
- ✅ 데이터 로딩 전략 수립

---

### 2. 복잡한 비즈니스 로직 구현

**도전**: 신고 내용을 분석하여 관련된 호텔 정보 섹션을 자동으로 하이라이트

**해결**:

- **키워드 기반 매핑**: 신고 카테고리와 키워드를 분석하여 관련 섹션 자동 결정
- **정규식 패턴 매칭**: 객실명 추출을 위한 정규식 활용 (`/(\d+)\s*(호|번|룸|방|객실)/gi`)
- **자동 스크롤**: 관련 섹션으로 자동 스크롤하여 사용자 편의성 향상
- **시각적 하이라이트**: 관련 섹션을 배경색으로 강조 표시

**역량**:

- ✅ 복잡한 비즈니스 로직 구현
- ✅ 텍스트 분석 및 패턴 매칭
- ✅ 사용자 인터페이스 개선

---

### 3. 실무적 문제 해결 능력

**트러블 슈팅 경험**:

- **useSearchParams Suspense 문제**: Next.js App Router의 동적 함수 처리
- **useEffect 중복 실행**: React Strict Mode 대응 및 useRef 활용
- **다이닝 운영시간 파싱**: 백엔드-프론트엔드 데이터 형식 불일치 해결
- **fetch vs axiosInstance**: 통합 에러 처리 및 일관성 확보
- **탭 기반 지연 로딩**: 상태 관리 복잡도 해결 (Set 활용)

**역량**:

- ✅ 근본 원인 파악 능력
- ✅ 체계적인 문제 해결 과정
- ✅ 문서화 습관

---

### 4. 컴포넌트 재사용성 및 모듈화

**도전**: 호텔 등록 폼을 관리자 설정 화면과 마스터 승인 화면에서 재사용

**해결**:

- **컴포넌트 재사용**: `HotelRegistrationForm`을 읽기 전용 모드로 재사용
- **Props 기반 제어**: `readOnly`, `loadingTabs` 등의 props로 동작 제어
- **상태 관리 분리**: 각 화면에서 독립적인 상태 관리

**역량**:

- ✅ 컴포넌트 설계 능력
- ✅ 재사용성 고려
- ✅ Props 인터페이스 설계

---

### 5. 통합 에러 처리 및 인증 관리

**도전**: 모든 API 요청에 대한 일관된 에러 처리 및 인증 토큰 관리

**해결**:

- **Axios 인터셉터**: 요청/응답 인터셉터로 공통 로직 중앙화
- **자동 토큰 관리**: 모든 요청에 토큰 자동 추가
- **통합 에러 처리**: 401, 403, 500 등 공통 에러 처리
- **서버/클라이언트 구분**: SSR 환경에서도 올바른 baseURL 사용

**역량**:

- ✅ HTTP 클라이언트 설계
- ✅ 에러 처리 전략 수립
- ✅ 인증/인가 로직 구현

---

## 📝 핵심 코드 예시

### Admin - 객실 현황 페이지

```javascript
// frontend/src/app/admin/rooms/page.js

'use client';

import { useEffect, useState, Suspense, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import AdminLayout from '@/components/admin/AdminLayout';
import { ToggleLeft, ToggleRight } from 'lucide-react';
import axiosInstance from '@/lib/axios';

const RoomsInner = () => {
  const roomList_url = "/admin/roomList";
  const searchParams = useSearchParams();
  const selectedDate = searchParams.get('date') || new Date().toISOString().split('T')[0];

  const [roomStatusList, setRoomStatusList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [availableRoomCount, setAvailableRoomCount] = useState(0);
  const [totalRoomCount, setTotalRoomCount] = useState(0);

  const didFetch = useRef(false);
  const lastFetchedDateRef = useRef(null);

  useEffect(() => {
    if (didFetch.current && lastFetchedDateRef.current === selectedDate) return;
    didFetch.current = true;
    lastFetchedDateRef.current = selectedDate;
    
    fetchRoomStatus();
  }, [selectedDate]);

  const fetchRoomStatus = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(roomList_url, {
        params: { date: selectedDate }
      });
      if (response.data.success) {
        setRoomStatusList(response.data.rooms || []);
        setAvailableRoomCount(response.data.availableRoomCount || 0);
        setTotalRoomCount(response.data.totalRoomCount || 0);
      }
    } catch (error) {
      console.error('객실 현황 조회 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusToggle = async (room, newStatus) => {
    try {
      const response = await axiosInstance.post('/admin/roomStatus', {
        roomIdx: room.roomIdx,
        status: newStatus
      });
      
      if (response.data.success) {
        alert(`${room.name}의 상태가 변경되었습니다.`);
        fetchRoomStatus();
      }
    } catch (error) {
      console.error('상태 변경 오류:', error);
      alert('상태 변경 중 오류가 발생했습니다.');
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6 p-6">
        {/* 객실 카드 목록 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {roomStatusList.map((room) => (
            <div key={room.roomIdx} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold text-gray-900">{room.name}</h3>
                <button
                  onClick={() => handleStatusToggle(room, room.status === 1 ? 0 : 1)}
                  className="flex items-center gap-1 text-xs font-medium transition-colors"
                >
                  {room.status === 1 ? (
                    <>
                      <ToggleRight className="w-4 h-4 text-green-600" />
                      <span className="text-green-600">사용 가능</span>
                    </>
                  ) : (
                    <>
                      <ToggleLeft className="w-4 h-4 text-red-600" />
                      <span className="text-red-600">사용 불가</span>
                    </>
                  )}
                </button>
              </div>
              {/* 예약 정보 표시 */}
              {room.reservation && (
                <div className="mt-2 text-sm text-gray-600">
                  <p>예약자: {room.reservation.customerName}</p>
                  <p>인원: {room.reservation.guest}명</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
};

const RoomsPage = () => {
  return (
    <Suspense fallback={<div>로딩 중...</div>}>
      <RoomsInner />
    </Suspense>
  );
};

export default RoomsPage;
```

---

### Master - 신고 관리 페이지 (스마트 섹션 하이라이트)

```javascript
// frontend/src/app/master/center/reports/page.js

'use client';

import { useState, useEffect } from 'react';
import MasterLayout from '@/components/master/MasterLayout';
import axiosInstance from '@/lib/axios';
import { hotelAPI } from '@/lib/api/hotel';
import { getFocusSection } from '@/constants/reportMapping';
import HotelInfoView from '@/components/master/reports/HotelInfoView';

export default function ReportListPage() {
  const [reports, setReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hotelInfo, setHotelInfo] = useState(null);
  const [focusInfo, setFocusInfo] = useState(null);

  const loadReportDetail = async (report) => {
    try {
      setHotelLoading(true);
      
      // 1. 호텔 정보 조회
      const hotelResponse = await hotelAPI.getHotelInfo(report.contentId);
      setHotelInfo(hotelResponse);
      
      // 2. 포커스 섹션 결정
      const roomNames = hotelResponse.rooms?.map(r => r.name) || [];
      const focusInfo = getFocusSection(report, roomNames);
      setFocusInfo(focusInfo);
      
      // 3. 자동 스크롤
      if (focusInfo.autoScroll && focusInfo.section) {
        setTimeout(() => {
          const element = document.getElementById(focusInfo.section);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 300);
      }
    } catch (error) {
      console.error('신고 상세 로드 실패:', error);
    } finally {
      setHotelLoading(false);
    }
  };

  const handleReportClick = (report) => {
    setSelectedReport(report);
    setIsModalOpen(true);
    loadReportDetail(report);
  };

  return (
    <MasterLayout>
      <div className="space-y-6">
        {/* 신고 목록 */}
        <div className="bg-white rounded-lg shadow-sm">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  신고 내용
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  카테고리
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  상태
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  액션
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {reports.map((report) => (
                <tr key={report.idx}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {report.content}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {report.category}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      report.status === 'completed' ? 'bg-green-100 text-green-800' :
                      report.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {report.status === 'completed' ? '처리 완료' :
                       report.status === 'in_progress' ? '처리중' : '대기'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleReportClick(report)}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      상세보기
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 신고 상세 모달 */}
        {isModalOpen && selectedReport && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold mb-4">신고 상세</h2>
              
              {/* 신고 정보 */}
              <div className="mb-6">
                <p className="text-gray-600 mb-2">신고 내용: {selectedReport.content}</p>
                <p className="text-gray-600 mb-2">카테고리: {selectedReport.category}</p>
              </div>

              {/* 호텔 정보 (하이라이트 적용) */}
              {hotelInfo && focusInfo && (
                <HotelInfoView
                  hotelInfo={hotelInfo}
                  focusInfo={focusInfo}
                />
              )}
              
              <button
                onClick={() => setIsModalOpen(false)}
                className="mt-4 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
              >
                닫기
              </button>
            </div>
          </div>
        )}
      </div>
    </MasterLayout>
  );
}
```

---

## 🔐 보안 고려사항

### 구현 완료

1. **인증 토큰 관리**: Axios 인터셉터로 자동 토큰 추가
2. **에러 처리**: 401/403 에러 시 자동 리다이렉트
3. **입력 검증**: 드롭다운으로 유효한 값만 입력 가능
4. **XSS 방지**: React의 기본 이스케이프 활용

### 향후 보완

- [ ] CSRF 토큰 검증
- [ ] Rate Limiting (프론트엔드)
- [ ] 입력값 sanitization 강화
- [ ] Content Security Policy (CSP) 설정

---

## 📊 성과 지표

### 구현 완료

- ✅ Admin 대시보드: 통계 카드, 최근 예약 목록, 빠른 액션 버튼
- ✅ 객실 관리: 일별 현황 조회, 빠른 상태 변경, 예약 정보 표시
- ✅ 매출 관리: 동적 연도 제한, 하이브리드 데이터 표시, 차트 시각화
- ✅ Master 대시보드: 전체 통계, 지역별/등급별 분석
- ✅ 신고 관리: 스마트 섹션 하이라이트, 자동 스크롤
- ✅ 호텔 승인: 탭 기반 지연 로딩, 초기 로딩 최적화

### 코드 품질

- **성능 최적화**: 중복 요청 방지, 지연 로딩, 메모이제이션
- **에러 핸들링**: 통합 에러 처리, 사용자 친화적 메시지
- **재사용성**: 컴포넌트 재사용, 유틸 함수 분리
- **가독성**: 명확한 변수명, 주석, 코드 구조화

---

## 📖 사용 기술 및 라이브러리

### Core

- **Next.js 14**: App Router, Server/Client Components
- **React 18**: Hooks (useState, useEffect, useRef, useCallback, useMemo)
- **JavaScript (ES6+)**: Async/Await, Destructuring, Template Literals

### UI/UX

- **TailwindCSS**: 유틸리티 기반 스타일링
- **Lucide React**: 아이콘 라이브러리
- **Recharts**: 차트 시각화 (ComposedChart, Bar, Line)

### HTTP & 상태 관리

- **Axios**: HTTP 클라이언트 (인터셉터 활용)
- **Zustand**: 전역 상태 관리 (일부 페이지)

### 기타

- **Next.js Navigation**: useRouter, useSearchParams, useParams
- **정규식 (RegExp)**: 패턴 매칭 (객실명 추출)
- **Date API**: 날짜 포맷팅, 연도/월 계산

---

## 📞 문의

- **담당자**: [작성자명]
- **영역**: 호텔 관리자(Admin) 및 사이트 운영자(Master) 프론트엔드
- **충돌 시**: PR/코멘트로 전달

---

_Last Updated: 2025-01-12_

