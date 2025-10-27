'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import axiosInstance from '@/lib/axios';

const CheckinPage = () => {
    
  const api_url = "/admin/checkinPendingList";

  const [searchTerm, setSearchTerm] = useState('');
  const [checkinList, setCheckinList] = useState([]);
  const [filteredList, setFilteredList] = useState([]);
  const [loading, setLoading] = useState(false);

  function getData(){
    axiosInstance.get(api_url).then(res => {
      console.log(res.data);
      setCheckinList(res.data.content);
    });
  }
  
  useEffect(() => {
    getData();
  }, []);



  // 검색 필터링
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredList(checkinList);
    } else {
      const filtered = checkinList.filter(reservation => 
        reservation.reservIdx.toString().includes(searchTerm) ||
        (reservation.customer?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        reservation.roomIdx.toString().includes(searchTerm)
      );
      setFilteredList(filtered);
    }
  }, [searchTerm, checkinList]);

  // 체크인 처리 (더미)
  const handleCheckin = async (reservIdx) => {
    if (!confirm('체크인을 처리하시겠습니까?')) return;
    
    // 더미 처리 - 실제로는 백엔드에서 처리
    alert(`예약번호 ${reservIdx} 체크인이 완료되었습니다.`);
    
    // 더미 데이터에서 제거
    setCheckinList(prev => prev.filter(item => item.reservIdx !== reservIdx));
  };

  // 새로고침 (더미)
  const fetchData = () => {
    setCheckinList(dummyData);
    setFilteredList(dummyData);
    alert('데이터가 새로고침되었습니다.');
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* 페이지 헤더 */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900">체크인 관리</h2>
          <p className="text-gray-600">체크인을 기다리는 고객들의 체크인을 처리하세요</p>
        </div>

        {/* 검색 및 새로고침 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex gap-4 items-center">
            <div className="flex-1">
              <input
                type="text"
                placeholder="예약번호, 고객명, 객실번호로 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <button
              onClick={fetchData}
              className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
            >
              새로고침
            </button>
          </div>
        </div>

        {/* 체크인 목록 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">체크인 대기 목록</h3>
            <p className="text-sm text-gray-600">
              총 {checkinList.length}건의 체크인 대기 예약이 있습니다.
            </p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    예약번호
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    고객명
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    연락처
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    객실번호
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    체크인 예정일
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    투숙객 수
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    액션
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                      로딩 중...
                    </td>
                  </tr>
                ) : filteredList.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                      {searchTerm ? '검색 결과가 없습니다.' : '체크인 대기 중인 예약이 없습니다.'}
                    </td>
                  </tr>
                ) : (
                  filteredList.map((reservation) => (
                    <tr key={reservation.reservIdx} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {reservation.reservIdx}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {reservation.customer?.name || '정보 없음'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {reservation.customer?.phone || '정보 없음'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {reservation.roomIdx}호
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {reservation.checkinDate}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {reservation.guest}명
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button 
                          onClick={() => handleCheckin(reservation.reservIdx)}
                          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                        >
                          체크인 처리
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default CheckinPage;
