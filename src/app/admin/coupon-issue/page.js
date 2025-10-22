'use client';

import { useState, useEffect } from 'react';
import { Search, Gift, User, Calendar, DollarSign, CheckCircle, XCircle } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';

const CouponIssueManagement = () => {
  const [templates, setTemplates] = useState([]);
  const [issuedCoupons, setIssuedCoupons] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [customerSearch, setCustomerSearch] = useState('');
  const [customers, setCustomers] = useState([]);
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  // 더미 데이터
  useEffect(() => {
    const dummyTemplates = [
      {
        templateIdx: 1,
        templateName: '여름휴가 쿠폰',
        discount: 10000,
        validDays: 30,
        status: true
      },
      {
        templateIdx: 2,
        templateName: '겨울휴가 쿠폰',
        discount: 15000,
        validDays: 30,
        status: true
      },
      {
        templateIdx: 4,
        templateName: '브론즈 생일 쿠폰',
        discount: 3000,
        validDays: 30,
        status: true
      },
      {
        templateIdx: 5,
        templateName: '골드 생일 쿠폰',
        discount: 10000,
        validDays: 30,
        status: true
      }
    ];

    const dummyCustomers = [
      {
        customerIdx: 1,
        name: '김철수',
        email: 'kim@example.com',
        phone: '010-1234-5678',
        rank: '골드'
      },
      {
        customerIdx: 2,
        name: '이영희',
        email: 'lee@example.com',
        phone: '010-2345-6789',
        rank: '실버'
      },
      {
        customerIdx: 3,
        name: '박민수',
        email: 'park@example.com',
        phone: '010-3456-7890',
        rank: '브론즈'
      },
      {
        customerIdx: 4,
        name: '정수진',
        email: 'jung@example.com',
        phone: '010-4567-8901',
        rank: '골드'
      },
      {
        customerIdx: 5,
        name: '최동현',
        email: 'choi@example.com',
        phone: '010-5678-9012',
        rank: '플래티넘'
      }
    ];

    const dummyIssuedCoupons = [
      {
        couponIdx: 1,
        templateIdx: 1,
        templateName: '여름휴가 쿠폰',
        customerIdx: 1,
        customerName: '김철수',
        adminIdx: 1,
        createDate: '2024-10-20T10:00:00',
        endDate: '2024-11-19T10:00:00',
        status: false
      },
      {
        couponIdx: 2,
        templateIdx: 4,
        templateName: '브론즈 생일 쿠폰',
        customerIdx: 3,
        customerName: '박민수',
        adminIdx: 1,
        createDate: '2024-10-21T14:30:00',
        endDate: '2024-11-20T14:30:00',
        status: true
      },
      {
        couponIdx: 3,
        templateIdx: 5,
        templateName: '골드 생일 쿠폰',
        customerIdx: 4,
        customerName: '정수진',
        adminIdx: 1,
        createDate: '2024-10-22T09:15:00',
        endDate: '2024-11-21T09:15:00',
        status: false
      }
    ];

    setTemplates(dummyTemplates);
    setCustomers(dummyCustomers);
    setIssuedCoupons(dummyIssuedCoupons);
  }, []);

  const filteredTemplates = templates.filter(template =>
    template.templateName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
    customer.email.toLowerCase().includes(customerSearch.toLowerCase())
  );

  const handleIssueCoupon = () => {
    if (!selectedTemplate || !selectedCustomer) return;

    const newCoupon = {
      couponIdx: issuedCoupons.length + 1,
      templateIdx: selectedTemplate.templateIdx,
      templateName: selectedTemplate.templateName,
      customerIdx: selectedCustomer.customerIdx,
      customerName: selectedCustomer.name,
      adminIdx: 1,
      createDate: new Date().toISOString(),
      endDate: new Date(Date.now() + selectedTemplate.validDays * 24 * 60 * 60 * 1000).toISOString(),
      status: false
    };

    setIssuedCoupons([...issuedCoupons, newCoupon]);
    setIsIssueModalOpen(false);
    setSelectedTemplate(null);
    setSelectedCustomer(null);
    setCustomerSearch('');
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
          onClick={() => setIsIssueModalOpen(true)}
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
              {issuedCoupons.map((coupon) => (
                <tr key={coupon.couponIdx} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {coupon.templateName}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-400" />
                      <div className="text-sm text-gray-900">
                        {coupon.customerName}
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
      </div>

      {/* 쿠폰 발급 모달 */}
      {isIssueModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-lg font-semibold mb-4">쿠폰 발급</h2>
            
            {/* 템플릿 선택 */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                쿠폰 템플릿
              </label>
              <select
                value={selectedTemplate?.templateIdx || ''}
                onChange={(e) => {
                  const template = templates.find(t => t.templateIdx === parseInt(e.target.value));
                  setSelectedTemplate(template);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">템플릿을 선택하세요</option>
                {templates.map(template => (
                  <option key={template.templateIdx} value={template.templateIdx}>
                    {template.templateName} ({template.discount.toLocaleString()}원 할인)
                  </option>
                ))}
              </select>
            </div>

            {/* 고객 검색 */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                고객 검색
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="고객명 또는 이메일로 검색..."
                  value={customerSearch}
                  onChange={(e) => setCustomerSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* 고객 목록 */}
            {customerSearch && (
              <div className="mb-4 max-h-40 overflow-y-auto border border-gray-200 rounded-md">
                {filteredCustomers.map(customer => (
                  <div
                    key={customer.customerIdx}
                    className={`p-3 cursor-pointer hover:bg-gray-50 ${
                      selectedCustomer?.customerIdx === customer.customerIdx ? 'bg-blue-50' : ''
                    }`}
                    onClick={() => setSelectedCustomer(customer)}
                  >
                    <div className="font-medium">{customer.name}</div>
                    <div className="text-sm text-gray-500">{customer.email}</div>
                    <div className="text-sm text-gray-500">{customer.rank} 등급</div>
                  </div>
                ))}
              </div>
            )}

            {/* 선택된 정보 표시 */}
            {selectedTemplate && selectedCustomer && (
              <div className="mb-6 p-4 bg-gray-50 rounded-md">
                <h3 className="font-medium mb-2">발급 정보</h3>
                <div className="space-y-1 text-sm">
                  <div>쿠폰: {selectedTemplate.templateName}</div>
                  <div>할인액: {selectedTemplate.discount.toLocaleString()}원</div>
                  <div>고객: {selectedCustomer.name} ({selectedCustomer.rank})</div>
                  <div>유효기간: {selectedTemplate.validDays}일</div>
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <button
                onClick={handleIssueCoupon}
                disabled={!selectedTemplate || !selectedCustomer}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                쿠폰 발급
              </button>
              <button
                onClick={() => {
                  setIsIssueModalOpen(false);
                  setSelectedTemplate(null);
                  setSelectedCustomer(null);
                  setCustomerSearch('');
                }}
                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400"
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
