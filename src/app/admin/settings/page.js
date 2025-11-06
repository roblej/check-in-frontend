'use client';

import { useState, useEffect, useRef } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import HotelRegistrationForm from '@/components/master/approve/HotelRegistrationForm';
import axiosInstance from '@/lib/axios';

const SettingsPage = () => {
  const [loading, setLoading] = useState(true);
  const [currentTab, setCurrentTab] = useState('basic');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  
  // 폼 데이터 상태 관리 (호텔 등록 화면과 동일한 구조)
  const [formData, setFormData] = useState({
    hotelInfo: {
      title: '',
      adress: '',
      phone: '',
      imageUrl: '',
      latitude: '',
      longitude: ''
    },
    hotelDetail: {
      reservationlodging: '',
      foodplace: '',
      scalelodging: '',
      parkinglodging: ''
    },
    area: {
      region: '',
      transportation: ''
    },
    rooms: [],
    images: [],
    events: [],
    dining: []
  });

  const [initialData, setInitialData] = useState({
    regions: [],
    amenities: [],
    roomTypes: []
  });

  const [selectedRegion, setSelectedRegion] = useState('');

  // areaCode를 지역명으로 변환하는 함수
  const getRegionNameByAreaCode = (areaCode) => {
    if (!areaCode) return '';
    
    const regionMap = {
      '1': '서울특별시', '2': '인천광역시', '3': '대전광역시', '4': '대구광역시',
      '5': '광주광역시', '6': '부산광역시', '7': '울산광역시', '8': '세종특별자치시',
      '31': '경기도', '32': '강원특별자치도', '33': '충청북도', '34': '충청남도',
      '35': '경상북도', '36': '경상남도', '37': '전라북도', '38': '전라남도', '39': '제주특별자치도'
    };
    
    return regionMap[String(areaCode)] || '';
  };

  // 호텔 정보 로드 (정규화 테이블에서 조회 - 병렬 처리로 한 번에 로드)
  useEffect(() => {
    const loadHotelData = async () => {
      try {
        setLoading(true);
        
        // 호텔 정보 한 번에 로드 (Room 데이터 포함)
        const response = await axiosInstance.get('/admin/hotelInfoForEdit');
        
        if (response.data.success && response.data.data) {
          const data = response.data.data;
          
          setFormData({
            hotelInfo: {
              title: data.hotelInfo?.title || '',
              adress: data.hotelInfo?.adress || '',
              phone: data.hotelInfo?.tel || '',
              imageUrl: data.hotelInfo?.imageUrl || '',
              latitude: data.hotelInfo?.latitude || '',
              longitude: data.hotelInfo?.longitude || ''
            },
            hotelDetail: {
              reservationlodging: data.hotelDetail?.reservationlodging || '',
              foodplace: data.hotelDetail?.foodplace || '',
              scalelodging: data.hotelDetail?.scalelodging || '',
              parkinglodging: data.hotelDetail?.parkinglodging || ''
            },
            area: {
              region: data.area?.areaCode || '',
              transportation: data.area?.transportation || ''
            },
            images: (data.images || []).map(img => ({
              id: img.id,
              originUrl: img.originUrl,
              smallUrl: img.smallUrl || img.originUrl
            })),
            events: [],
            dining: (data.dining || []).map(dining => ({
              id: dining.diningIdx || Date.now(),
              diningIdx: dining.diningIdx,
              name: dining.name || '',
              type: '',
              operatingHours: dining.operatingHours || '',
              menu: '',
              description: dining.description || '',
              basePrice: dining.basePrice || '',
              totalSeats: dining.totalSeats || ''
            })),
            rooms: (data.rooms || []).map((room, index) => ({
              id: room.roomIdx || Date.now() + index,
              roomIdx: room.roomIdx,
              name: room.name || '',
              type: '', // Room 엔티티에 없음
              price: room.basePrice || '',
              capacity: room.capacity || 2,
              size: '', // Room 엔티티에 없음
              bedType: '', // Room 엔티티에 없음
              images: (room.images || []).map(img => ({
                imageUrl: img.imageUrl || '',
                imageOrder: img.imageOrder || 1
              })),
              imageUrl: room.imageUrl || '',
              refundable: room.refundable !== false,
              breakfastIncluded: room.breakfastIncluded || false,
              smoking: room.smoking || false,
              status: room.status !== undefined ? room.status : 1,
              roomCount: room.roomCount || 1
            }))
          });

          // 지역 정보 설정
          if (data.area?.areaCode) {
            const regionName = getRegionNameByAreaCode(data.area.areaCode);
            setSelectedRegion(regionName);
          }
        }
      } catch (error) {
        console.error('호텔 정보 로드 실패:', error);
        alert('호텔 정보를 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    loadHotelData();
  }, []);

  // 폼 데이터 업데이트
  const updateFormData = (section, data) => {
    setFormData(prev => {
      if (Array.isArray(data)) {
        return {
          ...prev,
          [section]: data
        };
      } else {
        return {
          ...prev,
          [section]: { ...prev[section], ...data }
        };
      }
    });
  };

  // 객실 추가
  const addRoom = () => {
    const newRoom = {
      id: Date.now(),
      name: '',
      type: '',
      price: '',
      capacity: 2,
      size: '',
      bedType: '',
      images: [],
      imageUrl: '',
      refundable: true,
      breakfastIncluded: false,
      smoking: false,
      status: 1,
      roomCount: 1
    };
    
    setFormData(prev => ({
      ...prev,
      rooms: [...prev.rooms, newRoom]
    }));
  };

  // 객실 삭제
  const removeRoom = (roomId) => {
    setFormData(prev => ({
      ...prev,
      rooms: prev.rooms.filter(room => room.id !== roomId)
    }));
  };

  // 객실 업데이트
  const updateRoom = (roomId, data) => {
    setFormData(prev => ({
      ...prev,
      rooms: prev.rooms.map(room => 
        room.id === roomId ? { ...room, ...data } : room
      )
    }));
  };

  // 다이닝 추가
  const addDining = () => {
    const newDining = {
      id: Date.now(),
      diningIdx: null,
      name: '',
      type: '',
      operatingHours: '',
      menu: '',
      description: '',
      basePrice: '',
      totalSeats: ''
    };
    
    setFormData(prev => ({
      ...prev,
      dining: [...prev.dining, newDining]
    }));
  };

  // 다이닝 삭제
  const removeDining = (diningId) => {
    setFormData(prev => ({
      ...prev,
      dining: prev.dining.filter(dining => dining.id !== diningId)
    }));
  };

  // 다이닝 업데이트
  const updateDining = (diningId, data) => {
    setFormData(prev => ({
      ...prev,
      dining: prev.dining.map(dining => 
        dining.id === diningId ? { ...dining, ...data } : dining
      )
    }));
  };

  // 저장 핸들러
  const handleSave = async () => {
    try {
      setIsSubmitting(true);
      
      const requestData = {
        hotelInfo: {
          title: formData.hotelInfo.title,
          adress: formData.hotelInfo.adress,
          tel: formData.hotelInfo.phone,
          imageUrl: formData.hotelInfo.imageUrl,
          latitude: formData.hotelInfo.latitude,
          longitude: formData.hotelInfo.longitude
        },
        hotelDetail: {
          reservationlodging: formData.hotelDetail.reservationlodging,
          foodplace: formData.hotelDetail.foodplace,
          scalelodging: formData.hotelDetail.scalelodging,
          parkinglodging: formData.hotelDetail.parkinglodging
        },
        area: {
          areaCode: formData.area.region,
          transportation: formData.area.transportation
        },
        images: formData.images.map(img => ({
          id: img.id,
          originUrl: img.originUrl,
          smallUrl: img.smallUrl
        })),
        rooms: formData.rooms.map(room => ({
          roomIdx: room.roomIdx || null,
          name: room.name,
          basePrice: room.price ? parseInt(room.price) : null,
          capacity: room.capacity || 2,
          imageUrl: room.imageUrl || '',
          images: (room.images || []).map((img, idx) => ({
            imageUrl: img.imageUrl || img.originUrl || img.smallUrl || '',
            imageOrder: img.imageOrder !== undefined ? img.imageOrder : (idx + 1)
          })).filter(img => img.imageUrl),
          refundable: room.refundable !== false ? true : false,
          breakfastIncluded: room.breakfastIncluded === true || room.breakfastIncluded === 1,
          smoking: room.smoking === true || room.smoking === 1,
          status: room.status !== undefined ? room.status : 1,
          roomCount: room.roomCount || 1
        })),
        dining: formData.dining.map(dining => ({
          diningIdx: dining.diningIdx || null,
          name: dining.name,
          type: dining.type || '',
          operatingHours: dining.operatingHours || '',
          description: dining.description || '',
          basePrice: dining.basePrice ? parseInt(dining.basePrice) : null,
          totalSeats: dining.totalSeats ? parseInt(dining.totalSeats) : null
        }))
      };
      
      const response = await axiosInstance.put('/admin/hotelInfoForEdit', requestData);
      
      if (response.data.success) {
        alert('호텔 정보가 성공적으로 수정되었습니다.');
        window.location.reload();
      } else {
        alert('호텔 정보 수정에 실패했습니다: ' + (response.data.message || '알 수 없는 오류'));
      }
    } catch (error) {
      console.error('호텔 정보 수정 실패:', error);
      alert('호텔 정보 수정 중 오류가 발생했습니다: ' + (error.response?.data?.message || error.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">호텔 정보를 불러오는 중...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">호텔 설정</h1>
          <p className="text-gray-600">호텔 정보와 운영 설정을 관리하세요</p>
        </div>

        {/* 폼 컴포넌트 */}
        <HotelRegistrationForm
          mode="edit"
          formData={formData}
          updateFormData={updateFormData}
          addRoom={addRoom}
          removeRoom={removeRoom}
          updateRoom={updateRoom}
          addDining={addDining}
          removeDining={removeDining}
          updateDining={updateDining}
          currentTab={currentTab}
          setCurrentTab={setCurrentTab}
          errors={errors}
          initialData={initialData}
          onSubmit={handleSave}
          isSubmitting={isSubmitting}
        />
      </div>
    </AdminLayout>
  );
};

export default SettingsPage;
