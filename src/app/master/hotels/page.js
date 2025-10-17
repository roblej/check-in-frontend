'use client';

import { useEffect, useState } from 'react';
import MasterLayout from '@/components/master/MasterLayout';
import { Building2, Bed, Calendar, DollarSign, Star } from 'lucide-react';
import axios from 'axios';

const HotelManagement = () => {
  const api_url = "/api/master/hotels";
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedHotels, setSelectedHotels] = useState([]);
  const [hotels, setHotels] = useState([]);
  const [hotelCount, setHotelCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // API에서 호텔 데이터 가져오기
  const getData = () => {
    axios.get(api_url).then(res => {
      if (res.data.hotelList) {
        console.log('Hotel Data:', res.data.hotelList);
        setHotels(res.data.hotelList);
        setHotelCount(res.data.hotelCount);
        setLoading(false);
      }
    }).catch(error => {
      console.error('Error fetching hotel data:', error);
      setLoading(false);
    });
  };

  useEffect(() => {
    getData();
  }, []);

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

  const handleSelectHotel = (hotelId) => {
    setSelectedHotels(prev => 
      prev.includes(hotelId) 
        ? prev.filter(id => id !== hotelId)
        : [...prev, hotelId]
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
      case 'message':
        alert(`${selectedHotels.length}개 호텔에 메시지를 전송합니다.`);
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
                <button
                  onClick={() => handleBulkAction('message')}
                  className="px-2 sm:px-3 py-0.5 sm:py-1 text-xs sm:text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  메시지 전송
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
                        <button className="text-blue-600 hover:text-blue-800 px-2 py-1 rounded hover:bg-blue-50 transition-colors">
                          메시지
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
                  객실 {hotel.rooms}
                </div>
                <div className="flex gap-1">
                  <button className="text-[#7C3AED] hover:text-purple-800 text-xs">
                    상세
                  </button>
                  <button className="text-blue-600 hover:text-blue-800 text-xs">
                    메시지
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
      </div>
    </MasterLayout>
  );
};

export default HotelManagement;

