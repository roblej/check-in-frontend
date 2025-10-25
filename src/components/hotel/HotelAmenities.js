"use client";

import { useState, useEffect } from "react";
import { hotelAPI } from "@/lib/api/hotel";

/**
 * 호텔 편의시설 컴포넌트
 * @param {Object} props
 * @param {string} props.contentId - 호텔 contentId
 */
const HotelAmenities = ({ contentId }) => {
  const [facilities, setFacilities] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFacilities = async () => {
      try {
        setLoading(true);
        const data = await hotelAPI.getHotelFacilities(contentId);
        setFacilities(data);
      } catch (err) {
        setError("편의시설 정보를 불러올 수 없습니다.");
      } finally {
        setLoading(false);
      }
    };

    if (contentId) {
      fetchFacilities();
    }
  }, [contentId]);

  if (loading) {
    return (
      <div className="bg-white rounded-lg p-6 mb-6 shadow">
        <h2 className="text-2xl font-bold mb-4">편의시설</h2>
        <div className="space-y-4">
          {[1, 2, 3, 4].map((idx) => (
            <div key={idx} className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error || !facilities) {
    return (
      <div className="bg-white rounded-lg p-6 mb-6 shadow">
        <h2 className="text-2xl font-bold mb-4">편의시설</h2>
        <div className="text-center py-8 text-gray-500">
          <span className="text-4xl mb-2 block">🏨</span>
          <p>편의시설 정보를 불러올 수 없습니다</p>
        </div>
      </div>
    );
  }

  // 편의시설 데이터를 배열로 변환
  const amenitiesList = [];

  // 주차 정보는 항상 표시 (null이든 아니든)
  amenitiesList.push({
    icon: "🅿️",
    title: "주차",
    description: facilities.parkinglodging
      ? facilities.parkinglodging === "가능"
        ? "주차 가능"
        : facilities.parkinglodging
      : "주차 불가능",
  });
  if (facilities.foodplace) {
    amenitiesList.push({
      icon: "🍽️",
      title: "식사",
      description: facilities.foodplace,
    });
  }
  if (facilities.reservationlodging) {
    amenitiesList.push({
      icon: "📞",
      title: "예약 문의",
      description: facilities.reservationlodging,
    });
  }
  if (facilities.scalelodging) {
    amenitiesList.push({
      icon: "🏢",
      title: "호텔 규모",
      description: facilities.scalelodging,
    });
  }

  if (amenitiesList.length === 0) {
    return (
      <div className="bg-white rounded-lg p-6 mb-6 shadow">
        <h2 className="text-2xl font-bold mb-4">편의시설</h2>
        <div className="text-center py-8 text-gray-500">
          등록된 편의시설 정보가 없습니다.
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg p-6 mb-6 shadow">
      <h2 className="text-2xl font-bold mb-4">편의시설</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {amenitiesList.map((amenity, idx) => (
          <div
            key={idx}
            className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg"
          >
            <span className="text-2xl">{amenity.icon}</span>
            <div>
              <h3 className="font-medium text-gray-700 mb-1">
                {amenity.title}
              </h3>
              <p className="text-gray-600 text-sm whitespace-pre-line">
                {amenity.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HotelAmenities;
