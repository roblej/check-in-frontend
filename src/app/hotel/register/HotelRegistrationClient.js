"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import HotelRegistrationForm from "./HotelRegistrationForm";
import axios from "axios";

const HotelRegistrationClient = ({ initialData }) => {
  const router = useRouter();
  
  // 폼 데이터 상태 관리
  const [formData, setFormData] = useState({
    // 기본 정보
    hotelInfo: {
      title: "",
      adress: "",
      phone: "",
      email: "",
      checkInTime: "15:00",
      checkOutTime: "11:00",
      cancellationPolicy: "무료 취소 (체크인 24시간 전까지)"
    },
    // 호텔 상세 정보
    hotelDetail: {
      description: "",
      features: "",
      scale: "",
      history: ""
    },
    // 지역 정보
    area: {
      region: "",
      district: "",
      nearbyAttractions: "",
      transportation: ""
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
    const basicFields = ['title', 'adress', 'phone', 'email'];
    basicFields.forEach(field => {
      totalFields++;
      if (formData.hotelInfo[field]) completedFields++;
    });

    // 객실 정보 체크
    if (formData.rooms.length > 0) {
      totalFields++;
      completedFields++;
    }

    // 이미지 체크
    if (formData.images.length > 0) {
      totalFields++;
      completedFields++;
    }

    setProgress(totalFields > 0 ? (completedFields / totalFields) * 100 : 0);
  }, [formData]);

  // 임시저장 기능
  const saveDraft = async () => {
    try {
      const draftData = {
        formData: formData,
        lastTab: currentTab,
        progress: progress,
      };
      
      const response = await axios.post("/api/hotel/draft", draftData);
      
      if (response.data.success) {
        console.log("임시저장 완료:", response.data.message);
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
      const response = await axios.get("/api/hotel/draft");
      
      if (response.data.success && response.data.data) {
        const draftData = response.data.data;
        
        // JSON 문자열을 객체로 파싱
        const parsedFormData = JSON.parse(draftData.formData);
        
        setFormData(parsedFormData);
        setCurrentTab(draftData.lastTab || "basic");
        setProgress(draftData.progress || 0);
        
        alert("이전 작성 내용을 불러왔습니다.");
      } else {
        alert("불러올 임시저장 데이터가 없습니다.");
      }
    } catch (error) {
      console.error("임시저장 데이터 로드 실패:", error);
      alert("임시저장 데이터 로드 중 오류가 발생했습니다.");
    }
  };

  // 임시저장 데이터 삭제
  const clearDraft = async () => {
    try {
      const response = await axios.delete("/api/hotel/draft");
      
      if (response.data.success) {
        alert("임시저장 내용이 삭제되었습니다.");
        
        // 폼 데이터 초기화
        setFormData({
          hotelInfo: {
            title: "",
            adress: "",
            phone: "",
            email: "",
            checkInTime: "15:00",
            checkOutTime: "11:00",
            cancellationPolicy: "무료 취소 (체크인 24시간 전까지)"
          },
          hotelDetail: {
            description: "",
            features: "",
            scale: "",
            history: ""
          },
          area: {
            region: "",
            district: "",
            nearbyAttractions: "",
            transportation: ""
          },
          rooms: [],
          images: [],
          events: [],
          dining: []
        });
        setCurrentTab("basic");
        setProgress(0);
      } else {
        alert("임시저장 삭제 실패: " + response.data.message);
      }
    } catch (error) {
      console.error("임시저장 삭제 실패:", error);
      alert("임시저장 삭제 중 오류가 발생했습니다.");
    }
  };

  // 임시저장 상태 확인
  const checkDraftStatus = async () => {
    try {
      const response = await axios.get("/api/hotel/draft/status");
      
      if (response.data.success) {
        if (response.data.hasDraft) {
          const shouldLoad = confirm(
            "이전에 작성하던 호텔 등록 내용이 있습니다. 이어서 작성하시겠습니까?"
          );
          if (shouldLoad) {
            loadDraft();
          } else {
            clearDraft();
          }
        }
      }
    } catch (error) {
      console.error("임시저장 상태 확인 실패:", error);
    }
  };

  // 자동 저장 (5초마다)
  useEffect(() => {
    const autoSaveTimer = setInterval(() => {
      // 폼에 데이터가 있을 때만 자동 저장
      if (formData.hotelInfo.title || formData.rooms.length > 0 || formData.images.length > 0) {
        saveDraft();
      }
    }, 5000); // 5초마다 자동 저장

    return () => clearInterval(autoSaveTimer);
  }, [formData, currentTab, progress]);

  // 페이지 로드 시 임시저장 상태 확인
  useEffect(() => {
    checkDraftStatus();
  }, []);

  // 폼 데이터 업데이트
  const updateFormData = (section, data) => {
    setFormData(prev => ({
      ...prev,
      [section]: { ...prev[section], ...data }
    }));
  };

  // 객실 추가
  const addRoom = () => {
    const newRoom = {
      id: Date.now(),
      name: "",
      type: "",
      price: "",
      capacity: 2,
      size: "",
      bedType: "",
      amenities: [],
      description: "",
      images: []
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
    if (!formData.hotelInfo.email) {
      newErrors.email = "이메일을 입력해주세요";
    }

    // 객실 정보 검증
    if (formData.rooms.length === 0) {
      newErrors.rooms = "최소 1개 이상의 객실을 등록해주세요";
    }

    // 이미지 검증
    if (formData.images.length === 0) {
      newErrors.images = "최소 1개 이상의 이미지를 업로드해주세요";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 등록 요청 제출
  const handleSubmit = async () => {
    if (!validateForm()) {
      alert("필수 정보를 모두 입력해주세요.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await axios.post("/api/hotel/register", {
        ...formData,
        status: 0 // 승인 대기 상태
      });

      if (response.data.success) {
        alert("호텔 등록 요청이 완료되었습니다. 관리자 승인 후 운영을 시작할 수 있습니다.");
        // 등록 성공 시 임시저장 삭제
        await clearDraft();
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
        saveDraft={saveDraft}
        loadDraft={loadDraft}
        clearDraft={clearDraft}
      />
    </div>
  );
};

export default HotelRegistrationClient;
