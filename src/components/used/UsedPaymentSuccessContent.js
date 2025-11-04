'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { usedAPI } from '@/lib/api/used';

const UsedPaymentSuccessContent = ({ initialData }) => {
  const router = useRouter();
  const processedRef = useRef(false);
  const [successData, setSuccessData] = useState(initialData);

  // 세션 스토리지에서 결제 성공 정보 가져오기 (URL 파라미터 완전히 숨김)
  useEffect(() => {
    try {
      const storedSuccessData = sessionStorage.getItem('used_payment_success');
      
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
        hotelName: parsedData.hotelName || '호텔명',
        roomType: parsedData.roomType || '객실 정보',
        checkIn: parsedData.checkIn || '',
        checkOut: parsedData.checkOut || ''
      });
    } catch (error) {
      console.error('세션 스토리지 데이터 읽기 실패:', error);
      alert('결제 정보를 불러오는 중 오류가 발생했습니다.');
      router.push('/used');
    }
  }, [router]);

  // 모바일 리다이렉트 플로우에서 결제 저장/거래 확정을 수행 (세션 스토리지에서 읽기)
  useEffect(() => {
    const run = async () => {
      if (processedRef.current) return;
      
      try {
        const storedSuccessData = sessionStorage.getItem('used_payment_success');
        if (!storedSuccessData) return;

        const parsedData = JSON.parse(storedSuccessData);
        const orderId = parsedData.orderId;
        const paymentKey = parsedData.paymentKey;
        const usedTradeIdx = parsedData.tradeIdx;

        if (!orderId || !paymentKey || !usedTradeIdx) return; // 부족하면 skip

        const processedKey = `used_payment_processed_${orderId}`;
        if (sessionStorage.getItem(processedKey) === '1') return;

        // 결제 내역 저장 (거래 확정 포함)
        // 주의: 백엔드 createPayment에서 이미 거래 확정까지 처리하므로
        // 별도로 confirmTrade를 호출하지 않음
        // 모바일은 분할 정보 없음 -> 전액 카드 처리
        const amount = parsedData.amount || 0;
        const paymentData = {
          usedTradeIdx: parseInt(usedTradeIdx, 10),
          paymentKey,
          orderId,
          totalAmount: amount,
          cashAmount: parsedData.cash || 0,
          pointAmount: parsedData.point || 0,
          cardAmount: parsedData.card || amount,
          paymentMethod: (parsedData.card > 0) ? 'card' : 'cash_point_only',
          status: 1,
          receiptUrl: `https://toss.im/payments/receipt/${orderId}`,
          qrUrl: `https://chart.googleapis.com/chart?chs=240x240&cht=qr&chl=${encodeURIComponent(JSON.stringify({ orderId, paymentKey, amount, usedTradeIdx }))}`,
          approvedAt: new Date().toISOString(),
        };

        try {
          await usedAPI.createPayment(paymentData);
        } catch (error) {
          console.error('모바일 결제 내역 저장 실패:', error.response?.data?.message || error.message);
        }

        sessionStorage.setItem(processedKey, '1');
        processedRef.current = true;
      } catch (e) {
        console.error('모바일 결제 처리 오류:', e);
      }
    };
    run();
  }, []);

  const handleNavigateToUsed = () => {
    // 세션 스토리지 정리
    sessionStorage.removeItem('used_payment_success');
    router.push('/used');
  };

  const handleNavigateToMypage = () => {
    // 세션 스토리지 정리
    sessionStorage.removeItem('used_payment_success');
    router.push('/mypage');
  };

  const handlePrint = () => {
    window.print();
  };

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
        <button
          onClick={handlePrint}
          className="px-8 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors"
        >
          영수증 인쇄
        </button>
      </div>
    </div>
  );
};

export default UsedPaymentSuccessContent;
