'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, CheckCircle, EyeOff } from 'lucide-react';
import { useRouter } from 'next/navigation';
import MasterLayout from '@/components/master/MasterLayout';
import axiosInstance from '@/lib/axios';

const InactiveCouponTemplates = () => {
  const router = useRouter();

  const api_url = "/master/couponTemplates/inactive";
  const activateTemplate_url = "/master/activateTemplate";

  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);

  function getData() {
    setLoading(true);
    axiosInstance.get(api_url).then(res => {
      setTemplates(res.data);
      setLoading(false);
    }).catch(error => {
      console.error('비활성 템플릿 조회 오류:', error);
      setTemplates([]);
      setLoading(false);
    });
  }

  useEffect(() => {
    getData();
  }, []);

  function activateTemplate(templateIdx, templateName) {
    if (!window.confirm(`"${templateName}" 템플릿을 활성화하시겠습니까?`)) {
      return;
    }

    axiosInstance.post(activateTemplate_url, {
      templateIdx: templateIdx
    }).then(res => {
      if (res.data.success) {
        alert(res.data.message);
        getData(); // 목록 새로고침
      } else {
        alert(res.data.message || '템플릿 활성화에 실패했습니다.');
      }
    }).catch(error => {
      console.error('템플릿 활성화 오류:', error);
      alert('템플릿 활성화 중 오류가 발생했습니다.');
    });
  }

  // 타입별로 템플릿 분리
  const individualTemplates = templates.filter(t => t.type === 0);
  const batchTemplates = templates.filter(t => t.type === 1);

  return (
    <MasterLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/master/coupon-templates')}
              className="text-gray-600 hover:text-gray-900 flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              돌아가기
            </button>
            <h1 className="text-2xl font-bold text-gray-900">비활성 쿠폰 템플릿</h1>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-500">로딩 중...</div>
        ) : (
          <>
            {/* 지정발급형식 쿠폰 템플릿 */}
            <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
              <div className="px-6 py-4 border-b border-gray-200 bg-blue-50">
                <h2 className="text-lg font-semibold text-gray-900">지정발급형식 쿠폰 템플릿</h2>
                <p className="text-sm text-gray-600 mt-1">개별 고객에게 지정하여 발급하는 쿠폰</p>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        템플릿명
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        할인 금액
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        유효 기간
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        생성일
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        작업
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {individualTemplates.map((template) => (
                      <tr key={template.templateIdx} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {template.templateName}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {template.discount.toLocaleString()}원
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {template.validDays}일
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(template.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => activateTemplate(template.templateIdx, template.templateName)}
                            className="text-green-600 hover:text-green-900 flex items-center gap-1"
                            title="활성화"
                          >
                            <CheckCircle className="w-4 h-4" />
                            활성화
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {individualTemplates.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    지정발급형식 비활성 쿠폰 템플릿이 없습니다.
                  </div>
                )}
              </div>
            </div>

            {/* 단체발급형식 쿠폰 템플릿 */}
            <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
              <div className="px-6 py-4 border-b border-gray-200 bg-purple-50">
                <h2 className="text-lg font-semibold text-gray-900">단체발급형식 쿠폰 템플릿</h2>
                <p className="text-sm text-gray-600 mt-1">등급별로 일괄 발급하는 쿠폰</p>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        템플릿명
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        할인 금액
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        유효 기간
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        생성일
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        작업
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {batchTemplates.map((template) => (
                      <tr key={template.templateIdx} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {template.templateName}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {template.discount.toLocaleString()}원
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {template.validDays}일
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(template.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => activateTemplate(template.templateIdx, template.templateName)}
                            className="text-green-600 hover:text-green-900 flex items-center gap-1"
                            title="활성화"
                          >
                            <CheckCircle className="w-4 h-4" />
                            활성화
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {batchTemplates.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    단체발급형식 비활성 쿠폰 템플릿이 없습니다.
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </MasterLayout>
  );
};

export default InactiveCouponTemplates;

