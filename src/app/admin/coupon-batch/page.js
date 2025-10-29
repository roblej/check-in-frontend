'use client';

import { useState } from 'react';
import { Gift, Users, UserCheck, Calendar } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';

const CouponBatchManagement = () => {
  const [selectedRank, setSelectedRank] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const ranks = ['VIP', 'Traveler', 'Sky Suite', 'First Class', 'Explorer'];
  const templates = [
    { idx: 1, name: '웰컴 쿠폰', discount: 10000, validDays: 30 },
    { idx: 2, name: '생일 축하 쿠폰', discount: 15000, validDays: 60 },
    { idx: 3, name: 'VIP 특별 쿠폰', discount: 50000, validDays: 90 },
  ];

  const handleBatchIssue = () => {
    if (!selectedRank || !selectedTemplate) {
      alert('등급과 템플릿을 모두 선택해주세요.');
      return;
    }

    // TODO: 비즈니스 로직 구현
    console.log('일괄 발급:', { rank: selectedRank, template: selectedTemplate });
    alert('쿠폰 일괄 발급 기능은 곧 구현될 예정입니다.');
  };

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">쿠폰 일괄 발급</h1>
        </div>

        {/* 안내 메시지 */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-blue-800">
            등급별 모든 회원에게 일괄적으로 쿠폰을 발급할 수 있습니다.
          </p>
        </div>

        {/* 등급 선택 */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Users className="w-5 h-5" />
            등급 선택
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {ranks.map((rank) => (
              <button
                key={rank}
                onClick={() => setSelectedRank(rank)}
                className={`p-4 border-2 rounded-lg transition-colors ${
                  selectedRank === rank
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <UserCheck className="w-8 h-8 mx-auto mb-2" />
                <div className="font-semibold">{rank}</div>
              </button>
            ))}
          </div>
        </div>

        {/* 템플릿 선택 */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Gift className="w-5 h-5" />
            쿠폰 템플릿 선택
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {templates.map((template) => (
              <div
                key={template.idx}
                onClick={() => setSelectedTemplate(template)}
                className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                  selectedTemplate?.idx === template.idx
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <h3 className="font-semibold text-gray-900">{template.name}</h3>
                <div className="mt-2 space-y-1 text-sm text-gray-600">
                  <div>{template.discount.toLocaleString()}원 할인</div>
                  <div>{template.validDays}일 유효</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 발급 정보 요약 */}
        {selectedRank && selectedTemplate && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              발급 정보
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">선택 등급:</span>
                <span className="font-semibold">{selectedRank}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">쿠폰 템플릿:</span>
                <span className="font-semibold">{selectedTemplate.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">할인 금액:</span>
                <span className="font-semibold">{selectedTemplate.discount.toLocaleString()}원</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">유효 기간:</span>
                <span className="font-semibold">{selectedTemplate.validDays}일</span>
              </div>
            </div>
          </div>
        )}

        {/* 발급 버튼 */}
        <div className="flex justify-end gap-2">
          <button
            onClick={handleBatchIssue}
            disabled={!selectedRank || !selectedTemplate || isProcessing}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Gift className="w-5 h-5" />
            {isProcessing ? '처리 중...' : '일괄 발급'}
          </button>
        </div>
      </div>
    </AdminLayout>
  );
};

export default CouponBatchManagement;

