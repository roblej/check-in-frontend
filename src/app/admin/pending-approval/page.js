'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCustomerStore } from '@/stores/customerStore';
import { useAdminStore } from '@/stores/adminStore';
import { deleteAdminIdxCookie } from '@/utils/cookieUtils';
import axiosInstance from '@/lib/axios';
import { Clock, Building2, CheckCircle, XCircle } from 'lucide-react';

const PendingApprovalPage = () => {
  const router = useRouter();
  const { isInlogged, resetAccessToken, setInlogged } = useCustomerStore();
  const { resetAdminData } = useAdminStore();
  const [registrationInfo, setRegistrationInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // 로그아웃 후 로그인 화면으로 이동
  const handleLogout = () => {
    // 고객 스토어 초기화
    resetAccessToken();
    setInlogged(false);
    
    // 관리자 스토어 초기화
    resetAdminData();
    
    // adminIdx 쿠키 삭제
    deleteAdminIdxCookie();
    
    console.log("로그아웃 완료");
    router.push('/admin-login');
  };

  useEffect(() => {
    // 로그인 상태 확인
    if (!isInlogged()) {
      router.push('/admin-login');
      return;
    }

    // 승인 대기 중인 요청 정보 조회
    const fetchPendingRequest = async () => {
      try {
        const response = await axiosInstance.get('/admin/pendingRegistration');
        if (response.data.success && response.data.hasPendingRequest) {
          setRegistrationInfo({
            registrationIdx: response.data.registrationIdx,
            regiDate: response.data.regiDate,
            status: response.data.status
          });
        }
      } catch (error) {
        console.error('승인 대기 요청 조회 실패:', error);
        // 에러 발생 시에도 화면은 표시 (이미 승인되었을 수도 있음)
      } finally {
        setIsLoading(false);
      }
    };

    fetchPendingRequest();
  }, [isInlogged, router]);

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full">
        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* 헤더 */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center">
                <Clock className="w-10 h-10 text-yellow-600" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              호텔 등록 승인 대기 중
            </h1>
            <p className="text-gray-600">
              호텔 등록 요청이 접수되었습니다. 관리자 검토 후 승인됩니다.
            </p>
          </div>

          {/* 상태 정보 */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <Building2 className="w-6 h-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-semibold text-blue-900 mb-2">
                  승인 대기 중
                </h2>
                <p className="text-sm text-blue-700 mb-4">
                  호텔 등록 요청이 정상적으로 접수되었습니다. 관리자가 검토한 후 승인 처리됩니다.
                </p>
                {registrationInfo && (
                  <div className="space-y-2 text-sm text-blue-800">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">요청 번호:</span>
                      <span>#{registrationInfo.registrationIdx}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">요청 일시:</span>
                      <span>{formatDate(registrationInfo.regiDate)}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 안내 사항 */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              안내 사항
            </h3>
            <ul className="space-y-3 text-gray-600">
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <span>승인 완료 시 이메일 또는 알림으로 안내드립니다.</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <span>승인 완료 후 호텔 관리 시스템을 이용하실 수 있습니다.</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <span>승인까지 보통 1-2일 정도 소요됩니다.</span>
              </li>
              <li className="flex items-start gap-3">
                <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <span>거절된 경우 거절 사유와 함께 안내드립니다.</span>
              </li>
            </ul>
          </div>

          {/* 버튼 */}
          <div className="mt-8 flex justify-center gap-4">
            <button
              onClick={() => router.push('/hotel/register')}
              className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              등록 정보 수정
            </button>
            <button
              onClick={handleLogout}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              로그아웃 후 로그인화면 이동
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PendingApprovalPage;

