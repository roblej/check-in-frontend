"use client";

const HotelDining = ({ dining, addDining, removeDining, updateDining, errors, readOnly = false }) => {
  const addDiningItem = () => {
    if (readOnly) return;
    const newDining = {
      id: Date.now(),
      name: "",
      type: "",
      operatingHours: "",
      menu: "",
      description: "",
      priceRange: "",
      capacity: "",
      isActive: true
    };
    
    addDining(newDining);
  };

  const removeDiningItem = (diningId) => {
    if (readOnly) return;
    removeDining(diningId);
  };

  const updateDiningItem = (diningId, data) => {
    updateDining(diningId, data);
  };

  const diningTypes = [
    "레스토랑",
    "카페",
    "바",
    "라운지",
    "룸서비스",
    "조식당",
    "한식당",
    "중식당",
    "일식당",
    "양식당",
    "뷔페",
    "기타"
  ];

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium text-gray-900">다이닝 관리</h3>
          <p className="text-sm text-gray-500">호텔 내 레스토랑, 카페, 바 등을 등록하세요 (선택사항)</p>
        </div>
        <button
          onClick={addDiningItem}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          + 다이닝 추가
        </button>
      </div>

      {/* 다이닝 목록 */}
      {dining.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <div className="text-gray-400 text-6xl mb-4">🍽️</div>
          <h4 className="text-lg font-medium text-gray-900 mb-2">등록된 다이닝이 없습니다</h4>
          <p className="text-gray-500 mb-4">호텔 내 레스토랑이나 카페가 있다면 추가해보세요</p>
          <button
            onClick={addDiningItem}
            className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            다이닝 추가하기
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {dining.map((item, index) => (
            <div key={item.id} className="border border-gray-200 rounded-lg p-6">
              {/* 다이닝 헤더 */}
              <div className="flex justify-between items-start mb-4">
                <h4 className="text-lg font-medium text-gray-900">
                  {item.name || `다이닝 ${index + 1}`}
                </h4>
                <button
                  onClick={() => removeDiningItem(item.id)}
                  className="text-red-400 hover:text-red-600"
                >
                  삭제
                </button>
              </div>

              {/* 다이닝 정보 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    다이닝명
                  </label>
                  <input
                    type="text"
                    value={item.name}
                    onChange={(e) => updateDiningItem(item.id, { name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="예: 그랜드 레스토랑"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    다이닝 타입
                  </label>
                  <select
                    value={item.type}
                    onChange={(e) => updateDiningItem(item.id, { type: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">타입을 선택하세요</option>
                    {diningTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    운영시간
                  </label>
                  <input
                    type="text"
                    value={item.operatingHours}
                    onChange={(e) => updateDiningItem(item.id, { operatingHours: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="예: 06:00 - 22:00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    가격대
                  </label>
                  <input
                    type="text"
                    value={item.priceRange}
                    onChange={(e) => updateDiningItem(item.id, { priceRange: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="예: 15,000원 - 50,000원"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    수용 인원
                  </label>
                  <input
                    type="number"
                    value={item.capacity}
                    onChange={(e) => updateDiningItem(item.id, { capacity: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="100"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    대표 메뉴
                  </label>
                  <textarea
                    value={item.menu}
                    onChange={(e) => updateDiningItem(item.id, { menu: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="대표 메뉴나 특별한 요리를 입력하세요"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    상세 설명
                  </label>
                  <textarea
                    value={item.description}
                    onChange={(e) => updateDiningItem(item.id, { description: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="다이닝의 특징, 분위기, 서비스 등을 자세히 설명하세요"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={item.isActive}
                      onChange={(e) => updateDiningItem(item.id, { isActive: e.target.checked })}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">운영 중</span>
                  </label>
                </div>
              </div>

              {/* 다이닝 이미지 */}
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  다이닝 이미지
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <div className="text-gray-400 text-4xl mb-2">📷</div>
                  <p className="text-gray-500">다이닝 이미지를 업로드하세요</p>
                  <p className="text-sm text-gray-400">드래그 앤 드롭 또는 클릭하여 선택</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 안내 메시지 */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex">
          <div className="text-blue-400 text-xl mr-3">💡</div>
          <div>
            <h4 className="text-sm font-medium text-blue-900">다이닝 등록 안내</h4>
            <p className="text-sm text-blue-700 mt-1">
              호텔 내 레스토랑, 카페, 바 등이 있다면 등록해주세요. 
              고객들이 호텔의 다이닝 시설을 미리 확인할 수 있습니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HotelDining;
