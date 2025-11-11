'use client';

import { Gift } from 'lucide-react';

export default function CouponSection({ couponTab, setCouponTab, coupons, isLoading }) {
  const currentCoupons = coupons?.[couponTab] ?? [];

  const renderDiscount = (coupon) => {
    if (coupon.discount) {
      return coupon.discount;
    }
    if (typeof coupon.discountAmount === 'number' && !Number.isNaN(coupon.discountAmount)) {
      return `${coupon.discountAmount.toLocaleString()}원`;
    }
    return '할인 정보 없음';
  };

  const renderCoupons = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center py-10 text-sm text-gray-500">
          쿠폰을 불러오는 중입니다...
        </div>
      );
    }

    if (!currentCoupons.length) {
      return (
        <div className="flex items-center justify-center py-10 text-sm text-gray-500">
          표시할 쿠폰이 없습니다.
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {currentCoupons.map((coupon) => (
          <div
            key={coupon.id}
            className={`border-2 rounded-lg sm:rounded-xl p-4 sm:p-5 transition-all ${
              couponTab === 'available'
                ? 'border-blue-300 bg-blue-50 hover:shadow-lg'
                : 'border-gray-200 bg-gray-50'
            }`}
          >
            <div className="flex items-start justify-between mb-3">
              <Gift className={`w-8 h-8 ${couponTab === 'available' ? 'text-blue-600' : 'text-gray-400'}`} />
              <span className={`text-2xl font-bold ${couponTab === 'available' ? 'text-blue-600' : 'text-gray-400'}`}>
                {renderDiscount(coupon)}
              </span>
            </div>
            <h3 className={`font-bold mb-2 ${couponTab === 'available' ? 'text-gray-900' : 'text-gray-500'}`}>
              {coupon.name}
            </h3>
            <p className="text-xs text-gray-500 mb-3">{coupon.condition || '예약 결제 시 사용 가능합니다.'}</p>
            <div className="text-xs">
              <span className={couponTab === 'available' ? 'text-gray-600' : 'text-gray-400'}>
                {couponTab === 'used'
                  ? `사용일: ${coupon.usedDate || '사용일 정보 없음'}`
                  : `만료일: ${coupon.expiry || '만료일 정보 없음'}`}
              </span>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <section className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 mb-4 sm:mb-6 border border-gray-200">
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <h2 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center gap-2">
          <Gift className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
          쿠폰 관리
        </h2>
      </div>

      <div className="flex gap-1 sm:gap-2 mb-4 sm:mb-6 border-b border-gray-200 overflow-x-auto scrollbar-hide">
        <button
          onClick={() => setCouponTab('available')}
          className={`px-3 sm:px-6 py-2 sm:py-3 text-xs sm:text-sm font-medium transition-all border-b-2 whitespace-nowrap ${
            couponTab === 'available'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          사용가능 ({coupons.available.length})
        </button>
        <button
          onClick={() => setCouponTab('used')}
          className={`px-3 sm:px-6 py-2 sm:py-3 text-xs sm:text-sm font-medium transition-all border-b-2 whitespace-nowrap ${
            couponTab === 'used'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          사용완료 ({coupons.used.length})
        </button>
        <button
          onClick={() => setCouponTab('expired')}
          className={`px-3 sm:px-6 py-2 sm:py-3 text-xs sm:text-sm font-medium transition-all border-b-2 whitespace-nowrap ${
            couponTab === 'expired'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          기간만료 ({coupons.expired.length})
        </button>
      </div>

      {renderCoupons()}
    </section>
  );
}

