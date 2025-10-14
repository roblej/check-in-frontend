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
      name: '대시보드',
      href: '/master',
      icon: <LayoutDashboard size={20} />
    },
    {
      name: '호텔 관리',
      href: '/master/hotels',
      icon: <Building2 size={20} />
    },
    {
      name: '호텔 승인',
      href: '/master/hotel-approval',
      icon: <Users size={20} />
    },
    {
      name: '회원 이력',
      href: '/master/member-history',
      icon: <MessageSquare size={20} />
    },
    {
      name: '통계',
      href: '/master/statistics',
      icon: <TrendingUp size={20} />
    },
    {
      name: '설정',
      href: '/master/settings',
      icon: <Settings size={20} />
    }
  ];

  return (
    <>
      {/* 데스크톱 사이드바 - 큰 화면에서만 항상 표시 */}
      <div className="hidden xl:fixed xl:inset-y-0 xl:z-50 xl:flex xl:w-72 xl:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white px-6 pb-4 border-r border-gray-200">
          <div className="flex h-16 shrink-0 items-center">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">M</span>
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">마스터</h1>
                <p className="text-xs text-gray-500">사이트 관리자</p>
              </div>
            </div>
          </div>
          
          <nav className="flex flex-1 flex-col">
            <ul role="list" className="flex flex-1 flex-col gap-y-7">
              <li>
                <ul role="list" className="-mx-2 space-y-1">
                  {menuItems.map((item) => (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className={`group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold transition-colors ${
                          pathname === item.href
                            ? 'bg-purple-50 text-purple-700'
                            : 'text-gray-700 hover:text-purple-700 hover:bg-gray-50'
                        }`}
                      >
                        <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-sm font-medium ${
                          pathname === item.href
                            ? 'bg-purple-600 text-white'
                            : 'text-gray-400 group-hover:text-purple-600'
                        }`}>
                          {item.icon}
                        </span>
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </li>
            </ul>
          </nav>
        </div>
      </div>

      {/* 모바일/태블릿 사이드바 - 오버레이 방식 */}
      <div className={`fixed inset-y-0 left-0 z-50 w-56 bg-white border-r border-gray-200 transform transition-transform duration-300 xl:hidden ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex h-full flex-col">
          <div className="flex h-16 items-center justify-between px-4 border-b border-gray-200">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-purple-600 rounded flex items-center justify-center scale-75">
                <span className="text-white font-bold text-xs">M</span>
              </div>
              <div>
                <h1 className="text-sm font-semibold text-gray-900">마스터</h1>
                <p className="text-xs text-gray-500">사이트 관리자</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
              aria-label="메뉴 닫기"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <nav className="flex-1 px-4 py-4">
            <ul className="space-y-2">
              {menuItems.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    onClick={onClose}
                    className={`group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold transition-colors ${
                      pathname === item.href
                        ? 'bg-purple-50 text-purple-700'
                        : 'text-gray-700 hover:text-purple-700 hover:bg-gray-50'
                    }`}
                  >
                    <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded text-xs font-medium scale-75 ${
                      pathname === item.href
                        ? 'bg-purple-600 text-white'
                        : 'text-gray-400 group-hover:text-purple-600'
                    }`}>
                      {item.icon}
                    </span>
                    <span className="text-xs">{item.name}</span>
                  </Link>
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
