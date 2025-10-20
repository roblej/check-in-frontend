'use client';

import { useEffect, useState } from 'react';
import MasterLayout from '@/components/master/MasterLayout';
import { CheckCircle, Eye, X } from 'lucide-react';
import axios from 'axios';

const HotelApproval = () => {

  const api_url = "/api/master/hotelApproval";

  const [hotelRequestList, setHotelRequestList] = useState([]);
  const [hotelRequestCount, setHotelRequestCount] = useState(0);
  const [selectedRequests, setSelectedRequests] = useState([]);

  function getData(){
    axios.get(api_url).then(res => {
        setHotelRequestList(res.data.content);
        setHotelRequestCount(res.data.content.length);
    });
  }

  useEffect(() => {
    getData();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'review':
        return 'bg-blue-100 text-blue-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending':
        return '승인 대기';
      case 'review':
        return '검토중';
      case 'approved':
        return '승인됨';
      case 'rejected':
        return '거부됨';
      default:
        return '알 수 없음';
    }
  };

  return (
    <MasterLayout>
      <div className="space-y-6">
        {/* 페이지 헤더 */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900">호텔 승인 관리</h2>
          <p className="text-gray-600">새로 등록 요청한 호텔을 검토하고 승인하세요</p>
        </div>

        {/* 통계 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="text-3xl mr-4">⏳</div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  
                </p>
                <p className="text-sm text-gray-600">승인 대기</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="text-blue-600 mr-4"><Eye size={32} /></div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  
                </p>
                <p className="text-sm text-gray-600">검토중</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="text-green-600 mr-4"><CheckCircle size={32} /></div>
              <div>
                <p className="text-2xl font-bold text-gray-900">24</p>
                <p className="text-sm text-gray-600">이번 달 승인</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="text-red-600 mr-4"><X size={32} /></div>
              <div>
                <p className="text-2xl font-bold text-gray-900">3</p>
                <p className="text-sm text-gray-600">이번 달 거부</p>
              </div>
            </div>
          </div>
        </div>

        {/* 일괄 작업 버튼 */}
        {selectedRequests.length > 0 && (
          <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
            <div className="flex items-center justify-between">
              <span className="text-sm text-purple-700">
                {selectedRequests.length}개 요청이 선택됨
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => handleBulkApproval('approve')}
                  className="px-4 py-2 text-sm bg-green-600 text-white rounded hover:bg-green-700"
                >
                  일괄 승인
                </button>
                <button
                  onClick={() => handleBulkApproval('reject')}
                  className="px-4 py-2 text-sm bg-red-600 text-white rounded hover:bg-red-700"
                >
                  일괄 거부
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 승인 요청 목록 */}
        <div className="space-y-4">
          {hotelRequestList.map((request) => (
            <div key={request.registrationIdx} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={selectedRequests.includes(request.registrationIdx)}
                    onChange={() => handleSelectRequest(request.registrationIdx)}
                    className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                  />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{request.hotelInfo.title}</h3>
                    <p className="text-sm text-gray-600">{request.hotelInfo.adress}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(request.status)}`}>
                    {getStatusText(request.status)}
                  </span>
                  <span className="text-sm text-gray-500">{request.regiDate}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 기본 정보 */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">기본 정보</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">사업자명:</span>
                      <span className="text-gray-900">{request.admin.adminName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">이메일:</span>
                      <span className="text-gray-900">{request.admin.adminEmail}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">전화번호:</span>
                      <span className="text-gray-900">{request.admin.adminPhone}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">사업자번호:</span>
                      <span className="text-gray-900">아무번호</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">객실 수:</span>
                      <span className="text-gray-900">{request.hotelInfo.rooms}개</span>
                    </div>
                  </div>
                </div>

                {/* 제출 서류 및 설명
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">제출 서류</h4>
                  <div className="space-y-2 mb-4">
                    {request.documents.map((doc, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        <span className="text-green-600">✓</span>
                        <span className="text-gray-900">{doc}</span>
                        <button className="text-blue-600 hover:text-blue-800 ml-auto">
                          보기
                        </button>
                      </div>
                    ))}
                  </div>
                  
                  <h4 className="font-medium text-gray-900 mb-2">사업 설명</h4>
                  <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded">
                    {request.description}
                  </p>
                </div> */}
              </div>

              {/* 액션 버튼 */}
              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
                <button className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800">
                  상세보기
                </button>
                <button className="px-4 py-2 text-sm text-blue-600 hover:text-blue-800">
                  메시지 전송
                </button>
                <button 
                  onClick={() => handleApproval(request.id, 'reject')}
                  className="px-4 py-2 text-sm bg-red-600 text-white rounded hover:bg-red-700"
                >
                  거부
                </button>
                <button 
                  onClick={() => handleApproval(request.id, 'approve')}
                  className="px-4 py-2 text-sm bg-green-600 text-white rounded hover:bg-green-700"
                >
                  승인
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </MasterLayout>
  );
};

export default HotelApproval;
