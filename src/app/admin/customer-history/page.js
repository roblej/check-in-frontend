'use client';

import AdminLayout from '@/components/admin/AdminLayout';
import { Star } from 'lucide-react';

const CustomerHistoryPage = () => {
  const customerHistory = [
    {
      id: 'H001',
      customerName: '김철수',
      customerId: 'C001',
      reservationId: 'R001',
      roomNumber: '301',
      roomType: '스위트룸',
      checkIn: '2024-01-15',
      checkOut: '2024-01-17',
      nights: 2,
      amount: '₩450,000',
      status: 'completed',
      rating: 5,
      feedback: '매우 만족스러운 숙박이었습니다. 직원들이 친절하고 시설이 깔끔했습니다.'
    },
    {
      id: 'H002',
      customerName: '김철수',
      customerId: 'C001',
      reservationId: 'R002',
      roomNumber: '205',
      roomType: '디럭스룸',
      checkIn: '2023-12-20',
      checkOut: '2023-12-22',
      nights: 2,
      amount: '₩280,000',
      status: 'completed',
      rating: 4,
      feedback: '좋은 경험이었습니다. 다음에도 이용하고 싶습니다.'
    },
    {
      id: 'H003',
      customerName: '이영희',
      customerId: 'C002',
      reservationId: 'R003',
      roomNumber: '102',
      roomType: '스탠다드룸',
      checkIn: '2024-01-10',
      checkOut: '2024-01-12',
      nights: 2,
      amount: '₩320,000',
      status: 'completed',
      rating: 3,
      feedback: '보통입니다. 가격 대비 괜찮은 편입니다.'
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'no-show':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'completed':
        return '완료';
      case 'cancelled':
        return '취소';
      case 'no-show':
        return '노쇼';
      default:
        return '알 수 없음';
    }
  };

  const getRatingStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star 
        key={i} 
        className={`w-4 h-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
      />
    ));
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* 페이지 헤더 */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900">고객 이용 이력</h2>
          <p className="text-gray-600">고객들의 숙박 이력과 피드백을 확인하세요</p>
        </div>

        {/* 검색 및 필터 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                고객 검색
              </label>
              <input
                type="text"
                placeholder="고객명, 고객ID, 예약번호로 검색..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent"
              />
            </div>
            
            <div className="sm:w-48">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                상태 필터
              </label>
              <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent">
                <option value="all">전체</option>
                <option value="completed">완료</option>
                <option value="cancelled">취소</option>
                <option value="no-show">노쇼</option>
              </select>
            </div>
            
            <div className="sm:w-48">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                평점 필터
              </label>
              <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent">
                <option value="all">전체</option>
                <option value="5">5점</option>
                <option value="4">4점</option>
                <option value="3">3점</option>
                <option value="2">2점</option>
                <option value="1">1점</option>
              </select>
            </div>
          </div>
        </div>

        {/* 이용 이력 테이블 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              이용 이력 ({customerHistory.length}건)
            </h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    고객정보
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    예약정보
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    객실정보
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    숙박일정
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    금액
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    상태
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    평점/피드백
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {customerHistory.map((history) => (
                  <tr key={history.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{history.customerName}</div>
                        <div className="text-sm text-gray-500">ID: {history.customerId}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{history.reservationId}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{history.roomNumber}호</div>
                        <div className="text-sm text-gray-500">{history.roomType}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm text-gray-900">{history.checkIn}</div>
                        <div className="text-sm text-gray-500">~ {history.checkOut}</div>
                        <div className="text-xs text-gray-400">{history.nights}박</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {history.amount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(history.status)}`}>
                        {getStatusText(history.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <div className="mb-1">{getRatingStars(history.rating)}</div>
                        <div className="text-xs text-gray-600 max-w-xs truncate">
                          {history.feedback}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 고객 만족도 통계 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="text-yellow-600 mr-4"><Star size={32} /></div>
              <div>
                <p className="text-sm font-medium text-gray-600">평균 평점</p>
                <p className="text-2xl font-bold text-gray-900">
                  {(customerHistory.reduce((sum, h) => sum + h.rating, 0) / customerHistory.length).toFixed(1)}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="text-3xl mr-4">👍</div>
              <div>
                <p className="text-sm font-medium text-gray-600">만족도 높음</p>
                <p className="text-2xl font-bold text-gray-900">
                  {customerHistory.filter(h => h.rating >= 4).length}건
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="text-3xl mr-4">👎</div>
              <div>
                <p className="text-sm font-medium text-gray-600">만족도 낮음</p>
                <p className="text-2xl font-bold text-gray-900">
                  {customerHistory.filter(h => h.rating <= 2).length}건
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="text-3xl mr-4">💬</div>
              <div>
                <p className="text-sm font-medium text-gray-600">피드백 작성</p>
                <p className="text-2xl font-bold text-gray-900">
                  {customerHistory.filter(h => h.feedback).length}건
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default CustomerHistoryPage;
