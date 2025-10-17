'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';

const ResaleSearch = ({ 
  initialData, 
  initialSearchParams, 
  onDataUpdate 
}) => {
  const [destination, setDestination] = useState(initialSearchParams?.destination || '');
  const [checkIn, setCheckIn] = useState(initialSearchParams?.checkIn || '');
  const [checkOut, setCheckOut] = useState(initialSearchParams?.checkOut || '');
  const [adults, setAdults] = useState(initialSearchParams?.adults || 2);
  const [sortBy, setSortBy] = useState('date');
  const [filterPrice, setFilterPrice] = useState('all');
  const [resaleItems, setResaleItems] = useState(initialData?.content || []);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(initialSearchParams?.page || 0);
  const [totalPages, setTotalPages] = useState(initialData?.totalPages || 0);
  const [totalElements, setTotalElements] = useState(initialData?.totalElements || 0);
  const [pageSize, setPageSize] = useState(10);
  
  // 검색 조건 상태 (실제 검색에 사용)
  const [searchConditions, setSearchConditions] = useState({
    destination: initialSearchParams?.destination || '',
    checkIn: initialSearchParams?.checkIn || '',
    checkOut: initialSearchParams?.checkOut || '',
    adults: initialSearchParams?.adults || 2
  });

  // 검색 실행 함수
  const fetchUsedTradeList = async (page = 0, searchParams = searchConditions) => {
    try {
      setLoading(true);
      
      // 현재는 전체 목록 API만 사용 (검색 API는 아직 구현되지 않음)
      const apiUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8888'}/api/used/list?page=${page}&size=${pageSize}`;

      const response = await axios.get(apiUrl);
      
      if (response.data) {
        // 백엔드 API 응답을 프론트엔드 형식으로 변환
        const transformedContent = (response.data.content || []).map(item => ({
          id: item.usedItemIdx,
          usedItemIdx: item.usedItemIdx,
          reservIdx: item.reservIdx,
          contentId: item.reservation?.contentId || '',
          hotelName: item.hotel?.hotelName || '호텔명 없음',
          location: item.hotel?.hotelAddress || '위치 정보 없음',
          originalPrice: item.reservation?.totalPrice || 0,
          salePrice: item.price || 0,
          discountRate: item.reservation?.totalPrice && item.price ? 
            Math.round(((item.reservation.totalPrice - item.price) / item.reservation.totalPrice) * 100) : 0,
          checkIn: item.reservation?.checkinDate || '',
          checkOut: item.reservation?.checkoutDate || '',
          nights: item.reservation?.checkinDate && item.reservation?.checkoutDate ? 
            Math.ceil((new Date(item.reservation.checkoutDate) - new Date(item.reservation.checkinDate)) / (1000 * 60 * 60 * 24)) : 0,
          guests: item.reservation?.guest || 0,
          roomType: item.reservation?.roomName || '객실 정보 없음',
          description: item.comment || '설명이 없습니다.',
          seller: item.reservation?.customerNickname || '판매자 정보 없음',
          image: item.hotel?.hotelImageUrl || '',
          urgent: false,
          originalData: item
        }));

        const newData = {
          content: transformedContent,
          totalPages: response.data.totalPages || 0,
          totalElements: response.data.totalElements || 0,
          currentPage: page
        };
        
        setResaleItems(newData.content);
        setTotalPages(newData.totalPages);
        setTotalElements(newData.totalElements);
        setCurrentPage(page);
        
        // 부모 컴포넌트에 데이터 업데이트 알림
        onDataUpdate(newData);
      }
    } catch (error) {
      console.error('양도거래 목록 조회 실패:', error);
      
      // API 실패시 더미 데이터 사용
      const dummyItems = [
        {
          id: 999,
          usedItemIdx: 999,
          reservIdx: 1,
          contentId: '1003654',
          hotelName: '더미 호텔 A',
          location: '서울시 강남구',
          originalPrice: 300000,
          salePrice: 250000,
          discountRate: 17,
          checkIn: '2025-01-20',
          checkOut: '2025-01-22',
          nights: 2,
          guests: 2,
          roomType: '스위트룸',
          description: '더미 데이터입니다.',
          seller: '더미판매자1',
          image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=300&fit=crop',
          urgent: false,
          originalData: null
        },
        {
          id: 998,
          usedItemIdx: 998,
          reservIdx: 2,
          contentId: '1003655',
          hotelName: '더미 호텔 B',
          location: '부산시 해운대구',
          originalPrice: 200000,
          salePrice: 150000,
          discountRate: 25,
          checkIn: '2025-01-25',
          checkOut: '2025-01-27',
          nights: 2,
          guests: 3,
          roomType: '디럭스룸',
          description: '더미 데이터입니다.',
          seller: '더미판매자2',
          image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=300&fit=crop',
          urgent: true,
          originalData: null
        },
        {
          id: 997,
          usedItemIdx: 997,
          reservIdx: 3,
          contentId: '1003656',
          hotelName: '더미 호텔 C',
          location: '제주시 연동',
          originalPrice: 400000,
          salePrice: 320000,
          discountRate: 20,
          checkIn: '2025-02-01',
          checkOut: '2025-02-03',
          nights: 2,
          guests: 2,
          roomType: '오션뷰룸',
          description: '더미 데이터입니다.',
          seller: '더미판매자3',
          image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=300&fit=crop',
          urgent: false,
          originalData: null
        }
      ];
      
      const dummyData = {
        content: dummyItems,
        totalPages: 1,
        totalElements: dummyItems.length,
        currentPage: 0
      };
      
      setResaleItems(dummyData.content);
      setTotalPages(dummyData.totalPages);
      setTotalElements(dummyData.totalElements);
      setCurrentPage(0);
      
      onDataUpdate(dummyData);
    } finally {
      setLoading(false);
    }
  };

  // 검색 실행
  const handleSearch = (searchParams) => {
    setSearchConditions(searchParams);
    fetchUsedTradeList(0, searchParams);
  };

  // 페이지 변경
  const handlePageChange = (page) => {
    fetchUsedTradeList(page, searchConditions);
  };

  // 정렬 변경
  const handleSortChange = (newSortBy) => {
    setSortBy(newSortBy);
    // 정렬 로직 구현 (필요시)
    fetchUsedTradeList(currentPage, searchConditions);
  };

  // 가격 필터 변경
  const handlePriceFilterChange = (newFilterPrice) => {
    setFilterPrice(newFilterPrice);
    // 가격 필터 로직 구현 (필요시)
    fetchUsedTradeList(currentPage, searchConditions);
  };

  // 문의하기 핸들러
  const handleInquire = (item) => {
    console.log('문의하기:', item);
    // 문의하기 로직 구현
  };

  // 찜하기 핸들러
  const handleBookmark = (item) => {
    console.log('찜하기:', item);
    // 찜하기 로직 구현
  };

  // 현재 상태를 반환하는 객체
  const searchState = {
    destination,
    setDestination,
    checkIn,
    setCheckIn,
    checkOut,
    setCheckOut,
    adults,
    setAdults,
    sortBy,
    filterPrice,
    resaleItems,
    loading,
    currentPage,
    totalPages,
    totalElements,
    pageSize,
    handleSearch,
    handlePageChange,
    handleSortChange,
    handlePriceFilterChange,
    handleInquire,
    handleBookmark
  };

  return searchState;
};

export default ResaleSearch;
