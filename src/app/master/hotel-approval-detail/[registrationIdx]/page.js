"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import MasterLayout from "@/components/master/MasterLayout";
import HotelRegistrationForm from "@/components/master/approve/HotelRegistrationForm";
import axiosInstance from "@/lib/axios";
import { ArrowLeft } from "lucide-react";

const HotelApprovalDetail = () => {
  const router = useRouter();
  const params = useParams();
  const registrationIdx = params?.registrationIdx;
  
  const [formData, setFormData] = useState({
    hotelInfo: {
      title: "",
      adress: "",
      phone: "",
      email: "",
      checkInTime: "15:00",
      checkOutTime: "11:00",
      cancellationPolicy: ""
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

  // 마스터 승인 화면에서는 초기 데이터가 필요 없음 (읽기 전용)
  const [initialData] = useState({
    regions: [],
    amenities: [],
    roomTypes: []
  });

  const [currentTab, setCurrentTab] = useState("basic");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);

  // 호텔 정보 로드
  useEffect(() => {
    const loadHotelInfo = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get(`/master/hotelApproval/${registrationIdx}`);
        
        if (response.data.success && response.data.data) {
          const hotelData = response.data.data;
          
          // formData에 호텔 정보 설정
          setFormData(prev => ({
            ...prev,
            hotelInfo: {
              ...prev.hotelInfo,
              ...hotelData.hotelInfo
            },
            hotelDetail: hotelData.hotelDetail || prev.hotelDetail,
            area: hotelData.area || prev.area,
            rooms: hotelData.rooms || [],
            images: hotelData.images || [],
            events: hotelData.events || [],
            dining: hotelData.dining || []
          }));
        }
      } catch (error) {
        console.error("호텔 정보 로드 실패:", error);
        alert("호텔 정보를 불러올 수 없습니다.");
        router.back();
      } finally {
        setLoading(false);
      }
    };

    if (registrationIdx) {
      loadHotelInfo();
    }
  }, [registrationIdx, router]);

  // 폼 데이터 업데이트 함수
  const updateFormData = (section, data) => {
    setFormData(prev => ({
      ...prev,
      [section]: { ...prev[section], ...data }
    }));
  };

  // 객실 관리 함수 (읽기 전용이므로 빈 함수)
  const addRoom = () => {};
  const removeRoom = () => {};
  const updateRoom = () => {};

  // 다이닝 관리 함수 (읽기 전용이므로 빈 함수)
  const addDining = () => {};
  const removeDining = () => {};
  const updateDining = () => {};

  // 승인 핸들러
  const handleApprove = async () => {
    if (!confirm("이 호텔을 승인하시겠습니까?")) {
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await axiosInstance.post(`/master/approveHotel/${registrationIdx}`);

      if (response.data.success) {
        alert("호텔이 승인되었습니다.");
        router.push("/master/hotel-approval");
      } else {
        alert("승인 처리 중 오류가 발생했습니다.");
      }
    } catch (error) {
      console.error("승인 실패:", error);
      alert("서버 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // 거부 핸들러
  const handleReject = async () => {
    if (!confirm("이 호텔을 거부하시겠습니까?")) {
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await axiosInstance.post(`/master/rejectHotel/${registrationIdx}`);

      if (response.data.success) {
        alert("호텔이 거부되었습니다.");
        router.push("/master/hotel-approval");
      } else {
        alert("거부 처리 중 오류가 발생했습니다.");
      }
    } catch (error) {
      console.error("거부 실패:", error);
      alert("서버 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <MasterLayout>
        <div className="p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">호텔 정보를 불러오는 중...</p>
            </div>
          </div>
        </div>
      </MasterLayout>
    );
  }

  return (
    <MasterLayout>
      <div className="p-6 space-y-6">
        {/* 뒤로 가기 버튼 */}
        <button
          onClick={() => router.push("/master/hotel-approval")}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          <span className="text-sm font-medium">목록으로 돌아가기</span>
        </button>

        {/* 호텔 등록 폼 */}
        <HotelRegistrationForm
          mode="approve"
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
          isSubmitting={isSubmitting}
          onApprove={handleApprove}
          onReject={handleReject}
        />
      </div>
    </MasterLayout>
  );
};

export default HotelApprovalDetail;

