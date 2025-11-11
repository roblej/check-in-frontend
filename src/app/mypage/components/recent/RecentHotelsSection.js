'use client';

import { Clock, ChevronRight } from 'lucide-react';

export default function RecentHotelsSection({ recentHotels }) {
  return (
    <section className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 border border-gray-200">
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <h2 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center gap-2">
          <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
          최근본호텔
        </h2>
        <button className="text-xs sm:text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1">
          전체보기
          <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </button>
      </div>
      <div className="space-y-2 sm:space-y-3">
        {recentHotels.map((hotel) => (
          <div key={hotel.id} className="flex gap-3 p-3 border border-gray-200 rounded-lg hover:shadow-md transition-all">
            <div className="w-20 h-20 bg-gradient-to-br from-gray-200 to-gray-300 rounded-lg flex-shrink-0" />
            <div className="flex-1">
              <h3 className="font-bold text-gray-900 mb-1">{hotel.name}</h3>
              <p className="text-xs text-gray-500 mb-2">{hotel.location} · {hotel.viewDate}</p>
              <span className="text-sm font-bold text-gray-700">{hotel.price.toLocaleString()}원~</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

