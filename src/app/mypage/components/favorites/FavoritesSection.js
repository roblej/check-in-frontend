'use client';

import { Heart, ChevronRight, Hotel, Share2, Trash2 } from 'lucide-react';

export default function FavoritesSection({ likedHotels }) {
  return (
    <section className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <Heart className="w-6 h-6 text-red-500" />
          찜목록
        </h2>
        <button className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1">
          전체보기
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
      <div className="space-y-3">
        {likedHotels.map((hotel) => (
          <div key={hotel.id} className="flex gap-3 p-3 border border-gray-200 rounded-lg hover:shadow-md transition-all">
            <div className="w-20 h-20 bg-gradient-to-br from-gray-200 to-gray-300 rounded-lg flex-shrink-0" />
            <div className="flex-1">
              <h3 className="font-bold text-gray-900 mb-1">{hotel.name}</h3>
              <p className="text-xs text-gray-500 mb-2">{hotel.location}</p>
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-blue-600">{hotel.price.toLocaleString()}원</span>
                <div className="flex gap-1">
                  <button className="p-1.5 hover:bg-blue-50 rounded transition-colors">
                    <Hotel className="w-4 h-4 text-blue-600" />
                  </button>
                  <button className="p-1.5 hover:bg-blue-50 rounded transition-colors">
                    <Share2 className="w-4 h-4 text-gray-600" />
                  </button>
                  <button className="p-1.5 hover:bg-red-50 rounded transition-colors">
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

