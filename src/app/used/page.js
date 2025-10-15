'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ResaleItemCard from '@/components/used/usedItemCard';
import HeroSection from '@/components/used/HeroSection';
import FilterSection from '@/components/used/FilterSection';
import Pagination from '@/components/Pagination';

const ResalePage = () => {
  const [destination, setDestination] = useState('');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [adults, setAdults] = useState(2);
  const [sortBy, setSortBy] = useState('date');
  const [filterPrice, setFilterPrice] = useState('all');
  const [resaleItems, setResaleItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  
  // 검색 조건 상태 (실제 검색에 사용)
  const [searchConditions, setSearchConditions] = useState({
    destination: '',
    checkIn: '',
    checkOut: '',
    adults: 2
  });

  // 페이지 로딩 시 API 호출
  useEffect(() => {
    const fetchUsedTradeList = async () => {
      try {
        setLoading(true);
        
        // 검색 조건이 있으면 검색 API, 없으면 전체 목록 API 호출
        const hasSearchConditions = searchConditions.destination || 
          searchConditions.checkIn || 
          searchConditions.checkOut || 
          searchConditions.adults !== 2;
        
        let apiUrl;
        if (hasSearchConditions) {
          // 검색 API 호출
          const searchParams = new URLSearchParams({
            page: currentPage.toString(),
            size: pageSize.toString()
          });
          
          if (searchConditions.destination) {
            searchParams.append('destination', searchConditions.destination);
          }
          if (searchConditions.checkIn) {
            searchParams.append('checkIn', searchConditions.checkIn);
          }
          if (searchConditions.checkOut) {
            searchParams.append('checkOut', searchConditions.checkOut);
          }
          if (searchConditions.adults) {
            searchParams.append('adults', searchConditions.adults.toString());
          }
          
          apiUrl = `/api/used/search?${searchParams.toString()}`;
        } else {
          // 전체 목록 API 호출
          apiUrl = `/api/used/list?page=${currentPage}&size=${pageSize}`;
        }
        
        const response = await axios.get(apiUrl);
        console.log('API 데이터:', response.data);
        
        // API 응답을 resaleItems 형태로 변환
        const transformedItems = response.data.content.map((item, index) => ({
          id: item.usedItemIdx,
          hotelName: item.hotel?.hotelName || '호텔 정보 없음',
          location: item.hotel?.hotelAddress || '주소 정보 없음',
          originalPrice: item.reservation?.totalPrice || 0,
          salePrice: item.price,
          discountRate: item.reservation?.totalPrice ? 
            Math.round(((item.reservation.totalPrice - item.price) / item.reservation.totalPrice) * 100) : 0,
          checkIn: item.reservation?.checkinDate || '',
          checkOut: item.reservation?.checkoutDate || '',
          nights: item.reservation?.checkinDate && item.reservation?.checkoutDate ? 
            Math.ceil((new Date(item.reservation.checkoutDate) - new Date(item.reservation.checkinDate)) / (1000 * 60 * 60 * 24)) : 1,
          guests: item.reservation?.guest || 2,
          roomType: item.reservation?.roomName || '객실 정보',
          description: item.comment || '사정상 취소 불가능한 예약입니다. 싼 값에 양도합니다.',
          seller: item.reservation?.customerNickname || '판매자',
          image: item.hotel?.hotelImageUrl || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=300&fit=crop',
          urgent: index % 2 === 0, // 임시로 urgent 설정
          // API에서 받은 원본 데이터도 보관
          originalData: item
        }));
        
        // ===== 임시 더미 데이터 시작 (나중에 삭제할 부분) =====
        const dummyItems = [
          {
            id: 999,
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

        const allItems = [...transformedItems, ...dummyItems];
        setResaleItems(allItems);
        
        // 페이지 정보 설정 (더미 데이터 포함)
        const totalItems = allItems.length;
        setTotalPages(Math.ceil(totalItems / pageSize));
        setTotalElements(totalItems);
        // ===== 임시 더미 데이터 끝 (나중에 삭제할 부분) =====
        
        // ===== 원래 코드 (더미 데이터 삭제 후 사용) =====
        // setResaleItems(transformedItems);
        // setTotalPages(response.data.totalPages);
        // setTotalElements(response.data.totalElements);
        // ===== 원래 코드 끝 =====
      } catch (error) {
        console.error('API 호출 중 오류 발생:', error);
        if (error.response) {
          console.error('응답 오류:', error.response.status, error.response.statusText);
        } else if (error.request) {
          console.error('요청 오류:', error.request);
        } else {
          console.error('오류 메시지:', error.message);
        }
        // 에러 발생 시 빈 배열로 설정
        setResaleItems([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUsedTradeList();
  }, [currentPage, pageSize, searchConditions]);

  const handleSearch = async (searchData) => {
    console.log('검색:', searchData);
    
    try {
      setLoading(true);
      
      // 검색 API 호출
      const searchParams = new URLSearchParams({
        page: '0', // 검색 시 첫 페이지부터
        size: pageSize.toString()
      });
      
      // 검색 조건이 있으면 파라미터에 추가
      if (searchData.destination) {
        searchParams.append('destination', searchData.destination);
      }
      if (searchData.checkIn) {
        searchParams.append('checkIn', searchData.checkIn);
      }
      if (searchData.checkOut) {
        searchParams.append('checkOut', searchData.checkOut);
      }
      if (searchData.adults) {
        searchParams.append('adults', searchData.adults.toString());
      }
      
      const response = await axios.get(`api/used/search?${searchParams.toString()}`);
      console.log('검색 결과:', response.data);
      
      // 검색 결과를 resaleItems 형태로 변환
      const transformedItems = response.data.content.map((item, index) => ({
        id: item.usedItemIdx,
        hotelName: item.hotel?.hotelName || '호텔 정보 없음',
        location: item.hotel?.hotelAddress || '주소 정보 없음',
        originalPrice: item.reservation?.totalPrice || 0,
        salePrice: item.price,
        discountRate: item.reservation?.totalPrice ? 
          Math.round(((item.reservation.totalPrice - item.price) / item.reservation.totalPrice) * 100) : 0,
        checkIn: item.reservation?.checkinDate || '',
        checkOut: item.reservation?.checkoutDate || '',
        nights: item.reservation?.checkinDate && item.reservation?.checkoutDate ? 
          Math.ceil((new Date(item.reservation.checkoutDate) - new Date(item.reservation.checkinDate)) / (1000 * 60 * 60 * 24)) : 1,
        guests: item.reservation?.guest || 2,
        roomType: item.reservation?.roomName || '객실 정보',
        description: item.comment || '사정상 취소 불가능한 예약입니다. 싼 값에 양도합니다.',
        seller: item.reservation?.customerNickname || '판매자',
        image: item.hotel?.hotelImageUrl || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=300&fit=crop',
        urgent: index % 2 === 0,
        originalData: item
      }));
      
      setResaleItems(transformedItems);
      setTotalPages(response.data.totalPages);
      setTotalElements(response.data.totalElements);
      
      // 검색 조건 업데이트
      setSearchConditions({
        destination: searchData.destination,
        checkIn: searchData.checkIn,
        checkOut: searchData.checkOut,
        adults: searchData.adults
      });
      
      // 검색 시 첫 페이지로 리셋
      setCurrentPage(0);
      
    } catch (error) {
      console.error('검색 API 호출 중 오류 발생:', error);
      if (error.response) {
        console.error('응답 오류:', error.response.status, error.response.statusText);
      } else if (error.request) {
        console.error('요청 오류:', error.request);
      } else {
        console.error('오류 메시지:', error.message);
      }
      // 에러 발생 시 빈 배열로 설정
      setResaleItems([]);
      setTotalPages(0);
      setTotalElements(0);
    } finally {
      setLoading(false);
    }
  };

  const handleInquire = (item) => {
    console.log('문의하기:', item);
    // TODO: 문의하기 기능 구현
  };

  const handleBookmark = (item) => {
    console.log('찜하기:', item);
    // TODO: 찜하기 기능 구현
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    // 페이지 변경 시 스크롤을 맨 위로 이동
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePageSizeChange = (newPageSize) => {
    setPageSize(newPageSize);
    setCurrentPage(0); // 페이지 크기 변경 시 첫 번째 페이지로 리셋
  };


  // 클라이언트 사이드 가격 필터링만 적용 (서버에서 검색은 처리됨)
  const filteredItems = resaleItems.filter(item => {
    // 가격 필터만 클라이언트에서 처리
    switch (filterPrice) {
      case 'under200':
        return item.salePrice <= 200000;
      case '200-300':
        return item.salePrice > 200000 && item.salePrice <= 300000;
      case '300-400':
        return item.salePrice > 300000 && item.salePrice <= 400000;
      case 'over400':
        return item.salePrice > 400000;
      case 'all':
      default:
        return true;
    }
  });

  const sortedItems = [...filteredItems].sort((a, b) => {
    switch (sortBy) {
      case 'price':
        return a.salePrice - b.salePrice; // 가격 낮은 순
      case 'price-desc':
        return b.salePrice - a.salePrice; // 가격 높은 순
      case 'discount':
        return b.discountRate - a.discountRate; // 할인율 높은 순
      case 'date':
        return new Date(a.checkIn) - new Date(b.checkIn); // 체크인 날짜 빠른 순
      case 'date-desc':
        return new Date(b.checkIn) - new Date(a.checkIn); // 체크인 날짜 늦은 순
      case 'urgent':
        // 긴급 매물을 먼저, 그 다음 날짜순
        if (a.urgent && !b.urgent) return -1;
        if (!a.urgent && b.urgent) return 1;
        return new Date(a.checkIn) - new Date(b.checkIn);
      default:
        return 0;
    }
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <Header />

      {/* 히어로 섹션 */}
      <HeroSection
        destination={destination}
        setDestination={setDestination}
        checkIn={checkIn}
        setCheckIn={setCheckIn}
        checkOut={checkOut}
        setCheckOut={setCheckOut}
        adults={adults}
        setAdults={setAdults}
        onSearch={handleSearch}
      />

      {/* 메인 컨텐츠 */}
      <main className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* 필터 및 정렬 */}
        <FilterSection
          sortBy={sortBy}
          setSortBy={setSortBy}
          filterPrice={filterPrice}
          setFilterPrice={setFilterPrice}
          totalCount={sortedItems.length}
          pageSize={pageSize}
          setPageSize={handlePageSizeChange}
        />

        {/* 로딩 상태 */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
            <span className="ml-3 text-gray-600">양도 목록을 불러오는 중...</span>
          </div>
        ) : (
          /* 양도 목록 */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {sortedItems.map((item) => (
              <ResaleItemCard
                key={item.id}
                item={item}
                onInquire={handleInquire}
                onBookmark={handleBookmark}
              />
            ))}
          </div>
        )}

        {/* 빈 상태 */}
        {!loading && sortedItems.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🏨</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              검색 결과가 없습니다
            </h3>
            <p className="text-gray-600">
              다른 검색 조건으로 다시 시도해보세요
            </p>
          </div>
        )}

        {/* 페이지네이션 */}
        {!loading && sortedItems.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalElements={totalElements}
            pageSize={pageSize}
            onPageChange={handlePageChange}
          />
        )}
      </main>

      {/* 푸터 */}
      <Footer />
    </div>
  );
};

export default ResalePage;
