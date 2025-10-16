'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Building2, 
  Users, 
  MessageSquare, 
  TrendingUp, 
  Settings 
} from 'lucide-react';

const MasterSidebar = ({ isOpen, onClose, onToggle }) => {
  const pathname = usePathname();
  const menuItems = [
    {
      id: 'dashboard',
      name: '대시보드',
      icon: <LayoutDashboard size={20} />,
      path: '/master'
    },
    {
      id: 'hotels',
      name: '호텔 관리',
      icon: <Building2 size={20} />,
      path: '/master/hotels',
      submenu: [
        { id: 'hotel-list', name: '호텔 목록', path: '/master/hotels' },
        { id: 'hotel-approval', name: '호텔 승인', path: '/master/hotel-approval' },
        { id: 'hotel-settings', name: '호텔 설정', path: '/master/hotel-settings' }
      ]
    },
    {
      id: 'members',
      name: '회원 관리',
      icon: <Users size={20} />,
      path: '/master/members',
      submenu: [
        { id: 'member-list', name: '회원 목록', path: '/master/members' },
        { id: 'member-history', name: '회원 이력', path: '/master/member-history' },
        { id: 'member-feedback', name: '회원 피드백', path: '/master/member-feedback' }
      ]
    },
    {
      id: 'messages',
      name: '메시지 관리',
      icon: <MessageSquare size={20} />,
      path: '/master/messages',
      submenu: [
        { id: 'message-list', name: '메시지 목록', path: '/master/messages' },
        { id: 'message-send', name: '메시지 발송', path: '/master/message-send' },
        { id: 'message-templates', name: '템플릿 관리', path: '/master/message-templates' }
      ]
    },
    {
      id: 'customer-service',
      name: '고객센터',
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636A9 9 0 105.636 18.364 9 9 0 0018.364 5.636z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 15s1.5 2 4 2 4-2 4-2" /></svg>,
      path: '/master/customer-service',
      submenu: [
        { id: 'faq-list', name: '자주 묻는 질문', path: '/master/customer-service/faq' },
        { id: 'inquiry-list', name: '1:1 문의 목록', path: '/master/customer-service/inquiries' }
      ]
    },
    {
      id: 'statistics',
      name: '통계 분석',
      icon: <TrendingUp size={20} />,
      path: '/master/statistics',
      submenu: [
        { id: 'statistics-dashboard', name: '통계 현황', path: '/master/statistics' },
        { id: 'statistics-analysis', name: '분석 리포트', path: '/master/statistics-analysis' },
        { id: 'statistics-export', name: '데이터 내보내기', path: '/master/statistics-export' }
      ]
    },
    {
      id: 'settings',
      name: '설정',
      icon: <Settings size={20} />,
      path: '/master/settings',
      submenu: [
        { id: 'site-settings', name: '사이트 설정', path: '/master/site-settings' },
        { id: 'system-settings', name: '시스템 설정', path: '/master/system-settings' },
        { id: 'user-management', name: '사용자 관리', path: '/master/user-management' }
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
      {/* 데스크톱 사이드바 - 큰 화면에서만 항상 표시 */}
      <div className="hidden xl:fixed xl:inset-y-0 xl:z-50 xl:flex xl:w-72 xl:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white border-r border-gray-200 px-6 py-6">
          {/* 로고 */}
          <div className="flex h-16 shrink-0 items-center">
            <div className="text-xl font-bold text-[#7C3AED]">
              체크인 마스터
            </div>
          </div>

          {/* 메뉴 아이템들 */}
          <nav className="flex flex-1 flex-col">
            <ul role="list" className="flex flex-1 flex-col gap-y-1">
              {menuItems.map((item) => (
                <li key={item.id}>
                  <div>
                    <Link
                      href={item.path}
                      className={`group flex items-center gap-x-3 rounded-md p-3 text-sm leading-6 font-semibold w-full text-left transition-colors ${
                        isActive(item.path) || isSubmenuActive(item.submenu || [])
                          ? 'bg-[#7C3AED] text-white'
                          : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                      }`}
                    >
                      <span className="flex-shrink-0">{item.icon}</span>
                      <span className="truncate">{item.name}</span>
                    </Link>
                    
                    {/* 서브메뉴 */}
                    {item.submenu && (
                      <ul className="ml-8 mt-1 space-y-1">
                        {item.submenu.map((subItem) => (
                          <li key={subItem.id}>
                            <Link
                              href={subItem.path}
                              className={`block px-3 py-2 text-sm rounded-md transition-colors w-full text-left ${
                                isActive(subItem.path)
                                  ? 'bg-purple-50 text-[#7C3AED] font-medium'
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

      {/* 모바일/태블릿 사이드바 - 오버레이 방식 */}
      <div className={`fixed inset-y-0 left-0 z-50 w-56 bg-white border-r border-gray-200 transform transition-transform duration-300 xl:hidden ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex h-full flex-col px-4 py-4">
          {/* 모바일 헤더 */}
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm font-bold text-[#7C3AED]">체크인 마스터</div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* 모바일 메뉴 */}
          <nav className="flex-1">
            <ul role="list" className="space-y-1">
              {menuItems.map((item) => (
                <li key={item.id}>
                  <div>
                    <Link
                      href={item.path}
                      className={`group flex gap-x-2 rounded-md p-2 text-xs leading-4 font-medium w-full text-left transition-colors ${
                        isActive(item.path) || isSubmenuActive(item.submenu || [])
                          ? 'bg-[#7C3AED] text-white'
                          : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                      }`}
                    >
                      <span className="flex-shrink-0 scale-75">{item.icon}</span>
                      <span className="truncate text-xs">{item.name}</span>
                    </Link>
                    
                    {/* 서브메뉴 */}
                    {item.submenu && (
                      <ul className="ml-4 mt-1 space-y-1">
                        {item.submenu.map((subItem) => (
                          <li key={subItem.id}>
                            <Link
                              href={subItem.path}
                              className={`block px-2 py-1 text-xs rounded-md transition-colors w-full text-left ${
                                isActive(subItem.path)
                                  ? 'bg-purple-50 text-[#7C3AED] font-medium'
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

      {/* 모바일/태블릿 오버레이 */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-gray-600 bg-opacity-75 z-40 xl:hidden"
          onClick={onClose}
        ></div>
      )}
    </>
  );
};

export default MasterSidebar;
