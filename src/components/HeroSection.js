"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/Button";
import SearchCondition from "@/components/hotelSearch/SearchCondition";
import { useSearchStore } from "@/stores/searchStore";
import axios from "axios";

/**
 * 메인 페이지 히어로 섹션 컴포넌트
 *
 * 기능:
 * - 슬라이더로 메인 메시지 표시
 * - 호텔/다이닝 검색 폼
 * - 예약 양도 중고거래 버튼
 */
const HeroSection = () => {
  // 오늘 날짜와 내일 날짜를 YYYY-MM-DD 형식으로 가져오기
  const getTodayDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const getTomorrowDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const year = tomorrow.getFullYear();
    const month = String(tomorrow.getMonth() + 1).padStart(2, "0");
    const day = String(tomorrow.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const todayDate = getTodayDate();
  const tomorrowDate = getTomorrowDate();

  const [destination, setDestination] = useState("");
  const [checkIn, setCheckIn] = useState(todayDate); // 기본값: 오늘 날짜
  const [checkOut, setCheckOut] = useState(tomorrowDate); // 기본값: 내일 날짜
  const [diningDate, setDiningDate] = useState(todayDate); // 기본값: 오늘 날짜
  const [mealType, setMealType] = useState("lunch");
  const [adults, setAdults] = useState(2);
  const [selectedType, setSelectedType] = useState("hotel");
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  const router = useRouter();
  const { updateSearchParams, searchParams: storeSearchParams } =
    useSearchStore();

  // 슬라이더 데이터
  const slides = [
    {
      title: "전세계 예약사이트 요금",
      subtitle: "한번에 비교!",
      description: "알아두면 도움 되는 생생한 숙박후기",
    },
    {
      title: "힐링 호캉스 패키지는",
      subtitle: "체크인 객실 패키지로!",
      description: "여행가기 전 확인 필수! 다양한 할인/적립!",
    },
    {
      title: "해외 출장 호텔은",
      subtitle: "첫 예약 5,000원 적립",
      description: "여행가기 전 확인 필수! 다양한 할인/적립!",
    },
  ];

  // 슬라이더 자동 전환
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 3000);

    return () => clearInterval(timer);
  }, [slides.length]);

  // 스토어에서 검색 조건 불러오기
  useEffect(() => {
    if (storeSearchParams.destination) {
      setDestination(storeSearchParams.destination);
    }
    if (storeSearchParams.checkIn) {
      setCheckIn(storeSearchParams.checkIn);
    } else {
      // 스토어에 체크인 날짜가 없으면 기본값(오늘) 설정
      setCheckIn(todayDate);
    }
    if (storeSearchParams.checkOut) {
      setCheckOut(storeSearchParams.checkOut);
    } else {
      // 스토어에 체크아웃 날짜가 없으면 기본값(내일) 설정
      setCheckOut(tomorrowDate);
    }
    if (storeSearchParams.adults) {
      setAdults(storeSearchParams.adults);
    }
  }, [storeSearchParams]);

  // 검색 타입 변경 시 상태 초기화
  useEffect(() => {
    const today = getTodayDate();
    const tomorrow = getTomorrowDate();
    
    if (selectedType === "dining") {
      // 다이닝으로 변경: 다이닝 날짜를 오늘로 설정
      setCheckIn("");
      setCheckOut("");
      setDiningDate(today);
      setMealType("lunch");
      setAdults(2);
    } else if (selectedType === "hotel") {
      // 호텔로 변경: 체크인/체크아웃을 오늘/내일로 설정
      if (!checkIn) setCheckIn(today);
      if (!checkOut) setCheckOut(tomorrow);
      setDiningDate("");
    }
  }, [selectedType]);

  // 날짜 포맷팅 함수
  const formatDateDisplay = (date) => {
    if (!date) return "";
    const d = new Date(date + "T00:00:00");
    return `${d.getMonth() + 1}.${d.getDate()}. ${
      ["일", "월", "화", "수", "목", "금", "토"][d.getDay()]
    }`;
  };

  // 날짜 변경 핸들러
  const handleDateChange = (newCheckIn, newCheckOut) => {
    setCheckIn(newCheckIn);
    setCheckOut(newCheckOut);
    
    // 다이닝 선택 시 diningDate도 업데이트
    if (selectedType === "dining") {
      setDiningDate(newCheckIn);
    }
  };

  // 호텔 가져오기

  // 검색 핸들러
  const handleSearch = async (e) => {
    e.preventDefault();
    
    // destination 검증
    const trimmedDestination = destination?.trim() || "";
    if (!trimmedDestination) {
      alert("목적지를 입력해주세요.");
      return;
    }
    
    // 최소 2글자 이상 검증
    if (trimmedDestination.length < 2) {
      alert("최소 2글자 이상 입력해주세요.");
      return;
    }
    
    if (selectedType === "dining") {
      console.log("다이닝 검색:", {
        destination,
        diningDate,
        mealType,
        adults,
      });
      
      // 다이닝 모드로 호텔 검색 페이지로 이동 (통합)
      const params = new URLSearchParams({
        destination: trimmedDestination,
        diningDate: diningDate,
        diningMode: "true",
        adults: adults.toString(),
      });
      
      router.push(`/hotel-search?${params.toString()}`);
    } else {
      console.log("검색:", { destination, checkIn, checkOut, adults });
      const nights =
        checkIn && checkOut
          ? Math.ceil(
              (new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24)
            )
          : 1;

      updateSearchParams({
        destination: trimmedDestination,
        checkIn: checkIn,
        checkOut: checkOut,
        nights: nights,
        adults: adults,
        children: 0,
      });

      // 페이지 이동
      router.push(
        `/hotel-search?destination=${encodeURIComponent(trimmedDestination)}&checkIn=${checkIn}&checkOut=${checkOut}&adults=${adults}`
      );
    }
  };

  // 바깥 클릭 시 날짜 선택기 닫기
  const handleOutsideClick = (e) => {
    if (isDatePickerOpen && !e.target.closest(".date-picker-container")) {
      setIsDatePickerOpen(false);
    }
  };

  return (
    <section className="bg-blue-50 py-12 md:py-16" onClick={handleOutsideClick}>
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* 타이틀 영역 - 슬라이더 */}
        <div className="text-center mb-8 relative bg-white rounded-2xl shadow-lg p-6 md:p-8 border border-gray-100">
          <div className="relative h-40 md:h-44 overflow-hidden">
            {slides.map((slide, index) => (
              <div
                key={index}
                className={`absolute inset-0 transition-all duration-700 ease-in-out ${
                  index === currentSlide
                    ? "opacity-100 translate-x-0"
                    : index < currentSlide
                    ? "opacity-0 -translate-x-full"
                    : "opacity-0 translate-x-full"
                }`}
              >
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
                  <span className="block text-gray-900 mb-2">
                    {slide.title}
                  </span>
                  <span className="block text-[#3B82F6]">{slide.subtitle}</span>
                </h1>
                <p className="text-base md:text-lg text-gray-600">
                  {slide.description}
                </p>
              </div>
            ))}
          </div>

          {/* 슬라이드 인디케이터 */}
          <div className="flex justify-center gap-2 mt-4">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentSlide
                    ? "bg-[#3B82F6] w-8"
                    : "bg-gray-300 hover:bg-gray-400"
                }`}
                aria-label={`슬라이드 ${index + 1}로 이동`}
              />
            ))}
          </div>
        </div>

        {/* 검색 폼과 중고거래 버튼 */}
        <div className="flex gap-4">
          {/* 검색 폼 - 8/10 비율 */}
          <div className="flex-[8] bg-white rounded-2xl shadow-xl p-6 md:p-8 border border-gray-200">
            {/* 검색 타입 탭 */}
            <div className="flex gap-2 mb-6">
              <button
                onClick={() => setSelectedType("hotel")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedType === "hotel"
                    ? "bg-[#3B82F6] text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                숙소
              </button>
              <button
                onClick={() => setSelectedType("dining")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedType === "dining"
                    ? "bg-[#3B82F6] text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                다이닝
              </button>
            </div>

            {/* 검색 입력 필드 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              {/* 목적지/호텔 */}
              <div className="lg:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {selectedType === "dining"
                    ? "식사를 어디서 하시나요?"
                    : "어디로 여행 가시나요?"}
                </label>
                <input
                  type="text"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleSearch(e);
                    }
                  }}
                  placeholder={
                    selectedType === "dining"
                      ? "호텔명을 입력하세요"
                      : "목적지를 입력하세요"
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent transition-all h-12"
                />
              </div>

              {/* 날짜 선택 */}
              <div className="lg:col-span-2 relative date-picker-container">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {selectedType === "dining"
                    ? "식사일정을 선택하세요"
                    : "숙박일정을 선택하세요"}
                </label>
                {selectedType === "dining" ? (
                  <div
                    className="grid grid-cols-2 gap-2 cursor-pointer"
                    onClick={() => setIsDatePickerOpen(true)}
                  >
                    <div className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white hover:border-[#3B82F6] transition-colors h-12 flex flex-col justify-center">
                      <div className="text-xs text-gray-600">다이닝</div>
                      <div className="text-sm text-gray-900 font-medium">
                        {diningDate ? formatDateDisplay(diningDate) : "날짜 선택"}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div
                    className="grid grid-cols-2 gap-2 cursor-pointer"
                    onClick={() => setIsDatePickerOpen(true)}
                  >
                    <div className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white hover:border-[#3B82F6] transition-colors h-12 flex flex-col justify-center">
                      <div className="text-xs text-gray-600">체크인</div>
                      <div className="text-sm text-gray-900 font-medium">
                        {checkIn ? formatDateDisplay(checkIn) : "날짜 선택"}
                      </div>
                    </div>
                    <div className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white hover:border-[#3B82F6] transition-colors h-12 flex flex-col justify-center">
                      <div className="text-xs text-gray-600">체크아웃</div>
                      <div className="text-sm text-gray-900 font-medium">
                        {checkOut ? formatDateDisplay(checkOut) : "날짜 선택"}
                      </div>
                    </div>
                  </div>
                )}

                {/* 날짜 선택 컴포넌트 */}
                {isDatePickerOpen && (
                  <div className="absolute top-full left-0 right-0 z-50 mt-1">
                    <SearchCondition
                      isOpen={isDatePickerOpen}
                      onClose={() => setIsDatePickerOpen(false)}
                      checkIn={selectedType === "dining" ? diningDate : checkIn}
                      checkOut={selectedType === "dining" ? "" : checkOut}
                      onDateChange={handleDateChange}
                      selectedType={selectedType}
                      className="max-w-md"
                    />
                  </div>
                )}
              </div>

              {/* 인원 선택 */}
              <div className="lg:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {`인원 ${adults}명`}
                </label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setAdults(Math.max(1, adults - 1))}
                    className="w-12 h-12 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors text-lg font-semibold"
                    aria-label="인원 감소"
                  >
                    -
                  </button>
                  <div className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-center font-medium">
                    {adults}
                  </div>
                  <button
                    onClick={() => setAdults(adults + 1)}
                    className="w-12 h-12 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors text-lg font-semibold"
                    aria-label="인원 증가"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* 검색 버튼 */}
            <Button
              onClick={handleSearch}
              variant="primary"
              size="lg"
              className="w-full"
            >
              검색
            </Button>
          </div>

          {/* 중고거래 시스템 버튼 - 2/10 비율 */}
          <div className="flex-[2] flex flex-col justify-center">
            <button
              onClick={() => (window.location.href = "/used")}
              className="bg-gradient-to-br from-orange-400 to-red-500 hover:from-orange-500 hover:to-red-600 text-white rounded-2xl shadow-xl p-6 md:p-8 border border-orange-300 transition-all duration-300 hover:shadow-2xl hover:scale-105 h-full flex flex-col items-center justify-center"
            >
              <div className="text-4xl md:text-5xl mb-3">🏨</div>
              <div className="text-center">
                <div className="text-lg md:text-xl font-bold mb-2">
                  예약 양도
                </div>
                <div className="text-sm md:text-base opacity-90">중고거래</div>
                <div className="text-xs md:text-sm mt-2 opacity-75">
                  싼 값에 양도
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
