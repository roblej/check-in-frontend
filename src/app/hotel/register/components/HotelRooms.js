"use client";

import { useState } from "react";
import axiosInstance from "@/lib/axios";

const HotelRooms = ({ rooms, addRoom, removeRoom, updateRoom, errors, initialData, readOnly = false }) => {
  const [expandedRoom, setExpandedRoom] = useState(null);
  const [uploadingRooms, setUploadingRooms] = useState({}); // roomId별 업로드 상태

  const toggleRoomExpansion = (roomId) => {
    setExpandedRoom(expandedRoom === roomId ? null : roomId);
  };

  const handleRoomImageFiles = async (roomId, files) => {
    if (readOnly) return;
    
    try {
      setUploadingRooms(prev => ({ ...prev, [roomId]: true }));
      
      // FormData 생성
      const formData = new FormData();
      files.forEach((file) => {
        formData.append('images', file);
      });

      // S3에 객실 이미지 업로드 (호텔 등록 중이므로 roomIdx 없이)
      // 실제로는 마스터 승인 후 roomIdx가 생성되므로, 여기서는 이미지만 업로드하고
      // 임시 ID로 관리 (마스터 승인 시 실제 roomIdx와 연결)
      const response = await axiosInstance.post('/imageUpload/hotel/room/images', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success && response.data.images) {
        // 업로드된 이미지 정보 (파일명만 저장됨)
        const uploadedImages = response.data.images.map((img) => ({
          id: img.roomImageIdx || Date.now() + Math.random(),
          imageUrl: img.imageUrl, // 파일명만 저장됨
          imageOrder: img.imageOrder || 1
        }));

        // 해당 객실의 기존 이미지에 추가
        const room = rooms.find(r => r.id === roomId);
        const currentImages = Array.isArray(room?.images) ? room.images : [];
        const updatedImages = [...currentImages, ...uploadedImages];
        
        updateRoom(roomId, { images: updatedImages });
      } else {
        alert('객실 이미지 업로드에 실패했습니다.');
      }
    } catch (error) {
      console.error('객실 이미지 업로드 실패:', error);
      alert('객실 이미지 업로드 중 오류가 발생했습니다.');
    } finally {
      setUploadingRooms(prev => ({ ...prev, [roomId]: false }));
    }
  };

  const handleRoomImageDrop = async (roomId, e) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length > 0) {
      await handleRoomImageFiles(roomId, imageFiles);
    }
  };

  const handleRoomImageSelect = async (roomId, e) => {
    const files = Array.from(e.target.files);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length > 0) {
      await handleRoomImageFiles(roomId, imageFiles);
    }
    
    e.target.value = '';
  };

  const removeRoomImage = (roomId, imageId) => {
    if (readOnly) return;
    
    const room = rooms.find(r => r.id === roomId);
    if (!room) return;
    
    const currentImages = Array.isArray(room.images) ? room.images : [];
    const updatedImages = currentImages.filter((img) => img.id !== imageId);
    updateRoom(roomId, { images: updatedImages });
  };

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium text-gray-900">객실 관리 <span className="text-red-500">*</span></h3>
          <p className="text-sm text-gray-500">호텔의 객실 정보를 등록하세요 (최소 1개 필수)</p>
        </div>
        {!readOnly && (
          <button
            onClick={addRoom}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            + 객실 추가
          </button>
        )}
      </div>

      {/* 객실 목록 */}
      {rooms.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <div className="text-gray-400 text-6xl mb-4">🛏️</div>
          <h4 className="text-lg font-medium text-gray-900 mb-2">등록된 객실이 없습니다</h4>
          <p className="text-gray-500 mb-4">첫 번째 객실을 추가해보세요</p>
          {!readOnly && (
            <button
              onClick={addRoom}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              객실 추가하기
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {rooms.map((room, index) => (
            <div key={room.id} className="border border-gray-200 rounded-lg overflow-hidden">
              {/* 객실 헤더 */}
              <div className="bg-gray-50 px-4 py-3 flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <span className="text-sm font-medium text-gray-500">객실 {index + 1}</span>
                  <input
                    type="text"
                    value={room.name}
                    onChange={(e) => updateRoom(room.id, { name: e.target.value })}
                    readOnly={readOnly}
                    disabled={readOnly}
                    className={`text-lg font-medium bg-transparent border-none focus:outline-none focus:ring-0 p-0 ${readOnly ? "cursor-not-allowed" : ""}`}
                    placeholder="객실명을 입력하세요"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => toggleRoomExpansion(room.id)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    {expandedRoom === room.id ? "접기" : "펼치기"}
                  </button>
                  {!readOnly && (
                    <button
                      onClick={() => removeRoom(room.id)}
                      className="text-red-400 hover:text-red-600"
                    >
                      삭제
                    </button>
                  )}
                </div>
              </div>

              {/* 객실 상세 정보 */}
              {expandedRoom === room.id && (
                <div className="p-4 space-y-6">
                  {/* 기본 정보 */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        객실 타입
                      </label>
                      <select
                        value={room.type}
                        onChange={(e) => updateRoom(room.id, { type: e.target.value })}
                        disabled={readOnly}
                        className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${readOnly ? "bg-gray-100 cursor-not-allowed" : ""}`}
                      >
                        <option value="">객실 타입을 선택하세요</option>
                        {initialData.roomTypes.map((type) => (
                          <option key={type.id} value={type.name}>
                            {type.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        가격 (원)
                      </label>
                      <input
                        type="number"
                        value={room.price}
                        onChange={(e) => updateRoom(room.id, { price: e.target.value })}
                        readOnly={readOnly}
                        disabled={readOnly}
                        className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${readOnly ? "bg-gray-100 cursor-not-allowed" : ""}`}
                        placeholder="100000"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        수용 인원
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="10"
                        value={room.capacity}
                        onChange={(e) => updateRoom(room.id, { capacity: parseInt(e.target.value) })}
                        readOnly={readOnly}
                        disabled={readOnly}
                        className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${readOnly ? "bg-gray-100 cursor-not-allowed" : ""}`}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        객실 크기 (㎡)
                      </label>
                      <input
                        type="text"
                        value={room.size}
                        onChange={(e) => updateRoom(room.id, { size: e.target.value })}
                        readOnly={readOnly}
                        disabled={readOnly}
                        className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${readOnly ? "bg-gray-100 cursor-not-allowed" : ""}`}
                        placeholder="25"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        침대 타입
                      </label>
                      <select
                        value={room.bedType}
                        onChange={(e) => updateRoom(room.id, { bedType: e.target.value })}
                        disabled={readOnly}
                        className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${readOnly ? "bg-gray-100 cursor-not-allowed" : ""}`}
                      >
                        <option value="">침대 타입을 선택하세요</option>
                        <option value="싱글">싱글</option>
                        <option value="더블">더블</option>
                        <option value="트윈">트윈</option>
                        <option value="퀸">퀸</option>
                        <option value="킹">킹</option>
                        <option value="온돌">온돌</option>
                      </select>
                    </div>
                  </div>

                  {/* 편의시설 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      편의시설
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                      {initialData.amenities.map((amenity) => (
                        <label key={amenity.id} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={room.amenities?.includes(amenity.name) || false}
                            onChange={(e) => {
                              const currentAmenities = room.amenities || [];
                              const newAmenities = e.target.checked
                                ? [...currentAmenities, amenity.name]
                                : currentAmenities.filter(a => a !== amenity.name);
                              updateRoom(room.id, { amenities: newAmenities });
                            }}
                            disabled={readOnly}
                            className={`rounded border-gray-300 text-blue-600 focus:ring-blue-500 ${readOnly ? "cursor-not-allowed" : ""}`}
                          />
                          <span className="text-sm text-gray-700">{amenity.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* 객실 설명 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      객실 설명
                    </label>
                    <textarea
                      value={room.description}
                      onChange={(e) => updateRoom(room.id, { description: e.target.value })}
                      readOnly={readOnly}
                      disabled={readOnly}
                      rows={3}
                      className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${readOnly ? "bg-gray-100 cursor-not-allowed" : ""}`}
                      placeholder="객실의 특징과 편의시설을 자세히 설명해주세요"
                    />
                  </div>

                  {/* 객실 이미지 */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-sm font-medium text-gray-700">
                        객실 이미지 (최대 10개)
                      </label>
                      {!readOnly && (
                        <>
                          <input
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={(e) => handleRoomImageSelect(room.id, e)}
                            className="hidden"
                            id={`room-image-upload-${room.id}`}
                          />
                          <label
                            htmlFor={`room-image-upload-${room.id}`}
                            className="inline-flex items-center px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 cursor-pointer text-sm"
                          >
                            이미지 선택
                          </label>
                        </>
                      )}
                    </div>
                    <div
                      className={`border-2 border-dashed rounded-lg p-6 transition-colors ${
                        "border-gray-300 hover:border-gray-400"
                      }`}
                      onDragOver={(e) => {
                        e.preventDefault();
                      }}
                      onDrop={(e) => handleRoomImageDrop(room.id, e)}
                    >
                      {(!room.images || !Array.isArray(room.images) || room.images.length === 0) ? (
                        <div className="text-center">
                          <div className="text-gray-400 text-4xl mb-2">📷</div>
                          <p className="text-gray-500 text-sm">객실 이미지를 업로드하세요</p>
                          <p className="text-xs text-gray-400 mt-1">드래그 앤 드롭 또는 "이미지 선택" 버튼 사용</p>
                        </div>
                      ) : (
                        <div>
                          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                            {room.images.map((image, imgIndex) => (
                              <div key={image.id || imgIndex} className="relative group">
                                <div className="aspect-square bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
                                  {image.imageUrl ? (
                                    <img 
                                      src={`https://sist-checkin.s3.ap-northeast-2.amazonaws.com/hotelroom/${image.imageUrl}`}
                                      alt="객실 이미지" 
                                      className="w-full h-full object-cover" 
                                    />
                                  ) : (
                                    <span className="text-gray-400 text-xl">🖼️</span>
                                  )}
                                </div>
                                {!readOnly && (
                                  <button 
                                    onClick={() => removeRoomImage(room.id, image.id)}
                                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 text-xs"
                                  >
                                    ×
                                  </button>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    {uploadingRooms[room.id] && (
                      <div className="mt-2 text-center">
                        <div className="inline-flex items-center space-x-2 text-blue-600 text-sm">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                          <span>이미지 업로드 중...</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* 에러 메시지 */}
      {errors.rooms && (
        <div className="text-red-500 text-sm mt-2">{errors.rooms}</div>
      )}
    </div>
  );
};

export default HotelRooms;
