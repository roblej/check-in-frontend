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
    // 사이드바가 펼쳐져 있을 때만 접기
    if (sidebarOpen) {
      setSidebarOpen(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 사이드바 */}
      <MasterSidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)}
        onToggle={handleSidebarToggle}
      />
      
      {/* 메인 콘텐츠 영역 */}
      <div 
        className={`transition-all duration-300 ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-24'}`}
        onClick={handleMainAreaClick}
      >
        {/* 헤더 */}
        <MasterHeader 
          onMenuClick={handleSidebarToggle}
        />
        
        {/* 페이지 콘텐츠 */}
        <main className="p-6">
          {children}
        </main>
      </div>
      
    </div>
  );
};

export default MasterLayout;

