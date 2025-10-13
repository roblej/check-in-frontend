'use client';

import { usePathname, useRouter } from 'next/navigation';

const MasterHeader = ({ onMenuClick }) => {
  const pathname = usePathname();
  const router = useRouter();
  
  const handleLogout = () => {
    // 로그아웃 처리 (필요시 세션 정리 등)
    router.push('/');
  };
  
  const pageTitles = {
    '/master': '사이트 대시보드',
    '/master/hotels': '호텔 관리',
    '/master/hotel-approval': '호텔 승인',
    '/master/members': '회원 관리',
    '/master/member-history': '회원 이력',
    '/master/messages': '메시지 관리',
    '/master/statistics': '통계 분석',
    '/master/settings': '시스템 설정'
  };

  const currentTitle = pageTitles[pathname] || '사이트 관리자';

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-12 sm:h-16">
          {/* 좌측: 메뉴 버튼 + 페이지 제목 */}
          <div className="flex items-center gap-4">
            {/* 모바일 메뉴 버튼 */}
            <button
              onClick={onMenuClick}
              className="lg:hidden p-1.5 sm:p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
              aria-label="메뉴 열기"
            >
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            {/* 페이지 제목 */}
            <div>
              <h1 className="text-lg sm:text-xl font-semibold text-gray-900">
                {currentTitle}
              </h1>
              <p className="text-xs sm:text-sm text-gray-500">
                체크인 사이트 관리 시스템
              </p>
            </div>
          </div>

          {/* 우측: 사용자 정보 및 액션 */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* 알림 */}
            <button className="relative p-1 sm:p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md">
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5-5-5h5V3h5v14z" />
              </svg>
              {/* 알림 배지 */}
              <span className="absolute top-0.5 right-0.5 sm:top-1 sm:right-1 h-1.5 w-1.5 sm:h-2 sm:w-2 bg-red-500 rounded-full"></span>
            </button>

            {/* 사용자 프로필 */}
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-xs sm:text-sm font-medium text-gray-900">사이트 관리자</p>
                <p className="text-xs text-gray-500">master@checkin.com</p>
              </div>
              
              {/* 프로필 아바타 */}
              <div className="w-7 h-7 sm:w-8 sm:h-8 bg-[#7C3AED] rounded-full flex items-center justify-center">
                <span className="text-white text-xs sm:text-sm font-medium">M</span>
              </div>

              {/* 로그아웃 버튼 */}
              <button 
                onClick={handleLogout}
                className="text-xs sm:text-sm text-gray-600 hover:text-gray-900 px-2 py-1 sm:px-3 sm:py-1.5 rounded hover:bg-gray-100 transition-colors"
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

export default MasterHeader;

