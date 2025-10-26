"use client";

import { useState } from "react";
import HotelBasicInfo from "./components/HotelBasicInfo";
import HotelRooms from "./components/HotelRooms";
import HotelImages from "./components/HotelImages";
import HotelDining from "./components/HotelDining";

const HotelRegistrationForm = ({
  formData,
  updateFormData,
  addRoom,
  removeRoom,
  updateRoom,
  addDining,
  removeDining,
  updateDining,
  currentTab,
  setCurrentTab,
  errors,
  initialData,
  onSubmit,
  isSubmitting,
  saveDraft,
  loadDraft,
  clearDraft
}) => {
  const tabs = [
    { id: "basic", name: "기본 정보", icon: "📋" },
    { id: "rooms", name: "객실 관리", icon: "🛏️" },
    { id: "images", name: "이미지/이벤트", icon: "📸" },
    { id: "dining", name: "다이닝", icon: "🍽️" }
  ];

  const renderTabContent = () => {
    switch (currentTab) {
      case "basic":
        return (
          <HotelBasicInfo
            formData={formData}
            updateFormData={updateFormData}
            errors={errors}
            initialData={initialData}
          />
        );
      case "rooms":
        return (
          <HotelRooms
            rooms={formData.rooms}
            addRoom={addRoom}
            removeRoom={removeRoom}
            updateRoom={updateRoom}
            errors={errors}
            initialData={initialData}
          />
        );
      case "images":
        return (
          <HotelImages
            images={formData.images}
            events={formData.events}
            updateFormData={updateFormData}
            errors={errors}
          />
        );
      case "dining":
        return (
          <HotelDining
            dining={formData.dining}
            addDining={addDining}
            removeDining={removeDining}
            updateDining={updateDining}
            errors={errors}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* 탭 네비게이션 */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-6" aria-label="Tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setCurrentTab(tab.id)}
              className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                currentTab === tab.id
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* 탭 콘텐츠 */}
      <div className="p-6">
        {renderTabContent()}
      </div>

      {/* 하단 액션 버튼 */}
      <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-500">
            * 필수 정보를 모두 입력한 후 등록 요청을 제출하세요
          </div>
          <div className="flex space-x-3">
            <button
              type="button"
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              임시저장
            </button>
            <button
              type="button"
              onClick={onSubmit}
              disabled={isSubmitting}
              className="px-6 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "등록 중..." : "등록요청하기"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HotelRegistrationForm;
