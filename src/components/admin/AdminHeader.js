'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useCustomerStore } from '@/stores/customerStore';
import { useAdminStore } from '@/stores/adminStore';
import { deleteAdminIdxCookie } from '@/utils/cookieUtils';
import axiosInstance from '@/lib/axios';

const AdminHeader = ({ onMenuClick }) => {
  const pathname = usePathname();
  const router = useRouter();
  const { resetAccessToken, setInlogged, isInlogged } = useCustomerStore();
  const { resetAdminData } = useAdminStore();
  const [hotelTitle, setHotelTitle] = useState('사업자');
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  
  const handleLogout = () => {
    // 고객 스토어 초기화
    axios.get('/login/logout');
    resetAccessToken("");
    setInlogged(false);
    
    // 관리자 스토어 초기화
    resetAdminData();
    
    // adminIdx 쿠키 삭제
    deleteAdminIdxCookie();
    
    console.log("관리자 로그아웃 완료");
    router.push('/admin-login');
  };
  
  const pageTitles = {
    '/admin': '대시보드',
    '/admin/reservations': '예약 관리',
    '/admin/checkin-checkout': '체크인/체크아웃',
    '/admin/rooms': '객실 관리',
    '/admin/room-pricing': '가격 설정',
    '/admin/room-types': '객실 타입',
    '/admin/customers': '고객 관리',
    '/admin/customer-history': '이용 이력',
    '/admin/feedback': '고객 피드백',
    '/admin/revenue': '매출 관리',
    '/admin/settings': '설정'
  };

  const currentTitle = pageTitles[pathname] || '관리자';

  // 인증 체크 및 호텔명 조회
  useEffect(() => {
    const checkAuthAndFetchTitle = async () => {
      // 1. 클라이언트 측 인증 체크
      if (!isInlogged()) {
        router.push('/admin-login');
        return;
      }

      try {
        // 2. 서버 측 인증 체크 (API 호출)
        const response = await axiosInstance.get('/admin/hotelTitle');
        if (response.data.success && response.data.title) {
          setHotelTitle(response.data.title);
        }
        setIsCheckingAuth(false);
      } catch (error) {
        console.error('호텔명 조회 오류:', error);
        
        // 3. 401/403 에러 처리: 토큰 만료 또는 서버 측 인증 실패 시 로그인 페이지로 리다이렉트
        if (error.response?.status === 401 || error.response?.status === 403) {
          router.push('/admin-login');
          return;
        }
        
        // 기타 오류 발생 시에도 인증 체크 완료로 처리
        setIsCheckingAuth(false);
      }
    };

    checkAuthAndFetchTitle();
  }, [isInlogged, router]);

  // 인증 체크 중일 때 전체 화면 로딩 UI 표시
  if (isCheckingAuth) {
    return (
      <div className="fixed inset-0 bg-gray-50 flex items-center justify-center z-50">
        <div className="flex flex-col items-center text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">인증 정보를 확인하는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-12 sm:h-16">
          {/* 좌측: 메뉴 버튼 + 페이지 제목 */}
          <div className="flex items-center gap-4">
            {/* 모바일/태블릿 메뉴 버튼 */}
            <button
              onClick={onMenuClick}
              className="xl:hidden p-1 sm:p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
              aria-label="메뉴 열기"
            >
              <svg className="w-3 h-3 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            {/* 페이지 제목 */}
            <div>
              <h1 className="text-sm sm:text-xl font-semibold text-gray-900">
                {currentTitle}
              </h1>
              <p className="text-xs sm:text-sm text-gray-500">
                호텔 관리 시스템
              </p>
            </div>
          </div>

          {/* 우측: 사용자 정보 및 액션 */}
          <div className="flex items-center gap-1 sm:gap-4">

            {/* 사용자 프로필 */}
            <div className="flex items-center gap-1 sm:gap-3">
              {/* 호텔명 표시 */}
              <div className="text-right hidden sm:block">
                <div className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 bg-blue-50 rounded-lg border border-blue-200">
                  <svg className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  <div>
                    <p className="text-xs sm:text-sm font-semibold text-gray-900 truncate max-w-[150px] sm:max-w-[200px]" title={hotelTitle}>
                      {hotelTitle}
                    </p>
                  </div>
                </div>
              </div>
              
              {/* 프로필 아바타 */}
              <div className="w-5 h-5 sm:w-8 sm:h-8 bg-[#3B82F6] rounded-full flex items-center justify-center">
                <span className="text-white text-xs sm:text-sm font-medium">A</span>
              </div>

              {/* 로그아웃 버튼 */}
              <button 
                onClick={handleLogout}
                className="text-xs sm:text-sm text-gray-600 hover:text-gray-900 px-1 py-0.5 sm:px-3 sm:py-1.5 rounded hover:bg-gray-100 transition-colors"
              >
                로그아웃
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
