'use client';

import { useState } from 'react';
import MasterSidebar from './MasterSidebar';
import MasterHeader from './MasterHeader';

const MasterLayout = ({ children, currentPage }) => {
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
    <div className="h-screen bg-gray-50 flex overflow-hidden master-layout">
      {/* 사이드바 */}
      <MasterSidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)}
        onToggle={handleSidebarToggle}
      />
      
      {/* 메인 콘텐츠 영역 - 반응형 레이아웃 */}
      <div 
        className="flex-1 flex flex-col h-screen xl:ml-72"
        onClick={handleMainAreaClick}
      >
        {/* 헤더 */}
        <MasterHeader 
          onMenuClick={handleSidebarToggle}
        />
        
        {/* 페이지 콘텐츠 */}
        <main className="flex-1 p-3 sm:p-6 overflow-y-auto">
          <div className="w-full">
            {children}
          </div>
        </main>
      </div>
      
    </div>
  );
};

export default MasterLayout;

