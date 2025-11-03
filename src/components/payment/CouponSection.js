"use client";

/**
 * 쿠폰 선택 섹션 (스크롤 목록, 단일 선택)
 * @param {Array} availableCoupons - 사용 가능 쿠폰 목록 [{couponIdx,name,discountAmount,endDate}]
 * @param {Function} onSelectCoupon - 쿠폰 선택 핸들러
 * @param {Function} onRemoveCoupon - 쿠폰 제거 핸들러
 * @param {Object|null} appliedCoupon - 적용된 쿠폰 정보
 * @param {boolean} isLoading - 쿠폰 로딩 여부
 */
const CouponSection = ({
  availableCoupons = [],
  onSelectCoupon,
  onRemoveCoupon,
  appliedCoupon,
  isLoading,
}) => {
  return (
    <div className="space-y-3 mb-6">
      <h3 className="text-lg font-semibold text-gray-900">쿠폰</h3>

      {appliedCoupon ? (
        // 적용된 쿠폰 표시
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-green-600 text-xl">🎫</span>
              <span className="text-sm font-medium text-green-800">
                적용된 쿠폰
              </span>
            </div>
            <button
              onClick={onRemoveCoupon}
              className="text-xs text-red-600 hover:text-red-700 font-medium"
            >
              제거
            </button>
          </div>
          <div className="text-gray-900 font-semibold">
            {appliedCoupon.name}
          </div>
          <div className="text-green-600 font-bold text-lg mt-1">
            -{appliedCoupon.discountAmount.toLocaleString()}원 할인
          </div>
        </div>
      ) : (
        // 쿠폰 목록 스크롤 선택
        <div className="space-y-2">
          <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-md divide-y">
            {isLoading ? (
              <div className="p-3 text-sm text-gray-500">
                쿠폰을 불러오는 중...
              </div>
            ) : availableCoupons.length === 0 ? (
              <div className="p-3 text-sm text-gray-500">
                사용 가능한 쿠폰이 없습니다.
              </div>
            ) : (
              availableCoupons.map((c) => (
                <button
                  key={c.couponIdx}
                  onClick={() => onSelectCoupon && onSelectCoupon(c)}
                  className="w-full text-left p-3 hover:bg-gray-50 focus:outline-none focus:bg-gray-50"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {c.name}
                      </div>
                      <div className="text-xs text-gray-500">
                        -{Number(c.discountAmount || 0).toLocaleString()}원 할인
                        {c.endDate ? ` · ~${c.endDate}` : ""}
                      </div>
                    </div>
                    <span className="text-blue-600 text-sm font-medium">
                      적용
                    </span>
                  </div>
                </button>
              ))
            )}
          </div>
          <p className="text-xs text-gray-500">
            쿠폰은 1개만 사용할 수 있습니다.
          </p>
        </div>
      )}
    </div>
  );
};

export default CouponSection;
