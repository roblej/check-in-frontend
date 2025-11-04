'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Button from '@/components/Button';
import { usedAPI } from '@/lib/api/used';
import { mypageAPI } from '@/lib/api/mypage';

function UsedItemRegisterContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const reservIdx = searchParams.get('reservIdx');
  const isEditMode = searchParams.get('edit') === 'true';

  // 폼 상태
  const [formData, setFormData] = useState({
    price: '',
    comment: ''
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [reservationInfo, setReservationInfo] = useState(null);
  const [userData, setUserData] = useState(null);
  const [existingUsedItem, setExistingUsedItem] = useState(null);

  // 예약 정보 가져오기
  useEffect(() => {
    const fetchData = async () => {
      try {
        // 사용자 정보 가져오기
        const userResponse = await fetch('/api/customer/me', {
          credentials: 'include'
        });

        if (userResponse.ok) {
          const user = await userResponse.json();
          setUserData(user);
        }

        // 예약 정보 가져오기 (mypage API 사용)
        const reservData = await mypageAPI.getReservations('upcoming');
        const reservation = reservData.reservations?.find(r => r.reservIdx == reservIdx || r.id == reservIdx);
        
        if (reservation) {
          setReservationInfo(reservation);
        } else {
          alert('예약 정보를 찾을 수 없습니다.');
          router.push('/mypage');
          return;
        }

        // 수정 모드인 경우 기존 양도거래 정보 불러오기
        if (isEditMode) {
          const checkData = await usedAPI.checkRegistered(reservIdx);

          if (checkData.registered) {
            setExistingUsedItem(checkData);
            // 기존 데이터로 폼 채우기
            setFormData({
              price: checkData.price.toString(),
              comment: checkData.comment || ''
            });
          } else {
            alert('등록된 양도거래가 없습니다.');
            router.push('/mypage');
          }
        }
      } catch (error) {
        console.error('데이터 로드 실패:', error);
        alert('예약 정보를 불러오는데 실패했습니다.');
        router.push('/mypage');
      }
    };

    fetchData();
  }, [reservIdx, isEditMode, router]);

  // 입력 검증
  const validateForm = () => {
    const newErrors = {};

    if (!formData.price || formData.price.trim() === '') {
      newErrors.price = '판매 가격을 입력해주세요.';
    } else if (isNaN(formData.price) || parseInt(formData.price) <= 0) {
      newErrors.price = '올바른 가격을 입력해주세요.';
    }

    if (!formData.comment || formData.comment.trim() === '') {
      newErrors.comment = '설명을 입력해주세요.';
    } else if (formData.comment.length < 10) {
      newErrors.comment = '설명은 최소 10자 이상 입력해주세요.';
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
      if (isEditMode && existingUsedItem) {
        // 수정 모드: PUT 요청
        await usedAPI.updateUsedItem(existingUsedItem.usedItemIdx, {
          price: parseInt(formData.price),
          comment: formData.comment
        });

        alert('양도거래가 성공적으로 수정되었습니다!');
        router.push('/mypage');
      } else {
        // 등록 모드: POST 요청
        await usedAPI.registerUsedItem({
          reservIdx: parseInt(reservIdx),
          price: parseInt(formData.price),
          comment: formData.comment
        });

        alert('양도거래가 성공적으로 등록되었습니다!');
        router.push('/mypage');
      }
    } catch (error) {
      console.error(isEditMode ? '수정 실패:' : '등록 실패:', error);
      alert(error.response?.data?.message || (isEditMode ? '수정 중 오류가 발생했습니다.' : '등록 중 오류가 발생했습니다.'));
    } finally {
      setLoading(false);
    }
  };

  // 양도거래 취소
  const handleCancel = async () => {
    if (!isEditMode || !existingUsedItem) {
      return;
    }

    const confirmCancel = window.confirm('정말 양도거래를 취소하시겠습니까? 취소된 양도거래는 복구할 수 없습니다.');
    
    if (!confirmCancel) {
      return;
    }

    setLoading(true);

    try {
      await usedAPI.cancelUsedItem(existingUsedItem.usedItemIdx);
      alert('양도거래가 취소되었습니다.');
      // 페이지 새로고침으로 상태 업데이트 보장
      window.location.href = '/mypage';
    } catch (error) {
      console.error('양도거래 취소 실패:', error);
      alert(error.response?.data?.message || '양도거래 취소 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 가격 포맷팅
  const formatPrice = (value) => {
    return value.replace(/\D/g, '');
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
            양도거래 {isEditMode ? '수정' : '등록'}
          </h1>
          <p className="text-gray-600">
            예약 정보를 확인하고 양도 가격과 설명을 {isEditMode ? '수정' : '입력'}해주세요.
          </p>
        </div>

        {/* 예약 정보 - 간단한 카드 형식 */}
        {reservationInfo && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg shadow-sm p-6 mb-6 border border-blue-200">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {reservationInfo.hotelName}
                </h2>
                <p className="text-sm text-gray-600 flex items-center gap-1">
                  📍 {reservationInfo.location}
                </p>
              </div>
              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                원가: {(reservationInfo.totalprice || 0).toLocaleString()}원
              </span>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <span className="text-xs text-gray-500 block mb-1">체크인</span>
                <p className="font-semibold text-gray-900">{reservationInfo.checkIn}</p>
              </div>
              <div className="text-center">
                <span className="text-xs text-gray-500 block mb-1">체크아웃</span>
                <p className="font-semibold text-gray-900">{reservationInfo.checkOut}</p>
              </div>
              <div className="text-center">
                <span className="text-xs text-gray-500 block mb-1">객실타입</span>
                <p className="font-semibold text-gray-900">{reservationInfo.roomType}</p>
              </div>
            </div>
          </div>
        )}

        {/* 등록 폼 */}
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              판매 가격 <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={formData.price}
                onChange={(e) => handleInputChange('price', formatPrice(e.target.value))}
                placeholder="판매할 가격을 입력하세요"
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.price ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              <span className="absolute right-3 top-3 text-gray-500">원</span>
            </div>
            {errors.price && (
              <p className="text-red-500 text-sm mt-1">{errors.price}</p>
            )}
            {formData.price && !errors.price && (
              <p className="text-green-600 text-sm mt-1">
                {parseInt(formData.price).toLocaleString()}원으로 등록됩니다
              </p>
            )}
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              설명 <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.comment}
              onChange={(e) => handleInputChange('comment', e.target.value)}
              placeholder="예: 급하게 필요한 일정이 생겨 양도합니다. 호텔은 깨끗하고 좋은 곳입니다."
              rows={6}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none ${
                errors.comment ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.comment && (
              <p className="text-red-500 text-sm mt-1">{errors.comment}</p>
            )}
            <p className="text-gray-500 text-sm mt-1">
              현재 {formData.comment.length}자 / 최소 10자
            </p>
          </div>

          {/* 안내 사항 */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="text-sm font-semibold text-blue-900 mb-2">
              안내 사항
            </h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• 양도가격은 원래 결제금액보다 낮게 설정할 수 있습니다</li>
              <li>• 등록된 양도거래는 관리자 승인 후 게시됩니다</li>
              <li>• 설명에는 객실의 상태나 특이사항을 상세히 적어주세요</li>
              <li>• 거짓 정보 제공 시 법적 책임을 질 수 있습니다</li>
            </ul>
          </div>

          {/* 버튼 */}
          <div className="flex flex-col gap-4">
          <div className="flex gap-4">
            <Button
              variant="outline"
              type="button"
              onClick={() => router.back()}
              className="flex-1"
            >
                뒤로가기
            </Button>
            <Button
              variant="primary"
              type="submit"
              disabled={loading}
              className="flex-1"
            >
              {loading ? (isEditMode ? '수정 중...' : '등록 중...') : (isEditMode ? '수정하기' : '등록하기')}
            </Button>
            </div>
            
            {/* 수정 모드일 때만 취소 버튼 표시 */}
            {isEditMode && (
              <Button
                type="button"
                onClick={handleCancel}
                disabled={loading}
                className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors disabled:bg-red-300 disabled:cursor-not-allowed"
              >
                {loading ? '처리 중...' : '양도거래 취소'}
              </Button>
            )}
          </div>
        </form>
      </div>

      <Footer />
    </div>
  );
}

export default function UsedItemRegisterPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="h-24 bg-gray-200 rounded"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
        <Footer />
      </div>
    }>
      <UsedItemRegisterContent />
    </Suspense>
  );
}

