'use client';

import Link from 'next/link';
import { Building2, Clock, MapPin, X } from 'lucide-react';
import { formatRelativeTime } from '@/utils/formatRelativeTime';

export default function RecentHotelListCard({ item, onDelete }) {
  const hotel = item;
  if (!hotel) return null;

  const handleDelete = (event) => {
    event.preventDefault();
    event.stopPropagation();
    onDelete?.(hotel);
  };

  return (
    <article className="relative overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm transition-all duration-200 hover:shadow-lg">
      <button
        type="button"
        onClick={handleDelete}
        className="absolute right-3 top-3 z-10 text-gray-400 transition-colors hover:text-red-600 md:right-4 md:top-4"
        aria-label="최근 본 호텔 기록 삭제"
      >
        <X className="h-5 w-5 md:h-6 md:w-6" />
      </button>
      <Link href={`/hotel/${hotel.contentId}`} className="group flex h-full flex-col md:flex-row">
        <div className="h-44 w-full bg-gray-100 md:h-auto md:w-56">
          {hotel.imageUrl ? (
            <img
              src={hotel.imageUrl}
              alt={`${hotel.hotelName || hotel.contentId} 썸네일`}
              className="h-full w-full object-cover"
              draggable={false}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-gray-400">
              <Building2 className="h-10 w-10" />
            </div>
          )}
        </div>
        <div className="flex flex-1 flex-col gap-3 p-5 md:p-6">
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-gray-900">
              {hotel.hotelName || '호텔 정보 없음'}
            </h3>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <MapPin className="h-4 w-4" />
              <span>{hotel.address || '-'}</span>
            </div>
            {hotel.viewedAt && (
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Clock className="h-4 w-4" />
                {formatRelativeTime(hotel.viewedAt)}
              </div>
            )}
          </div>
        </div>
      </Link>
    </article>
  );
}

