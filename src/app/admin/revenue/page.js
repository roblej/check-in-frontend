'use client';

import AdminLayout from '@/components/admin/AdminLayout';

const RevenuePage = () => {
  const revenueData = [
    { month: '1월', revenue: '₩45,200,000', bookings: 156, occupancy: '78%' },
    { month: '2월', revenue: '₩52,800,000', bookings: 189, occupancy: '85%' },
    { month: '3월', revenue: '₩48,600,000', bookings: 172, occupancy: '82%' },
    { month: '4월', revenue: '₩61,400,000', bookings: 201, occupancy: '91%' },
    { month: '5월', revenue: '₩58,900,000', bookings: 195, occupancy: '88%' },
    { month: '6월', revenue: '₩67,200,000', bookings: 223, occupancy: '94%' }
  ];

  const todayStats = {
    revenue: '₩2,450,000',
    bookings: 24,
    occupancy: '89%',
    averageRate: '₩102,083'
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* 페이지 헤더 */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900">매출 관리</h2>
          <p className="text-gray-600">매출 현황과 수익 분석을 확인하세요</p>
        </div>

        {/* 오늘의 매출 통계 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="text-3xl mr-4">💰</div>
              <div>
                <p className="text-sm font-medium text-gray-600">오늘 매출</p>
                <p className="text-2xl font-bold text-gray-900">{todayStats.revenue}</p>
                <p className="text-xs text-green-600">+15% 전일 대비</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="text-3xl mr-4">📅</div>
              <div>
                <p className="text-sm font-medium text-gray-600">오늘 예약</p>
                <p className="text-2xl font-bold text-gray-900">{todayStats.bookings}</p>
                <p className="text-xs text-green-600">+8% 전일 대비</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="text-3xl mr-4">🏨</div>
              <div>
                <p className="text-sm font-medium text-gray-600">투숙률</p>
                <p className="text-2xl font-bold text-gray-900">{todayStats.occupancy}</p>
                <p className="text-xs text-green-600">+3% 전일 대비</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="text-3xl mr-4">📊</div>
              <div>
                <p className="text-sm font-medium text-gray-600">평균 객실료</p>
                <p className="text-2xl font-bold text-gray-900">{todayStats.averageRate}</p>
                <p className="text-xs text-green-600">+5% 전일 대비</p>
              </div>
            </div>
          </div>
        </div>

        {/* 월별 매출 현황 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">월별 매출 현황</h3>
            <p className="text-sm text-gray-600">최근 6개월간의 매출 데이터</p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    월
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    매출액
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    예약건수
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    투숙률
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    평균 객실료
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    전월 대비
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {revenueData.map((data, index) => {
                  const prevMonth = index > 0 ? revenueData[index - 1] : null;
                  const change = prevMonth ? 
                    ((parseInt(data.revenue.replace(/[^\d]/g, '')) - parseInt(prevMonth.revenue.replace(/[^\d]/g, ''))) / parseInt(prevMonth.revenue.replace(/[^\d]/g, '')) * 100) : 0;
                  
                  return (
                    <tr key={data.month} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {data.month}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {data.revenue}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {data.bookings}건
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {data.occupancy}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ₩{Math.round(parseInt(data.revenue.replace(/[^\d]/g, '')) / data.bookings).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {change >= 0 ? '+' : ''}{change.toFixed(1)}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* 매출 분석 차트 영역 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">매출 추이</h3>
            <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
              <p className="text-gray-500">차트 영역 (Chart.js 또는 다른 차트 라이브러리 사용)</p>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">객실 타입별 매출</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">스위트룸</span>
                <div className="flex items-center">
                  <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                    <div className="bg-blue-600 h-2 rounded-full" style={{width: '45%'}}></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900">45%</span>
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">디럭스룸</span>
                <div className="flex items-center">
                  <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                    <div className="bg-green-600 h-2 rounded-full" style={{width: '35%'}}></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900">35%</span>
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">스탠다드룸</span>
                <div className="flex items-center">
                  <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                    <div className="bg-yellow-600 h-2 rounded-full" style={{width: '20%'}}></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900">20%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default RevenuePage;
