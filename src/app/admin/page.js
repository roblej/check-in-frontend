'use client';

import AdminLayout from '@/components/admin/AdminLayout';
import axios from 'axios';
import { Building2, LogOut, Calendar, DollarSign, Users, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useCustomerStore } from '@/stores/customerStore';
import { useAdminStore } from '@/stores/adminStore';
import { getAdminIdxFromCookie } from '@/utils/cookieUtils';
import { hotelAPI } from '@/lib/api/hotel';

const AdminDashboard = () => {
  const router = useRouter();
  const { readAccessToken, isInlogged } = useCustomerStore();
  const { getContentId, isLoggedIn: isAdminLoggedIn, fetchContentIdByAdminIdx } = useAdminStore();
  
  const api_url = "/api/admin/dashboard";

  const [todayCheckinCount, setTodayCheckinCount] = useState(0); // 오늘 체크인 수
  const [todayCheckoutCount, setTodayCheckoutCount] = useState(0); // 오늘 체크아웃 수
  const [reservationCount, setReservationCount] = useState(0); // 예약 확정 수
  const [thisMonthSales, setThisMonthSales] = useState(0); // 이번달 매출
  const [roomReservationList, setRoomReservationList] = useState([]); // 최근 예약 목록
  const [isLoading, setIsLoading] = useState(true); // 로딩 상태

  // 호텔 정보 확인 및 대시보드 데이터 로드
  const checkHotelAndLoadData = useCallback(async () => {
    try {
      // 로그인 상태 확인
      if (!isInlogged()) {
        router.push('/login');
        return;
      }

      // zustand에서 저장된 contentId 가져오기
      let contentId = getContentId();

      // contentId가 없으면 쿠키에서 adminIdx를 확인하고 contentId를 가져오기
      if (!contentId) {
        const adminIdxFromCookie = getAdminIdxFromCookie();
        
        if (adminIdxFromCookie) {
          console.log('쿠키에서 adminIdx 발견:', adminIdxFromCookie);
          contentId = await fetchContentIdByAdminIdx(parseInt(adminIdxFromCookie));
          
          if (contentId) {
            console.log('contentId 복구 성공:', contentId);
          }
        }
      }

      if (!contentId) {
        console.log('contentId가 없습니다. 호텔을 등록해주세요.');
        router.push('/hotel/register');
        return;
      }


      // contentId로 대시보드 데이터 로드
      await loadDashboardData(contentId);
      
    } catch (error) {
      console.error('초기화 실패:', error);
      router.push('/login');
    } finally {
      setIsLoading(false);
    }
  }, [isInlogged, router, getContentId, fetchContentIdByAdminIdx]);

  // 대시보드 데이터 로드
  const loadDashboardData = async (contentId) => {
    try {
      const response = await axios.get(`${api_url}?contentId=${contentId}`);
      console.log(response.data);
      setTodayCheckinCount(response.data.todayCheckinCount);
      setTodayCheckoutCount(response.data.todayCheckoutCount);
      setReservationCount(response.data.reservationCount);
      setThisMonthSales(response.data.thisMonthSales);
      setRoomReservationList(response.data.roomReservationList);
    } catch (error) {
      console.error('대시보드 데이터 로드 실패:', error);
    }
  };

  useEffect(() => {
    checkHotelAndLoadData();
  }, [checkHotelAndLoadData]);

  // 통계 데이터
  const stats = [
    {
      title: '오늘 체크인',
      value: `${todayCheckinCount}`,
      change: '+12%',
      changeType: 'positive',
      icon: <Building2 size={40} />
    },
    {
      title: '오늘 체크아웃',
      value: `${todayCheckoutCount}`,
      change: '+8%',
      changeType: 'positive',
      icon: <LogOut size={40} />
    },
    {
      title: '예약 대기',
      value: `${reservationCount}`,
      change: '+23%',
      changeType: 'positive',
      icon: <Calendar size={40} />
    },
    {
      title: '오늘 매출',
      value: `₩${thisMonthSales}`,
      change: '+15%',
      changeType: 'positive',
      icon: <DollarSign size={40} />
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
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 1:
        return '확정';
      case 2:
        return '체크인';
      case 0:
        return '대기';
      default:
        return '알 수 없음';
    }
  };

  // 로딩 중일 때 표시
  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">호텔 정보를 확인하고 있습니다...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* 페이지 헤더 */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900">대시보드</h2>
          <p className="text-gray-600">
            호텔 운영 현황을 한눈에 확인하세요
          </p>
        </div>

        {/* 통계 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                </div>
                <div className="text-blue-600">{stat.icon}</div>
              </div>
              <div className="mt-4 flex items-center">
                <span className={`text-sm font-medium ${
                  stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {stat.change}
                </span>
                <span className="text-sm text-gray-500 ml-1">전일 대비</span>
              </div>
            </div>
          ))}
        </div>

        {/* 최근 예약 현황 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">최근 예약 현황</h3>
            <p className="text-sm text-gray-600">오늘의 예약 및 체크인 현황</p>
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
                    객실타입
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    체크인
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    체크아웃
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {reservation.customer.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {reservation.room.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {reservation.checkinDate}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {reservation.checkOut}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(reservation.status)}`}>
                        {getStatusText(reservation.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {reservation.room.basePrice}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button className="text-[#3B82F6] hover:text-blue-800">
                        상세보기
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 빠른 액션 버튼들 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">빠른 체크인</h3>
            <p className="text-sm text-gray-600 mb-4">예약된 고객의 체크인을 처리하세요</p>
            <button className="w-full bg-[#3B82F6] text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors">
              체크인 처리
            </button>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">새 예약 등록</h3>
            <p className="text-sm text-gray-600 mb-4">직접 예약을 등록하세요</p>
            <button className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors">
              예약 등록
            </button>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">객실 상태 관리</h3>
            <p className="text-sm text-gray-600 mb-4">객실 상태를 업데이트하세요</p>
            <button className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors">
              객실 관리
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;

