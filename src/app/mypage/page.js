'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { mypageAPI } from '@/lib/api/mypage';
import { useCustomerStore } from '@/stores/customerStore';

import { 
  Calendar, Heart, MapPin, Gift, User,
  MessageSquare, ChevronRight, Star, Clock,
  Edit, Trash2, Share2, Hotel, X
} from 'lucide-react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Pagination from '@/components/Pagination';

// useSearchParams를 사용하는 컴포넌트 분리
function TabQueryHandler({ onTabChange, loadReservations }) {
  const searchParams = useSearchParams();
  
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'completed' || tab === 'upcoming' || tab === 'cancelled') {
      onTabChange(tab);
      loadReservations(tab, 0, 3); // 페이지네이션 파라미터 추가 (한 페이지에 3개)
      // 예약 내역 섹션으로 스크롤
      setTimeout(() => {
        const reservationSection = document.getElementById('reservation-section');
        if (reservationSection) {
          reservationSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);
  
  return null;
}

function MyPageContent() {
  const router = useRouter();
  const pathname = usePathname();
  
  // Zustand에서 고객 정보 가져오기
  const { verifyTokenWithBackend, isRecentlyVerified } = useCustomerStore();
  
  // 탭 상태 관리
  const [reservationTab, setReservationTab] = useState('upcoming'); // upcoming, completed, cancelled
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

  // 양도거래 등록 상태
  const [tradeStatus, setTradeStatus] = useState({});

  // 작성 가능한 리뷰 상태
  const [writableReviews, setWritableReviews] = useState([]);
  const [writableReviewsLoading, setWritableReviewsLoading] = useState(false);

  // 백엔드에서 가져온 사용자 정보 상태
  const [userData, setUserData] = useState(null);

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

  // URL 쿼리 파라미터에서 탭 설정 읽기 (TabQueryHandler 컴포넌트로 분리됨)

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
        await fetchUserData();
        loadAllReservations();
        loadWritableReviews();
        loadWrittenReviews();
        // 초기 예약 내역 로드 (페이지네이션 적용)
        loadReservations('upcoming', 0, pageSize);
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
        loadWritableReviews();
        loadWrittenReviews();
        // 초기 예약 내역 로드 (페이지네이션 적용)
        loadReservations('upcoming', 0, pageSize);
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

  // 모든 예약 상태 데이터 불러오기 (초기 로드용)
  const loadAllReservations = async () => {
    setIsLoading(true);
    try {
      console.log('🔄 예약 내역 로드 시작...');
      
      // 세 가지 상태를 병렬로 불러오기
      const [upcomingData, completedData, cancelledData] = await Promise.all([
        mypageAPI.getReservations('upcoming'),
        mypageAPI.getReservations('completed'),
        mypageAPI.getReservations('cancelled')
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
        upcoming: upcomingData?.totalElements || upcomingData?.reservations?.length || 0,
        completed: completedData?.totalElements || completedData?.reservations?.length || 0,
        cancelled: cancelledData?.totalElements || cancelledData?.reservations?.length || 0
      });

      console.log('✅ 전체 예약 데이터 로드 완료:', {
        upcoming: upcomingData?.reservations?.length || 0,
        completed: completedData?.reservations?.length || 0,
        cancelled: cancelledData?.reservations?.length || 0
      });

      // 예약별 양도거래 등록 여부 확인
      await checkTradeStatus(upcomingData?.reservations || []);

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

  // 페이지 변경 핸들러
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    loadReservations(reservationTab, newPage, pageSize);
  };

  // 더미 데이터 로드 (백엔드 미연결 시)
  const loadDummyData = (status) => {
    const dummyReservations = {
      upcoming: [
        {
          id: 1,
          hotelName: '그랜드 하얏트 서울',
          location: '서울 강남구',
          checkIn: '2025.10.20',
          checkOut: '2025.10.22',
          roomType: '디럭스 트윈',
          price: 450000,
          status: '예약확정'
        },
        {
          id: 2,
          hotelName: '신라호텔 제주',
          location: '제주 제주시',
          checkIn: '2025.11.05',
          checkOut: '2025.11.07',
          roomType: '오션뷰 킹',
          price: 380000,
          status: '예약확정'
        }
      ],
      completed: [
        {
          id: 3,
          hotelName: '롯데호텔 부산',
          location: '부산 해운대구',
          checkIn: '2025.09.15',
          checkOut: '2025.09.17',
          roomType: '스탠다드 더블',
          price: 280000,
          status: '이용완료'
        }
      ],
      cancelled: [
        {
          id: 4,
          hotelName: '파크 하얏트 서울',
          location: '서울 용산구',
          checkIn: '2025.10.01',
          checkOut: '2025.10.03',
          roomType: '디럭스 킹',
          price: 420000,
          status: '취소완료',
          refundAmount: 378000
        }
      ]
    };

    setReservations(prev => ({
      ...prev,
      [status]: dummyReservations[status] || []
    }));
  };

  // 예약 관련 핸들러
  const handleReservationDetail = (reservationId) => {
    router.push(`/mypage/reservation/${reservationId}`);
  };

  const handleHotelLocation = (reservation) => {
    // 호텔 상세 페이지로 이동 (호텔 위치 정보 포함)
    router.push(`/hotel/${reservation.id}?tab=location`);
  };

  const handleCancelReservation = (reservation) => {
    if (confirm(`${reservation.hotelName} 예약을 취소하시겠습니까?`)) {
      // 예약 취소 페이지로 이동
      router.push(`/mypage/reservation/${reservation.id}/cancel`);
    }
  };

  const handleWriteReview = (reservation) => {
    router.push(`/mypage/review/write?reservationId=${reservation.id}`);
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
  const editContentRef = useRef(null);
  const editModalRef = useRef(null);
  const confirmModalRef = useRef(null);
  const confirmPrimaryRef = useRef(null);


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

  // 모달 열릴 때 textarea 자동 포커스
  useEffect(() => {
    if (isEditModalOpen && editContentRef.current) {
      editContentRef.current.focus();
    }
  }, [isEditModalOpen]);

  // Esc 키로 모달 닫기 (확인 모달 우선)
  useEffect(() => {
    if (!isEditModalOpen && !isConfirmCancelOpen) return;
    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        if (isConfirmCancelOpen) {
          setIsConfirmCancelOpen(false);
        } else if (isEditModalOpen) {
          closeEditModal();
        }
      }
    };
    window.addEventListener('keydown', onKeyDown, { capture: true });
    return () => window.removeEventListener('keydown', onKeyDown, { capture: true });
  }, [isEditModalOpen, isConfirmCancelOpen]);

  // Body 스크롤 락 (스크롤바 보정 포함) - 어느 모달이든 열리면 적용
  useEffect(() => {
    if (!isEditModalOpen && !isConfirmCancelOpen) return;
    const originalOverflow = document.body.style.overflow;
    const originalPaddingRight = document.body.style.paddingRight;
    const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = 'hidden';
    if (scrollBarWidth > 0) {
      document.body.style.paddingRight = `${scrollBarWidth}px`;
    }
    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.paddingRight = originalPaddingRight;
    };
  }, [isEditModalOpen, isConfirmCancelOpen]);

  // 포커스 트랩 (수정 모달 내부에서 Tab 순환)
  useEffect(() => {
    if (!isEditModalOpen || !editModalRef.current) return;
    const container = editModalRef.current;
    const focusableSelectors = 'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';
    const getFocusables = () => Array.from(container.querySelectorAll(focusableSelectors))
      .filter(el => !el.hasAttribute('disabled') && el.getAttribute('aria-hidden') !== 'true');

    const onKeyDown = (e) => {
      if (e.key !== 'Tab') return;
      const focusables = getFocusables();
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    container.addEventListener('keydown', onKeyDown);
    return () => container.removeEventListener('keydown', onKeyDown);
  }, [isEditModalOpen]);

  // 포커스 트랩 (확인 모달 내부에서 Tab 순환) 및 기본 포커스
  useEffect(() => {
    if (!isConfirmCancelOpen || !confirmModalRef.current) return;
    const container = confirmModalRef.current;
    const focusableSelectors = 'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';
    const getFocusables = () => Array.from(container.querySelectorAll(focusableSelectors))
      .filter(el => !el.hasAttribute('disabled') && el.getAttribute('aria-hidden') !== 'true');

    // 기본 포커스: 확인 버튼
    if (confirmPrimaryRef.current) {
      confirmPrimaryRef.current.focus();
    }

    const onKeyDown = (e) => {
      if (e.key !== 'Tab') return;
      const focusables = getFocusables();
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    container.addEventListener('keydown', onKeyDown);
    return () => container.removeEventListener('keydown', onKeyDown);
  }, [isConfirmCancelOpen]);

  // 특정 예약에 대해 리뷰가 작성되었는지 확인
  const isReviewWritten = (reservation) => {
    const reservIdx = reservation.reservIdx || reservation.id;
    return reviewedReservationIds.has(reservIdx);
  };

  // 더미 데이터 (쿠폰 등)
  const coupons = {
    available: [
      { id: 1, name: '신규가입 웰컴 쿠폰', discount: '10%', condition: '최소 10만원 이상 예약시', expiry: '2025.12.31' },
      { id: 2, name: '가을 시즌 특별 할인', discount: '50,000원', condition: '제주도 호텔 한정', expiry: '2025.11.30' },
      { id: 3, name: 'VIP 회원 전용 쿠폰', discount: '15%', condition: '전 호텔 사용 가능', expiry: '2025.12.31' }
    ],
    used: [
      { id: 4, name: '여름 시즌 쿠폰', discount: '30,000원', condition: '전 호텔', usedDate: '2025.09.15' }
    ],
    expired: [
      { id: 5, name: '추석 연휴 특가', discount: '20%', condition: '최소 20만원 이상', expiry: '2025.09.30' }
    ]
  };

  const likedHotels = [
    { id: 1, name: '스카이 파크 센트럴', location: '명동·남산', price: 140000, rating: 4.8 },
    { id: 2, name: '제주 호텔 리스텔', location: '제주시', price: 98000, rating: 4.5 },
    { id: 3, name: '강남 그랜드 호텔', location: '강남·서초', price: 185000, rating: 4.9 }
  ];

  const recentHotels = [
    { id: 1, name: '나인브릿지 바이...', location: '제주·서귀포', viewDate: '2025.10.14', price: 420000 },
    { id: 2, name: '호텔 현대바이...', location: '속초', viewDate: '2025.10.13', price: 180000 }
  ];

  const inquiries = [
    {
      id: 1,
      title: '예약 변경 문의',
      date: '2025.10.10',
      status: '답변완료',
      answer: '예약 변경은 체크인 3일 전까지 가능합니다.'
    },
    {
      id: 2,
      title: '결제 오류 문의',
      date: '2025.09.28',
      status: '답변완료',
      answer: '결제가 정상적으로 처리되었습니다.'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* URL 쿼리 파라미터 처리 (Suspense로 감싸짐) */}
      <Suspense fallback={null}>
        <TabQueryHandler 
          onTabChange={setReservationTab}
          loadReservations={loadReservations}
        />
      </Suspense>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* 프로필 헤더 */}
        <section className="bg-white rounded-2xl shadow-lg p-8 mb-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
                <User className="w-10 h-10 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-1">
                  {userData?.nickname || userData?.id || '사용자'}님
                </h1>
                <p className="text-sm text-gray-500">{userData?.email || '이메일 미등록'}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                    {userData?.rank || 'Traveler'} 회원
                  </span>
                  <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">
                    포인트: {(userData?.point || 0).toLocaleString()}P
                  </span>
                  <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">
                    캐시: {(userData?.cash || userData?.balance || 0).toLocaleString()}원
                  </span>
                </div>
              </div>
            </div>
            <button 
              onClick={() => router.push('/mypage/edit')}
              className="flex items-center gap-2 px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors font-medium"
            >
              <Edit className="w-4 h-4" />
              <span>개인정보 수정</span>
            </button>
          </div>
        </section>

        {/* 예약 내역 */}
        <section id="reservation-section" className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Calendar className="w-6 h-6 text-blue-600" />
              예약 내역
            </h2>
          </div>

          {/* 탭 */}
          <div className="flex gap-2 mb-6 border-b border-gray-200">
            <button
              onClick={() => {
                setReservationTab('upcoming');
                setCurrentPage(0); // 탭 변경 시 첫 페이지로 리셋
                loadReservations('upcoming', 0, pageSize); // API 호출 ('upcoming' 상태를 인자로 넘김)
              }}
              className={`px-6 py-3 font-medium transition-all border-b-2 ${
                reservationTab === 'upcoming'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              이용 예정 ({reservationCounts.upcoming || reservations.upcoming.length})
            </button>
            <button
              onClick={() => {
                setReservationTab('completed');
                setCurrentPage(0); // 탭 변경 시 첫 페이지로 리셋
                loadReservations('completed', 0, pageSize); // API 호출 ('completed' 상태를 인자로 넘김)
              }}
              className={`px-6 py-3 font-medium transition-all border-b-2 ${
                reservationTab === 'completed'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              이용 완료 ({reservationCounts.completed || reservations.completed.length})
            </button>
            <button
              onClick={() => {
                setReservationTab('cancelled');
                setCurrentPage(0); // 탭 변경 시 첫 페이지로 리셋
                loadReservations('cancelled', 0, pageSize); // API 호출
              }}
              className={`px-6 py-3 font-medium transition-all border-b-2 ${
                reservationTab === 'cancelled'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              취소/환불 ({reservationCounts.cancelled || reservations.cancelled.length})
            </button>
          </div>

          {/* 예약 카드 */}
          <div className="space-y-4">
            {/* 로딩 중 */}
            {reservationsLoading && (
              <div className="flex justify-center items-center py-12">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <span className="ml-3 text-gray-600">데이터를 불러오는 중...</span>
              </div>
            )}
            
            {/* 데이터 없음 */}
            {!reservationsLoading && reservations[reservationTab].length === 0 && (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <Calendar className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-500 text-lg font-medium mb-2">
                  {reservationTab === 'upcoming' && '이용 예정인 예약이 없습니다'}
                  {reservationTab === 'completed' && '이용 완료된 예약이 없습니다'}
                  {reservationTab === 'cancelled' && '취소된 예약이 없습니다'}
                </p>
                <p className="text-gray-400 text-sm">
                  새로운 호텔을 예약해보세요!
                </p>
              </div>
            )}
            
            {/* 예약 목록 */}
            {!reservationsLoading && reservations[reservationTab].map((reservation) => {
              console.log('📋 렌더링할 예약 데이터:', reservation);
              return (
              <div key={reservation.id || reservation.reservationNumber} className="border border-gray-200 rounded-xl p-5 hover:shadow-md transition-all">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1">{reservation.hotelName}</h3>
                    <p className="text-sm text-gray-500 flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {reservation.location}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {reservationTab === 'upcoming' && reservation.status === '예약확정' && !isTradeCompleted(reservation) && (
                      <button 
                        onClick={() => isTradeRegistered(reservation) ? handleEditTrade(reservation) : handleRegisterTrade(reservation)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                          isTradeRegistered(reservation)
                            ? 'bg-blue-50 hover:bg-blue-100 text-blue-600'
                            : 'bg-green-50 hover:bg-green-100 text-green-600'
                        }`}
                      >
                        {isTradeRegistered(reservation) ? '양도거래 수정' : '양도거래 등록'}
                      </button>
                    )}
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      reservation.status === '예약확정' ? 'bg-blue-100 text-blue-700' :
                      reservation.status === '이용완료' ? 'bg-green-100 text-green-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {reservation.status}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                  <div>
                    <span className="text-gray-500">체크인</span>
                    <p className="font-medium text-gray-900">{reservation.checkIn}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">체크아웃</span>
                    <p className="font-medium text-gray-900">{reservation.checkOut}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">객실타입</span>
                    <p className="font-medium text-gray-900">{reservation.roomType}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">총 결제금액</span>
                    <p className="font-bold text-blue-600">{(reservation.totalprice ?? 0).toLocaleString()}원</p>
                  </div>
                </div>

                {/* 액션 버튼 */}
                <div className="flex gap-2">
                  {reservationTab === 'upcoming' && (
                    <>
                      <button 
                        onClick={() => handleReservationDetail(reservation.id)}
                        className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                      >
                        예약 상세보기
                      </button>
                      <button 
                        onClick={() => handleHotelLocation(reservation)}
                        className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
                      >
                        호텔 위치보기
                      </button>
                      <button 
                        onClick={() => handleCancelReservation(reservation)}
                        className="flex-1 px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg font-medium transition-colors"
                      >
                        예약 취소
                      </button>
                    </>
                  )}
                  {reservationTab === 'completed' && (
                    <>
                      <button 
                        onClick={() => !isReviewWritten(reservation) && handleWriteReview(reservation)}
                        disabled={isReviewWritten(reservation)}
                        className={`flex-1 px-4 py-2.5 rounded-lg font-medium transition-colors ${
                          isReviewWritten(reservation)
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-blue-600 hover:bg-blue-700 text-white'
                        }`}
                      >
                        리뷰 작성
                      </button>
                      <button 
                        onClick={() => handleRebook(reservation)}
                        className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
                      >
                        재예약하기
                      </button>
                    </>
                  )}
                  {reservationTab === 'cancelled' && reservation.refundAmount && (
                    <div className="flex-1 text-sm">
                      <p className="text-gray-600">환불 금액: <span className="font-bold text-blue-600">{reservation.refundAmount.toLocaleString()}원</span></p>
                    </div>
                  )}
                </div>
              </div>
              );
            })}
          </div>

          {/* Pagination 컴포넌트 추가 */}
          {!reservationsLoading && totalPages > 0 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalElements={totalElements}
              pageSize={pageSize}
              onPageChange={handlePageChange}
            />
          )}
        </section>

        {/* 내 후기 관리 - 접기/펼치기 */}
        {!isReviewOpen ? (
          <button
            onClick={() => router.push('/mypage/reviews')}
            aria-label="내 리뷰 페이지로 이동"
            className="w-full bg-white rounded-2xl shadow-lg p-9 mb-6 border border-gray-200 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <span className="text-lg font-semibold text-gray-900">내 리뷰</span>
            <ChevronRight className="w-6 h-6 text-gray-400" />
          </button>
        ) : (
          <section className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Star className="w-6 h-6 text-blue-600" />
                내 리뷰
              </h2>
              <button onClick={() => setIsReviewOpen(false)} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500">
                <ChevronRight className="w-5 h-5 rotate-180" />
              </button>
            </div>

            {/* 탭 */}
            <div className="flex gap-2 mb-6 border-b border-gray-200">
              <button
                onClick={() => setReviewTab('writable')}
                className={`px-6 py-3 font-medium transition-all border-b-2 ${
                  reviewTab === 'writable'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                작성 가능한 리뷰 ({writableReviews.length})
              </button>
              <button
                onClick={() => setReviewTab('written')}
                className={`px-6 py-3 font-medium transition-all border-b-2 ${
                  reviewTab === 'written'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                내가 작성한 리뷰 ({writtenReviews.length})
              </button>
            </div>

            {/* 리뷰 카드 */}
            <div className="space-y-5">
              {reviewTab === 'writable' ? (
                writableReviewsLoading ? (
                  <div className="flex justify-center items-center py-12">
                    <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    <span className="ml-3 text-gray-600">데이터를 불러오는 중...</span>
                  </div>
                ) : writableReviews.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-500">작성 가능한 리뷰가 없습니다.</p>
                  </div>
                ) : (
                  writableReviews.map((review) => (
                    <div key={review.reservationIdx} className="border border-blue-200 bg-blue-50 rounded-xl p-7">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 mb-2">{review.hotelName}</h3>
                          <p className="text-base text-gray-500">{review.location} · 체크아웃: {review.checkOutDate}</p>
                        </div>
                        {review.daysLeft !== undefined && review.daysLeft > 0 && (
                          <span className="px-3 py-1 bg-orange-100 text-orange-700 text-xs font-medium rounded-full">
                            {review.daysLeft}일 남음
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => handleWriteReview({ id: review.reservationIdx })}
                        className="flex-1 px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors text-base"
                      >
                        리뷰 작성
                      </button>
                    </div>
                  ))
                )
              ) : (
                writtenReviewsLoading ? (
                  <div className="flex justify-center items-center py-12">
                    <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    <span className="ml-3 text-gray-600">데이터를 불러오는 중...</span>
                  </div>
                ) : writtenReviews.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-500">작성한 리뷰가 없습니다.</p>
                  </div>
                ) : (
                  writtenReviews.map((review) => (
                    <div key={review.reviewIdx} className="border border-gray-200 rounded-xl p-7">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-gray-900 mb-2">
                            {review.hotelName || review.hotelInfo?.title || '호텔 정보 없음'}
                          </h3>
                          <div className="flex items-center gap-2 mb-3">
                            <div className="flex">
                              {[...Array(5)].map((_, i) => (
                                <Star key={i} className={`w-5 h-5 ${i < (review.star || 0) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                              ))}
                            </div>
                            <span className="text-base text-gray-500">
                              {review.createdAt ? new Date(review.createdAt).toLocaleDateString('ko-KR') : ''}
                            </span>
                            {review.isEdited && (
                              <span className="text-xs leading-none px-2 py-1 rounded bg-gray-100 text-gray-600">수정됨</span>
                            )}
                          </div>
                          <p className="text-gray-700 mb-4 text-base leading-relaxed">{review.content}</p>
                        </div>
                        <div className="flex gap-2 ml-4">
                          <button
                            onClick={() => openEditModal(review)}
                            className="p-2.5 hover:bg-gray-100 rounded-lg transition-colors"
                          >
                            <Edit className="w-5 h-5 text-gray-600" />
                          </button>
                          <button className="p-2.5 hover:bg-red-50 rounded-lg transition-colors">
                            <Trash2 className="w-5 h-5 text-red-600" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )
              )}
            </div>
          </section>
        )}

        {/* 찜목록 & 최근본호텔 */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* 찜목록 */}
          <section className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Heart className="w-6 h-6 text-red-500" />
                찜목록
              </h2>
              <button className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1">
                전체보기
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3">
              {likedHotels.map((hotel) => (
                <div key={hotel.id} className="flex gap-3 p-3 border border-gray-200 rounded-lg hover:shadow-md transition-all">
                  <div className="w-20 h-20 bg-gradient-to-br from-gray-200 to-gray-300 rounded-lg flex-shrink-0" />
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 mb-1">{hotel.name}</h3>
                    <p className="text-xs text-gray-500 mb-2">{hotel.location}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-blue-600">{hotel.price.toLocaleString()}원</span>
                      <div className="flex gap-1">
                        <button className="p-1.5 hover:bg-blue-50 rounded transition-colors">
                          <Hotel className="w-4 h-4 text-blue-600" />
                        </button>
                        <button className="p-1.5 hover:bg-blue-50 rounded transition-colors">
                          <Share2 className="w-4 h-4 text-gray-600" />
                        </button>
                        <button className="p-1.5 hover:bg-red-50 rounded transition-colors">
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* 최근본호텔 */}
          <section className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Clock className="w-6 h-6 text-blue-600" />
                최근본호텔
              </h2>
              <button className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1">
                전체보기
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3">
              {recentHotels.map((hotel) => (
                <div key={hotel.id} className="flex gap-3 p-3 border border-gray-200 rounded-lg hover:shadow-md transition-all">
                  <div className="w-20 h-20 bg-gradient-to-br from-gray-200 to-gray-300 rounded-lg flex-shrink-0" />
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 mb-1">{hotel.name}</h3>
                    <p className="text-xs text-gray-500 mb-2">{hotel.location} · {hotel.viewDate}</p>
                    <span className="text-sm font-bold text-gray-700">{hotel.price.toLocaleString()}원~</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* 쿠폰 관리 */}
        <section className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Gift className="w-6 h-6 text-blue-600" />
              쿠폰 관리
            </h2>
          </div>

          {/* 탭 */}
          <div className="flex gap-2 mb-6 border-b border-gray-200">
            <button
              onClick={() => setCouponTab('available')}
              className={`px-6 py-3 font-medium transition-all border-b-2 ${
                couponTab === 'available'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              사용가능 ({coupons.available.length})
            </button>
            <button
              onClick={() => setCouponTab('used')}
              className={`px-6 py-3 font-medium transition-all border-b-2 ${
                couponTab === 'used'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              사용완료 ({coupons.used.length})
            </button>
            <button
              onClick={() => setCouponTab('expired')}
              className={`px-6 py-3 font-medium transition-all border-b-2 ${
                couponTab === 'expired'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              기간만료 ({coupons.expired.length})
            </button>
          </div>

          {/* 쿠폰 카드 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {coupons[couponTab].map((coupon) => (
              <div key={coupon.id} className={`border-2 rounded-xl p-5 transition-all ${
                couponTab === 'available' 
                  ? 'border-blue-300 bg-blue-50 hover:shadow-lg' 
                  : 'border-gray-200 bg-gray-50'
              }`}>
                <div className="flex items-start justify-between mb-3">
                  <Gift className={`w-8 h-8 ${couponTab === 'available' ? 'text-blue-600' : 'text-gray-400'}`} />
                  <span className={`text-2xl font-bold ${couponTab === 'available' ? 'text-blue-600' : 'text-gray-400'}`}>
                    {coupon.discount}
                  </span>
                </div>
                <h3 className={`font-bold mb-2 ${couponTab === 'available' ? 'text-gray-900' : 'text-gray-500'}`}>
                  {coupon.name}
                </h3>
                <p className="text-xs text-gray-500 mb-3">{coupon.condition}</p>
                <div className="text-xs">
                  <span className={couponTab === 'available' ? 'text-gray-600' : 'text-gray-400'}>
                    {couponTab === 'used' ? `사용일: ${coupon.usedDate}` : `만료일: ${coupon.expiry}`}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 1:1 문의 내역 */}
        <section className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <MessageSquare className="w-6 h-6 text-blue-600" />
              1:1 문의 내역
            </h2>
            <button
              onClick={() => router.push('/center/inquiry')}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              새 문의하기
            </button>
          </div>

          <div className="space-y-3">
            {inquiries.map((inquiry) => (
              <div key={inquiry.id} className="border border-gray-200 rounded-xl p-5 hover:shadow-md transition-all">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-bold text-gray-900">{inquiry.title}</h3>
                      <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded">
                        {inquiry.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mb-3">{inquiry.date}</p>
                    {inquiry.answer && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <p className="text-sm text-gray-700"><span className="font-semibold text-blue-600">답변:</span> {inquiry.answer}</p>
                      </div>
                    )}
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <Footer />

      {/* 리뷰 수정 모달 (UI 전용) */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={closeEditModal} />
          <div ref={editModalRef} className="relative z-10 w-full max-w-lg mx-4 bg-white rounded-2xl shadow-xl border border-gray-200" role="dialog" aria-modal="true">
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">리뷰 수정</h3>
              <button
                aria-label="닫기"
                onClick={closeEditModal}
                className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700"
              >
                X
              </button>
            </div>

            <div className="px-6 py-5">
              {/* 호텔/메타 */}
              {editingReview && (
                <div className="mb-4">
                  <p className="text-sm text-gray-500">{editingReview.hotelName || editingReview.hotelInfo?.title}</p>
                  <p className="text-xs text-gray-400">작성일: {editingReview.createdAt ? new Date(editingReview.createdAt).toLocaleDateString('ko-KR') : '-'}</p>
                </div>
              )}

              {/* 읽기전용 별점 */}
              {editingReview && (
                <div className="mb-4">
                  <div className="flex items-center gap-2">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-5 h-5 ${i < (Number(editingReview.star) || 0) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                      ))}
                    </div>
                    <span className="text-xs text-gray-500">
                    </span>
                  </div>
                </div>
              )}

              {/* 내용 */}
              <div className="mb-6">
                <p className="text-sm font-medium text-gray-500 mt-1">리뷰 내용</p>
                &nbsp;
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  placeholder="호텔 이용 경험을 자세히 작성해주세요. (최소 10자 이상)"
                  rows={6}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  ref={editContentRef}
                  maxLength={300}
                />
                <p className="text-xs text-gray-500 mt-1 text-right">{editContent.length} / 300자</p>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
              <button onClick={() => setIsConfirmCancelOpen(true)} className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors">취소</button>
              <button onClick={handleSaveEditedReview} className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors">저장</button>
            </div>
          </div>
        </div>
      )}

      {/* 취소 확인 모달 */}
      {isConfirmCancelOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setIsConfirmCancelOpen(false)} />
          <div
            ref={confirmModalRef}
            className="relative z-10 w-full max-w-md mx-4 bg-white rounded-2xl shadow-xl border border-gray-200"
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-cancel-title"
          >
            <div className="px-6 py-5 border-b border-gray-100">
              <h4 id="confirm-cancel-title" className="text-base font-bold text-gray-900">변경 내용 취소</h4>
            </div>
            <div className="px-6 py-5 text-center">
              <p id="confirm-cancel-desc" className="text-sm text-gray-800">수정한 내용이 저장되지 않습니다. 정말 취소하시겠습니까?</p>
            </div>
            <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
              <button
                onClick={() => setIsConfirmCancelOpen(false)}
                className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
              >
                아니오
              </button>
              <button
                ref={confirmPrimaryRef}
                onClick={() => { setIsConfirmCancelOpen(false); closeEditModal(); }}
                className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
              >
                예
              </button>
            </div>
          </div>
        </div>
      )}
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
