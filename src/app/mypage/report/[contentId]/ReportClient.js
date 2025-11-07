'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, AlertTriangle } from 'lucide-react';
import { centerAPI } from '@/lib/api/center';
import axiosInstance from '@/lib/axios';

export default function ReportClient({ contentId }) {
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [subCategory, setSubCategory] = useState('');
  const [content, setContent] = useState('');
  const [hotelName, setHotelName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [alreadyReported, setAlreadyReported] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  // 신고 사유 카테고리
  const reportCategories = [
    { value: '부정확한 정보 제공', label: '부정확한 정보 제공' },
    { value: '서비스 불만', label: '서비스 불만' },
    { value: '청결 문제', label: '청결 문제' },
    { value: '시설 문제', label: '시설 문제' },
    { value: '기타', label: '기타' }
  ];

  // 호텔 정보 및 중복 신고 확인
  useEffect(() => {
    const fetchData = async () => {
      setIsChecking(true);
      try {
        // 호텔 정보 조회
        const hotelResponse = await axiosInstance.get(`/hotels/${contentId}`);
        if (hotelResponse.data) {
          setHotelName(hotelResponse.data.title || '호텔 정보 없음');
        }

        // 중복 신고 확인
        try {
          const reportCheck = await centerAPI.checkReportExists(contentId);
          if (reportCheck.exists) {
            setAlreadyReported(true);
          }
        } catch (err) {
          console.error('신고 중복 확인 실패:', err);
          // 중복 확인 실패해도 계속 진행 가능
        }
      } catch (err) {
        console.error('호텔 정보 조회 실패:', err);
        setHotelName('호텔 정보 없음');
      } finally {
        setIsChecking(false);
      }
    };

    if (contentId) {
      fetchData();
    }
  }, [contentId]);

  // 신고 제출
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // 유효성 검사
    if (!title.trim()) {
      setError('제목을 입력해주세요.');
      return;
    }

    if (!subCategory) {
      setError('신고 사유를 선택해주세요.');
      return;
    }

    if (!content.trim() || content.trim().length < 10) {
      setError('신고 내용을 최소 10자 이상 입력해주세요.');
      return;
    }

    if (content.length > 1000) {
      setError('신고 내용은 최대 1000자까지 입력 가능합니다.');
      return;
    }

    setIsSubmitting(true);

    try {
      const reportData = {
        title: title.trim(),
        mainCategory: '신고',
        subCategory: subCategory,
        content: content.trim(),
        contentId: contentId,
        priority: 0,
        status: 0,
        hide: false
      };

      await centerAPI.createInquiry(reportData);

      alert('신고가 접수되었습니다. 검토 후 처리하겠습니다.');
      router.push('/mypage');
    } catch (err) {
      console.error('신고 제출 실패:', err);
      if (err.response?.status === 409) {
        setError('이미 신고한 호텔입니다.');
        setAlreadyReported(true);
      } else {
        setError(err.response?.data?.message || '신고 접수에 실패했습니다. 다시 시도해주세요.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // 로딩 중
  if (isChecking) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex justify-center items-center py-20">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="ml-3 text-gray-600">확인 중...</span>
        </div>
      </div>
    );
  }

  // 이미 신고한 경우
  if (alreadyReported) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>돌아가기</span>
          </button>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <AlertTriangle className="w-7 h-7 text-red-600" />
            호텔 신고
          </h1>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-yellow-100 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-8 h-8 text-yellow-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">이미 신고한 호텔입니다</h2>
          <p className="text-gray-600 mb-6">
            {hotelName}에 대한 신고가 이미 접수되었습니다.
            <br />
            신고 내역은 고객센터에서 확인하실 수 있습니다.
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => router.back()}
              className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
            >
              돌아가기
            </button>
            <button
              onClick={() => router.push('/mypage')}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              마이페이지로 이동
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* 헤더 */}
      <div className="mb-6">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>돌아가기</span>
        </button>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <AlertTriangle className="w-7 h-7 text-red-600" />
          호텔 신고
        </h1>
        <p className="text-gray-600 mt-2">
          신고 대상: <span className="font-semibold text-gray-900">{hotelName}</span>
        </p>
      </div>

      {/* 신고 폼 */}
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
        {/* 제목 */}
        <div className="mb-6">
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
            제목 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="신고 제목을 입력해주세요"
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            maxLength={255}
          />
        </div>

        {/* 신고 사유 */}
        <div className="mb-6">
          <label htmlFor="subCategory" className="block text-sm font-medium text-gray-700 mb-2">
            신고 사유 <span className="text-red-500">*</span>
          </label>
          <select
            id="subCategory"
            value={subCategory}
            onChange={(e) => setSubCategory(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">신고 사유를 선택해주세요</option>
            {reportCategories.map((category) => (
              <option key={category.value} value={category.value}>
                {category.label}
              </option>
            ))}
          </select>
        </div>

        {/* 신고 내용 */}
        <div className="mb-6">
          <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
            신고 내용 <span className="text-red-500">*</span>
          </label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="신고 내용을 상세히 입력해주세요 (최소 10자 이상)"
            rows={10}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            maxLength={1000}
          />
          <div className="flex justify-between items-center mt-2">
            <p className="text-xs text-gray-500">
              최소 10자 이상, 최대 1000자까지 입력 가능합니다.
            </p>
            <p className="text-xs text-gray-500">
              {content.length} / 1000
            </p>
          </div>
        </div>

        {/* 에러 메시지 */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* 제출 버튼 */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
          >
            취소
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isSubmitting ? '제출 중...' : '신고 접수'}
          </button>
        </div>
      </form>

      {/* 안내 사항 */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="text-sm font-semibold text-blue-900 mb-2">신고 안내</h3>
        <ul className="text-xs text-blue-800 space-y-1 list-disc list-inside">
          <li>신고 내용은 검토 후 처리됩니다.</li>
          <li>허위 신고는 제재를 받을 수 있습니다.</li>
          <li>신고 접수 후 처리 결과는 고객센터에서 확인하실 수 있습니다.</li>
        </ul>
      </div>
    </div>
  );
}

