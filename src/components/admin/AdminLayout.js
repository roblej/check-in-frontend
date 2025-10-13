'use client';

import { useState } from 'react';
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';

const AdminLayout = ({ children, currentPage }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleSidebarToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleMainAreaClick = () => {
    // 모바일에서만 사이드바 닫기
    if (sidebarOpen && window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 사이드바 */}
      <AdminSidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)}
        onToggle={handleSidebarToggle}
      />
      
      {/* 메인 콘텐츠 영역 - 반응형 레이아웃 */}
      <div 
        className="xl:ml-64"
        onClick={handleMainAreaClick}
      >
        {/* 헤더 */}
        <AdminHeader 
          onMenuClick={handleSidebarToggle}
        />
        
        {/* 페이지 콘텐츠 */}
        <main className="p-3 sm:p-6 max-w-full overflow-hidden">
          <div className="max-w-7xl">
            {children}
          </div>
        </main>
      </div>
      
    </div>
  );
};

export default AdminLayout;
