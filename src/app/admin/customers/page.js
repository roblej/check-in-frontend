'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import AdminLayout from '@/components/admin/AdminLayout';
import { Users, Star, Calendar, DollarSign } from 'lucide-react';
import axiosInstance from '@/lib/axios';

const CustomerManagementPage = () => {
  const [stats, setStats] = useState({
    totalCustomers: 0,
    newCustomersThisMonth: 0,
    averagePaymentAmount: 0
  });
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  const didFetch = useRef(false);
  const lastFetchedPageRef = useRef(null);

  useEffect(() => {
    if (didFetch.current && lastFetchedPageRef.current === currentPage) return;
    didFetch.current = true;
    lastFetchedPageRef.current = currentPage;
    
    fetchCustomerStats();
    fetchCustomers();
  }, [currentPage]);

  const fetchCustomerStats = async () => {
    try {
      const response = await axiosInstance.get('/admin/customerStats');
      if (response.data) {
        setStats({
          totalCustomers: response.data.totalCustomers || 0,
          newCustomersThisMonth: response.data.newCustomersThisMonth || 0,
          averagePaymentAmount: response.data.averagePaymentAmount || 0
        });
      }
    } catch (error) {
      console.error('고객 통계 조회 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomers = async () => {
    try {
      const response = await axiosInstance.get('/admin/customers', {
        params: {
          page: currentPage,
          size: pageSize
        }
      });
      if (response.data.success) {
        setCustomers(response.data.content || []);
        setTotalPages(response.data.totalPages || 0);
        setTotalElements(response.data.totalElements || 0);
      }
    } catch (error) {
      console.error('고객 목록 조회 오류:', error);
    }
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const formatCurrency = (value) => {
    if (!value) return '₩0';
    return `₩${Number(value).toLocaleString()}`;
  };

  const formatDate = (date) => {
    if (!date) return '-';
    const d = new Date(date);
    return d.toLocaleDateString('ko-KR');
  };

  const formatVisitedDates = (dates) => {
    if (!dates || dates.length === 0) return '없음';
    return dates.map(date => formatDate(date)).join(', ');
  };

  const getRankBadgeColor = (rank) => {
    switch (rank) {
      case 'VIP':
      case 'vip':
        return 'bg-purple-100 text-purple-800';
      case 'GOLD':
      case 'gold':
        return 'bg-yellow-100 text-yellow-800';
      case 'SILVER':
      case 'silver':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-green-100 text-green-800';
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">데이터를 불러오는 중...</p>
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
          <h2 className="text-2xl font-bold text-gray-900">고객 관리</h2>
          <p className="text-gray-600">고객 정보와 이용 이력을 관리하세요</p>
        </div>

        {/* 고객 통계 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="text-blue-600 mr-4"><Users size={32} /></div>
              <div>
                <p className="text-sm font-medium text-gray-600">총 고객수</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalCustomers.toLocaleString()}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="text-green-600 mr-4"><Calendar size={32} /></div>
              <div>
                <p className="text-sm font-medium text-gray-600">이번 달 신규</p>
                <p className="text-2xl font-bold text-gray-900">{stats.newCustomersThisMonth.toLocaleString()}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="text-purple-600 mr-4"><DollarSign size={32} /></div>
              <div>
                <p className="text-sm font-medium text-gray-600">평균 구매액</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.averagePaymentAmount)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* 고객 목록 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">고객 목록</h3>
                <p className="text-sm text-gray-600">
                  총 {totalElements}명의 고객이 있습니다.
                </p>
              </div>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    고객ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    고객정보
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    예약횟수
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    총 구매액
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    최근 방문
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    등급
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    액션
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {customers.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="px-6 py-4 text-center text-gray-500">
                      고객 데이터가 없습니다.
                    </td>
                  </tr>
                ) : (
                  customers.map((customer) => (
                    <tr key={customer.customerIdx} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {customer.customerIdx}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{customer.name || '-'} / {customer.id || '-'}</div>
                          <div className="text-sm text-gray-500">{customer.email || '-'}</div>
                          <div className="text-sm text-gray-500">{customer.phone || '-'}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {customer.reservationCount || 0}회
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(customer.totalPaymentAmount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(customer.lastVisitDate)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRankBadgeColor(customer.rank)}`}>
                          {customer.rank || '일반'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <Link 
                          href={`/admin/customer-history?customerId=${customer.id}`}
                          className="text-green-600 hover:text-green-800 hover:underline"
                        >
                          이용 이력
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* 페이지네이션 */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  총 {totalElements}명 중 {currentPage * pageSize + 1}-{Math.min((currentPage + 1) * pageSize, totalElements)}명 표시
                </div>
                <div className="flex space-x-2">
                  <button 
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 0}
                    className={`px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 ${currentPage === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    이전
                  </button>
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i;
                    } else if (currentPage < 3) {
                      pageNum = i;
                    } else if (currentPage > totalPages - 4) {
                      pageNum = totalPages - 5 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    return (
                      <button 
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`px-3 py-1 text-sm border border-gray-300 rounded ${
                          currentPage === pageNum ? 'bg-[#3B82F6] text-white' : 'hover:bg-gray-50'
                        }`}
                      >
                        {pageNum + 1}
                      </button>
                    );
                  })}
                  <button 
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage >= totalPages - 1}
                    className={`px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 ${currentPage >= totalPages - 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    다음
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default CustomerManagementPage;
