'use client';

import { useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Building2, Settings, Users } from 'lucide-react';

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState('hotel-info');

  const tabs = [
    { id: 'hotel-info', name: '호텔 정보', icon: <Building2 size={20} /> },
    { id: 'operational-settings', name: '운영 설정', icon: <Settings size={20} /> },
    { id: 'user-management', name: '사용자 관리', icon: <Users size={20} /> }
  ];

  const hotelInfo = {
    name: '체크인 호텔',
    address: '서울특별시 강남구 테헤란로 123',
    phone: '02-1234-5678',
    email: 'info@checkinhotel.com',
    website: 'www.checkinhotel.com',
    description: '편안하고 안전한 숙박을 제공하는 프리미엄 호텔입니다.',
    totalRooms: 100,
    checkInTime: '15:00',
    checkOutTime: '11:00'
  };

  const operationalSettings = {
    currency: 'KRW',
    timezone: 'Asia/Seoul',
    language: 'ko',
    taxRate: 10,
    cancellationPolicy: '24시간 전 무료 취소',
    paymentMethods: ['카드', '현금', '계좌이체'],
    amenities: ['무료 WiFi', '주차장', '수영장', '피트니스', '레스토랑']
  };

  const users = [
    { id: 'U001', name: '김관리', email: 'admin@checkinhotel.com', role: '관리자', status: 'active', lastLogin: '2024-01-15' },
    { id: 'U002', name: '이직원', email: 'staff@checkinhotel.com', role: '직원', status: 'active', lastLogin: '2024-01-14' },
    { id: 'U003', name: '박리셉션', email: 'reception@checkinhotel.com', role: '리셉션', status: 'active', lastLogin: '2024-01-15' }
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* 페이지 헤더 */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900">설정</h2>
          <p className="text-gray-600">호텔 정보와 시스템 설정을 관리하세요</p>
        </div>

        {/* 탭 네비게이션 */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
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

        {/* 호텔 정보 탭 */}
        {activeTab === 'hotel-info' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">호텔 기본 정보</h3>
              <p className="text-sm text-gray-600">호텔의 기본 정보를 수정할 수 있습니다</p>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">호텔명</label>
                  <input
                    type="text"
                    defaultValue={hotelInfo.name}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">전화번호</label>
                  <input
                    type="text"
                    defaultValue={hotelInfo.phone}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">주소</label>
                  <input
                    type="text"
                    defaultValue={hotelInfo.address}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">이메일</label>
                  <input
                    type="email"
                    defaultValue={hotelInfo.email}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">웹사이트</label>
                  <input
                    type="text"
                    defaultValue={hotelInfo.website}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">호텔 설명</label>
                  <textarea
                    rows={3}
                    defaultValue={hotelInfo.description}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">총 객실수</label>
                  <input
                    type="number"
                    defaultValue={hotelInfo.totalRooms}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">체크인 시간</label>
                  <input
                    type="time"
                    defaultValue={hotelInfo.checkInTime}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">체크아웃 시간</label>
                  <input
                    type="time"
                    defaultValue={hotelInfo.checkOutTime}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent"
                  />
                </div>
              </div>
              
              <div className="mt-6 flex justify-end">
                <button className="bg-[#3B82F6] text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors">
                  정보 저장
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 운영 설정 탭 */}
        {activeTab === 'operational-settings' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">기본 설정</h3>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">통화</label>
                    <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent">
                      <option value="KRW">한국 원 (₩)</option>
                      <option value="USD">미국 달러 ($)</option>
                      <option value="EUR">유로 (€)</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">시간대</label>
                    <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent">
                      <option value="Asia/Seoul">Asia/Seoul (KST)</option>
                      <option value="UTC">UTC</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">언어</label>
                    <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent">
                      <option value="ko">한국어</option>
                      <option value="en">English</option>
                      <option value="ja">日本語</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">세율 (%)</label>
                    <input
                      type="number"
                      defaultValue={operationalSettings.taxRate}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">취소 정책</h3>
              </div>
              
              <div className="p-6">
                <textarea
                  rows={4}
                  defaultValue={operationalSettings.cancellationPolicy}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent"
                />
              </div>
            </div>
          </div>
        )}

        {/* 사용자 관리 탭 */}
        {activeTab === 'user-management' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">사용자 관리</h3>
                <p className="text-sm text-gray-600">시스템 사용자 계정을 관리하세요</p>
              </div>
              <button className="bg-[#3B82F6] text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors">
                새 사용자 추가
              </button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      사용자ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      이름
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      이메일
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      역할
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      상태
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      최근 로그인
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      액션
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {user.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {user.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {user.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {user.role}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                          활성
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {user.lastLogin}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <button className="text-[#3B82F6] hover:text-blue-800">
                          수정
                        </button>
                        <button className="text-red-600 hover:text-red-800">
                          삭제
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default SettingsPage;
