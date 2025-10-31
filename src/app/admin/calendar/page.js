'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/admin/AdminLayout';
import ReservationDetailModal from '@/components/admin/ReservationDetailModal';
import axiosInstance from '@/lib/axios';
import { ChevronLeft, ChevronRight, Calendar, User, CreditCard, Clock, Building2 } from 'lucide-react';

const AdminCalendar = () => {
  const router = useRouter();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedReservations, setSelectedReservations] = useState([]);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedReservationDetail, setSelectedReservationDetail] = useState(null);
  const [showReservationDetailModal, setShowReservationDetailModal] = useState(false);

  const didFetch = useRef(false);
  const lastFetchedDateRef = useRef(null);

  // 달력 데이터 계산
  const calendarData = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // 이전 달의 마지막 날들 (빈 날짜)
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // 이번 달의 날들
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month, i);
      days.push(date);
    }

    return days;
  }, [currentDate]);

  // 달력 시작일과 종료일 계산
  const getStartAndEndDate = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const start = new Date(year, month, 1);
    const end = new Date(year, month + 1, 0);
    return { start, end };
  }, [currentDate]);

  // 예약 데이터 가져오기
  const fetchReservations = async () => {
    try {
      setLoading(true);
      const { start, end } = getStartAndEndDate;
      const startDate = formatDate(start);
      const endDate = formatDate(end);

      const response = await axiosInstance.get('/admin/calendar', {
        params: { startDate, endDate }
      });

      if (response.data.success) {
        setReservations(response.data.reservations || []);
      }
    } catch (error) {
      console.error('예약 데이터 로드 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const dateKey = `${currentDate.getFullYear()}-${currentDate.getMonth()}`;
    if (didFetch.current && lastFetchedDateRef.current === dateKey) return;
    didFetch.current = true;
    lastFetchedDateRef.current = dateKey;
    
    fetchReservations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentDate]);

  // 날짜 포맷 (YYYY-MM-DD)
  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // 특정 날짜의 예약 필터링 (체크인 날짜만 확인)
  const getReservationsForDate = (date) => {
    if (!date) return [];
    const dateStr = formatDate(date);
    return reservations.filter(reservation => {
      const checkinStr = reservation.checkinDate?.split('T')[0];
      return checkinStr === dateStr;
    });
  };

  // 월 변경 핸들러
  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  // 오늘로 이동
  const handleToday = () => {
    setCurrentDate(new Date());
  };

  // 날짜 클릭 핸들러
  const handleDateClick = (date) => {
    if (!date) return;
    const dateReservations = getReservationsForDate(date);
    setSelectedDate(date);
    setSelectedReservations(dateReservations);
    if (dateReservations.length > 0) {
      setShowDetailModal(true);
    }
  };

  // 예약 상세보기 핸들러
  const handleReservationDetail = (reservation) => {
    setSelectedReservationDetail(reservation);
    setShowReservationDetailModal(true);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 0:
        return <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">대기</span>;
      case 1:
        return <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">확정</span>;
      case 2:
        return <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">취소</span>;
      case 3:
        return <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">노쇼</span>;
      default:
        return <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">알 수 없음</span>;
    }
  };

  const dayNames = ['일', '월', '화', '수', '목', '금', '토'];

  return (
    <AdminLayout>
      <div className="p-6">
        {/* 헤더 */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">예약 캘린더</h1>
            <p className="text-sm text-gray-600 mt-1">예약 현황을 달력으로 확인하세요</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleToday}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              오늘
            </button>
          </div>
        </div>

        {/* 월 네비게이션 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex items-center justify-between">
            <button
              onClick={handlePrevMonth}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-6 h-6 text-gray-600" />
            </button>
            
            <h2 className="text-xl font-semibold text-gray-900">
              {currentDate.getFullYear()}년 {currentDate.getMonth() + 1}월
            </h2>
            
            <button
              onClick={handleNextMonth}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronRight className="w-6 h-6 text-gray-600" />
            </button>
          </div>
        </div>

        {/* 달력 */}
        {loading ? (
          <div className="flex justify-center items-center h-96">
            <div className="text-lg text-gray-600">데이터를 불러오는 중...</div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            {/* 요일 헤더 */}
            <div className="grid grid-cols-7 bg-gray-50 border-b border-gray-200">
              {dayNames.map(day => (
                <div key={day} className="p-3 text-center text-sm font-semibold text-gray-700">
                  {day}
                </div>
              ))}
            </div>

            {/* 달력 본문 */}
            <div className="grid grid-cols-7">
              {calendarData.map((date, index) => {
                const isToday = date && formatDate(date) === formatDate(new Date());
                const dateReservations = getReservationsForDate(date);
                const hasReservations = dateReservations.length > 0;

                return (
                  <button
                    key={index}
                    onClick={() => handleDateClick(date)}
                    disabled={!date}
                    className={`min-h-[100px] p-2 border-b border-r border-gray-200 hover:bg-gray-50 transition-colors ${
                      !date ? 'bg-gray-50 cursor-not-allowed' : 'cursor-pointer'
                    } ${isToday ? 'bg-blue-50' : ''}`}
                  >
                    {date && (
                      <div className="flex flex-col h-full">
                        <div className={`text-sm font-medium mb-1 ${isToday ? 'text-blue-600' : 'text-gray-900'}`}>
                          {date.getDate()}
                        </div>
                        <div className="flex-1 space-y-1 overflow-hidden">
                          {dateReservations.slice(0, 3).map((reservation, idx) => (
                            <div
                              key={idx}
                              className="text-xs truncate px-1 py-0.5 rounded bg-blue-100 text-blue-800"
                              title={`${reservation.customer?.name || '고객'} - ${reservation.room?.name || '객실'}`}
                            >
                              {reservation.customer?.name || '고객'}
                            </div>
                          ))}
                          {dateReservations.length > 3 && (
                            <div className="text-xs text-gray-500">
                              +{dateReservations.length - 3}건
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* 예약 상세 모달 */}
        {showDetailModal && (
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="absolute inset-0 border-8 border-black"></div>
            <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col">
              <div className="px-6 py-4 border-b flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">
                  {selectedDate && `${selectedDate.getMonth() + 1}월 ${selectedDate.getDate()}일 예약`}
                </h2>
                <button
                  onClick={() => {
                    const dateStr = selectedDate ? `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}` : '';
                    router.push(`/admin/rooms?date=${dateStr}`);
                  }}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <Building2 className="w-4 h-4" />
                  객실관리
                </button>
              </div>
              
              <div className="px-6 py-4 flex-1 overflow-y-auto">
                {selectedReservations.length > 0 ? (
                  <div className="space-y-4">
                    {selectedReservations.map((reservation) => (
                      <div key={reservation.reservIdx} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">
                              {reservation.customer?.name || '고객 정보 없음'}
                            </h3>
                            <p className="text-sm text-gray-600 mt-1">
                              {reservation.room?.name || '객실 정보 없음'}
                            </p>
                          </div>
                          {getStatusBadge(reservation.status)}
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                          <div className="flex items-center gap-2 text-gray-600">
                            <Calendar className="w-4 h-4" />
                            <span>
                              체크인: {reservation.checkinDate?.split('T')[0]} 
                              → 체크아웃: {reservation.checkoutDate?.split('T')[0]}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-600">
                            <User className="w-4 h-4" />
                            <span>인원: {reservation.guest}명</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-600">
                            <CreditCard className="w-4 h-4" />
                            <span>결제금액: {reservation.totalPrice?.toLocaleString() || '0'}원</span>
                          </div>
                        </div>
                        
                        <div className="flex justify-end mt-3">
                          <button
                            onClick={() => handleReservationDetail(reservation)}
                            className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                          >
                            상세보기
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    예약이 없습니다.
                  </div>
                )}
              </div>

              <div className="px-6 py-4 border-t bg-gray-50 flex justify-end">
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    setSelectedDate(null);
                    setSelectedReservations([]);
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  닫기
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 예약 상세 모달 */}
        {showReservationDetailModal && (
          <ReservationDetailModal
            reservation={selectedReservationDetail}
            onClose={() => {
              setShowReservationDetailModal(false);
              setSelectedReservationDetail(null);
            }}
          />
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminCalendar;

