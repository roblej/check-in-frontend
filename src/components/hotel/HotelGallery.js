"use client";

/**
 * 호텔 이미지 갤러리 컴포넌트
 * @param {Object} props
 * @param {string[]} [props.images=[]] - 호텔 이미지 URL 배열
 * @param {boolean} [props.isModal=false] - 모달 모드 여부
 */
const HotelGallery = ({ images = [], isModal = false }) => {
  const safeImages = Array.isArray(images) ? images : [];
  const imageCount = safeImages.length;

  return (
    <div
      className={`mb-6 grid grid-cols-2 md:grid-cols-4 gap-2 ${
        isModal ? "h-48" : "h-80"
      }`}
      role="region"
      aria-label="호텔 이미지 갤러리"
    >
      {/* 메인 이미지 */}
      <div
        className="col-span-2 row-span-2 relative bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg overflow-hidden cursor-pointer hover:shadow-lg transition-shadow group"
        role="button"
        tabIndex={0}
        aria-label="호텔 메인 이미지 보기"
      >
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-6xl mb-3 group-hover:scale-110 transition-transform">
            🏨
          </span>
          <span className="text-sm text-gray-600">메인 이미지</span>
        </div>
        {imageCount > 0 && (
          <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
            +{imageCount}
          </div>
        )}
      </div>

      {/* 서브 이미지들 */}
      {[1, 2, 3, 4].map((idx) => (
        <div
          key={idx}
          className="relative bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg overflow-hidden cursor-pointer hover:shadow-lg transition-shadow group"
          role="button"
          tabIndex={0}
          aria-label={`호텔 이미지 ${idx} 보기`}
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
