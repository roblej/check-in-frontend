"use client";

import { useState } from "react";

const HotelBasicInfo = ({ formData, updateFormData, errors, initialData }) => {
  const [selectedRegion, setSelectedRegion] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");

  const handleRegionChange = (regionId) => {
    setSelectedRegion(regionId);
    setSelectedDistrict("");
    updateFormData("area", { region: regionId, district: "" });
  };

  const handleDistrictChange = (district) => {
    setSelectedDistrict(district);
    updateFormData("area", { district });
  };

  const selectedRegionData = initialData.regions.find(r => r.id === selectedRegion);

  return (
    <div className="space-y-8">
      {/* 호텔 기본 정보 */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">호텔 기본 정보</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              호텔명
            </label>
            <input
              type="text"
              value={formData.hotelInfo.title}
              onChange={(e) => updateFormData("hotelInfo", { title: e.target.value })}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.title ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="호텔명을 입력하세요"
            />
            {errors.title && <p className="mt-1 text-sm text-red-500">{errors.title}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              연락처
            </label>
            <input
              type="tel"
              value={formData.hotelInfo.phone}
              onChange={(e) => updateFormData("hotelInfo", { phone: e.target.value })}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.phone ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="02-1234-5678"
            />
            {errors.phone && <p className="mt-1 text-sm text-red-500">{errors.phone}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              이메일
            </label>
            <input
              type="email"
              value={formData.hotelInfo.email}
              onChange={(e) => updateFormData("hotelInfo", { email: e.target.value })}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.email ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="hotel@example.com"
            />
            {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              주소
            </label>
            <input
              type="text"
              value={formData.hotelInfo.adress}
              onChange={(e) => updateFormData("hotelInfo", { adress: e.target.value })}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.adress ? "border-red-500" : "border-gray-300"
              }`}
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">시/도를 선택하세요</option>
              {initialData.regions.map((region) => (
                <option key={region.id} value={region.id}>
                  {region.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              구/군
            </label>
            <select
              value={selectedDistrict}
              onChange={(e) => handleDistrictChange(e.target.value)}
              disabled={!selectedRegionData}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
            >
              <option value="">구/군을 선택하세요</option>
              {selectedRegionData?.districts.map((district) => (
                <option key={district} value={district}>
                  {district}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              주변 관광지
            </label>
            <textarea
              value={formData.area.nearbyAttractions}
              onChange={(e) => updateFormData("area", { nearbyAttractions: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="주변 관광지나 명소를 입력하세요"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              교통편 안내
            </label>
            <textarea
              value={formData.area.transportation}
              onChange={(e) => updateFormData("area", { transportation: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="호텔의 특징과 매력을 소개해주세요"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              주요 특징
            </label>
            <textarea
              value={formData.hotelDetail.features}
              onChange={(e) => updateFormData("hotelDetail", { features: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="호텔의 주요 특징이나 특별한 서비스를 입력하세요"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="예: 지하 1층, 지상 10층, 총 120개 객실"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                호텔 역사
              </label>
              <input
                type="text"
                value={formData.hotelDetail.history}
                onChange={(e) => updateFormData("hotelDetail", { history: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="예: 2020년 개업, 3년 운영 경험"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 운영 정보 */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">운영 정보</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              체크인 시간
            </label>
            <input
              type="time"
              value={formData.hotelInfo.checkInTime}
              onChange={(e) => updateFormData("hotelInfo", { checkInTime: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              체크아웃 시간
            </label>
            <input
              type="time"
              value={formData.hotelInfo.checkOutTime}
              onChange={(e) => updateFormData("hotelInfo", { checkOutTime: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              취소 정책
            </label>
            <textarea
              value={formData.hotelInfo.cancellationPolicy}
              onChange={(e) => updateFormData("hotelInfo", { cancellationPolicy: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="취소 및 환불 정책을 입력하세요"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default HotelBasicInfo;
