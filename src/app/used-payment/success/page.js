'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const UsedHotelPaymentSuccessPage = () => {
  const searchParams = useSearchParams();
  const [paymentData, setPaymentData] = useState(null);

  useEffect(() => {
    const orderId = searchParams.get('orderId');
    const amount = searchParams.get('amount');
    const type = searchParams.get('type');
    const cash = searchParams.get('cash');
    const point = searchParams.get('point');
    const card = searchParams.get('card');
    const tradeIdx = searchParams.get('tradeIdx');
    const hotelName = searchParams.get('hotelName');
    const roomType = searchParams.get('roomType');
    const checkIn = searchParams.get('checkIn');
    const checkOut = searchParams.get('checkOut');

    setPaymentData({
      orderId,
      amount: parseInt(amount) || 0,
      type,
      cash: parseInt(cash) || 0,
      point: parseInt(point) || 0,
      card: parseInt(card) || 0,
      tradeIdx,
      hotelName,
      roomType,
      checkIn,
      checkOut
    });
  }, [searchParams]);

  if (!paymentData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">결제 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
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
                  <span className="font-medium">{paymentData.hotelName || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">객실:</span>
                  <span className="font-medium">{paymentData.roomType || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">체크인:</span>
                  <span className="font-medium">{paymentData.checkIn || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">체크아웃:</span>
                  <span className="font-medium">{paymentData.checkOut || 'N/A'}</span>
                </div>
              </div>
            </div>

            {/* 결제 상세 */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">결제 상세</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">주문번호:</span>
                  <span className="font-medium text-blue-600">{paymentData.orderId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">거래번호:</span>
                  <span className="font-medium text-blue-600">{paymentData.tradeIdx}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">총 결제금액:</span>
                  <span className="font-bold text-lg text-blue-600">{paymentData.amount.toLocaleString()}원</span>
                </div>
              </div>
            </div>
          </div>

          {/* 결제 방법별 금액 */}
          <div className="mt-8 pt-6 border-t">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">결제 방법별 금액</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {paymentData.cash > 0 && (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="text-sm text-blue-600 font-medium">캐시 사용</div>
                  <div className="text-xl font-bold text-blue-700">{paymentData.cash.toLocaleString()}원</div>
                </div>
              )}
              {paymentData.point > 0 && (
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="text-sm text-purple-600 font-medium">포인트 사용</div>
                  <div className="text-xl font-bold text-purple-700">{paymentData.point.toLocaleString()}P</div>
                </div>
              )}
              {paymentData.card > 0 && (
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="text-sm text-green-600 font-medium">카드 결제</div>
                  <div className="text-xl font-bold text-green-700">{paymentData.card.toLocaleString()}원</div>
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
            onClick={() => window.location.href = '/used'}
            className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
          >
            중고 호텔 더 보기
          </button>
          <button
            onClick={() => window.location.href = '/mypage'}
            className="px-8 py-3 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-700 transition-colors"
          >
            마이페이지
          </button>
          <button
            onClick={() => window.print()}
            className="px-8 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors"
          >
            영수증 인쇄
          </button>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default UsedHotelPaymentSuccessPage;
