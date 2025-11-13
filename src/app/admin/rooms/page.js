'use client';

import { useEffect, useState, Suspense, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import AdminLayout from '@/components/admin/AdminLayout';
import { CheckCircle, Building2, Sparkles, X, Calendar, AlertCircle } from 'lucide-react';
import axiosInstance from '@/lib/axios';

const RoomsInner = () => {
  const roomList_url = "/admin/roomList";
  const searchParams = useSearchParams();
  const router = useRouter();
  const selectedDate = searchParams.get('date') || new Date().toISOString().split('T')[0];

  const [roomStatusList, setRoomStatusList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [availableRoomCount, setAvailableRoomCount] = useState(0);
  const [totalRoomCount, setTotalRoomCount] = useState(0);

  const didFetch = useRef(false);
  const lastFetchedDateRef = useRef(null);

  useEffect(() => {
    if (didFetch.current && lastFetchedDateRef.current === selectedDate) return;
    didFetch.current = true;
    lastFetchedDateRef.current = selectedDate;
    
    fetchRoomStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate]);

  const fetchRoomStatus = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(roomList_url, {
        params: { date: selectedDate }
      });
      if (response.data.success) {
        setRoomStatusList(response.data.rooms || []);
        setAvailableRoomCount(response.data.availableRoomCount || 0);
        setTotalRoomCount(response.data.totalRoomCount || 0);
      }
    } catch (error) {
      console.error('객실 현황 조회 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (reservationStatus) => {
    switch (reservationStatus) {
      case '빈 객실':
        return 'bg-green-100 text-green-800';
      case '예약':
      case '체크인':
        return 'bg-yellow-100 text-yellow-800';
      case '사용중':
      case '체크아웃':
      case '체크인/체크아웃':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    return status || '알 수 없음';
  };

  const handleDetailClick = (room) => {
    setSelectedRoom(room);
    setShowDetailModal(true);
  };


  const handleDateChange = (newDate) => {
    // URL 쿼리 파라미터 업데이트
    const params = new URLSearchParams(searchParams.toString());
    params.set('date', newDate);
    router.push(`/admin/rooms?${params.toString()}`);
    
    // 날짜 변경 시 데이터 다시 조회를 위해 ref 초기화
    didFetch.current = false;
    lastFetchedDateRef.current = null;
  };

  return (
    <AdminLayout>
      <div className="space-y-6 p-6">
        {/* 페이지 헤더 */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-bold text-gray-900">객실 현황</h2>
              <span className="inline-flex items-center px-3 py-1 text-sm font-semibold rounded-full bg-blue-100 text-blue-800">
                <Calendar className="w-4 h-4 mr-1" />
                {selectedDate}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <label htmlFor="date-select" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                날짜 선택:
              </label>
              <input
                id="date-select"
                type="date"
                value={selectedDate}
                onChange={(e) => handleDateChange(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>
          </div>
          <p className="text-gray-600">해당 날짜 기준 객실 현황을 확인하세요</p>
        </div>

        {/* 객실 현황 통계 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center">
              <div className="text-blue-600 mr-3"><Building2 size={24} /></div>
              <div>
                <div className="text-sm text-gray-600">전체 객실</div>
                <div className="text-xl font-bold text-blue-600">{totalRoomCount}</div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center">
              <div className="text-green-600 mr-3"><CheckCircle size={24} /></div>
              <div>
                <div className="text-sm text-gray-600">빈 객실</div>
                <div className="text-xl font-bold text-green-600">{availableRoomCount}</div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center">
              <div className="text-yellow-600 mr-3"><Sparkles size={24} /></div>
              <div>
                <div className="text-sm text-gray-600">예약된 객실</div>
                <div className="text-xl font-bold text-yellow-600">{totalRoomCount - availableRoomCount}</div>
              </div>
            </div>
          </div>
        </div>

        {/* 객실 현황 그리드 */}
        {loading ? (
          <div className="flex justify-center items-center h-96">
            <div className="text-lg text-gray-600">데이터를 불러오는 중...</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {roomStatusList.map((room) => (
              <div key={`${room.roomIdx}-${room.contentId}`} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow flex flex-col">
                {/* 객실 번호 및 상태 */}
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-gray-900">{room.name}</h3>
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(room.reservationStatus)}`}>
                      {getStatusText(room.reservationStatus)}
                    </span>
                    {/* 영구 상태 표시 */}
                    {room.status === 0 && (
                      <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                        <AlertCircle className="w-3 h-3 mr-1" />
                        사용불가
                      </span>
                    )}
                  </div>
                </div>

                {/* 객실 정보 */}
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">수용인원:</span>
                    <span className="text-sm font-medium text-gray-900">{room.capacity}명</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">기본 가격:</span>
                    <span className="text-sm font-medium text-gray-900">₩{room.basePrice?.toLocaleString() || '0'}</span>
                  </div>
                </div>

                {/* 예약 정보 */}
                <div className="border-t border-gray-200 pt-3 mb-4">
                  <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg mb-2">
                    <div className="text-sm text-gray-600">
                      예약 고객: <span className="font-medium text-gray-900">
                        {room.hasReservation && room.customerName ? room.customerName : '예약없음'}
                      </span>
                    </div>
                  </div>
                  <div className="text-sm text-gray-600">
                    예약 인원: <span className="font-medium text-gray-900">
                      {room.hasReservation && room.guest ? `${room.guest}명` : '-'}
                    </span>
                  </div>
                </div>

                {/* 하단 고정 영역 (상세보기) */}
                <div className="mt-auto">
                  <button 
                    onClick={() => handleDetailClick(room)}
                    className="w-full bg-[#3B82F6] text-white py-2 px-3 rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors"
                  >
                    상세보기
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 객실 상세 정보 모달 */}
        {showDetailModal && selectedRoom && (
          <RoomDetailModal 
            room={selectedRoom}
            onClose={() => {
              setShowDetailModal(false);
              setSelectedRoom(null);
            }}
            onStatusChanged={() => {
              fetchRoomStatus();
            }}
          />
        )}
      </div>
    </AdminLayout>
  );
};

const RoomsPage = () => {
  return (
    <Suspense fallback={<div className="p-6">로딩 중...</div>}>
      <RoomsInner />
    </Suspense>
  );
};

// 객실 상세 정보 모달 컴포넌트
const RoomDetailModal = ({ room, onClose, onStatusChanged }) => {
  const [currentStatus, setCurrentStatus] = useState(room.status);
  const [isUpdating, setIsUpdating] = useState(false);

  // room이 변경될 때 상태 업데이트
  useEffect(() => {
    setCurrentStatus(room.status);
  }, [room.status]);

  const handleStatusToggle = async (newStatus) => {
    const statusText = newStatus === 1 ? '사용 가능' : '사용 불가';
    const confirmMessage = newStatus === 0 
      ? `${room.name}(${room.roomIdx}호)을(를) 영구적으로 사용 불가로 설정하시겠습니까?\n\n※ 이 설정은 모든 날짜에 적용되며, 객실 운영 상태가 변경됩니다.`
      : `${room.name}(${room.roomIdx}호)을(를) 사용 가능으로 변경하시겠습니까?`;
    
    if (!confirm(confirmMessage)) {
      return;
    }

    try {
      setIsUpdating(true);
      const response = await axiosInstance.post('/admin/roomStatus', {
        roomIdx: room.roomIdx,
        status: newStatus
      });

      if (response.data.success) {
        setCurrentStatus(newStatus);
        alert(`${room.name}의 상태가 ${statusText}로 변경되었습니다.`);
        // 부모 컴포넌트에 변경 알림
        if (onStatusChanged) {
          onStatusChanged();
        }
      } else {
        alert('상태 변경에 실패했습니다.');
      }
    } catch (error) {
      console.error('상태 변경 오류:', error);
      alert('상태 변경 중 오류가 발생했습니다.');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
      <div className="absolute inset-0 bg-opacity-50"></div>
      <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col">
        {/* 헤더 */}
        <div className="px-6 py-4 border-b flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">객실 상세 정보</h2>
            <p className="text-sm text-gray-600 mt-1">객실번호: {room.roomIdx}호</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* 본문 */}
        <div className="px-6 py-4 flex-1 overflow-y-auto">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">객실명</label>
              <div className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900">
                {room.name || '-'}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">수용인원</label>
              <div className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900">
                {room.capacity || 0}명
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">기본 가격</label>
              <div className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900">
                ₩{room.basePrice?.toLocaleString() || '0'}
              </div>
            </div>

            {/* 객실 상태 변경 */}
            <div className="border-t border-gray-200 pt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">객실 상태</label>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  {currentStatus === 1 ? (
                    <>
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span className="text-sm font-medium text-green-600">사용 가능</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-5 h-5 text-red-600" />
                      <span className="text-sm font-medium text-red-600">사용 불가</span>
                    </>
                  )}
                </div>
                <button
                  onClick={() => handleStatusToggle(currentStatus === 1 ? 0 : 1)}
                  disabled={isUpdating}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    currentStatus === 1
                      ? 'bg-red-100 text-red-700 hover:bg-red-200'
                      : 'bg-green-100 text-green-700 hover:bg-green-200'
                  } ${isUpdating ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {isUpdating ? '변경 중...' : currentStatus === 1 ? '사용 불가로 변경' : '사용 가능으로 변경'}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                객실의 영구적인 사용 가능 여부를 변경할 수 있습니다. 이 설정은 모든 날짜에 적용됩니다.
              </p>
            </div>

            {/* 예약 정보 섹션 */}
            {room.hasReservation && (
              <div className="border-t border-gray-200 pt-4 mt-4">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">예약 정보</h3>
                <div className="space-y-3">
                  {room.customerName && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">예약 고객</label>
                      <div className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900">
                        {room.customerName}
                      </div>
                    </div>
                  )}

                  {room.guest && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">예약 인원</label>
                      <div className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900">
                        {room.guest}명
                      </div>
                    </div>
                  )}

                  {room.specialRequest && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">요청사항</label>
                      <div className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 min-h-[80px] whitespace-pre-wrap">
                        {room.specialRequest}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 푸터 */}
        <div className="px-6 py-4 border-t bg-gray-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};

export default RoomsPage;
