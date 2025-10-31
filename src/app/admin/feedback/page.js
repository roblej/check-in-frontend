'use client';

import AdminLayout from '@/components/admin/AdminLayout';
import { Star, CheckCircle } from 'lucide-react';

const CustomerFeedbackPage = () => {
  // 여기는 주말동안 작업할래요
  const feedbacks = [
    {
      id: 'F001',
      customerName: '김철수',
      customerId: 'C001',
      reservationId: 'R001',
      roomNumber: '301',
      rating: 5,
      feedback: '매우 만족스러운 숙박이었습니다. 직원들이 친절하고 시설이 깔끔했습니다. 다음에도 꼭 이용하고 싶습니다.',
      category: 'service',
      status: 'new',
      createdAt: '2024-01-17',
      response: null
    },
    {
      id: 'F002',
      customerName: '이영희',
      customerId: 'C002',
      reservationId: 'R002',
      roomNumber: '205',
      rating: 4,
      feedback: '전반적으로 좋았지만, 체크인 시간이 조금 늦었습니다. 객실은 깔끔하고 편안했습니다.',
      category: 'facility',
      status: 'in-progress',
      createdAt: '2024-01-16',
      response: '소중한 피드백 감사합니다. 체크인 프로세스를 개선하겠습니다.'
    },
    {
      id: 'F003',
      customerName: '박민수',
      customerId: 'C003',
      reservationId: 'R003',
      roomNumber: '102',
      rating: 3,
      feedback: '가격 대비 괜찮은 편입니다. 다만 객실이 조금 작았습니다.',
      category: 'room',
      status: 'resolved',
      createdAt: '2024-01-15',
      response: '피드백 감사합니다. 객실 크기에 대한 정보를 더 명확히 제공하겠습니다.'
    },
    {
      id: 'F004',
      customerName: '최지영',
      customerId: 'C004',
      reservationId: 'R004',
      roomNumber: '401',
      rating: 2,
      feedback: '객실 청소가 제대로 되지 않았습니다. 침대 시트에 얼룩이 있었습니다.',
      category: 'cleaning',
      status: 'urgent',
      createdAt: '2024-01-14',
      response: '심려를 끼쳐드려 죄송합니다. 즉시 청소팀에 확인하고 개선하겠습니다.'
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'new':
        return 'bg-blue-100 text-blue-800';
      case 'in-progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      case 'urgent':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'new':
        return '신규';
      case 'in-progress':
        return '처리중';
      case 'resolved':
        return '해결됨';
      case 'urgent':
        return '긴급';
      default:
        return '알 수 없음';
    }
  };

  const getCategoryText = (category) => {
    switch (category) {
      case 'service':
        return '서비스';
      case 'facility':
        return '시설';
      case 'room':
        return '객실';
      case 'cleaning':
        return '청소';
      default:
        return '기타';
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
          <h2 className="text-2xl font-bold text-gray-900">고객 피드백</h2>
          <p className="text-gray-600">고객들의 피드백을 확인하고 응답하세요</p>
        </div>

        {/* 피드백 통계 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="text-3xl mr-4">💬</div>
              <div>
                <p className="text-sm font-medium text-gray-600">총 피드백</p>
                <p className="text-2xl font-bold text-gray-900">{feedbacks.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="text-3xl mr-4">🔴</div>
              <div>
                <p className="text-sm font-medium text-gray-600">긴급</p>
                <p className="text-2xl font-bold text-gray-900">
                  {feedbacks.filter(f => f.status === 'urgent').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="text-3xl mr-4">🟡</div>
              <div>
                <p className="text-sm font-medium text-gray-600">처리중</p>
                <p className="text-2xl font-bold text-gray-900">
                  {feedbacks.filter(f => f.status === 'in-progress').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="text-green-600 mr-4"><CheckCircle size={32} /></div>
              <div>
                <p className="text-sm font-medium text-gray-600">해결됨</p>
                <p className="text-2xl font-bold text-gray-900">
                  {feedbacks.filter(f => f.status === 'resolved').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 검색 및 필터 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                피드백 검색
              </label>
              <input
                type="text"
                placeholder="고객명, 예약번호, 피드백 내용으로 검색..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent"
              />
            </div>
            
            <div className="sm:w-48">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                상태 필터
              </label>
              <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent">
                <option value="all">전체</option>
                <option value="new">신규</option>
                <option value="in-progress">처리중</option>
                <option value="resolved">해결됨</option>
                <option value="urgent">긴급</option>
              </select>
            </div>
            
            <div className="sm:w-48">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                카테고리
              </label>
              <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent">
                <option value="all">전체</option>
                <option value="service">서비스</option>
                <option value="facility">시설</option>
                <option value="room">객실</option>
                <option value="cleaning">청소</option>
              </select>
            </div>
          </div>
        </div>

        {/* 피드백 목록 */}
        <div className="space-y-4">
          {feedbacks.map((feedback) => (
            <div key={feedback.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{feedback.customerName}</h3>
                    <span className="text-sm text-gray-500">예약: {feedback.reservationId}</span>
                    <span className="text-sm text-gray-500">객실: {feedback.roomNumber}호</span>
                  </div>
                  
                  <div className="flex items-center gap-4 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">평점:</span>
                      <span className="text-sm display-flex">{getRatingStars(feedback.rating)}</span>
                    </div>
                    <span className="text-sm text-gray-500">카테고리: {getCategoryText(feedback.category)}</span>
                    <span className="text-sm text-gray-500">작성일: {feedback.createdAt}</span>
                  </div>
                </div>
                
                <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(feedback.status)}`}>
                  {getStatusText(feedback.status)}
                </span>
              </div>
              
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-900 mb-2">피드백 내용</h4>
                <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                  {feedback.feedback}
                </p>
              </div>
              
              {feedback.response && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">관리자 응답</h4>
                  <p className="text-sm text-gray-700 bg-blue-50 p-3 rounded-lg">
                    {feedback.response}
                  </p>
                </div>
              )}
              
              <div className="flex gap-2">
                <button className="bg-[#3B82F6] text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors">
                  응답하기
                </button>
                <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors">
                  상태 변경
                </button>
                <button className="bg-green-100 text-green-700 px-4 py-2 rounded-lg hover:bg-green-200 transition-colors">
                  해결 완료
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
};

export default CustomerFeedbackPage;
