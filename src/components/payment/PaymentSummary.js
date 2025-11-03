"use client";

import CashPointSection from "./CashPointSection";
import CouponSection from "./CouponSection";

/**
 * 결제 요약 컴포넌트
 * @param {Object} paymentDraft - 결제 정보
 * @param {number} remainingSeconds - 남은 시간 (초)
 * @param {number} customerCash - 보유 캐시
 * @param {number} customerPoint - 보유 포인트
 * @param {number} useCash - 사용할 캐시
 * @param {number} usePoint - 사용할 포인트
 * @param {Function} onCashChange - 캐시 변경 핸들러
 * @param {Function} onPointChange - 포인트 변경 핸들러
 * @param {Function} onUseAllCash - 전체 캐시 사용 핸들러
 * @param {Function} onUseAllPoint - 전체 포인트 사용 핸들러
 * @param {Array} availableCoupons - 사용 가능 쿠폰 목록
 * @param {Function} onSelectCoupon - 쿠폰 선택 핸들러
 * @param {Function} onRemoveCoupon - 쿠폰 제거 핸들러
 * @param {Object} appliedCoupon - 적용된 쿠폰
 * @param {boolean} isCouponLoading - 쿠폰 로딩 여부
 * @param {Object} paymentAmounts - 결제 금액 정보
 * @param {boolean} isFormValid - 폼 유효성 여부
 * @param {boolean} isLoading - 로딩 상태
 * @param {boolean} isCashPointOnly - 캐시/포인트 전액 사용 여부
 * @param {Function} onPaymentClick - 결제 버튼 클릭 핸들러
 * @param {Function} onValidateForm - 폼 검증 핸들러
 * @param {Function} onCancel - 취소 핸들러
 */
const PaymentSummary = ({
  paymentDraft,
  remainingSeconds,
  customerCash,
  customerPoint,
  useCash,
  usePoint,
  onCashChange,
  onPointChange,
  onUseAllCash,
  onUseAllPoint,
  availableCoupons,
  onSelectCoupon,
  onRemoveCoupon,
  appliedCoupon,
  isCouponLoading,
  paymentAmounts,
  isFormValid,
  isLoading,
  isCashPointOnly,
  onPaymentClick,
  onValidateForm,
  onCancel,
}) => {
  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 sticky top-8">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">가격 요약</h2>

      <div className="space-y-3 mb-6">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">객실 가격</span>
          <span>₩{paymentDraft.meta.roomPrice.toLocaleString()}/박</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">숙박 일수</span>
          <span>{paymentDraft.meta.nights}박</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">세금 및 수수료</span>
          <span>포함</span>
        </div>
        <hr className="my-3" />
        <div className="flex justify-between text-lg font-semibold">
          <span>총 결제 금액</span>
          <span className="text-blue-600">
            ₩{paymentDraft.finalAmount.toLocaleString()}
          </span>
        </div>

        {/* 쿠폰 할인 표시 */}
        {paymentAmounts.couponDiscount > 0 && (
          <div className="flex justify-between text-sm text-green-600 font-medium">
            <span>쿠폰 할인</span>
            <span>-₩{paymentAmounts.couponDiscount.toLocaleString()}</span>
          </div>
        )}
      </div>

      {/* 쿠폰 섹션 */}
      <CouponSection
        availableCoupons={availableCoupons}
        onSelectCoupon={onSelectCoupon}
        onRemoveCoupon={onRemoveCoupon}
        appliedCoupon={appliedCoupon}
        isLoading={isCouponLoading}
      />

      {/* 캐시 및 포인트 사용 */}
      <CashPointSection
        customerCash={customerCash}
        customerPoint={customerPoint}
        useCash={useCash}
        usePoint={usePoint}
        onCashChange={onCashChange}
        onPointChange={onPointChange}
        onUseAllCash={onUseAllCash}
        onUseAllPoint={onUseAllPoint}
        totalAmount={paymentDraft.finalAmount}
      />

      {/* 결제 유효시간 */}
      <div
        className={`border rounded-lg p-4 mb-6 ${
          remainingSeconds <= 60
            ? "bg-red-50 border-red-200"
            : "bg-yellow-50 border-yellow-200"
        }`}
      >
        <div className="flex items-center gap-2 mb-2">
          <span
            className={
              remainingSeconds <= 60 ? "text-red-600" : "text-yellow-600"
            }
          >
            ⏰
          </span>
          <span
            className={`text-sm font-medium ${
              remainingSeconds <= 60 ? "text-red-800" : "text-yellow-800"
            }`}
          >
            결제 유효시간
          </span>
        </div>
        <div
          className={`text-2xl font-bold ${
            remainingSeconds <= 60 ? "text-red-900" : "text-yellow-900"
          }`}
        >
          {minutes}:{seconds.toString().padStart(2, "0")}
        </div>
        <p
          className={`text-xs mt-1 ${
            remainingSeconds <= 60 ? "text-red-700" : "text-yellow-700"
          }`}
        >
          {remainingSeconds <= 60
            ? "⚠️ 시간이 얼마 남지 않았습니다!"
            : "시간이 지나면 예약이 자동으로 취소됩니다."}
        </p>
      </div>

      {/* 결제 버튼 */}
      <button
        onClick={async () => {
          if (isFormValid) {
            if (onPaymentClick) {
              await onPaymentClick();
            }
          } else {
            if (onValidateForm) {
              onValidateForm();
            }
            alert("모든 필수 정보를 입력하고 약관에 동의해주세요.");
          }
        }}
        disabled={isLoading || remainingSeconds <= 0 || isCashPointOnly}
        className={`w-full py-3 px-4 rounded-lg font-medium transition-colors mb-4 ${
          isFormValid && remainingSeconds > 0 && !isLoading && !isCashPointOnly
            ? "bg-blue-500 hover:bg-blue-600 text-white"
            : "bg-gray-300 text-gray-500 cursor-not-allowed"
        }`}
      >
        {isLoading
          ? "결제 처리 중..."
          : remainingSeconds <= 0
          ? "결제 시간 만료"
          : isCashPointOnly
          ? "카드 결제 필요 (최소 10%)"
          : `₩${paymentAmounts.actualPaymentAmount.toLocaleString()} 결제하기`}
      </button>

      <div className="text-xs text-gray-500 text-center mb-2">
        결제 완료 후 호텔 예약이 자동으로 확정됩니다.
      </div>
      <div className="text-xs text-gray-600 text-center mb-4">
        포인트 악용 시 계정 정지 및 환불 불가합니다. 쿠폰과 포인트는 환불 시
        복구되지 않습니다.
      </div>

      {/* 취소 버튼 */}
      {onCancel && (
        <button
          onClick={onCancel}
          className="w-full py-2 text-red-600 hover:text-red-700 hover:bg-red-50 border border-red-300 rounded-lg transition-colors font-medium"
        >
          취소하고 돌아가기
        </button>
      )}
    </div>
  );
};

export default PaymentSummary;
