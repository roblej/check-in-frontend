'use client';

import MasterLayout from '@/components/master/MasterLayout';
import axiosInstance from '@/lib/axios';
import { ChartColumn, Hotel, Users, LayoutDashboard, Settings, CalendarCheck, CircleDollarSign } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const MasterDashboard = () => {

  const api_url = "/master/dashboard";
  const router = useRouter();

  const [hotelCount, setHotelCount] = useState("불러오는중...");
  const [pendingCount, setPendingCount] = useState("불러오는중...");
  const [customerCount, setCustomerCount] = useState("불러오는중...");
  const [paymentAmount, setPaymentAmount] = useState("불러오는중...");

  // 매출 포맷팅 함수
  const formatCurrency = (value) => {
    if (value === "불러오는중..." || value === "오류") {
      return value;
    }
    if (typeof value === 'number' || typeof value === 'string') {
      const numValue = typeof value === 'string' ? parseFloat(value) : value;
      if (isNaN(numValue)) return '0';
      return numValue.toLocaleString('ko-KR');
    }
    return '0';
  };

  const [hotelRequestList, setHotelRequestList] = useState([]);
  const [hotelRequestCount, setHotelRequestCount] = useState("불러오는중...");
  const [newCustomers, setNewCustomers] = useState([]);

  function getData(){
    axiosInstance.get(api_url).then(res => {
      if(res.data.hotelCount !== undefined){
        setHotelCount(res.data.hotelCount);
      }
      if(res.data.pendingCount !== undefined){
        setPendingCount(res.data.pendingCount);
      }
      if(res.data.customerCount !== undefined){
        setCustomerCount(res.data.customerCount);
      }
      if(res.data.paymentAmount !== undefined){
        setPaymentAmount(res.data.paymentAmount);
      }
      if(res.data.newCustomers){
        setNewCustomers(res.data.newCustomers);
      }
      if(res.data.pendingRequests){
        setHotelRequestList(res.data.pendingRequests);
      }
      if(res.data.pendingRequestCount !== undefined){
        setHotelRequestCount(res.data.pendingRequestCount);
      }
    }).catch(error => {
      console.error('Dashboard API Error:', error);
      setHotelCount('오류');
      setCustomerCount('오류');
      setPaymentAmount('오류');
    });
  }

  useEffect(() => {
    getData();
  }, []);
  
  // 사이트 통계 데이터
  const siteStats = [
    {
      title: '등록된 호텔',
      value: `${hotelCount}`,
      change: '+8',
      changeType: 'positive',
      icon: <Hotel size={40} />
    },
    {
      title: '총 회원수',
      value: `${customerCount}`,
      change: '+234',
      changeType: 'positive',
      icon: <Users size={40} />
    },
    {
      title: '오늘 예약',
      value: `${pendingCount}`,
      change: '+12%',
      changeType: 'positive',
      icon: <CalendarCheck size={40} />
    },
    {
      title: '총 매출',
      value: `₩${formatCurrency(paymentAmount)}`,
      change: '+18%',
      changeType: 'positive',
      icon: <CircleDollarSign size={40} />
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'review':
        return 'bg-blue-100 text-blue-800';
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'approved':
        return '승인됨';
      case 'pending':
        return '대기중';
      case 'review':
        return '검토중';
      case 'active':
        return '활성';
      case 'inactive':
        return '비활성';
      default:
        return '알 수 없음';
    }
  };

  return (
    <MasterLayout>
      <div className="space-y-6">
        {/* 페이지 헤더 */}
        <div>
          <h2 className="text-lg sm:text-2xl font-bold text-gray-900">사이트 대시보드</h2>
          <p className="text-sm sm:text-base text-gray-600">체크인 사이트 전체 현황을 한눈에 확인하세요</p>
        </div>

        {/* 통계 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {siteStats.map((stat, index) => (
            <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-lg sm:text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                </div>
                <div className="text-2xl sm:text-3xl">{stat.icon}</div>
              </div>
              <div className="mt-2 sm:mt-4 flex items-center">
                <span className={`text-xs sm:text-sm font-medium ${
                  stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {stat.change}
                </span>
                <span className="text-xs sm:text-sm text-gray-500 ml-1">전일 대비</span>
              </div>
            </div>
          ))}
        </div>

        {/* 최근 호텔 등록 요청 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-3 sm:px-6 py-2 sm:py-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-sm sm:text-lg font-semibold text-gray-900">최근 호텔 등록 요청</h3>
                <p className="text-xs sm:text-sm text-gray-600">승인 대기중인 호텔 등록 요청 {hotelRequestCount}건 (가장 먼저 요청을 한 호텔 5개만 보여집니다)</p>
              </div>
              <button 
                onClick={() => router.push('/master/hotel-approval')}
                className="text-[#7C3AED] hover:text-purple-800 text-xs sm:text-sm font-medium"
              >
                전체 보기
              </button>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-2 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    호텔명
                  </th>
                  <th className="px-2 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    사업자
                  </th>
                  <th className="px-2 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    위치
                  </th>
                  <th className="px-2 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    객실수
                  </th>
                  <th className="px-2 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    신청일
                  </th>
                  <th className="px-2 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    상태
                  </th>
                  <th className="px-2 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    액션
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {hotelRequestList.map((request) => (
                  <tr key={request.registrationIdx} className="hover:bg-gray-50">
                    <td className="px-2 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm font-medium text-gray-900">
                      {request.hotelInfo?.title || '-'}
                    </td>
                    <td className="px-2 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900">
                      {request.admin?.adminName || '-'}
                    </td>
                    <td className="px-2 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900">
                      {request.hotelInfo?.adress || '-'}
                    </td>
                    <td className="px-2 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900">
                      {request.hotelInfo?.rooms || 0}개
                    </td>
                    <td className="px-2 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900">
                      {request.regiDate ? new Date(request.regiDate).toLocaleDateString('ko-KR') : '정보 없음'}
                    </td>
                    <td className="px-2 sm:px-6 py-2 sm:py-4 whitespace-nowrap">
                      <span className={`inline-flex px-1 sm:px-2 py-0.5 sm:py-1 text-xs font-semibold rounded-full ${getStatusColor(request.status === 0 ? 'pending' : 'approved')}`}>
                        {request.status === 0 ? '승인요청' : '승인됨'}
                      </span>
                    </td>
                    <td className="px-2 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm font-medium space-x-1 sm:space-x-2">
                      <button 
                        className="text-[#7C3AED] hover:text-purple-800"
                        onClick={() => router.push(`/master/hotel-approval-detail/${request.registrationIdx}`)}
                      >
                        검토
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 빠른 액션 버튼들 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-6">
            <h3 className="text-sm sm:text-lg font-semibold text-gray-900 mb-2 sm:mb-4">호텔 목록</h3>
            <p className="text-xs sm:text-sm text-gray-600 mb-2 sm:mb-4">등록된 호텔 목록을 확인하세요</p>
            <button 
              onClick={() => router.push('/master/hotels')}
              className="w-full bg-[#7C3AED] text-white py-1.5 sm:py-2 px-3 sm:px-4 rounded-lg hover:bg-purple-700 transition-colors text-xs sm:text-sm"
            >
              호텔 목록
            </button>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-6">
            <h3 className="text-sm sm:text-lg font-semibold text-gray-900 mb-2 sm:mb-4">회원 관리</h3>
            <p className="text-xs sm:text-sm text-gray-600 mb-2 sm:mb-4">회원 정보를 관리하세요</p>
            <button 
              onClick={() => router.push('/master/members')}
              className="w-full bg-green-600 text-white py-1.5 sm:py-2 px-3 sm:px-4 rounded-lg hover:bg-green-700 transition-colors text-xs sm:text-sm"
            >
              회원 관리
            </button>
          </div>
          
        </div>
      </div>
    </MasterLayout>
  );
};

export default MasterDashboard;

