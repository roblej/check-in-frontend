"use client";

/**
 * 호텔 기본 정보 컴포넌트
 * @param {Object} props
 * @param {Object} props.hotelData - 호텔 데이터 객체
 */
const HotelInfo = ({ hotelData }) => {
  return (
    <div className="bg-white rounded-lg p-6 mb-6 shadow">
      <h2 className="text-2xl font-bold mb-3">{hotelData.name}</h2>
      <p className="text-gray-600 mb-4">{hotelData.description}</p>
      <div className="flex items-center gap-6 text-sm">
        <div>
          <span className="text-gray-500">체크인:</span>
          <span className="font-medium ml-2">{hotelData.checkInTime}</span>
        </div>
        <div>
          <span className="text-gray-500">체크아웃:</span>
          <span className="font-medium ml-2">{hotelData.checkOutTime}</span>
        </div>
        <div className="flex items-center gap-1">
          {[...Array(5)].map((_, i) => (
            <span
              key={i}
              className={`text-sm ${
                i < hotelData.starRating ? "text-yellow-400" : "text-gray-300"
              }`}
            >
              ★
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HotelInfo;
