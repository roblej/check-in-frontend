'use client';

import { useEffect, useState } from 'react';
import MasterLayout from '@/components/master/MasterLayout';
import Pagination from '@/components/Pagination';
import { Building2, Bed, Calendar, DollarSign, Star } from 'lucide-react';

const HotelManagement = () => {
  const api_url = "/api/master/hotels";
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedHotels, setSelectedHotels] = useState([]);
  const [hotels, setHotels] = useState([]);
  const [hotelCount, setHotelCount] = useState(0);
  const [loading, setLoading] = useState(true);
  
  // Pagination 상태 추가
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [pageSize, setPageSize] = useState(5);

  // API에서 호텔 데이터 가져오기
  const getData = async (page = currentPage, size = pageSize) => {
    try {
      setLoading(true);
      console.log('=== API 호출 시작 ===');
      console.log('API URL:', api_url);
      console.log('Page:', page, 'Size:', size);
      
      const response = await fetch(`${api_url}?page=${page}&size=${size}`, {
        cache: 'no-store', // SSR을 위해 캐시 비활성화
      });
      
      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);
      
      if (response.ok) {
        const data = await response.json();
        console.log('=== API 응답 데이터 ===');
        console.log('전체 응답:', data);
        console.log('호텔 목록 개수:', data.content ? data.content.length : 'content 없음');
        console.log('총 호텔 수:', data.totalElements || 'totalElements 없음');
        console.log('현재 페이지:', data.number || 'number 없음');
        console.log('전체 페이지 수:', data.totalPages || 'totalPages 없음');
        
        if (data.content) {
          // DTO 데이터를 프론트엔드 형식으로 변환
          const transformedHotels = data.content.map(hotel => ({
            contentId: hotel.contentId,
            title: hotel.title,
            adress: hotel.adress,
            tel: hotel.tel,
            status: hotel.status,
            imageUrl: hotel.imageUrl,
            rooms: hotel.hotelDetail?.roomcount || '0',
            adminName: hotel.admin?.adminName || '',
            adminEmail: hotel.admin?.adminEmail || '',
            adminPhone: hotel.admin?.adminPhone || '',
            originalData: hotel
          }));
          
          console.log('=== 변환된 호텔 데이터 ===');
          console.log('변환된 호텔 목록:', transformedHotels);
          
          setHotels(transformedHotels);
          setHotelCount(data.totalElements || 0);
          setTotalPages(data.totalPages || 0);
          setCurrentPage(data.number || 0);
        } else {
          console.log('content가 없습니다. 원본 데이터 사용');
          setHotels(data.hotelList || []);
          setHotelCount(data.hotelCount || 0);
          setTotalPages(1);
          setCurrentPage(0);
        }
      } else {
        console.error('API 응답 실패:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('=== API 호출 오류 ===');
      console.error('Error:', error);
    } finally {
      setLoading(false);
      console.log('=== API 호출 완료 ===');
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

  const getStatusColor = (status) => {
    switch (status) {
      case 0:
        return 'bg-green-100 text-green-800';
      case 1:
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 0:
        return '운영중';
      case 1:
        return '운영종료';
      default:
        return '알 수 없음';
    }
  };

  const filteredHotels = hotels.filter(hotel => {
    const matchesSearch = hotel.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         hotel.adminName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         hotel.adress.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && hotel.status === 1) ||
                         (statusFilter === 'inactive' && hotel.status === 0);
    return matchesSearch && matchesStatus;
  });

  const handleSelectHotel = (contentId ) => {
    setSelectedHotels(prev => 
      prev.includes(contentId ) 
        ? prev.filter(id => id !== contentId )
        : [...prev, contentId ]
    );
  };

  const handleSelectAll = () => {
    if (selectedHotels.length === filteredHotels.length) {
      setSelectedHotels([]);
    } else {
      setSelectedHotels(filteredHotels.map(hotel => hotel.contentId));
    }
  };

  const handleBulkAction = (action) => {
    if (selectedHotels.length === 0) {
      alert('호텔을 선택해주세요.');
      return;
    }
    
    switch (action) {
      case 'activate':
        alert(`${selectedHotels.length}개 호텔을 활성화했습니다.`);
        break;
      case 'deactivate':
        alert(`${selectedHotels.length}개 호텔을 비활성화했습니다.`);
        break;
      case 'suspend':
        alert(`${selectedHotels.length}개 호텔을 정지했습니다.`);
        break;
      default:
        break;
    }
    setSelectedHotels([]);
  };

  if (loading) {
    return (
      <MasterLayout>
        <div className="flex justify-center items-center h-64">
          <div className="text-lg text-gray-600">호텔 데이터를 불러오는 중...</div>
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
            <h2 className="text-lg sm:text-2xl font-bold text-gray-900">호텔 관리</h2>
            <p className="text-sm sm:text-base text-gray-600">등록된 호텔을 관리하고 모니터링하세요</p>
          </div>
          <button className="bg-[#7C3AED] text-white px-2 sm:px-4 py-1 sm:py-2 rounded-lg hover:bg-purple-700 transition-colors text-xs sm:text-sm">
            호텔 등록
          </button>
        </div>

        {/* 검색 및 필터 */}
        <div className="bg-white p-3 sm:p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="호텔명, 사업자명, 위치로 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-2 sm:px-4 py-1 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-xs sm:text-sm"
              />
            </div>
            <div className="sm:w-48">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-2 sm:px-4 py-1 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-xs sm:text-sm"
              >
                <option value="all">모든 상태</option>
                <option value="active">운영중</option>
                <option value="inactive">비활성</option>
                <option value="suspended">정지됨</option>
              </select>
            </div>
          </div>
        </div>

        {/* 일괄 작업 버튼 */}
        {selectedHotels.length > 0 && (
          <div className="bg-purple-50 p-2 sm:p-4 rounded-lg border border-purple-200">
            <div className="flex items-center justify-between">
              <span className="text-xs sm:text-sm text-purple-700">
                {selectedHotels.length}개 호텔이 선택됨
              </span>
              <div className="flex gap-1 sm:gap-2">
                <button
                  onClick={() => handleBulkAction('activate')}
                  className="px-2 sm:px-3 py-0.5 sm:py-1 text-xs sm:text-sm bg-green-600 text-white rounded hover:bg-green-700"
                >
                  활성화
                </button>
                <button
                  onClick={() => handleBulkAction('deactivate')}
                  className="px-2 sm:px-3 py-0.5 sm:py-1 text-xs sm:text-sm bg-gray-600 text-white rounded hover:bg-gray-700"
                >
                  비활성화
                </button>
                <button
                  onClick={() => handleBulkAction('suspend')}
                  className="px-2 sm:px-3 py-0.5 sm:py-1 text-xs sm:text-sm bg-red-600 text-white rounded hover:bg-red-700"
                >
                  정지
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 호텔 목록 - 데스크톱 테이블 */}
        <div className="hidden sm:block bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedHotels.length === filteredHotels.length && filteredHotels.length > 0}
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
                    운영 현황
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-56">
                    수익 정보
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
                {filteredHotels.map((hotel) => (
                  <tr key={hotel.contentId} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedHotels.includes(hotel.contentId)}
                        onChange={() => handleSelectHotel(hotel.contentId)}
                        className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                      />
                    </td>
                    <td className="px-6 py-4 w-120">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{hotel.title}</div>
                        <div className="text-sm text-gray-500">{hotel.adress}</div>
                        <div className="text-sm text-gray-500">객실 {hotel.rooms}개</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 w-80">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{hotel.adminName}</div>
                        <div className="text-sm text-gray-500">{hotel.adminEmail}</div>
                        <div className="text-sm text-gray-500">{hotel.adminPhone}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 w-64">
                      <div>
                        <div className="text-sm text-gray-900">예약 정보 없음</div>
                        <div className="text-sm text-gray-500">등록일: 정보 없음</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 w-56">
                      <div className="text-sm font-medium text-gray-900">정보 없음</div>
                      <div className="text-sm text-gray-500">월 매출</div>
                    </td>
                    <td className="px-6 py-4 w-40">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(hotel.status)}`}>
                        {getStatusText(hotel.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium w-64">
                      <div className="flex flex-wrap gap-2">
                        <button className="text-[#7C3AED] hover:text-purple-800 px-2 py-1 rounded hover:bg-purple-50 transition-colors">
                          상세보기
                        </button>
                        <button className="text-green-600 hover:text-green-800 px-2 py-1 rounded hover:bg-green-50 transition-colors">
                          수정
                        </button>
                        <button className="text-red-600 hover:text-red-800 px-2 py-1 rounded hover:bg-red-50 transition-colors">
                          정지
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 호텔 목록 - 모바일 카드 형태 */}
        <div className="sm:hidden space-y-3">
          {filteredHotels.map((hotel) => (
            <div key={hotel.contentId} className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={selectedHotels.includes(hotel.contentId)}
                    onChange={() => handleSelectHotel(hotel.contentId)}
                    className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                  />
                  <div>
                    <div className="text-xs font-medium text-gray-900">{hotel.title}</div>
                    <div className="text-xs text-gray-500">{hotel.adminName}</div>
                  </div>
                </div>
                <span className={`inline-flex px-1.5 py-0.5 text-xs font-semibold rounded-full ${getStatusColor(hotel.status)}`}>
                  {getStatusText(hotel.status)}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <div className="text-xs text-gray-500">
                  객실 {hotel.rooms}개
                </div>
                <div className="flex gap-1">
                  <button className="text-[#7C3AED] hover:text-purple-800 text-xs">
                    상세
                  </button>
                  <button className="text-red-600 hover:text-red-800 text-xs">
                    정지
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>


        {/* 통계 요약 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 lg:p-6 rounded-lg shadow-sm border border-purple-200">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xl lg:text-2xl font-bold text-purple-900">
                  {hotels && hotels.length > 0 ? hotels.filter(h => h && h.status === 1).length : 0}
                </div>
                <div className="text-sm text-purple-700">운영중인 호텔</div>
              </div>
              <div className="w-8 h-8 lg:w-12 lg:h-12 bg-purple-500 rounded-full flex items-center justify-center">
                <Building2 className="text-white w-4 h-4 lg:w-6 lg:h-6" />
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 lg:p-6 rounded-lg shadow-sm border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xl lg:text-2xl font-bold text-blue-900">
                  {hotels && hotels.length > 0 
                    ? hotels.reduce((sum, h) => {
                        const rooms = h && h.rooms ? parseInt(h.rooms) : 0;
                        return sum + (isNaN(rooms) ? 0 : rooms);
                      }, 0)
                    : 0
                  }
                </div>
                <div className="text-sm text-blue-700">총 객실 수</div>
              </div>
              <div className="w-8 h-8 lg:w-12 lg:h-12 bg-blue-500 rounded-full flex items-center justify-center">
                <Bed className="text-white w-4 h-4 lg:w-6 lg:h-6" />
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 lg:p-6 rounded-lg shadow-sm border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xl lg:text-2xl font-bold text-green-900">{hotelCount || 0}</div>
                <div className="text-sm text-green-700">총 호텔 수</div>
              </div>
              <div className="w-8 h-8 lg:w-12 lg:h-12 bg-green-500 rounded-full flex items-center justify-center">
                <Calendar className="text-white w-4 h-4 lg:w-6 lg:h-6" />
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-r from-orange-50 to-orange-100 p-4 lg:p-6 rounded-lg shadow-sm border border-orange-200">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xl lg:text-2xl font-bold text-orange-900">
                  {hotels && hotels.length > 0 ? hotels.filter(h => h && h.status === 0).length : 0}
                </div>
                <div className="text-sm text-orange-700">비활성 호텔</div>
              </div>
              <div className="w-8 h-8 lg:w-12 lg:h-12 bg-orange-500 rounded-full flex items-center justify-center">
                <DollarSign className="text-white w-4 h-4 lg:w-6 lg:h-6" />
              </div>
            </div>
          </div>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-8">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalElements={hotelCount}
              pageSize={pageSize}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </div>
    </MasterLayout>
  );
};

export default HotelManagement;

