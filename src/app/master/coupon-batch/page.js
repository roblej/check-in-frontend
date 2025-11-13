'use client';

import { useState, useEffect } from 'react';
import { Gift, Users, UserCheck, Calendar } from 'lucide-react';
import MasterLayout from '@/components/master/MasterLayout';
import axiosInstance from '@/lib/axios';

const CouponBatchManagement = () => {
  const [selectedRank, setSelectedRank] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [templates, setTemplates] = useState([]);
  const [templatesLoading, setTemplatesLoading] = useState(true);
  const [rankCounts, setRankCounts] = useState({});
  const [rankCountsLoading, setRankCountsLoading] = useState(true);

  const ranks = ['Traveler', 'Explorer', 'VIP', 'First Class', 'Sky Suite'];

  // 템플릿 목록 조회
  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        setTemplatesLoading(true);
        // type=1인 템플릿만 조회 (단체 발급형식)
        const response = await axiosInstance.get('/master/couponTemplates?type=1');
        if (response.data) {
          setTemplates(response.data);
        }
      } catch (error) {
        console.error('템플릿 목록 조회 오류:', error);
        setTemplates([]);
      } finally {
        setTemplatesLoading(false);
      }
    };

    fetchTemplates();
  }, []);

  // 등급별 인원수 조회
  useEffect(() => {
    const fetchRankCounts = async () => {
      try {
        setRankCountsLoading(true);
        const response = await axiosInstance.get('/master/coupon-batch/rankCounts');
        if (response.data) {
          setRankCounts(response.data);
        }
      } catch (error) {
        console.error('등급별 인원수 조회 오류:', error);
        setRankCounts({});
      } finally {
        setRankCountsLoading(false);
      }
    };

    fetchRankCounts();
  }, []);

  const handleBatchIssue = async () => {
    if (!selectedRank || !selectedTemplate) {
      alert('등급과 템플릿을 모두 선택해주세요.');
      return;
    }

    if (!confirm(`등급 '${selectedRank}'에 해당하는 모든 회원에게 쿠폰을 발급하시겠습니까?`)) {
      return;
    }

    try {
      setIsProcessing(true);
      const response = await axiosInstance.post('/master/coupon-batch/issue', null, {
        params: {
          rank: selectedRank,
          templateIdx: selectedTemplate.templateIdx
        }
      });

      if (response.data && response.data.success) {
        alert(response.data.message || `쿠폰이 성공적으로 발급되었습니다. (${response.data.issuedCount}개)`);
        // 선택 초기화
        setSelectedRank('');
        setSelectedTemplate(null);
      } else {
        alert(response.data?.message || '쿠폰 발급 중 오류가 발생했습니다.');
      }
    } catch (error) {
      console.error('쿠폰 일괄 발급 오류:', error);
      const errorMessage = error.response?.data?.message || '쿠폰 일괄 발급 중 오류가 발생했습니다.';
      alert(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <MasterLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">쿠폰 일괄 발급</h1>
        </div>

        {/* 안내 메시지 */}
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-purple-800">
            등급별 모든 회원에게 일괄적으로 쿠폰을 발급할 수 있습니다.
          </p>
        </div>

        {/* 등급 선택 */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Users className="w-5 h-5" />
            등급 선택
          </h2>
          {rankCountsLoading ? (
            <div className="text-center py-8 text-gray-400">등급별 인원수를 불러오는 중...</div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
              {ranks.map((rank) => {
                const count = rankCounts[rank] || 0;
                return (
                  <button
                    key={rank}
                    onClick={() => setSelectedRank(rank)}
                    className={`p-4 border-2 rounded-lg transition-colors ${
                      selectedRank === rank
                        ? 'border-purple-500 bg-purple-50 text-purple-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <UserCheck className="w-8 h-8 mx-auto mb-2" />
                    <div className="font-semibold">{rank}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {count.toLocaleString()}명
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* 템플릿 선택 */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Gift className="w-5 h-5" />
            쿠폰 템플릿 선택
          </h2>
          {templatesLoading ? (
            <div className="text-center py-8 text-gray-400">템플릿 목록을 불러오는 중...</div>
          ) : templates.length === 0 ? (
            <div className="text-center py-8 text-gray-400">사용 가능한 템플릿이 없습니다.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {templates.map((template) => (
                <div
                  key={template.templateIdx}
                  onClick={() => setSelectedTemplate(template)}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                    selectedTemplate?.templateIdx === template.templateIdx
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <h3 className="font-semibold text-gray-900">{template.templateName}</h3>
                  <div className="mt-2 space-y-1 text-sm text-gray-600">
                    <div>{template.discount.toLocaleString()}원 할인</div>
                    <div>{template.validDays}일 유효</div>
                  </div>
                </div>
              ))}
            </div>
          )}
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
                <span className="text-gray-600">해당 등급 인원수:</span>
                <span className="font-semibold">{(rankCounts[selectedRank] || 0).toLocaleString()}명</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">쿠폰 템플릿:</span>
                <span className="font-semibold">{selectedTemplate.templateName}</span>
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
            className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Gift className="w-5 h-5" />
            {isProcessing ? '처리 중...' : '일괄 발급'}
          </button>
        </div>
      </div>
    </MasterLayout>
  );
};

export default CouponBatchManagement;

