"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import HotelRegistrationForm from "@/components/master/approve/HotelRegistrationForm";
import axiosInstance from "@/lib/axios";

const HotelRegistrationClient = ({ initialData }) => {
  const router = useRouter();
  const hasCheckedDraft = useRef(false);
  
  // 폼 데이터 상태 관리
  const [formData, setFormData] = useState({
    // 기본 정보
    hotelInfo: {
      title: "",
      adress: "",
      phone: "",
      imageUrl: "", // 대표 이미지 URL
      latitude: "", // 위도 (mapY)
      longitude: "" // 경도 (mapX)
    },
    // 호텔 상세 정보
    hotelDetail: {
      reservationlodging: "", // 호텔 소개 (description → reservationlodging)
      foodplace: "",
      scalelodging: "", // 호텔 규모 (scale → scalelodging)
      parkinglodging: ""
    },
    // 객실 정보 (동적 배열)
    rooms: [],
    // 이미지 정보
    images: [],
    // 이벤트 정보
    events: [],
    // 다이닝 정보 (선택사항)
    dining: []
  });

  // 폼 상태 관리
  const [currentTab, setCurrentTab] = useState("basic");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [progress, setProgress] = useState(0);

  // 진행률 계산
  useEffect(() => {
    let completedFields = 0;
    let totalFields = 0;

    // 기본 정보 체크
    const basicFields = ['title', 'adress', 'phone'];
    basicFields.forEach(field => {
      totalFields++;
      if (formData.hotelInfo[field]) completedFields++;
    });

    // 객실 정보 체크
    if (formData.rooms.length > 0) {
      totalFields++;
      completedFields++;
    }

    // 이미지는 선택사항이므로 진행률 계산에 포함하지 않음

    setProgress(totalFields > 0 ? (completedFields / totalFields) * 100 : 0);
  }, [formData]);

  // 임시저장 기능
  const saveDraft = async () => {
    try {
      const draftData = {
        formData: JSON.stringify(formData), // JSON 문자열로 변환
        lastTab: currentTab,
        progress: Math.round(progress), // 소수점 제거하여 정수로 전송
      };
      
      const response = await axiosInstance.post("/hotel/draft", draftData);
      
      if (response.data.success) {
        console.log("임시저장 완료:", response.data.message);
        console.log("draftIdx:", response.data.data.draftIdx);
        return response.data.data.draftIdx;
      } else {
        console.error("임시저장 실패:", response.data.message);
      }
    } catch (error) {
      console.error("임시저장 API 호출 오류:", error);
    }
  };

  // 임시저장 데이터 불러오기
  const loadDraft = async () => {
    try {
      const response = await axiosInstance.get("/hotel/draft");
      
      if (response.data.success && response.data.data) {
        const draftData = response.data.data;
        
        // JSON 문자열을 객체로 파싱
        const parsedFormData = JSON.parse(draftData.formData);
        
        setFormData(parsedFormData);
        setCurrentTab(draftData.lastTab || "basic");
        setProgress(draftData.progress || 0);
      }
    } catch (error) {
      console.error("임시저장 데이터 로드 실패:", error);
    }
  };

  // 자동 저장 (5초마다)
  useEffect(() => {
    const autoSaveTimer = setInterval(() => {
      // 폼에 데이터가 있을 때만 자동 저장
      if (formData.hotelInfo.title || formData.rooms.length > 0) {
        saveDraft();
      }
    }, 5000); // 5초마다 자동 저장

    return () => clearInterval(autoSaveTimer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData, currentTab, progress]);

  // 페이지 로드 시 임시저장 데이터 확인 (Strict Mode 대응)
  useEffect(() => {
    const initCheck = async () => {
      if (!hasCheckedDraft.current) {
        hasCheckedDraft.current = true;
        
        try {
          const response = await axiosInstance.get("/hotel/draft");
          
          if (response.data.success && response.data.data) {
            const shouldLoad = confirm(
              "이전에 작성하던 호텔 등록 내용이 있습니다. 이어서 작성하시겠습니까?"
            );
            if (shouldLoad) {
              const draftData = response.data.data;
              const parsedFormData = JSON.parse(draftData.formData);
              
              setFormData(parsedFormData);
              setCurrentTab(draftData.lastTab || "basic");
              setProgress(draftData.progress || 0);
            }
          }
        } catch (error) {
          console.error("임시저장 데이터 확인 실패:", error);
        }
      }
    };
    
    initCheck();
  }, []);

  // 폼 데이터 업데이트
  const updateFormData = (section, data) => {
    setFormData(prev => {
      // 배열인 경우 직접 할당, 객체인 경우 병합
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
      name: "",
      price: "", // basePrice로 매핑됨
      capacity: 2,
      size: "",
      bedType: "",
      images: [],
      imageUrl: "", // Room.imageUrl (객실 대표 이미지)
      refundable: true, // 기본값 true (환불 가능 = 1)
      breakfastIncluded: false,
      smoking: false,
      status: 1, // 기본값 1 (사용가능)
      roomCount: 1 // 기본값 1
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
      name: "",
      type: "",
      operatingHours: "",
      menu: "",
      description: ""
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

  // 폼 검증
  const validateForm = () => {
    const newErrors = {};

    // 기본 정보 검증
    if (!formData.hotelInfo.title) {
      newErrors.title = "호텔명을 입력해주세요";
    }
    if (!formData.hotelInfo.adress) {
      newErrors.adress = "주소를 입력해주세요";
    }
    if (!formData.hotelInfo.phone) {
      newErrors.phone = "연락처를 입력해주세요";
    }

    // 객실 정보 검증
    if (formData.rooms.length === 0) {
      newErrors.rooms = "최소 1개 이상의 객실을 등록해주세요";
    } else {
      // 각 객실의 수용 인원 검증 (2, 4, 6, 8만 허용)
      for (let i = 0; i < formData.rooms.length; i++) {
        const room = formData.rooms[i];
        const capacity = room.capacity;
        const validCapacities = [2, 4, 6, 8];
        
        // 수용 인원이 없거나 유효하지 않은 경우
        if (!capacity || !validCapacities.includes(capacity)) {
          newErrors.capacity = {
            roomId: room.id,
            message: "수용 인원을 선택해주세요"
          };
          break; // 첫 번째 오류만 표시
        }
      }
    }

    // 이미지는 선택사항이므로 검증하지 않음

    setErrors(newErrors);
    return {
      isValid: Object.keys(newErrors).length === 0,
      errors: newErrors
    };
  };

  // 등록 요청 제출
  const handleSubmit = async () => {
    // 1. 폼 유효성 검사
    const validationResult = validateForm();
    if (!validationResult.isValid) {
      // 오류가 있는 필드에 따라 해당 탭으로 이동
      if (validationResult.errors.capacity || validationResult.errors.rooms) {
        setCurrentTab("rooms");
      } else if (validationResult.errors.title || validationResult.errors.adress || validationResult.errors.phone) {
        setCurrentTab("basic");
      }
      
      alert("필수 정보를 모두 입력해주세요.");
      return;
    }

    // 2. 임시저장 수행
    const draftIdx = await saveDraft();
    
    // 3. draftIdx가 있으면 등록 요청 제출
    if (draftIdx) {
      setIsSubmitting(true);

      try {
        const response = await axiosInstance.post("/hotel/register?draftIdx=" + draftIdx, {
          ...formData,
          status: 0 // 승인 대기 상태
        });

        if (response.data.success) {
          alert("호텔 등록 요청이 완료되었습니다. 관리자 승인 후 운영을 시작할 수 있습니다.");
          router.push("/"); // 메인 페이지로 이동
        } else {
          alert("등록 요청 중 오류가 발생했습니다. 다시 시도해주세요.");
        }
      } catch (error) {
        console.error("등록 요청 실패:", error);
        alert("서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
      } finally {
        setIsSubmitting(false);
      }
    } else {
      alert("임시저장에 실패했습니다. 다시 시도해주세요.");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* 헤더 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">호텔 등록</h1>
        <p className="text-gray-600">새로운 호텔을 등록하고 운영을 시작하세요</p>
        
        {/* 진행률 표시 */}
        <div className="mt-4">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>등록 진행률</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* 폼 컴포넌트 */}
      <HotelRegistrationForm
        mode="create"
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
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        onSaveDraft={saveDraft}
      />
    </div>
  );
};

export default HotelRegistrationClient;
