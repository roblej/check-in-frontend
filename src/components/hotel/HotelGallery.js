"use client";

/**
 * 호텔 이미지 갤러리 컴포넌트
 * @param {Object} props
 * @param {Array} props.images - 호텔 이미지 배열
 * @param {boolean} props.isModal - 모달 모드 여부
 */
const HotelGallery = ({ images, isModal = false }) => {
  return (
    <div
      className={`mb-6 grid grid-cols-2 md:grid-cols-4 gap-2 ${
        isModal ? "h-48" : "h-80"
      }`}
    >
      {/* 메인 이미지 */}
      <div className="col-span-2 row-span-2 relative bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg overflow-hidden cursor-pointer hover:shadow-lg transition-shadow group">
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-6xl mb-3 group-hover:scale-110 transition-transform">
            🏨
          </span>
          <span className="text-sm text-gray-600">메인 이미지</span>
        </div>
        <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
          +{images.length}
        </div>
      </div>

      {/* 서브 이미지들 */}
      {[1, 2, 3, 4].map((idx) => (
        <div
          key={idx}
          className="relative bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg overflow-hidden cursor-pointer hover:shadow-lg transition-shadow group"
        >
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-3xl group-hover:scale-110 transition-transform">
              🖼️
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default HotelGallery;
