"use client";

import { useState } from "react";

const HotelImages = ({ images, events, updateFormData, errors, readOnly = false }) => {
  const [dragOver, setDragOver] = useState(false);

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    // 이미지 파일 처리 로직 (실제 구현 시 파일 업로드 API 호출)
    console.log('업로드할 이미지:', imageFiles);
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    // 이미지 파일 처리 로직
    console.log('선택된 이미지:', imageFiles);
  };

  const addEvent = () => {
    const newEvent = {
      id: Date.now(),
      title: "",
      description: "",
      startDate: "",
      endDate: "",
      discount: "",
      isActive: true
    };
    
    updateFormData("events", [...events, newEvent]);
  };

  const removeEvent = (eventId) => {
    updateFormData("events", events.filter(event => event.id !== eventId));
  };

  const updateEvent = (eventId, data) => {
    updateFormData("events", events.map(event => 
      event.id === eventId ? { ...event, ...data } : event
    ));
  };

  return (
    <div className="space-y-8">
      {/* 호텔 이미지 */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">호텔 이미지</h3>
        <p className="text-sm text-gray-500 mb-4">
          호텔의 외관, 로비, 객실 등 다양한 이미지를 업로드하세요. (선택사항)
        </p>
        
        {/* 이미지 업로드 영역 */}
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragOver 
              ? "border-blue-500 bg-blue-50" 
              : "border-gray-300 hover:border-gray-400"
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="text-gray-400 text-6xl mb-4">📸</div>
          <h4 className="text-lg font-medium text-gray-900 mb-2">
            이미지를 드래그하여 업로드하세요
          </h4>
          <p className="text-gray-500 mb-4">
            또는 아래 버튼을 클릭하여 파일을 선택하세요
          </p>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
            id="image-upload"
          />
          <label
            htmlFor="image-upload"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 cursor-pointer"
          >
            이미지 선택
          </label>
          <p className="text-xs text-gray-400 mt-2">
            JPG, PNG, GIF 파일만 업로드 가능 (최대 10MB)
          </p>
        </div>

        {/* 업로드된 이미지 미리보기 */}
        {images.length > 0 && (
          <div className="mt-6">
            <h4 className="text-sm font-medium text-gray-700 mb-3">업로드된 이미지</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {images.map((image, index) => (
                <div key={index} className="relative group">
                  <div className="aspect-square bg-gray-200 rounded-lg flex items-center justify-center">
                    <span className="text-gray-400 text-2xl">🖼️</span>
                  </div>
                  <button className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    ×
                  </button>
                  {index === 0 && (
                    <div className="absolute bottom-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded">
                      대표 이미지
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {errors.images && (
          <p className="mt-2 text-sm text-red-500">{errors.images}</p>
        )}
      </div>

      {/* 이벤트 관리 */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">이벤트 관리</h3>
          <button
            onClick={addEvent}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            + 이벤트 추가
          </button>
        </div>
        <p className="text-sm text-gray-500 mb-4">
          특가 이벤트나 프로모션을 등록하여 고객에게 제공하세요.
        </p>

        {events.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <div className="text-gray-400 text-4xl mb-2">🎉</div>
            <p className="text-gray-500">등록된 이벤트가 없습니다</p>
          </div>
        ) : (
          <div className="space-y-4">
            {events.map((event, index) => (
              <div key={event.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-4">
                  <h4 className="font-medium text-gray-900">이벤트 {index + 1}</h4>
                  <button
                    onClick={() => removeEvent(event.id)}
                    className="text-red-400 hover:text-red-600"
                  >
                    삭제
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      이벤트 제목
                    </label>
                    <input
                      type="text"
                      value={event.title}
                      onChange={(e) => updateEvent(event.id, { title: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="예: 신규 오픈 특가"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      할인율 (%)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={event.discount}
                      onChange={(e) => updateEvent(event.id, { discount: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="20"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      시작일
                    </label>
                    <input
                      type="date"
                      value={event.startDate}
                      onChange={(e) => updateEvent(event.id, { startDate: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      종료일
                    </label>
                    <input
                      type="date"
                      value={event.endDate}
                      onChange={(e) => updateEvent(event.id, { endDate: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      이벤트 설명
                    </label>
                    <textarea
                      value={event.description}
                      onChange={(e) => updateEvent(event.id, { description: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="이벤트 상세 내용을 입력하세요"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={event.isActive}
                        onChange={(e) => updateEvent(event.id, { isActive: e.target.checked })}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">이벤트 활성화</span>
                    </label>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HotelImages;
