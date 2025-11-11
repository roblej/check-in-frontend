"use client";

/**
 * 호텔 이용 정책 컴포넌트
 * @param {Object} props
 * @param {string} [props.checkInTime=""] - 체크인 시간
 * @param {string} [props.checkOutTime=""] - 체크아웃 시간
 */
const HotelPolicy = ({ checkInTime = "", checkOutTime = "" }) => {
  return (
    <div className="bg-white rounded-lg p-6 shadow">
      <h2 id="policy-heading" className="text-2xl font-bold mb-4">
        이용 정책
      </h2>
      <div className="space-y-4 text-gray-700">
        {(checkInTime || checkOutTime) && (
          <div>
            <h3 className="font-semibold mb-2">체크인/체크아웃</h3>
            {checkInTime && (
              <p className="text-sm">• 체크인: {checkInTime} 이후</p>
            )}
            {checkOutTime && (
              <p className="text-sm">• 체크아웃: {checkOutTime} 이전</p>
            )}
          </div>
        )}
        <div>
          <h3 className="font-semibold mb-2">취소 정책</h3>
          <p className="text-sm">• 체크인 7일 전및 체크인 당일은 무료 취소 가능</p>
          <p className="text-sm">• 그 외에는 정책에 따라 추가 수수료 및 환불 불가</p>
        </div>
        <div>
          <h3 className="font-semibold mb-2">아동 정책</h3>
          <p className="text-sm">• 모든 연령의 아동 투숙 가능</p>
          <p className="text-sm">• 투숙인원의 추가인원당 2만원의 추가요금이 발생 할 수 있습니다.</p>
        </div>
        <div>
          <h3 className="font-semibold mb-2">반려동물</h3>
          <p className="text-sm">• 반려동물 동반 불가</p>
        </div>
      </div>
    </div>
  );
};

export default HotelPolicy;
