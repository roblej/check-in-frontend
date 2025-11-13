'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import axios from '@/lib/axios';

/**
 * 중고 호텔 결제 성공 페이지
 * - 데스크톱 Promise 플로우: UsedPaymentForm에서 이미 검증 완료 → 플래그 확인 후 결과 표시
 * - 모바일 리다이렉트 플로우: 여기서 검증 수행 (UsedPaymentForm의 onSuccess가 호출되지 않음)
 */
const UsedPaymentSuccessContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [successData, setSuccessData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  const processedRef = useRef(false);

  // 세션 스토리지에서 결제 성공 정보 가져오기 (URL 파라미터는 사용하지 않음)
  useEffect(() => {
    try {
      // URL 파라미터가 있으면 먼저 읽어서 sessionStorage에 저장 후 URL에서 제거
      const urlOrderId = searchParams.get('orderId');
      const urlPaymentKey = searchParams.get('paymentKey');
      const urlAmount = searchParams.get('amount');
      const urlUsedTradeIdx = searchParams.get('usedTradeIdx');
      const urlUsedItemIdx = searchParams.get('usedItemIdx');
      const urlHotelName = searchParams.get('hotelName');
      const urlRoomType = searchParams.get('roomType');
      const urlCheckIn = searchParams.get('checkIn');
      const urlCheckOut = searchParams.get('checkOut');
      
      // 세션 스토리지에서 결제 정보 읽기
      let storedSuccessData = sessionStorage.getItem('used_payment_success_data');
      
      if (storedSuccessData) {
        const parsedData = JSON.parse(storedSuccessData);
        
        // URL 파라미터에 paymentKey가 있고 세션 스토리지에 없으면 병합
        if (urlPaymentKey && !parsedData.paymentKey) {
          parsedData.paymentKey = urlPaymentKey;
          sessionStorage.setItem('used_payment_success_data', JSON.stringify(parsedData));
          storedSuccessData = JSON.stringify(parsedData);
          console.log('✅ URL 파라미터에서 paymentKey를 가져와 세션 스토리지에 병합');
        }
        
        console.log('🔍 세션 스토리지에서 결제 정보 읽기:', {
          data: parsedData,
          usedTradeIdx: parsedData.usedTradeIdx,
          tradeIdx: parsedData.tradeIdx,
          paymentKey: parsedData.paymentKey ? '***' : undefined
        });
      } else {
        console.warn('⚠️ 세션 스토리지에 결제 정보가 없습니다.');
      }
      
      // URL 파라미터가 있으면 제거 (히스토리 API 사용)
      if (urlOrderId || urlPaymentKey || urlAmount) {
        console.log('🔍 URL 파라미터 발견 (paymentKey 병합 후 제거):', {
          urlOrderId,
          urlPaymentKey: urlPaymentKey ? '***' : undefined,
          urlAmount,
          urlUsedTradeIdx
        });
        if (typeof window !== 'undefined') {
          window.history.replaceState({}, '', '/used-payment/success');
        }
      }
      
      if (!storedSuccessData) {
        console.error('결제 성공 정보를 찾을 수 없습니다.');
        alert('결제 정보를 찾을 수 없습니다. 메인 페이지로 이동합니다.');
        router.push('/used');
        return;
      }

      const parsedData = JSON.parse(storedSuccessData);
      const usedTradeIdx = parsedData.tradeIdx || parsedData.usedTradeIdx;
      
      // 결제 완료 플래그 설정 (결제 페이지에서 이탈 시 취소하지 않도록)
      if (usedTradeIdx) {
        sessionStorage.setItem(`used_payment_completed_${usedTradeIdx}`, '1');
        console.log('✅ 성공 페이지에서 결제 완료 플래그 설정:', {
          usedTradeIdx,
          flag: `used_payment_completed_${usedTradeIdx}`
        });
      }
      
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
      // 로딩 상태는 백엔드 검증이 완료될 때까지 유지
    } catch (error) {
      console.error('결제 정보 읽기 실패:', error);
      setError('결제 정보를 불러오는 중 오류가 발생했습니다.');
      setLoading(false);
    }
  }, [router, searchParams]);

  // 백엔드 검증 수행 (모바일 리다이렉트 플로우 대비)
  // 데스크톱 Promise 플로우에서는 UsedPaymentForm에서 이미 검증 완료되어 플래그가 설정됨
  useEffect(() => {
    const run = async () => {
      if (processedRef.current || !successData) return;
      
      const orderId = successData.orderId;
      const processedKey = `used_payment_processed_${orderId}`;
      const inFlightKey = `used_payment_inflight_${orderId}`;
      
      // 이미 처리된 결제인지 확인 (데스크톱 Promise 플로우)
      const isAlreadyProcessed = sessionStorage.getItem(processedKey) === '1';
      
      if (isAlreadyProcessed) {
        console.log('✅ UsedPaymentForm에서 이미 검증이 완료되었습니다 (데스크톱 Promise 플로우). 성공 화면을 표시합니다.');
        setIsVerified(true);
        setLoading(false);
        processedRef.current = true;
        return;
      }
      
      // 중복 요청 방지: 이미 진행 중인 요청이 있는지 확인
      const isInFlight = sessionStorage.getItem(inFlightKey) === '1';
      if (isInFlight) {
        console.log('⏳ 이미 진행 중인 검증 요청이 있습니다. 대기 중...');
        // 진행 중인 요청이 완료될 때까지 대기 (최대 5초)
        let waitCount = 0;
        const maxWait = 50; // 5초 (100ms * 50)
        while (waitCount < maxWait && sessionStorage.getItem(inFlightKey) === '1' && sessionStorage.getItem(processedKey) !== '1') {
          await new Promise(resolve => setTimeout(resolve, 100));
          waitCount++;
        }
        
        // 대기 후 다시 확인
        if (sessionStorage.getItem(processedKey) === '1') {
          console.log('✅ 대기 중 검증이 완료되었습니다.');
          setIsVerified(true);
          setLoading(false);
          processedRef.current = true;
          return;
        }
      }
      
      // 요청 시작 전에 즉시 플래그 설정 (중복 요청 방지)
      processedRef.current = true;
      sessionStorage.setItem(inFlightKey, '1');
      
      try {
        // 모바일 리다이렉트 플로우: 여기서 검증 수행
        console.log('🔵 모바일 리다이렉트 플로우: 백엔드 검증 시작');
        
        const storedSuccessData = sessionStorage.getItem('used_payment_success_data');
        if (!storedSuccessData) {
          console.error('결제 성공 정보를 찾을 수 없습니다.');
          setError('결제 정보를 찾을 수 없습니다.');
          setLoading(false);
          return;
        }
        
        const parsedData = JSON.parse(storedSuccessData);
        const paymentKey = parsedData.paymentKey;
        const amount = parsedData.amount || parsedData.card;
        const usedTradeIdxRaw = parsedData.usedTradeIdx || parsedData.tradeIdx;
        const usedItemIdx = parsedData.usedItemIdx;
        
        // usedTradeIdx 파싱
        let usedTradeIdx = null;
        if (usedTradeIdxRaw) {
          if (typeof usedTradeIdxRaw === 'number') {
            usedTradeIdx = usedTradeIdxRaw > 0 ? usedTradeIdxRaw : null;
          } else if (typeof usedTradeIdxRaw === 'string' && usedTradeIdxRaw.trim() !== '') {
            const parsed = parseInt(usedTradeIdxRaw.trim(), 10);
            usedTradeIdx = !isNaN(parsed) && parsed > 0 ? parsed : null;
          }
        }
        
        if (!orderId || !paymentKey || !usedTradeIdx || isNaN(usedTradeIdx) || usedTradeIdx <= 0) {
          console.warn('백엔드 검증을 위한 필수 정보가 없습니다:', { 
            orderId, 
            paymentKey, 
            usedTradeIdx: usedTradeIdxRaw,
            parsedUsedTradeIdx: usedTradeIdx
          });
          setError('결제 검증에 필요한 정보가 없습니다.');
          setLoading(false);
          return;
        }
        
        const requestData = {
          paymentKey: paymentKey,
          orderId: orderId,
          amount: amount || parsedData.card || parsedData.amount,
          totalPrice: amount || parsedData.amount,
          type: "used_hotel",
          customerIdx: parsedData.customerIdx || null,
          usedTradeIdx: usedTradeIdx,
          usedItemIdx: usedItemIdx ? parseInt(usedItemIdx, 10) : (parsedData.usedItemIdx ? parseInt(parsedData.usedItemIdx, 10) : null),
          customerName: parsedData.customerName || '',
          customerEmail: parsedData.customerEmail || '',
          customerPhone: parsedData.customerPhone || '',
          method: (amount || parsedData.card || parsedData.amount) > 0 ? "mixed" : "cash_point_only",
          pointsUsed: parsedData.point || 0,
          cashUsed: parsedData.cash || 0,
        };
        
        console.log('📤 모바일 리다이렉트 플로우: 백엔드 검증 요청', {
          orderId: requestData.orderId,
          paymentKey: requestData.paymentKey ? '***' : undefined,
          amount: requestData.amount,
          usedTradeIdx: requestData.usedTradeIdx
        });
        
        const response = await axios.post('/payments/confirm', requestData);
        
        if (response.data.success) {
          console.log('✅ 모바일 리다이렉트 플로우: 백엔드 검증 및 DB 업데이트 완료');
          sessionStorage.setItem(processedKey, '1');
          setIsVerified(true);
        } else {
          console.error('백엔드 검증 실패:', response.data.message);
          setError(response.data.message || '결제 검증에 실패했습니다.');
          // 실패 시 processedRef를 false로 되돌려서 재시도 가능하게 함
          processedRef.current = false;
        }
      } catch (error) {
        console.error('백엔드 검증 오류:', error);
        
        // 400 에러가 "이미 처리된 결제"인 경우 성공으로 처리
        if (error.response?.status === 400) {
          const errorMessage = error.response?.data?.message || 
                               error.response?.data?.error || 
                               JSON.stringify(error.response?.data) || '';
          
          if (errorMessage.includes('이미 처리된') || errorMessage.includes('기존 요청을 처리중')) {
            console.log('✅ 이미 처리된 결제입니다. 성공으로 처리합니다.');
            sessionStorage.setItem(processedKey, '1');
            setIsVerified(true);
          } else {
            setError(`결제 검증 실패: ${errorMessage}`);
            processedRef.current = false;
          }
        } else {
          setError(error.response?.data?.message || error.message || '결제 검증 중 오류가 발생했습니다.');
          processedRef.current = false;
        }
      } finally {
        // inFlight 플래그 제거
        sessionStorage.removeItem(inFlightKey);
        setLoading(false);
      }
    };
    
    if (successData && !processedRef.current) {
      run();
    }
  }, [successData]);

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
      <div className="flex-1 flex items-center justify-center py-20">
        <div className="text-center max-w-md px-4">
          {/* 로딩 애니메이션 */}
          <div className="relative mb-8">
            <div className="animate-spin rounded-full h-20 w-20 border-b-4 border-blue-600 mx-auto"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-blue-600 text-2xl">💳</div>
            </div>
          </div>

          {/* 로딩 메시지 */}
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            결제를 처리하고 있습니다
          </h2>
          <p className="text-gray-600 mb-6">
            결제 정보를 검증하고 데이터베이스를 업데이트 중입니다.
            <br />
            잠시만 기다려주세요...
          </p>

          {/* 안내 메시지 */}
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              ⚠️ 페이지를 새로고침하거나 닫지 마세요
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center py-20">
        <div className="max-w-md mx-auto px-4">
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <div className="text-red-500 text-6xl mb-4">❌</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              결제 처리 실패
            </h1>
            <p className="text-red-600 mb-6">{error}</p>
            <button
              onClick={() => router.push('/used')}
              className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
            >
              중고 호텔로 돌아가기
            </button>
          </div>
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

