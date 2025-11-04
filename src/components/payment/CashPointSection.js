"use client";

/**
 * 캐시 및 포인트 입력 섹션 컴포넌트
 * @param {number} customerCash - 보유 캐시
 * @param {number} customerPoint - 보유 포인트
 * @param {number} useCash - 사용할 캐시
 * @param {number} usePoint - 사용할 포인트
 * @param {Function} onCashChange - 캐시 변경 핸들러
 * @param {Function} onPointChange - 포인트 변경 핸들러
 * @param {Function} onUseAllCash - 전체 캐시 사용 핸들러
 * @param {Function} onUseAllPoint - 전체 포인트 사용 핸들러
 * @param {number} totalAmount - 총 결제 금액 (쿠폰 할인 후 금액)
 * @param {number} couponDiscount - 쿠폰 할인 금액
 */
const CashPointSection = ({
  customerCash,
  customerPoint,
  useCash,
  usePoint,
  onCashChange,
  onPointChange,
  onUseAllCash,
  onUseAllPoint,
  totalAmount,
  couponDiscount = 0,
}) => {
  const maxCash = Math.min(useCash, customerCash);
  const maxPoint = Math.min(usePoint, customerPoint);
  const availableCashPoint = maxCash + maxPoint;
  // totalAmount는 이미 쿠폰 할인이 적용된 금액이므로 그대로 사용
  const actualPaymentAmount = Math.max(0, totalAmount - availableCashPoint);

  // 원래 금액 계산 (표시용)
  const originalAmount = totalAmount + couponDiscount;

  /**
   * 숫자 입력 처리 (0으로 시작 불가)
   * @param {string} value - 입력값
   * @returns {string} - 정제된 값
   */
  const handleNumericInput = (value) => {
    // 숫자만 추출
    const numericValue = value.replace(/[^0-9]/g, "");

    // 빈 문자열이면 그대로 반환
    if (numericValue === "") return "";

    // 0으로 시작하는 경우 (예: "01000") 앞의 0 제거
    return numericValue.replace(/^0+/, "") || "0";
  };

  /**
   * 캐시 입력 핸들러
   */
  const handleCashInput = (e) => {
    const sanitized = handleNumericInput(e.target.value);
    onCashChange(sanitized);
  };

  /**
   * 포인트 입력 핸들러
   */
  const handlePointInput = (e) => {
    const sanitized = handleNumericInput(e.target.value);
    onPointChange(sanitized);
  };

  return (
    <div className="space-y-4 mb-6">
      <h3 className="text-lg font-semibold text-gray-900">결제 방식</h3>

      {/* 캐시 사용 */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <label className="text-sm font-medium text-gray-700">
            캐시 사용 (보유: {customerCash.toLocaleString()}원)
          </label>
          <button
            onClick={onUseAllCash}
            className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded hover:bg-blue-200"
          >
            전체 사용
          </button>
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={useCash || ""}
            onChange={handleCashInput}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="사용할 캐시 금액"
          />
          <span className="text-sm text-gray-500 self-center">원</span>
        </div>
      </div>

      {/* 포인트 사용 */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <label className="text-sm font-medium text-gray-700">
            포인트 사용 (보유: {customerPoint.toLocaleString()}P)
          </label>
          <button
            onClick={onUseAllPoint}
            className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded hover:bg-blue-200"
          >
            전체 사용
          </button>
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={usePoint || ""}
            onChange={handlePointInput}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="사용할 포인트"
          />
          <span className="text-sm text-gray-500 self-center">P</span>
        </div>
      </div>

      {/* 결제 내역 요약 */}
      <div className="bg-gray-50 rounded-lg p-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">총 결제 금액</span>
          <span className="text-gray-900 font-semibold">
            {originalAmount.toLocaleString()}원
          </span>
        </div>
        {couponDiscount > 0 && (
          <div className="flex justify-between text-sm text-green-600 font-medium">
            <span>쿠폰 할인</span>
            <span>-{couponDiscount.toLocaleString()}원</span>
          </div>
        )}
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">캐시 결제</span>
          <span className="text-blue-600">{maxCash.toLocaleString()}원</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">포인트 결제</span>
          <span className="text-blue-600">{maxPoint.toLocaleString()}P</span>
        </div>
        <hr className="my-2" />
        <div className="flex justify-between font-semibold">
          <span>실제 결제 금액</span>
          <span className="text-blue-600">
            {actualPaymentAmount.toLocaleString()}원
          </span>
        </div>
      </div>
    </div>
  );
};

export default CashPointSection;
