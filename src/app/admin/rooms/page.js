'use client';

import { useEffect, useState, Suspense, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import AdminLayout from '@/components/admin/AdminLayout';
import { CheckCircle, Building2, Sparkles, Wrench, HelpCircle, Home, DollarSign, X, Eye, Calendar } from 'lucide-react';
import axiosInstance from '@/lib/axios';

  const roomUpdate_url = "/admin/roomUpdate";
  const roomStatus_url = "/admin/roomStatus";

const RoomsInner = () => {
  const router = useRouter();
  const roomList_url = "/admin/roomList";
  const searchParams = useSearchParams();
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

  const handleManageClick = (room) => {
    // TODO: 관리 모달 구현
    alert('관리 기능은 추후 구현 예정입니다.');
  };

  return (
    <AdminLayout>
      <div className="space-y-6 p-6">
        {/* 페이지 헤더 */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <h2 className="text-2xl font-bold text-gray-900">객실 현황</h2>
            <span className="inline-flex items-center px-3 py-1 text-sm font-semibold rounded-full bg-blue-100 text-blue-800">
              <Calendar className="w-4 h-4 mr-1" />
              {selectedDate}
            </span>
          </div>
          <p className="text-gray-600">해당 날짜 기준 객실 현황을 확인하세요</p>
        </div>

        {/* 객실 현황 통계 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center">
              <div className="text-gray-600 mr-3"><Building2 size={24} /></div>
              <div>
                <div className="text-sm text-gray-600">예약률</div>
                <div className="text-xl font-bold text-gray-600">
                  {totalRoomCount > 0 ? Math.round(((totalRoomCount - availableRoomCount) / totalRoomCount) * 100) : 0}%
                </div>
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
              <div key={`${room.roomIdx}-${room.contentId}`} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
                {/* 객실 번호 및 상태 */}
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-gray-900">{room.name}</h3>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(room.reservationStatus)}`}>
                    {getStatusText(room.reservationStatus)}
                  </span>
                </div>

                {/* 객실 정보 */}
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">객실 번호:</span>
                    <span className="text-sm font-medium text-gray-900">{room.roomIdx}호</span>
                  </div>
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
                {room.hasReservation && room.customerName && (
                  <div className="border-t border-gray-200 pt-3 mb-4">
                    <div className="text-sm text-gray-600 mb-1">예약 고객</div>
                    <div className="text-sm font-medium text-gray-900">{room.customerName}</div>
                  </div>
                )}

                {/* 액션 버튼들 */}
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleDetailClick(room)}
                    className="flex-1 bg-[#3B82F6] text-white py-2 px-3 rounded text-sm hover:bg-blue-600 transition-colors"
                  >
                    상세보기
                  </button>
                  <button 
                    onClick={() => handleManageClick(room)}
                    className="flex-1 bg-gray-600 text-white py-2 px-3 rounded text-sm hover:bg-gray-700 transition-colors"
                  >
                    관리
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
            onUpdate={fetchRoomStatus}
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
const RoomDetailModal = ({ room, onClose, onUpdate }) => {
  const [roomData, setRoomData] = useState({
    roomIdx: room.roomIdx || 0,
    name: room.name || '',
    capacity: room.capacity || 0,
    basePrice: room.basePrice || 0,
    // TODO: 추후 다른 필드들도 추가
  });

  const handleSubmit = async () => {
    // TODO: 객실 수정 API 호출
    console.log('객실 수정:', roomData);
    alert('객실 정보를 수정 하시겠습니까?');
    try {
      const response = await axiosInstance.post(roomUpdate_url, roomData);
      if (response.data.success) {
        alert('객실 정보가 수정되었습니다.');
        onUpdate();
        onClose();
      }
    } catch (error) {
      console.error('객실 수정 오류:', error);
    }
  };

  const handleDeactivate = async () => {
    // TODO: 객실 비활성화 API 호출
    console.log('객실 비활성화:', room.roomIdx, room.contentId);
    alert('해당 객실을 비활성화 처리 하겠습니까?');
    try {
      const response = await axiosInstance.post(roomStatus_url, {
        roomIdx: room.roomIdx,
        status: 0
      });
      if (response.data.success) {
        alert('객실 비활성화 처리가 완료되었습니다.');
        onUpdate();
      }
    } catch (error) {
      console.error('객실 비활성화 오류:', error);
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
              <input
                type="text"
                value={roomData.name}
                onChange={(e) => setRoomData({...roomData, name: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">수용인원</label>
              <input
                type="number"
                value={roomData.capacity}
                onChange={(e) => setRoomData({...roomData, capacity: parseInt(e.target.value) || 0})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">기본 가격</label>
              <input
                type="number"
                value={roomData.basePrice}
                onChange={(e) => setRoomData({...roomData, basePrice: parseInt(e.target.value) || 0})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* TODO: 추후 다른 필드들 추가 */}
          </div>
        </div>

        {/* 푸터 */}
        <div className="px-6 py-4 border-t bg-gray-50 flex justify-end gap-3">
          <button
            onClick={handleDeactivate}
            className="px-4 py-2 text-sm font-medium text-red-600 bg-white border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
          >
            비활성화
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            취소
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
          >
            수정
          </button>
        </div>
      </div>
    </div>
  );
};

export default RoomsPage;
