'use client';

import { useState, useEffect } from 'react';

const HotelFilters = ({ filters, onFilterChange, onReset, onLocalFilterChange }) => {
  // 로컬 필터 상태 (실제 적용 전까지 임시 저장)
  const [localFilters, setLocalFilters] = useState({
    priceMin: filters.priceMin,
    priceMax: filters.priceMax,
    starRatings: [...filters.starRatings],
    amenities: [...filters.amenities],
  });

  // 외부 필터가 변경되면 로컬 필터도 동기화
  useEffect(() => {
    setLocalFilters({
      priceMin: filters.priceMin,
      priceMax: filters.priceMax,
      starRatings: [...filters.starRatings],
      amenities: [...filters.amenities],
    });
  }, [filters.priceMin, filters.priceMax, filters.starRatings, filters.amenities]);

  const formatPrice = (price) => {
    return new Intl.NumberFormat("ko-KR").format(price);
  };

  const handlePriceMinChange = (value) => {
    const numValue = parseInt(value) || 0;
    const newMin = Math.min(numValue, localFilters.priceMax);
    const newFilters = { ...localFilters, priceMin: newMin };
    setLocalFilters(newFilters);
    // 로컬 필터 변경만 알림 (실제 적용은 아님)
    if (onLocalFilterChange) {
      onLocalFilterChange(newFilters);
    }
  };

  const handlePriceMaxChange = (value) => {
    const numValue = parseInt(value) || 500000;
    const newMax = Math.max(numValue, localFilters.priceMin);
    const newFilters = { ...localFilters, priceMax: newMax };
    setLocalFilters(newFilters);
    // 로컬 필터 변경만 알림 (실제 적용은 아님)
    if (onLocalFilterChange) {
      onLocalFilterChange(newFilters);
    }
  };

  const handleRangeChange = (e) => {
    const value = parseInt(e.target.value);
    const newFilters = { ...localFilters, priceMax: value };
    setLocalFilters(newFilters);
    // 로컬 필터 변경만 알림 (실제 적용은 아님)
    if (onLocalFilterChange) {
      onLocalFilterChange(newFilters);
    }
  };

  const handleStarRatingToggle = (rating) => {
    const newRatings = localFilters.starRatings.includes(rating)
      ? localFilters.starRatings.filter((r) => r !== rating)
      : [...localFilters.starRatings, rating];
    const newFilters = { ...localFilters, starRatings: newRatings };
    setLocalFilters(newFilters);
    // 로컬 필터 변경만 알림 (실제 적용은 아님)
    if (onLocalFilterChange) {
      onLocalFilterChange(newFilters);
    }
  };

  const handleAmenityToggle = (amenity) => {
    const newAmenities = localFilters.amenities.includes(amenity)
      ? localFilters.amenities.filter((a) => a !== amenity)
      : [...localFilters.amenities, amenity];
    const newFilters = { ...localFilters, amenities: newAmenities };
    setLocalFilters(newFilters);
    // 로컬 필터 변경만 알림 (실제 적용은 아님)
    if (onLocalFilterChange) {
      onLocalFilterChange(newFilters);
    }
  };

  const hasActiveFilters = 
    localFilters.priceMin > 0 || 
    localFilters.priceMax < 500000 || 
    localFilters.starRatings.length > 0 || 
    localFilters.amenities.length > 0;

  return (
    <>
      {/* 가격 범위 */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-semibold">가격 범위</h4>
          {hasActiveFilters && (
            <button
              onClick={onReset}
              className="text-xs text-blue-600 hover:text-blue-800 underline"
            >
              초기화
            </button>
          )}
        </div>
        <div className="flex items-center gap-2 mb-3">
          <input
            type="number"
            className="w-28 px-3 py-2 border rounded text-sm"
            placeholder="최소"
            value={localFilters.priceMin}
            onChange={(e) => handlePriceMinChange(e.target.value)}
            min="0"
            max={localFilters.priceMax}
          />
          <span>~</span>
          <input
            type="number"
            className="w-28 px-3 py-2 border rounded text-sm"
            placeholder="최대"
            value={localFilters.priceMax}
            onChange={(e) => handlePriceMaxChange(e.target.value)}
            min={localFilters.priceMin}
            max="500000"
          />
        </div>
        <input
          type="range"
          min="0"
          max="500000"
          step="10000"
          value={localFilters.priceMax}
          onChange={handleRangeChange}
          className="w-full slider accent-blue-500"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>₩{formatPrice(localFilters.priceMin)}</span>
          <span>₩{formatPrice(localFilters.priceMax)}</span>
        </div>
      </div>

      {/* 별점 */}
      <div className="mb-6">
        <h4 className="font-semibold mb-3">별점</h4>
        <div className="space-y-2">
          {[5, 4, 3, 2].map((rating) => (
            <label
              key={rating}
              className="flex items-center gap-3 cursor-pointer p-2 hover:bg-gray-50 rounded transition-colors"
            >
              <input
                type="checkbox"
                className="rounded w-4 h-4 accent-blue-500"
                checked={localFilters.starRatings.includes(rating)}
                onChange={() => handleStarRatingToggle(rating)}
              />
              <span className="flex items-center">
                {[...Array(rating)].map((_, i) => (
                  <span key={i} className="text-yellow-400 text-lg">★</span>
                ))}
              </span>
              <span className="text-sm">{rating}성급 이상</span>
            </label>
          ))}
        </div>
      </div>

      {/* 편의시설 */}
      <div className="mb-6">
        <h4 className="font-semibold mb-3">편의시설</h4>
        <div className="space-y-2">
          {["주차", "식당"].map((amenity) => (
            <label
              key={amenity}
              className="flex items-center gap-2 cursor-pointer p-2 hover:bg-gray-50 rounded transition-colors"
            >
              <input
                type="checkbox"
                className="rounded w-4 h-4 accent-blue-500"
                checked={localFilters.amenities.includes(amenity)}
                onChange={() => handleAmenityToggle(amenity)}
              />
              <span className="text-sm">{amenity}</span>
            </label>
          ))}
        </div>
      </div>
    </>
  );
};

export default HotelFilters;
