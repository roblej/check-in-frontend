'use client';

import { usePathname, useRouter } from 'next/navigation';

const MasterHeader = ({ onMenuClick }) => {
  const pathname = usePathname();
  const router = useRouter();
  
  const handleLogout = () => {
    router.push('/');
  };

  const getPageTitle = () => {
    switch (pathname) {
      case '/master':
        return '대시보드';
      case '/master/hotels':
        return '호텔 관리';
      case '/master/hotel-approval':
        return '호텔 승인';
      case '/master/member-history':
        return '회원 이력';
      case '/master/statistics':
        return '통계';
      case '/master/settings':
        return '설정';
      default:
        return '사이트 관리자';
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 px-3 sm:px-6 py-3 sm:py-4">
      <div className="flex items-center justify-between">
        {/* 왼쪽: 메뉴 버튼 + 페이지 제목 */}
        <div className="flex items-center space-x-3 sm:space-x-4">
          <button
            onClick={onMenuClick}
            className="xl:hidden p-1 sm:p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
            aria-label="메뉴 열기"
          >
            <svg className="w-3 h-3 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          
          <div>
            <h1 className="text-lg sm:text-xl font-semibold text-gray-900">{getPageTitle()}</h1>
            <p className="text-xs sm:text-sm text-gray-500">사이트 관리자 페이지</p>
          </div>
        </div>

        {/* 오른쪽: 사용자 정보 + 로그아웃 */}
        <div className="flex items-center space-x-2 sm:space-x-4">
          <div className="text-right">
            <p className="text-xs sm:text-sm font-medium text-gray-900">사이트 관리자</p>
            <p className="text-xs text-gray-500">master@checkin.com</p>
          </div>
          
          <button 
            onClick={handleLogout}
            className="text-xs sm:text-sm text-gray-600 hover:text-gray-900 px-1 py-0.5 sm:px-3 sm:py-1.5 rounded hover:bg-gray-100 transition-colors"
          >
            로그아웃
          </button>
        </div>
      </div>
    </header>
  );
};

export default MasterHeader;
