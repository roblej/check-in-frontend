'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import HeroSection from './HeroSection';
import FilterSection from './FilterSection';
import UsedList from './UsedList';
import ResaleSearch from './UsedSearch';
import HotelDetailModal from '../hotel/HotelDetailModal';

const UsedPageContent = ({ initialData, initialSearchParams }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [data, setData] = useState({
    content: initialData?.content || [],
    totalPages: initialData?.totalPages || 0,
    totalElements: initialData?.totalElements || 0,
    currentPage: initialSearchParams?.page || 0
  });

  // 사용자 정보 상태 (상위에서 한 번만 가져오기)
  const [customer, setCustomer] = useState(null);
  const [customerLoading, setCustomerLoading] = useState(true);

  // 사용자 정보를 한 번만 가져오기
  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const response = await fetch('/api/customer/me', {
          credentials: 'include' // httpOnly 쿠키 포함
        });
        
        if (response.ok) {
          const userData = await response.json();
          setCustomer(userData);
        } else if (response.status === 401) {
          // 인증 실패 시 null로 설정 (로그인하지 않은 상태)
          setCustomer(null);
        }
      } catch (error) {
        console.error('사용자 정보 가져오기 실패:', error);
        setCustomer(null);
      } finally {
        setCustomerLoading(false);
      }
    };
    
    fetchUserInfo();
  }, []);

  // 모달 상태 관리 - URL과 동기화
  const [modalState, setModalState] = useState({
    isOpen: false,
    contentId: null,
    roomIdx: null,
    searchParams: {}
  });

  // 데이터 업데이트 핸들러
  const handleDataUpdate = (newData) => {
    setData(newData);
  };

  // URL에서 모달 상태 읽어오기 (새로고침 시 모달 복원)
  useEffect(() => {
    const modalContentId = searchParams.get('modalContentId');
    const modalRoomIdx = searchParams.get('modalRoomIdx');
    
    if (modalContentId) {
      setModalState({
        isOpen: true,
        contentId: modalContentId,
        roomIdx: modalRoomIdx,
        searchParams: {
          checkIn: searchParams.get('checkIn') || '',
          checkOut: searchParams.get('checkOut') || '',
          adults: parseInt(searchParams.get('adults')) || 2,
          roomIdx: modalRoomIdx
        }
      });
    }
  }, [searchParams]);

  // 호텔 상세 모달 열기
  const handleHotelDetail = (item) => {
    const roomIdx = item.originalData?.roomIdx || item.originalData?.reservation?.roomIdx || null;
    
    console.log('호텔 상세 모달 열기:', {
      contentId: item.contentId,
      roomIdx: roomIdx,
      originalData: item.originalData,
      item: item
    });
    
    // URL에 모달 상태 추가
    const params = new URLSearchParams(searchParams.toString());
    params.set('modalContentId', item.contentId);
    if (roomIdx) {
      params.set('modalRoomIdx', roomIdx.toString());
    }
    params.set('checkIn', item.checkIn || '');
    params.set('checkOut', item.checkOut || '');
    params.set('adults', item.guests?.toString() || '2');
    
    router.push(`?${params.toString()}`, { scroll: false });
    
    setModalState({
      isOpen: true,
      contentId: item.contentId,
      roomIdx: roomIdx,
      searchParams: {
        checkIn: item.checkIn,
        checkOut: item.checkOut,
        adults: item.guests,
        roomIdx: roomIdx
      }
    });
  };

  // 모달 닫기
  const handleCloseModal = () => {
    // URL에서 모달 관련 파라미터 제거
    const params = new URLSearchParams(searchParams.toString());
    params.delete('modalContentId');
    params.delete('modalRoomIdx');
    
    router.push(`?${params.toString()}`, { scroll: false });
    
    setModalState({
      isOpen: false,
      contentId: null,
      roomIdx: null,
      searchParams: {}
    });
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
        <UsedList
          resaleItems={searchState.resaleItems}
          loading={searchState.loading}
          currentPage={searchState.currentPage}
          totalPages={searchState.totalPages}
          totalElements={searchState.totalElements}
          pageSize={searchState.pageSize}
          onPageChange={searchState.handlePageChange}
          onInquire={searchState.handleInquire}
          onBookmark={searchState.handleBookmark}
          onHotelDetail={handleHotelDetail}
          customer={customer}
          customerLoading={customerLoading}
        />
      </div>

      {/* 호텔 상세 모달 */}
      <HotelDetailModal
        isOpen={modalState.isOpen}
        onClose={handleCloseModal}
        contentId={modalState.contentId}
        roomIdx={modalState.roomIdx}
        searchParams={modalState.searchParams}
      />
    </div>
  );
};

export default UsedPageContent;
