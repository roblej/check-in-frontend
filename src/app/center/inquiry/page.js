'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Button from '@/components/Button';
import { centerAPI } from '@/lib/api/center';

export default function InquiryWritePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(false);
  const contentId = searchParams.get('contentId'); // URL에서 contentId 가져오기

  // 폼 상태
  const [formData, setFormData] = useState({
    category: '예약/취소',
    title: '',
    content: '',
    priority: 0
  });

  const [errors, setErrors] = useState({});

  // 카테고리 옵션
  const categories = ['예약/취소', '회원정보', '결제', '기술지원', '호텔정보', '기타'];

  // 페이지 로드 시 사용자 정보 가져오기
  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const response = await fetch('/api/customer/me', {
          credentials: 'include'
        });

        if (response.ok) {
          const userData = await response.json();
          setCustomer(userData);
        } else if (response.status === 401) {
          alert('로그인이 필요합니다. 로그인 페이지로 이동합니다.');
          router.push('/login');
        }
      } catch (error) {
        console.error('사용자 정보 가져오기 실패:', error);
        alert('로그인이 필요합니다.');
        router.push('/login');
      }
    };

    fetchUserInfo();
  }, [router]);

  // 입력 검증
  const validateForm = () => {
    const newErrors = {};

    if (!formData.title || formData.title.trim() === '') {
      newErrors.title = '제목을 입력해주세요.';
    } else if (formData.title.length < 5) {
      newErrors.title = '제목은 최소 5자 이상 입력해주세요.';
    }

    if (!formData.content || formData.content.trim() === '') {
      newErrors.content = '문의 내용을 입력해주세요.';
    } else if (formData.content.length < 10) {
      newErrors.content = '문의 내용은 최소 10자 이상 입력해주세요.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 폼 제출
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      await centerAPI.createInquiry({
        title: formData.title,
        mainCategory: '문의',
        subCategory: formData.category,
        content: formData.content,
        contentId: contentId || null, // 호텔 문의인 경우 contentId 포함
        priority: formData.priority,
        customerIdx: customer.customerIdx,
        status: 0, // 0: 대기
        hide: false
      });

      alert('문의가 성공적으로 등록되었습니다!');
      // 호텔 문의인 경우 호텔 상세 페이지로, 아니면 고객센터로
      if (contentId) {
        router.push(`/hotel/${contentId}`);
      } else {
        router.push('/center');
      }
    } catch (error) {
      console.error('문의 등록 실패:', error);
      alert(error.response?.data?.message || '문의 등록 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 입력 핸들러
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // 에러 메시지 제거
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {contentId ? '호텔 문의 작성' : '1:1 문의 작성'}
          </h1>
          <p className="text-gray-600">
            {contentId 
              ? '호텔에 대한 문의사항을 작성해주세요. 빠른 시일 내에 답변드리겠습니다.'
              : '문의하실 내용을 작성해주세요. 빠른 시일 내에 답변드리겠습니다.'}
          </p>
        </div>

        {/* 안내 사항 */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h3 className="text-sm font-semibold text-blue-900 mb-2">
            📌 문의 작성 전 확인사항
          </h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• 일반적인 질문은 FAQ를 먼저 확인해보세요</li>
            <li>• 회원정보 관련 문의는 개인정보 보호를 위해 간결하게 작성해주세요</li>
            <li>• 답변까지 1-2일 정도 소요될 수 있습니다</li>
            <li>• 긴급한 사항은 전화(1588-1234)로 연락주시기 바랍니다</li>
          </ul>
        </div>

        {/* 문의 작성 폼 */}
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 space-y-6">
          {/* 카테고리 선택 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              카테고리 <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.category}
              onChange={(e) => handleInputChange('category', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          {/* 제목 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              제목 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="문의 제목을 입력하세요 (최소 5자 이상)"
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.title ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.title && (
              <p className="text-red-500 text-sm mt-1">{errors.title}</p>
            )}
            <p className="text-gray-500 text-sm mt-1">
              현재 {formData.title.length}자 / 최소 5자
            </p>
          </div>

          {/* 문의 내용 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              문의 내용 <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.content}
              onChange={(e) => handleInputChange('content', e.target.value)}
              placeholder="문의하실 내용을 상세히 작성해주세요&#10;&#10;예시:&#10;- 문의하실 예약 정보&#10;- 문제가 발생한 시간 및 상황&#10;- 기대하시는 해결 방법"
              rows={10}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none ${
                errors.content ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.content && (
              <p className="text-red-500 text-sm mt-1">{errors.content}</p>
            )}
            <p className="text-gray-500 text-sm mt-1">
              현재 {formData.content.length}자 / 최소 10자
            </p>
          </div>

          {/* 우선순위 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              우선순위
            </label>
            <select
              value={formData.priority}
              onChange={(e) => handleInputChange('priority', parseInt(e.target.value))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={0}>일반</option>
              <option value={1}>높음</option>
              <option value={2}>긴급</option>
            </select>
            <p className="text-gray-500 text-sm mt-1">
              긴급한 문의는 선택해주시면 빠른 처리에 도움이 됩니다.
            </p>
          </div>

          {/* 버튼 */}
          <div className="flex gap-4 pt-4 border-t border-gray-200">
            <Button
              variant="outline"
              type="button"
              onClick={() => router.back()}
              className="flex-1"
            >
              취소
            </Button>
            <Button
              variant="primary"
              type="submit"
              disabled={loading}
              className="flex-1"
            >
              {loading ? '등록 중...' : '문의 등록하기'}
            </Button>
          </div>
        </form>
      </div>

      <Footer />
    </div>
  );
}

