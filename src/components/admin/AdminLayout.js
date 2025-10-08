'use client';

import { useState } from 'react';
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';

const AdminLayout = ({ children, currentPage }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleSidebarToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 사이드바 */}
      <AdminSidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)}
        onToggle={handleSidebarToggle}
      />
      
      {/* 메인 콘텐츠 영역 */}
      <div className={`transition-all duration-300 ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-24'}`}>
        {/* 헤더 */}
        <AdminHeader 
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

export default AdminLayout;
