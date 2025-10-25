'use client';

import { useState } from 'react';
import UsedItemCard from './UsedItemCard';
import Pagination from '@/components/Pagination';

const UsedList = ({ 
  resaleItems, 
  loading, 
  currentPage, 
  totalPages, 
  totalElements, 
  pageSize, 
  onPageChange,
  onInquire,
  onBookmark,
  onHotelDetail
}) => {
  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
        <p className="text-gray-600 mt-4">양도거래 목록을 불러오는 중...</p>
      </div>
    );
  }

  return (
    <>
      {/* 양도거래 목록 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {resaleItems.map((item, index) => {
          // usedItemIdx를 주요 식별자로 사용
          const uniqueKey = item.usedItemIdx || `resale-item-${index}`;
          return (
            <UsedItemCard
              key={uniqueKey}
              item={item}
              onInquire={onInquire}
              onBookmark={onBookmark}
              onHotelDetail={onHotelDetail}
            />
          );
        })}
      </div>

      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalElements={totalElements}
          pageSize={pageSize}
          onPageChange={onPageChange}
        />
      )}
    </>
  );
};

export default UsedList;
