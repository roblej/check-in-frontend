'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Eye, EyeOff, Archive } from 'lucide-react';
import { useRouter } from 'next/navigation';
import MasterLayout from '@/components/master/MasterLayout';
import axiosInstance from '@/lib/axios';

const CouponTemplateManagement = () => {
  const router = useRouter();

  const api_url = "/master/couponTemplates";
  const createTemplate_url = "/master/createTemplate";
  const editTemplate_url = "/master/editTemplate";
  const deleteTemplate_url = "/master/delTemplate";

  const [templates, setTemplates] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [formData, setFormData] = useState({
    templateName: '',
    discount: '',
    validDays: 30,
    status: 1,
    type: 0 // 0: 지정발급형식, 1: 단체발급형식
  });

  /* 관리자 고유번호 */
  const [adminIdx, setAdminIdx] = useState(1);

  function getDate(){
    // type 파라미터 없이 모든 활성 템플릿 조회
    axiosInstance.get(api_url).then(res => {
      setTemplates(res.data);
    });
  }

  useEffect(() => {
    getDate();
  }, []);

  function createTemplate(templateName, discount, validDays, status, type){
    axiosInstance.post(createTemplate_url, {
      templateName: templateName,
      discount: discount,
      validDays: validDays,
      status: status,
      type: type,
      adminIdx: adminIdx

    }).then(res => {
      console.log(res.data);
      getDate();
      setIsModalOpen(false);
      setEditingTemplate(null);
      setFormData({ templateName: '', discount: '', validDays: 30, status: 1, type: 0 });
      alert('템플릿이 성공적으로 생성되었습니다.');
    });
  }

  function deleteTemplate(templateIdx, templateName){
    if (window.confirm(`"${templateName}" 템플릿을 삭제하시겠습니까?\n\n⚠️ 주의: 이 작업은 되돌릴 수 없습니다.`)) {
      axiosInstance.post(deleteTemplate_url, {
        templateIdx: templateIdx
      }).then(res => {
        getDate(); // 목록 새로고침
        setIsModalOpen(false);
        setEditingTemplate(null);
        setFormData({ templateName: '', discount: '', validDays: 30, status: 1 });
        alert('템플릿이 성공적으로 삭제되었습니다.');
      }).catch(error => {
        console.error('템플릿 삭제 오류:', error);
        alert('템플릿 삭제 중 오류가 발생했습니다.');
      });
    }
  }

  function editTemplate(templateIdx, templateName, discount, validDays, status, type) {
    axiosInstance.post(editTemplate_url, {
      templateIdx: templateIdx,
      templateName: templateName,
      discount: discount,
      validDays: validDays,
      status: status,
      type: type
    }).then(res => {
      console.log(res.data);
      getDate(); // 목록 새로고침
      setIsModalOpen(false);
      setEditingTemplate(null);
      setFormData({ templateName: '', discount: '', validDays: 30, status: 1 });
      alert('템플릿이 성공적으로 수정되었습니다.');
    }).catch(error => {
      console.error('템플릿 수정 오류:', error);
      alert('템플릿 수정 중 오류가 발생했습니다.');
    });
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (editingTemplate) {
      // 수정 - 백엔드 API 호출
      editTemplate(
        editingTemplate.templateIdx,
        formData.templateName,
        formData.discount,
        formData.validDays,
        formData.status,
        formData.type
      );
    } else {
      // 추가
      createTemplate(formData.templateName, formData.discount, formData.validDays, formData.status, formData.type);
    }
  };

  const handleEdit = (template) => {
    setEditingTemplate(template);
    setFormData({
      templateName: template.templateName,
      discount: template.discount,
      validDays: template.validDays,
      status: template.status,
      type: template.type !== undefined ? template.type : 0
    });
    setIsModalOpen(true);
  };

  const handleDelete = (templateIdx, templateName) => {
    deleteTemplate(templateIdx, templateName);
  };

  const toggleStatus = (templateIdx) => {
    setTemplates(templates.map(template => 
      template.templateIdx === templateIdx 
        ? { ...template, status: template.status === 1 ? 0 : 1, updatedAt: new Date().toISOString() }
        : template
    ));
  };

  return (
    <MasterLayout>
      <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">쿠폰 템플릿 관리</h1>
        <div className="flex gap-2">
          <button
            onClick={() => router.push('/master/coupon-templates/inactive')}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 flex items-center gap-2"
          >
            <Archive className="w-4 h-4" />
            비활성 템플릿 보기
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            새 템플릿 추가
          </button>
        </div>
      </div>

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
                  상태
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
              {templates.filter(t => t.type === 0).map((template) => (
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
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium cursor-default ${
                        template.status === 1
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {template.status === 1 ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                      {template.status === 1 ? '활성' : '비활성'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(template.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(template)}
                        className="text-indigo-600 hover:text-indigo-900"
                        title="수정"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(template.templateIdx, template.templateName)}
                        className="text-red-600 hover:text-red-900"
                        title="삭제"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {templates.filter(t => t.type === 0).length === 0 && (
            <div className="text-center py-8 text-gray-500">
              지정발급형식 쿠폰 템플릿이 없습니다.
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
                  상태
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
              {templates.filter(t => t.type === 1).map((template) => (
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
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium cursor-default ${
                        template.status === 1
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {template.status === 1 ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                      {template.status === 1 ? '활성' : '비활성'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(template.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(template)}
                        className="text-indigo-600 hover:text-indigo-900"
                        title="수정"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(template.templateIdx, template.templateName)}
                        className="text-red-600 hover:text-red-900"
                        title="삭제"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {templates.filter(t => t.type === 1).length === 0 && (
            <div className="text-center py-8 text-gray-500">
              단체발급형식 쿠폰 템플릿이 없습니다.
            </div>
          )}
        </div>
      </div>

      {/* 모달 */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg border-black">
            <h2 className="text-lg font-semibold mb-4">
              {editingTemplate ? '템플릿 수정' : '새 템플릿 추가'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  템플릿명
                </label>
                <input
                  type="text"
                  value={formData.templateName}
                  onChange={(e) => setFormData({...formData, templateName: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  할인 금액 (원)
                </label>
                <input
                  type="number"
                  value={formData.discount}
                  onChange={(e) => setFormData({...formData, discount: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  유효 기간 (일)
                </label>
                <input
                  type="number"
                  value={formData.validDays}
                  onChange={(e) => setFormData({...formData, validDays: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  쿠폰 타입
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({...formData, type: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  disabled={!!editingTemplate}
                >
                  <option value={0}>지정발급형식 (개별 고객 지정 발급)</option>
                  <option value={1}>단체발급형식 (등급별 일괄 발급)</option>
                </select>
                {editingTemplate && (
                  <p className="text-xs text-gray-500 mt-1">수정 시 쿠폰 타입은 변경할 수 없습니다.</p>
                )}
              </div>
              <div className="mb-6">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.status === 1}
                    onChange={(e) => setFormData({...formData, status: e.target.checked ? 1 : 0})}
                    className="mr-2"
                  />
                  활성화
                </label>
              </div>
              <div className="flex gap-2">
                <button 
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
                >
                  {editingTemplate ? '수정' : '추가'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingTemplate(null);
                    setFormData({ templateName: '', discount: '', validDays: 30, status: 1, type: 0 });
                  }}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400"
                >
                  취소
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      </div>
    </MasterLayout>
  );
};

export default CouponTemplateManagement;
