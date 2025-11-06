'use client';

import { useEffect, useState } from 'react';
import MasterLayout from '@/components/master/MasterLayout';
import axiosInstance from '@/lib/axios';

const MemberManagement = () => {

  const api_url = "/master/customers"

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedMembers, setSelectedMembers] = useState([]);

  const [customers, setCustomers] = useState([]);
  const [customerCount, setCustomerCount] = useState("0");
  
  const [showSuspendModal, setShowSuspendModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [suspendReason, setSuspendReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  function getData(){
    axiosInstance.get(api_url).then(res => {
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

  const getGenderText = (gender) => {
    switch (gender) {
      case 'male':
        return '남자';
      case 'female':
        return '여자';
      default:
        return '기타';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleSuspendClick = (member) => {
    setSelectedMember(member);
    setSuspendReason('');
    setShowSuspendModal(true);
  };

  const handleSuspendCancel = () => {
    setShowSuspendModal(false);
    setShowConfirmModal(false);
    setSelectedMember(null);
    setSuspendReason('');
  };

  const handleSuspendConfirm = () => {
    if (!suspendReason.trim()) {
      alert("정지 사유를 입력해주세요.");
      return;
    }
    setShowConfirmModal(true);
  };

  const handleFinalSuspend = async () => {
    if (!selectedMember) {
      alert("선택된 회원 정보를 찾을 수 없습니다.");
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await axiosInstance.post(`/master/suspendCustomer`, {
        customerIdx: selectedMember.customerIdx,
        reason: suspendReason.trim()
      });

      if (response.data.success) {
        alert("회원이 정지되었습니다.");
        getData();
      } else {
        alert("정지 처리 중 오류가 발생했습니다.");
      }
    } catch (error) {
      console.error("정지 실패:", error);
      alert("서버 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
      setShowSuspendModal(false);
      setShowConfirmModal(false);
      setSelectedMember(null);
      setSuspendReason('');
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
                    가입
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
                        <div className="text-sm text-gray-500">{getGenderText(member.gender)} • {member.birthday}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{member.phone}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">가입: {formatDate(member.joinDate)}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">예약 {member.reservationCount || 0}회</div>
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
                      <button 
                        onClick={() => handleSuspendClick(member)}
                        className="text-red-600 hover:text-red-800 text-left"
                      >
                        정지
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 정지 사유 입력 모달 */}
        {showSuspendModal && !showConfirmModal && (
          <div className="fixed inset-0 bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
              {/* 모달 헤더 */}
              <div className="flex justify-between items-center p-6 border-b">
                <h3 className="text-lg font-semibold text-gray-900">회원 정지</h3>
                <button
                  onClick={handleSuspendCancel}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* 모달 내용 */}
              <div className="p-6">
                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-2">
                    정지할 회원: <span className="font-semibold text-gray-900">{selectedMember?.name}</span>
                  </p>
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    정지 사유 <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={suspendReason}
                    onChange={(e) => setSuspendReason(e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                    placeholder="정지 사유를 입력해주세요..."
                  />
                </div>
              </div>

              {/* 모달 푸터 */}
              <div className="flex justify-end gap-2 p-6 border-t">
                <button
                  onClick={handleSuspendCancel}
                  disabled={isSubmitting}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  취소
                </button>
                <button
                  onClick={handleSuspendConfirm}
                  disabled={isSubmitting || !suspendReason.trim()}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  정지
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 정지 확인 모달 */}
        {showConfirmModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
              {/* 모달 헤더 */}
              <div className="flex justify-between items-center p-6 border-b">
                <h3 className="text-lg font-semibold text-gray-900">정지 확인</h3>
                <button
                  onClick={handleSuspendCancel}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  disabled={isSubmitting}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* 모달 내용 */}
              <div className="p-6">
                <p className="text-base text-gray-900 mb-4">
                  정말로 정지 하겠습니까?
                </p>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-2">
                    <span className="font-semibold">회원:</span> {selectedMember?.name}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-semibold">정지 사유:</span> {suspendReason}
                  </p>
                </div>
              </div>

              {/* 모달 푸터 */}
              <div className="flex justify-end gap-2 p-6 border-t">
                <button
                  onClick={handleSuspendCancel}
                  disabled={isSubmitting}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  취소
                </button>
                <button
                  onClick={handleFinalSuspend}
                  disabled={isSubmitting}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? '처리 중...' : '정지'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </MasterLayout>
  );
};

export default MemberManagement;
