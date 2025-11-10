'use client';

import { useState, useEffect, Suspense } from 'react';
import { mypageAPI } from '@/lib/api/mypage';
import axiosInstance from '@/lib/axios';
import { userAPI } from '@/lib/api/user';
import { centerAPI } from '@/lib/api/center';
import { useCustomerStore } from '@/stores/customerStore';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProfileHeader from './components/ProfileHeader';
import ReservationSection from './components/reservation/ReservationSection';
import ReviewSection from './components/review/ReviewSection';
import EditReviewModal from './components/review/EditReviewModal';
import ConfirmCancelModal from './components/review/ConfirmCancelModal';
import FavoritesSection from './components/favorites/FavoritesSection';
import RecentHotelsSection from './components/recent/RecentHotelsSection';
import CouponSection from './components/coupon/CouponSection';
import InquirySection from './components/inquiry/InquirySection';
import Pagination from '@/components/Pagination';

const formatCouponDate = (isoString) => {
  if (!isoString) return '';
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return '';
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}.${month}.${day}`;
};

const categorizeCoupons = (couponList = []) => {
  const now = new Date();
  const baseConditionText = '예약 결제 시 적용 가능합니다.';

  const categorized = {
    available: [],
    used: [],
    expired: [],
  };

  couponList.forEach((coupon) => {
    const discountValue = Number(coupon.discount ?? 0);
    const formattedDiscount = Number.isNaN(discountValue)
      ? ''
      : `${discountValue.toLocaleString()}원`;
    const endDate = coupon.endDate ? new Date(coupon.endDate) : null;
    const displayCoupon = {
      id: coupon.couponIdx,
      name: coupon.templateName || '쿠폰',
      discount: formattedDiscount || '할인 정보 없음',
      discountAmount: Number.isNaN(discountValue) ? 0 : discountValue,
      condition: coupon.condition || baseConditionText,
      expiry: formatCouponDate(coupon.endDate) || '만료일 정보 없음',
      usedDate: coupon.usedDate ? formatCouponDate(coupon.usedDate) : '사용일 정보 없음',
      status: coupon.status,
    };

    if (coupon.status === 1) {
      categorized.used.push(displayCoupon);
      return;
    }

    if (endDate && endDate < now) {
      categorized.expired.push(displayCoupon);
      return;
    }

    categorized.available.push(displayCoupon);
  });

  return categorized;
};

// useSearchParams를 사용하는 컴포넌트 분리
function TabQueryHandler({ onTabChange }) {
  const searchParams = useSearchParams();
  
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'completed' || tab === 'upcoming' || tab === 'cancelled') {
      onTabChange(tab);
      // 이미 loadAllReservations에서 전체 데이터를 가져왔으므로 API 호출 불필요
      // 탭만 변경하고 페이지는 첫 페이지로 리셋
      // 예약 내역 섹션으로 스크롤
      setTimeout(() => {
        const reservationSection = document.getElementById('reservation-section');
        if (reservationSection) {
          reservationSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    }
  }, [onTabChange, searchParams]);
  
  return null;
}

function MyPageContent() {
  const router = useRouter();
  const pathname = usePathname();
  
  // Zustand에서 고객 정보 가져오기
  const { verifyTokenWithBackend, isRecentlyVerified } = useCustomerStore();
  
  // 탭 상태 관리
  const [reservationTab, setReservationTab] = useState('upcoming'); // upcoming, completed, cancelled
  const [reservationType, setReservationType] = useState('hotel'); // hotel 또는 dining
  const [couponTab, setCouponTab] = useState('available'); // available, used, expired
  const [reviewTab, setReviewTab] = useState('writable'); // writable, written

  // 로딩 상태
  const [isLoading, setIsLoading] = useState(true);
  const [reservationsLoading, setReservationsLoading] = useState(false);

  // 데이터 상태 (더미 데이터에서 상태로 변경)
  const [reservations, setReservations] = useState({
    upcoming: [],
    completed: [],
    cancelled: []
  });

  // 다이닝 예약 데이터 상태 (별도로 관리)
  const [diningReservations, setDiningReservations] = useState({
    upcoming: [],
    completed: [],
    cancelled: []
  });

  // 양도거래 등록 상태
  const [tradeStatus, setTradeStatus] = useState({});

  // 신고 상태 (contentId별)
  const [reportStatus, setReportStatus] = useState({});

  // 작성 가능한 리뷰 상태
  const [writableReviews, setWritableReviews] = useState([]);
  const [writableReviewsLoading, setWritableReviewsLoading] = useState(false);

  // 문의 내역 상태
  const [inquiries, setInquiries] = useState([]);
  const [inquiriesLoading, setInquiriesLoading] = useState(false);

  // 백엔드에서 가져온 사용자 정보 상태
  const [userData, setUserData] = useState(null);

  // 쿠폰 상태
  const [coupons, setCoupons] = useState({
    available: [],
    used: [],
    expired: [],
  });
  const [couponsLoading, setCouponsLoading] = useState(false);

  // 사용자 데이터를 API로 직접 가져오는 함수
  const fetchUserData = async () => {
    try {
      const response = await fetch('/api/customer/me', {
        credentials: 'include' // HttpOnly 쿠키 포함
      });
      
      if (response.ok) {
        const userData = await response.json();
        setUserData(userData);
        return userData;
      } else if (response.status === 401) {
        console.log('❌ 토큰 검증 실패 - 로그인 페이지로 이동');
        router.push('/login');
        return null;
      } else {
        console.error('❌ 서버 오류:', response.status);
        alert('서비스에 접근할 수 없습니다. 다시 시도해주세요.');
        router.push('/login');
        return null;
      }
    } catch (error) {
      console.error('❌ 사용자 데이터 가져오기 실패:', error);
      alert('서비스에 접근할 수 없습니다. 다시 시도해주세요.');
      router.push('/login');
      return null;
    }
  };

  useEffect(() => {
    const fetchCoupons = async () => {
      setCouponsLoading(true);
      try {
        const response = await userAPI.getMyCouponHistory();
        const rawCoupons = response?.data ?? [];
        setCoupons(categorizeCoupons(rawCoupons));
      } catch (error) {
        console.error('❌ 쿠폰 데이터 불러오기 실패:', error);
        setCoupons({
          available: [],
          used: [],
          expired: [],
        });
      } finally {
        setCouponsLoading(false);
      }
    };

    fetchCoupons();
  }, []);

  // URL 쿼리 파라미터에서 탭 설정 읽기 (TabQueryHandler 컴포넌트로 분리됨)

  // userData가 설정되면 문의 내역 로드
  useEffect(() => {
    if (userData?.customerIdx) {
      loadInquiries();
    }
  }, [userData?.customerIdx]);

  // 실제 토큰 검증 및 초기 데이터 로드
  // 경로 변경 시 리뷰 목록 갱신 (리뷰 작성 후 마이페이지로 돌아왔을 때)
  useEffect(() => {
    if (pathname === '/mypage') {
      loadWrittenReviews();
    }
  }, [pathname]);

  useEffect(() => {
    const verifyTokenAndLoadData = async () => {
      // 최근 검증된 경우 중복 검증 건너뛰기
      if (isRecentlyVerified()) {
        console.log('✅ 최근 검증됨 - 중복 검증 건너뛰기');
        // 사용자 데이터는 API로 직접 가져오기
        const userDataResult = await fetchUserData();
        loadAllReservations();
        loadAllDiningReservations(); // 다이닝 예약도 로드
        loadWritableReviews();
        loadWrittenReviews();
        // loadInquiries는 userData 변경 시 useEffect에서 자동 호출됨
        // loadAllReservations에서 이미 전체 데이터를 가져왔으므로 추가 API 호출 불필요
        return;
      }
      
      // 최근 검증되지 않은 경우 토큰 검증 수행
      console.log('🔍 토큰 검증 수행');
      const result = await verifyTokenWithBackend();
      
      if (result.success) {
        console.log('👤 토큰 검증 성공, 사용자 정보:', result.userData);
        
        // 사용자 데이터 상태에 저장
        setUserData(result.userData);
        
        // 페이지 로드 시 모든 탭의 데이터를 불러와서 카운트를 정확히 표시
        loadAllReservations();
        loadAllDiningReservations(); // 다이닝 예약도 로드
        loadWritableReviews();
        loadWrittenReviews();
        // loadInquiries는 userData 변경 시 useEffect에서 자동 호출됨
        // loadAllReservations에서 이미 전체 데이터를 가져왔으므로 추가 API 호출 불필요
      } else {
        // 토큰 검증 실패 - 로그인 페이지로 리다이렉트
        console.log('❌ 토큰 검증 실패 - 로그인 페이지로 이동');
        router.push('/login');
        return;
      }
    };

    verifyTokenAndLoadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 모든 예약 상태 데이터 불러오기 (초기 로드용) - 전체 데이터 가져오기
  const loadAllReservations = async () => {
    setIsLoading(true);
    try {
      console.log('🔄 예약 내역 로드 시작...');
      
      // 각 상태별로 전체 데이터를 가져오는 헬퍼 함수
      const loadAllByStatus = async (status) => {
        let allReservations = [];
        let currentPage = 0;
        let hasMore = true;
        const pageSize = 50; // 한 번에 많이 가져오기
        let totalElements = 0;
        
        while (hasMore) {
          const response = await mypageAPI.getReservations(status, currentPage, pageSize);
          const reservations = response?.reservations || response?.content || [];
          allReservations = [...allReservations, ...reservations];
          
          // 페이지네이션 정보 확인
          if (response?.totalPages !== undefined) {
            // 백엔드가 Page 객체를 반환하는 경우
            totalElements = response.totalElements || 0;
            hasMore = currentPage < response.totalPages - 1;
            currentPage++;
          } else {
            // 백엔드가 전체 리스트를 반환하는 경우
            totalElements = allReservations.length;
            hasMore = reservations.length === pageSize;
            currentPage++;
          }
        }
        
        return {
          reservations: allReservations,
          totalElements: totalElements || allReservations.length
        };
      };
      
      // 세 가지 상태를 병렬로 불러오기 (각각 전체 데이터)
      const [upcomingData, completedData, cancelledData] = await Promise.all([
        loadAllByStatus('upcoming'),
        loadAllByStatus('completed'),
        loadAllByStatus('cancelled')
      ]);

      console.log('📥 API 응답 데이터:', {
        upcoming: upcomingData,
        completed: completedData,
        cancelled: cancelledData
      });

      setReservations({
        upcoming: upcomingData?.reservations || [],
        completed: completedData?.reservations || [],
        cancelled: cancelledData?.reservations || []
      });

      // 각 탭별 전체 개수 업데이트 (초기 로드 시)
      setReservationCounts({
        upcoming: upcomingData?.totalElements || 0,
        completed: completedData?.totalElements || 0,
        cancelled: cancelledData?.totalElements || 0
      });

      console.log('✅ 전체 예약 데이터 로드 완료:', {
        upcoming: upcomingData?.reservations?.length || 0,
        completed: completedData?.reservations?.length || 0,
        cancelled: cancelledData?.reservations?.length || 0
      });

  // 예약별 양도거래 등록 여부 확인
       await checkTradeStatus(upcomingData?.reservations || []);

       // 이용완료 예약의 신고 상태 확인
       await checkReportStatus(completedData?.reservations || []);

     } catch (error) {
      console.error('❌ 예약 내역 로드 실패:', error);
      
      if (error.response?.status === 401) {
        console.log('🔒 인증 실패 - 로그인 페이지로 이동');
        router.push('/login');
        return;
      }
      
      if (error.message === 'Network Error') {
        console.warn('⚠️ 백엔드 서버에 연결할 수 없습니다.');
        alert('서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.');
      } else {
        alert('예약 내역을 불러오는데 실패했습니다.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // 다이닝 예약 내역 전체 로드 (기존 loadAllReservations와 유사한 구조)
  const loadAllDiningReservations = async () => {
    setIsLoading(true);
    try {
      console.log('🔄 다이닝 예약 내역 로드 시작...');
      
      // 각 상태별로 전체 데이터를 가져오는 헬퍼 함수
      const loadAllByStatus = async (status) => {
        let allReservations = [];
        let currentPage = 0;
        let hasMore = true;
        const pageSize = 50;
        let totalElements = 0;
        
        while (hasMore) {
          const response = await mypageAPI.getReservations(status, currentPage, pageSize, 'dining');
          const reservations = response?.reservations || response?.content || [];
          allReservations = [...allReservations, ...reservations];
          
          if (response?.totalPages !== undefined) {
            totalElements = response.totalElements || 0;
            hasMore = currentPage < response.totalPages - 1;
            currentPage++;
          } else {
            totalElements = allReservations.length;
            hasMore = reservations.length === pageSize;
            currentPage++;
          }
        }
        
        return {
          reservations: allReservations,
          totalElements: totalElements || allReservations.length
        };
      };
      
      // 세 가지 상태를 병렬로 불러오기
      const [upcomingData, completedData, cancelledData] = await Promise.all([
        loadAllByStatus('upcoming'),
        loadAllByStatus('completed'),
        loadAllByStatus('cancelled')
      ]);

      console.log('📥 다이닝 예약 API 응답 데이터:', {
        upcoming: upcomingData,
        completed: completedData,
        cancelled: cancelledData
      });

      setDiningReservations({
        upcoming: upcomingData?.reservations || [],
        completed: completedData?.reservations || [],
        cancelled: cancelledData?.reservations || []
      });

      console.log('✅ 전체 다이닝 예약 데이터 로드 완료:', {
        upcoming: upcomingData?.reservations?.length || 0,
        completed: completedData?.reservations?.length || 0,
        cancelled: cancelledData?.reservations?.length || 0
      });

    } catch (error) {
      console.error('❌ 다이닝 예약 내역 로드 실패:', error);
      
      if (error.response?.status === 401) {
        console.log('🔒 인증 실패 - 로그인 페이지로 이동');
        router.push('/login');
        return;
      }
      
      if (error.message === 'Network Error') {
        console.warn('⚠️ 백엔드 서버에 연결할 수 없습니다.');
        alert('서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.');
      } else {
        alert('다이닝 예약 내역을 불러오는데 실패했습니다.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // 예약 내역 API 호출 (페이지네이션 지원)
  const loadReservations = async (status, page = 0, size = 3) => {
    setReservationsLoading(true);
    try {
      console.log('📤 예약 내역 요청:', status, `page=${page}, size=${size}`);
      
      // 백엔드 API 호출 (페이지네이션 파라미터 추가)
      const response = await mypageAPI.getReservations(status, page, size);
      
      console.log('📥 받은 데이터:', response);
      
      // 백엔드가 페이지네이션을 지원하지 않을 경우를 대비한 처리
      let allReservations = response?.reservations || response?.content || [];
      const totalItems = response?.totalElements || allReservations.length;
      
      // 페이지네이션 정보 업데이트
      if (response?.totalPages !== undefined) {
        // 백엔드가 Page 객체를 반환하는 경우
        setTotalPages(response.totalPages);
        setTotalElements(response.totalElements || 0);
        setCurrentPage(response.number !== undefined ? response.number : page);
        setPageSize(response.size !== undefined ? response.size : size);
        
        // 각 탭별 전체 개수 업데이트 (페이지네이션과 무관한 전체 개수)
        setReservationCounts(prev => ({
          ...prev,
          [status]: response.totalElements || 0
        }));
      } else {
        // 백엔드가 전체 리스트를 반환하는 경우 - 프론트엔드에서 슬라이싱
        const totalPagesCount = Math.ceil(totalItems / size);
        const startIndex = page * size;
        const endIndex = startIndex + size;
        const paginatedReservations = allReservations.slice(startIndex, endIndex);
        
        setTotalPages(totalPagesCount);
        setTotalElements(totalItems);
        setCurrentPage(page);
        setPageSize(size);
        
        // 각 탭별 전체 개수 업데이트
        setReservationCounts(prev => ({
          ...prev,
          [status]: totalItems
        }));
        
        // 슬라이싱된 데이터만 저장
        allReservations = paginatedReservations;
        
        console.log(`📄 프론트엔드 페이지네이션 적용: 전체 ${totalItems}개 중 ${startIndex + 1}-${Math.min(endIndex, totalItems)}개 표시`);
      }
      
      // 상태 업데이트
      setReservations(prev => ({
        ...prev,
        [status]: allReservations
      }));
      
      console.log(`✅ ${status} 예약 내역 로드 완료:`, allReservations.length, '건');
      
    } catch (error) {
      console.error('❌ 예약 내역 로드 실패:', error);
      
      if (error.response?.status === 401) {
        console.log('🔒 인증 실패 - 로그인 페이지로 이동');
        router.push('/login');
        return;
      }
      
      if (error.message === 'Network Error') {
        console.warn('⚠️ 백엔드 서버에 연결할 수 없습니다.');
        alert('서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.');
      } else {
        alert('예약 내역을 불러오는데 실패했습니다.');
      }
    } finally {
      setReservationsLoading(false);
    }
  };

  // 페이지 변경 핸들러 (프론트엔드 페이지네이션)
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    // 이미 loadAllReservations에서 전체 데이터를 가져왔으므로 API 호출 불필요
    // 프론트엔드에서 슬라이싱만 처리
  };

  // 예약 관련 핸들러
  const handleReservationDetail = (reservationId, type = 'hotel') => {
    if (type === 'dining') {
      router.push(`/mypage/dining-reservation/${reservationId}`);
    } else {
      router.push(`/mypage/reservation/${reservationId}`);
    }
  };

  const handleHotelLocation = (reservation) => {
    // 호텔 상세 페이지로 이동 (호텔 위치 정보 포함)
    router.push(`/hotel/${reservation.id}?tab=location`);
  };

  const handleCancelReservation = (reservation) => {
    const name = reservationType === 'dining' 
      ? (reservation.diningName || reservation.hotelName)
      : reservation.hotelName;
    
    if (confirm(`${name} 예약을 취소하시겠습니까?`)) {
      if (reservationType === 'dining') {
        router.push(`/mypage/dining-reservation/${reservation.id}/cancel`);
      } else {
        router.push(`/mypage/reservation/${reservation.id}/cancel`);
      }
    }
  };

  const handleWriteReview = (reservation) => {
    router.push(`/mypage/review/write?reservationId=${reservation.id}`);
  };

  const handleReport = (reservation) => {
    if (reservation.contentId) {
      router.push(`/mypage/report/${reservation.contentId}`);
    } else {
      alert('호텔 정보를 찾을 수 없습니다.');
    }
  };

  const handleRebook = (reservation) => {
    // 호텔 상세 페이지로 이동 (재예약)
    router.push(`/hotel/${reservation.contentId}`);
  };

  // 작성 가능한 리뷰 불러오기
  const loadWritableReviews = async () => {
    setWritableReviewsLoading(true);
    try {
      const response = await mypageAPI.getWritableReviews();
      setWritableReviews(response.reviews || []);
    } catch (error) {
      console.error('작성 가능한 리뷰 로드 실패:', error);
    } finally {
      setWritableReviewsLoading(false);
    }
  };

  // 작성한 리뷰 불러오기
  const loadWrittenReviews = async () => {
    setWrittenReviewsLoading(true);
    try {
      const response = await mypageAPI.getMyReviews();
      const reviews = response.reviews || [];
      setWrittenReviews(reviews);
      
      // 리뷰 작성 완료된 예약 ID Set 업데이트
      const reviewedIds = new Set(reviews.map(review => review.reservationIdx));
      setReviewedReservationIds(reviewedIds);
    } catch (error) {
      console.error('작성한 리뷰 로드 실패:', error);
    } finally {
      setWrittenReviewsLoading(false);
    }
  };

  // 문의 내역 불러오기 (내가 작성한 문의/신고만)
  const loadInquiries = async () => {
    if (!userData?.customerIdx) {
      return;
    }

    setInquiriesLoading(true);
    try {
      // 문의와 신고를 모두 가져오기
      const [inquiriesResponse, reportsResponse] = await Promise.all([
        // 문의 조회 (사이트문의 + 객실문의)
        centerAPI.getInquiries({
          mainCategory: '문의',
          customerIdx: userData.customerIdx,
          page: 0,
          size: 1000,
        }),
        // 신고 조회
        centerAPI.getInquiries({
          mainCategory: '신고',
          customerIdx: userData.customerIdx,
          page: 0,
          size: 1000,
        }),
      ]);

      // 두 결과를 합치기
      const allInquiries = [
        ...(inquiriesResponse?.content || []),
        ...(reportsResponse?.content || []),
      ];

      setInquiries(allInquiries);
    } catch (error) {
      console.error('문의 내역 로드 실패:', error);
      setInquiries([]);
    } finally {
      setInquiriesLoading(false);
    }
  };

  const handleRegisterTrade = (reservation) => {
    // 양도거래 등록 페이지로 이동 (예약 정보 전달)
    router.push(`/used/register?reservIdx=${reservation.reservIdx || reservation.id}`);
  };

  const handleEditTrade = (reservation) => {
    // 양도거래 수정 페이지로 이동
    const reservIdx = reservation.reservIdx || reservation.id;
    router.push(`/used/register?reservIdx=${reservIdx}&edit=true`);
  };

  // 양도거래 등록 여부 확인
  const checkTradeStatus = async (reservations) => {
    const { usedAPI } = await import('@/lib/api/used');
    const statusMap = {};

    for (const reservation of reservations) {
      const reservIdx = reservation.reservIdx || reservation.id;
      try {
        const data = await usedAPI.checkRegistered(reservIdx);
        statusMap[reservIdx] = {
          registered: data.registered,
          status: data.status // status 정보도 저장
        };
      } catch (error) {
        console.error(`양도거래 상태 확인 실패 (reservIdx: ${reservIdx}):`, error);
      }
    }

    setTradeStatus(statusMap);
  };

  // 특정 예약의 양도거래 등록 여부 확인
  const isTradeRegistered = (reservation) => {
    const reservIdx = reservation.reservIdx || reservation.id;
    const status = tradeStatus[reservIdx];
    return status?.registered || false;
  };

  // 특정 예약의 양도거래 완료 여부 확인 (status가 2이면 완료)
  const isTradeCompleted = (reservation) => {
    const reservIdx = reservation.reservIdx || reservation.id;
    const status = tradeStatus[reservIdx];
    return status?.status === 2; // status 2 = 거래완료
  };

  // 신고 상태 확인
  const checkReportStatus = async (reservations) => {
    const { centerAPI } = await import('@/lib/api/center');
    const statusMap = {};

    for (const reservation of reservations) {
      const contentId = reservation.contentId;
      if (contentId) {
        try {
          const data = await centerAPI.checkReportExists(contentId);
          statusMap[contentId] = data.exists;
        } catch (error) {
          console.error(`신고 상태 확인 실패 (contentId: ${contentId}):`, error);
          statusMap[contentId] = false; // 확인 실패 시 신고 안한 것으로 간주
        }
      }
    }

    setReportStatus(statusMap);
  };

  // 특정 예약의 신고 여부 확인
  const isReported = (reservation) => {
    const contentId = reservation.contentId;
    if (!contentId) return false;
    return reportStatus[contentId] || false;
  };

  // 작성한 리뷰 상태
  const [writtenReviews, setWrittenReviews] = useState([]);
  const [writtenReviewsLoading, setWrittenReviewsLoading] = useState(false);

  // Pagination 상태 추가 (컴포넌트 내부로 이동)
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [pageSize, setPageSize] = useState(3); // 한 페이지에 3개씩 표시
  
  // 각 탭별 예약 개수 (전체 개수, 페이지네이션과 무관)
  const [reservationCounts, setReservationCounts] = useState({
    upcoming: 0,
    completed: 0,
    cancelled: 0
  });

  // 정렬 상태 (각 탭별로 관리)
  const [sortBy, setSortBy] = useState({
    upcoming: 'checkinAsc',    // 이용 예정: 체크인 날짜 가까운 순
    completed: 'checkoutDesc', // 이용 완료: 최근 방문 순
    cancelled: 'checkinDesc'  // 취소/환불: 체크인 날짜 최신순
  });

  // 리뷰 작성 완료된 예약 ID Set (빠른 조회를 위해)
  const [reviewedReservationIds, setReviewedReservationIds] = useState(new Set());
  // 내 리뷰 섹션 열림 여부 (닫힌 상태는 캡처처럼 제목+꺾쇠만 표시)
  const [isReviewOpen, setIsReviewOpen] = useState(false);

  // 리뷰 수정 모달 상태
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingReview, setEditingReview] = useState(null);
  const [editContent, setEditContent] = useState('');
  const [isConfirmCancelOpen, setIsConfirmCancelOpen] = useState(false);
  
  // 모달 refs


  const openEditModal = (review) => {
    setEditingReview(review);
    setEditContent(review.content || '');
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setEditingReview(null);
    setEditContent('');
  };

  const handleSaveEditedReview = () => {
    if (!editContent.trim() || editContent.trim().length < 10) {
      alert('리뷰는 최소 10자 이상 입력해주세요.');
      return;
    }
    if (editContent.length > 300) {
      alert('리뷰는 최대 300자까지 작성할 수 있습니다.');
      return;
    }

    // 로컬 상태 업데이트 (UI 전용)
    setWrittenReviews(prev => prev.map(r => {
      if (r.reviewIdx === editingReview.reviewIdx) {
        return {
          ...r,
          content: editContent,
          isEdited: true,
          updatedAt: new Date().toISOString()
        };
      }
      return r;
    }));

    closeEditModal();
  };


  // 특정 예약에 대해 리뷰가 작성되었는지 확인
  const isReviewWritten = (reservation) => {
    const reservIdx = reservation.reservIdx || reservation.id;
    return reviewedReservationIds.has(reservIdx);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* URL 쿼리 파라미터 처리 (Suspense로 감싸짐) */}
      <Suspense fallback={
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="flex items-center justify-center py-4">
            <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>
      }>
        <TabQueryHandler onTabChange={setReservationTab} />
      </Suspense>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <ProfileHeader
          userData={userData}
          onEditProfile={() => router.push('/mypage/edit')}
        />

        <ReservationSection
          reservationTab={reservationTab}
          setReservationTab={setReservationTab}
          reservationType={reservationType}
          setReservationType={setReservationType}
          reservationCounts={reservationCounts}
          reservations={reservations}
          diningReservations={diningReservations}
          sortBy={sortBy}
          setSortBy={setSortBy}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          pageSize={pageSize}
          totalPages={totalPages}
          totalElements={totalElements}
          setTotalPages={setTotalPages}
          setTotalElements={setTotalElements}
          reservationsLoading={reservationsLoading}
          handlePageChange={handlePageChange}
          isReviewWritten={isReviewWritten}
          isTradeRegistered={isTradeRegistered}
          isTradeCompleted={isTradeCompleted}
          isReported={isReported}
          handleReservationDetail={handleReservationDetail}
          handleHotelLocation={handleHotelLocation}
          handleCancelReservation={handleCancelReservation}
          handleWriteReview={handleWriteReview}
          handleRebook={handleRebook}
          handleReport={handleReport}
          handleRegisterTrade={handleRegisterTrade}
          handleEditTrade={handleEditTrade}
        />

        <ReviewSection
          isReviewOpen={isReviewOpen}
          setIsReviewOpen={setIsReviewOpen}
          reviewTab={reviewTab}
          setReviewTab={setReviewTab}
          writableReviews={writableReviews}
          writableReviewsLoading={writableReviewsLoading}
          writtenReviews={writtenReviews}
          writtenReviewsLoading={writtenReviewsLoading}
          onWriteReview={handleWriteReview}
          onOpenEditModal={openEditModal}
          onNavigateToReviews={() => router.push('/mypage/reviews')}
        />

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <FavoritesSection likedHotels={[]} />
          <RecentHotelsSection recentHotels={[]} />
        </div>

        <CouponSection
          couponTab={couponTab}
          setCouponTab={setCouponTab}
          coupons={coupons}
          isLoading={couponsLoading}
        />

        <InquirySection
          inquiries={inquiries}
          onCreateInquiry={() => router.push('/center/inquiry')}
          loading={inquiriesLoading}
        />
      </div>

      <Footer />

      <EditReviewModal
        isOpen={isEditModalOpen}
        editingReview={editingReview}
        editContent={editContent}
        onChangeContent={setEditContent}
        onClose={closeEditModal}
        onSave={handleSaveEditedReview}
        onRequestCancel={() => setIsConfirmCancelOpen(true)}
      />

      <ConfirmCancelModal
        isOpen={isConfirmCancelOpen}
        onClose={() => setIsConfirmCancelOpen(false)}
        onConfirm={() => {
          setIsConfirmCancelOpen(false);
          closeEditModal();
        }}
      />
    </div>
  );
}

// 메인 컴포넌트 - Suspense로 감싸서 export
export default function MyPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <MyPageContent />
    </Suspense>
  );
}
