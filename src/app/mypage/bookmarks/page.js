'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { Building2, Hotel, MapPin, ChevronRight, Calendar, X, CheckSquare, Square, Copy } from 'lucide-react';
import { bookmarkAPI } from '@/lib/api/bookmark';
import { hotelAPI } from '@/lib/api/hotel';
import Pagination from '@/components/Pagination';

const ROOM_IMAGE_BASE_URL = (() => {
  const base = process.env.NEXT_PUBLIC_ROOM_IMAGE_BASE_URL || '';
  if (!base) return '';
  return base.endsWith('/') ? base : `${base}/`;
})();

const formatPrice = (price) => {
  if (price === null || price === undefined) return '';
  return new Intl.NumberFormat('ko-KR').format(price);
};

const buildRoomImageUrl = (imagePath) => {
  if (!imagePath) return '';
  if (imagePath.startsWith('http')) return imagePath;
  return `${ROOM_IMAGE_BASE_URL}${imagePath}`;
};

const TABS = [
  { key: 'hotel', label: '호텔' },
  { key: 'room', label: '객실' },
];

const PAGE_SIZE = 10;

const SectionHeader = ({ title, description }) => (
  <div className="mb-8">
    <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{title}</h1>
    {description ? <p className="text-gray-500 mt-2">{description}</p> : null}
  </div>
);

const TabList = ({ activeTab, counts, onChange }) => (
  <div className="flex gap-3 mb-6">
    {TABS.map((tab) => {
      const isActive = activeTab === tab.key;
      return (
        <button
          key={tab.key}
          type="button"
          onClick={() => onChange(tab.key)}
          className={`px-5 py-3 rounded-2xl border transition-colors text-sm font-semibold flex items-center gap-2 ${
            isActive
              ? 'bg-blue-600 text-white border-blue-600 shadow-md'
              : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300 hover:text-blue-600'
          }`}
        >
          {tab.label}
          <span
            className={`text-xs font-semibold px-2 py-1 rounded-full ${
              isActive ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'
            }`}
          >
            {counts[tab.key] ?? 0}
          </span>
        </button>
      );
    })}
  </div>
);

const HotelBookmarkCard = ({ item, onDelete, shareMode = false, selected = false, onToggleSelect }) => {
  const handleCardClick = (e) => {
    if (shareMode) {
      e.preventDefault();
      e.stopPropagation();
      onToggleSelect?.(item.contentId);
    }
  };

  return (
    <article
      className={`relative overflow-hidden rounded-3xl border bg-white shadow-sm transition-all duration-200 hover:shadow-lg ${
        shareMode && selected ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200'
      } ${shareMode ? 'cursor-pointer' : ''}`}
      onClick={shareMode ? handleCardClick : undefined}
    >
      {shareMode ? (
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onToggleSelect?.(item.contentId);
          }}
          className={`absolute top-3 right-3 md:top-4 md:right-4 text-gray-400 hover:text-blue-600 transition-colors z-10 rounded-full bg-white/80 p-1.5 shadow ${
            selected ? 'text-blue-600' : ''
          }`}
          aria-label="호텔 공유 대상 선택"
          aria-pressed={selected}
        >
          {selected ? <CheckSquare className="w-5 h-5 md:w-6 md:h-6" /> : <Square className="w-5 h-5 md:w-6 md:h-6" />}
        </button>
      ) : (
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onDelete(item.contentId);
          }}
          className="absolute top-3 right-3 md:top-4 md:right-4 text-gray-400 hover:text-red-600 transition-colors z-10"
          aria-label="호텔 찜 삭제"
        >
          <X className="w-5 h-5 md:w-6 md:h-6" />
        </button>
      )}
      {shareMode ? (
        <div className="group flex flex-col md:flex-row h-full">
          <div className="w-full h-40 md:h-auto md:w-48 md:aspect-[4/3] bg-gray-100">
            {item.thumbnail ? (
              <img
                src={item.thumbnail}
                alt={`${item.title} 썸네일`}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                <Building2 className="w-10 h-10" />
              </div>
            )}
          </div>
          <div className="flex-1 p-4 md:p-6 space-y-3">
            <div>
              <h3 className="text-base md:text-lg font-semibold text-gray-900">
                {item.title}
              </h3>
              <div className="flex items-center gap-2 text-xs md:text-sm text-gray-500 mt-1">
                <MapPin className="w-4 h-4" />
                {item.region}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <Link
          href={`/hotel/${item.contentId}`}
          className="group flex flex-col md:flex-row h-full"
        >
          <div className="w-full h-40 md:h-auto md:w-48 md:aspect-[4/3] bg-gray-100">
            {item.thumbnail ? (
              <img
                src={item.thumbnail}
                alt={`${item.title} 썸네일`}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                <Building2 className="w-10 h-10" />
              </div>
            )}
          </div>
          <div className="flex-1 p-4 md:p-6 space-y-3">
            <div>
              <h3 className="text-base md:text-lg font-semibold text-gray-900">
                {item.title}
              </h3>
              <div className="flex items-center gap-2 text-xs md:text-sm text-gray-500 mt-1">
                <MapPin className="w-4 h-4" />
                {item.region}
              </div>
            </div>
          </div>
        </Link>
      )}
    </article>
  );
};

