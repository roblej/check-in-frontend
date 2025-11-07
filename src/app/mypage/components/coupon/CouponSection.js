'use client';

import { Gift } from 'lucide-react';

export default function CouponSection({ couponTab, setCouponTab, coupons }) {
  const renderCoupons = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {coupons[couponTab].map((coupon) => (
        <div
          key={coupon.id}
          className={`border-2 rounded-xl p-5 transition-all ${
            couponTab === 'available'
              ? 'border-blue-300 bg-blue-50 hover:shadow-lg'
              : 'border-gray-200 bg-gray-50'
          }`}
        >
          <div className="flex items-start justify-between mb-3">
            <Gift className={`w-8 h-8 ${couponTab === 'available' ? 'text-blue-600' : 'text-gray-400'}`} />
            <span className={`text-2xl font-bold ${couponTab === 'available' ? 'text-blue-600' : 'text-gray-400'}`}>
              {coupon.discount}
            </span>
          </div>
          <h3 className={`font-bold mb-2 ${couponTab === 'available' ? 'text-gray-900' : 'text-gray-500'}`}>
            {coupon.name}
          </h3>
          <p className="text-xs text-gray-500 mb-3">{coupon.condition}</p>
          <div className="text-xs">
            <span className={couponTab === 'available' ? 'text-gray-600' : 'text-gray-400'}>
              {couponTab === 'used' ? `사용일: ${coupon.usedDate}` : `만료일: ${coupon.expiry}`}
            </span>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <section className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <Gift className="w-6 h-6 text-blue-600" />
          쿠폰 관리
        </h2>
      </div>

      <div className="flex gap-2 mb-6 border-b border-gray-200">
        <button
          onClick={() => setCouponTab('available')}
          className={`px-6 py-3 font-medium transition-all border-b-2 ${
            couponTab === 'available'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          사용가능 ({coupons.available.length})
        </button>
        <button
          onClick={() => setCouponTab('used')}
          className={`px-6 py-3 font-medium transition-all border-b-2 ${
            couponTab === 'used'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          사용완료 ({coupons.used.length})
        </button>
        <button
          onClick={() => setCouponTab('expired')}
          className={`px-6 py-3 font-medium transition-all border-b-2 ${
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

