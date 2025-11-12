'use client';

import Image from 'next/image';
import { MapPin, Clock, Trash2, ChevronRight } from 'lucide-react';
import { formatRelativeTime } from '@/utils/formatRelativeTime';

const ROOM_IMAGE_BASE =
  process.env.NEXT_PUBLIC_ROOM_IMAGE_BASE_URL

const DEFAULT_THUMBNAIL = `${ROOM_IMAGE_BASE}/default-hotel-thumbnail.webp`;

export default function RecentHotelCard({
  hotel,
  onClick,
  onDelete,
  showDelete = false,
}) {
  if (!hotel) {
    return null;
  }

  const {
    contentId,
    hotelName,
    address,
    imageUrl,
    viewedAt,
  } = hotel;

  const handleClick = () => {
    onClick?.(hotel);
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          handleClick();
        }
      }}
      onDragStart={(event) => event.preventDefault()}
      className="group flex w-full select-none items-center gap-3 rounded-lg border border-gray-200 bg-white p-3 text-left shadow-sm transition-all hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
    >
      <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
        <Image
          src={imageUrl || DEFAULT_THUMBNAIL}
          alt={`${hotelName ?? '호텔'} 썸네일`}
          fill
          sizes="64px"
          className="object-cover"
          priority={false}
          draggable={false}
        />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="mb-1 text-xs font-medium uppercase tracking-wide text-blue-500">
              호텔
            </p>
            <h3
              className="truncate text-sm font-semibold text-gray-900"
              title={hotelName ?? contentId}
            >
              {hotelName || '이름 미정'}
            </h3>
          </div>
          <ChevronRight className="h-4 w-4 flex-shrink-0 text-gray-300 transition-colors group-hover:text-blue-500" />
        </div>

        <p className="mt-1 flex items-center gap-1 text-xs text-gray-500">
          <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
          <span className="truncate">{address || '-'}</span>
        </p>
        {viewedAt && (
          <p className="mt-1 flex items-center gap-1 text-xs text-gray-400">
            <Clock className="h-3.5 w-3.5 flex-shrink-0" />
            {formatRelativeTime(viewedAt)}
          </p>
        )}
      </div>

      {showDelete && (
        <button
          type="button"
          className="ml-2 flex-shrink-0 self-center rounded-full p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500"
          onClick={(event) => {
            event.stopPropagation();
            onDelete?.(hotel);
          }}
          aria-label="최근 본 호텔 삭제"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}

