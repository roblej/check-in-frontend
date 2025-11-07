'use client';

import { useEffect, useState } from 'react';
import MasterLayout from '@/components/master/MasterLayout';
import axiosInstance from '@/lib/axios';

const SettlementManagement = () => {
  const api_url = "/master/settlements";

  const [settlements, setSettlements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false); // 정산 생성 중 상태
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [pageSize] = useState(10);

  // 초기 월 설정: 현재 달 -1 (1월이면 작년 12월)
  const getPreviousMonth = () => {
    const now = new Date();
    now.setMonth(now.getMonth() - 1);
    return {
      year: now.getFullYear(),
      month: now.getMonth() + 1
    };
  };

  const initialDate = getPreviousMonth();
  const [selectedYear, setSelectedYear] = useState(initialDate.year);
  const [selectedMonth, setSelectedMonth] = useState(initialDate.month);

  function getData(page = 0) {
    setLoading(true);
    axiosInstance.get(api_url, {
      params: {
        page: page,
        size: pageSize
      }
    }).then(res => {
      if (res.data.content) {
        setSettlements(res.data.content);
        setTotalPages(res.data.totalPages);
        setTotalElements(res.data.totalElements);
        setCurrentPage(res.data.currentPage);
      }
    }).catch(error => {
      console.error("정산 목록 조회 실패:", error);
      alert("정산 목록을 불러오는 중 오류가 발생했습니다.");
    }).finally(() => {
      setLoading(false);
    });
  }

  useEffect(() => {
    getData();
  }, []);

  const formatCurrency = (amount) => {
    if (!amount) return '₩0';
    return `₩${amount.toLocaleString()}`;
  };


  const handleCreateSettlement = async () => {
    if (!window.confirm(`${selectedYear}년 ${selectedMonth}월 정산 데이터를 생성하시겠습니까?`)) {
      return;
    }

    setIsCreating(true);
    try {
      const response = await axiosInstance.post('/master/settlements/create', null, {
        params: {
          year: selectedYear,
          month: selectedMonth
        }
      });

      if (response.data.success) {
        alert("정산 데이터가 생성되었습니다.");
        getData();
      } else {
        alert("정산 데이터 생성 중 오류가 발생했습니다.");
      }
    } catch (error) {
      console.error("정산 데이터 생성 실패:", error);
      alert("서버 오류가 발생했습니다: " + (error.response?.data?.message || error.message));
    } finally {
      setIsCreating(false);
    }
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    getData(newPage);
  };

  return (
    <MasterLayout>
      <div className="space-y-6">
        {/* 정산 생성 중 오버레이 */}
        {isCreating && (
          <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 max-w-md mx-4 shadow-xl">
              <div className="flex flex-col items-center gap-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">정산 데이터 생성 중</h3>
                  <p className="text-sm text-gray-600">
                    {selectedYear}년 {selectedMonth}월 정산 데이터를 생성하고 있습니다.
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    모든 호텔의 결제 내역을 확인하는 중입니다. 잠시만 기다려주세요...
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 페이지 헤더 */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">정산 관리</h2>
            <p className="text-gray-600">호텔별 정산 내역을 관리하고 지급하세요</p>
          </div>
          <div className="flex gap-2">
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            >
              {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(year => (
                <option key={year} value={year}>{year}년</option>
              ))}
            </select>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                <option key={month} value={month}>{month}월</option>
              ))}
            </select>
            <button
              onClick={handleCreateSettlement}
              disabled={isCreating}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isCreating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>정산 생성 중...</span>
                </>
              ) : (
                <span>정산 생성</span>
              )}
            </button>
          </div>
        </div>

        {/* 정산 목록 테이블 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    호텔명
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    정산 월
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    총 수익
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    수수료
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    원천징수
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    최종 지급액
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                      로딩 중...
                    </td>
                  </tr>
                ) : settlements.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                      정산 데이터가 없습니다.
                    </td>
                  </tr>
                ) : (
                  settlements.map((settlement) => (
                    <tr key={settlement.settlementIdx} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {settlement.hotelTitle || settlement.contentId}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {settlement.settlementMonth}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {formatCurrency(settlement.totalRevenue)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {formatCurrency(settlement.commissionAmount)} (10%)
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {formatCurrency(settlement.withholdingTaxAmount)} (3.3%)
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                        {formatCurrency(settlement.finalAmount)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* 페이지네이션 */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 0}
              className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              이전
            </button>
            <span className="text-sm text-gray-600">
              {currentPage + 1} / {totalPages} 페이지
            </span>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage >= totalPages - 1}
              className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              다음
            </button>
          </div>
        )}
      </div>
    </MasterLayout>
  );
};

export default SettlementManagement;

