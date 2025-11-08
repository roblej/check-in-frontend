'use client';

import { User, Edit } from 'lucide-react';

export default function ProfileHeader({ userData, onEditProfile }) {
  return (
    <section className="bg-white rounded-2xl shadow-lg p-8 mb-6 border border-gray-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
            <User className="w-10 h-10 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">
              {userData?.nickname || userData?.id || '사용자'}님
            </h1>
            <p className="text-sm text-gray-500">{userData?.email || '이메일 미등록'}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                {userData?.rank || 'Traveler'} 회원
              </span>
              <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">
                포인트: {(userData?.point || 0).toLocaleString()}P
              </span>
              <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">
                캐시: {(userData?.cash || userData?.balance || 0).toLocaleString()}원
              </span>
            </div>
          </div>
        </div>
        <button
          onClick={onEditProfile}
          className="flex items-center gap-2 px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors font-medium"
        >
          <Edit className="w-4 h-4" />
          <span>개인정보 수정</span>
        </button>
      </div>
    </section>
  );
}

