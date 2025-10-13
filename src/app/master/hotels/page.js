'use client';

import { useState } from 'react';
import MasterLayout from '@/components/master/MasterLayout';

const HotelManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedHotels, setSelectedHotels] = useState([]);

  // 호텔 목록 데이터 (축소)
  const hotels = [
    {
      id: 'H001',
      name: '서울 그랜드 호텔',
      owner: '김호텔',
      email: 'grand@hotel.com',
      phone: '02-1234-5678',
      location: '서울 강남구 테헤란로 123',
      rooms: 45,
      rating: 4.5,
      registeredDate: '2024-01-10',
      status: 'active',
      totalReservations: 1250,
      monthlyRevenue: '₩45,000,000'
    },
    {
      id: 'H002',
      name: '부산 오션뷰 리조트',
      owner: '이바다',
      email: 'ocean@resort.com',
      phone: '051-9876-5432',
      location: '부산 해운대구 해운대해변로 456',
      rooms: 120,
      rating: 4.8,
      registeredDate: '2024-01-05',
      status: 'active',
      totalReservations: 2100,
      monthlyRevenue: '₩89,000,000'
    },
    {
      id: 'H003',
      name: '제주 힐링 펜션',
      owner: '박제주',
      email: 'healing@jeju.com',
      phone: '064-1111-2222',
      location: '제주 서귀포시 중문관광로 789',
      rooms: 12,
      rating: 4.2,
      registeredDate: '2024-01-08',
      status: 'inactive',
      totalReservations: 340,
      monthlyRevenue: '₩8,500,000'
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      case 'suspended':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'active':
        return '운영중';
      case 'inactive':
        return '비활성';
      case 'suspended':
        return '정지됨';
      default:
        return '알 수 없음';
    }
  };

  const filteredHotels = hotels.filter(hotel => {
    const matchesSearch = hotel.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         hotel.owner.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         hotel.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || hotel.status === statusFilter;
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
      setSelectedHotels(filteredHotels.map(hotel => hotel.id));
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
            <table className="w-full divide-y divide-gray-200">
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    호텔 정보
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    사업자 정보
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    운영 현황
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    수익 정보
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    상태
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    액션
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredHotels.map((hotel) => (
                  <tr key={hotel.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedHotels.includes(hotel.id)}
                        onChange={() => handleSelectHotel(hotel.id)}
                        className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{hotel.name}</div>
                        <div className="text-sm text-gray-500">{hotel.location}</div>
                        <div className="text-sm text-gray-500">객실 {hotel.rooms}개 • ⭐ {hotel.rating}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{hotel.owner}</div>
                        <div className="text-sm text-gray-500">{hotel.email}</div>
                        <div className="text-sm text-gray-500">{hotel.phone}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm text-gray-900">예약 {hotel.totalReservations}건</div>
                        <div className="text-sm text-gray-500">등록일: {hotel.registeredDate}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{hotel.monthlyRevenue}</div>
                      <div className="text-sm text-gray-500">월 매출</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(hotel.status)}`}>
                        {getStatusText(hotel.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium space-y-1">
                      <div className="flex flex-col gap-1">
                        <button className="text-[#7C3AED] hover:text-purple-800 text-left">
                          상세보기
                        </button>
                        <button className="text-blue-600 hover:text-blue-800 text-left">
                          메시지 전송
                        </button>
                        <button className="text-green-600 hover:text-green-800 text-left">
                          수정
                        </button>
                        <button className="text-red-600 hover:text-red-800 text-left">
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
            <div key={hotel.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={selectedHotels.includes(hotel.id)}
                    onChange={() => handleSelectHotel(hotel.id)}
                    className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                  />
                  <div>
                    <div className="text-xs font-medium text-gray-900">{hotel.name}</div>
                    <div className="text-xs text-gray-500">{hotel.owner}</div>
                  </div>
                </div>
                <span className={`inline-flex px-1.5 py-0.5 text-xs font-semibold rounded-full ${getStatusColor(hotel.status)}`}>
                  {getStatusText(hotel.status)}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <div className="text-xs text-gray-500">
                  {hotel.monthlyRevenue} • 예약 {hotel.totalReservations}건
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

        {/* 통계 요약 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="text-2xl font-bold text-gray-900">{hotels.filter(h => h.status === 'active').length}</div>
            <div className="text-sm text-gray-600">운영중인 호텔</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="text-2xl font-bold text-gray-900">{hotels.reduce((sum, h) => sum + h.rooms, 0)}</div>
            <div className="text-sm text-gray-600">총 객실 수</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="text-2xl font-bold text-gray-900">{hotels.reduce((sum, h) => sum + h.totalReservations, 0).toLocaleString()}</div>
            <div className="text-sm text-gray-600">총 예약 건수</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="text-2xl font-bold text-gray-900">₩170억</div>
            <div className="text-sm text-gray-600">총 월 매출</div>
          </div>
        </div>
      </div>
    </MasterLayout>
  );
};

export default HotelManagement;

