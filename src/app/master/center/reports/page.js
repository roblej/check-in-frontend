'use client';

import { useState, useEffect } from 'react';
import MasterLayout from '@/components/master/MasterLayout';
import { AlertTriangle, Clock, CheckCircle, AlertCircle, X } from 'lucide-react';
import axiosInstance from '@/lib/axios';
import { hotelAPI } from '@/lib/api/hotel';
import { getFocusSection } from '@/constants/reportMapping';
import HotelInfoView from '@/components/master/reports/HotelInfoView';

export default function ReportListPage() {
  const [reports, setReports] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  
  // 실제 필터링에 사용되는 상태 (검색 버튼 클릭시 업데이트)
  const [activeSearchTerm, setActiveSearchTerm] = useState('');
  const [activeStatusFilter, setActiveStatusFilter] = useState('all');
  const [activeCategoryFilter, setActiveCategoryFilter] = useState('all');
  const [activePriorityFilter, setActivePriorityFilter] = useState('all');
  
  // 모달 상태
  const [selectedReport, setSelectedReport] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [activeTab, setActiveTab] = useState('report'); // 'report' | 'hotel'
  
  // 호텔 정보 상태
  const [hotelInfo, setHotelInfo] = useState(null);
  const [hotelLoading, setHotelLoading] = useState(false);
  const [focusInfo, setFocusInfo] = useState(null);
  
  // 신고 누적 정보 상태
  const [reportStats, setReportStats] = useState(null);
  const [previousReports, setPreviousReports] = useState([]);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      // 백엔드 API 호출 - 신고 카테고리만 조회
      const response = await fetch('/api/center/posts/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mainCategory: '신고',
          page: 0,
          size: 1000,
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        // 백엔드 데이터를 프론트엔드 형식으로 변환
        const convertedReports = (data.content || []).map(item => ({
          id: item.centerIdx,
          username: item.customerIdx ? `고객${item.customerIdx}` : '관리자',
          email: item.customerIdx ? `customer${item.customerIdx}@test.com` : 'admin@test.com',
          title: item.title,
          content: item.content,
          contentId: item.contentId, // 호텔 ID
          status: item.status === 0 ? 'pending' : item.status === 1 ? 'in_progress' : 'completed',
          category: item.subCategory || '기타',
          priority: item.priority === 0 ? 'low' : item.priority === 1 ? 'medium' : 'high',
          createdAt: item.createdAt ? new Date(item.createdAt).toLocaleString('ko-KR') : '',
          answeredAt: item.status === 2 ? item.updatedAt : null,
          assignedTo: item.adminIdx ? `관리자${item.adminIdx}` : '미배정',
        }));
        setReports(convertedReports);
      } else {
        setReports([]);
      }
    } catch (error) {
      console.error('신고 조회 실패:', error);
      setReports([]);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-red-100 text-red-800';
      case 'in_progress':
        return 'bg-red-200 text-red-900';
      case 'pending':
        return 'bg-red-300 text-red-900';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'completed':
        return '처리 완료';
      case 'in_progress':
        return '처리중';
      case 'pending':
        return '대기중';
      default:
        return '알 수 없음';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'in_progress':
        return <Clock className="w-4 h-4" />;
      case 'pending':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <AlertTriangle className="w-4 h-4" />;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'bg-red-600 text-white';
      case 'medium':
        return 'bg-red-400 text-white';
      case 'low':
        return 'bg-red-200 text-red-900';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityText = (priority) => {
    switch (priority) {
      case 'high':
        return '높음';
      case 'medium':
        return '보통';
      case 'low':
        return '낮음';
      default:
        return '알 수 없음';
    }
  };

  const filteredReports = reports.filter(report => {
    const matchesSearch = report.username.toLowerCase().includes(activeSearchTerm.toLowerCase()) ||
                         report.email.toLowerCase().includes(activeSearchTerm.toLowerCase()) ||
                         report.title.toLowerCase().includes(activeSearchTerm.toLowerCase()) ||
                         (report.contentId && report.contentId.toLowerCase().includes(activeSearchTerm.toLowerCase()));
    const matchesStatus = activeStatusFilter === 'all' || report.status === activeStatusFilter;
    const matchesCategory = activeCategoryFilter === 'all' || report.category === activeCategoryFilter;
    const matchesPriority = activePriorityFilter === 'all' || report.priority === activePriorityFilter;
    return matchesSearch && matchesStatus && matchesCategory && matchesPriority;
  });

  // 검색 버튼 클릭 핸들러
  const handleSearch = () => {
    setActiveSearchTerm(searchTerm);
    setActiveStatusFilter(statusFilter);
    setActiveCategoryFilter(categoryFilter);
    setActivePriorityFilter(priorityFilter);
  };

  // 필터 초기화 핸들러
  const handleResetFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setCategoryFilter('all');
    setPriorityFilter('all');
    setActiveSearchTerm('');
    setActiveStatusFilter('all');
    setActiveCategoryFilter('all');
    setActivePriorityFilter('all');
  };

  // 모달 열기
  const handleViewReport = async (reportId) => {
    const report = reports.find(r => r.id === reportId);
    setSelectedReport(report);
    setIsModalOpen(true);
    setReplyText('');
    setActiveTab('report');
    setHotelInfo(null);
    setFocusInfo(null);
    setReportStats(null);
    setPreviousReports([]);
    
    // 신고가 호텔 관련이고 contentId가 있으면 호텔 정보 및 신고 통계 미리 로드
    if (report && report.contentId) {
      // 기본 포커스 정보 계산 (객실명 없이)
      const initialFocus = getFocusSection({
        category: report.category,
        content: report.content
      });
      setFocusInfo(initialFocus);
      
      // 호텔 정보 및 신고 통계 병렬 로드
      Promise.all([
        loadHotelInfo(report.contentId, report),
        loadReportStats(report.contentId, reportId)
      ]);
    }
  };
  
  // 호텔 정보 로드
  const loadHotelInfo = async (contentId, report) => {
    if (!contentId) return;
    
    try {
      setHotelLoading(true);
      
      // 병렬로 호텔 정보, 객실 정보, 호텔 이미지 로드
      const [hotelResponse, roomsResponse, hotelImagesResponse] = await Promise.all([
        hotelAPI.getHotelDetail(contentId).catch(err => {
          console.error('호텔 기본 정보 로드 실패:', err);
          return null;
        }),
        hotelAPI.getHotelRooms(contentId).catch(err => {
          console.error('객실 정보 로드 실패:', err);
          return [];
        }),
        axiosInstance.get(`/hotels/${contentId}/images`).catch(err => {
          console.error('호텔 이미지 로드 실패:', err);
          return { data: [] };
        })
      ]);
      
      // 호텔 기본 정보
      const hotelData = hotelResponse?.data || hotelResponse;
      if (!hotelData) {
        setHotelInfo(null);
        return;
      }
      
      // 객실 정보
      const rooms = roomsResponse?.data || roomsResponse || [];
      
      // 호텔 이미지
      const hotelImages = hotelImagesResponse?.data || [];
      
      // 각 객실의 이미지도 로드
      const roomsWithImages = await Promise.all(
        rooms.map(async (room) => {
          let roomImages = [];
          if (room.roomIdx) {
            try {
              const roomImagesResponse = await hotelAPI.getRoomImages(contentId, room.roomIdx);
              roomImages = roomImagesResponse?.data || roomImagesResponse || [];
            } catch (err) {
              console.error(`객실 ${room.roomIdx} 이미지 로드 실패:`, err);
            }
          }
          
          // imageUrl이 있으면 배열에 추가
          if (room.imageUrl && roomImages.length === 0) {
            roomImages = [{ imageUrl: room.imageUrl }];
          }
          
          return {
            roomIdx: room.roomIdx,
            name: room.name,
            price: room.basePrice || room.price,
            bedType: room.bedType,
            maxOccupancy: room.capacity || room.maxOccupancy,
            images: roomImages.map(img => ({
              imageUrl: img.originUrl || img.smallUrl || img.imageUrl || img
            }))
          };
        })
      );
      
      const hotelInfoData = {
        title: hotelData.title,
        adress: hotelData.adress,
        tel: hotelData.tel || '-',
        imageUrl: hotelData.imageUrl,
        images: hotelImages.map(img => ({
          originUrl: img.originUrl,
          smallUrl: img.smallUrl
        })),
        rooms: roomsWithImages
      };
      
      setHotelInfo(hotelInfoData);
      
      // 호텔 정보 로드 완료 후 포커스 정보 재계산 (객실명 포함)
      if (report) {
        const roomNames = roomsWithImages.map(room => room.name).filter(Boolean);
        const focus = getFocusSection({
          category: report.category,
          content: report.content
        }, roomNames);
        setFocusInfo(focus);
      }
    } catch (error) {
      console.error('호텔 정보 로드 실패:', error);
      setHotelInfo(null);
    } finally {
      setHotelLoading(false);
    }
  };
  
  // 신고 통계 및 이전 신고 내역 로드
  const loadReportStats = async (contentId, currentReportId) => {
    if (!contentId) return;
    
    try {
      // 해당 호텔의 모든 신고 조회
      const response = await axiosInstance.post('/center/posts/search', {
        mainCategory: '신고',
        contentId: contentId,
        page: 0,
        size: 1000,
      });
      
      const data = response.data;
      const allReports = (data.content || []).map(item => ({
        id: item.centerIdx,
        title: item.title,
        category: item.subCategory || '기타',
        createdAt: item.createdAt ? new Date(item.createdAt).toLocaleString('ko-KR') : '',
        status: item.status === 0 ? 'pending' : item.status === 1 ? 'in_progress' : 'completed'
      }));
      
      // 현재 신고 제외한 이전 신고들
      const previous = allReports.filter(r => r.id !== currentReportId);
      
      // 통계 계산
      const stats = {
        totalCount: allReports.length,
        previousCount: previous.length,
        pendingCount: previous.filter(r => r.status === 'pending').length,
        completedCount: previous.filter(r => r.status === 'completed').length,
        categoryCounts: previous.reduce((acc, r) => {
          acc[r.category] = (acc[r.category] || 0) + 1;
          return acc;
        }, {})
      };
      
      setReportStats(stats);
      setPreviousReports(previous);
    } catch (error) {
      console.error('신고 통계 로드 실패:', error);
    }
  };
  
  // 탭 변경 핸들러
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    
    // 호텔 정보 탭으로 전환 시 호텔 정보 로드
    if (tab === 'hotel' && selectedReport?.contentId && !hotelInfo) {
      loadHotelInfo(selectedReport.contentId, selectedReport);
    }
  };

  // 모달 닫기
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedReport(null);
    setReplyText('');
    setActiveTab('report');
    setHotelInfo(null);
    setFocusInfo(null);
  };

  // 답변 전송
  const handleSendReply = async () => {
    if (!replyText.trim()) {
      alert('답변 내용을 입력해주세요.');
      return;
    }
    
    if (!selectedReport) {
      alert('신고 정보를 찾을 수 없습니다.');
      return;
    }
    
    try {
      const response = await axiosInstance.post(`/master/inquiry/${selectedReport.id}/answer`, {
        content: replyText.trim()
      });
      
      if (response.data.success) {
        alert('답변이 성공적으로 전송되었습니다.');
        
        // 신고 상태를 완료로 변경
        setReports(prev => prev.map(report => 
          report.id === selectedReport.id 
            ? { ...report, status: 'completed', answeredAt: new Date().toLocaleString('ko-KR') }
            : report
        ));
        
        // 목록 새로고침
        await fetchReports();
        
        handleCloseModal();
      } else {
        alert(response.data.message || '답변 전송에 실패했습니다.');
      }
    } catch (error) {
      console.error('답변 전송 오류:', error);
      alert(error.response?.data?.message || '답변 전송 중 오류가 발생했습니다.');
    }
  };

  // 통계 계산
  const totalReports = reports.length;
  const completedReports = reports.filter(r => r.status === 'completed').length;
  const pendingReports = reports.filter(r => r.status === 'pending').length;
  const inProgressReports = reports.filter(r => r.status === 'in_progress').length;
  const highPriorityReports = reports.filter(r => r.priority === 'high').length;

  return (
    <MasterLayout>
      <div className="space-y-6">
        {/* 페이지 헤더 */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">신고 관리</h2>
            <p className="text-gray-600">회원들의 호텔 신고를 관리하고 처리하세요</p>
          </div>
        </div>

        {/* 통계 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-gray-900">{totalReports}</div>
                <div className="text-sm text-gray-600">전체 신고</div>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-red-600">{completedReports}</div>
                <div className="text-sm text-gray-600">처리 완료</div>
              </div>
              <CheckCircle className="w-8 h-8 text-red-600" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-blue-600">{inProgressReports}</div>
                <div className="text-sm text-gray-600">처리중</div>
              </div>
              <Clock className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-green-600">{pendingReports}</div>
                <div className="text-sm text-gray-600">대기중</div>
              </div>
              <AlertCircle className="w-8 h-8 text-green-600" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-red-600">{highPriorityReports}</div>
                <div className="text-sm text-gray-600">긴급 신고</div>
              </div>
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
          </div>
        </div>

        {/* 검색 및 필터 */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="md:col-span-2">
                <input
                  type="text"
                  placeholder="회원명, 이메일, 제목, 호텔 ID로 검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>
              <div>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                >
                  <option value="all">모든 카테고리</option>
                  <option value="부정확한 정보 제공">부정확한 정보 제공</option>
                  <option value="서비스 불만">서비스 불만</option>
                  <option value="청결 문제">청결 문제</option>
                  <option value="시설 문제">시설 문제</option>
                  <option value="기타">기타</option>
                </select>
              </div>
              <div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                >
                  <option value="all">모든 상태</option>
                  <option value="pending">대기중</option>
                  <option value="in_progress">처리중</option>
                  <option value="completed">처리 완료</option>
                </select>
              </div>
              <div>
                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                >
                  <option value="all">모든 우선순위</option>
                  <option value="high">높음</option>
                  <option value="medium">보통</option>
                  <option value="low">낮음</option>
                </select>
              </div>
            </div>
            
            {/* 검색 버튼 영역 */}
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-600">
                {activeSearchTerm || activeCategoryFilter !== 'all' || activeStatusFilter !== 'all' || activePriorityFilter !== 'all' ? (
                  <span>
                    검색 조건:
                    {activeSearchTerm && <span className="ml-1 px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">&quot;{activeSearchTerm}&quot;</span>}
                    {activeCategoryFilter !== 'all' && <span className="ml-1 px-2 py-1 bg-green-100 text-green-800 rounded text-xs">카테고리: {activeCategoryFilter}</span>}
                    {activeStatusFilter !== 'all' && <span className="ml-1 px-2 py-1 bg-red-100 text-red-800 rounded text-xs">상태: {getStatusText(activeStatusFilter)}</span>}
                    {activePriorityFilter !== 'all' && <span className="ml-1 px-2 py-1 bg-red-100 text-red-800 rounded text-xs">우선순위: {getPriorityText(activePriorityFilter)}</span>}
                  </span>
                ) : (
                  <span>전체 신고를 표시하고 있습니다.</span>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleSearch}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                >
                  검색
                </button>
                <button
                  onClick={handleResetFilters}
                  className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                >
                  초기화
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 신고 목록 테이블 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    신고 정보
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    회원 정보
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    호텔 ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    분류/우선순위
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    상태/담당자
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    작성일시
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredReports.map((report) => (
                  <tr key={report.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{report.title}</div>
                        <div className="text-sm text-gray-500 truncate max-w-xs">{report.content}</div>
                        <div className="text-xs text-gray-400 mt-1">{report.category}</div>
                        <button 
                          onClick={() => handleViewReport(report.id)}
                          className="text-red-600 hover:text-red-800 text-xs mt-1"
                        >
                          상세보기
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{report.username}</div>
                        <div className="text-sm text-gray-500">{report.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{report.contentId || '-'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(report.priority)}`}>
                          {getPriorityText(report.priority)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1">
                          {getStatusIcon(report.status)}
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(report.status)}`}>
                            {getStatusText(report.status)}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500">담당: {report.assignedTo}</div>
                        {report.answeredAt && (
                          <div className="text-xs text-gray-400">답변: {report.answeredAt}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{report.createdAt}</div>
                    </td>
                  </tr>
                ))}
                {filteredReports.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-gray-400 text-center">
                      조건에 맞는 신고가 없습니다.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* 상세보기 모달 */}
        {isModalOpen && selectedReport && (
          <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full mx-4 max-h-[90vh] overflow-hidden">
              {/* 모달 헤더 */}
              <div className="flex justify-between items-start p-6 border-b border-gray-200">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">{selectedReport.title}</h3>
                  <p className="text-sm text-gray-600">{selectedReport.username} • {selectedReport.email}</p>
                  {selectedReport.contentId && (
                    <p className="text-sm text-gray-500 mt-1">호텔 ID: {selectedReport.contentId}</p>
                  )}
                  
                  {/* 신고 누적 통계 */}
                  {reportStats && (
                    <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex items-center gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">총 신고 횟수: </span>
                          <span className={`font-bold ${
                            reportStats.totalCount >= 10 ? 'text-red-600' :
                            reportStats.totalCount >= 5 ? 'text-orange-600' :
                            'text-gray-900'
                          }`}>
                            {reportStats.totalCount}건
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">이전 신고: </span>
                          <span className="font-semibold text-gray-900">{reportStats.previousCount}건</span>
                        </div>
                        {reportStats.totalCount >= 5 && (
                          <span className="px-2 py-1 text-xs font-semibold bg-red-100 text-red-800 rounded">
                            ⚠️ 경고 대상
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                <button
                  onClick={handleCloseModal}
                  className="text-gray-400 hover:text-gray-600 ml-4"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* 탭 네비게이션 */}
              {selectedReport.contentId && (
                <div className="border-b border-gray-200">
                  <nav className="flex space-x-8 px-6" aria-label="Tabs">
                    <button
                      onClick={() => handleTabChange('report')}
                      className={`py-4 px-1 border-b-2 font-medium text-sm ${
                        activeTab === 'report'
                          ? 'border-red-500 text-red-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      신고 내용
                    </button>
                    <button
                      onClick={() => handleTabChange('hotel')}
                      className={`py-4 px-1 border-b-2 font-medium text-sm ${
                        activeTab === 'hotel'
                          ? 'border-red-500 text-red-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      호텔 정보
                    </button>
                  </nav>
                </div>
              )}

              {/* 모달 내용 */}
              <div className="p-6 overflow-y-auto max-h-[60vh]">
                {activeTab === 'report' ? (
                  <div className="space-y-6">
                    {/* 신고 정보 */}
                    <div className="bg-red-50 rounded-lg p-4">
                      <div className="flex items-center gap-4 mb-3">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedReport.status)}`}>
                          {getStatusText(selectedReport.status)}
                        </span>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(selectedReport.priority)}`}>
                          {getPriorityText(selectedReport.priority)}
                        </span>
                        <span className="text-xs text-gray-500">{selectedReport.category}</span>
                      </div>
                      <div className="text-sm text-gray-700 whitespace-pre-wrap">
                        {selectedReport.content}
                      </div>
                      <div className="text-xs text-gray-500 mt-2">
                        작성일: {selectedReport.createdAt}
                      </div>
                    </div>

                    {/* 이전 신고 내역 */}
                    {previousReports.length > 0 && (
                      <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                        <h4 className="text-sm font-semibold text-blue-900 mb-3">
                          이전 신고 내역 ({previousReports.length}건)
                        </h4>
                        <div className="space-y-2 max-h-40 overflow-y-auto">
                          {previousReports.slice(0, 5).map((prevReport) => (
                            <div key={prevReport.id} className="text-xs bg-white p-2 rounded border border-blue-100">
                              <div className="flex items-center justify-between mb-1">
                                <span className="font-medium text-gray-900">{prevReport.title}</span>
                                <span className={`px-1.5 py-0.5 rounded text-xs ${
                                  prevReport.status === 'completed' ? 'bg-green-100 text-green-800' :
                                  prevReport.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-gray-100 text-gray-800'
                                }`}>
                                  {prevReport.status === 'completed' ? '처리완료' :
                                   prevReport.status === 'in_progress' ? '처리중' : '대기중'}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 text-gray-600">
                                <span>{prevReport.category}</span>
                                <span>•</span>
                                <span>{prevReport.createdAt}</span>
                              </div>
                            </div>
                          ))}
                          {previousReports.length > 5 && (
                            <p className="text-xs text-gray-500 text-center mt-2">
                              외 {previousReports.length - 5}건 더...
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* 답변 입력 */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        처리 내용 작성
                      </label>
                      <textarea
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="신고에 대한 처리 내용을 작성해주세요..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                        rows={6}
                      />
                    </div>
                  </div>
                ) : (
                  <HotelInfoView
                    hotelInfo={hotelInfo}
                    focusSection={focusInfo?.section}
                    highlightSections={focusInfo?.highlight || []}
                    autoScroll={focusInfo?.autoScroll || false}
                    matchedRooms={focusInfo?.matchedRooms || []}
                  />
                )}
              </div>

              {/* 모달 푸터 */}
              <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
                <button
                  onClick={handleCloseModal}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  취소
                </button>
                {activeTab === 'report' && (
                  <button
                    onClick={handleSendReply}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                  >
                    처리 완료
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </MasterLayout>
  );
}

