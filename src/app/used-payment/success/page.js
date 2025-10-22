import { Suspense } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import UsedPaymentSuccessContent from '@/components/used/UsedPaymentSuccessContent';

const UsedHotelPaymentSuccessPage = async ({ searchParams }) => {
  // searchParams를 await로 처리
  const params = await searchParams;

  // 초기 데이터 생성 (한 번만 실행)
  const initialData = {
    orderId: params.orderId || '',
    amount: parseInt(params.amount) || 0,
    type: params.type || 'used_hotel',
    cash: parseInt(params.cash) || 0,
    point: parseInt(params.point) || 0,
    card: parseInt(params.card) || 0,
    tradeIdx: params.tradeIdx || '',
    hotelName: params.hotelName || '호텔명',
    roomType: params.roomType || '객실 정보',
    checkIn: params.checkIn || '',
    checkOut: params.checkOut || ''
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">결제 정보를 불러오는 중...</p>
          </div>
        </div>
      }>
        <UsedPaymentSuccessContent initialData={initialData} />
      </Suspense>

      <Footer />
    </div>
  );
};

export default UsedHotelPaymentSuccessPage;
