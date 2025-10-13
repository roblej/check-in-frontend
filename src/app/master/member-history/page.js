'use client';

import { useState } from 'react';
import MasterLayout from '@/components/master/MasterLayout';

const MemberHistory = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('all');
  const [actionFilter, setActionFilter] = useState('all');

  // 회원 이력 데이터 (축소)
  const memberHistories = [
    {
      id: 'MH001',
      memberId: 'M001',
      memberName: '김고객',
      email: 'customer1@email.com',
      action: 'login',
      description: '로그인',
      timestamp: '2024-01-15 14:30:25',
      ipAddress: '192.168.1.100',
      device: 'Chrome/Windows',
      location: '서울시 강남구'
    },
    {
      id: 'MH002',
      memberId: 'M001',
      memberName: '김고객',
      email: 'customer1@email.com',
      action: 'reservation',
      description: '서울 그랜드 호텔 예약 (스위트룸)',
      timestamp: '2024-01-15 14:35:12',
      ipAddress: '192.168.1.100',
      device: 'Chrome/Windows',
      location: '서울시 강남구',
      amount: '₩450,000'
    },
    {
      id: 'MH003',
      memberId: 'M002',
      memberName: '이여행',
      email: 'travel2@email.com',
      action: 'signup',
      description: '회원가입',
      timestamp: '2024-01-14 09:15:33',
      ipAddress: '192.168.1.200',
      device: 'Safari/iPhone',
      location: '부산시 해운대구'
    }
  ];

  const getActionColor = (action) => {
    switch (action) {
      case 'signup':
        return 'bg-green-100 text-green-800';
      case 'login':
        return 'bg-blue-100 text-blue-800';
      case 'logout':
        return 'bg-gray-100 text-gray-800';
      case 'reservation':
        return 'bg-purple-100 text-purple-800';
      case 'payment':
        return 'bg-emerald-100 text-emerald-800';
      case 'cancellation':
        return 'bg-red-100 text-red-800';
      case 'profile_update':
        return 'bg-yellow-100 text-yellow-800';
      case 'review':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getActionText = (action) => {
    switch (action) {
      case 'signup':
        return '회원가입';
      case 'login':
        return '로그인';
      case 'logout':
        return '로그아웃';
      case 'reservation':
        return '예약';
      case 'payment':
        return '결제';
      case 'cancellation':
        return '취소';
      case 'profile_update':
        return '정보수정';
      case 'review':
        return '리뷰작성';
      default:
        return '기타';
    }
  };

  const getActionIcon = (action) => {
    switch (action) {
      case 'signup':
        return '👋';
      case 'login':
        return '🔑';
      case 'logout':
        return '🚪';
      case 'reservation':
        return '📅';
      case 'payment':
        return '💳';
      case 'cancellation':
        return '❌';
      case 'profile_update':
        return '✏️';
      case 'review':
        return '⭐';
      default:
        return '📋';
    }
  };

  const filteredHistories = memberHistories.filter(history => {
    const matchesSearch = history.memberName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         history.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         history.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesAction = actionFilter === 'all' || history.action === actionFilter;
    
    let matchesDate = true;
    if (dateFilter !== 'all') {
      const historyDate = new Date(history.timestamp);
      const today = new Date();
      
      switch (dateFilter) {
        case 'today':
          matchesDate = historyDate.toDateString() === today.toDateString();
          break;
        case 'week':
          const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
          matchesDate = historyDate >= weekAgo;
          break;
        case 'month':
          const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
          matchesDate = historyDate >= monthAgo;
          break;
        default:
          matchesDate = true;
      }
    }
    
    return matchesSearch && matchesAction && matchesDate;
  });

  return (
    <MasterLayout>
      <div className="space-y-6">
        {/* 페이지 헤더 */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900">회원 이력 관리</h2>
          <p className="text-gray-600">회원들의 활동 이력을 모니터링하세요</p>
        </div>

        {/* 통계 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="text-3xl mr-4">👋</div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {memberHistories.filter(h => h.action === 'signup').length}
                </p>
                <p className="text-sm text-gray-600">신규 가입</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="text-3xl mr-4">🔑</div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {memberHistories.filter(h => h.action === 'login').length}
                </p>
                <p className="text-sm text-gray-600">로그인</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="text-3xl mr-4">📅</div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {memberHistories.filter(h => h.action === 'reservation').length}
                </p>
                <p className="text-sm text-gray-600">예약</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="text-3xl mr-4">💳</div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {memberHistories.filter(h => h.action === 'payment').length}
                </p>
                <p className="text-sm text-gray-600">결제</p>
              </div>
            </div>
          </div>
        </div>

        {/* 검색 및 필터 */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <input
                type="text"
                placeholder="회원명, 이메일, 활동 내용으로 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <div>
              <select
                value={actionFilter}
                onChange={(e) => setActionFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="all">모든 활동</option>
                <option value="signup">회원가입</option>
                <option value="login">로그인</option>
                <option value="reservation">예약</option>
                <option value="payment">결제</option>
                <option value="cancellation">취소</option>
                <option value="profile_update">정보수정</option>
                <option value="review">리뷰작성</option>
              </select>
            </div>
            <div>
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="all">전체 기간</option>
                <option value="today">오늘</option>
                <option value="week">최근 7일</option>
                <option value="month">최근 30일</option>
              </select>
            </div>
          </div>
        </div>

        {/* 이력 목록 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              회원 활동 이력 ({filteredHistories.length}건)
            </h3>
          </div>
          
          <div className="divide-y divide-gray-200">
            {filteredHistories.map((history) => (
              <div key={history.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    {/* 액션 아이콘 */}
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-lg">
                        {getActionIcon(history.action)}
                      </div>
                    </div>
                    
                    {/* 이력 정보 */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-gray-900">{history.memberName}</span>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getActionColor(history.action)}`}>
                          {getActionText(history.action)}
                        </span>
                        {history.amount && (
                          <span className="text-sm font-medium text-green-600">{history.amount}</span>
                        )}
                      </div>
                      
                      <p className="text-sm text-gray-900 mb-2">{history.description}</p>
                      
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>📧 {history.email}</span>
                        <span>🌐 {history.ipAddress}</span>
                        <span>💻 {history.device}</span>
                        <span>📍 {history.location}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* 시간 정보 */}
                  <div className="flex-shrink-0 text-right">
                    <div className="text-sm text-gray-900">{history.timestamp.split(' ')[0]}</div>
                    <div className="text-xs text-gray-500">{history.timestamp.split(' ')[1]}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {filteredHistories.length === 0 && (
            <div className="p-12 text-center">
              <div className="text-gray-400 text-4xl mb-4">📋</div>
              <p className="text-gray-500">검색 조건에 맞는 이력이 없습니다.</p>
            </div>
          )}
        </div>

        {/* 페이지네이션 */}
        <div className="flex justify-center">
          <div className="flex gap-2">
            <button className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">
              이전
            </button>
            <button className="px-3 py-2 text-sm bg-[#7C3AED] text-white rounded-lg">
              1
            </button>
            <button className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">
              2
            </button>
            <button className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">
              3
            </button>
            <button className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">
              다음
            </button>
          </div>
        </div>
      </div>
    </MasterLayout>
  );
};

export default MemberHistory;
