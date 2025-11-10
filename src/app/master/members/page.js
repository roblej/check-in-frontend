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
  const [customerCount, setCustomerCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(10);
  
  const [showSuspendModal, setShowSuspendModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showBulkActionModal, setShowBulkActionModal] = useState(false);
  const [bulkAction, setBulkAction] = useState('');
  const [selectedMember, setSelectedMember] = useState(null);
  const [suspendReason, setSuspendReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // 검색 및 필터링된 데이터 조회
  function getData(page = 0) {
    setIsLoading(true);
    const params = {
      page: page,
      size: pageSize
    };
    
    if (searchTerm && searchTerm.trim()) {
      params.searchTerm = searchTerm.trim();
    }
    
    if (statusFilter && statusFilter !== 'all') {
      params.statusFilter = statusFilter;
    }

    axiosInstance.get(api_url, { params })
      .then(res => {
        if (res.data) {
          setCustomers(res.data.content || []);
          setCustomerCount(res.data.totalElements || 0);
          setTotalPages(res.data.totalPages || 0);
          setCurrentPage(res.data.number || 0);
        }
      })
      .catch(error => {
        console.error('회원 목록 조회 오류:', error);
        setCustomers([]);
        setCustomerCount(0);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }

  useEffect(() => {
    getData(0);
    setSelectedMembers([]); // 검색/필터 변경 시 선택 초기화
  }, [searchTerm, statusFilter])

  // 검색어 변경 핸들러 (디바운싱)
  useEffect(() => {
    const timer = setTimeout(() => {
      getData(0);
      setSelectedMembers([]);
    }, 500); // 500ms 디바운싱

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // 페이지 변경 핸들러
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    getData(newPage);
    setSelectedMembers([]); // 페이지 변경 시 선택 초기화
  }

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
        getData(currentPage);
        setSelectedMembers([]);
      } else {
        alert("정지 처리 중 오류가 발생했습니다.");
      }
    } catch (error) {
      console.error("정지 실패:", error);
      alert(error.response?.data?.message || "서버 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
      setShowSuspendModal(false);
      setShowConfirmModal(false);
      setSelectedMember(null);
      setSuspendReason('');
    }
  };

  // 체크박스 선택/해제 핸들러
  const handleSelectMember = (customerIdx) => {
    setSelectedMembers(prev => {
      if (prev.includes(customerIdx)) {
        return prev.filter(id => id !== customerIdx);
      } else {
        return [...prev, customerIdx];
      }
    });
  };

  // 전체 선택/해제 핸들러
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const allCustomerIdx = customers.map(c => c.customerIdx);
      setSelectedMembers(allCustomerIdx);
    } else {
      setSelectedMembers([]);
    }
  };

  // 일괄 처리 핸들러
  const handleBulkAction = (action) => {
    if (selectedMembers.length === 0) {
      alert("선택한 회원이 없습니다.");
      return;
    }

    setBulkAction(action);
    
    if (action === 'suspend') {
      // 정지의 경우 사유 입력 모달 표시
      setShowSuspendModal(true);
    } else {
      // 활성화/비활성화는 바로 확인 모달
      setShowBulkActionModal(true);
    }
  };

  // 일괄 처리 실행
  const handleExecuteBulkAction = async () => {
    if (selectedMembers.length === 0) {
      alert("선택한 회원이 없습니다.");
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await axiosInstance.post(`/master/batchUpdateCustomers`, {
        customerIdxList: selectedMembers,
        action: bulkAction
      });

      if (response.data.success) {
        const actionNames = {
          'activate': '활성화',
          'deactivate': '비활성화',
          'suspend': '정지'
        };
        alert(`${response.data.successCount}명의 회원이 ${actionNames[bulkAction]} 처리되었습니다.`);
        getData(currentPage);
        setSelectedMembers([]);
      } else {
        alert(response.data.message || "일괄 처리 중 오류가 발생했습니다.");
      }
    } catch (error) {
      console.error("일괄 처리 실패:", error);
      alert(error.response?.data?.message || "서버 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
      setShowBulkActionModal(false);
      setShowSuspendModal(false);
      setShowConfirmModal(false);
      setBulkAction('');
      setSuspendReason('');
    }
  };

  // 일괄 정지 처리 (사유 포함)
  const handleBulkSuspend = async () => {
    if (!suspendReason.trim()) {
      alert("정지 사유를 입력해주세요.");
      return;
    }

    if (selectedMembers.length === 0) {
      alert("선택한 회원이 없습니다.");
      return;
    }

    try {
      setIsSubmitting(true);
      // 일괄 정지도 동일한 API 사용 (사유는 서버에서 무시될 수 있음)
      const response = await axiosInstance.post(`/master/batchUpdateCustomers`, {
        customerIdxList: selectedMembers,
        action: 'suspend'
      });

      if (response.data.success) {
        alert(`${response.data.successCount}명의 회원이 정지 처리되었습니다.`);
        getData(currentPage);
        setSelectedMembers([]);
      } else {
        alert(response.data.message || "일괄 정지 처리 중 오류가 발생했습니다.");
      }
    } catch (error) {
      console.error("일괄 정지 실패:", error);
      alert(error.response?.data?.message || "서버 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
      setShowSuspendModal(false);
      setShowConfirmModal(false);
      setBulkAction('');
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
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <div className="sm:w-48">
              <select
                value={statusFilter}
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
                      checked={customers.length > 0 && selectedMembers.length === customers.length}
                      onChange={handleSelectAll}
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
                {isLoading ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                      데이터를 불러오는 중...
                    </td>
                  </tr>
                ) : customers.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                      검색 결과가 없습니다.
                    </td>
                  </tr>
                ) : (
                  customers.map((member) => (
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
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          {/* 페이지네이션 */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <div className="text-sm text-gray-700">
                총 {customerCount}명 중 {currentPage * pageSize + 1} - {Math.min((currentPage + 1) * pageSize, customerCount)}명 표시
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 0}
                  className="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  이전
                </button>
                <span className="px-3 py-1 text-sm text-gray-700">
                  {currentPage + 1} / {totalPages}
                </span>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage >= totalPages - 1}
                  className="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  다음
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 정지 사유 입력 모달 (개별/일괄) */}
        {showSuspendModal && !showConfirmModal && (
          <div className="fixed inset-0 bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
              {/* 모달 헤더 */}
              <div className="flex justify-between items-center p-6 border-b">
                <h3 className="text-lg font-semibold text-gray-900">
                  {selectedMembers.length > 0 ? '회원 일괄 정지' : '회원 정지'}
                </h3>
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
                    {selectedMembers.length > 0 ? (
                      <>
                        정지할 회원: <span className="font-semibold text-gray-900">{selectedMembers.length}명</span>
                      </>
                    ) : (
                      <>
                        정지할 회원: <span className="font-semibold text-gray-900">{selectedMember?.name}</span>
                      </>
                    )}
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
                  onClick={selectedMembers.length > 0 ? handleBulkSuspend : handleSuspendConfirm}
                  disabled={isSubmitting || !suspendReason.trim()}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? '처리 중...' : '정지'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 일괄 처리 확인 모달 */}
        {showBulkActionModal && (
          <div className="fixed inset-0 bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
              <div className="flex justify-between items-center p-6 border-b">
                <h3 className="text-lg font-semibold text-gray-900">일괄 처리 확인</h3>
                <button
                  onClick={() => {
                    setShowBulkActionModal(false);
                    setBulkAction('');
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  disabled={isSubmitting}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="p-6">
                <p className="text-base text-gray-900 mb-4">
                  {selectedMembers.length}명의 회원을 {bulkAction === 'activate' ? '활성화' : '비활성화'} 처리하시겠습니까?
                </p>
              </div>

              <div className="flex justify-end gap-2 p-6 border-t">
                <button
                  onClick={() => {
                    setShowBulkActionModal(false);
                    setBulkAction('');
                  }}
                  disabled={isSubmitting}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  취소
                </button>
                <button
                  onClick={handleExecuteBulkAction}
                  disabled={isSubmitting}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? '처리 중...' : '확인'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 정지 확인 모달 */}
        {showConfirmModal && (
          <div className="fixed inset-0 bg-opacity-50 flex justify-center items-center z-50 p-4">
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
