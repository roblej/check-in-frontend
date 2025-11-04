import { Suspense } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import UsedPaymentSuccessContent from '@/components/used/UsedPaymentSuccessContent';

const UsedHotelPaymentSuccessPage = async () => {
  // URL 파라미터를 완전히 제거하고 세션 스토리지만 사용
  // 클라이언트에서 세션 스토리지에서 데이터를 읽어옴
  
  // 기본 초기 데이터 (클라이언트에서 세션 스토리지로 덮어씌움)
  const initialData = {
    orderId: '',
    amount: 0,
    type: 'used_hotel',
    cash: 0,
    point: 0,
    card: 0,
    tradeIdx: '',
    hotelName: '호텔명',
    roomType: '객실 정보',
    checkIn: '',
    checkOut: ''
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
