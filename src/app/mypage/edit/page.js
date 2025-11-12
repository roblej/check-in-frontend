'use client';

import { useState, useRef, useEffect } from 'react';
import { 
  User, Mail, Phone, Lock, Shield, Camera, 
  Save, ArrowLeft, Check, X, Eye, EyeOff
} from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useRouter } from 'next/navigation';
import { userAPI } from '@/lib/api/user';
import { useCustomerStore } from '@/stores/customerStore';

export default function EditProfilePage() {
  const router = useRouter();
  const { resetAccessToken, setInlogged } = useCustomerStore();
  
  // 탭 상태
  const [activeTab, setActiveTab] = useState('basic'); // basic, security, profile
  
  // 로딩 상태
  const [isLoading, setIsLoading] = useState(true);
  
  // 기본정보 상태
  const [basicInfo, setBasicInfo] = useState({
    nickname: '',
    phone: '',
    email: ''
  });
  
  // 보안 상태
  const [securityInfo, setSecurityInfo] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [isSocialAccount, setIsSocialAccount] = useState(false);
  const [initialBasicInfo, setInitialBasicInfo] = useState(null);
  
  // 패스워드 표시 상태
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  
  // 프로필 이미지 상태
  const [profileImage, setProfileImage] = useState(null);
  const [profileImagePreview, setProfileImagePreview] = useState(null);
  const fileInputRef = useRef(null);
  
  // 저장 상태
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState({ type: '', text: '' });

  // 초기 데이터 로드
  useEffect(() => {
    loadUserProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 사용자 프로필 로드
  const loadUserProfile = async () => {
    setIsLoading(true);
    try {
      const data = await userAPI.getProfile();
      
      console.log('📥 프로필 데이터 로드:', data);
      
      // 기본정보 설정 (백엔드 데이터 구조에 맞춤)
      setBasicInfo({
        nickname: data.nickname || '',
        phone: data.phone || '',
        email: data.email || ''
      });
      setInitialBasicInfo({
        nickname: data.nickname || '',
        phone: data.phone || '',
        email: data.email || ''
      });
      
      setIsSocialAccount(data?.provider !== null && data?.provider !== undefined);
      
    } catch (error) {
      console.error('❌ 프로필 로드 실패:', error);
      setSaveMessage({ 
        type: 'error', 
        text: '프로필 정보를 불러오는데 실패했습니다.' 
      });
      
      // 인증 오류 시 로그인 페이지로 리다이렉트
      if (error.response?.status === 401) {
        alert('로그인이 필요합니다.');
        setTimeout(() => router.push('/login'), 1000);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // 기본정보 입력 핸들러
  const handleBasicInfoChange = (field, value) => {
    if (field === 'email') {
      return;
    }
    setBasicInfo(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // 보안정보 입력 핸들러
  const handleSecurityInfoChange = (field, value) => {
    setSecurityInfo(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // 비밀번호 필드 복사 시 마스킹된 값만 복사되도록 처리 (보안)
  const handlePasswordCopy = (e) => {
    e.preventDefault();
    
    // 선택된 텍스트 길이 확인
    const input = e.target;
    const selectionStart = input.selectionStart;
    const selectionEnd = input.selectionEnd;
    const selectedLength = selectionEnd - selectionStart;
    
    if (selectedLength > 0) {
      // 마스킹된 값(•)을 클립보드에 복사 (평문 노출 방지)
      const maskedValue = '•'.repeat(selectedLength);
      
      // 클립보드 API 사용
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(maskedValue).catch(() => {
          // Fallback: ClipboardEvent 사용
          e.clipboardData.setData('text/plain', maskedValue);
        });
      } else {
        // Fallback: ClipboardEvent 사용
        e.clipboardData.setData('text/plain', maskedValue);
      }
    }
    
    return false;
  };

  // 비밀번호 필드 잘라내기 방지 (보안)
  const handlePasswordCut = (e) => {
    e.preventDefault();
    return false;
  };

  // 비밀번호 필드 붙여넣기 시 BCrypt 해시 패턴 검증
  const handlePasswordPaste = (e) => {
    const pastedText = e.clipboardData.getData('text');
    
    // BCrypt 해시 패턴 검증 (암호화된 비밀번호 붙여넣기 방지)
    if (pastedText.startsWith('$2a$') || pastedText.startsWith('$2b$') || 
        pastedText.startsWith('$2y$') || pastedText.startsWith('$2x$')) {
      e.preventDefault();
      return false;
    }
  };

  // 프로필 이미지 선택 핸들러
  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // 이미지 파일 검증
      if (!file.type.startsWith('image/')) {
        setSaveMessage({ type: 'error', text: '이미지 파일만 선택 가능합니다.' });
        return;
      }
      
      // 파일 크기 검증 (5MB)
      if (file.size > 5 * 1024 * 1024) {
        setSaveMessage({ type: 'error', text: '이미지 크기는 5MB 이하여야 합니다.' });
        return;
      }
      
      setProfileImage(file);
      
      // 미리보기 생성
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
      setSaveMessage({ type: '', text: '' });
    }
  };

  // 기본정보 저장
  const handleSaveBasicInfo = async () => {
    setIsSaving(true);
    setSaveMessage({ type: '', text: '' });
    
    const trimmedBasicInfo = {
      nickname: basicInfo.nickname.trim(),
      phone: basicInfo.phone.trim(),
      email: basicInfo.email.trim()
    };

    if (
      initialBasicInfo &&
      trimmedBasicInfo.nickname === (initialBasicInfo.nickname || '') &&
      trimmedBasicInfo.phone === (initialBasicInfo.phone || '') &&
      trimmedBasicInfo.email === (initialBasicInfo.email || '')
    ) {
      setIsSaving(false);
      return;
    }

    // 유효성 검사
    if (!trimmedBasicInfo.nickname) {
      setSaveMessage({ type: 'error', text: '닉네임을 입력해주세요.' });
      setIsSaving(false);
      return;
    }
    
    if (!trimmedBasicInfo.phone) {
      setSaveMessage({ type: 'error', text: '연락처를 입력해주세요.' });
      setIsSaving(false);
      return;
    }
    
    if (!basicInfo.email.trim() || !basicInfo.email.includes('@')) {
      setSaveMessage({ type: 'error', text: '올바른 이메일 주소를 입력해주세요.' });
      setIsSaving(false);
      return;
    }
    
    try {
      console.log('📤 기본정보 저장 요청:', basicInfo);
      
      // 실제 API 호출 - DB에 저장
      const response = await userAPI.updateBasicInfo({
        nickname: basicInfo.nickname.trim(),
        phone: basicInfo.phone.trim(),
        email: basicInfo.email.trim()
      });
      
      console.log('✅ 기본정보 저장 성공:', response);
      
      setSaveMessage({ 
        type: 'success', 
        text: '기본정보가 성공적으로 수정되었습니다.'
      });
      setBasicInfo(trimmedBasicInfo);
      setInitialBasicInfo({ ...trimmedBasicInfo });
      
      // 3초 후 메시지 제거
      setTimeout(() => setSaveMessage({ type: '', text: '' }), 3000);
      
    } catch (error) {
      console.error('❌ 기본정보 저장 실패:', error);
      
      // 에러 메시지 처리
      let errorMessage = '저장에 실패했습니다. 다시 시도해주세요.';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.error?.message) {
        errorMessage = error.response.data.error.message;
      }
      
      setSaveMessage({ type: 'error', text: errorMessage });
      
      // 인증 오류 시 로그인 페이지로 리다이렉트
      if (error.response?.status === 401) {
        alert('로그인이 필요합니다.');
        setTimeout(() => router.push('/login'), 2000);
      }
    } finally {
      setIsSaving(false);
    }
  };

  // 보안정보 저장
  const handleSaveSecurityInfo = async () => {
    setIsSaving(true);
    setSaveMessage({ type: '', text: '' });
    
    // 패스워드 변경 검증
    if (securityInfo.currentPassword || securityInfo.newPassword || securityInfo.confirmPassword) {
      if (!securityInfo.currentPassword) {
        setSaveMessage({ type: 'error', text: '현재 비밀번호를 입력해주세요.' });
        setIsSaving(false);
        return;
      }
      
      if (!securityInfo.newPassword) {
        setSaveMessage({ type: 'error', text: '새 비밀번호를 입력해주세요.' });
        setIsSaving(false);
        return;
      }
      
      if (securityInfo.newPassword.length < 8) {
        setSaveMessage({ type: 'error', text: '비밀번호는 8자 이상이어야 합니다.' });
        setIsSaving(false);
        return;
      }
      
      if (securityInfo.newPassword !== securityInfo.confirmPassword) {
        setSaveMessage({ type: 'error', text: '새 비밀번호가 일치하지 않습니다.' });
        setIsSaving(false);
        return;
      }
      
      // 현재 비밀번호와 새 비밀번호가 같은지 확인 (프론트엔드에서 미리 검증)
      if (securityInfo.currentPassword === securityInfo.newPassword) {
        setSaveMessage({ type: 'error', text: '새로운 비밀번호는 현재 비밀번호와 같을 수 없습니다.' });
        setIsSaving(false);
        return;
      }
      
      // 비밀번호 변경 API 호출
      try {
        const passwordData = {
          currentPassword: securityInfo.currentPassword,
          newPassword: securityInfo.newPassword,
          confirmPassword: securityInfo.confirmPassword
        };
        
        console.log('📤 비밀번호 변경 요청');
        console.log('📤 요청 데이터:', {
          currentPassword: passwordData.currentPassword ? '입력됨 (' + passwordData.currentPassword.length + '자)' : '없음',
          newPassword: passwordData.newPassword ? '입력됨 (' + passwordData.newPassword.length + '자)' : '없음',
          confirmPassword: passwordData.confirmPassword ? '입력됨 (' + passwordData.confirmPassword.length + '자)' : '없음'
        });
        
        const response = await userAPI.changePassword(passwordData);
        
        console.log('✅ 비밀번호 변경 성공:', response);
        
        setSaveMessage({ 
          type: 'success', 
          text: response.message || '비밀번호가 성공적으로 변경되었습니다. 다시 로그인해주세요.' 
        });
        
        // 패스워드 필드 초기화
        setSecurityInfo(prev => ({
          ...prev,
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        }));
        
        // 스토어 초기화 (자동 로그아웃)
        resetAccessToken();
        setInlogged(false);
        
        // 2초 후 로그인 페이지로 리다이렉트
        setTimeout(() => {
          router.push('/login');
        }, 2000);
        
      } catch (error) {
        console.error('❌ 비밀번호 변경 실패:', error);
        console.error('❌ 에러 응답 데이터:', error.response?.data);
        
        // 에러 메시지 처리
        let errorMessage = '비밀번호 변경에 실패했습니다. 다시 시도해주세요.';
        
        if (error.response?.data?.message) {
          errorMessage = error.response.data.message;
        } else if (error.response?.data?.error?.message) {
          errorMessage = error.response.data.error.message;
        } else if (error.message) {
          errorMessage = error.message;
        }
        
        console.log('✅ 표시할 에러 메시지:', errorMessage);
        setSaveMessage({ type: 'error', text: errorMessage });
        
        // 인증 오류 시 로그인 페이지로 리다이렉트
        if (error.response?.status === 401) {
          alert('로그인이 필요합니다.');
          setTimeout(() => router.push('/login'), 2000);
        }
      } finally {
        setIsSaving(false);
      }
      
      return; // 비밀번호 변경 처리 후 종료
    }
    
    setIsSaving(false);
  };

  // 프로필 이미지 저장
  const handleSaveProfileImage = async () => {
    if (!profileImage) {
      setSaveMessage({ type: 'error', text: '변경할 이미지를 선택해주세요.' });
      return;
    }
    
    setIsSaving(true);
    setSaveMessage({ type: '', text: '' });
    
    // FormData 생성 (실제 API 호출 시 사용)
    const formData = new FormData();
    formData.append('profileImage', profileImage);
    
    // API 호출 시뮬레이션
    setTimeout(() => {
      setSaveMessage({ type: 'success', text: '프로필 사진이 성공적으로 변경되었습니다.' });
      setIsSaving(false);
      
      // 3초 후 메시지 제거
      setTimeout(() => setSaveMessage({ type: '', text: '' }), 3000);
    }, 1000);
  };

  // 탭별 저장 핸들러
  const handleSave = () => {
    if (activeTab === 'basic') {
      handleSaveBasicInfo();
    } else if (activeTab === 'security') {
      handleSaveSecurityInfo();
    } else if (activeTab === 'profile') {
      handleSaveProfileImage();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-gray-700" />
            </button>
            <h1 className="text-3xl font-bold text-gray-900">개인정보 수정</h1>
          </div>
        </div>

        {/* 로딩 상태 */}
        {isLoading ? (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-12">
            <div className="flex flex-col items-center justify-center">
              <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-gray-600 text-lg">프로필 정보를 불러오는 중...</p>
            </div>
          </div>
        ) : (
          <>
        {/* 저장 메시지 */}
        {saveMessage.text && (
          <div className={`mb-4 p-4 rounded-lg flex items-center gap-2 ${
            saveMessage.type === 'success' 
              ? 'bg-green-50 border border-green-200' 
              : 'bg-red-50 border border-red-200'
          }`}>
            {saveMessage.type === 'success' ? (
              <Check className="w-5 h-5 text-green-600" />
            ) : (
              <X className="w-5 h-5 text-red-600" />
            )}
            <span className={`font-medium ${
              saveMessage.type === 'success' ? 'text-green-800' : 'text-red-800'
            }`}>
              {saveMessage.text}
            </span>
          </div>
        )}

        {/* 메인 카드 */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          {/* 탭 네비게이션 */}
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('basic')}
              className={`flex-1 px-6 py-4 font-medium transition-all border-b-2 ${
                activeTab === 'basic'
                  ? 'border-blue-600 text-blue-600 bg-blue-50'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <User className="w-5 h-5" />
                <span>기본정보</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('security')}
              className={`flex-1 px-6 py-4 font-medium transition-all border-b-2 ${
                activeTab === 'security'
                  ? 'border-blue-600 text-blue-600 bg-blue-50'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <Shield className="w-5 h-5" />
                <span>보안</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('profile')}
              className={`flex-1 px-6 py-4 font-medium transition-all border-b-2 ${
                activeTab === 'profile'
                  ? 'border-blue-600 text-blue-600 bg-blue-50'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <Camera className="w-5 h-5" />
                <span>프로필사진</span>
              </div>
            </button>
          </div>

          {/* 탭 컨텐츠 */}
          <div className="p-8">
            {/* 기본정보 탭 */}
            {activeTab === 'basic' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    닉네임
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={basicInfo.nickname}
                      onChange={(e) => handleBasicInfoChange('nickname', e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="닉네임을 입력하세요"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    연락처
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="tel"
                      value={basicInfo.phone}
                      onChange={(e) => handleBasicInfoChange('phone', e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="010-0000-0000"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    이메일 주소
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      value={basicInfo.email}
                      onChange={(e) => handleBasicInfoChange('email', e.target.value)}
                      disabled
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg text-gray-500 placeholder:text-gray-400 cursor-not-allowed transition-all"
                      style={{ backgroundColor: 'rgba(229, 231, 235, 0.7)' }}
                      placeholder="example@email.com"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 보안 탭 */}
            {activeTab === 'security' && (
              <div className="space-y-8">
                {/* 비밀번호 변경 섹션 */}
                <div className="pb-6 border-b border-gray-200">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">비밀번호 변경</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        현재 비밀번호
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="password"
                          value={securityInfo.currentPassword}
                          onChange={(e) => handleSecurityInfoChange('currentPassword', e.target.value)}
                          onCopy={handlePasswordCopy}
                          onCut={handlePasswordCut}
                          onPaste={handlePasswordPaste}
                          disabled={isSocialAccount}
                          className={`w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg transition-all ${isSocialAccount ? 'text-gray-500 placeholder:text-gray-400 cursor-not-allowed border-gray-200' : 'focus:ring-2 focus:ring-blue-500 focus:border-transparent'}`}
                          style={isSocialAccount ? { backgroundColor: 'rgba(229, 231, 235, 0.7)' } : undefined}
                          placeholder="현재 비밀번호를 입력하세요"
                          autoComplete="current-password"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        새 비밀번호
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="password"
                          value={securityInfo.newPassword}
                          onChange={(e) => handleSecurityInfoChange('newPassword', e.target.value)}
                          onCopy={handlePasswordCopy}
                          onCut={handlePasswordCut}
                          onPaste={handlePasswordPaste}
                          disabled={isSocialAccount}
                          className={`w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg transition-all ${isSocialAccount ? 'text-gray-500 placeholder:text-gray-400 cursor-not-allowed border-gray-200' : 'focus:ring-2 focus:ring-blue-500 focus:border-transparent'}`}
                          style={isSocialAccount ? { backgroundColor: 'rgba(229, 231, 235, 0.7)' } : undefined}
                          placeholder="새 비밀번호를 입력하세요 (8자 이상)"
                          autoComplete="new-password"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        새 비밀번호 확인
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="password"
                          value={securityInfo.confirmPassword}
                          onChange={(e) => handleSecurityInfoChange('confirmPassword', e.target.value)}
                          onCopy={handlePasswordCopy}
                          onCut={handlePasswordCut}
                          onPaste={handlePasswordPaste}
                          disabled={isSocialAccount}
                          className={`w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg transition-all ${isSocialAccount ? 'text-gray-500 placeholder:text-gray-400 cursor-not-allowed border-gray-200' : 'focus:ring-2 focus:ring-blue-500 focus:border-transparent'}`}
                          style={isSocialAccount ? { backgroundColor: 'rgba(229, 231, 235, 0.7)' } : undefined}
                          placeholder="새 비밀번호를 다시 입력하세요"
                          autoComplete="new-password"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                
              </div>
            )}

            {/* 프로필사진 탭 */}
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <div className="flex flex-col items-center">
                  {/* 현재 프로필 이미지 또는 미리보기 */}
                  <div className="relative mb-6">
                    <div className="w-40 h-40 rounded-full overflow-hidden border-4 border-gray-200 shadow-lg">
                      {profileImagePreview ? (
                        <img 
                          src={profileImagePreview} 
                          alt="Profile Preview" 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                          <User className="w-20 h-20 text-white" />
                        </div>
                      )}
                    </div>
                    
                    {/* 카메라 아이콘 버튼 */}
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute bottom-2 right-2 p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg transition-colors"
                    >
                      <Camera className="w-5 h-5" />
                    </button>
                  </div>

                  {/* 파일 입력 (숨김) */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="hidden"
                  />

                  {/* 안내 텍스트 */}
                  <div className="text-center mb-6">
                    <p className="text-sm text-gray-600 mb-2">
                      JPG, PNG, GIF 파일 (최대 5MB)
                    </p>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="text-blue-600 hover:text-blue-700 font-medium text-sm underline"
                    >
                      이미지 선택하기
                    </button>
                  </div>

                  {/* 선택된 파일 정보 */}
                  {profileImage && (
                    <div className="w-full bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Check className="w-5 h-5 text-blue-600" />
                          <div>
                            <p className="font-medium text-gray-900">{profileImage.name}</p>
                            <p className="text-sm text-gray-500">
                              {(profileImage.size / 1024).toFixed(1)} KB
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            setProfileImage(null);
                            setProfileImagePreview(null);
                            if (fileInputRef.current) {
                              fileInputRef.current.value = '';
                            }
                          }}
                          className="p-2 hover:bg-blue-100 rounded-lg transition-colors"
                        >
                          <X className="w-5 h-5 text-gray-600" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* 저장 버튼 */}
          <div className="px-8 py-6 bg-gray-50 border-t border-gray-200">
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => router.back()}
                className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Save className="w-5 h-5" />
                <span>{isSaving ? '저장 중...' : '저장하기'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* 추가 안내사항 */}
        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="font-bold text-yellow-900 mb-2">주의사항</h3>
          <ul className="text-sm text-yellow-800 space-y-1">
            <li>• 개인정보 변경 시 본인 확인을 위해 추가 인증이 필요할 수 있습니다.</li>
            <li>• 비밀번호는 8자 이상으로 설정해주세요.</li>
          </ul>
        </div>
        </>
        )}
      </div>

      <Footer />
    </div>
  );
}

