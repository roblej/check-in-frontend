'use client';

import AdminLayout from '@/components/admin/AdminLayout';
import { Bed, Tv, Snowflake, Sofa, Utensils, Building2, CheckCircle, Users } from 'lucide-react';

const RoomTypesPage = () => {
  

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* 페이지 헤더 */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900">객실 타입 관리</h2>
          <p className="text-gray-600">객실 타입과 편의시설을 관리하세요</p>
        </div>

        {/* 새 객실 타입 추가 버튼 */}
        <div className="flex justify-end">
          <button className="bg-[#3B82F6] text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors">
            새 객실 타입 추가
          </button>
        </div>

        {/* 객실 타입 목록 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {roomTypes.map((roomType, key) => (
            <div key={key} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              {/* 객실 이미지 영역 */}
              <div className="h-48 bg-gray-100 flex items-center justify-center">
                <div className="text-6xl">{roomType.images[0]}</div>
              </div>
              
              {/* 객실 정보 */}
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">{roomType.name}</h3>
                    <p className="text-sm text-gray-600">{roomType.size} • 최대 {roomType.capacity}명</p>
                  </div>
                  <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                    활성
                  </span>
                </div>

                {/* 기본 정보 */}
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">침대 타입:</span>
                    <span className="text-sm font-medium text-gray-900">{roomType.bedType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">수용 인원:</span>
                    <span className="text-sm font-medium text-gray-900">{roomType.capacity}명</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">객실 크기:</span>
                    <span className="text-sm font-medium text-gray-900">{roomType.size}</span>
                  </div>
                </div>

                {/* 편의시설 */}
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">편의시설</h4>
                  <div className="flex flex-wrap gap-2">
                    {roomType.amenities.map((amenity, index) => (
                      <span key={index} className="inline-flex px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full">
                        {amenity}
                      </span>
                    ))}
                  </div>
                </div>

                {/* 액션 버튼들 */}
                <div className="flex gap-2">
                  <button className="flex-1 bg-gray-100 text-gray-700 py-2 px-3 rounded text-sm hover:bg-gray-200 transition-colors">
                    상세보기
                  </button>
                  <button className="flex-1 bg-[#3B82F6] text-white py-2 px-3 rounded text-sm hover:bg-blue-600 transition-colors">
                    수정
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 객실 타입 통계 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="text-blue-600 mr-4"><Building2 size={32} /></div>
              <div>
                <p className="text-sm font-medium text-gray-600">총 객실 타입</p>
                <p className="text-2xl font-bold text-gray-900">{roomTypes.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="text-green-600 mr-4"><CheckCircle size={32} /></div>
              <div>
                <p className="text-sm font-medium text-gray-600">활성 타입</p>
                <p className="text-2xl font-bold text-gray-900">{roomTypes.filter(rt => rt.status === 'active').length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="text-purple-600 mr-4"><Users size={32} /></div>
              <div>
                <p className="text-sm font-medium text-gray-600">평균 수용 인원</p>
                <p className="text-2xl font-bold text-gray-900">
                  {Math.round(roomTypes.reduce((sum, rt) => sum + rt.capacity, 0) / roomTypes.length)}명
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="text-3xl mr-4">📏</div>
              <div>
                <p className="text-sm font-medium text-gray-600">평균 크기</p>
                <p className="text-2xl font-bold text-gray-900">
                  {Math.round(roomTypes.reduce((sum, rt) => sum + parseInt(rt.size), 0) / roomTypes.length)}㎡
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default RoomTypesPage;
