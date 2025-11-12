'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Heart, ChevronRight, Building2, Hotel, MapPin } from 'lucide-react';
import Image from 'next/image';
import { bookmarkAPI } from '@/lib/api/bookmark';
import { hotelAPI } from '@/lib/api/hotel';

const ROOM_IMAGE_BASE_URL = (() => {
  const base = process.env.NEXT_PUBLIC_ROOM_IMAGE_BASE_URL || '';
  if (!base) return '';
  return base.endsWith('/') ? base : `${base}/`;
})();

const buildRoomImageUrl = (imagePath) => {
  if (!imagePath) return '';
  if (imagePath.startsWith('http')) return imagePath;
  return `${ROOM_IMAGE_BASE_URL}${imagePath}`;
};

export default function FavoritesSection() {
  const router = useRouter();
  const [previewItems, setPreviewItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadPreview = async () => {
      setLoading(true);
      setError(null);
      try {
        const [hotelBookmarks, roomBookmarks] = await Promise.all([
          bookmarkAPI.getHotelBookmarks(),
          bookmarkAPI.getRoomBookmarks(),
        ]);

        const combined = [
          ...(Array.isArray(hotelBookmarks)
            ? hotelBookmarks.map((item) => ({
                type: 'hotel',
                contentId: item.contentId,
                id: `hotel-${item.hotelBookIdx ?? item.contentId}`,
                hotelBookIdx: item.hotelBookIdx,
              }))
            : []),
          ...(Array.isArray(roomBookmarks)
            ? roomBookmarks.map((item) => ({
                type: 'room',
                contentId: item.contentid,
                roomIdx: item.roomIdx,
                id: `room-${item.roomBookIdx ?? `${item.contentid}-${item.roomIdx}`}`,
                roomBookIdx: item.roomBookIdx,
              }))
            : []),
        ];

        if (combined.length === 0) {
          setPreviewItems([]);
          return;
        }

        const sorted = combined.sort((a, b) => {
          const aKey = a.hotelBookIdx ?? a.roomBookIdx ?? 0;
          const bKey = b.hotelBookIdx ?? b.roomBookIdx ?? 0;
          return bKey - aKey;
        });

        const hotelCache = new Map();
        const roomCache = new Map();

        const enriched = await Promise.all(
          sorted.slice(0, 3).map(async (bookmark) => {
            if (!bookmark.contentId) return null;

            let hotelDetail = hotelCache.get(bookmark.contentId);
            if (!hotelDetail) {
              try {
                const response = await hotelAPI.getHotelDetail(bookmark.contentId);
                hotelDetail = response?.data ?? response ?? null;
                hotelCache.set(bookmark.contentId, hotelDetail);
              } catch (err) {
                console.error('호텔 상세 조회 실패:', bookmark.contentId, err);
                hotelDetail = null;
                hotelCache.set(bookmark.contentId, null);
              }
            }

            if (!hotelDetail) return null;

            const baseInfo = {
              id: bookmark.id,
              type: bookmark.type,
              contentId: bookmark.contentId,
              title: hotelDetail?.title ?? hotelDetail?.name ?? '호텔 정보 없음',
              subtitle: null,
              location: hotelDetail?.adress ?? hotelDetail?.address ?? '-',
              thumbnail:
                hotelDetail?.imageUrl ??
                (Array.isArray(hotelDetail?.images) ? hotelDetail.images[0] : ''),
              link: '/mypage/bookmarks',
            };

            if (bookmark.type === 'room' && bookmark.roomIdx != null) {
              const roomKey = `${bookmark.contentId}-${bookmark.roomIdx}`;
              let roomDetail = roomCache.get(roomKey);
              if (!roomDetail) {
                try {
                  const response = await hotelAPI.getHotelRooms(bookmark.contentId);
                  const rooms = response?.data ?? response ?? [];
                  roomDetail = Array.isArray(rooms)
                    ? rooms.find((room) => room.roomIdx === bookmark.roomIdx)
                    : null;
                  if (!roomDetail && rooms?.content && Array.isArray(rooms.content)) {
                    roomDetail = rooms.content.find((room) => room.roomIdx === bookmark.roomIdx);
                  }
                  if (!roomDetail || !roomDetail.imageUrl) {
                    const imageRes = await hotelAPI.getRoomImages(
                      bookmark.contentId,
                      bookmark.roomIdx
                    );
                    const roomImages = imageRes?.data ?? imageRes ?? [];
                    const firstImage = Array.isArray(roomImages) ? roomImages[0]?.imageUrl : null;
                    if (roomDetail) {
                      roomDetail = { ...roomDetail, imageUrl: firstImage ?? roomDetail.imageUrl };
                    } else if (firstImage) {
                      roomDetail = {
                        roomIdx: bookmark.roomIdx,
                        contentId: bookmark.contentId,
                        name: '',
                        basePrice: null,
                        imageUrl: firstImage,
                      };
                    }
                  }
                  roomCache.set(roomKey, roomDetail ?? null);
                } catch (err) {
                  console.error('객실 목록 조회 실패:', bookmark.contentId, err);
                  roomCache.set(roomKey, null);
                  roomDetail = null;
                }
              }

              return {
                ...baseInfo,
                subtitle: roomDetail?.name ?? '객실 정보 없음',
                location:
                  hotelDetail?.adress ?? hotelDetail?.address ?? baseInfo.location ?? '-',
                thumbnail: roomDetail?.imageUrl
                  ? buildRoomImageUrl(roomDetail.imageUrl)
                  : baseInfo.thumbnail,
              };
            }

            return {
              ...baseInfo,
              subtitle: null,
            };
          })
        );

        const filtered = enriched.filter(Boolean);
        setPreviewItems(filtered);
      } catch (err) {
        console.error('찜 미리보기 불러오기 실패:', err);
        setError('찜 목록을 불러오지 못했습니다.');
        setPreviewItems([]);
      } finally {
        setLoading(false);
      }
    };

    loadPreview();
  }, []);

  const content = useMemo(() => {
    if (loading) {
      return (
        <div className="flex flex-1 flex-col gap-3">
          {[1, 2, 3].map((index) => (
            <div
              key={index}
              className="flex animate-pulse items-center gap-4 rounded-2xl border border-gray-200 bg-white p-4"
            >
              <div className="h-20 w-20 rounded-xl bg-gradient-to-br from-gray-200 to-gray-300" />
              <div className="flex-1 space-y-3">
                <div className="h-4 w-2/3 rounded bg-gray-200" />
                <div className="h-3 w-1/2 rounded bg-gray-100" />
                <div className="flex gap-2">
                  <div className="h-3 w-20 rounded bg-gray-100" />
                </div>
              </div>
            </div>
          ))}
        </div>
      );
    }

    if (error) {
      return (
        <div className="p-4 text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl">
          {error}
        </div>
      );
    }

    if (!previewItems.length) {
      return (
        <div className="flex flex-1 flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 bg-gray-50 py-10 text-sm text-gray-500">
          아직 찜한 내역이 없습니다.
          <span className="mt-1 text-xs text-gray-400">
            마음에 드는 호텔을 찜해보세요!
          </span>
        </div>
      );
    }

    const DEFAULT_THUMBNAIL = `${ROOM_IMAGE_BASE_URL}default-hotel-thumbnail.webp`;

    return (
      <div className="flex flex-1 flex-col gap-3">
        {previewItems.map((item) => (
          <div
            key={item.id}
            role="button"
            tabIndex={0}
            onClick={() => {
              if (item.type === 'room' && item.roomIdx != null) {
                router.push(`/hotel/${item.contentId}?roomIdx=${item.roomIdx}`);
              } else {
                router.push(`/hotel/${item.contentId}`);
              }
            }}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                if (item.type === 'room' && item.roomIdx != null) {
                  router.push(`/hotel/${item.contentId}?roomIdx=${item.roomIdx}`);
                } else {
                  router.push(`/hotel/${item.contentId}`);
                }
              }
            }}
            onDragStart={(event) => event.preventDefault()}
            className="group flex w-full select-none items-center gap-3 rounded-lg border border-gray-200 bg-white p-3 text-left shadow-sm transition-all hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
          >
            <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
              {item.thumbnail ? (
                <Image
                  src={item.thumbnail}
                  alt={`${item.title} 썸네일`}
                  fill
                  sizes="64px"
                  className="object-cover"
                  priority={false}
                  draggable={false}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  {item.type === 'room' ? (
                    <Hotel className="w-6 h-6" />
                  ) : (
                    <Building2 className="w-6 h-6" />
                  )}
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="mb-1 text-xs font-medium uppercase tracking-wide text-blue-500">
                    {item.type === 'room' ? '객실' : '호텔'}
                  </p>
                  <h3
                    className="truncate text-sm font-semibold text-gray-900"
                    title={item.title}
                  >
                    {item.title}
                  </h3>
                  {item.subtitle ? (
                    <p className="truncate text-xs text-gray-500 mt-1">{item.subtitle}</p>
                  ) : null}
                </div>
                <ChevronRight className="h-4 w-4 flex-shrink-0 text-gray-300 transition-colors group-hover:text-blue-500" />
              </div>

              <p className="mt-1 flex items-center gap-1 text-xs text-gray-500">
                <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                <span className="truncate">{item.location || '-'}</span>
              </p>
              {/* viewedAt이 없는 경우 높이 일치를 위한 빈 공간 (최근본호텔의 viewedAt 영역과 동일한 높이) */}
              <div className="mt-1 h-4 flex items-center">
                <span className="invisible text-xs">placeholder</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }, [previewItems, loading, error, router]);

  return (
    <section className="flex h-full flex-col rounded-2xl border border-gray-200 bg-white p-6 shadow-lg">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-xl font-bold text-gray-900">
          <Heart className="h-6 w-6 text-red-500" />
          찜 목록
        </h2>
        <button
          type="button"
          onClick={() => router.push('/mypage/bookmarks')}
          className="flex items-center gap-1 text-sm font-medium text-blue-600 transition-colors hover:text-blue-700"
        >
          전체보기
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
      {content}
    </section>
  );
}
