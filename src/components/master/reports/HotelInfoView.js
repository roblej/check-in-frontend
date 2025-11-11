"use client";

import { Building2, Phone } from "lucide-react";

const HotelInfoView = ({ hotelInfo }) => {
  if (!hotelInfo) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">호텔 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="p-6 bg-gray-50 rounded-lg border-2 border-gray-200">
      <div className="flex items-center gap-2 mb-4">
        <Building2 className="w-5 h-5 text-gray-600" />
        <h3 className="text-lg font-bold text-gray-900">호텔 정보</h3>
      </div>
      <div className="space-y-3">
        <div className="flex items-start gap-3">
          <span className="font-semibold text-gray-700 min-w-[100px]">호텔명:</span>
          <span className="text-gray-900 text-base">{hotelInfo.title || '-'}</span>
        </div>
        <div className="flex items-start gap-3">
          <Phone className="w-4 h-4 text-gray-500 mt-1" />
          <span className="font-semibold text-gray-700 min-w-[100px]">연락처:</span>
          <span className="text-gray-900 text-base">{hotelInfo.tel || '-'}</span>
        </div>
      </div>
    </div>
  );
};

export default HotelInfoView;

