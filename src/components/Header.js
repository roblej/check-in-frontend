'use client';

const Header = () => {
  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14">
          <div className="flex items-center gap-8">
            <a href="/" className="text-2xl font-bold text-[#3B82F6] cursor-pointer hover:text-blue-600 transition-colors">
              체크인
            </a>
            <nav className="hidden md:flex items-center gap-6">
              <a href="/" className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors">
                호텔
              </a>
              <a href="/" className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors">
                모텔
              </a>
              <a href="/" className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors">
                국내전용
              </a>
              <a href="/faq" className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors">
                FAQ
              </a>
              <a href="/admin" className="text-sm font-medium text-[#3B82F6] hover:text-blue-600 transition-colors font-semibold">
                관리자
              </a>
              <a href="/master" className="text-sm font-medium text-[#7C3AED] hover:text-purple-600 transition-colors font-semibold">
                마스터
              </a>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <button className="text-xs text-gray-600 hover:text-gray-900 px-3 py-1.5 rounded hover:bg-gray-100 transition-colors">
              전체서비스
            </button>
            <button className="text-xs text-gray-600 hover:text-gray-900 px-3 py-1.5 rounded hover:bg-gray-100 transition-colors">
              공유하기
            </button>
            <button className="text-xs text-gray-600 hover:text-gray-900 px-3 py-1.5 rounded hover:bg-gray-100 transition-colors">
              로그아웃
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
