"use client";

/**
 * @typedef {Object} HotelData
 * @property {string} name - 호텔 이름
 * @property {string} description - 호텔 설명
 * @property {string} checkInTime - 체크인 시간
 * @property {string} checkOutTime - 체크아웃 시간
 * @property {number} starRating - 별점 (0-5)
 */

/**
 * 호텔 기본 정보 컴포넌트
 * @param {Object} props
 * @param {HotelData} props.hotelData - 호텔 데이터 객체
 * @param {boolean} [props.isModal] - 모달 모드 여부 (모달일 때 호텔명 숨김)
 */
const HotelInfo = ({ hotelData, isModal = false }) => {
  if (!hotelData) return null;

  const { name, description, checkInTime, checkOutTime, starRating } =
    hotelData;

  return (
    <div className="bg-white rounded-lg p-6 mb-6 shadow">
      {!isModal && (
        <h2 className="text-2xl font-bold mb-3">{name || "호텔 정보 없음"}</h2>
      )}
      {description && <p className="text-gray-600 mb-4">{description}</p>}
      <div className="flex items-center gap-6 text-sm flex-wrap">
        {checkInTime && (
          <div>
            <span className="text-gray-500">체크인:</span>
            <span className="font-medium ml-2">{checkInTime}</span>
          </div>
        )}
        {checkOutTime && (
          <div>
            <span className="text-gray-500">체크아웃:</span>
            <span className="font-medium ml-2">{checkOutTime}</span>
          </div>
        )}
        {starRating > 0 && (
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <span
                key={i}
                className={`text-sm ${
                  i < starRating ? "text-yellow-400" : "text-gray-300"
                }`}
              >
                ★
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HotelInfo;
