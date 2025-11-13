'use client';

import { useState, useEffect, useRef } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import axiosInstance from '@/lib/axios';

const CheckinPage = () => {
    
  const api_url = "/admin/checkinPendingList";

  /* 체크인 처리하는 API */
  const checkinApi_url = "/admin/checkin";
  
  const checkInData = async (orderIdx) => {
    setLoading(true);
    try {
      const dto = {
        orderIdx: orderIdx,
        inTime: new Date().toISOString()
      };
      
      const response = await axiosInstance.post(checkinApi_url, dto);
      if (response.data.success) {
        alert(response.data.message);
      } else {
        alert(response.data.message);
      }
      getData();
    } catch (error) {
      console.error('체크인 처리 오류:', error);
      alert('체크인 처리 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const [searchTerm, setSearchTerm] = useState('');
  const [checkinList, setCheckinList] = useState([]);
  const [filteredList, setFilteredList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  const didFetch = useRef(false);
  const lastFetchedPageRef = useRef(null);

  function getData(page = currentPage, size = pageSize){
    axiosInstance.get(api_url, {
      params: {
        page: page,
        size: size
      }
    }).then(res => {
      console.log(res.data);
      setCheckinList(res.data.content || []);
      setTotalPages(res.data.totalPages || 0);
      setTotalElements(res.data.totalElements || 0);
    });
  }
  
  useEffect(() => {
    if (didFetch.current && lastFetchedPageRef.current === currentPage) return;
    didFetch.current = true;
    lastFetchedPageRef.current = currentPage;
    
    getData(currentPage, pageSize);
  }, [currentPage]);



  // 검색 필터링 (클라이언트 측 필터링은 제거하고 서버 측 페이징 사용)
  useEffect(() => {
    setFilteredList(checkinList);
  }, [checkinList]);

  // 검색 버튼 클릭 핸들러
  const handleSearch = () => {
    setCurrentPage(0);
    getData(0, pageSize);
  };

  // 페이지 변경 핸들러
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const handleCheckin = async (orderIdx) => {
    if (!confirm('체크인을 처리하시겠습니까?')) return;

    

    checkInData(orderIdx);
    
    // 성공 후 목록 새로고침
    getData(currentPage, pageSize);
  };

  // 새로고침
  const fetchData = () => {
    getData(currentPage, pageSize);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* 페이지 헤더 */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900">체크인 관리</h2>
          <p className="text-gray-600">체크인을 기다리는 고객들의 체크인을 처리하세요</p>
        </div>

        {/* 검색 및 새로고침 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex gap-4 items-center">
            <div className="flex-1">
              <input
                type="text"
                placeholder="예약번호, 고객명, 객실번호로 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSearch();
                  }
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <button
              onClick={handleSearch}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              검색
            </button>
            <button
              onClick={fetchData}
              className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
            >
              새로고침
            </button>
          </div>
        </div>

        {/* 체크인 목록 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">체크인 대기 목록</h3>
            <p className="text-sm text-gray-600">
              총 {totalElements}건의 체크인 대기 예약이 있습니다.
            </p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    예약번호
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    고객명
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    연락처
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    객실
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    체크인 예정일
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    투숙객 수
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    액션
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                      로딩 중...
                    </td>
                  </tr>
                ) : filteredList.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                      {searchTerm ? '검색 결과가 없습니다.' : '체크인 대기 중인 예약이 없습니다.'}
                    </td>
                  </tr>
                ) : (
                  filteredList.map((reservation, index) => {
                    // orderNum에서 마지막 부분만 추출 (예: hotel_142851-3490_98k9sa6d4 -> 98k9sa6d4)
                    const getOrderNumber = (orderNum) => {
                      if (!orderNum) return '-';
                      const parts = orderNum.split('_');
                      return parts.length > 1 ? parts[parts.length - 1] : orderNum;
                    };

                    return (
                    <tr key={reservation.orderIdx} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {getOrderNumber(reservation.roomReservation?.orderNum)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {reservation.customer?.name || '정보 없음'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {reservation.customer?.phone || '정보 없음'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {reservation.roomName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {reservation.roomReservation.checkinDate}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {reservation.roomReservation.guest}명
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button 
                          onClick={() => handleCheckin(reservation.orderIdx)}
                          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                        >
                          체크인 처리
                        </button>
                      </td>
                    </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* 페이지네이션 */}
        {totalPages > 1 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                총 {totalElements}건 중 {currentPage * pageSize + 1}-{Math.min((currentPage + 1) * pageSize, totalElements)}건 표시
              </div>
              <div className="flex space-x-2">
                <button 
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 0}
                  className={`px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 ${currentPage === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  이전
                </button>
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i;
                  } else if (currentPage < 3) {
                    pageNum = i;
                  } else if (currentPage > totalPages - 4) {
                    pageNum = totalPages - 5 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  return (
                    <button 
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`px-3 py-1 text-sm border border-gray-300 rounded ${
                        currentPage === pageNum ? 'bg-[#3B82F6] text-white' : 'hover:bg-gray-50'
                      }`}
                    >
                      {pageNum + 1}
                    </button>
                  );
                })}
                <button 
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage >= totalPages - 1}
                  className={`px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 ${currentPage >= totalPages - 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  다음
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default CheckinPage;
