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
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [refusalMsg, setRefusalMsg] = useState("");
  
  // 탭별 데이터 로드 상태 추적
  const [loadedTabs, setLoadedTabs] = useState(new Set());
  const [loadingTabs, setLoadingTabs] = useState(new Set());

  // 호텔 기본 정보 로드 (초기 로드 - 빠른 로딩)
  useEffect(() => {
    const loadHotelBasicInfo = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get(`/master/hotelApproval/${registrationIdx}`);
        
        if (response.data.success && response.data.data) {
          const hotelData = response.data.data;
          
          // formData에 기본 정보만 설정 (images, rooms, dining은 빈 배열)
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
      loadHotelBasicInfo();
    }
  }, [registrationIdx, router]);

  // 탭별 데이터 지연 로딩
  useEffect(() => {
    const loadTabData = async () => {
      // basic 탭은 이미 로드됨
      if (currentTab === "basic" || loadedTabs.has(currentTab)) {
        return;
      }

      // 이미 로딩 중이면 중복 요청 방지
      if (loadingTabs.has(currentTab)) {
        return;
      }

      try {
        setLoadingTabs(prev => new Set(prev).add(currentTab));
        
        let apiPath = "";
        if (currentTab === "images") {
          apiPath = `/master/hotelApproval/${registrationIdx}/images`;
        } else if (currentTab === "rooms") {
          apiPath = `/master/hotelApproval/${registrationIdx}/rooms`;
        } else if (currentTab === "dining") {
          apiPath = `/master/hotelApproval/${registrationIdx}/dining`;
        } else {
          return;
        }

        const response = await axiosInstance.get(apiPath);
        
        if (response.data.success && response.data.data) {
          const tabData = response.data.data;
          
          // 해당 탭의 데이터만 업데이트
          setFormData(prev => {
            const updated = { ...prev };
            if (currentTab === "images") {
              updated.images = tabData.images || [];
              updated.events = tabData.events || [];
            } else if (currentTab === "rooms") {
              updated.rooms = tabData.rooms || [];
            } else if (currentTab === "dining") {
              updated.dining = tabData.dining || [];
            }
            return updated;
          });
          
          // 로드 완료 표시
          setLoadedTabs(prev => new Set(prev).add(currentTab));
        }
      } catch (error) {
        console.error(`${currentTab} 탭 데이터 로드 실패:`, error);
        alert(`${currentTab} 탭 데이터를 불러올 수 없습니다.`);
      } finally {
        setLoadingTabs(prev => {
          const newSet = new Set(prev);
          newSet.delete(currentTab);
          return newSet;
        });
      }
    };

    if (registrationIdx && currentTab) {
      loadTabData();
    }
  }, [currentTab, registrationIdx, loadedTabs, loadingTabs]);

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
      const response = await axiosInstance.post(`/master/approveHotel`, {
        registrationIdx: registrationIdx
      });
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

  // 거부 버튼 클릭 핸들러 - 모달 표시
  const handleReject = () => {
    setShowRejectModal(true);
  };

  // 거부 취소 핸들러
  const handleRejectCancel = () => {
    setShowRejectModal(false);
    setRefusalMsg("");
  };

  // 거부 확정 핸들러
  const handleConfirmReject = async () => {
    if (!refusalMsg.trim()) {
      alert("거부 사유를 입력해주세요.");
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await axiosInstance.post(`/master/rejectHotel`, {
        registrationIdx: registrationIdx,
        refusalMsg: refusalMsg.trim()
      });

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
      setShowRejectModal(false);
      setRefusalMsg("");
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

      {/* 거부 사유 입력 모달 */}
      {showRejectModal && (
        <div 
          className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50 shadow-2xl rounded-lg border-black"
          onClick={handleRejectCancel}
          role="dialog"
          aria-modal="true"
          aria-labelledby="reject-modal-title"
        >
          <div 
            className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 모달 헤더 */}
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 
                id="reject-modal-title" 
                className="text-lg font-semibold text-gray-900"
              >
                호텔 거부 사유 입력
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                거부 사유를 입력해주세요.
              </p>
            </div>

            {/* 모달 본문 */}
            <div className="px-6 py-4">
              <label 
                htmlFor="refusalMsg" 
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                거부 사유 <span className="text-red-500">*</span>
              </label>
              <textarea
                id="refusalMsg"
                value={refusalMsg}
                onChange={(e) => setRefusalMsg(e.target.value)}
                placeholder="예: 호텔 시설 기준 미달, 필수 정보 누락 등"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-black-500 focus:border-black-500 resize-none"
                rows={5}
                required
              />
            </div>

            {/* 모달 푸터 */}
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
              <button
                type="button"
                onClick={handleRejectCancel}
                disabled={isSubmitting}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
                tabIndex={0}
              >
                취소
              </button>
              <button
                type="button"
                onClick={handleConfirmReject}
                disabled={isSubmitting}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                tabIndex={0}
              >
                {isSubmitting ? "처리 중..." : "거부하기"}
              </button>
            </div>
          </div>
        </div>
      )}
    </MasterLayout>
  );
};

export default HotelApprovalDetail;

