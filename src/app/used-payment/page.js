import { Suspense } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import UsedPaymentForm from '@/components/used/UsedPaymentForm';

const UsedHotelPaymentPage = async ({ searchParams }) => {
  // searchParams를 await로 처리
  const params = await searchParams;
  
  // 초기 데이터 생성 (한 번만 실행)
  const initialData = {
    usedItemIdx: params.usedItemIdx || '',
    hotelName: params.hotelName || '호텔명',
    hotelImage: params.hotelImage || null,
    hotelAddress: params.hotelAddress || '호텔 주소',
    roomType: params.roomType || '스탠다드룸',
    checkIn: params.checkIn || '2025-01-20',
    checkOut: params.checkOut || '2025-01-22',
    guests: parseInt(params.guests) || 2,
    originalPrice: parseInt(params.originalPrice) || 0,
    salePrice: parseInt(params.salePrice) || 0,
    seller: params.seller || '판매자',
    nights: Math.ceil((new Date(params.checkOut || '2025-01-22') - new Date(params.checkIn || '2025-01-20')) / (1000 * 60 * 60 * 24)),
    discountAmount: (parseInt(params.originalPrice) || 0) - (parseInt(params.salePrice) || 0)
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