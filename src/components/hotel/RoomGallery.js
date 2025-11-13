"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { hotelAPI } from "@/lib/api/hotel";

/**
 * 객실 이미지 갤러리 컴포넌트
 * @param {Object} props
 * @param {number} props.roomIdx - 객실 roomIdx
 * @param {string} props.contentId - 호텔 contentId
 * @param {string} props.mainImageUrl - 대표 이미지 URL (room.imageUrl)
 * @param {boolean} props.isOpen - 갤러리 열림 상태
 * @param {Function} props.onClose - 갤러리 닫기 핸들러
 * @param {boolean} [props.isModal=false] - 모달 모드 여부
 */
const RoomGallery = ({
  roomIdx,
  contentId,
  mainImageUrl,
  isOpen,
  onClose,
  isModal = false,
}) => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [thumbnailErrors, setThumbnailErrors] = useState({});

  const roomImageBaseUrl = process.env.NEXT_PUBLIC_ROOM_IMAGE_BASE_URL;
  if (!roomImageBaseUrl) {
    throw new Error(
      "NEXT_PUBLIC_ROOM_IMAGE_BASE_URL 환경 변수가 설정되어 있지 않습니다."
    );
  }
  const ensureTrailingSlash = (url) => (url.endsWith("/") ? url : `${url}/`);
  const baseUrlWithSlash = ensureTrailingSlash(roomImageBaseUrl);

  useEffect(() => {
    const fetchImages = async () => {
      try {
        setLoading(true);
        const data = await hotelAPI.getRoomImages(contentId, roomIdx);
        // 대표 이미지를 첫 번째로 추가
        const allImages = mainImageUrl
          ? [{ imageUrl: mainImageUrl, imageOrder: 0 }, ...data]
          : data;
        setImages(allImages || []);
      } catch (err) {
        //객실 이미지 로딩 오류
        setError("이미지를 불러올 수 없습니다.");
        // 에러 시 대표 이미지만 표시
        if (mainImageUrl) {
          setImages([{ imageUrl: mainImageUrl, imageOrder: 0 }]);
        }
      } finally {
        setLoading(false);
      }
    };

    if (roomIdx && contentId && isOpen) {
      fetchImages();
    }
  }, [roomIdx, contentId, mainImageUrl, isOpen]);

  // 모달 열릴 때 body 스크롤 막기
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const getImageUrl = (imageUrl) => {
    if (!imageUrl) return `${baseUrlWithSlash}default.jpg`;
    // 이미 전체 URL이면 그대로 사용, 아니면 BASE_URL 추가
    if (imageUrl.startsWith("http")) {
      return imageUrl;
    }
    return `${baseUrlWithSlash}${imageUrl}`;
  };

  const handleCloseGallery = () => {
    setCurrentIndex(0);
    onClose();
  };

  const handlePrevImage = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
  };

  const handleNextImage = () => {
    setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
  };

  const handleKeyDown = (e) => {
    if (!isOpen) return;
    if (e.key === "Escape") {
      handleCloseGallery();
    } else if (e.key === "ArrowLeft") {
      handlePrevImage();
    } else if (e.key === "ArrowRight") {
      handleNextImage();
    }
  };

  const safeImages = Array.isArray(images) ? images : [];
  const imageCount = safeImages.length;

  if (loading) {
    return null;
  }

  if (error && imageCount === 0) {
    return null;
  }

  if (!isOpen) {
    return null;
  }

  return (
    <>
      {/* 이미지 갤러리 모달 */}
      {isOpen && (
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
          <div className="relative mx-4 w-[90vw] max-w-4xl h-[60vh] max-h-[90vh]">
            <Image
              src={getImageUrl(safeImages[currentIndex]?.imageUrl)}
              alt={`객실 이미지 ${currentIndex + 1}`}
              fill
              sizes="(max-width: 768px) 90vw, 800px"
              className="object-contain"
              onError={(event) => {
                event.currentTarget.src = `${baseUrlWithSlash}default.jpg`;
              }}
            />
          </div>

          {/* 이미지 카운터 */}
          {images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white text-sm bg-black bg-opacity-50 px-3 py-1 rounded">
              {currentIndex + 1} / {images.length}
            </div>
          )}

          {/* 썸네일 네비게이션 */}
          {images.length > 1 && (
            <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 flex space-x-2 max-w-full overflow-x-auto">
              {images.map((image, index) => {
                const thumbnailUrl = image.imageUrl;
                const hasValidUrl = thumbnailUrl && thumbnailUrl.trim() !== "";
                const showFallback = !hasValidUrl || thumbnailErrors[index];

                return (
                  <button
                    key={index}
                    onClick={() => setCurrentIndex(index)}
                    className={`relative w-16 h-12 flex-shrink-0 rounded overflow-hidden ${
                      index === currentIndex
                        ? "ring-2 ring-white"
                        : "opacity-70 hover:opacity-100"
                    } transition-opacity`}
                    style={{ backgroundColor: "#1f2937" }}
                  >
                    {showFallback ? (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-white text-xs">🖼️</span>
                      </div>
                    ) : (
                      <Image
                        src={getImageUrl(thumbnailUrl)}
                        alt={`썸네일 ${index + 1}`}
                        fill
                        sizes="64px"
                        className="object-cover"
                        onError={() =>
                          setThumbnailErrors((prev) => ({
                            ...prev,
                            [index]: true,
                          }))
                        }
                      />
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default RoomGallery;
