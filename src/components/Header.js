'use client';

import Link from "next/link";
import { useCustomerStore } from "@/stores/customerStore";
const Header = () => {
  const { inlogged, resetAccessToken, setInlogged, readAccessToken } = useCustomerStore();
  

  const handleLogout = () => {
    resetAccessToken("");
    setInlogged(false);
    console.log("inlogged", inlogged);
  };
  const handleGetTokenInfo = () => {
    const tokenInfo = readAccessToken();
    console.log("tokenInfo", tokenInfo);
  };
  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14">
          <div className="flex items-center gap-8">
            <Link href="/" className="text-2xl font-bold text-[#3B82F6] cursor-pointer hover:text-blue-600 transition-colors">
              체크인
            </Link>
            <nav className="hidden md:flex items-center gap-6">
              <Link href="" onClick={handleGetTokenInfo} className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors">
                뭐넣지
              </Link>
              <a href="/admin" className="text-sm font-semibold text-[#3B82F6] hover:text-blue-600 transition-colors">
                관리자
              </a>
              <a href="/master" className="text-sm font-semibold text-[#7C3AED] hover:text-purple-600 transition-colors">
                마스터
              </a>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <button className="text-xs text-gray-600 hover:text-gray-900 px-3 py-1.5 rounded hover:bg-gray-100 transition-colors">
              <Link href="/center" className="text-sm font-semibold text-[#3B82F6] hover:text-blue-600 transition-colors">
                고객센터
              </Link>
            </button>
            <button className="text-xs text-gray-600 hover:text-gray-900 px-3 py-1.5 rounded hover:bg-gray-100 transition-colors">
              공유하기
            </button>
            <a href="/mypage" className="bg-[#3B82F6] hover:bg-blue-600 text-white text-xs font-medium px-4 py-2 rounded-lg transition-colors">
              MY
            </a>
            <Link href= {inlogged ? "/" : "/login"} onClick={inlogged ? handleLogout : ""} className="text-xs text-gray-600 hover:text-gray-900 px-3 py-1.5 rounded hover:bg-gray-100 transition-colors">
              {inlogged ? "로그아웃" : "로그인"} 
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
