'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const AdminSidebar = ({ isOpen, onClose, onToggle }) => {
  const pathname = usePathname();
  const menuItems = [
    {
      id: 'dashboard',
      name: '대시보드',
      icon: '📊',
      path: '/admin'
    },
    {
      id: 'reservations',
      name: '예약 관리',
      icon: '📅',
      path: '/admin/reservations',
      submenu: [
        { id: 'reservation-list', name: '예약 현황', path: '/admin/reservations' },
        { id: 'checkin-checkout', name: '체크인/체크아웃', path: '/admin/checkin-checkout' },
        { id: 'reservation-calendar', name: '예약 캘린더', path: '/admin/calendar' }
      ]
    },
    {
      id: 'rooms',
      name: '객실 관리',
      icon: '🏨',
      path: '/admin/rooms',
      submenu: [
        { id: 'room-list', name: '객실 현황', path: '/admin/rooms' },
        { id: 'room-pricing', name: '가격 설정', path: '/admin/room-pricing' },
        { id: 'room-types', name: '객실 타입', path: '/admin/room-types' }
      ]
    },
    {
      id: 'customers',
      name: '고객 관리',
      icon: '👥',
      path: '/admin/customers',
      submenu: [
        { id: 'customer-list', name: '고객 목록', path: '/admin/customers' },
        { id: 'customer-history', name: '이용 이력', path: '/admin/customer-history' },
        { id: 'customer-feedback', name: '고객 피드백', path: '/admin/feedback' }
      ]
    },
    {
      id: 'revenue',
      name: '매출 관리',
      icon: '💰',
      path: '/admin/revenue',
      submenu: [
        { id: 'revenue-dashboard', name: '매출 현황', path: '/admin/revenue' },
        { id: 'revenue-analysis', name: '수익 분석', path: '/admin/revenue-analysis' },
        { id: 'settlement', name: '정산 관리', path: '/admin/settlement' }
      ]
    },
    {
      id: 'settings',
      name: '설정',
      icon: '⚙️',
      path: '/admin/settings',
      submenu: [
        { id: 'hotel-info', name: '호텔 정보', path: '/admin/hotel-info' },
        { id: 'operational-settings', name: '운영 설정', path: '/admin/operational-settings' },
        { id: 'user-management', name: '사용자 관리', path: '/admin/users' }
      ]
    }
  ];

  const isActive = (path) => {
    return pathname === path;
  };

  const isSubmenuActive = (submenu) => {
    return submenu.some(item => pathname === item.path);
  };

  return (
    <>
      {/* 데스크톱 사이드바 */}
      <div className={`hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-24 lg:flex-col transition-all duration-300 ${isOpen ? 'lg:w-64' : 'lg:w-24'}`}>
        <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white border-r border-gray-200 px-3 py-6">
          {/* 로고 및 토글 버튼 */}
          <div className="flex h-10 shrink-0 items-center justify-between">
            <div className={`text-lg font-bold text-[#3B82F6] transition-all duration-300 ${isOpen ? 'text-xl' : 'text-base'}`}>
              {isOpen ? '체크인 관리자' : '보기'}
            </div>
            <button
              onClick={onToggle}
              className="p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              title={isOpen ? '사이드바 접기' : '사이드바 펼치기'}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                )}
              </svg>
            </button>
          </div>

          {/* 메뉴 아이템들 */}
          <nav className="flex flex-1 flex-col">
            <ul role="list" className="flex flex-1 flex-col gap-y-2">
              {menuItems.map((item) => (
                <li key={item.id}>
                  <div>
                    <Link
                      href={item.path}
                      className={`group flex items-center ${isOpen ? 'gap-x-3' : 'justify-center'} rounded-md p-3 text-sm leading-6 font-semibold w-full text-left transition-colors ${
                        isActive(item.path) || isSubmenuActive(item.submenu || [])
                          ? 'bg-[#3B82F6] text-white'
                          : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                      }`}
                      title={!isOpen ? item.name : ''}
                    >
                      <span className={`flex-shrink-0 ${isOpen ? 'text-xl' : 'text-2xl'}`}>{item.icon}</span>
                      {isOpen && (
                        <span className="truncate text-sm">{item.name}</span>
                      )}
                    </Link>
                    
                    {/* 서브메뉴 */}
                    {isOpen && item.submenu && (
                      <ul className="ml-6 mt-2 space-y-1">
                        {item.submenu.map((subItem) => (
                          <li key={subItem.id}>
                            <Link
                              href={subItem.path}
                              className={`block px-3 py-2 text-sm rounded-md transition-colors w-full text-left ${
                                isActive(subItem.path)
                                  ? 'bg-blue-50 text-[#3B82F6] font-medium'
                                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                              }`}
                            >
                              {subItem.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>

      {/* 모바일 사이드바 */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white/95 backdrop-blur-sm border-r border-gray-200 transform transition-transform duration-300 lg:hidden ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex h-full flex-col px-4 py-6">
          {/* 모바일 헤더 */}
          <div className="flex items-center justify-between mb-6">
            <div className="text-xl font-bold text-[#3B82F6]">체크인 관리자</div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* 모바일 메뉴 */}
          <nav className="flex-1">
            <ul role="list" className="space-y-2">
              {menuItems.map((item) => (
                <li key={item.id}>
                  <div>
                    <Link
                      href={item.path}
                      className={`group flex gap-x-3 rounded-md p-3 text-sm leading-6 font-semibold w-full text-left transition-colors ${
                        isActive(item.path) || isSubmenuActive(item.submenu || [])
                          ? 'bg-[#3B82F6] text-white'
                          : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                      }`}
                    >
                      <span className="text-lg">{item.icon}</span>
                      <span className="truncate">{item.name}</span>
                    </Link>
                    
                    {/* 서브메뉴 */}
                    {item.submenu && (
                      <ul className="ml-6 mt-2 space-y-1">
                        {item.submenu.map((subItem) => (
                          <li key={subItem.id}>
                            <Link
                              href={subItem.path}
                              className={`block px-3 py-2 text-sm rounded-md transition-colors w-full text-left ${
                                isActive(subItem.path)
                                  ? 'bg-blue-50 text-[#3B82F6] font-medium'
                                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                              }`}
                            >
                              {subItem.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
    </>
  );
};

export default AdminSidebar;
