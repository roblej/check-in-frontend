import { Suspense } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import UsedPaymentSuccessContent from '@/components/used/UsedPaymentSuccessContent';

const UsedHotelPaymentSuccessPage = async () => {
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
        <UsedPaymentSuccessContent />
      </Suspense>

      <Footer />
    </div>
  );
};

export default UsedHotelPaymentSuccessPage;
