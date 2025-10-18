'use client';

import MasterLayout from '@/components/master/MasterLayout';
import axios from 'axios';
import { ChartColumn, Hotel, Users, MessageCircleMore, LayoutDashboard, Settings, CalendarCheck, CircleDollarSign } from 'lucide-react';
import { useEffect, useState } from 'react';

const MasterDashboard = () => {

  const api_url = "/api/master/dashboard";

  const [list, setList] = useState([]);
  const [hotelCount, setHotelCount] = useState("불러오는중...");
  const [customerList, setCustomerList] = useState([]);
  const [customerCount, setCustomerCount] = useState("불러오는중...");
  const [paymentAmount, setPaymentAmount] = useState("불러오는중...");

  const [hotelRequestList, setHotelRequestList] = useState([]);
  const [hotelRequestCount, setHotelRequestCount] = useState("불러오는중...");
  const [newCustomers, setNewCustomers] = useState([]);
  const [newCustomersCount, setNewCustomersCount] = useState("불러오는중...");

  function getData(){
    axios.get(api_url).then(res => {
      if(res.data.hotelList){
        setList(res.data.hotelList);
        setHotelCount(res.data.hotelCount);
      }
      if(res.data.customerList){
        setCustomerList(res.data.customerList);
        setCustomerCount(res.data.customerCount);
      }
      if(res.data.paymentAmount){
        setPnaymetAmount(res.data.paymentAmount);
      }
      if(res.data.newCustomers){
        console.log('New Customers Data:', res.data.newCustomers);
        setNewCustomers(res.data.newCustomers);
        setNewCustomersCount(res.data.newCustomersCount);
      }
      if(res.data.hotelRequestList){
        setHotelRequestList(res.data.hotelRequestList);
        setHotelRequestCount(res.data.hotelRequestCount);
      }
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
      value: '1,248',
      change: '+12%',
      changeType: 'positive',
      icon: <CalendarCheck size={40} />
    },
    {
      title: '총 매출',
      value: '₩'+`${paymentAmount}`,
      change: '+18%',
      changeType: 'positive',
      icon: <CircleDollarSign size={40} />
    }
  ];

  // 최근 회원 가입 (축소)
  const recentMembers = [
    {
      id: 'M001',
      name: '김고객',
      email: 'customer1@email.com',
      joinDate: '2024-01-15',
      reservations: 3,
      status: 'active'
    },
    {
      id: 'M002',
      name: '이여행',
      email: 'travel2@email.com',
      joinDate: '2024-01-15',
      reservations: 0,
      status: 'active'
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
                <p className="text-xs sm:text-sm text-gray-600">승인 대기중인 호텔 등록 요청 {hotelRequestCount}건</p>
              </div>
              <button className="text-[#7C3AED] hover:text-purple-800 text-xs sm:text-sm font-medium">
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
                  <tr key={request.contentId} className="hover:bg-gray-50">
                    <td className="px-2 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm font-medium text-gray-900">
                      {request.title}
                    </td>
                    <td className="px-2 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900">
                      {request.ownerName}
                    </td>
                    <td className="px-2 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900">
                      {request.adress}
                    </td>
                    <td className="px-2 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900">
                      {request.rooms}개
                    </td>
                    <td className="px-2 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900">
                      {request.requestDate}
                    </td>
                    <td className="px-2 sm:px-6 py-2 sm:py-4 whitespace-nowrap">
                      <span className={`inline-flex px-1 sm:px-2 py-0.5 sm:py-1 text-xs font-semibold rounded-full ${getStatusColor(request.status)}`}>
                        {request.status === 0 ? '승인요청' : '승인됨'}
                      </span>
                    </td>
                    <td className="px-2 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm font-medium space-x-1 sm:space-x-2">
                      <button className="text-[#7C3AED] hover:text-purple-800">
                        검토
                      </button>
                      <button className="text-green-600 hover:text-green-800">
                        승인
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 최근 회원 가입 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">최근 회원 가입</h3>
                <p className="text-sm text-gray-600">새로 가입한 회원 목록 {newCustomersCount}명</p>
              </div>
              <button className="text-[#7C3AED] hover:text-purple-800 text-sm font-medium">
                전체 보기
              </button>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    회원명
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    이메일
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    가입일
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    누적금액
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
                {newCustomers.map((member) => (
                  <tr key={member.customerIdx} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {member.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {member.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {member.joinDate ? new Date(member.joinDate).toLocaleDateString('ko-KR') : '정보 없음'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {member.totalPrice || 0}원
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(member.status === 1 ? 'active' : 'inactive')}`}>
                        {getStatusText(member.status === 1 ? 'active' : 'inactive')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button className="text-[#7C3AED] hover:text-purple-800">
                        상세보기
                      </button>
                      <button className="text-blue-600 hover:text-blue-800">
                        메시지
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 빠른 액션 버튼들 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-6">
            <h3 className="text-sm sm:text-lg font-semibold text-gray-900 mb-2 sm:mb-4">호텔 승인 관리</h3>
            <p className="text-xs sm:text-sm text-gray-600 mb-2 sm:mb-4">대기중인 호텔 등록을 승인하세요</p>
            <button className="w-full bg-[#7C3AED] text-white py-1.5 sm:py-2 px-3 sm:px-4 rounded-lg hover:bg-purple-700 transition-colors text-xs sm:text-sm">
              승인 관리
            </button>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-6">
            <h3 className="text-sm sm:text-lg font-semibold text-gray-900 mb-2 sm:mb-4">회원 관리</h3>
            <p className="text-xs sm:text-sm text-gray-600 mb-2 sm:mb-4">회원 정보를 관리하세요</p>
            <button className="w-full bg-green-600 text-white py-1.5 sm:py-2 px-3 sm:px-4 rounded-lg hover:bg-green-700 transition-colors text-xs sm:text-sm">
              회원 관리
            </button>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-6">
            <h3 className="text-sm sm:text-lg font-semibold text-gray-900 mb-2 sm:mb-4">메시지 전송</h3>
            <p className="text-xs sm:text-sm text-gray-600 mb-2 sm:mb-4">호텔/회원에게 메시지를 전송하세요</p>
            <button className="w-full bg-blue-600 text-white py-1.5 sm:py-2 px-3 sm:px-4 rounded-lg hover:bg-blue-700 transition-colors text-xs sm:text-sm">
              메시지 전송
            </button>
          </div>
        </div>
      </div>
    </MasterLayout>
  );
};

export default MasterDashboard;

