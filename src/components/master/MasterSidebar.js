'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Building2, 
  Users, 
  TrendingUp, 
  Gift,
  ChevronDown,
  ChevronRight,
  MessageSquare,
  FileText,
  HelpCircle,
  BarChart,
  Ticket,
  Server,
  CreditCard,
  AlertTriangle
} from 'lucide-react';

const MasterSidebar = ({ isOpen, onClose, onToggle }) => {
  const pathname = usePathname();
  const [openMenus, setOpenMenus] = useState({});
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
      submenu: [
        { id: 'hotel-list', name: '호텔 목록', path: '/master/hotels', icon: <Building2 size={16} /> },
        { id: 'hotel-approval', name: '호텔 승인', path: '/master/hotel-approval', icon: <FileText size={16} /> },
        { id: 'settlement', name: '정산 관리', path: '/master/settlements', icon: <CreditCard size={16} /> }
      ]
    },
    {
      id: 'members',
      name: '회원 관리',
      icon: <Users size={20} />,
      submenu: [
        { id: 'member-list', name: '회원 목록', path: '/master/members', icon: <Users size={16} /> }
      ]
    },
    {
      id: 'center',
      name: '고객센터',
      icon: <HelpCircle size={20} />,
      submenu: [
        { id: 'faq-list', name: '자주 묻는 질문', path: '/master/center/faq', icon: <HelpCircle size={16} /> },
        { id: 'inquiry-list', name: '1:1 문의 목록', path: '/master/center/inquiries', icon: <MessageSquare size={16} /> },
        { id: 'report-list', name: '신고 목록', path: '/master/center/reports', icon: <AlertTriangle size={16} /> }
      ]
    },
    {
      id: 'statistics',
      name: '통계 분석',
      icon: <TrendingUp size={20} />,
      submenu: [
        { id: 'statistics-dashboard', name: '통계 현황', path: '/master/statistics', icon: <BarChart size={16} /> }
      ]
    },
    {
      id: 'coupon',
      name: '쿠폰 관리',
      icon: <Gift size={20} />,
      submenu: [
        { id: 'coupon-templates', name: '쿠폰 템플릿', path: '/master/coupon-templates', icon: <Ticket size={16} /> },
        { id: 'coupon-batch', name: '쿠폰 일괄 처리', path: '/master/coupon-batch', icon: <Server size={16} /> }
      ]
    }
  ];

  const isActive = (path) => {
    return pathname === path;
  };

  const isSubmenuActive = (submenu) => {
    return submenu && submenu.some(item => pathname === item.path);
  };

  // 서브메뉴가 활성화된 경우 자동으로 열림
  useEffect(() => {
    const newOpenMenus = {};
    menuItems.forEach((item) => {
      if (item.submenu && isSubmenuActive(item.submenu)) {
        newOpenMenus[item.id] = true;
      }
    });
    setOpenMenus(newOpenMenus);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const toggleMenu = (itemId) => {
    setOpenMenus(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
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
              {menuItems.map((item) => {
                const hasSubmenu = item.submenu && item.submenu.length > 0;
                const isMenuOpen = openMenus[item.id];
                const isMenuActive = isActive(item.path) || isSubmenuActive(item.submenu || []);

                return (
                  <li key={item.id}>
                    <div>
                      {hasSubmenu ? (
                        <button
                          onClick={() => toggleMenu(item.id)}
                          className={`group flex items-center gap-x-3 rounded-md p-3 text-sm leading-6 font-semibold w-full text-left transition-colors ${
                            isMenuActive
                              ? 'bg-[#7C3AED] text-white'
                              : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                          }`}
                        >
                          <span className="flex-shrink-0">{item.icon}</span>
                          <span className="truncate flex-1">{item.name}</span>
                          <span className="flex-shrink-0">
                            {isMenuOpen ? (
                              <ChevronDown size={16} />
                            ) : (
                              <ChevronRight size={16} />
                            )}
                          </span>
                        </button>
                      ) : (
                        <Link
                          href={item.path}
                          className={`group flex items-center gap-x-3 rounded-md p-3 text-sm leading-6 font-semibold w-full text-left transition-colors ${
                            isActive(item.path)
                              ? 'bg-[#7C3AED] text-white'
                              : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                          }`}
                        >
                          <span className="flex-shrink-0">{item.icon}</span>
                          <span className="truncate">{item.name}</span>
                        </Link>
                      )}
                      
                      {/* 서브메뉴 */}
                      {hasSubmenu && (
                        <ul className={`ml-8 mt-1 space-y-1 transition-all duration-200 overflow-hidden ${
                          isMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                        }`}>
                          {item.submenu.map((subItem) => (
                            <li key={subItem.id}>
                              <Link
                                href={subItem.path}
                                className={`flex items-center gap-x-2 px-3 py-2 text-sm rounded-md transition-colors w-full text-left ${
                                  isActive(subItem.path)
                                    ? 'bg-purple-50 text-[#7C3AED] font-medium'
                                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                                }`}
                              >
                                {subItem.icon && <span className="flex-shrink-0">{subItem.icon}</span>}
                                <span>{subItem.name}</span>
                              </Link>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </li>
                );
              })}
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
              {menuItems.map((item) => {
                const hasSubmenu = item.submenu && item.submenu.length > 0;
                const isMenuOpen = openMenus[item.id];
                const isMenuActive = isActive(item.path) || isSubmenuActive(item.submenu || []);

                return (
                  <li key={item.id}>
                    <div>
                      {hasSubmenu ? (
                        <button
                          onClick={() => toggleMenu(item.id)}
                          className={`group flex gap-x-2 rounded-md p-2 text-xs leading-4 font-medium w-full text-left transition-colors ${
                            isMenuActive
                              ? 'bg-[#7C3AED] text-white'
                              : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                          }`}
                        >
                          <span className="flex-shrink-0 scale-75">{item.icon}</span>
                          <span className="truncate text-xs flex-1">{item.name}</span>
                          <span className="flex-shrink-0 scale-75">
                            {isMenuOpen ? (
                              <ChevronDown size={12} />
                            ) : (
                              <ChevronRight size={12} />
                            )}
                          </span>
                        </button>
                      ) : (
                        <Link
                          href={item.path}
                          className={`group flex gap-x-2 rounded-md p-2 text-xs leading-4 font-medium w-full text-left transition-colors ${
                            isActive(item.path)
                              ? 'bg-[#7C3AED] text-white'
                              : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                          }`}
                        >
                          <span className="flex-shrink-0 scale-75">{item.icon}</span>
                          <span className="truncate text-xs">{item.name}</span>
                        </Link>
                      )}
                      
                      {/* 서브메뉴 */}
                      {hasSubmenu && (
                        <ul className={`ml-4 mt-1 space-y-1 transition-all duration-200 overflow-hidden ${
                          isMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                        }`}>
                          {item.submenu.map((subItem) => (
                            <li key={subItem.id}>
                              <Link
                                href={subItem.path}
                                className={`flex items-center gap-x-2 px-2 py-1 text-xs rounded-md transition-colors w-full text-left ${
                                  isActive(subItem.path)
                                    ? 'bg-purple-50 text-[#7C3AED] font-medium'
                                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                                }`}
                              >
                                {subItem.icon && <span className="flex-shrink-0 scale-75">{subItem.icon}</span>}
                                <span>{subItem.name}</span>
                              </Link>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>
      </div>

      {/* 모바일/태블릿 오버레이 */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-opacity-75 z-40 xl:hidden"
          onClick={onClose}
        ></div>
      )}
    </>
  );
};

export default MasterSidebar;
