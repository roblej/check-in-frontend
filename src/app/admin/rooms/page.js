'use client';

import { useEffect, useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { CheckCircle, Building2, Sparkles, Wrench, HelpCircle, Home, DollarSign } from 'lucide-react';
import axios from 'axios';

const RoomsPage = () => {

  const api_url = "/api/admin/roomList";

  const [selectedTab, setSelectedTab] = useState('status');
  const [selectedFloor, setSelectedFloor] = useState('all');
  const [roomList, setRoomList] = useState([]);

  function getData(){
    axios.get(api_url).then(res => {
      console.log(res.data);
      setRoomList(res.data);
    });
  }

  useEffect(() => {
    getData();
  }, []);

  // 객실 데이터
  const rooms = [
    { number: '101', floor: 1, type: '스탠다드룸', status: 'occupied', guest: '김철수', checkOut: '2024-01-17', price: '₩150,000' },
    { number: '102', floor: 1, type: '스탠다드룸', status: 'available', guest: null, checkOut: null, price: '₩150,000' },
    { number: '103', floor: 1, type: '스탠다드룸', status: 'cleaning', guest: null, checkOut: null, price: '₩150,000' },
    { number: '201', floor: 2, type: '디럭스룸', status: 'available', guest: null, checkOut: null, price: '₩250,000' },
    { number: '202', floor: 2, type: '디럭스룸', status: 'occupied', guest: '이영희', checkOut: '2024-01-16', price: '₩250,000' },
    { number: '203', floor: 2, type: '디럭스룸', status: 'maintenance', guest: null, checkOut: null, price: '₩250,000' },
    { number: '301', floor: 3, type: '스위트룸', status: 'occupied', guest: '박민수', checkOut: '2024-01-18', price: '₩400,000' },
    { number: '302', floor: 3, type: '스위트룸', status: 'available', guest: null, checkOut: null, price: '₩400,000' },
    { number: '401', floor: 4, type: '프레지덴셜룸', status: 'available', guest: null, checkOut: null, price: '₩600,000' },
    { number: '402', floor: 4, type: '프레지덴셜룸', status: 'occupied', guest: '최지영', checkOut: '2024-01-19', price: '₩600,000' }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800';
      case 'occupied':
        return 'bg-blue-100 text-blue-800';
      case 'cleaning':
        return 'bg-yellow-100 text-yellow-800';
      case 'maintenance':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'available':
        return '이용가능';
      case 'occupied':
        return '투숙중';
      case 'cleaning':
        return '청소중';
      case 'maintenance':
        return '점검중';
      default:
        return '알 수 없음';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'available':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'occupied':
        return <Building2 className="w-5 h-5 text-blue-600" />;
      case 'cleaning':
        return <Sparkles className="w-5 h-5 text-yellow-600" />;
      case 'maintenance':
        return <Wrench className="w-5 h-5 text-red-600" />;
      default:
        return <HelpCircle className="w-5 h-5 text-gray-600" />;
    }
  };

  const filteredRooms = selectedFloor === 'all' 
    ? rooms 
    : rooms.filter(room => room.floor === parseInt(selectedFloor));

  const floors = [...new Set(rooms.map(room => room.floor))].sort();

  const tabs = [
    { id: 'status', name: '객실 현황', icon: <Building2 size={20} /> },
    { id: 'pricing', name: '가격 설정', icon: <DollarSign size={20} /> },
    { id: 'types', name: '객실 타입', icon: <Home size={20} /> }
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* 페이지 헤더 */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900">객실 관리</h2>
          <p className="text-gray-600">객실 현황을 확인하고 상태를 관리하세요</p>
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

        {/* 필터 및 액션 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            {/* 층별 필터 */}
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium text-gray-700">층별 보기:</label>
              <select
                value={selectedFloor}
                onChange={(e) => setSelectedFloor(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent"
              >
                <option value="all">전체</option>
                {floors.map(floor => (
                  <option key={floor} value={floor}>{floor}층</option>
                ))}
              </select>
            </div>

            {/* 액션 버튼들 */}
            <div className="flex gap-2">
              <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
                청소 완료
              </button>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                상태 변경
              </button>
              <button className="bg-[#3B82F6] text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors">
                새 객실 추가
              </button>
            </div>
          </div>
        </div>

        {/* 객실 현황 그리드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {roomList.map((room) => (
            <div key={room.roomIdx} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
              {/* 객실 번호 및 상태 */}
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-gray-900">{room.name}</h3>
                <span className="text-2xl">{getStatusIcon(room.roomIdx)}</span>
              </div>

              {/* 객실 정보 */}
              <div className="space-y-2 mb-4">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">타입:</span>
                  <span className="text-sm font-medium text-gray-900">{room.type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">가격:</span>
                  <span className="text-sm font-medium text-gray-900">{room.basePrice}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">상태:</span>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(room.status)}`}>
                    {getStatusText(room.roomCount)}
                  </span>
                </div>
              </div>

              {/* 투숙객 정보 */}
              {room.guest && (
                <div className="border-t border-gray-200 pt-3 mb-4">
                  <div className="text-sm text-gray-600 mb-1">투숙객</div>
                  <div className="text-sm font-medium text-gray-900">{room.guest}</div>
                  <div className="text-xs text-gray-500">체크아웃: {room.checkOut}</div>
                </div>
              )}

              {/* 액션 버튼들 */}
              <div className="flex gap-2">
                <button className="flex-1 bg-gray-100 text-gray-700 py-2 px-3 rounded text-sm hover:bg-gray-200 transition-colors">
                  상세보기
                </button>
                <button className="flex-1 bg-[#3B82F6] text-white py-2 px-3 rounded text-sm hover:bg-blue-600 transition-colors">
                  관리
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* 객실 상태 통계 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center">
              <div className="text-green-600 mr-3"><CheckCircle size={24} /></div>
              <div>
                <div className="text-sm text-gray-600">이용가능</div>
                <div className="text-xl font-bold text-green-600">
                  {rooms.filter(room => room.status === 'available').length}
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center">
              <div className="text-blue-600 mr-3"><Building2 size={24} /></div>
              <div>
                <div className="text-sm text-gray-600">투숙중</div>
                <div className="text-xl font-bold text-blue-600">
                  {rooms.filter(room => room.status === 'occupied').length}
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center">
              <div className="text-yellow-600 mr-3"><Sparkles size={24} /></div>
              <div>
                <div className="text-sm text-gray-600">청소중</div>
                <div className="text-xl font-bold text-yellow-600">
                  {rooms.filter(room => room.status === 'cleaning').length}
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center">
              <div className="text-red-600 mr-3"><Wrench size={24} /></div>
              <div>
                <div className="text-sm text-gray-600">점검중</div>
                <div className="text-xl font-bold text-red-600">
                  {rooms.filter(room => room.status === 'maintenance').length}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default RoomsPage;
