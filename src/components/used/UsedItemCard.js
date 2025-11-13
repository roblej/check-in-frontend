'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Button from '../Button';
import { usedAPI } from '@/lib/api/used';

const UsedItemCard = ({ item, onInquire, customer, customerLoading }) => {
  const router = useRouter();
  
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

  const handleInquire = async () => {
    try {
      // 로그인 체크
      if (!customer) {
        alert('로그인이 필요합니다.');
        router.push('/login');
        return;
      }

      // 본인의 매물인지 체크
      if (item.sellerIdx && customer.customerIdx && item.sellerIdx === customer.customerIdx) {
        alert('본인의 매물은 구매할 수 없습니다.');
        return;
      }

      // 1. 거래 가능성 체크
      const availabilityData = await usedAPI.checkAvailability(item.usedItemIdx || item.id);
      
      if (!availabilityData.available) {
        alert('이미 다른 고객이 거래한 아이템입니다.');
        return;
      }

      // 2. 거래 생성
      const tradeData = await usedAPI.createTrade({
        usedItemIdx: item.usedItemIdx || item.id,
        buyerIdx: customer.customerIdx || customer.id, // httpOnly 쿠키에서 가져온 사용자 ID
        sellerIdx: item.sellerIdx || 1, // 실제로는 판매자 ID
        price: item.salePrice || 0,
        reservIdx: item.reservIdx || 1 // 실제로는 예약 ID
      });
      
      if (!tradeData || !tradeData.usedTradeIdx) {
        alert(tradeData?.message || '거래 생성에 실패했습니다.');
        return;
      }

      // 3. 결제 페이지 정보를 세션 스토리지에 저장 (URL 파라미터 숨기기)
      const paymentData = {
        usedItemIdx: item.usedItemIdx || item.id,
        usedTradeIdx: tradeData.usedTradeIdx,
        hotelName: item.hotelName || '호텔명',
        hotelImage: item.image || '',
        hotelAddress: item.location || '호텔 주소',
        roomType: item.roomType || '객실 정보 없음',
        checkIn: item.checkIn || '',
        checkOut: item.checkOut || '',
        guests: item.guests || 2,
        originalPrice: item.originalPrice || 0,
        salePrice: item.salePrice || 0,
        seller: item.seller || '판매자'
      };

      // 이전 거래의 세션 스토리지 정리 (있는 경우)
      const previousTradeIdx = sessionStorage.getItem('used_payment_current');
      if (previousTradeIdx && previousTradeIdx !== String(tradeData.usedTradeIdx)) {
        const previousStorageKey = `used_payment_${previousTradeIdx}`;
        sessionStorage.removeItem(previousStorageKey);
        console.log('🧹 이전 거래 세션 스토리지 정리:', {
          storageKey: previousStorageKey,
          previousTradeIdx,
          newTradeIdx: tradeData.usedTradeIdx
        });
      }

      // 세션 스토리지에 저장 (거래 ID별 키와 현재 거래 키 모두 저장)
      const newStorageKeyTrade = `used_payment_${tradeData.usedTradeIdx}`;
      const storageKeyCurrent = 'used_payment_current';
      
      sessionStorage.setItem(newStorageKeyTrade, JSON.stringify(paymentData));
      // 현재 결제 중인 거래 키 저장 (URL 파라미터 없이 접근하기 위함)
      sessionStorage.setItem(storageKeyCurrent, String(tradeData.usedTradeIdx));
      
      // 세션 스토리지 저장 확인
      console.log('✅ 거래 생성 및 세션 스토리지 저장 완료:', {
        usedTradeIdx: tradeData.usedTradeIdx,
        storageKeyTrade: newStorageKeyTrade,
        storageKeyCurrent,
        paymentData,
        verified: sessionStorage.getItem(storageKeyCurrent) === String(tradeData.usedTradeIdx),
        allKeys: Object.keys(sessionStorage).filter(k => k.startsWith('used_payment_'))
      });

      // URL 파라미터 없이 이동 (완전히 숨김)
      router.push('/used-payment');
      
    } catch (error) {
      console.error('거래 생성 오류:', error);
      alert('거래 생성 중 오류가 발생했습니다.');
    }
  };

  const handleHotelDetail = () => {
    if (item.contentId) {
      // roomIdx 추출
      const roomIdx = item.originalData?.roomIdx || item.originalData?.reservation?.roomIdx || item.roomIdx || null;
      
      // URL 파라미터 생성
      const params = new URLSearchParams();
      if (roomIdx) {
        params.set('roomIdx', roomIdx.toString());
      }
      if (item.checkIn) {
        params.set('checkIn', item.checkIn);
      }
      if (item.checkOut) {
        params.set('checkOut', item.checkOut);
      }
      if (item.guests) {
        params.set('adults', item.guests.toString());
      }
      
      // 새 창에서 호텔 상세 페이지 열기
      const url = `/hotel/${item.contentId}${params.toString() ? `?${params.toString()}` : ''}`;
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 overflow-hidden group">
      {/* 이미지 */}
      <div 
        className="relative h-48 overflow-hidden cursor-pointer"
        onClick={handleHotelDetail}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleHotelDetail();
          }
        }}
        aria-label={`${item.hotelName} 호텔 상세 정보 보기`}
      >
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
          <div className="absolute top-3 left-3 bg-[#3B82F6] text-white px-2 py-1 rounded-full text-xs font-semibold">
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
          <h3 
            className="text-lg font-bold text-gray-900 mb-1 cursor-pointer hover:text-blue-600 transition-colors"
            onClick={handleHotelDetail}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleHotelDetail();
              }
            }}
            aria-label={`${item.hotelName} 호텔 상세 정보 보기`}
          >
            {item.hotelName || '호텔명 없음'}
          </h3>
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
              <p className="text-xl font-bold text-[#3B82F6]">
                {formatPrice(item.salePrice || 0)}원
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">할인</p>
              <p className="text-lg font-semibold text-blue-600">
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
            className="flex-1 bg-[#3B82F6] hover:bg-blue-600"
            onClick={handleInquire}
            disabled={customerLoading || (customer && item.sellerIdx && customer.customerIdx === item.sellerIdx)}
          >
            {customerLoading ? '로딩중...' : (customer && item.sellerIdx && customer.customerIdx === item.sellerIdx ? '본인 매물' : '결제하기')}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default UsedItemCard;