'use client';

import { User, Edit } from 'lucide-react';

export default function ProfileHeader({ userData, onEditProfile }) {
  return (
    <section className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 md:p-8 mb-4 sm:mb-6 border border-gray-200">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg flex-shrink-0">
            <User className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1 truncate">
              {userData?.nickname || userData?.id || '사용자'}님
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 truncate">{userData?.email || '이메일 미등록'}</p>
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mt-2">
              <span className="px-2 sm:px-3 py-0.5 sm:py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full whitespace-nowrap">
                {userData?.rank || 'Traveler'} 회원
              </span>
              <span className="px-2 sm:px-3 py-0.5 sm:py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full whitespace-nowrap">
                포인트: {(userData?.point || 0).toLocaleString()}P
              </span>
              <span className="px-2 sm:px-3 py-0.5 sm:py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full whitespace-nowrap">
                캐시: {(userData?.cash || userData?.balance || 0).toLocaleString()}원
              </span>
            </div>
          </div>
        </div>
        <button
          onClick={onEditProfile}
          className="flex items-center justify-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors font-medium text-sm sm:text-base w-full sm:w-auto"
        >
          <Edit className="w-4 h-4" />
          <span>개인정보 수정</span>
        </button>
      </div>
    </section>
  );
}

