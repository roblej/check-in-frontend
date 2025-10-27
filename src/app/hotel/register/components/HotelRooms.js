"use client";

import { useState } from "react";

const HotelRooms = ({ rooms, addRoom, removeRoom, updateRoom, errors, initialData }) => {
  const [expandedRoom, setExpandedRoom] = useState(null);

  const toggleRoomExpansion = (roomId) => {
    setExpandedRoom(expandedRoom === roomId ? null : roomId);
  };

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium text-gray-900">객실 관리 <span className="text-red-500">*</span></h3>
          <p className="text-sm text-gray-500">호텔의 객실 정보를 등록하세요 (최소 1개 필수)</p>
        </div>
        <button
          onClick={addRoom}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          + 객실 추가
        </button>
      </div>

      {/* 객실 목록 */}
      {rooms.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <div className="text-gray-400 text-6xl mb-4">🛏️</div>
          <h4 className="text-lg font-medium text-gray-900 mb-2">등록된 객실이 없습니다</h4>
          <p className="text-gray-500 mb-4">첫 번째 객실을 추가해보세요</p>
          <button
            onClick={addRoom}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            객실 추가하기
          </button>
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
                    className="text-lg font-medium bg-transparent border-none focus:outline-none focus:ring-0 p-0"
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
                  <button
                    onClick={() => removeRoom(room.id)}
                    className="text-red-400 hover:text-red-600"
                  >
                    삭제
                  </button>
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
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
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="객실의 특징과 편의시설을 자세히 설명해주세요"
                    />
                  </div>

                  {/* 객실 이미지 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      객실 이미지
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <div className="text-gray-400 text-4xl mb-2">📷</div>
                      <p className="text-gray-500">객실 이미지를 업로드하세요</p>
                      <p className="text-sm text-gray-400">드래그 앤 드롭 또는 클릭하여 선택</p>
                    </div>
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
