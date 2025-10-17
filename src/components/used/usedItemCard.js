'use client';

import Image from 'next/image';
import Button from '../Button';

const ResaleItemCard = ({ item, onInquire, onBookmark }) => {
  const formatPrice = (price) => {
    return new Intl.NumberFormat('ko-KR').format(price);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      month: 'short',
      day: 'numeric'
    });
  };

  const handleInquire = () => {
    if (onInquire) {
      onInquire(item);
    }
  };

  const handleBookmark = () => {
    if (onBookmark) {
      onBookmark(item);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 overflow-hidden group">
      {/* 이미지 */}
      <div className="relative h-48 overflow-hidden">
        {item.image ? (
          <Image
            src={item.image}
            alt={item.hotelName || '호텔 이미지'}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
            <span className="text-gray-400 text-sm">이미지 없음</span>
          </div>
        )}
        {item.urgent && (
          <div className="absolute top-3 left-3 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
            긴급
          </div>
        )}
        <div className="absolute top-3 right-3 bg-black bg-opacity-50 text-white px-2 py-1 rounded-full text-xs">
          {item.discountRate}% 할인
        </div>
      </div>

      {/* 내용 */}
      <div className="p-6">
        <div className="mb-3">
          <h3 className="text-lg font-bold text-gray-900 mb-1">{item.hotelName || '호텔명 없음'}</h3>
          <p className="text-sm text-gray-600">{item.location || '위치 정보 없음'}</p>
        </div>

        {/* 날짜 및 숙박 정보 */}
        <div className="mb-4 space-y-2">
          <div className="flex items-center text-sm text-gray-600">
            <span className="mr-2">📅</span>
            <span>{formatDate(item.checkIn)} - {formatDate(item.checkOut)}</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <span className="mr-2">🏨</span>
            <span>성인 {item.guests || 0}명</span>
            <span className="ml-2 text-gray-400">• {item.roomType || '객실 정보 없음'}</span>
          </div>
        </div>

        {/* 가격 정보 */}
        <div className="mb-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 line-through">
                원가: {formatPrice(item.originalPrice || 0)}원
              </p>
              <p className="text-xl font-bold text-orange-600">
                {formatPrice(item.salePrice || 0)}원
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">할인</p>
              <p className="text-lg font-semibold text-red-500">
                -{formatPrice((item.originalPrice || 0) - (item.salePrice || 0))}원
              </p>
            </div>
          </div>
        </div>

        {/* 설명 */}
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
          {item.description || '설명이 없습니다.'}
        </p>

        {/* 판매자 정보 */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center mr-2">
              <span className="text-xs font-semibold text-gray-600">
                {item.seller?.charAt(0) || '?'}
              </span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">{item.seller || '판매자 정보 없음'}</p>
            </div>
          </div>
        </div>

        {/* 버튼 */}
        <div className="flex gap-2">
          <Button
            variant="primary"
            className="flex-1 bg-orange-500 hover:bg-orange-600"
            onClick={handleInquire}
          >
            결제하기
          </Button>
          <Button
            variant="outline"
            className="px-4"
            onClick={handleBookmark}
          >
            찜하기
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ResaleItemCard;
