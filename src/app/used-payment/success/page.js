import { Suspense } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import UsedPaymentSuccessContent from '@/components/used/UsedPaymentSuccessContent';

const UsedHotelPaymentSuccessPage = async () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      
      <Suspense fallback={
        <div className="flex-1 flex items-center justify-center py-20">
          <div className="text-center max-w-md px-4">
            <div className="relative mb-8">
              <div className="animate-spin rounded-full h-20 w-20 border-b-4 border-blue-600 mx-auto"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-blue-600 text-2xl">💳</div>
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              결제 정보를 불러오는 중...
            </h2>
            <p className="text-gray-600">잠시만 기다려주세요</p>
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
