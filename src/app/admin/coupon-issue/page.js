'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Search, Gift, User, Calendar, DollarSign, CheckCircle, XCircle } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import Pagination from '@/components/Pagination';
import axiosInstance from '@/lib/axios';

const CouponIssueManagement = () => {

  const couponIssue_url = "/admin/couponIssue";
  const couponCreate_url = "/admin/couponCreate";
  // 해당 호텔을 사용했던 고객만 조회
  const hotelCustomers_url = "/admin/hotelCustomers";
  // 최근 이용 고객 조회 (모달 열릴 때 자동 로드)
  const recentCustomers_url = "/admin/recentCustomers";

  const [templates, setTemplates] = useState([]);
  const [issuedCoupons, setIssuedCoupons] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [customerSearch, setCustomerSearch] = useState('');
  const [customers, setCustomers] = useState([]);
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  // Pagination 상태
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [pageSize, setPageSize] = useState(5);

  const didFetch = useRef(false);
  const didFetchCustomers = useRef(false);

  const getTemplates = useCallback((page = currentPage, size = pageSize) => {
    axiosInstance.get(couponIssue_url, {
      params: {
        page: page,
        size: size
      }
    }).then(res => {
      setTemplates(res.data.couponTemplates);
      
      // Page 객체에서 데이터 추출
      if (res.data.coupons && res.data.coupons.content) {
        setIssuedCoupons(res.data.coupons.content);
        setTotalPages(res.data.coupons.totalPages || 0);
        setTotalElements(res.data.coupons.totalElements || 0);
        setCurrentPage(res.data.coupons.number || 0);
      } else {
        setIssuedCoupons(res.data.coupons || []);
        setTotalPages(1);
        setTotalElements(res.data.coupons?.length || 0);
        setCurrentPage(0);
      }
    });
  }, [couponIssue_url, currentPage, pageSize]);

  // 페이지 변경 핸들러
  const handlePageChange = useCallback((newPage) => {
    setCurrentPage(newPage);
    getTemplates(newPage, pageSize);
  }, [getTemplates, pageSize]);

  // 해당 호텔을 사용한 고객만 조회
  const getRecentCustomers = useCallback(() => {
    axiosInstance.get(recentCustomers_url)
      .then(res => {
        if (res.data.success && res.data.customers) {
          const recentCustomers = res.data.customers.map(reservation => ({
            customerIdx: reservation.customer?.customerIdx,
            name: reservation.customer?.name || '',
            email: reservation.customer?.email || '',
            nickname: reservation.customer?.nickname || '',
            rank: reservation.customer?.rank || '',
            recentRoomName: reservation.room?.name || '정보 없음'
          }));
          setCustomers(recentCustomers);
        }
      })
      .catch(error => {
        console.error('최근 이용 고객 로드 오류:', error);
      });
  }, [recentCustomers_url]);

  const getCustomers = useCallback((searchTerm) => {
    if (searchTerm.trim() === '') {
      // 검색어가 없으면 최근 고객 5명 로드
      getRecentCustomers();
      return;
    }

    // 해당 호텔을 이용한 고객 중에서 검색
    axiosInstance.get(hotelCustomers_url, {
      params: {
        searchTerm: searchTerm
      }
    })
      .then(res => {
        if (res.data.success && res.data.customers) {
          // Customer 엔티티를 프론트엔드 형식으로 변환
          const customersList = res.data.customers.map(customer => ({
            customerIdx: customer.customerIdx,
            name: customer.name || '',
            email: customer.email || '',
            nickname: customer.nickname || '',
            rank: customer.rank || '',
            recentRoomName: '' // 검색 결과에는 최근 이용 정보 없음
          }));
          setCustomers(customersList);
        }
      })
      .catch(error => {
        console.error('고객 검색 오류:', error);
        setCustomers([]);
      });
  }, [getRecentCustomers, hotelCustomers_url]);

  function createCoupon(templateIdx, customerIdx){
    axiosInstance.post(couponCreate_url, {
      templateIdx: templateIdx,
      customerIdx: customerIdx
    }).then(res => {
      if (res.data.success) {
        alert('쿠폰이 성공적으로 발급되었습니다.');
        // 첫 페이지로 이동하여 최신 데이터 가져오기
        setCurrentPage(0);
        getTemplates(0, pageSize);
        setIsIssueModalOpen(false);
        setSelectedTemplate(null);
        setSelectedCustomer(null);
        setCustomerSearch('');
        setCustomers([]);
      } else {
        alert(res.data.message || '쿠폰 발급에 실패했습니다.');
      }
    }).catch(error => {
      console.error('쿠폰 생성 오류:', error);
      alert('서버 오류가 발생했습니다.');
    });
  }

  useEffect(() => {
    if (didFetch.current) return;
    didFetch.current = true;

    getTemplates();
  }, [getTemplates]);

  // 고객 검색이 변경될 때마다 API 호출 (디바운스 적용)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      getCustomers(customerSearch);
    }, 300); // 300ms 디바운스

    return () => clearTimeout(timeoutId);
  }, [customerSearch, getCustomers]);

  const filteredTemplates = templates.filter(template =>
    template.templateName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // API에서 이미 필터링된 결과를 사용
  const filteredCustomers = customers;

  // 모달이 열릴 때 최근 이용 고객 5명 자동 로드
  const handleOpenModal = () => {
    setIsIssueModalOpen(true);
    
    // 최근 이용 고객 자동 로드
    getRecentCustomers();
  };


  const getStatusBadge = (status) => {
    return status ? (
      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
        <XCircle className="w-3 h-3" />
        사용완료
      </span>
    ) : (
      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
        <CheckCircle className="w-3 h-3" />
        미사용
      </span>
    );
  };

  return (
    <AdminLayout>
      <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">쿠폰 발급 관리</h1>
        <button
          onClick={handleOpenModal}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Gift className="w-4 h-4" />
          쿠폰 발급
        </button>
      </div>

      {/* 쿠폰 템플릿 선택 */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">발급 가능한 쿠폰 템플릿</h2>
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="템플릿명으로 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTemplates.map((template) => (
            <div
              key={template.templateIdx}
              className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                selectedTemplate?.templateIdx === template.templateIdx
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => setSelectedTemplate(template)}
            >
              <h3 className="font-semibold text-gray-900">{template.templateName}</h3>
              <div className="mt-2 space-y-1">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <DollarSign className="w-4 h-4" />
                  {template.discount.toLocaleString()}원 할인
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="w-4 h-4" />
                  {template.validDays}일 유효
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 발급된 쿠폰 목록 */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">발급된 쿠폰 목록</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  쿠폰명
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  고객명
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  발급일
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  만료일
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  상태
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {issuedCoupons.map((coupon, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {coupon.couponTemplate?.templateName || 'N/A'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-400" />
                      <div className="text-sm text-gray-900">
                        {coupon.customer?.name || 'N/A'}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(coupon.createDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(coupon.endDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(coupon.status)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6 border-t border-gray-200 pt-4">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalElements={totalElements}
              pageSize={pageSize}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </div>

      {/* 쿠폰 발급 모달 */}
      {isIssueModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
          <div className="absolute inset-0 border-8 border-black"></div>
          <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b">
              <h2 className="text-lg font-semibold text-gray-900">쿠폰 발급</h2>
            </div>
            
            <div className="px-6 py-4 flex-1 overflow-y-auto">

            {/* 템플릿 선택 */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                쿠폰 템플릿
              </label>
              <select
                value={selectedTemplate?.templateIdx || ''}
                onChange={(e) => {
                  const template = templates.find(t => t.templateIdx === parseInt(e.target.value));
                  console.log(template);
                  setSelectedTemplate(template);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">템플릿을 선택하세요</option>
                {templates.map(template => (
                  <option key={template.templateIdx} value={template.templateIdx}>
                    {template.templateName} ({template.discount.toLocaleString()}원 할인) / {template.validDays}일
                  </option>
                ))}
              </select>
            </div>

            {/* 고객 검색 */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                고객 선택
              </label>
              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="닉네임으로 검색..."
                  value={customerSearch}
                  onChange={(e) => setCustomerSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              {/* 고객 목록 */}
              <div className="mb-4 max-h-60 overflow-y-auto border border-gray-200 rounded-md">
                {customers.length > 0 ? (
                  customers.map(customer => (
                    <div
                      key={customer.customerIdx}
                      className={`p-3 cursor-pointer hover:bg-gray-50 border-b border-gray-100 last:border-b-0 ${
                        selectedCustomer?.customerIdx === customer.customerIdx ? 'bg-blue-50' : ''
                      }`}
                      onClick={() => setSelectedCustomer(customer)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">
                            이름: {customer.name || '-'}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            닉네임: {customer.nickname || '-'}
                          </div>
                          <div className="text-xs text-blue-600 mt-1">
                            {customer.recentRoomName ? `최근 이용: ${customer.recentRoomName}` : ''}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-gray-500">
                            등급: {customer.rank || '-'}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-sm text-gray-500">
                    {customerSearch ? '검색 결과가 없습니다.' : '고객 정보를 불러오는 중...'}
                  </div>
                )}
              </div>
            </div>

              {/* 선택된 정보 표시 */}
              {selectedTemplate && selectedCustomer && (
                <div className="mb-4 p-4 bg-blue-50 rounded-md border border-blue-200">
                  <h3 className="font-medium mb-2 text-blue-900">발급 정보</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="text-gray-600">회원 고유번호:</div>
                    <div className="font-medium">{selectedCustomer.customerIdx}</div>
                    <div className="text-gray-600">쿠폰:</div>
                    <div className="font-medium">{selectedTemplate.templateName}</div>
                    <div className="text-gray-600">할인액:</div>
                    <div className="font-medium text-blue-600">{selectedTemplate.discount.toLocaleString()}원</div>
                    <div className="text-gray-600">이름:</div>
                    <div className="font-medium">{selectedCustomer.name || '-'}</div>
                    <div className="text-gray-600">닉네임:</div>
                    <div className="font-medium">{selectedCustomer.nickname || '-'}</div>
                    <div className="text-gray-600">등급:</div>
                    <div className="font-medium">{selectedCustomer.rank || '-'}</div>
                    <div className="text-gray-600">유효기간:</div>
                    <div className="font-medium">{selectedTemplate.validDays}일</div>
                  </div>
                </div>
              )}
            </div>

            {/* 버튼 영역 */}
            <div className="px-6 py-4 border-t bg-gray-50 flex gap-2">
              <button
                onClick={() => createCoupon(selectedTemplate.templateIdx, selectedCustomer.customerIdx)}
                disabled={!selectedTemplate || !selectedCustomer}
                className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed font-medium transition-colors"
              >
                쿠폰 발급
              </button>
              <button
                onClick={() => {
                  setIsIssueModalOpen(false);
                  setSelectedTemplate(null);
                  setSelectedCustomer(null);
                  setCustomerSearch('');
                  setCustomers([]);
                }}
                className="flex-1 bg-white text-gray-700 border border-gray-300 py-3 px-4 rounded-lg hover:bg-gray-50 font-medium transition-colors"
              >
                취소
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </AdminLayout>
  );
};

export default CouponIssueManagement;