const RoomBookmarkCard = ({ item, onDelete }) => (
  <article className="relative overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm hover:shadow-lg transition-all duration-200">
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onDelete(item.roomIdx);
      }}
      className="absolute top-3 right-3 md:top-4 md:right-4 text-gray-400 hover:text-red-600 transition-colors z-10"
      aria-label="객실 찜 삭제"
    >
      <X className="w-5 h-5 md:w-6 md:h-6" />
    </button>
    <Link
      href={`/hotel/${item.contentId}`}
      className="group flex flex-col md:flex-row h-full"
    >
      <div className="w-full h-40 md:h-auto md:w-40 md:aspect-[4/3] bg-gray-100">
        {item.thumbnail ? (
          <img
            src={item.thumbnail}
            alt={`${item.roomName} 썸네일`}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <Hotel className="w-10 h-10" />
          </div>
        )}
      </div>
      <div className="flex-1 p-4 md:p-6 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h3 className="text-base md:text-lg font-semibold text-gray-900">
              {item.hotelTitle}
            </h3>
            <div className="flex items-center gap-2 text-xs md:text-sm text-gray-500 mt-1">
              <MapPin className="w-4 h-4" />
              {item.region}
            </div>
          </div>
        </div>
        <div className="bg-gray-50 border border-gray-100 rounded-2xl px-3 py-3 md:px-4 space-y-2">
          <p className="text-sm md:text-base font-semibold text-gray-700">{item.roomName}</p>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">1박 기준</span>
            <span className="text-base md:text-lg font-bold text-gray-900">{item.price ? `${item.price}원` : '-'}</span>
          </div>
        </div>
      </div>
    </Link>
  </article>
);

const EmptyState = ({ icon: Icon, title, description, ctaLabel }) => (
  <div className="rounded-3xl border border-dashed border-gray-300 bg-white py-20 px-6 text-center flex flex-col items-center gap-4">
    <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
      <Icon className="w-8 h-8" />
    </div>
    <div>
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      <p className="text-sm text-gray-500 mt-1">{description}</p>
    </div>
    <button
      type="button"
      className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors"
    >
      {ctaLabel}
      <ChevronRight className="w-4 h-4" />
    </button>
  </div>
);

