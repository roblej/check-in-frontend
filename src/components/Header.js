'use client';

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useCustomerStore } from "@/stores/customerStore";
import { useAdminStore } from "@/stores/adminStore";
import { deleteAdminIdxCookie } from "@/utils/cookieUtils";
import axios from "@/lib/axios";
const Header = () => {
  const router = useRouter();
  const { resetAccessToken, setInlogged, readAccessToken, verifyTokenWithBackend, isInlogged } = useCustomerStore();
  const { resetAdminData } = useAdminStore();
  const logout_url = "/login/logout";
  
  // Hydration 오류 방지를 위한 상태
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
  }, []);
  

  const handleLogout = () => {
    // 고객 스토어 초기화
    axios.get(logout_url,{withCredentials: true});
    resetAccessToken("");
    setInlogged(false);
    
    // 관리자 스토어 초기화 (관리자로 로그인한 경우)
    resetAdminData();
    
    // adminIdx 쿠키 삭제
    deleteAdminIdxCookie();
    
    console.log("로그아웃 완료");
  };
  const handleGetTokenInfo = () => {
    const tokenInfo = readAccessToken();
    console.log("tokenInfo", tokenInfo);
  };


   // MY 버튼 클릭 시 백엔드 토큰 검증
   const handleMyPageClick = async (e) => {
    e.preventDefault();
    
    // 클라이언트에서만 실행
    if (!isClient) return;
    
    const result = await verifyTokenWithBackend();
    
    if (result.success) {
      // 토큰 검증 성공 - 마이페이지로 이동
      router.push('/mypage');
    } else {
      // 토큰 검증 실패 - 로그인 페이지로 이동
      alert('로그인이 필요한 서비스입니다.');
      router.push('/login');
    }
  };
  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14">
          <div className="flex items-center gap-8">
            <Link href="/" className="text-2xl font-bold text-[#3B82F6] cursor-pointer hover:text-blue-600 transition-colors">
              체크인
            </Link>
            <nav className="hidden md:flex items-center gap-6">
              <Link href="/hotel-search" className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors">
                숙소
              </Link>
              <Link href="/hotel-search?diningMode=true" className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors">
                다이닝
              </Link>
              <Link href="/used" className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors">
                중고거래
              </Link>
              <Link href="/dart-game" className="text-sm font-medium text-[#3B82F6] hover:text-blue-600 transition-colors">
                여행지를 고르지 못했다면?
              </Link>
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
            {isClient && isInlogged() && (
              <button
                onClick={handleMyPageClick}
                className="bg-[#3B82F6] hover:bg-blue-600 text-white text-xs font-medium px-4 py-2 rounded-lg transition-colors"
              >
                MY
              </button>
            )}
            <Link href= {isClient && isInlogged() ? "/" : "/login"} onClick={isClient && isInlogged() ? handleLogout : ""} className="text-xs text-gray-600 hover:text-gray-900 px-3 py-1.5 rounded hover:bg-gray-100 transition-colors">
              {isClient && isInlogged() ? "로그아웃" : "로그인"}
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
