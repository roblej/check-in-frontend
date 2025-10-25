'use client';

import AdminLayout from '@/components/admin/AdminLayout';

const RoomPricingPage = () => {
  const roomTypes = [
    {
      id: 'RT001',
      name: '스탠다드룸',
      basePrice: 150000,
      weekendPrice: 180000,
      peakPrice: 200000,
      description: '기본적인 편의시설을 갖춘 표준 객실'
    },
    {
      id: 'RT002',
      name: '디럭스룸',
      basePrice: 250000,
      weekendPrice: 300000,
      peakPrice: 350000,
      description: '넓은 공간과 추가 편의시설을 제공하는 객실'
    },
    {
      id: 'RT003',
      name: '스위트룸',
      basePrice: 400000,
      weekendPrice: 480000,
      peakPrice: 550000,
      description: '최고급 편의시설과 넓은 공간의 프리미엄 객실'
    },
    {
      id: 'RT004',
      name: '프레지덴셜룸',
      basePrice: 600000,
      weekendPrice: 720000,
      peakPrice: 800000,
      description: '최고급 서비스와 시설을 제공하는 VIP 객실'
    }
  ];

  const seasons = [
    { name: '성수기', multiplier: 1.5, months: ['7월', '8월', '12월', '1월'] },
    { name: '비수기', multiplier: 0.8, months: ['2월', '3월', '9월', '10월'] },
    { name: '준성수기', multiplier: 1.2, months: ['4월', '5월', '6월', '11월'] }
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* 페이지 헤더 */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900">객실 가격 설정</h2>
          <p className="text-gray-600">객실 타입별 가격과 시즌 요금을 관리하세요</p>
        </div>

        {/* 가격 설정 테이블 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">객실 타입별 가격</h3>
            <p className="text-sm text-gray-600">각 객실 타입의 기본 가격을 설정하세요</p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    객실 타입
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    설명
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    기본 가격
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    주말 가격
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    성수기 가격
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    액션
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {roomTypes.map((roomType) => (
                  <tr key={roomType.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{roomType.name}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-600">{roomType.description}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">₩{roomType.basePrice.toLocaleString()}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">₩{roomType.weekendPrice.toLocaleString()}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">₩{roomType.peakPrice.toLocaleString()}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button className="text-[#3B82F6] hover:text-blue-800">
                        수정
                      </button>
                      <button className="text-green-600 hover:text-green-800">
                        복사
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 시즌 요금 설정 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">시즌 요금 설정</h3>
            <p className="text-sm text-gray-600">계절별 요금 배수를 설정하세요</p>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {seasons.map((season, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">{season.name}</h4>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      요금 배수
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      defaultValue={season.multiplier}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      해당 월
                    </label>
                    <div className="text-sm text-gray-600">
                      {season.months.join(', ')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 프로모션 설정 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">프로모션 설정</h3>
            <p className="text-sm text-gray-600">특별 할인 및 프로모션을 설정하세요</p>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  조기 예약 할인 (%)
                </label>
                <input
                  type="number"
                  defaultValue="10"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">30일 전 예약시 적용</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  연박 할인 (%)
                </label>
                <input
                  type="number"
                  defaultValue="15"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">3박 이상시 적용</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  VIP 회원 할인 (%)
                </label>
                <input
                  type="number"
                  defaultValue="20"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">VIP 회원 전용</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  마지막 분 할인 (%)
                </label>
                <input
                  type="number"
                  defaultValue="25"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">당일 예약시 적용</p>
              </div>
            </div>
          </div>
        </div>

        {/* 저장 버튼 */}
        <div className="flex justify-end">
          <button className="bg-[#3B82F6] text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors">
            가격 설정 저장
          </button>
        </div>
      </div>
    </AdminLayout>
  );
};

export default RoomPricingPage;
