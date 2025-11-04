import { Suspense } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import UsedPaymentForm from '@/components/used/UsedPaymentForm';

const UsedHotelPaymentPage = async () => {
  // URL 파라미터를 완전히 제거하고 세션 스토리지만 사용
  // 클라이언트에서 세션 스토리지에서 거래 ID를 읽어옴
  
  // 기본 초기 데이터 (클라이언트에서 세션 스토리지로 덮어씌움)
  const initialData = {
    usedItemIdx: '',
    usedTradeIdx: null, // 클라이언트에서 세션 스토리지에서 읽어옴
    hotelName: '호텔명',
    hotelImage: null,
    hotelAddress: '호텔 주소',
    roomType: '스탠다드룸',
    checkIn: '2025-01-20',
    checkOut: '2025-01-22',
    guests: 2,
    originalPrice: 0,
    salePrice: 0,
    seller: '판매자',
    nights: 0,
    discountAmount: 0
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
          <UsedPaymentForm initialData={initialData} />

      <Footer />
    </div>
  );
};

export default UsedHotelPaymentPage;