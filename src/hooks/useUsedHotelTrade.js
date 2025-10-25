'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

/**
 * 중고 호텔 거래 동시성 관리 훅
 * DB 트랜잭션 기반으로 동시성 문제 해결
 */
export const useUsedHotelTrade = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [trade, setTrade] = useState(null);
  const router = useRouter();

  // 중고 아이템 거래 가능성 체크
  const checkAvailability = async (usedItemIdx) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/used-hotels/${usedItemIdx}/availability`);
      const data = await response.json();
      
      if (response.ok) {
        return data.available;
      } else {
        setError(data.message);
        return false;
      }
    } catch (err) {
      setError('거래 가능성 체크 중 오류가 발생했습니다.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // 거래 생성 (결제 전)
  const createTrade = async (tradeData) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/used-hotels/trade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tradeData)
      });

      const data = await response.json();
      
      if (response.ok) {
        setTrade({
          usedTradeIdx: data.usedTradeIdx,
          status: data.status
        });
        return true;
      } else {
        setError(data.message);
        return false;
      }
    } catch (err) {
      setError('거래 생성 중 오류가 발생했습니다.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // 거래 확정 (결제 완료 후)
  const confirmTrade = async (usedTradeIdx) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/used-hotels/trade/${usedTradeIdx}/confirm`, {
        method: 'POST'
      });

      const data = await response.json();
      
      if (response.ok) {
        setTrade(prev => ({
          ...prev,
          status: data.status
        }));
        return true;
      } else {
        setError(data.message);
        return false;
      }
    } catch (err) {
      setError('거래 확정 중 오류가 발생했습니다.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // 거래 취소
  const cancelTrade = async (usedTradeIdx, reason = '사용자 취소') => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/used-hotels/trade/${usedTradeIdx}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason })
      });

      const data = await response.json();
      
      if (response.ok) {
        setTrade(null);
        return true;
      } else {
        setError(data.message);
        return false;
      }
    } catch (err) {
      setError('거래 취소 중 오류가 발생했습니다.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    error,
    trade,
    checkAvailability,
    createTrade,
    confirmTrade,
    cancelTrade
  };
};

/**
 * 중고 호텔 거래 컴포넌트
 */
export const UsedHotelTradeComponent = ({ 
  usedItemIdx,
  buyerIdx,
  sellerIdx,
  price,
  reservIdx,
  onTradeSuccess 
}) => {
  const {
    isLoading,
    error,
    trade,
    checkAvailability,
    createTrade,
    confirmTrade,
    cancelTrade
  } = useUsedHotelTrade();

  const handleTradeStart = async () => {
    // 1. 거래 가능성 체크
    const isAvailable = await checkAvailability(usedItemIdx);
    if (!isAvailable) {
      return;
    }

    // 2. 거래 생성
    const success = await createTrade({
      usedItemIdx,
      buyerIdx,
      sellerIdx,
      price,
      reservIdx
    });

    if (success) {
      onTradeSuccess();
    }
  };

  const handlePaymentComplete = async () => {
    if (trade) {
      const success = await confirmTrade(trade.usedTradeIdx);
      if (success) {
        // 결제 완료 페이지로 이동
        router.push('/checkout/success');
      }
    }
  };

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <h3 className="text-red-900 font-semibold mb-2">거래 실패</h3>
        <p className="text-red-700">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-2 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          다시 시도
        </button>
      </div>
    );
  }

  if (trade) {
    const statusText = trade.status === 0 ? '거래 중' : '거래 완료';
    const statusColor = trade.status === 0 ? 'blue' : 'green';
    
    return (
      <div className={`bg-${statusColor}-50 border border-${statusColor}-200 rounded-lg p-4`}>
        <h3 className={`text-${statusColor}-900 font-semibold mb-2`}>
          {trade.status === 0 ? '⏳ 거래 진행 중' : '✅ 거래 완료'}
        </h3>
        <p className={`text-${statusColor}-700 mb-2`}>
          거래번호: {trade.usedTradeIdx}
        </p>
        <p className={`text-${statusColor}-700 mb-3`}>
          상태: {statusText}
        </p>
        
        {trade.status === 0 && (
          <div className="flex gap-2">
            <button
              onClick={handlePaymentComplete}
              disabled={isLoading}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
            >
              {isLoading ? '처리 중...' : '결제 완료'}
            </button>
            <button
              onClick={() => cancelTrade(trade.usedTradeIdx)}
              disabled={isLoading}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 disabled:opacity-50"
            >
              거래 취소
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
      <h3 className="text-green-900 font-semibold mb-2">✅ 거래 가능</h3>
      <p className="text-green-700 mb-3">
        이 중고 호텔은 현재 거래 가능합니다.
      </p>
      <button
        onClick={handleTradeStart}
        disabled={isLoading}
        className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 font-medium disabled:opacity-50"
      >
        {isLoading ? '처리 중...' : '거래 시작'}
      </button>
    </div>
  );
};
