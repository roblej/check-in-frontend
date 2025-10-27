"use client";

import CashPointSection from "./CashPointSection";

const PaymentSummary = ({
  paymentDraft,
  remaining,
  customerCash,
  customerPoint,
  useCash,
  usePoint,
  onCashChange,
  onPointChange,
  onUseAllCash,
  onUseAllPoint,
  paymentAmounts,
  isFormValid,
  isLoading,
  onPaymentClick,
  onValidateForm,
}) => {
  const minutes = Math.floor(remaining / 60000);
  const seconds = Math.floor((remaining % 60000) / 1000);

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
      </div>

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
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-yellow-600">⏰</span>
          <span className="text-sm font-medium text-yellow-800">
            결제 유효시간
          </span>
        </div>
        <div className="text-lg font-bold text-yellow-900">
          {minutes}:{seconds.toString().padStart(2, "0")}
        </div>
        <p className="text-xs text-yellow-700 mt-1">
          시간이 지나면 예약이 자동으로 취소됩니다.
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
        disabled={isLoading || remaining <= 0}
        className={`w-full py-3 px-4 rounded-lg font-medium transition-colors mb-4 ${
          isFormValid && remaining > 0 && !isLoading
            ? "bg-blue-500 hover:bg-blue-600 text-white"
            : "bg-gray-300 text-gray-500 cursor-not-allowed"
        }`}
      >
        {isLoading
          ? "결제 처리 중..."
          : remaining <= 0
          ? "결제 시간 만료"
          : `₩${paymentAmounts.actualPaymentAmount.toLocaleString()} 결제하기`}
      </button>

      <div className="text-xs text-gray-500 text-center">
        결제 완료 후 호텔 예약이 자동으로 확정됩니다.
      </div>
    </div>
  );
};

export default PaymentSummary;
