"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { diningAPI } from "@/lib/api/dining";
import Pagination from "@/components/Pagination";

const DiningSearchClient = ({ destination, diningDate, mealType, adults }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // 페이지네이션 상태
  const urlPage = searchParams.get("page");
  const [currentPage, setCurrentPage] = useState(() => {
    const page = urlPage ? parseInt(urlPage, 10) : 0;
    return isNaN(page) || page < 0 ? 0 : page;
  });
  const pageSize = 10;
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  
  // URL에서 페이지 정보 동기화
  useEffect(() => {
    const urlPage = searchParams.get("page");
    const page = urlPage ? parseInt(urlPage, 10) : 0;
    const validPage = isNaN(page) || page < 0 ? 0 : page;
    setCurrentPage((prevPage) => {
      if (prevPage !== validPage) {
        return validPage;
      }
      return prevPage;
    });
  }, [searchParams]);
  
  console.log('다이닝 검색 파라미터:', { destination, diningDate, mealType, adults });
  
  // 검색 함수
  const searchDinings = useCallback(async (page = currentPage) => {
    if (!destination) {
      console.log('destination이 없어서 검색하지 않음');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      console.log('다이닝 검색 시작:', destination, '페이지:', page);
      
      // 다이닝 검색 (호텔 주소, 호텔 이름, 다이닝 이름으로 검색)
      const response = await diningAPI.searchDinings(destination, {
        page: page,
        size: pageSize,
        sort: 'updatedAt,desc'
      });
      
      console.log('다이닝 검색 결과:', response);
      setSearchResults(response.content || []);
      setTotalPages(response.totalPages || 0);
      setTotalElements(response.totalElements || 0);
      
    } catch (err) {
      console.error('다이닝 검색 실패:', err);
      setError('다이닝 검색 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  }, [destination, pageSize]);
  
  // 컴포넌트 마운트 시 및 destination 변경 시 검색 실행
  useEffect(() => {
    if (destination) {
      searchDinings(currentPage);
    }
  }, [destination, searchDinings, currentPage]);
  
  // 페이지 변경 핸들러
  const handlePageChange = useCallback((page) => {
    const urlParams = new URLSearchParams(searchParams.toString());
    if (page > 0) {
      urlParams.set("page", page.toString());
    } else {
      urlParams.delete("page");
    }
    router.replace(`?${urlParams.toString()}`, { scroll: false, shallow: true });
    
    // 페이지 변경 시 스크롤을 상단으로 이동
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [searchParams, router]);
  
  // 시간 포맷팅 함수
  const formatTime = (time) => {
    if (!time) return '';
    return time.substring(0, 5); // HH:MM 형식
  };
  
  // 가격 포맷팅 함수
  const formatPrice = (price) => {
    if (!price) return '0원';
    return price.toLocaleString() + '원';
  };

  // 예약하기 핸들러
  const handleReservation = (dining) => {
    const params = new URLSearchParams({
      diningIdx: dining.diningIdx,
      contentId: dining.contentid,
      diningName: dining.name,
      hotelName: dining.hotelInfo?.title || '',
      hotelAddress: dining.hotelInfo?.adress || '',
      diningDate: diningDate || new Date().toISOString().split('T')[0],
      diningTime: '', // 사용자가 예약 페이지에서 선택
      guests: adults || '2',
      basePrice: dining.basePrice,
      imageUrl: dining.imageUrl || '',
      openTime: dining.openTime || '11:00:00',
      closeTime: dining.closeTime || '21:00:00',
      slotDuration: dining.slotDuration || 60,
    });
    
    router.push(`/dining-reservation?${params.toString()}`);
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      {/* 검색 결과 헤더 */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          다이닝 검색 결과
        </h1>
        <p className="text-gray-600">
          &quot;{destination}&quot; 관련 다이닝을 찾았습니다.
        </p>
        <p className="text-sm text-gray-500 mt-1">
          호텔 주소, 호텔 이름, 다이닝 이름에서 검색됩니다.
        </p>
      </div>
      
      {/* 로딩 상태 */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      )}
      
      {/* 에러 상태 */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-800">{error}</p>
        </div>
      )}
      
      {/* 검색 결과 */}
      {!loading && !error && (
        <>
          {searchResults.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-500 text-lg mb-4">
                😔 검색 결과가 없습니다
              </div>
              <p className="text-gray-400">
                다른 검색어로 다시 시도해보세요.
              </p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {searchResults.map((dining) => (
                <div key={dining.diningIdx} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                  {/* 이미지 */}
                  <div className="w-full h-48 bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                    {dining.imageUrl ? (
                      <img
                        src={dining.imageUrl}
                        alt={dining.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div className={`${dining.imageUrl ? 'hidden' : 'flex'} flex-col items-center justify-center text-blue-600`}>
                      <svg className="w-16 h-16 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      <span className="text-sm font-medium">다이닝 이미지</span>
                    </div>
                  </div>
                  
                  {/* 다이닝 정보 */}
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {dining.name}
                    </h3>
                    
                    {/* 호텔 정보 */}
                    {dining.hotelInfo && (
                      <div className="mb-3">
                        <p className="text-sm font-medium text-blue-600">
                          {dining.hotelInfo.title}
                        </p>
                        <p className="text-xs text-gray-500">
                          {dining.hotelInfo.adress}
                        </p>
                      </div>
                    )}
                    
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {dining.description}
                    </p>
                    
                    {/* 운영 시간 */}
                    <div className="flex items-center text-sm text-gray-500 mb-2">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {formatTime(dining.openTime)} - {formatTime(dining.closeTime)}
                    </div>
                    
                    {/* 가격 */}
                    <div className="flex items-center text-sm text-gray-500 mb-2">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                      </svg>
                      {formatPrice(dining.basePrice)} / 1인
                    </div>
                    
                    {/* 좌석 수 */}
                    <div className="flex items-center text-sm text-gray-500 mb-4">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      총 {dining.totalSeats}석
                    </div>
                    
                    {/* 예약 버튼 */}
                    <button 
                      onClick={() => handleReservation(dining)}
                      className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      예약하기
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
      
      {/* 페이지네이션 */}
      {!loading && !error && totalPages > 1 && (
        <div className="mt-8">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalElements={totalElements}
            pageSize={pageSize}
            onPageChange={handlePageChange}
          />
        </div>
      )}
    </div>
  );
};

export default DiningSearchClient;
