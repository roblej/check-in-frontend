'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useCustomerStore } from '@/stores/customerStore';
import { useAdminStore } from '@/stores/adminStore';
import { deleteAdminIdxCookie } from '@/utils/cookieUtils';
import axios from '@/lib/axios';

const AdminHeader = ({ onMenuClick }) => {
  const pathname = usePathname();
  const router = useRouter();
  const { resetAccessToken, setInlogged } = useCustomerStore();
  const { resetAdminData } = useAdminStore();
  
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
            {/* 알림 */}
            <button className="relative p-0.5 sm:p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md">
              <svg className="w-3 h-3 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5-5-5h5V3h5v14z" />
              </svg>
              {/* 알림 배지 */}
              <span className="absolute top-0 right-0 sm:top-1 sm:right-1 h-1 w-1 sm:h-2 sm:w-2 bg-red-500 rounded-full"></span>
            </button>

            {/* 사용자 프로필 */}
            <div className="flex items-center gap-1 sm:gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-xs sm:text-sm font-medium text-gray-900">사업자</p>
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
