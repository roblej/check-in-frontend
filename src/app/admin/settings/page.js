'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import axiosInstance from '@/lib/axios';

const SettingsPage = () => {
  const [loading, setLoading] = useState(true);
  const [currentTab, setCurrentTab] = useState('basic');
  const [formData, setFormData] = useState({
    hotelInfo: {
      title: '',
      adress: '',
      phone: '' // tel로 변환되어 전송됨
    },
    hotelDetail: {
      description: '', // reservationlodging
      foodplace: '', // foodplace
      scale: '', // scalelodging
      parkinglodging: '' // parkinglodging
    },
    area: {
      region: '', // areaCode
    },
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
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [errors, setErrors] = useState({});

  // areaCode를 지역명으로 변환하는 함수
  const getRegionNameByAreaCode = (areaCode) => {
    if (!areaCode) return '';
    
    switch (String(areaCode)) {
      case '1':
        return '서울특별시';
      case '2':
        return '인천광역시';
      case '3':
        return '대전광역시';
      case '4':
        return '대구광역시';
      case '5':
        return '광주광역시';
      case '6':
        return '부산광역시';
      case '7':
        return '울산광역시';
      case '8':
        return '세종특별자치시';
      case '31':
        return '경기도';
      case '32':
        return '강원특별자치도';
      case '33':
        return '충청북도';
      case '34':
        return '충청남도';
      case '35':
        return '경상북도';
      case '36':
        return '경상남도';
      case '37':
        return '전라북도';
      case '38':
        return '전라남도';
      case '39':
        return '제주특별자치도';
      default:
        return '';
    }
  };

  // 지역명을 areaCode로 변환하는 함수
  const getAreaCodeByRegionName = (regionName) => {
    switch (regionName) {
      case '서울특별시':
        return '1';
      case '인천광역시':
        return '2';
      case '대전광역시':
        return '3';
      case '대구광역시':
        return '4';
      case '광주광역시':
        return '5';
      case '부산광역시':
        return '6';
      case '울산광역시':
        return '7';
      case '세종특별자치시':
        return '8';
      case '경기도':
        return '31';
      case '강원특별자치도':
        return '32';
      case '충청북도':
        return '33';
      case '충청남도':
        return '34';
      case '경상북도':
        return '35';
      case '경상남도':
        return '36';
      case '전라북도':
        return '37';
      case '전라남도':
        return '38';
      case '제주특별자치도':
        return '39';
      default:
        return '';
    }
  };

  // 초기 데이터 로드 (지역, 시설 등)
  useEffect(() => {
    setInitialData({ regions: [], amenities: [], roomTypes: [] });
  }, []);

  // 호텔 정보 로드 (정규화 테이블에서 조회)
  useEffect(() => {
    const loadHotelData = async () => {
      try {
        setLoading(true);
        
        const response = await axiosInstance.get('/admin/hotelInfoForEdit');
        
        if (response.data.success && response.data.data) {
          const data = response.data.data;
          
          setFormData({
            hotelInfo: {
              title: data.hotelInfo?.title || '',
              adress: data.hotelInfo?.adress || '',
              phone: data.hotelInfo?.tel || '' // Entity 필드명 tel 사용
            },
            hotelDetail: {
              description: data.hotelDetail?.reservationlodging || '', // Entity 필드명
              foodplace: data.hotelDetail?.foodplace || '', // Entity 필드명
              scale: data.hotelDetail?.scalelodging || '', // Entity 필드명
              parkinglodging: data.hotelDetail?.parkinglodging || '' // Entity 필드명
            },
            area: {
              region: data.area?.areaCode || '', // Entity 필드명 areaCode
            },
            images: (data.images || []).map(img => ({
              id: img.id,
              originUrl: img.originUrl,
              smallUrl: img.smallUrl
            })),
            events: [], // 프론트엔드에서 사용하지 않음
            dining: (data.dining || []).map(dining => ({
              id: dining.diningIdx || Date.now(),
              diningIdx: dining.diningIdx,
              name: dining.name || '',
              operatingHours: dining.operatingHours || '',
              description: dining.description || '',
              basePrice: dining.basePrice || '',
              totalSeats: dining.totalSeats || ''
            }))
          });

          // 지역 정보 설정 (areaCode를 지역명으로 변환)
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

  const updateFormData = (section, data) => {
    setFormData(prev => ({
      ...prev,
      [section]: { ...prev[section], ...data }
    }));
  };


  const addEvent = () => {
    const newEvent = {
      id: Date.now(),
      eventIdx: null,
      title: '',
      description: '',
      startDate: '',
      endDate: '',
      discount: '',
      isActive: true
    };
    setFormData(prev => ({
      ...prev,
      events: [...prev.events, newEvent]
    }));
  };

  const removeEvent = (eventId) => {
    setFormData(prev => ({
      ...prev,
      events: prev.events.filter(event => event.id !== eventId)
    }));
  };

  const updateEvent = (eventId, data) => {
    setFormData(prev => ({
      ...prev,
      events: prev.events.map(event => 
        event.id === eventId ? { ...event, ...data } : event
      )
    }));
  };

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

  const removeDining = (diningId) => {
    setFormData(prev => ({
      ...prev,
      dining: prev.dining.filter(dining => dining.id !== diningId)
    }));
  };

  const updateDining = (diningId, data) => {
    setFormData(prev => ({
      ...prev,
      dining: prev.dining.map(dining => 
        dining.id === diningId ? { ...dining, ...data } : dining
      )
    }));
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      
      const requestData = {
        hotelInfo: {
          title: formData.hotelInfo.title, // 변경 불가 (업데이트 안함)
          adress: formData.hotelInfo.adress, // 변경 불가 (업데이트 안함)
          tel: formData.hotelInfo.phone // Entity 필드명 tel 사용 (변경 불가이지만 DTO 구조 유지)
        },
        hotelDetail: {
          reservationlodging: formData.hotelDetail.description, // Entity 필드명
          foodplace: formData.hotelDetail.foodplace, // Entity 필드명
          scalelodging: formData.hotelDetail.scale, // Entity 필드명
          parkinglodging: formData.hotelDetail.parkinglodging // Entity 필드명
        },
        area: {
          areaCode: formData.area.region, // Entity 필드명 (변경 불가)
        },
        images: formData.images.map(img => ({
          id: img.id,
          originUrl: img.originUrl,
          smallUrl: img.smallUrl
        })),
        dining: formData.dining.map(dining => ({
          diningIdx: dining.diningIdx || null,
          name: dining.name,
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
      setLoading(false);
    }
  };

  // 시/도는 변경 불가능하므로 districts는 표시만 (필요 시 별도 처리)
  const diningTypes = [
    "레스토랑", "카페", "바", "라운지", "룸서비스",
    "조식당", "한식당", "중식당", "일식당", "양식당", "뷔페", "기타"
  ];

  const renderBasicInfo = () => (
    <div className="space-y-8">
      {/* 호텔 기본 정보 */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">호텔 기본 정보</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              호텔명 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.hotelInfo.title}
              disabled
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 cursor-not-allowed"
              placeholder="호텔명을 입력하세요"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              연락처 <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              value={formData.hotelInfo.phone}
              disabled
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 cursor-not-allowed"
              placeholder="02-1234-5678"
            />
          </div>

        

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              주소 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.hotelInfo.adress}
              disabled
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 cursor-not-allowed"
              placeholder="상세 주소를 입력하세요"
            />
          </div>
        </div>
      </div>

      {/* 지역 정보 */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">지역 정보</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              시/도
            </label>
            <input
              type="text"
              value={selectedRegion || ''}
              disabled
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 cursor-not-allowed"
              placeholder="시/도"
            />
          </div>

          

          

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              교통편 안내
            </label>
            <textarea
              value={formData.area.transportation}
              onChange={(e) => updateFormData('area', { transportation: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="대중교통 이용 방법을 입력하세요"
            />
          </div>
        </div>
      </div>

      {/* 호텔 상세 정보 */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">호텔 상세 정보</h3>
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              호텔 소개
            </label>
            <textarea
              value={formData.hotelDetail.description}
              onChange={(e) => updateFormData('hotelDetail', { description: e.target.value })}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="호텔의 특징과 매력을 소개해주세요"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              식당 정보
            </label>
            <textarea
              value={formData.hotelDetail.foodplace}
              onChange={(e) => updateFormData('hotelDetail', { foodplace: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="식당 정보를 입력하세요"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                호텔 규모
              </label>
              <input
                type="text"
                value={formData.hotelDetail.scale}
                onChange={(e) => updateFormData('hotelDetail', { scale: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="예: 지하 1층, 지상 10층, 총 120개 객실"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                주차 정보
              </label>
              <input
                type="text"
                value={formData.hotelDetail.parkinglodging}
                onChange={(e) => updateFormData('hotelDetail', { parkinglodging: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="예: 주차장 위치, 요금, 운영시간 등을 입력하세요"
              />
            </div>
          </div>
        </div>
      </div>
      
    </div>
  );

  const renderImagesEvents = () => (
    <div className="space-y-8">
      {/* 호텔 이미지 */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">호텔 이미지</h3>
        <p className="text-sm text-gray-500 mb-4">
          호텔의 외관, 로비, 객실 등 다양한 이미지를 관리하세요.
        </p>
        
        {formData.images.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {formData.images.map((image) => (
              <div key={image.id} className="relative group">
                <div className="aspect-square bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
                  {image.smallUrl || image.originUrl ? (
                    <img src={image.smallUrl || image.originUrl} alt="호텔 이미지" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-gray-400 text-2xl">🖼️</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 이벤트 관리 */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">이벤트 관리</h3>
          <button
            onClick={addEvent}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            + 이벤트 추가
          </button>
        </div>

        {formData.events.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <div className="text-gray-400 text-4xl mb-2">🎉</div>
            <p className="text-gray-500">등록된 이벤트가 없습니다</p>
          </div>
        ) : (
          <div className="space-y-4">
            {formData.events.map((event, index) => (
              <div key={event.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-4">
                  <h4 className="font-medium text-gray-900">이벤트 {index + 1}</h4>
                  <button
                    onClick={() => removeEvent(event.id)}
                    className="text-red-400 hover:text-red-600"
                  >
                    삭제
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      이벤트 제목
                    </label>
                    <input
                      type="text"
                      value={event.title || ''}
                      onChange={(e) => updateEvent(event.id, { title: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="예: 신규 오픈 특가"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      할인율 (%)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={event.discount || ''}
                      onChange={(e) => updateEvent(event.id, { discount: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="20"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      시작일
                    </label>
                    <input
                      type="date"
                      value={event.startDate || ''}
                      onChange={(e) => updateEvent(event.id, { startDate: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      종료일
                    </label>
                    <input
                      type="date"
                      value={event.endDate || ''}
                      onChange={(e) => updateEvent(event.id, { endDate: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      이벤트 설명
                    </label>
                    <textarea
                      value={event.description || ''}
                      onChange={(e) => updateEvent(event.id, { description: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="이벤트 상세 내용을 입력하세요"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderDining = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium text-gray-900">다이닝 관리</h3>
          <p className="text-sm text-gray-500">호텔 내 레스토랑, 카페, 바 등을 관리하세요</p>
        </div>
        <button
          onClick={addDining}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          + 다이닝 추가
        </button>
      </div>

      {formData.dining.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <div className="text-gray-400 text-6xl mb-4">🍽️</div>
          <h4 className="text-lg font-medium text-gray-900 mb-2">등록된 다이닝이 없습니다</h4>
          <p className="text-gray-500 mb-4">호텔 내 레스토랑이나 카페가 있다면 추가해보세요</p>
          <button
            onClick={addDining}
            className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            다이닝 추가하기
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {formData.dining.map((item, index) => (
            <div key={item.id} className="border border-gray-200 rounded-lg p-6">
              <div className="flex justify-between items-start mb-4">
                <h4 className="text-lg font-medium text-gray-900">
                  {item.name || `다이닝 ${index + 1}`}
                </h4>
                <button
                  onClick={() => removeDining(item.id)}
                  className="text-red-400 hover:text-red-600"
                >
                  삭제
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    다이닝명
                  </label>
                  <input
                    type="text"
                    value={item.name || ''}
                    onChange={(e) => updateDining(item.id, { name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="예: 그랜드 레스토랑"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    다이닝 타입
                  </label>
                  <select
                    value={item.type || ''}
                    onChange={(e) => updateDining(item.id, { type: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">타입을 선택하세요</option>
                    {diningTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    운영시간
                  </label>
                  <input
                    type="text"
                    value={item.operatingHours || ''}
                    onChange={(e) => updateDining(item.id, { operatingHours: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="예: 06:00 - 22:00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    기본 가격
                  </label>
                  <input
                    type="number"
                    value={item.basePrice || ''}
                    onChange={(e) => updateDining(item.id, { basePrice: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="15000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    수용 인원
                  </label>
                  <input
                    type="number"
                    value={item.totalSeats || ''}
                    onChange={(e) => updateDining(item.id, { totalSeats: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="100"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    대표 메뉴
                  </label>
                  <textarea
                    value={item.menu || ''}
                    onChange={(e) => updateDining(item.id, { menu: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="대표 메뉴나 특별한 요리를 입력하세요"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    상세 설명
                  </label>
                  <textarea
                    value={item.description || ''}
                    onChange={(e) => updateDining(item.id, { description: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="다이닝의 특징, 분위기, 서비스 등을 자세히 설명하세요"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const tabs = [
    { id: 'basic', name: '기본 정보', icon: '📋' },
    { id: 'images', name: '이미지/이벤트', icon: '📸' },
    { id: 'dining', name: '다이닝', icon: '🍽️' }
  ];

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
      <div className="space-y-6">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900">호텔 설정</h2>
          <p className="text-gray-600">호텔 정보와 운영 설정을 관리하세요</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
            <h2 className="text-2xl font-bold text-white">🏨 호텔 정보</h2>
            <p className="text-blue-100 mt-1">
              호텔의 기본 정보, 이미지, 다이닝 정보를 확인하고 수정할 수 있습니다
            </p>
          </div>

          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setCurrentTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                    currentTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {currentTab === 'basic' && renderBasicInfo()}
            {currentTab === 'images' && renderImagesEvents()}
            {currentTab === 'dining' && renderDining()}
          </div>

          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleSave}
                disabled={loading}
                className="px-6 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? '저장 중...' : '저장하기'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default SettingsPage;
