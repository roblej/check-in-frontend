"use client";

import { useState } from "react";
import HotelBasicInfo from "@/app/hotel/register/components/HotelBasicInfo";
import HotelRooms from "@/app/hotel/register/components/HotelRooms";
import HotelImages from "@/app/hotel/register/components/HotelImages";
import HotelDining from "@/app/hotel/register/components/HotelDining";

/**
 * 호텔 등록/승인 공통 폼 컴포넌트
 * @param {string} mode - 'create' | 'approve' (생성 또는 승인)
 * @param {object} formData - 폼 데이터
 * @param {function} updateFormData - 폼 데이터 업데이트 함수
 * @param {object} errors - 유효성 검사 오류
 * @param {object} initialData - 초기 데이터 (지역, 시설 등)
 * @param {function} onSubmit - 제출 핸들러
 * @param {boolean} isSubmitting - 제출 중 상태
 * @param {function} onApprove - 승인 핸들러 (approve 모드에서만)
 * @param {function} onReject - 거부 핸들러 (approve 모드에서만)
 * @param {object} addRoom, removeRoom, updateRoom - 객실 관리 함수
 * @param {object} addDining, removeDining, updateDining - 다이닝 관리 함수
 */
const HotelRegistrationForm = ({
  mode = 'create', // 'create' | 'approve'
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
  onSaveDraft,
  onApprove,
  onReject
}) => {
  const tabs = [
    { id: "basic", name: "기본 정보", icon: "📋" },
    { id: "rooms", name: "객실 관리", icon: "🛏️" },
    { id: "images", name: "이미지/이벤트", icon: "📸" },
    { id: "dining", name: "다이닝", icon: "🍽️" }
  ];

  const isApprovalMode = mode === 'approve';
  const isReadOnly = isApprovalMode;

  const renderTabContent = () => {
    switch (currentTab) {
      case "basic":
        return (
          <HotelBasicInfo
            formData={formData}
            updateFormData={updateFormData}
            errors={errors}
            initialData={initialData}
            readOnly={isReadOnly}
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
            readOnly={isReadOnly}
          />
        );
      case "images":
        return (
          <HotelImages
            images={formData.images}
            events={formData.events}
            updateFormData={updateFormData}
            errors={errors}
            readOnly={isReadOnly}
            formData={formData}
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
            readOnly={isReadOnly}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* 페이지 제목 */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
        <h2 className="text-2xl font-bold text-white">
          {isApprovalMode ? '📋 호텔 승인' : '🏨 호텔 등록'}
        </h2>
        <p className="text-blue-100 mt-1">
          {isApprovalMode 
            ? '호텔 등록 요청을 검토하고 승인/거부합니다' 
            : '새로운 호텔을 등록하고 운영을 시작하세요'
          }
        </p>
      </div>

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
            {isApprovalMode 
              ? '* 모든 정보를 검토한 후 승인/거부 결정을 내려주세요'
              : '* 필수 정보를 모두 입력한 후 등록 요청을 제출하세요'
            }
          </div>
          <div className="flex space-x-3">
            {/* Create 모드: 임시저장 + 등록요청 버튼 */}
            {!isApprovalMode && (
              <>
                {onSaveDraft && (
                  <button
                    type="button"
                    onClick={onSaveDraft}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    임시저장
                  </button>
                )}
                <button
                  type="button"
                  onClick={onSubmit}
                  disabled={isSubmitting}
                  className="px-6 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "등록 중..." : "등록요청하기"}
                </button>
              </>
            )}
            
            {/* Approve 모드: 승인 + 거부 버튼 */}
            {isApprovalMode && (
              <>
                <button
                  type="button"
                  onClick={onReject}
                  className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  거부
                </button>
                <button
                  type="button"
                  onClick={onApprove}
                  disabled={isSubmitting}
                  className="px-6 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "처리 중..." : "승인"}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HotelRegistrationForm;

