'use client';

import { useState } from 'react';

const SearchCondition = ({ 
  isOpen, 
  onClose, 
  checkIn, 
  checkOut, 
  onDateChange,
  selectedType,
  className = ''
}) => {
  const [selectedCheckIn, setSelectedCheckIn] = useState(checkIn);
  const [selectedCheckOut, setSelectedCheckOut] = useState(checkOut);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // 날짜 포맷팅 함수
  const formatDate = (date) => {
    // 시간대 문제 해결을 위해 로컬 시간으로 명시적 설정
    const d = new Date(date + 'T00:00:00');
    return d.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'short'
    });
  };

  // 월 변경 함수
  const changeMonth = (direction) => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev);
      newMonth.setMonth(prev.getMonth() + direction);
      return newMonth;
    });
  };

  // 날짜 선택 함수
  const selectDate = (date) => {
    // 시간대 문제 해결을 위해 로컬 날짜 그대로 사용
    const dateString = date; // 이미 YYYY-MM-DD 형식이므로 그대로 사용
    
    if (!selectedCheckIn || (selectedCheckIn && selectedCheckOut)) {
      // 체크인 날짜 선택 또는 새로운 선택 시작
      setSelectedCheckIn(dateString);
      setSelectedCheckOut(null);
    } else if (selectedCheckIn && !selectedCheckOut) {
      // 체크아웃 날짜 선택
      if (new Date(dateString) > new Date(selectedCheckIn)) {
        setSelectedCheckOut(dateString);
      } else {
        setSelectedCheckIn(dateString);
        setSelectedCheckOut(null);
      }
    }
  };

  // 적용 함수
  const applyDates = () => {
    if (selectedCheckIn && selectedCheckOut) {
      onDateChange(selectedCheckIn, selectedCheckOut);
      onClose();
    }
  };

  // 달력 생성 함수
  const generateCalendar = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const calendar = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      
      const isCurrentMonth = date.getMonth() === month;
      const isToday = date.getTime() === today.getTime();
      const isPastDate = date < today; // 오늘보다 이전 날짜인지 확인
      
      // 날짜 비교를 위해 로컬 날짜 사용
      const dateYear = date.getFullYear();
      const dateMonth = String(date.getMonth() + 1).padStart(2, '0');
      const dayNum = String(date.getDate()).padStart(2, '0');
      const dateStr = `${dateYear}-${dateMonth}-${dayNum}`;
      const checkInStr = selectedCheckIn; // 이미 YYYY-MM-DD 형식
      const checkOutStr = selectedCheckOut; // 이미 YYYY-MM-DD 형식
      
      const isSelected = 
        (checkInStr && dateStr === checkInStr) ||
        (checkOutStr && dateStr === checkOutStr);
      const isInRange = checkInStr && checkOutStr &&
        dateStr > checkInStr && dateStr < checkOutStr;

      calendar.push({
        date,
        isCurrentMonth,
        isToday,
        isSelected,
        isInRange,
        isPastDate,
        day: date.getDate()
      });
    }

    return calendar;
  };

  if (!isOpen) return null;

  const calendar = generateCalendar();
  const monthNames = [
    '1월', '2월', '3월', '4월', '5월', '6월',
    '7월', '8월', '9월', '10월', '11월', '12월'
  ];
  const dayNames = ['일', '월', '화', '수', '목', '금', '토'];

  return (
    <>
      {/* 날짜 선택 패널 */}
      <div className={`bg-white rounded-lg shadow-lg border border-gray-200 w-full max-w-2xl ${className}`}>
        {/* 상단 날짜 선택 헤더 */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex gap-3 mb-3">
            {/* 체크인 */}
            <div className={`flex-1 p-3 rounded-lg border-2 ${
              selectedCheckIn && !selectedCheckOut 
                ? 'border-teal-500 bg-teal-50' 
                : 'border-gray-200'
            }`}>
              <div className="text-xs font-medium text-gray-600 mb-1">체크인</div>
              <div className="text-sm font-semibold">
                {selectedCheckIn ? formatDate(selectedCheckIn) : '날짜를 선택하세요'}
              </div>
            </div>

            {/* 체크아웃 */}
            <div className={`flex-1 p-3 rounded-lg border-2 ${
              selectedCheckOut 
                ? 'border-teal-500 bg-teal-50' 
                : 'border-gray-200'
            }`}>
              <div className="text-xs font-medium text-gray-600 mb-1">체크아웃</div>
              <div className="text-sm font-semibold">
                {selectedCheckOut ? formatDate(selectedCheckOut) : '날짜를 선택하세요'}
              </div>
            </div>
          </div>
        </div>

        {/* 달력 */}
        <div className="p-4">
          {/* 월/년 헤더 */}
          <div className="flex items-center justify-between mb-3">
            <button 
              onClick={() => changeMonth(-1)}
              className="p-1 hover:bg-gray-100 rounded transition-colors"
            >
              ←
            </button>
            <h3 className="text-sm font-bold">
              {currentMonth.getFullYear()}.{String(currentMonth.getMonth() + 1).padStart(2, '0')}.
            </h3>
            <button 
              onClick={() => changeMonth(1)}
              className="p-1 hover:bg-gray-100 rounded transition-colors"
            >
              →
            </button>
          </div>

          {/* 요일 헤더 */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {dayNames.map(day => (
              <div key={day} className="text-center text-xs font-medium text-gray-500 py-1">
                {day}
              </div>
            ))}
          </div>

          {/* 달력 그리드 */}
          <div className="grid grid-cols-7 gap-1">
            {calendar.map((day, index) => (
              <button
                key={index}
                onClick={() => {
                  // 과거 날짜는 클릭 비활성화
                  if (day.isPastDate) return;
                  
                  // 로컬 날짜로 정확한 YYYY-MM-DD 형식 생성
                  const clickYear = day.date.getFullYear();
                  const clickMonth = String(day.date.getMonth() + 1).padStart(2, '0');
                  const clickDay = String(day.date.getDate()).padStart(2, '0');
                  const dateString = `${clickYear}-${clickMonth}-${clickDay}`;
                  selectDate(dateString);
                }}
                disabled={day.isPastDate}
                className={`
                  h-8 w-full text-xs rounded transition-colors flex flex-col items-center justify-center
                  ${!day.isCurrentMonth ? 'text-gray-300' : day.isPastDate ? 'text-gray-300' : 'text-gray-700'}
                  ${day.isToday ? 'font-bold text-black' : ''}
                  ${day.isSelected ? 'bg-teal-500 text-white font-bold' : ''}
                  ${day.isInRange ? 'bg-teal-100' : ''}
                  ${day.isCurrentMonth && !day.isSelected && !day.isPastDate ? 'hover:bg-gray-100' : ''}
                  ${day.isToday && !day.isSelected ? 'border-2 border-teal-500' : ''}
                  ${day.isPastDate ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
                `}
              >
                <div className="text-xs leading-none">{day.day}</div>
                {day.isToday && !day.isSelected && (
                  <div className="text-[10px] text-teal-600 font-normal leading-none mt-0.5">오늘</div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* 하단 적용 버튼 */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-end">
            <button
              onClick={applyDates}
              disabled={!selectedCheckIn || !selectedCheckOut}
              className="px-6 py-2 bg-teal-500 text-white rounded-lg text-sm font-semibold hover:bg-teal-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              적용
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default SearchCondition;