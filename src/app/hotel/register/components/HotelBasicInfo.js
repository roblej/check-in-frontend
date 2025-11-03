"use client";

import { useState } from "react";

const HotelBasicInfo = ({ formData, updateFormData, errors, initialData, readOnly = false }) => {
  const [selectedRegion, setSelectedRegion] = useState("");

  const handleRegionChange = (regionId) => {
    setSelectedRegion(regionId);
    updateFormData("area", { region: regionId });
  };

  return (
    <div className="space-y-8">
      {/* 호텔 기본 정보 */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">호텔 기본 정보</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              호텔명 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.hotelInfo.title}
              onChange={(e) => updateFormData("hotelInfo", { title: e.target.value })}
              readOnly={readOnly}
              disabled={readOnly}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.title ? "border-red-500" : "border-gray-300"
              } ${readOnly ? "bg-gray-100 cursor-not-allowed" : ""}`}
              placeholder="호텔명을 입력하세요"
            />
            {errors.title && <p className="mt-1 text-sm text-red-500">{errors.title}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              연락처 <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              value={formData.hotelInfo.phone}
              onChange={(e) => updateFormData("hotelInfo", { phone: e.target.value })}
              readOnly={readOnly}
              disabled={readOnly}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.phone ? "border-red-500" : "border-gray-300"
              } ${readOnly ? "bg-gray-100 cursor-not-allowed" : ""}`}
              placeholder="02-1234-5678"
            />
            {errors.phone && <p className="mt-1 text-sm text-red-500">{errors.phone}</p>}
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              주소 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.hotelInfo.adress}
              onChange={(e) => updateFormData("hotelInfo", { adress: e.target.value })}
              readOnly={readOnly}
              disabled={readOnly}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.adress ? "border-red-500" : "border-gray-300"
              } ${readOnly ? "bg-gray-100 cursor-not-allowed" : ""}`}
              placeholder="상세 주소를 입력하세요"
            />
            {errors.adress && <p className="mt-1 text-sm text-red-500">{errors.adress}</p>}
          </div>
        </div>
      </div>

      {/* 지역 정보 */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">지역 정보</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              시/도
            </label>
            <select
              value={selectedRegion}
              onChange={(e) => handleRegionChange(parseInt(e.target.value))}
              disabled={readOnly || !initialData.regions.length}
              className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${readOnly ? "bg-gray-100 cursor-not-allowed" : ""}`}
            >
              <option value="">시/도를 선택하세요</option>
              {initialData.regions.map((region) => (
                <option key={region.id} value={region.id}>
                  {region.name}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              교통편 안내
            </label>
            <textarea
              value={formData.area.transportation}
              onChange={(e) => updateFormData("area", { transportation: e.target.value })}
              readOnly={readOnly}
              disabled={readOnly}
              rows={3}
              className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${readOnly ? "bg-gray-100 cursor-not-allowed" : ""}`}
              placeholder="대중교통 이용 방법을 입력하세요"
            />
          </div>
        </div>
      </div>

      {/* 호텔 상세 정보 */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">호텔 상세 정보</h3>
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              호텔 소개
            </label>
            <textarea
              value={formData.hotelDetail.description}
              onChange={(e) => updateFormData("hotelDetail", { description: e.target.value })}
              readOnly={readOnly}
              disabled={readOnly}
              rows={4}
              className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${readOnly ? "bg-gray-100 cursor-not-allowed" : ""}`}
              placeholder="호텔의 특징과 매력을 소개해주세요"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              식당 정보
            </label>
            <textarea
              value={formData.hotelDetail.foodplace}
              onChange={(e) => updateFormData("hotelDetail", { foodplace: e.target.value })}
              readOnly={readOnly}
              disabled={readOnly}
              rows={3}
              className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${readOnly ? "bg-gray-100 cursor-not-allowed" : ""}`}
              placeholder="식당 정보를 입력하세요"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                호텔 규모
              </label>
              <input
                type="text"
                value={formData.hotelDetail.scale}
                onChange={(e) => updateFormData("hotelDetail", { scale: e.target.value })}
                readOnly={readOnly}
                disabled={readOnly}
                className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${readOnly ? "bg-gray-100 cursor-not-allowed" : ""}`}
                placeholder="예: 지하 1층, 지상 10층, 총 120개 객실"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                주차 정보
              </label>
              <input
                type="text"
                value={formData.hotelDetail.parkinglodging}
                onChange={(e) => updateFormData("hotelDetail", { parkinglodging: e.target.value })}
                readOnly={readOnly}
                disabled={readOnly}
                className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${readOnly ? "bg-gray-100 cursor-not-allowed" : ""}`}
                placeholder="예: 주차장 위치, 요금, 운영시간 등을 입력하세요"
              />
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default HotelBasicInfo;
