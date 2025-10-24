'use client';

import { useState, useRef } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Upload, Image as ImageIcon, Download, Trash2, Eye, RefreshCw } from 'lucide-react';

export default function S3TestPage() {
  const [uploading, setUploading] = useState(false);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [generatingUrl, setGeneratingUrl] = useState(false);
  const fileInputRef = useRef(null);

  // 기존 이미지 URL
  const existingImageUrl = 'https://sist-checkin.s3.ap-northeast-2.amazonaws.com/clip1759208387287.png';

  // 파일 선택 핸들러
  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      // 파일 크기 검사 (10MB 제한)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        alert('파일 크기가 너무 큽니다. 최대 10MB까지 업로드 가능합니다.');
        event.target.value = ''; // 파일 선택 초기화
        return;
      }
      
      setSelectedFile(file);
      
      // 미리보기 URL 생성
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  // 이미지 업로드 핸들러
  const handleUpload = async () => {
    if (!selectedFile) {
      alert('파일을 선택해주세요.');
      return;
    }

    setUploading(true);
    
    try {
      // FormData 생성
      const formData = new FormData();
      formData.append('image', selectedFile);
      formData.append('folder', 'test'); // 업로드할 폴더 지정

      // 백엔드 API 호출
      const response = await fetch('/api/image/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        console.log('업로드 성공:', result);
        
        // 업로드된 이미지 목록에 추가
        setUploadedImages(prev => [...prev, {
          url: result.url,
          key: result.key,
          uploadedAt: new Date().toISOString(),
          fileName: selectedFile.name
        }]);

        // 선택된 파일 초기화
        setSelectedFile(null);
        setPreviewUrl(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }

        alert('이미지가 성공적으로 업로드되었습니다!');
      } else {
        const error = await response.json();
        console.error('업로드 실패:', error);
        alert(`업로드 실패: ${error.message}`);
      }
    } catch (error) {
      console.error('업로드 중 오류:', error);
      alert('업로드 중 오류가 발생했습니다.');
    } finally {
      setUploading(false);
    }
  };

  // 이미지 삭제 핸들러
  const handleDelete = async (imageUrl) => {
    if (!confirm('이미지를 삭제하시겠습니까?')) {
      return;
    }

    try {
      const response = await fetch('/api/image/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ imageUrl: imageUrl }),
      });

      if (response.ok) {
        // 업로드된 이미지 목록에서 제거
        setUploadedImages(prev => prev.filter(img => img.url !== imageUrl));
        alert('이미지가 삭제되었습니다.');
      } else {
        const error = await response.json();
        alert(`삭제 실패: ${error.message}`);
      }
    } catch (error) {
      console.error('삭제 중 오류:', error);
      alert('삭제 중 오류가 발생했습니다.');
    }
  };

  // 서명된 URL 생성 핸들러
  const handleGeneratePresignedUrl = async (imageUrl) => {
    setGeneratingUrl(true);
    
    try {
      const response = await fetch('/api/image/presigned-url', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          imageUrl: imageUrl,
          expirationMinutes: 60 
        }),
      });

      if (response.ok) {
        const result = await response.json();
        console.log('서명된 URL 생성 성공:', result);
        
        // 새 창에서 서명된 URL 열기
        window.open(result.presignedUrl, '_blank');
        
        alert('서명된 URL이 생성되었습니다. 새 창에서 확인하세요.');
      } else {
        const error = await response.json();
        alert(`서명된 URL 생성 실패: ${error.message}`);
      }
    } catch (error) {
      console.error('서명된 URL 생성 중 오류:', error);
      alert('서명된 URL 생성 중 오류가 발생했습니다.');
    } finally {
      setGeneratingUrl(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">AWS S3 이미지 테스트</h1>
          <p className="text-gray-600">이미지 업로드, 조회, 삭제, 서명된 URL 생성 기능을 테스트할 수 있습니다.</p>
        </div>

        {/* 기존 이미지 표시 */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <ImageIcon className="w-6 h-6 text-blue-600" />
            기존 이미지 테스트
          </h2>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <img 
              src={existingImageUrl} 
              alt="기존 이미지" 
              className="max-w-full max-h-96 mx-auto rounded-lg shadow-md"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'block';
              }}
            />
            <div className="hidden text-gray-500">
              <p className="text-lg font-medium mb-2">이미지를 불러올 수 없습니다</p>
              <p className="text-sm mb-4">S3 버킷 권한 설정이 필요합니다</p>
              <button
                onClick={() => handleGeneratePresignedUrl(existingImageUrl)}
                disabled={generatingUrl}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2 mx-auto"
              >
                {generatingUrl ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    생성 중...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4" />
                    서명된 URL 생성
                  </>
                )}
              </button>
            </div>
            <p className="text-sm text-gray-500 mt-4">
              URL: {existingImageUrl}
            </p>
          </div>
        </div>

        {/* 이미지 업로드 */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Upload className="w-6 h-6 text-green-600" />
            이미지 업로드
          </h2>
          
          <div className="space-y-4">
            {/* 파일 선택 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                이미지 파일 선택 (최대 10MB)
              </label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              {selectedFile && (
                <div className="mt-2 text-sm text-gray-600">
                  <p>선택된 파일: {selectedFile.name}</p>
                  <p>파일 크기: {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                </div>
              )}
            </div>

            {/* 미리보기 */}
            {previewUrl && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  미리보기
                </label>
                <div className="border rounded-lg p-4">
                  <img 
                    src={previewUrl} 
                    alt="미리보기" 
                    className="max-w-full max-h-64 mx-auto rounded-lg"
                  />
                </div>
              </div>
            )}

            {/* 업로드 버튼 */}
            <button
              onClick={handleUpload}
              disabled={!selectedFile || uploading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {uploading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  업로드 중...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  이미지 업로드
                </>
              )}
            </button>
          </div>
        </div>

        {/* 업로드된 이미지 목록 */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Eye className="w-6 h-6 text-purple-600" />
              업로드된 이미지 목록
            </h2>
            <span className="text-sm text-gray-500">
              총 {uploadedImages.length}개
            </span>
          </div>

          {uploadedImages.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <ImageIcon className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>업로드된 이미지가 없습니다.</p>
              <p className="text-sm mt-2">위의 업로드 섹션에서 이미지를 업로드해보세요.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {uploadedImages.map((image, index) => (
                <div key={index} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="aspect-square mb-4 overflow-hidden rounded-lg">
                    <img 
                      src={image.url} 
                      alt={image.fileName || '업로드된 이미지'} 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                    <div className="hidden w-full h-full bg-gray-100 items-center justify-center text-gray-500">
                      <div className="text-center">
                        <ImageIcon className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                        <p className="text-sm">이미지 로드 실패</p>
                        <button
                          onClick={() => handleGeneratePresignedUrl(image.url)}
                          disabled={generatingUrl}
                          className="mt-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white text-xs px-3 py-1 rounded transition-colors"
                        >
                          서명된 URL 생성
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="font-medium text-gray-900 truncate">
                      {image.fileName || `이미지 ${index + 1}`}
                    </h3>
                    <p className="text-xs text-gray-500">
                      업로드: {new Date(image.uploadedAt).toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      Key: {image.key}
                    </p>
                    
                    <div className="flex gap-2">
                      <a
                        href={image.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium py-2 px-3 rounded transition-colors text-center"
                      >
                        보기
                      </a>
                      <button
                        onClick={() => handleGeneratePresignedUrl(image.url)}
                        disabled={generatingUrl}
                        className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white text-xs font-medium py-2 px-3 rounded transition-colors text-center"
                      >
                        서명URL
                      </button>
                      <button
                        onClick={() => handleDelete(image.url)}
                        className="flex-1 bg-red-600 hover:bg-red-700 text-white text-xs font-medium py-2 px-3 rounded transition-colors flex items-center justify-center gap-1"
                      >
                        <Trash2 className="w-3 h-3" />
                        삭제
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 사용법 안내 */}
        <div className="bg-blue-50 rounded-lg p-6 mt-8">
          <h3 className="text-lg font-bold text-blue-900 mb-3">사용법 안내</h3>
          <div className="text-sm text-blue-800 space-y-2">
            <p><strong>1. 기존 이미지 테스트:</strong> S3 버킷 권한 설정이 필요한 경우 서명된 URL을 생성하여 접근할 수 있습니다.</p>
            <p><strong>2. 이미지 업로드:</strong> 최대 10MB까지 이미지 파일을 업로드할 수 있습니다.</p>
            <p><strong>3. 이미지 관리:</strong> 업로드된 이미지를 보기, 서명된 URL 생성, 삭제할 수 있습니다.</p>
            <p><strong>4. 서명된 URL:</strong> 임시 접근 URL을 생성하여 권한이 없는 이미지에도 접근할 수 있습니다.</p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
