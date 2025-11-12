'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Heart, ChevronRight, Building2, Hotel, MapPin } from 'lucide-react';
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
        <div className="space-y-3">
          {[1, 2, 3].map((index) => (
            <div
              key={index}
              className="flex gap-3 p-3 border border-gray-200 rounded-lg animate-pulse"
            >
              <div className="w-16 h-16 bg-gray-200 rounded-lg" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-2/3" />
                <div className="h-3 bg-gray-100 rounded w-1/2" />
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
        <div className="p-6 text-center text-sm text-gray-500 border border-dashed border-gray-200 rounded-xl">
          아직 찜한 내역이 없습니다.
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {previewItems.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => {
              if (item.type === 'room' && item.roomIdx != null) {
                router.push(`/hotel/${item.contentId}?roomIdx=${item.roomIdx}`);
              } else {
                router.push(`/hotel/${item.contentId}`);
              }
            }}
            className="w-full flex gap-3 p-3 border border-gray-200 rounded-lg hover:shadow-md transition-all text-left cursor-pointer"
          >
            <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
              {item.thumbnail ? (
                <img
                  src={item.thumbnail}
                  alt={`${item.title} 썸네일`}
                  className="w-full h-full object-cover"
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
            <div className="flex-1">
              <p className="text-xs font-medium text-blue-500 mb-1 uppercase tracking-wide">
                {item.type === 'room' ? '객실' : '호텔'}
              </p>
              <h3 className="font-semibold text-gray-900 text-sm truncate">{item.title}</h3>
              {item.subtitle ? (
                <p className="text-xs text-gray-500 truncate mt-1">{item.subtitle}</p>
              ) : null}
              <p className="text-xs text-gray-500 truncate mt-1 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="truncate">{item.location || '-'}</span>
              </p>
            </div>
          </button>
        ))}
      </div>
    );
  }, [previewItems, loading, error, router]);

  return (
    <section className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <Heart className="w-6 h-6 text-red-500" />
          찜 목록
        </h2>
        <button
          type="button"
          onClick={() => router.push('/mypage/bookmarks')}
          className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
        >
          전체보기
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
      {content}
    </section>
  );
}
