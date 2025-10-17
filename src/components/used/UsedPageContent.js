'use client';

import { useState } from 'react';
import HeroSection from './HeroSection';
import FilterSection from './FilterSection';
import ResaleList from './UsedList';
import ResaleSearch from './UsedSearch';

const UsedPageContent = ({ initialData, initialSearchParams }) => {
  const [data, setData] = useState({
    content: initialData?.content || [],
    totalPages: initialData?.totalPages || 0,
    totalElements: initialData?.totalElements || 0,
    currentPage: initialSearchParams?.page || 0
  });

  // 데이터 업데이트 핸들러
  const handleDataUpdate = (newData) => {
    setData(newData);
  };

  // 검색 로직을 ResaleSearch 컴포넌트에서 관리
  const searchState = ResaleSearch({
    initialData,
    initialSearchParams,
    onDataUpdate: handleDataUpdate
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 히어로 섹션 */}
      <HeroSection
        destination={searchState.destination}
        setDestination={searchState.setDestination}
        checkIn={searchState.checkIn}
        setCheckIn={searchState.setCheckIn}
        checkOut={searchState.checkOut}
        setCheckOut={searchState.setCheckOut}
        adults={searchState.adults}
        setAdults={searchState.setAdults}
        onSearch={searchState.handleSearch}
        onReset={searchState.handleReset}
      />

      {/* 필터 섹션 */}
      <FilterSection
        sortBy={searchState.sortBy}
        setSortBy={searchState.handleSortChange}
        filterPrice={searchState.filterPrice}
        setFilterPrice={searchState.handlePriceFilterChange}
        totalCount={searchState.totalElements}
        pageSize={searchState.pageSize}
        setPageSize={() => {}} // 페이지 크기 변경은 현재 미구현
        onReset={searchState.handleReset}
      />

      {/* 메인 콘텐츠 */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ResaleList
          resaleItems={searchState.resaleItems}
          loading={searchState.loading}
          currentPage={searchState.currentPage}
          totalPages={searchState.totalPages}
          totalElements={searchState.totalElements}
          pageSize={searchState.pageSize}
          onPageChange={searchState.handlePageChange}
          onInquire={searchState.handleInquire}
          onBookmark={searchState.handleBookmark}
        />
      </div>
    </div>
  );
};

export default UsedPageContent;
