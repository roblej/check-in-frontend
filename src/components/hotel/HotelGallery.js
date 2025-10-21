"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { hotelAPI } from "@/lib/api/hotel";

/**
 * 호텔 이미지 갤러리 컴포넌트
 * @param {Object} props
 * @param {string} props.contentId - 호텔 contentId
 * @param {boolean} [props.isModal=false] - 모달 모드 여부
 */
const HotelGallery = ({ contentId, isModal = false }) => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [galleryModal, setGalleryModal] = useState({
    isOpen: false,
    currentIndex: 0,
  });

  useEffect(() => {
    const fetchImages = async () => {
      try {
        setLoading(true);
        const data = await hotelAPI.getHotelImages(contentId);
        setImages(data || []);
      } catch (err) {
        console.error("이미지 로딩 오류:", err);
        setError("이미지를 불러올 수 없습니다.");
      } finally {
        setLoading(false);
      }
    };

    if (contentId) {
      fetchImages();
    }
  }, [contentId]);

  // 모달 열릴 때 body 스크롤 막기
  useEffect(() => {
    if (galleryModal.isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [galleryModal.isOpen]);

  const handleImageClick = (imageIndex) => {
    setGalleryModal({ isOpen: true, currentIndex: imageIndex });
  };

  const handleCloseGallery = () => {
    setGalleryModal({ isOpen: false, currentIndex: 0 });
  };

  const handlePrevImage = () => {
    setGalleryModal((prev) => ({
      ...prev,
      currentIndex:
        prev.currentIndex > 0 ? prev.currentIndex - 1 : images.length - 1,
    }));
  };

  const handleNextImage = () => {
    setGalleryModal((prev) => ({
      ...prev,
      currentIndex:
        prev.currentIndex < images.length - 1 ? prev.currentIndex + 1 : 0,
    }));
  };

  const handleKeyDown = (e) => {
    if (e.key === "Escape") {
      handleCloseGallery();
    } else if (e.key === "ArrowLeft") {
      handlePrevImage();
    } else if (e.key === "ArrowRight") {
      handleNextImage();
    }
  };

  if (loading) {
    return (
      <div
        className={`mb-6 grid grid-cols-2 md:grid-cols-4 gap-2 ${
          isModal ? "h-48" : "h-80"
        }`}
      >
        {[1, 2, 3, 4, 5].map((idx) => (
          <div
            key={idx}
            className="bg-gray-200 rounded-lg animate-pulse"
            style={{ height: idx === 1 ? "100%" : "100px" }}
          />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={`mb-6 grid grid-cols-2 md:grid-cols-4 gap-2 ${
          isModal ? "h-48" : "h-80"
        }`}
      >
        <div className="col-span-2 row-span-2 bg-gray-100 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <span className="text-4xl mb-2">📷</span>
            <p className="text-sm text-gray-600">이미지를 불러올 수 없습니다</p>
          </div>
        </div>
        {[1, 2, 3, 4].map((idx) => (
          <div
            key={idx}
            className="bg-gray-100 rounded-lg flex items-center justify-center"
          >
            <span className="text-2xl">🖼️</span>
          </div>
        ))}
      </div>
    );
  }

  const safeImages = Array.isArray(images) ? images : [];
  const imageCount = safeImages.length;

  return (
    <div className="mb-6">
      <div
        className={`grid grid-cols-2 md:grid-cols-4 gap-2 ${
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
          onClick={() => handleImageClick(0)}
          onKeyDown={(e) => e.key === "Enter" && handleImageClick(0)}
        >
          {safeImages[0] ? (
            <Image
              src={safeImages[0].originUrl || safeImages[0].smallUrl}
              alt={`${contentId} 호텔 메인 이미지`}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-6xl mb-3 group-hover:scale-110 transition-transform">
                🏨
              </span>
              <span className="text-sm text-gray-600">메인 이미지</span>
            </div>
          )}
          {imageCount > 1 && (
            <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
              +{imageCount - 1}
            </div>
          )}
        </div>

        {/* 서브 이미지들 */}
        {[1, 2, 3, 4].map((idx) => {
          const imageIndex = idx;
          const image = safeImages[imageIndex];

          return (
            <div
              key={idx}
              className="relative bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg overflow-hidden cursor-pointer hover:shadow-lg transition-shadow group"
              role="button"
              tabIndex={0}
              aria-label={`호텔 이미지 ${idx} 보기`}
              onClick={() => handleImageClick(imageIndex)}
              onKeyDown={(e) =>
                e.key === "Enter" && handleImageClick(imageIndex)
              }
            >
              {image ? (
                <Image
                  src={image.originUrl || image.smallUrl}
                  alt={`${contentId} 호텔 이미지 ${idx}`}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 16vw"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-3xl group-hover:scale-110 transition-transform">
                    🖼️
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 이미지 갤러리 모달 */}
      {galleryModal.isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center"
          onKeyDown={handleKeyDown}
          tabIndex={-1}
        >
          {/* 닫기 버튼 */}
          <button
            onClick={handleCloseGallery}
            className="absolute top-4 right-4 text-white text-2xl hover:text-gray-300 transition-colors z-10"
            aria-label="갤러리 닫기"
          >
            ✕
          </button>

          {/* 이전 버튼 */}
          {images.length > 1 && (
            <button
              onClick={handlePrevImage}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white text-3xl hover:text-gray-300 transition-colors z-10"
              aria-label="이전 이미지"
            >
              ‹
            </button>
          )}

          {/* 다음 버튼 */}
          {images.length > 1 && (
            <button
              onClick={handleNextImage}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white text-3xl hover:text-gray-300 transition-colors z-10"
              aria-label="다음 이미지"
            >
              ›
            </button>
          )}

          {/* 메인 이미지 */}
          <div className="relative max-w-4xl max-h-[90vh] mx-4">
            <Image
              src={
                images[galleryModal.currentIndex]?.originUrl ||
                images[galleryModal.currentIndex]?.smallUrl
              }
              alt={`${contentId} 호텔 이미지 ${galleryModal.currentIndex + 1}`}
              width={800}
              height={600}
              className="object-contain max-w-full max-h-full"
              priority
            />
          </div>

          {/* 이미지 카운터 */}
          {images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white text-sm bg-black bg-opacity-50 px-3 py-1 rounded">
              {galleryModal.currentIndex + 1} / {images.length}
            </div>
          )}

          {/* 썸네일 네비게이션 */}
          {images.length > 1 && (
            <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 flex space-x-2 max-w-full overflow-x-auto">
              {images.map((image, index) => (
                <button
                  key={index}
                  onClick={() =>
                    setGalleryModal((prev) => ({
                      ...prev,
                      currentIndex: index,
                    }))
                  }
                  className={`relative w-16 h-12 flex-shrink-0 rounded overflow-hidden ${
                    index === galleryModal.currentIndex
                      ? "ring-2 ring-white"
                      : "opacity-70 hover:opacity-100"
                  } transition-opacity`}
                >
                  <Image
                    src={image.smallUrl || image.originUrl}
                    alt={`썸네일 ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default HotelGallery;
