'use client';

import { useState, useEffect } from 'react';

const HotelFilters = ({ filters, onFilterChange, onReset }) => {
  const [localPriceMin, setLocalPriceMin] = useState(filters.priceMin);
  const [localPriceMax, setLocalPriceMax] = useState(filters.priceMax);
  const [priceRange, setPriceRange] = useState([filters.priceMin, filters.priceMax]);

  useEffect(() => {
    setLocalPriceMin(filters.priceMin);
    setLocalPriceMax(filters.priceMax);
    setPriceRange([filters.priceMin, filters.priceMax]);
  }, [filters.priceMin, filters.priceMax]);

  const formatPrice = (price) => {
    return new Intl.NumberFormat("ko-KR").format(price);
  };

  const handlePriceMinChange = (value) => {
    const numValue = parseInt(value) || 0;
    const newMin = Math.min(numValue, filters.priceMax);
    setLocalPriceMin(newMin);
    setPriceRange([newMin, filters.priceMax]);
    onFilterChange({ priceMin: newMin });
  };

  const handlePriceMaxChange = (value) => {
    const numValue = parseInt(value) || 500000;
    const newMax = Math.max(numValue, filters.priceMin);
    setLocalPriceMax(newMax);
    setPriceRange([filters.priceMin, newMax]);
    onFilterChange({ priceMax: newMax });
  };

  const handleRangeChange = (e) => {
    const value = parseInt(e.target.value);
    setPriceRange([filters.priceMin, value]);
    setLocalPriceMax(value);
    onFilterChange({ priceMax: value });
  };

  const handleStarRatingToggle = (rating) => {
    const newRatings = filters.starRatings.includes(rating)
      ? filters.starRatings.filter((r) => r !== rating)
      : [...filters.starRatings, rating];
    onFilterChange({ starRatings: newRatings });
  };

  const handleAmenityToggle = (amenity) => {
    const newAmenities = filters.amenities.includes(amenity)
      ? filters.amenities.filter((a) => a !== amenity)
      : [...filters.amenities, amenity];
    onFilterChange({ amenities: newAmenities });
  };

  const hasActiveFilters = 
    filters.priceMin > 0 || 
    filters.priceMax < 500000 || 
    filters.starRatings.length > 0 || 
    filters.amenities.length > 0;

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
            value={localPriceMin}
            onChange={(e) => handlePriceMinChange(e.target.value)}
            min="0"
            max={filters.priceMax}
          />
          <span>~</span>
          <input
            type="number"
            className="w-28 px-3 py-2 border rounded text-sm"
            placeholder="최대"
            value={localPriceMax}
            onChange={(e) => handlePriceMaxChange(e.target.value)}
            min={filters.priceMin}
            max="500000"
          />
        </div>
        <input
          type="range"
          min="0"
          max="500000"
          step="10000"
          value={priceRange[1]}
          onChange={handleRangeChange}
          className="w-full slider accent-blue-500"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>₩{formatPrice(priceRange[0])}</span>
          <span>₩{formatPrice(priceRange[1])}</span>
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
                checked={filters.starRatings.includes(rating)}
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
                checked={filters.amenities.includes(amenity)}
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