export default function MyBookmarkPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('hotel');
  const [hotelState, setHotelState] = useState({
    items: [],
    loading: false,
    error: null,
  });
  const [roomState, setRoomState] = useState({
    items: [],
    loading: false,
    error: null,
  });
  const [isShareMode, setIsShareMode] = useState(false);
  const [selectedHotelIds, setSelectedHotelIds] = useState(new Set());
  const shareSelectedIds = useMemo(() => Array.from(selectedHotelIds), [selectedHotelIds]);
  const [copiedToast, setCopiedToast] = useState(null);
  const [hotelPage, setHotelPage] = useState(0);
  const [roomPage, setRoomPage] = useState(0);

  useEffect(() => {
    if (!copiedToast) return;
    const timer = setTimeout(() => {
      setCopiedToast(null);
    }, 1000);
    return () => clearTimeout(timer);
  }, [copiedToast]);

  const counts = useMemo(
    () => ({
      hotel: hotelState.items.length,
      room: roomState.items.length,
    }),
    [hotelState.items.length, roomState.items.length]
  );

  useEffect(() => {
    if (activeTab !== 'hotel' && isShareMode) {
      setIsShareMode(false);
    }
  }, [activeTab, isShareMode]);

  useEffect(() => {
    if (!isShareMode && selectedHotelIds.size > 0) {
      setSelectedHotelIds(new Set());
    }
  }, [isShareMode, selectedHotelIds.size]);

  const hotelTotalElements = hotelState.items.length;
  const hotelTotalPages = Math.ceil(hotelTotalElements / PAGE_SIZE);
  const hotelItemsForPage = useMemo(() => {
    const start = hotelPage * PAGE_SIZE;
    return hotelState.items.slice(start, start + PAGE_SIZE);
  }, [hotelState.items, hotelPage]);

  const roomTotalElements = roomState.items.length;
  const roomTotalPages = Math.ceil(roomTotalElements / PAGE_SIZE);
  const roomItemsForPage = useMemo(() => {
    const start = roomPage * PAGE_SIZE;
    return roomState.items.slice(start, start + PAGE_SIZE);
  }, [roomState.items, roomPage]);

  useEffect(() => {
    if (hotelTotalPages === 0) {
      if (hotelPage !== 0) {
        setHotelPage(0);
      }
      return;
    }
    if (hotelPage > hotelTotalPages - 1) {
      setHotelPage(hotelTotalPages - 1);
    }
  }, [hotelPage, hotelTotalPages]);

  useEffect(() => {
    if (roomTotalPages === 0) {
      if (roomPage !== 0) {
        setRoomPage(0);
      }
      return;
    }
    if (roomPage > roomTotalPages - 1) {
      setRoomPage(roomTotalPages - 1);
    }
  }, [roomPage, roomTotalPages]);

  const handleTabChange = useCallback((nextTab) => {
    setActiveTab(nextTab);
    if (nextTab === 'hotel') {
      setHotelPage(0);
    } else {
      setRoomPage(0);
    }
  }, []);

  const handleHotelPageChange = useCallback(
    (nextPage) => {
      if (nextPage < 0 || nextPage >= hotelTotalPages) return;
      setHotelPage(nextPage);
    },
    [hotelTotalPages]
  );

  const handleRoomPageChange = useCallback(
    (nextPage) => {
      if (nextPage < 0 || nextPage >= roomTotalPages) return;
      setRoomPage(nextPage);
    },
    [roomTotalPages]
  );

  const handleToggleShareMode = useCallback(() => {
    if (hotelState.items.length === 0) return;
    setIsShareMode((prev) => !prev);
  }, [hotelState.items.length]);

  const handleToggleHotelSelect = useCallback((contentId) => {
    if (!contentId) return;
    setSelectedHotelIds((prev) => {
      const next = new Set(prev);
      if (next.has(contentId)) {
        next.delete(contentId);
      } else {
        next.add(contentId);
      }
      return next;
    });
  }, []);

  const handleCopyShareUrl = useCallback(() => {
    if (shareSelectedIds.length === 0) return;
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://checkinn.store';
    const shareUrl = `${origin}/share?idxs=${shareSelectedIds.join(',')}`;

    const finalize = () => {
      setSelectedHotelIds(new Set());
      setIsShareMode(false);
      setCopiedToast(shareUrl);
    };

    if (navigator?.clipboard?.writeText) {
      navigator.clipboard
        .writeText(shareUrl)
        .then(() => {
          finalize();
        })
        .catch(() => {
          const fallback = prompt('URL 복사에 실패했습니다. 아래 링크를 직접 복사해주세요.', shareUrl);
          if (fallback !== null) {
            finalize();
          }
        });
    } else {
      const fallback = prompt('URL 복사 기능을 지원하지 않습니다. 아래 링크를 직접 복사해주세요.', shareUrl);
      if (fallback !== null) {
        finalize();
      }
    }
  }, [shareSelectedIds]);

  const loadHotelBookmarks = useCallback(async () => {
    setHotelState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const bookmarks = await bookmarkAPI.getHotelBookmarks();
      const hotelCache = new Map();

      const enriched = await Promise.all(
        bookmarks.map(async (bookmark) => {
          const contentId = bookmark.contentId;
          if (!contentId) {
            return null;
          }

          let hotelDetail = hotelCache.get(contentId);
          if (!hotelDetail) {
            try {
              const response = await hotelAPI.getHotelDetail(contentId);
              hotelDetail = response?.data ?? response ?? null;
              hotelCache.set(contentId, hotelDetail);
            } catch (error) {
              console.error('호텔 상세 조회 실패:', contentId, error);
              hotelDetail = null;
              hotelCache.set(contentId, null);
            }
          }

          return {
            id: bookmark.hotelBookIdx ?? `${contentId}-${bookmark.customerIdx ?? 'me'}`,
            contentId,
            title: hotelDetail?.title ?? hotelDetail?.name ?? '호텔 정보 없음',
            region: hotelDetail?.adress ?? hotelDetail?.address ?? '-',
            thumbnail: hotelDetail?.imageUrl ?? (Array.isArray(hotelDetail?.images) ? hotelDetail.images[0] : ''),
          };
        })
      );

      const filtered = enriched.filter(Boolean);
      setHotelState({ items: filtered, loading: false, error: null });
    } catch (error) {
      console.error('호텔 찜 목록 불러오기 실패:', error);
      setHotelState({ items: [], loading: false, error: '호텔 찜 목록을 불러오지 못했습니다.' });
    }
  }, []);

  const loadRoomBookmarks = useCallback(async () => {
    setRoomState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const bookmarks = await bookmarkAPI.getRoomBookmarks();
      const hotelCache = new Map();
      const roomCache = new Map();

      const enriched = await Promise.all(
        bookmarks.map(async (bookmark) => {
          const contentId = bookmark.contentid;
          const roomIdx = bookmark.roomIdx;
          if (!contentId || roomIdx === undefined || roomIdx === null) {
            return null;
          }

          let hotelDetail = hotelCache.get(contentId);
          if (!hotelDetail) {
            try {
              const response = await hotelAPI.getHotelDetail(contentId);
              hotelDetail = response?.data ?? response ?? null;
              hotelCache.set(contentId, hotelDetail);
            } catch (error) {
              console.error('호텔 상세 조회 실패:', contentId, error);
              hotelDetail = null;
              hotelCache.set(contentId, null);
            }
          }

          const roomKey = `${contentId}-${roomIdx}`;
          let roomDetail = roomCache.get(roomKey);
          if (!roomDetail) {
            try {
              const response = await hotelAPI.getHotelRooms(contentId);
              const rooms = response?.data ?? response ?? [];
              roomDetail = Array.isArray(rooms) ? rooms.find((room) => room.roomIdx === roomIdx) : null;
              if (!roomDetail && rooms?.content && Array.isArray(rooms.content)) {
                roomDetail = rooms.content.find((room) => room.roomIdx === roomIdx);
              }
              if (!roomDetail || !roomDetail.imageUrl) {
                try {
                  const imageRes = await hotelAPI.getRoomImages(contentId, roomIdx);
                  const roomImages = imageRes?.data ?? imageRes ?? [];
                  const firstImage = Array.isArray(roomImages) ? roomImages[0]?.imageUrl : null;
                  if (roomDetail) {
                    roomDetail = { ...roomDetail, imageUrl: firstImage ?? roomDetail.imageUrl };
                  } else if (firstImage) {
                    roomDetail = { roomIdx, contentId, name: '', basePrice: null, imageUrl: firstImage };
                  }
                } catch (imageError) {
                  console.error('객실 이미지 조회 실패:', roomKey, imageError);
                }
              }
              roomCache.set(roomKey, roomDetail ?? null);
            } catch (error) {
              console.error('객실 목록 조회 실패:', contentId, error);
              roomCache.set(roomKey, null);
              roomDetail = null;
            }
          }

          return {
            id: bookmark.roomBookIdx ?? roomKey,
            contentId,
            roomIdx,
            hotelTitle: hotelDetail?.title ?? hotelDetail?.name ?? '호텔 정보 없음',
            region: hotelDetail?.adress ?? hotelDetail?.address ?? '-',
            roomName: roomDetail?.name ?? `객실 #${roomIdx}`,
            price: roomDetail?.basePrice !== undefined ? formatPrice(roomDetail.basePrice) : '',
            thumbnail: roomDetail?.imageUrl
              ? buildRoomImageUrl(roomDetail.imageUrl)
              : Array.isArray(roomDetail?.images) && roomDetail.images[0]
                ? buildRoomImageUrl(roomDetail.images[0])
                : '',
          };
        })
      );

      const filtered = enriched.filter(Boolean);
      setRoomState({ items: filtered, loading: false, error: null });
    } catch (error) {
      console.error('객실 찜 목록 불러오기 실패:', error);
      setRoomState({ items: [], loading: false, error: '객실 찜 목록을 불러오지 못했습니다.' });
    }
  }, []);

  useEffect(() => {
    loadHotelBookmarks();
    loadRoomBookmarks();
  }, [loadHotelBookmarks, loadRoomBookmarks]);

  const handleHotelDelete = async (contentId) => {
    if (!contentId || isShareMode) return;
    const confirmDelete = window.confirm('해당 호텔 찜을 삭제하시겠습니까?');
    if (!confirmDelete) return;
    try {
      await bookmarkAPI.deleteHotelBookmark(contentId);
      setHotelState((prev) => ({
        ...prev,
        items: prev.items.filter((item) => item.contentId !== contentId),
      }));
    } catch (error) {
      console.error('호텔 찜 삭제 실패:', error);
      alert('삭제에 실패했습니다. 다시 시도해주세요.');
    }
  };

  const handleRoomDelete = async (roomIdx) => {
    if (roomIdx === undefined || roomIdx === null) return;
    const confirmDelete = window.confirm('해당 객실 찜을 삭제하시겠습니까?');
    if (!confirmDelete) return;
    try {
      await bookmarkAPI.deleteRoomBookmark(roomIdx);
      setRoomState((prev) => ({
        ...prev,
        items: prev.items.filter((item) => item.roomIdx !== roomIdx),
      }));
    } catch (error) {
      console.error('객실 찜 삭제 실패:', error);
      alert('삭제에 실패했습니다. 다시 시도해주세요.');
    }
  };

  const renderHotelSection = () => {
    if (hotelState.loading) {
      return (
        <div className="rounded-3xl border border-gray-200 bg-white py-14 text-center text-gray-500">
          호텔 찜 목록을 불러오는 중입니다...
        </div>
      );
    }

    if (hotelState.error) {
      return (
        <div className="rounded-3xl border border-red-200 bg-red-50 py-6 px-4 text-center text-sm text-red-600">
          {hotelState.error}
        </div>
      );
    }

    if (hotelState.items.length === 0) {
      return (
        <EmptyState
          icon={Building2}
          title="찜한 호텔이 없어요"
          description="관심 있는 호텔을 찜해놓고 빠르게 찾아보세요."
          ctaLabel="호텔 둘러보기"
        />
      );
    }

    return (
      <>
        <div className="space-y-4">
          {hotelItemsForPage.map((item) => (
            <HotelBookmarkCard
              key={item.id}
              item={item}
              onDelete={handleHotelDelete}
              shareMode={isShareMode}
              selected={selectedHotelIds.has(item.contentId)}
              onToggleSelect={handleToggleHotelSelect}
            />
          ))}
        </div>
        {hotelTotalPages > 0 && (
          <Pagination
            currentPage={hotelPage}
            totalPages={hotelTotalPages}
            totalElements={hotelTotalElements}
            pageSize={PAGE_SIZE}
            onPageChange={handleHotelPageChange}
          />
        )}
      </>
    );
  };

  const renderRoomSection = () => {
    if (roomState.loading) {
      return (
        <div className="rounded-3xl border border-gray-200 bg-white py-14 text-center text-gray-500">
          객실 찜 목록을 불러오는 중입니다...
        </div>
      );
    }

    if (roomState.error) {
      return (
        <div className="rounded-3xl border border-red-200 bg-red-50 py-6 px-4 text-center text-sm text-red-600">
          {roomState.error}
        </div>
      );
    }

    if (roomState.items.length === 0) {
      return (
        <EmptyState
          icon={Hotel}
          title="찜한 객실이 없어요"
          description="마음에 드는 객실을 찜하면 빠르게 비교할 수 있어요."
          ctaLabel="객실 찾아보기"
        />
      );
    }

    return (
      <>
        <div className="space-y-4">
          {roomItemsForPage.map((item) => (
            <RoomBookmarkCard key={item.id} item={item} onDelete={handleRoomDelete} />
          ))}
        </div>
        {roomTotalPages > 0 && (
          <Pagination
            currentPage={roomPage}
            totalPages={roomTotalPages}
            totalElements={roomTotalElements}
            pageSize={PAGE_SIZE}
            onPageChange={handleRoomPageChange}
          />
        )}
      </>
    );
  };

  const renderContent = () => {
    if (activeTab === 'hotel') {
      return renderHotelSection();
    }
    return renderRoomSection();
  };

  const shareButtonDisabled = hotelState.items.length === 0;
  const copyDisabled = shareSelectedIds.length === 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-5xl mx-auto px-4 md:px-6 lg:px-8 py-10">
        <button
          type="button"
          onClick={() => router.push('/mypage')}
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6"
        >
          <ChevronRight className="w-4 h-4 rotate-180" />
          마이페이지로 돌아가기
        </button>
        <SectionHeader title="내 찜 목록" description="관심 있게 담아둔 호텔과 객실을 한 곳에서 확인해보세요." />
        <TabList activeTab={activeTab} counts={counts} onChange={handleTabChange} />
        <div className="flex items-center gap-2 text-gray-500 text-sm mb-4">
          <span className="flex items-center gap-2 text-gray-500">
            <Calendar className="w-4 h-4" />
            최근 저장한 순서로 정렬되어 표시됩니다.
          </span>
          {activeTab === 'hotel' && (
            <div className="ml-auto flex items-center gap-2">
              {isShareMode && (
                <button
                  type="button"
                  onClick={handleCopyShareUrl}
                  disabled={copyDisabled}
                  className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold transition-colors ${
                    copyDisabled
                      ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                      : 'border-blue-200 text-blue-600 hover:bg-blue-50'
                  }`}
                >
                  <Copy className="w-4 h-4" />
                  URL 복사하기
                </button>
              )}
              <button
                type="button"
                onClick={handleToggleShareMode}
                disabled={shareButtonDisabled}
                className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold transition-colors ${
                  shareButtonDisabled
                    ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                    : isShareMode
                      ? 'border-blue-200 text-blue-600 bg-blue-50'
                      : 'border-gray-200 text-gray-600 hover:border-blue-300 hover:text-blue-600'
                }`}
              >
                {isShareMode ? '선택 종료' : '공유 선택하기'}
              </button>
            </div>
          )}
        </div>
        <div className="space-y-6">{renderContent()}</div>
      </main>
      <Footer />
      {copiedToast && (
        <div className="fixed inset-x-0 bottom-10 mx-auto w-fit max-w-[90vw] rounded-2xl bg-black/70 px-6 py-3 text-center text-sm text-white shadow-lg backdrop-blur">
          <div className="font-semibold">URL 복사</div>
          <div className="mt-1 break-all text-xs opacity-80">{copiedToast}</div>
        </div>
      )}
    </div>
  );
}

