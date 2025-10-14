'use client';

import { useState } from 'react';
import MasterLayout from '@/components/master/MasterLayout';

const MessageManagement = () => {
  const [activeTab, setActiveTab] = useState('send');
  const [messageType, setMessageType] = useState('individual');
  const [recipientType, setRecipientType] = useState('members');
  const [selectedRecipients, setSelectedRecipients] = useState([]);
  const [messageTitle, setMessageTitle] = useState('');
  const [messageContent, setMessageContent] = useState('');
  const [messageTemplate, setMessageTemplate] = useState('');

  // 메시지 템플릿
  const templates = [
    {
      id: 'welcome',
      name: '환영 메시지',
      title: '체크인 서비스에 오신 것을 환영합니다!',
      content: '안녕하세요 {name}님,\n\n체크인 서비스에 가입해 주셔서 감사합니다.\n저희 서비스를 통해 편리한 호텔 예약 경험을 즐기시기 바랍니다.\n\n감사합니다.'
    },
    {
      id: 'promotion',
      name: '프로모션 안내',
      title: '🎉 특별 할인 이벤트 안내',
      content: '안녕하세요 {name}님,\n\n이번 주말 특별 할인 이벤트를 진행합니다!\n최대 30% 할인된 가격으로 호텔을 예약하세요.\n\n이벤트 기간: {date}\n할인율: 최대 30%\n\n지금 바로 확인해보세요!'
    },
    {
      id: 'notice',
      name: '공지사항',
      title: '서비스 점검 안내',
      content: '안녕하세요,\n\n시스템 점검으로 인해 일시적으로 서비스 이용이 제한될 예정입니다.\n\n점검 일시: {date}\n점검 시간: 약 2시간\n\n이용에 불편을 드려 죄송합니다.'
    }
  ];

  // 회원 목록 (축소)
  const members = [
    { id: 'M001', name: '김고객', email: 'customer1@email.com', grade: 'VIP' },
    { id: 'M002', name: '이여행', email: 'travel2@email.com', grade: 'GOLD' },
    { id: 'M003', name: '박휴가', email: 'vacation3@email.com', grade: 'SILVER' }
  ];

  // 호텔 목록 (축소)
  const hotels = [
    { id: 'H001', name: '서울 그랜드 호텔', owner: '김호텔', email: 'grand@hotel.com' },
    { id: 'H002', name: '부산 오션뷰 리조트', owner: '이바다', email: 'ocean@resort.com' },
    { id: 'H003', name: '제주 힐링 펜션', owner: '박제주', email: 'healing@jeju.com' }
  ];

  // 전송 이력
  const messageHistory = [
    {
      id: 'MSG001',
      title: '주말 특별 할인 이벤트',
      recipientType: 'members',
      recipientCount: 1250,
      sentDate: '2024-01-15 14:30:00',
      status: 'sent',
      openRate: '68%',
      clickRate: '12%'
    },
    {
      id: 'MSG002',
      title: '신규 호텔 등록 안내',
      recipientType: 'hotels',
      recipientCount: 45,
      sentDate: '2024-01-14 10:15:00',
      status: 'sent',
      openRate: '85%',
      clickRate: '23%'
    },
    {
      id: 'MSG003',
      title: '시스템 점검 공지',
      recipientType: 'all',
      recipientCount: 1295,
      sentDate: '2024-01-13 16:45:00',
      status: 'sent',
      openRate: '92%',
      clickRate: '5%'
    }
  ];

  const handleTemplateSelect = (template) => {
    setMessageTemplate(template.id);
    setMessageTitle(template.title);
    setMessageContent(template.content);
  };

  const handleRecipientToggle = (id) => {
    setSelectedRecipients(prev => 
      prev.includes(id) 
        ? prev.filter(recipientId => recipientId !== id)
        : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    const currentList = recipientType === 'members' ? members : hotels;
    if (selectedRecipients.length === currentList.length) {
      setSelectedRecipients([]);
    } else {
      setSelectedRecipients(currentList.map(item => item.id));
    }
  };

  const handleSendMessage = () => {
    if (!messageTitle || !messageContent) {
      alert('제목과 내용을 입력해주세요.');
      return;
    }

    if (messageType === 'individual' && selectedRecipients.length === 0) {
      alert('받는 사람을 선택해주세요.');
      return;
    }

    let recipientCount = 0;
    if (messageType === 'broadcast') {
      if (recipientType === 'members') {
        recipientCount = members.length;
      } else if (recipientType === 'hotels') {
        recipientCount = hotels.length;
      } else {
        recipientCount = members.length + hotels.length;
      }
    } else {
      recipientCount = selectedRecipients.length;
    }

    alert(`메시지가 ${recipientCount}명에게 전송되었습니다.`);
    
    // 폼 초기화
    setMessageTitle('');
    setMessageContent('');
    setMessageTemplate('');
    setSelectedRecipients([]);
  };

  return (
    <MasterLayout>
      <div className="space-y-6">
        {/* 페이지 헤더 */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900">메시지 관리</h2>
          <p className="text-gray-600">호텔과 회원에게 메시지를 전송하고 관리하세요</p>
        </div>

        {/* 탭 메뉴 */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('send')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'send'
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              메시지 전송
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'history'
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              전송 이력
            </button>
            <button
              onClick={() => setActiveTab('templates')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'templates'
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              메시지 템플릿
            </button>
          </nav>
        </div>

        {/* 메시지 전송 탭 */}
        {activeTab === 'send' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 메시지 작성 폼 */}
            <div className="lg:col-span-2 space-y-6">
              {/* 전송 방식 선택 */}
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">전송 방식</h3>
                <div className="space-y-3">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="messageType"
                      value="individual"
                      checked={messageType === 'individual'}
                      onChange={(e) => setMessageType(e.target.value)}
                      className="mr-3 text-purple-600 focus:ring-purple-500"
                    />
                    <span className="text-sm text-gray-900">개별 전송 (선택한 대상에게만)</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="messageType"
                      value="broadcast"
                      checked={messageType === 'broadcast'}
                      onChange={(e) => setMessageType(e.target.value)}
                      className="mr-3 text-purple-600 focus:ring-purple-500"
                    />
                    <span className="text-sm text-gray-900">일괄 전송 (전체 또는 그룹별)</span>
                  </label>
                </div>
              </div>

              {/* 받는 사람 유형 */}
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">받는 사람</h3>
                <div className="space-y-3">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="recipientType"
                      value="members"
                      checked={recipientType === 'members'}
                      onChange={(e) => setRecipientType(e.target.value)}
                      className="mr-3 text-purple-600 focus:ring-purple-500"
                    />
                    <span className="text-sm text-gray-900">회원 ({members.length}명)</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="recipientType"
                      value="hotels"
                      checked={recipientType === 'hotels'}
                      onChange={(e) => setRecipientType(e.target.value)}
                      className="mr-3 text-purple-600 focus:ring-purple-500"
                    />
                    <span className="text-sm text-gray-900">호텔 ({hotels.length}개)</span>
                  </label>
                  {messageType === 'broadcast' && (
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="recipientType"
                        value="all"
                        checked={recipientType === 'all'}
                        onChange={(e) => setRecipientType(e.target.value)}
                        className="mr-3 text-purple-600 focus:ring-purple-500"
                      />
                      <span className="text-sm text-gray-900">전체 ({members.length + hotels.length}명)</span>
                    </label>
                  )}
                </div>
              </div>

              {/* 메시지 작성 */}
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">메시지 작성</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      제목
                    </label>
                    <input
                      type="text"
                      value={messageTitle}
                      onChange={(e) => setMessageTitle(e.target.value)}
                      placeholder="메시지 제목을 입력하세요"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      내용
                    </label>
                    <textarea
                      value={messageContent}
                      onChange={(e) => setMessageContent(e.target.value)}
                      placeholder="메시지 내용을 입력하세요"
                      rows={8}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={handleSendMessage}
                      className="bg-[#7C3AED] text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      메시지 전송
                    </button>
                    <button className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors">
                      임시저장
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* 사이드바 */}
            <div className="space-y-6">
              {/* 템플릿 선택 */}
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">템플릿 선택</h3>
                <div className="space-y-2">
                  {templates.map((template) => (
                    <button
                      key={template.id}
                      onClick={() => handleTemplateSelect(template)}
                      className={`w-full text-left p-3 rounded-lg border transition-colors ${
                        messageTemplate === template.id
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="text-sm font-medium text-gray-900">{template.name}</div>
                      <div className="text-xs text-gray-500 mt-1">{template.title}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* 개별 전송 시 받는 사람 선택 */}
              {messageType === 'individual' && (
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">받는 사람 선택</h3>
                    <button
                      onClick={handleSelectAll}
                      className="text-sm text-purple-600 hover:text-purple-800"
                    >
                      {selectedRecipients.length === (recipientType === 'members' ? members : hotels).length ? '전체 해제' : '전체 선택'}
                    </button>
                  </div>
                  <div className="max-h-64 overflow-y-auto space-y-2">
                    {(recipientType === 'members' ? members : hotels).map((item) => (
                      <label key={item.id} className="flex items-center p-2 hover:bg-gray-50 rounded">
                        <input
                          type="checkbox"
                          checked={selectedRecipients.includes(item.id)}
                          onChange={() => handleRecipientToggle(item.id)}
                          className="mr-3 text-purple-600 focus:ring-purple-500"
                        />
                        <div className="flex-1">
                          <div className="text-sm font-medium text-gray-900">
                            {recipientType === 'members' ? item.name : item.name}
                          </div>
                          <div className="text-xs text-gray-500">{item.email}</div>
                          {recipientType === 'members' && (
                            <div className="text-xs text-purple-600">{item.grade}</div>
                          )}
                          {recipientType === 'hotels' && (
                            <div className="text-xs text-blue-600">{item.owner}</div>
                          )}
                        </div>
                      </label>
                    ))}
                  </div>
                  {selectedRecipients.length > 0 && (
                    <div className="mt-4 p-3 bg-purple-50 rounded-lg">
                      <div className="text-sm text-purple-700">
                        {selectedRecipients.length}명 선택됨
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* 전송 이력 탭 */}
        {activeTab === 'history' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">전송 이력</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      제목
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      받는 사람
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      전송일시
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      상태
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      성과
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      액션
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {messageHistory.map((message) => (
                    <tr key={message.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{message.title}</div>
                        <div className="text-sm text-gray-500">ID: {message.id}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {message.recipientType === 'members' ? '회원' : 
                           message.recipientType === 'hotels' ? '호텔' : '전체'}
                        </div>
                        <div className="text-sm text-gray-500">{message.recipientCount}명</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {message.sentDate}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                          전송완료
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">열람률: {message.openRate}</div>
                        <div className="text-sm text-gray-500">클릭률: {message.clickRate}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button className="text-[#7C3AED] hover:text-purple-800 mr-3">
                          상세보기
                        </button>
                        <button className="text-blue-600 hover:text-blue-800">
                          재전송
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 템플릿 관리 탭 */}
        {activeTab === 'templates' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((template) => (
              <div key={template.id} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{template.name}</h3>
                <h4 className="text-sm font-medium text-gray-700 mb-3">{template.title}</h4>
                <p className="text-sm text-gray-600 mb-4 line-clamp-3">{template.content}</p>
                <div className="flex gap-2">
                  <button className="flex-1 bg-[#7C3AED] text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors text-sm">
                    사용하기
                  </button>
                  <button className="px-3 py-2 text-gray-600 hover:text-gray-800 text-sm">
                    수정
                  </button>
                </div>
              </div>
            ))}
            
            {/* 새 템플릿 추가 */}
            <div className="bg-gray-50 p-6 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
              <button className="text-center">
                <div className="text-4xl text-gray-400 mb-2">+</div>
                <div className="text-sm text-gray-600">새 템플릿 추가</div>
              </button>
            </div>
          </div>
        )}
      </div>
    </MasterLayout>
  );
};

export default MessageManagement;
