'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import axios from '@/lib/axios';

/**
 * 간단한 중고 호텔 결제 성공 페이지 (페이지 이탈 감지 로직 제거)
 */
const UsedPaymentSuccessContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [successData, setSuccessData] = useState(null);
  const [loading, setLoading] = useState(true);
  const processedRef = useRef(false);

  // 세션 스토리지 또는 URL 파라미터에서 결제 성공 정보 가져오기
  useEffect(() => {
    try {
      // 1. URL 파라미터를 먼저 확인 (모바일 리다이렉트 플로우 또는 최신 값)
      const urlOrderId = searchParams.get('orderId');
      const urlPaymentKey = searchParams.get('paymentKey');
      const urlAmount = searchParams.get('amount');
      const urlUsedTradeIdx = searchParams.get('usedTradeIdx');
      
      let storedSuccessData = null;
      
      // URL 파라미터에 필수 정보가 있으면 우선 사용 (최신 값 보장)
      if (urlOrderId && urlPaymentKey && urlAmount) {
        console.log('🔍 URL 파라미터에서 결제 정보 읽기:', {
          orderId: urlOrderId,
          paymentKey: urlPaymentKey,
          amount: urlAmount,
          usedTradeIdx: urlUsedTradeIdx
        });
        
        // URL 파라미터로부터 데이터 구성
        const urlData = {
          orderId: urlOrderId,
          paymentKey: urlPaymentKey,
          amount: parseInt(urlAmount, 10),
          type: 'used_hotel',
          cash: 0,
          point: 0,
          card: parseInt(urlAmount, 10),
          tradeIdx: urlUsedTradeIdx || '',
          usedItemIdx: searchParams.get('usedItemIdx') || '',
          hotelName: searchParams.get('hotelName') || '호텔명',
          roomType: searchParams.get('roomType') || '객실 정보',
          checkIn: searchParams.get('checkIn') || '',
          checkOut: searchParams.get('checkOut') || ''
        };
        
        // 세션 스토리지에 저장하여 다음 로드 시에도 사용 가능하게 함
        sessionStorage.setItem('used_payment_success_data', JSON.stringify(urlData));
        storedSuccessData = JSON.stringify(urlData);
        console.log('✅ URL 파라미터 데이터를 세션 스토리지에 저장:', urlData);
      } else {
        // 2. URL 파라미터가 없으면 세션 스토리지에서 확인 (데스크톱 플로우)
        storedSuccessData = sessionStorage.getItem('used_payment_success_data');
        if (storedSuccessData) {
          console.log('🔍 세션 스토리지에서 결제 정보 읽기:', {
            data: JSON.parse(storedSuccessData)
          });
        }
      }
      
      if (!storedSuccessData) {
        console.error('결제 성공 정보를 찾을 수 없습니다.');
        alert('결제 정보를 찾을 수 없습니다. 메인 페이지로 이동합니다.');
        router.push('/used');
        return;
      }

      const parsedData = JSON.parse(storedSuccessData);
      setSuccessData({
        orderId: parsedData.orderId || '',
        amount: parsedData.amount || 0,
        type: parsedData.type || 'used_hotel',
        cash: parsedData.cash || 0,
        point: parsedData.point || 0,
        card: parsedData.card || 0,
        tradeIdx: parsedData.tradeIdx || '',
        usedItemIdx: parsedData.usedItemIdx || '',
        hotelName: parsedData.hotelName || '호텔명',
        hotelImage: parsedData.hotelImage || null,
        hotelAddress: parsedData.hotelAddress || '',
        roomType: parsedData.roomType || '객실 정보',
        checkIn: parsedData.checkIn || '',
        checkOut: parsedData.checkOut || '',
        guests: parsedData.guests || 0,
        nights: parsedData.nights || 0,
        seller: parsedData.seller || '',
        originalPrice: parsedData.originalPrice || 0,
        salePrice: parsedData.salePrice || 0,
        discountAmount: parsedData.discountAmount || 0,
      });
      setLoading(false);
    } catch (error) {
      console.error('결제 정보 읽기 실패:', error);
      alert('결제 정보를 불러오는 중 오류가 발생했습니다.');
      router.push('/used');
    }
  }, [router, searchParams]);

  // 모바일 리다이렉트 플로우 또는 데스크톱에서 백엔드 검증이 실패한 경우 백엔드 검증 수행
  useEffect(() => {
    const run = async () => {
      if (processedRef.current) return;
      
      try {
        // URL 파라미터를 우선적으로 확인 (최신 값 보장)
        const urlOrderId = searchParams.get('orderId');
        const urlPaymentKey = searchParams.get('paymentKey');
        const urlAmount = searchParams.get('amount');
        const urlUsedTradeIdx = searchParams.get('usedTradeIdx');
        const urlUsedItemIdx = searchParams.get('usedItemIdx');
        
        // URL 파라미터가 있으면 우선 사용
        let orderId, paymentKey, usedTradeIdx, usedItemIdx, amount;
        
        if (urlOrderId && urlPaymentKey && urlAmount) {
          orderId = urlOrderId;
          paymentKey = urlPaymentKey;
          amount = parseInt(urlAmount, 10);
          usedTradeIdx = urlUsedTradeIdx;
          usedItemIdx = urlUsedItemIdx;
          
          console.log('🔵 URL 파라미터에서 백엔드 검증 데이터 읽기:', {
            orderId,
            paymentKey,
            amount,
            usedTradeIdx,
            usedItemIdx
          });
        } else {
          // URL 파라미터가 없으면 세션 스토리지에서 읽기
          const storedSuccessData = sessionStorage.getItem('used_payment_success_data');
          if (!storedSuccessData) {
            console.warn('백엔드 검증을 위한 정보가 없습니다.');
            return;
          }

          const parsedData = JSON.parse(storedSuccessData);
          orderId = parsedData.orderId;
          paymentKey = parsedData.paymentKey;
          usedTradeIdx = parsedData.tradeIdx;
          usedItemIdx = parsedData.usedItemIdx;
          amount = parsedData.card || parsedData.amount;
          
          console.log('🔵 세션 스토리지에서 백엔드 검증 데이터 읽기:', {
            orderId,
            paymentKey,
            amount,
            usedTradeIdx,
            usedItemIdx
          });
        }
        
        // 필요한 정보가 없으면 스킵
        if (!orderId || !paymentKey || !usedTradeIdx) {
          console.warn('백엔드 검증을 위한 필수 정보가 없습니다:', { orderId, paymentKey, usedTradeIdx });
          return;
        }

        // 이미 처리된 결제인지 확인
        const processedKey = `used_payment_processed_${orderId}`;
        if (sessionStorage.getItem(processedKey) === '1') {
          console.log('이미 처리된 결제입니다:', orderId);
          return;
        }

        console.log('🔵 백엔드 검증 API 호출 시작:', { 
          orderId, 
          paymentKey, 
          usedTradeIdx,
          source: urlOrderId ? 'URL 파라미터' : '세션 스토리지'
        });

        // 세션 스토리지에서 추가 정보 읽기 (없으면 URL 파라미터에서)
        const storedSuccessData = sessionStorage.getItem('used_payment_success_data');
        const parsedData = storedSuccessData ? JSON.parse(storedSuccessData) : {};
        
        // 백엔드 검증 API 호출 (/api/payments)
        const requestData = {
          paymentKey: paymentKey,
          orderId: orderId,
          amount: amount || parsedData.card || parsedData.amount, // 카드 결제 금액
          totalPrice: amount || parsedData.amount, // 총 결제 금액
          type: "used_hotel",
          customerIdx: parsedData.customerIdx || null,
          usedTradeIdx: parseInt(usedTradeIdx, 10), // URL 파라미터 또는 세션 스토리지에서 읽은 값
          usedItemIdx: usedItemIdx ? parseInt(usedItemIdx, 10) : (parsedData.usedItemIdx ? parseInt(parsedData.usedItemIdx, 10) : null),
          hotelName: parsedData.hotelName || searchParams.get('hotelName') || '',
          roomType: parsedData.roomType || searchParams.get('roomType') || '',
          salePrice: parsedData.salePrice || amount || parsedData.amount,
          customerName: parsedData.customerName || '',
          customerEmail: parsedData.customerEmail || '',
          customerPhone: parsedData.customerPhone || '',
          method: (amount || parsedData.card || parsedData.amount) > 0 ? "mixed" : "cash_point_only",
          pointsUsed: parsedData.point || 0,
          cashUsed: parsedData.cash || 0,
        };

        console.log('📤 백엔드 검증 요청 데이터:', {
          orderId: requestData.orderId,
          paymentKey: requestData.paymentKey ? '***' : undefined,
          amount: requestData.amount,
          usedTradeIdx: requestData.usedTradeIdx,
          usedItemIdx: requestData.usedItemIdx,
          source: urlOrderId ? 'URL 파라미터' : '세션 스토리지'
        });

        const response = await axios.post('/payments', requestData);
        
        if (response.data.success) {
          console.log('✅ 백엔드 검증 및 DB 업데이트 완료:', response.data);
          console.log('✅ DB 업데이트 완료:');
          console.log('  - UsedPay 저장 완료');
          console.log('  - UsedTrade 상태 업데이트 완료 (ststus=1)');
          console.log('  - UsedItem 상태 업데이트 완료 (status=2)');
          sessionStorage.setItem(processedKey, '1');
          processedRef.current = true;
        } else {
          console.error('백엔드 검증 실패:', response.data.message);
        }
      } catch (error) {
        console.error('백엔드 검증 오류:', error);
        console.error('에러 상세:', {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status,
        });
      }
    };
    
    // 데이터가 로드된 후에 실행
    if (!loading && successData) {
      run();
    }
  }, [loading, successData]);

  const handleNavigateToUsed = () => {
    sessionStorage.removeItem('used_payment_success_data');
    router.push('/used');
  };

  const handleNavigateToMypage = () => {
    sessionStorage.removeItem('used_payment_success_data');
    router.push('/mypage');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">결제 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (!successData) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      {/* 성공 메시지 */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
          <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">🎉 중고 호텔 결제 완료!</h1>
        <p className="text-xl text-gray-600">안전하게 거래가 완료되었습니다.</p>
      </div>

      {/* 결제 정보 카드 */}
      <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">결제 정보</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 호텔 정보 */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">호텔 정보</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">호텔명:</span>
                <span className="font-medium">{successData.hotelName || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">객실:</span>
                <span className="font-medium">{successData.roomType || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">체크인:</span>
                <span className="font-medium">{successData.checkIn || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">체크아웃:</span>
                <span className="font-medium">{successData.checkOut || 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* 결제 상세 */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">결제 상세</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">주문번호:</span>
                <span className="font-medium text-blue-600">{successData.orderId || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">거래번호:</span>
                <span className="font-medium text-blue-600">{successData.tradeIdx || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">총 결제금액:</span>
                <span className="font-bold text-lg text-blue-600">{successData.amount.toLocaleString()}원</span>
              </div>
            </div>
          </div>
        </div>

        {/* 결제 방법별 금액 */}
        <div className="mt-8 pt-6 border-t">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">결제 방법별 금액</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {successData.cash > 0 && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-sm text-blue-600 font-medium">캐시 사용</div>
                <div className="text-xl font-bold text-blue-700">{successData.cash.toLocaleString()}원</div>
              </div>
            )}
            {successData.point > 0 && (
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="text-sm text-purple-600 font-medium">포인트 사용</div>
                <div className="text-xl font-bold text-purple-700">{successData.point.toLocaleString()}P</div>
              </div>
            )}
            {successData.card > 0 && (
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-sm text-green-600 font-medium">카드 결제</div>
                <div className="text-xl font-bold text-green-700">{successData.card.toLocaleString()}원</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 안내 메시지 */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
        <h3 className="text-lg font-semibold text-blue-800 mb-3">📋 다음 단계</h3>
        <ul className="space-y-2 text-blue-700">
          <li>• 판매자와 연락하여 호텔 예약 확인을 진행해주세요.</li>
          <li>• 체크인 당일 호텔에 직접 방문하여 예약 확인을 받으세요.</li>
          <li>• 문제가 발생하면 고객센터로 연락해주세요.</li>
        </ul>
      </div>

      {/* 액션 버튼들 */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <button
          onClick={handleNavigateToUsed}
          className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
        >
          중고 호텔 더 보기
        </button>
        <button
          onClick={handleNavigateToMypage}
          className="px-8 py-3 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-700 transition-colors"
        >
          마이페이지
        </button>
      </div>
    </div>
  );
};

export default UsedPaymentSuccessContent;

