'use client';

import AdminLayout from '@/components/admin/AdminLayout';

const AdminDashboard = () => {
  // 통계 데이터
  const stats = [
    {
      title: '오늘 체크인',
      value: '24',
      change: '+12%',
      changeType: 'positive',
      icon: '🏨'
    },
    {
      title: '오늘 체크아웃',
      value: '18',
      change: '+8%',
      changeType: 'positive',
      icon: '🚪'
    },
    {
      title: '예약 대기',
      value: '156',
      change: '+23%',
      changeType: 'positive',
      icon: '📅'
    },
    {
      title: '오늘 매출',
      value: '₩2,450,000',
      change: '+15%',
      changeType: 'positive',
      icon: '💰'
    }
  ];

  // 최근 예약 데이터 (축소)
  const recentReservations = [
    {
      id: 'R001',
      guestName: '김철수',
      roomType: '스위트룸',
      checkIn: '2024-01-15',
      checkOut: '2024-01-17',
      status: 'confirmed',
      amount: '₩450,000'
    },
    {
      id: 'R002',
      guestName: '이영희',
      roomType: '디럭스룸',
      checkIn: '2024-01-15',
      checkOut: '2024-01-16',
      status: 'checked-in',
      amount: '₩280,000'
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'checked-in':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'confirmed':
        return '확정';
      case 'checked-in':
        return '체크인';
      case 'pending':
        return '대기';
      default:
        return '알 수 없음';
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* 페이지 헤더 */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900">대시보드</h2>
          <p className="text-gray-600">호텔 운영 현황을 한눈에 확인하세요</p>
        </div>

        {/* 통계 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                </div>
                <div className="text-3xl">{stat.icon}</div>
              </div>
              <div className="mt-4 flex items-center">
                <span className={`text-sm font-medium ${
                  stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {stat.change}
                </span>
                <span className="text-sm text-gray-500 ml-1">전일 대비</span>
              </div>
            </div>
          ))}
        </div>

        {/* 최근 예약 현황 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">최근 예약 현황</h3>
            <p className="text-sm text-gray-600">오늘의 예약 및 체크인 현황</p>
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
                    객실타입
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    체크인
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    체크아웃
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    상태
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    금액
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    액션
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentReservations.map((reservation) => (
                  <tr key={reservation.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {reservation.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {reservation.guestName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {reservation.roomType}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {reservation.checkIn}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {reservation.checkOut}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(reservation.status)}`}>
                        {getStatusText(reservation.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {reservation.amount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button className="text-[#3B82F6] hover:text-blue-800">
                        상세보기
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 빠른 액션 버튼들 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">빠른 체크인</h3>
            <p className="text-sm text-gray-600 mb-4">예약된 고객의 체크인을 처리하세요</p>
            <button className="w-full bg-[#3B82F6] text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors">
              체크인 처리
            </button>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">새 예약 등록</h3>
            <p className="text-sm text-gray-600 mb-4">직접 예약을 등록하세요</p>
            <button className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors">
              예약 등록
            </button>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">객실 상태 관리</h3>
            <p className="text-sm text-gray-600 mb-4">객실 상태를 업데이트하세요</p>
            <button className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors">
              객실 관리
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
