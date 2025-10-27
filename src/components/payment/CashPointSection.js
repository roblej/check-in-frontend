"use client";

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
}) => {
  const maxCash = Math.min(useCash, customerCash);
  const maxPoint = Math.min(usePoint, customerPoint);
  const availableCashPoint = maxCash + maxPoint;
  const actualPaymentAmount = Math.max(0, totalAmount - availableCashPoint);

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
            type="number"
            value={useCash}
            onChange={(e) => onCashChange(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="사용할 캐시 금액"
            min="0"
            max={customerCash}
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
            type="number"
            value={usePoint}
            onChange={(e) => onPointChange(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="사용할 포인트"
            min="0"
            max={customerPoint}
          />
          <span className="text-sm text-gray-500 self-center">P</span>
        </div>
      </div>

      {/* 결제 내역 요약 */}
      <div className="bg-gray-50 rounded-lg p-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">총 결제 금액</span>
          <span className="text-gray-900 font-semibold">
            {totalAmount.toLocaleString()}원
          </span>
        </div>
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
