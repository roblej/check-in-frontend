import Header from '@/components/Header';
import Footer from '@/components/Footer';
import UsedPageContent from '@/components/used/UsedPageContent';

// 서버에서 초기 데이터를 가져오는 함수
async function getInitialData(searchParams) {
  try {
    const { destination, checkIn, checkOut, adults, page = 0, size = 10 } = searchParams;
    
    // 현재는 전체 목록 API만 사용 (검색 API는 아직 구현되지 않음)
    const apiUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8888'}/api/used/list?page=${page}&size=${size}`;

    const response = await fetch(apiUrl, {
      cache: 'no-store', // SSR을 위해 캐시 비활성화
    });
    
    if (response.ok) {
      const data = await response.json();
      
      // 백엔드 API 응답을 프론트엔드 형식으로 변환
      if (data.content) {
        const transformedContent = data.content.map(item => ({
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
        
        return {
          ...data,
          content: transformedContent
        };
      }
      
      return data;
    }
  } catch (error) {
    console.error('초기 데이터 로드 실패:', error);
  }
  
  // API 실패시 더미 데이터 반환
  return {
    content: [
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
    ],
    totalPages: 1,
    totalElements: 3,
    currentPage: 0
  };
}

const ResalePage = async ({ searchParams }) => {
  // searchParams를 await로 처리
  const params = await searchParams;
  
  // URL 파라미터에서 검색 조건 추출
  const initialSearchParams = {
    destination: params?.destination || '',
    checkIn: params?.checkIn || '',
    checkOut: params?.checkOut || '',
    adults: parseInt(params?.adults) || 2,
    page: parseInt(params?.page) || 0,
    size: 10
  };

  // 서버에서 초기 데이터 가져오기
  const initialData = await getInitialData(initialSearchParams);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <UsedPageContent 
        initialData={initialData}
        initialSearchParams={initialSearchParams}
      />
      <Footer />
    </div>
  );
};

export default ResalePage;