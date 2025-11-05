'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import MasterLayout from '@/components/master/MasterLayout';
import Pagination from '@/components/Pagination';
import { CheckCircle, X, Clock } from 'lucide-react';
import axiosInstance from '@/lib/axios';

const HotelApproval = () => {
  const router = useRouter();
  
  const api_url = "/master/hotelApproval";

  const [hotelRequestList, setHotelRequestList] = useState([]);
  const [hotelRequestCount, setHotelRequestCount] = useState(0);
  const [selectedRequests, setSelectedRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [todayApprovedCount, setTodayApprovedCount] = useState(0);
  const [todayRejectedCount, setTodayRejectedCount] = useState(0);
  
  // Pagination 상태 추가
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [pageSize, setPageSize] = useState(5);

  // API에서 호텔 승인 요청 데이터 가져오기
  const getData = async (page = currentPage, size = pageSize) => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`${api_url}?page=${page}&size=${size}`);
      
      if (response.data.content) {
        setHotelRequestList(response.data.content);
        setHotelRequestCount(response.data.totalElements || 0);
        setTotalPages(response.data.totalPages || 0);
        setCurrentPage(response.data.number || 0);
        setTodayApprovedCount(response.data.todayApprovedCount || 0);
        setTodayRejectedCount(response.data.todayRejectedCount || 0);
      } else {
        setHotelRequestList(response.data || []);
        setHotelRequestCount(response.data.length || 0);
        setTotalPages(1);
        setCurrentPage(0);
        setTodayApprovedCount(0);
        setTodayRejectedCount(0);
      }
    } catch (error) {
      console.error('API 호출 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getData();
  }, []);

  // 페이지 변경 핸들러
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    getData(newPage, pageSize);
  };

  const handleSelectRequest = (registrationIdx) => {
    setSelectedRequests(prev => 
      prev.includes(registrationIdx) 
        ? prev.filter(id => id !== registrationIdx)
        : [...prev, registrationIdx]
    );
  };

  const handleSelectAll = () => {
    if (selectedRequests.length === hotelRequestList.length) {
      setSelectedRequests([]);
    } else {
      setSelectedRequests(hotelRequestList.map(request => request.registrationIdx));
    }
  };

  const handleBulkApproval = async (action) => {
    if (selectedRequests.length === 0) {
      alert('승인 요청을 선택해주세요.');
      return;
    }
    
    try {
      const apiEndpoint = action === 'approve' ? '/master/approveHotel' : '/master/rejectHotel';
      const promises = selectedRequests.map(registrationIdx => 
        axiosInstance.post(apiEndpoint, { registrationIdx })
      );
      
      const responses = await Promise.all(promises);
      const successCount = responses.filter(response => response.data.success).length;
      
      if (successCount === selectedRequests.length) {
        alert(`${successCount}개 요청이 ${action === 'approve' ? '승인' : '거부'}되었습니다.`);
      } else {
        alert(`${successCount}/${selectedRequests.length}개 요청이 처리되었습니다.`);
      }
      
      // 데이터 새로고침
      getData();
    } catch (error) {
      console.error('일괄 처리 오류:', error);
      alert('일괄 처리 중 오류가 발생했습니다.');
    }
    
    setSelectedRequests([]);
  };

  const handleApproval = async (registrationIdx, action) => {
    try {
      const apiEndpoint = action === 'approve' ? '/master/approveHotel' : '/master/rejectHotel';
      const response = await axiosInstance.post(apiEndpoint, {
        registrationIdx: registrationIdx
      });

      if (response.data.success) {
        alert(response.data.message);
        // 데이터 새로고침
        getData();
      } else {
        alert('오류: ' + response.data.message);
      }
    } catch (error) {
      console.error('API 호출 오류:', error);
      alert('서버 오류가 발생했습니다.');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending':
        return '승인 대기';
      case 'approved':
        return '승인됨';
      case 'rejected':
        return '거부됨';
      default:
        return '알 수 없음';
    }
  };

  if (loading) {
    return (
      <MasterLayout>
        <div className="flex justify-center items-center h-64">
          <div className="text-lg text-gray-600">승인 요청 데이터를 불러오는 중...</div>
        </div>
      </MasterLayout>
    );
  }

  return (
    <MasterLayout>
      <div className="space-y-6">
        {/* 페이지 헤더 */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-lg sm:text-2xl font-bold text-gray-900">호텔 승인 관리</h2>
            <p className="text-sm sm:text-base text-gray-600">새로 등록 요청한 호텔을 검토하고 승인하세요</p>
          </div>
          <div className="text-sm text-gray-500">
            
          </div>
        </div>

        {/* 통계 카드 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
          <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 p-4 lg:p-6 rounded-lg shadow-sm border border-yellow-200">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xl lg:text-2xl font-bold text-yellow-900">
                 {hotelRequestCount}
                </div>
                <div className="text-sm text-yellow-700">승인 요청</div>
              </div>
              <div className="w-8 h-8 lg:w-12 lg:h-12 bg-yellow-500 rounded-full flex items-center justify-center">
                <Clock className="text-white w-4 h-4 lg:w-6 lg:h-6" />
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 lg:p-6 rounded-lg shadow-sm border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xl lg:text-2xl font-bold text-green-900">
                  {todayApprovedCount}
                </div>
                <div className="text-sm text-green-700">오늘 승인됨</div>
              </div>
              <div className="w-8 h-8 lg:w-12 lg:h-12 bg-green-500 rounded-full flex items-center justify-center">
                <CheckCircle className="text-white w-4 h-4 lg:w-6 lg:h-6" />
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-r from-red-50 to-red-100 p-4 lg:p-6 rounded-lg shadow-sm border border-red-200">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xl lg:text-2xl font-bold text-red-900">
                  {todayRejectedCount}
                </div>
                <div className="text-sm text-red-700">오늘 거부됨</div>
              </div>
              <div className="w-8 h-8 lg:w-12 lg:h-12 bg-red-500 rounded-full flex items-center justify-center">
                <X className="text-white w-4 h-4 lg:w-6 lg:h-6" />
              </div>
            </div>
          </div>
        </div>

        {/* 일괄 작업 버튼 */}
        {selectedRequests.length > 0 && (
          <div className="bg-purple-50 p-2 sm:p-4 rounded-lg border border-purple-200">
            <div className="flex items-center justify-between">
              <span className="text-xs sm:text-sm text-purple-700">
                {selectedRequests.length}개 요청이 선택됨
              </span>
              <div className="flex gap-1 sm:gap-2">
                <button
                  onClick={() => handleBulkApproval('approve')}
                  className="px-2 sm:px-3 py-0.5 sm:py-1 text-xs sm:text-sm bg-green-600 text-white rounded hover:bg-green-700"
                >
                  일괄 승인
                </button>
                <button
                  onClick={() => handleBulkApproval('reject')}
                  className="px-2 sm:px-3 py-0.5 sm:py-1 text-xs sm:text-sm bg-red-600 text-white rounded hover:bg-red-700"
                >
                  일괄 거부
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 승인 요청 목록 - 데스크톱 테이블 */}
        <div className="hidden sm:block bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedRequests.length === hotelRequestList.length && hotelRequestList.length > 0}
                      onChange={handleSelectAll}
                      className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-96">
                    호텔 정보
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-80">
                    사업자 정보
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-64">
                    신청 정보
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-40">
                    상태
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-64">
                    액션
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {hotelRequestList.map((request) => (
                  <tr key={request.registrationIdx} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedRequests.includes(request.registrationIdx)}
                        onChange={() => handleSelectRequest(request.registrationIdx)}
                        className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                      />
                    </td>
                    <td className="px-6 py-4 w-120">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{request.hotelInfo?.title || '정보 없음'}</div>
                        <div className="text-sm text-gray-500">{request.hotelInfo?.adress || '주소 정보 없음'}</div>
                        <div className="text-sm text-gray-500">객실 {request.hotelInfo?.rooms || 0}개</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 w-80">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{request.admin?.name || '정보 없음'}</div>
                        <div className="text-sm text-gray-500">{request.admin?.email || '이메일 정보 없음'}</div>
                        <div className="text-sm text-gray-500">{request.admin?.phone || '전화번호 정보 없음'}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 w-64">
                      <div>
                        <div className="text-sm text-gray-900">신청일: {request.regiDate ? new Date(request.regiDate).toLocaleDateString('ko-KR') : '정보 없음'}</div>
                        <div className="text-sm text-gray-500">요청 ID: {request.admin.id}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 w-40">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(request.status === 0 ? 'pending' : request.status === 1 ? 'approved' : request.status === 2 ? 'approved' : 'rejected')}`}>
                        {getStatusText(request.status === 0 ? 'pending' : request.status === 1 ? 'approved' : request.status === 2 ? 'approved' : 'rejected')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium w-64">
                      <div className="flex flex-wrap gap-2">
                        <button 
                          onClick={() => router.push(`/master/hotel-approval-detail/${request.registrationIdx}`)}
                          className="text-[#7C3AED] hover:text-purple-800 px-2 py-1 rounded hover:bg-purple-50 transition-colors"
                        >
                          상세보기
                        </button>
                        <button 
                          onClick={() => handleApproval(request.registrationIdx, 'reject')}
                          className="text-red-600 hover:text-red-800 px-2 py-1 rounded hover:bg-red-50 transition-colors"
                        >
                          거부
                        </button>
                        <button 
                          onClick={() => handleApproval(request.registrationIdx, 'approve')}
                          className="text-green-600 hover:text-green-800 px-2 py-1 rounded hover:bg-green-50 transition-colors"
                        >
                          승인
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 승인 요청 목록 - 모바일 카드 형태 */}
        <div className="sm:hidden space-y-3">
          {hotelRequestList.map((request) => (
            <div key={request.registrationIdx} className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={selectedRequests.includes(request.registrationIdx)}
                    onChange={() => handleSelectRequest(request.registrationIdx)}
                    className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                  />
                  <div>
                    <div className="text-xs font-medium text-gray-900">{request.hotelInfo?.title || '정보 없음'}</div>
                    <div className="text-xs text-gray-500">{request.admin?.adminName || '정보 없음'}</div>
                  </div>
                </div>
                <span className={`inline-flex px-1.5 py-0.5 text-xs font-semibold rounded-full ${getStatusColor(request.status === 0 ? 'pending' : request.status === 1 ? 'approved' : request.status === 2 ? 'approved' : 'rejected')}`}>
                  {getStatusText(request.status === 0 ? 'pending' : request.status === 1 ? 'approved' : request.status === 2 ? 'approved' : 'rejected')}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <div className="text-xs text-gray-500">
                  객실 {request.hotelInfo?.rooms || 0}개
                </div>
                <div className="flex gap-1">
                  <button 
                    onClick={() => router.push(`/master/hotel-approval-detail/${request.registrationIdx}`)}
                    className="text-[#7C3AED] hover:text-purple-800 text-xs"
                  >
                    상세
                  </button>
                  <button 
                    onClick={() => handleApproval(request.registrationIdx, 'reject')}
                    className="text-red-600 hover:text-red-800 text-xs"
                  >
                    거부
                  </button>
                  <button 
                    onClick={() => handleApproval(request.registrationIdx, 'approve')}
                    className="text-green-600 hover:text-green-800 text-xs"
                  >
                    승인
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-8">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalElements={hotelRequestCount}
              pageSize={pageSize}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </div>
    </MasterLayout>
  );
};

export default HotelApproval;
