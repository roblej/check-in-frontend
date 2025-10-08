'use client';

import { useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';

const ReservationsPage = () => {
  const [selectedTab, setSelectedTab] = useState('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // 예약 데이터
  const reservations = [
    {
      id: 'R001',
      guestName: '김철수',
      guestPhone: '010-1234-5678',
      roomNumber: '301',
      roomType: '스위트룸',
      checkIn: '2024-01-15',
      checkOut: '2024-01-17',
      guests: 2,
      status: 'confirmed',
      amount: '₩450,000',
      paymentStatus: 'paid',
      createdAt: '2024-01-10'
    },
    {
      id: 'R002',
      guestName: '이영희',
      guestPhone: '010-2345-6789',
      roomNumber: '205',
      roomType: '디럭스룸',
      checkIn: '2024-01-15',
      checkOut: '2024-01-16',
      guests: 1,
      status: 'checked-in',
      amount: '₩280,000',
      paymentStatus: 'paid',
      createdAt: '2024-01-12'
    },
    {
      id: 'R003',
      guestName: '박민수',
      guestPhone: '010-3456-7890',
      roomNumber: '102',
      roomType: '스탠다드룸',
      checkIn: '2024-01-16',
      checkOut: '2024-01-18',
      guests: 3,
      status: 'pending',
      amount: '₩320,000',
      paymentStatus: 'pending',
      createdAt: '2024-01-14'
    },
    {
      id: 'R004',
      guestName: '최지영',
      guestPhone: '010-4567-8901',
      roomNumber: '401',
      roomType: '스위트룸',
      checkIn: '2024-01-17',
      checkOut: '2024-01-19',
      guests: 2,
      status: 'cancelled',
      amount: '₩500,000',
      paymentStatus: 'refunded',
      createdAt: '2024-01-13'
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'checked-in':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'confirmed':
        return '확정';
      case 'checked-in':
        return '체크인';
      case 'pending':
        return '대기';
      case 'cancelled':
        return '취소';
      default:
        return '알 수 없음';
    }
  };

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'refunded':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusText = (status) => {
    switch (status) {
      case 'paid':
        return '결제완료';
      case 'pending':
        return '결제대기';
      case 'refunded':
        return '환불완료';
      default:
        return '알 수 없음';
    }
  };

  const filteredReservations = reservations.filter(reservation => {
    const matchesSearch = reservation.guestName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         reservation.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         reservation.roomNumber.includes(searchTerm);
    const matchesStatus = statusFilter === 'all' || reservation.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const tabs = [
    { id: 'list', name: '예약 목록', icon: '📋' },
    { id: 'calendar', name: '예약 캘린더', icon: '📅' },
    { id: 'checkin', name: '체크인 관리', icon: '🏨' }
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* 페이지 헤더 */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900">예약 관리</h2>
          <p className="text-gray-600">호텔 예약 현황을 관리하고 체크인/체크아웃을 처리하세요</p>
        </div>

        {/* 탭 네비게이션 */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  selectedTab === tab.id
                    ? 'border-[#3B82F6] text-[#3B82F6]'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* 검색 및 필터 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* 검색 */}
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                검색
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="고객명, 예약번호, 객실번호로 검색..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent"
              />
            </div>

            {/* 상태 필터 */}
            <div className="sm:w-48">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                상태 필터
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent"
              >
                <option value="all">전체</option>
                <option value="pending">대기</option>
                <option value="confirmed">확정</option>
                <option value="checked-in">체크인</option>
                <option value="cancelled">취소</option>
              </select>
            </div>

            {/* 새 예약 버튼 */}
            <div className="flex items-end">
              <button className="bg-[#3B82F6] text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors">
                새 예약 등록
              </button>
            </div>
          </div>
        </div>

        {/* 예약 목록 테이블 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              예약 목록 ({filteredReservations.length}건)
            </h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    예약번호
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    고객정보
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    객실정보
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    숙박일정
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    상태
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    결제상태
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    금액
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    액션
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredReservations.map((reservation) => (
                  <tr key={reservation.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {reservation.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{reservation.guestName}</div>
                        <div className="text-sm text-gray-500">{reservation.guestPhone}</div>
                        <div className="text-xs text-gray-400">{reservation.guests}명</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{reservation.roomNumber}호</div>
                        <div className="text-sm text-gray-500">{reservation.roomType}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm text-gray-900">{reservation.checkIn}</div>
                        <div className="text-sm text-gray-500">~ {reservation.checkOut}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(reservation.status)}`}>
                        {getStatusText(reservation.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPaymentStatusColor(reservation.paymentStatus)}`}>
                        {getPaymentStatusText(reservation.paymentStatus)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {reservation.amount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button className="text-[#3B82F6] hover:text-blue-800">
                        상세
                      </button>
                      <button className="text-green-600 hover:text-green-800">
                        수정
                      </button>
                      <button className="text-red-600 hover:text-red-800">
                        취소
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 페이지네이션 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              총 {filteredReservations.length}건 중 1-{filteredReservations.length}건 표시
            </div>
            <div className="flex space-x-2">
              <button className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50">
                이전
              </button>
              <button className="px-3 py-1 text-sm bg-[#3B82F6] text-white rounded">
                1
              </button>
              <button className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50">
                다음
              </button>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default ReservationsPage;
