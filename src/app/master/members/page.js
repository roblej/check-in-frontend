'use client';

import { useEffect, useState } from 'react';
import MasterLayout from '@/components/master/MasterLayout';
import axios from 'axios';

const MemberManagement = () => {

  const api_url = "/api/master/customers"

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedMembers, setSelectedMembers] = useState([]);

  const [customers, setCustomers] = useState([]);
  const [customerCount, setCustomerCount] = useState("0");

  function getData(){
    axios.get(api_url).then(res => {
      console.log(res.data.content)
      if(res.data.content){
        setCustomers(res.data.content)
        setCustomerCount(res.data.content.length)
      }
    })
  }

  useEffect(() => {
    getData();
  }, [])

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
        return '활성';
      case 1:
        return '비활성';
      default:
        return '알 수 없음';
    }
  };

  const getRankColor = (rank) => {
    switch (rank) {
      case 'VIP':
        return 'bg-purple-100 text-purple-800';
      case 'Traveler':
        return 'bg-yellow-100 text-yellow-800';
      case 'Sky Suite':
        return 'bg-gray-100 text-gray-800';
      case 'First Class':
        return 'bg-purple-100 text-purple-800';
      case 'Explorer':
        return 'bg-purple-100 text-purple-800';
    }
  };


  return (
    <MasterLayout>
      <div className="space-y-6">
        {/* 페이지 헤더 */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900">회원 관리</h2>
          <p className="text-gray-600">사이트 회원을 관리하고 모니터링하세요</p>
        </div>

        {/* 통계 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="text-2xl font-bold text-gray-900"></div>
            <div className="text-sm text-gray-600">활성 회원</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="text-2xl font-bold text-gray-900"></div>
            <div className="text-sm text-gray-600">VIP 회원</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="text-2xl font-bold text-gray-900"></div>
            <div className="text-sm text-gray-600">총 예약</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="text-2xl font-bold text-gray-900">₩95억</div>
            <div className="text-sm text-gray-600">총 결제액</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="text-2xl font-bold text-gray-900"></div>
            <div className="text-sm text-gray-600">정지 회원</div>
          </div>
        </div>

        {/* 검색 및 필터 */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="회원명, 이메일, 전화번호로 검색..."
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <div className="sm:w-48">
              <select
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="all">모든 상태</option>
                <option value="active">활성</option>
                <option value="inactive">비활성</option>
                <option value="suspended">정지됨</option>
              </select>
            </div>
          </div>
        </div>

        {/* 일괄 작업 버튼 */}
        {selectedMembers.length > 0 && (
          <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
            <div className="flex items-center justify-between">
              <span className="text-sm text-purple-700">
                {selectedMembers.length}명의 회원이 선택됨
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => handleBulkAction('activate')}
                  className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
                >
                  활성화
                </button>
                <button
                  onClick={() => handleBulkAction('deactivate')}
                  className="px-3 py-1 text-sm bg-gray-600 text-white rounded hover:bg-gray-700"
                >
                  비활성화
                </button>
                <button
                  onClick={() => handleBulkAction('suspend')}
                  className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
                >
                  정지
                </button>
                <button
                  onClick={() => handleBulkAction('withdraw')}
                  className="px-3 py-1 text-sm bg-orange-600 text-white rounded hover:bg-orange-700"
                >
                  탈퇴 처리
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 회원 목록 테이블 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    회원 정보
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    연락처
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    가입/활동
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    이용 현황
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    등급/상태
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    액션
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {customers.map((member) => (
                  <tr key={member.customerIdx} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedMembers.includes(member.customerIdx)}
                        onChange={() => handleSelectMember(member.customerIdx)}
                        className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{member.name}</div>
                        <div className="text-sm text-gray-500">{member.email}</div>
                        <div className="text-sm text-gray-500">{member.gender} • {member.birthday}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{member.phone}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm text-gray-900">가입: {member.joinDate}</div>
                        <div className="text-sm text-gray-500">최근: {member.lastLogin}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm text-gray-900">예약 {member.totalReservations}회</div>
                        <div className="text-sm text-gray-500">{member.totalSpent}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRankColor(member.rank)}`}>
                          {member.rank}
                        </span>
                        <br />
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(member.status)}`}>
                          {getStatusText(member.status)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium">
                      <div className="flex flex-col gap-1">
                        <button className="text-[#7C3AED] hover:text-purple-800 text-left">
                          상세보기
                        </button>
                        <button 
                          onClick={() => handleMemberAction(member.id, 'suspend')}
                          className="text-red-600 hover:text-red-800 text-left"
                        >
                          정지
                        </button>
                        <button 
                          onClick={() => handleMemberAction(member.id, 'withdraw')}
                          className="text-orange-600 hover:text-orange-800 text-left"
                        >
                          탈퇴 처리
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </MasterLayout>
  );
};

export default MemberManagement;
