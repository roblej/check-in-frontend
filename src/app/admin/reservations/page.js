'use client';

import { useEffect, useState, useRef } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import ReservationDetailModal from '@/components/admin/ReservationDetailModal';
import { ClipboardList, Calendar, Building2 } from 'lucide-react';
import axiosInstance from '@/lib/axios';

const ReservationsPage = () => {

  const api_url = "/admin/roomReservationList";

  const [selectedTab, setSelectedTab] = useState('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [roomReservationList, setRoomReservationList] = useState([]);
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  const didFetch = useRef(false);
  const lastFetchedPageRef = useRef(null);

  useEffect(() => {
    if (didFetch.current && lastFetchedPageRef.current === currentPage) return;
    didFetch.current = true;
    lastFetchedPageRef.current = currentPage;
    
    fetchReservations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

  const fetchReservations = async () => {
    try {
      const response = await axiosInstance.get(api_url, {
        params: { 
          page: currentPage, 
          size: pageSize 
        }
      });
      
      if (response.data) {
        console.log(response.data);
        setRoomReservationList(response.data.content || []);
        setTotalPages(response.data.totalPages || 0);
        setTotalElements(response.data.totalElements || 0);
      }
    } catch (error) {
      console.error('예약 목록 조회 오류:', error);
    }
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const handleCancelReservation = async (reservationIdx) => {
    if (confirm('예약을 취소하시겠습니까?')) {
      // TODO: 예약 취소 API 호출
      console.log('예약 취소:', reservationIdx);
      alert('예약 취소 기능은 추후 구현 예정입니다.');
    }
  };

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
      case 0:
        return 'bg-green-100 text-green-800';
      case 1:
        return 'bg-blue-100 text-blue-800';
      case 2:
        return 'bg-yellow-100 text-yellow-800';
      case 3:
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 0:
        return '대기';
      case 1:
        return '확정';
      case 2:
        return '취소';
      case 4:
        return '이용완료';
      default:
        return '알 수 없음';
    }
  };



  const filteredReservations = roomReservationList.filter(reservation => {
    const matchesSearch = (reservation.customer?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (reservation.reservIdx?.toString() || '').includes(searchTerm) ||
                         (reservation.room?.name || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || reservation.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const tabs = [
    { id: 'list', name: '예약 목록', icon: <ClipboardList size={20} /> },
    { id: 'calendar', name: '예약 캘린더', icon: <Calendar size={20} /> },
    { id: 'checkin', name: '체크인 관리', icon: <Building2 size={20} /> }
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
                    금액
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    액션
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {roomReservationList.map((reservation) => (
                  <tr key={reservation.reservIdx} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {reservation.reservIdx}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{reservation.customer.name}</div>
                        <div className="text-sm text-gray-500">{reservation.customer.phone}</div>
                        <div className="text-xs text-gray-400">{reservation.guest}명</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{reservation.roomIdx}호</div>
                        <div className="text-sm text-gray-500">{reservation.room.name}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm text-gray-900">{reservation.checkinDate}</div>
                        <div className="text-sm text-gray-500">~ {reservation.checkoutDate}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(reservation.status)}`}>
                        {getStatusText(reservation.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      ₩{reservation.totalPrice?.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button 
                        onClick={() => {
                          setSelectedReservation(reservation);
                          setShowDetailModal(true);
                        }}
                        className="text-[#3B82F6] hover:text-blue-800"
                      >
                        상세보기
                      </button>
                      <button 
                        onClick={() => handleCancelReservation(reservation.reservIdx)}
                        className="text-red-600 hover:text-red-800"
                        disabled={reservation.status === 2}
                      >
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

        {/* 예약 상세 모달 */}
        {showDetailModal && (
          <ReservationDetailModal
            reservation={selectedReservation}
            onClose={() => {
              setShowDetailModal(false);
              setSelectedReservation(null);
            }}
          />
        )}
      </div>
    </AdminLayout>
  );
};

export default ReservationsPage;
