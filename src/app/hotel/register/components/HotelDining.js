"use client";

import { useState } from 'react';
import { Plus, Trash2, Clock, Users, DollarSign, Image as ImageIcon } from 'lucide-react';

const HotelDining = ({ dining, addDining, removeDining, updateDining, errors, readOnly = false }) => {
  const addDiningItem = () => {
    if (readOnly) return;
    const newDining = {
      id: Date.now(),
      diningIdx: null, // 신규 생성 시 null
      name: "",
      description: "",
      imageUrl: "",
      totalSeats: "",
      basePrice: "",
      openTime: "",
      closeTime: "",
      slotDuration: 30, // 기본값 30분
      maxGuestsPerSlot: "",
      status: 1, // 기본값 활성(1)
      content: ""
    };
    
    addDining(newDining);
  };

  const removeDiningItem = (diningId) => {
    if (readOnly) return;
    removeDining(diningId);
  };

  const updateDiningItem = (diningId, field, value) => {
    if (readOnly) return;
    const currentItem = dining.find(item => item.id === diningId);
    if (!currentItem) return;
    
    updateDining(diningId, { ...currentItem, [field]: value });
  };


  const slotDurationOptions = [
    { value: 15, label: '15분' },
    { value: 30, label: '30분' },
    { value: 60, label: '1시간' },
    { value: 90, label: '1시간 30분' },
    { value: 120, label: '2시간' }
  ];

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">다이닝 관리</h3>
          <p className="text-sm text-gray-500 mt-1">
            호텔 내 레스토랑, 카페, 바 등 다이닝 시설을 등록하세요 (선택사항)
          </p>
        </div>
        {!readOnly && (
          <button
            onClick={addDiningItem}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <Plus size={20} />
            다이닝 추가
          </button>
        )}
      </div>

      {/* 다이닝 목록 */}
      {!dining || dining.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <div className="text-gray-400 text-6xl mb-4">🍽️</div>
          <h4 className="text-lg font-medium text-gray-900 mb-2">등록된 다이닝이 없습니다</h4>
          <p className="text-gray-500 mb-4">호텔 내 레스토랑이나 카페가 있다면 추가해보세요</p>
          {!readOnly && (
            <button
              onClick={addDiningItem}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              다이닝 추가하기
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {dining.map((item, index) => {
            const isInactive = item.status === 1; // status가 1이면 비활성화
            
            return (
              <div 
                key={item.id || item.diningIdx} 
                className={`border rounded-lg p-6 shadow-sm ${
                  isInactive 
                    ? 'border-orange-300 bg-orange-50 opacity-75' 
                    : 'border-gray-200 bg-white'
                }`}
              >
                {/* 다이닝 헤더 */}
                <div className="flex justify-between items-start mb-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className={`text-lg font-semibold ${isInactive ? 'text-gray-600' : 'text-gray-900'}`}>
                        {item.name || `다이닝 ${index + 1}`}
                      </h4>
                      {isInactive && (
                        <span className="px-2 py-0.5 text-xs font-medium bg-orange-200 text-orange-800 rounded-full">
                          비활성화
                        </span>
                      )}
                    </div>
                    {item.diningIdx && (
                      <span className="text-xs text-gray-500 mt-1">ID: {item.diningIdx}</span>
                    )}
                  </div>
                  {!readOnly && (
                    <button
                      onClick={() => removeDiningItem(item.id || item.diningIdx)}
                      className="flex items-center gap-1 px-3 py-1.5 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                    >
                      <Trash2 size={16} />
                      삭제
                    </button>
                  )}
                </div>

              {/* 다이닝 정보 입력 폼 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 다이닝명 */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    다이닝명 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={item.name || ""}
                    onChange={(e) => updateDiningItem(item.id || item.diningIdx, 'name', e.target.value)}
                    disabled={readOnly}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                    placeholder="예: 그랜드 레스토랑, 조식 뷔페"
                  />
                  {errors?.dining?.[index]?.name && (
                    <p className="text-red-500 text-xs mt-1">{errors.dining[index].name}</p>
                  )}
                </div>

                {/* 운영시간 */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Clock size={16} className="inline mr-1" />
                    운영시간 <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    {/* 오픈 시간 */}
                    <div>
                      <label className="block text-xs text-gray-600 mb-1.5">오픈 시간</label>
                      <div className="flex gap-2">
                        <select
                          value={item.openTime ? item.openTime.split(':')[0] || '' : ''}
                          onChange={(e) => {
                            const hour = e.target.value.padStart(2, '0');
                            const minute = item.openTime ? (item.openTime.split(':')[1] || '00') : '00';
                            updateDiningItem(item.id || item.diningIdx, 'openTime', `${hour}:${minute}`);
                          }}
                          disabled={readOnly}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-gray-100 disabled:cursor-not-allowed text-sm"
                        >
                          <option value="">시</option>
                          {Array.from({ length: 24 }, (_, i) => (
                            <option key={i} value={String(i).padStart(2, '0')}>
                              {i}시
                            </option>
                          ))}
                        </select>
                        <select
                          value={item.openTime ? item.openTime.split(':')[1] || '' : ''}
                          onChange={(e) => {
                            const minute = e.target.value.padStart(2, '0');
                            const hour = item.openTime ? (item.openTime.split(':')[0] || '00') : '00';
                            updateDiningItem(item.id || item.diningIdx, 'openTime', `${hour}:${minute}`);
                          }}
                          disabled={readOnly}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-gray-100 disabled:cursor-not-allowed text-sm"
                        >
                          <option value="">분</option>
                          {[0, 15, 30, 45].map(m => (
                            <option key={m} value={String(m).padStart(2, '0')}>
                              {m}분
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    
                    {/* 마감 시간 */}
                    <div>
                      <label className="block text-xs text-gray-600 mb-1.5">마감 시간</label>
                      <div className="flex gap-2">
                        <select
                          value={item.closeTime ? item.closeTime.split(':')[0] || '' : ''}
                          onChange={(e) => {
                            const hour = e.target.value.padStart(2, '0');
                            const minute = item.closeTime ? (item.closeTime.split(':')[1] || '00') : '00';
                            updateDiningItem(item.id || item.diningIdx, 'closeTime', `${hour}:${minute}`);
                          }}
                          disabled={readOnly}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-gray-100 disabled:cursor-not-allowed text-sm"
                        >
                          <option value="">시</option>
                          {Array.from({ length: 24 }, (_, i) => (
                            <option key={i} value={String(i).padStart(2, '0')}>
                              {i}시
                            </option>
                          ))}
                        </select>
                        <select
                          value={item.closeTime ? item.closeTime.split(':')[1] || '' : ''}
                          onChange={(e) => {
                            const minute = e.target.value.padStart(2, '0');
                            const hour = item.closeTime ? (item.closeTime.split(':')[0] || '00') : '00';
                            updateDiningItem(item.id || item.diningIdx, 'closeTime', `${hour}:${minute}`);
                          }}
                          disabled={readOnly}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-gray-100 disabled:cursor-not-allowed text-sm"
                        >
                          <option value="">분</option>
                          {[0, 15, 30, 45].map(m => (
                            <option key={m} value={String(m).padStart(2, '0')}>
                              {m}분
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                  {item.openTime && item.closeTime && (
                    <p className="text-xs text-gray-500 mt-2">
                      선택된 시간: {item.openTime} - {item.closeTime}
                    </p>
                  )}
                </div>

                {/* 예약 시간 단위 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Clock size={16} className="inline mr-1" />
                    예약 시간 단위
                  </label>
                  <select
                    value={item.slotDuration || 30}
                    onChange={(e) => updateDiningItem(item.id || item.diningIdx, 'slotDuration', parseInt(e.target.value))}
                    disabled={readOnly}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    {slotDurationOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 총 좌석 수 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Users size={16} className="inline mr-1" />
                    총 좌석 수 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={item.totalSeats || ""}
                    onChange={(e) => updateDiningItem(item.id || item.diningIdx, 'totalSeats', e.target.value ? parseInt(e.target.value) : "")}
                    disabled={readOnly}
                    min="1"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                    placeholder="예: 50"
                  />
                </div>

                {/* 시간대별 최대 인원 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Users size={16} className="inline mr-1" />
                    시간대별 최대 인원
                  </label>
                  <input
                    type="number"
                    value={item.maxGuestsPerSlot || ""}
                    onChange={(e) => updateDiningItem(item.id || item.diningIdx, 'maxGuestsPerSlot', e.target.value ? parseInt(e.target.value) : "")}
                    disabled={readOnly}
                    min="1"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                    placeholder="예: 10"
                  />
                  <p className="text-xs text-gray-500 mt-1">한 시간대에 예약 가능한 최대 인원 수</p>
                </div>

                {/* 1인당 기본 가격 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <DollarSign size={16} className="inline mr-1" />
                    1인당 기본 가격 (원) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={item.basePrice || ""}
                    onChange={(e) => updateDiningItem(item.id || item.diningIdx, 'basePrice', e.target.value ? parseInt(e.target.value) : "")}
                    disabled={readOnly}
                    min="0"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                    placeholder="예: 25000"
                  />
                </div>

                {/* 상태 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    운영 상태
                  </label>
                  <select
                    value={item.status !== undefined ? item.status : 0}
                    onChange={(e) => updateDiningItem(item.id || item.diningIdx, 'status', parseInt(e.target.value))}
                    disabled={readOnly}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    <option value={0}>활성</option>
                    <option value={1}>비활성</option>
                  </select>
                  {isInactive && (
                    <p className="text-xs text-orange-600 mt-1">
                      ⚠️ 비활성화된 다이닝은 고객에게 표시되지 않습니다. 다시 활성화하려면 상태를 변경하세요.
                    </p>
                  )}
                </div>

                {/* 설명 */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    설명
                  </label>
                  <textarea
                    value={item.description || ""}
                    onChange={(e) => updateDiningItem(item.id || item.diningIdx, 'description', e.target.value)}
                    disabled={readOnly}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                    placeholder="다이닝의 특징, 분위기, 서비스 등을 간단히 설명하세요"
                  />
                </div>

                {/* 상세 정보 */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    상세 정보
                  </label>
                  <textarea
                    value={item.content || ""}
                    onChange={(e) => updateDiningItem(item.id || item.diningIdx, 'content', e.target.value)}
                    disabled={readOnly}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                    placeholder="메뉴, 특별 서비스, 주의사항 등 상세한 정보를 입력하세요"
                  />
                </div>

                {/* 이미지 URL */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <ImageIcon size={16} className="inline mr-1" />
                    이미지 URL
                  </label>
                  <input
                    type="url"
                    value={item.imageUrl || ""}
                    onChange={(e) => updateDiningItem(item.id || item.diningIdx, 'imageUrl', e.target.value)}
                    disabled={readOnly}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                    placeholder="https://example.com/image.jpg"
                  />
                  {item.imageUrl && (
                    <div className="mt-2">
                      <img 
                        src={item.imageUrl} 
                        alt={item.name || "다이닝 이미지"} 
                        className="w-full h-48 object-cover rounded-lg border border-gray-200"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
            );
          })}
        </div>
      )}

      {/* 안내 메시지 */}
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
        <div className="flex">
          <div className="text-purple-400 text-xl mr-3">💡</div>
          <div>
            <h4 className="text-sm font-medium text-purple-900 mb-1">다이닝 등록 안내</h4>
            <ul className="text-sm text-purple-700 space-y-1 list-disc list-inside">
              <li>호텔 내 레스토랑, 카페, 바 등 다이닝 시설을 등록할 수 있습니다</li>
              <li>운영시간은 "09:00 - 21:00" 형식으로 입력하세요</li>
              <li>예약 시간 단위는 고객이 예약할 수 있는 시간 간격입니다</li>
              <li>시간대별 최대 인원은 한 시간대에 예약 가능한 최대 인원 수입니다</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HotelDining;
