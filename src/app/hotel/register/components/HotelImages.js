"use client";

import { useState, useEffect } from "react";
import axiosInstance from "@/lib/axios";

const HotelImages = ({ images, events, updateFormData, errors, readOnly = false, formData, isEditMode = false }) => {
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadingThumbnail, setUploadingThumbnail] = useState(false);
  const [dragOverThumbnail, setDragOverThumbnail] = useState(false);

  // images가 배열이 아닐 경우 빈 배열로 변환
  const safeImages = Array.isArray(images) ? images : [];
  
  // 대표 이미지 URL
  const thumbnailImageUrl = formData?.hotelInfo?.imageUrl || "";
  
  // 디버깅: 대표 이미지 URL 확인
  useEffect(() => {
    if (thumbnailImageUrl) {
      console.log('🔍 [대표 이미지 URL] 현재 값:', thumbnailImageUrl);
    }
  }, [thumbnailImageUrl]);

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    setDragOver(false);
    
    // 현재 이미지 개수 확인
    const currentImages = Array.isArray(images) ? images : [];
    const currentCount = currentImages.length;
    const maxCount = 10;
    
    // 최대 개수 초과 시 드롭 차단
    if (currentCount >= maxCount) {
      alert(`호텔 이미지는 최대 ${maxCount}개까지 업로드할 수 있습니다.`);
      return;
    }
    
    const files = Array.from(e.dataTransfer.files);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length > 0) {
      await handleImageFiles(imageFiles);
    }
  };

  const handleFileSelect = async (e) => {
    // 현재 이미지 개수 확인
    const currentImages = Array.isArray(images) ? images : [];
    const currentCount = currentImages.length;
    const maxCount = 10;
    
    // 최대 개수 초과 시 선택 차단
    if (currentCount >= maxCount) {
      alert(`호텔 이미지는 최대 ${maxCount}개까지 업로드할 수 있습니다.`);
      e.target.value = '';
      return;
    }
    
    const files = Array.from(e.target.files);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length > 0) {
      await handleImageFiles(imageFiles);
    }
    
    // 같은 파일을 다시 선택할 수 있도록 input 값 초기화
    e.target.value = '';
  };

  // 대표 이미지 업로드 핸들러 (1장만)
  const handleThumbnailFile = async (file) => {
    if (readOnly) return;
    
    try {
      setUploadingThumbnail(true);
      
      // FormData 생성
      const uploadFormData = new FormData();
      uploadFormData.append('images', file);

      // 등록 페이지와 수정 페이지 구분하여 다른 엔드포인트 사용
      // axiosInstance의 baseURL이 /api이므로 /api를 제거
      const endpoint = isEditMode ? '/admin/image/hotel/images/edit' : '/imageUpload/hotel/images/register';
      
      // S3에 이미지 업로드
      const response = await axiosInstance.post(endpoint, uploadFormData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success && response.data.images && response.data.images.length > 0) {
        // 첫 번째 이미지만 대표 이미지로 설정
        const uploadedImage = response.data.images[0];
        console.log('🔍 [대표 이미지 업로드 성공] 응답 데이터:', response.data);
        console.log('🔍 [대표 이미지 업로드 성공] uploadedImage:', uploadedImage);
        console.log('🔍 [대표 이미지 업로드 성공] originUrl:', uploadedImage.originUrl);
        
        // originUrl이 없으면 다른 필드 확인
        const imageUrl = uploadedImage.originUrl || uploadedImage.imageUrl || uploadedImage.url;
        console.log('🔍 [대표 이미지 업로드 성공] 최종 imageUrl:', imageUrl);
        
        if (imageUrl) {
          updateFormData('hotelInfo', { imageUrl: imageUrl });
          console.log('🔍 [대표 이미지 업로드 성공] formData 업데이트 완료');
        } else {
          console.error('❌ [대표 이미지 업로드 실패] imageUrl을 찾을 수 없습니다:', uploadedImage);
          alert('대표 이미지 URL을 찾을 수 없습니다. 응답 데이터를 확인해주세요.');
        }
      } else {
        console.error('❌ [대표 이미지 업로드 실패] 응답 데이터:', response.data);
        alert('대표 이미지 업로드에 실패했습니다.');
      }
    } catch (error) {
      console.error('대표 이미지 업로드 실패:', error);
      alert('대표 이미지 업로드 중 오류가 발생했습니다.');
    } finally {
      setUploadingThumbnail(false);
    }
  };

  // 대표 이미지 드래그 앤 드롭 핸들러
  const handleThumbnailDrop = async (e) => {
    e.preventDefault();
    setDragOverThumbnail(false);
    
    const files = Array.from(e.dataTransfer.files);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length > 0) {
      // 첫 번째 파일만 사용
      await handleThumbnailFile(imageFiles[0]);
    }
  };

  // 대표 이미지 파일 선택 핸들러
  const handleThumbnailSelect = async (e) => {
    const files = Array.from(e.target.files);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length > 0) {
      // 첫 번째 파일만 사용
      await handleThumbnailFile(imageFiles[0]);
    }
    
    // 같은 파일을 다시 선택할 수 있도록 input 값 초기화
    e.target.value = '';
  };

  // 대표 이미지 삭제 핸들러
  const removeThumbnail = () => {
    if (readOnly) return;
    updateFormData('hotelInfo', { imageUrl: '' });
  };

  // 호텔 이미지 업로드 핸들러 (다중 이미지, HotelImage 테이블용)
  const handleImageFiles = async (files) => {
    if (readOnly) return;
    
    // 현재 이미지 개수 확인
    const currentImages = Array.isArray(images) ? images : [];
    const currentCount = currentImages.length;
    const maxCount = 10;
    
    // 최대 개수 초과 체크
    if (currentCount >= maxCount) {
      alert(`호텔 이미지는 최대 ${maxCount}개까지 업로드할 수 있습니다.`);
      return;
    }
    
    // 추가 가능한 개수 계산
    const remainingSlots = maxCount - currentCount;
    const filesToUpload = files.slice(0, remainingSlots);
    
    if (files.length > remainingSlots) {
      alert(`이미지가 너무 많습니다. ${remainingSlots}개만 업로드됩니다. (최대 ${maxCount}개)`);
    }
    
    try {
      setUploading(true);
      
      // FormData 생성
      const uploadFormData = new FormData();
      filesToUpload.forEach((file) => {
        uploadFormData.append('images', file);
      });

      // 등록 페이지와 수정 페이지 구분하여 다른 엔드포인트 사용
      // axiosInstance의 baseURL이 /api이므로 /api를 제거
      const endpoint = isEditMode ? '/admin/image/hotel/images/edit' : '/imageUpload/hotel/images/register';
      
      // S3에 이미지 업로드
      const response = await axiosInstance.post(endpoint, uploadFormData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success && response.data.images) {
        // 업로드된 이미지 정보를 formData.images에 추가 (HotelImage 테이블용)
        const uploadedImages = response.data.images.map((img) => ({
          id: img.id, // 수정 페이지에서는 항상 id 존재 (DB 저장 후 반환), 등록 페이지에서는 임시 ID
          originUrl: img.originUrl,
          smallUrl: img.smallUrl || img.originUrl,
        }));

        const updatedImages = [...currentImages, ...uploadedImages];
        updateFormData('images', updatedImages);
      } else {
        alert('이미지 업로드에 실패했습니다.');
      }
    } catch (error) {
      console.error('이미지 업로드 실패:', error);
      alert('이미지 업로드 중 오류가 발생했습니다.');
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (imageId) => {
    if (readOnly) return;
    
    console.log('🔍 [호텔 이미지 삭제] 시작');
    console.log('🔍 [호텔 이미지 삭제] 전달받은 imageId:', imageId, '타입:', typeof imageId);
    
    if (!imageId) {
      console.error('❌ [호텔 이미지 삭제] imageId가 없습니다.');
      alert('이미지 삭제 중 오류가 발생했습니다: 이미지 ID가 없습니다.');
      return;
    }
    
    const currentImages = Array.isArray(images) ? images : [];
    console.log('🔍 [호텔 이미지 삭제] 현재 이미지 목록:', currentImages.map(img => ({ id: img.id, originUrl: img.originUrl })));
    
    // imageId와 일치하는 이미지만 제거
    const updatedImages = currentImages.filter((img, idx) => {
      console.log(`🔍 [호텔 이미지 삭제] 필터링 체크 ${idx}:`, {
        imgId: img.id,
        imgIdType: typeof img.id,
        imageId: imageId,
        imageIdType: typeof imageId,
        비교결과: String(img.id) !== String(imageId),
        originUrl: img.originUrl
      });
      
      if (!img.id) {
        console.warn('⚠️ [호텔 이미지 삭제] 이미지에 id가 없습니다:', img);
        // id가 없는 경우는 유지 (등록 페이지의 임시 이미지일 수 있음)
        return true;
      }
      const shouldKeep = String(img.id) !== String(imageId);
      console.log(`  → ${shouldKeep ? '유지' : '삭제'}`);
      return shouldKeep;
    });
    
    console.log('🔍 [호텔 이미지 삭제] 필터링 후 이미지 목록:', updatedImages.map(img => ({ id: img.id, originUrl: img.originUrl })));
    console.log('🔍 [호텔 이미지 삭제] 삭제된 이미지 수:', currentImages.length - updatedImages.length);
    
    updateFormData('images', updatedImages);
    
    // 호텔 메인 이미지와 이미지 목록은 별개의 개념이므로, 이미지 삭제 시 메인 이미지는 변경하지 않음
    // (사용자가 직접 대표 이미지를 선택/변경할 수 있음)
    
    console.log('🔍 [호텔 이미지 삭제] 완료');
  };

  const addEvent = () => {
    const newEvent = {
      id: Date.now(),
      title: "",
      description: "",
      startDate: "",
      endDate: "",
      discount: "",
      isActive: true
    };
    
    updateFormData("events", [...events, newEvent]);
  };

  const removeEvent = (eventId) => {
    updateFormData("events", events.filter(event => event.id !== eventId));
  };

  const updateEvent = (eventId, data) => {
    updateFormData("events", events.map(event => 
      event.id === eventId ? { ...event, ...data } : event
    ));
  };

  return (
    <div className="space-y-8">
      {/* 대표 이미지 */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-lg font-medium text-gray-900">대표 이미지</h3>
            <p className="text-sm text-gray-500 mt-1">호텔을 대표하는 이미지를 등록하세요 (1장 필수)</p>
          </div>
          {!readOnly && (
            <>
              <input
                type="file"
                accept="image/*"
                onChange={handleThumbnailSelect}
                className="hidden"
                id="thumbnail-upload"
              />
              <label
                htmlFor="thumbnail-upload"
                className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 cursor-pointer text-sm"
              >
                {thumbnailImageUrl ? "대표 이미지 변경" : "대표 이미지 선택"}
              </label>
            </>
          )}
        </div>
        
        {/* 대표 이미지 업로드 영역 */}
        <div
          className={`border-2 border-dashed rounded-lg p-6 transition-colors ${
            dragOverThumbnail 
              ? "border-purple-500 bg-purple-50" 
              : "border-gray-300 hover:border-gray-400"
          }`}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOverThumbnail(true);
          }}
          onDragLeave={(e) => {
            e.preventDefault();
            setDragOverThumbnail(false);
          }}
          onDrop={handleThumbnailDrop}
        >
          {thumbnailImageUrl ? (
            <div className="flex justify-center">
              <div className="relative group">
                <div className="aspect-video bg-gray-200 rounded-lg overflow-hidden max-w-xl w-full">
                  <img 
                    src={thumbnailImageUrl} 
                    alt="대표 이미지" 
                    className="w-full h-full object-cover" 
                  />
                </div>
                {!readOnly && (
                  <button 
                    onClick={removeThumbnail}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 z-10"
                  >
                    ×
                  </button>
                )}
                <div className="absolute bottom-2 left-2 bg-purple-600 text-white text-xs px-3 py-1 rounded">
                  대표 이미지
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-gray-400 text-6xl mb-4">🖼️</div>
              <h4 className="text-lg font-medium text-gray-900 mb-2">
                대표 이미지를 드래그하여 업로드하세요
              </h4>
              <p className="text-gray-500 mb-4">
                또는 위의 버튼을 클릭하여 파일을 선택하세요
              </p>
              <p className="text-xs text-gray-400">
                JPG, PNG, GIF 파일만 업로드 가능 (최대 10MB, 1장만 업로드 가능)
              </p>
            </div>
          )}
        </div>

        {/* 업로드 중 표시 */}
        {uploadingThumbnail && (
          <div className="mt-4 text-center">
            <div className="inline-flex items-center space-x-2 text-purple-600">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-600"></div>
              <span className="text-sm">대표 이미지 업로드 중...</span>
            </div>
          </div>
        )}

        {errors.imageUrl && (
          <p className="mt-2 text-sm text-red-500">{errors.imageUrl}</p>
        )}
      </div>

      {/* 호텔 이미지 */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-lg font-medium text-gray-900">호텔 이미지 (최대 10개)</h3>
              <span className={`text-sm font-medium ${
                safeImages.length >= 10
                  ? 'text-red-500'
                  : 'text-gray-500'
              }`}>
                ({safeImages.length}/10)
              </span>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              호텔의 외관, 로비, 객실 등 다양한 이미지를 업로드하세요. (선택사항, 대표 이미지와 별도로 관리)
            </p>
          </div>
          {!readOnly && (
            <>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
                id="image-upload"
                disabled={safeImages.length >= 10}
              />
              <label
                htmlFor="image-upload"
                className={`inline-flex items-center px-4 py-2 rounded-md text-sm ${
                  safeImages.length >= 10
                    ? 'bg-gray-400 text-white cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700 cursor-pointer'
                }`}
              >
                이미지 선택
              </label>
            </>
          )}
        </div>
        
        {/* 이미지 업로드 영역 */}
        <div
          className={`border-2 border-dashed rounded-lg p-8 transition-colors ${
            safeImages.length >= 10
              ? "border-gray-300 cursor-not-allowed"
              : dragOver 
                ? "border-blue-500 bg-blue-50" 
                : "border-gray-300 hover:border-gray-400"
          }`}
          onDragOver={safeImages.length < 10 ? handleDragOver : undefined}
          onDragLeave={safeImages.length < 10 ? handleDragLeave : undefined}
          onDrop={safeImages.length < 10 ? handleDrop : undefined}
        >
          {safeImages.length === 0 ? (
            // 이미지가 없을 때 안내 메시지
            <div className="text-center">
              <div className="text-gray-400 text-6xl mb-4">📸</div>
              <h4 className="text-lg font-medium text-gray-900 mb-2">
                이미지를 드래그하여 업로드하세요
              </h4>
              <p className="text-gray-500 mb-4">
                또는 위의 이미지 선택 버튼을 클릭하여 파일을 선택하세요
              </p>
              <p className="text-xs text-gray-400">
                JPG, PNG, GIF 파일만 업로드 가능 (최대 10MB)
              </p>
            </div>
          ) : (
            // 이미지가 있을 때 그리드로 표시
            <div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {safeImages.map((image, index) => (
                  <div key={image.id || index} className="relative group p-[5px]">
                    <div className="aspect-square bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
                      {image.originUrl || image.smallUrl ? (
                        <img 
                          src={image.originUrl || image.smallUrl} 
                          alt="호텔 이미지" 
                          className="w-full h-full object-cover" 
                        />
                      ) : (
                        <span className="text-gray-400 text-2xl">🖼️</span>
                      )}
                    </div>
                    {!readOnly && (
                      <button 
                        onClick={() => {
                          console.log('🔍 [호텔 이미지 삭제 버튼 클릭]');
                          console.log('  - 클릭한 이미지 정보:', {
                            id: image.id,
                            idType: typeof image.id,
                            originUrl: image.originUrl,
                            smallUrl: image.smallUrl,
                            index: index
                          });
                          console.log('  - 현재 모든 이미지:', safeImages.map(img => ({ id: img.id, originUrl: img.originUrl })));
                          console.log('  - 현재 호텔 메인 이미지:', formData?.hotelInfo?.imageUrl);
                          removeImage(image.id);
                        }}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <div className="mt-4 text-center">
                <p className="text-xs text-gray-400">
                  더 많은 이미지를 추가하려면 드래그하거나 이미지 선택 버튼을 사용하세요
                </p>
              </div>
            </div>
          )}
        </div>

        {/* 업로드 중 표시 */}
        {uploading && (
          <div className="mt-4 text-center">
            <div className="inline-flex items-center space-x-2 text-blue-600">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
              <span className="text-sm">이미지 업로드 중...</span>
            </div>
          </div>
        )}

        {errors.images && (
          <p className="mt-2 text-sm text-red-500">{errors.images}</p>
        )}
      </div>

      {/* 이벤트 관리 */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">이벤트 관리</h3>
          {!readOnly && (
            <button
              onClick={addEvent}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              + 이벤트 추가
            </button>
          )}
        </div>
        <p className="text-sm text-gray-500 mb-4">
          특가 이벤트나 프로모션을 등록하여 고객에게 제공하세요.
        </p>

        {events.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <div className="text-gray-400 text-4xl mb-2">🎉</div>
            <p className="text-gray-500">등록된 이벤트가 없습니다</p>
          </div>
        ) : (
          <div className="space-y-4">
            {events.map((event, index) => (
              <div key={event.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-4">
                  <h4 className="font-medium text-gray-900">이벤트 {index + 1}</h4>
                  {!readOnly && (
                    <button
                      onClick={() => removeEvent(event.id)}
                      className="text-red-400 hover:text-red-600"
                    >
                      삭제
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      이벤트 제목
                    </label>
                    <input
                      type="text"
                      value={event.title || ""}
                      onChange={(e) => updateEvent(event.id, { title: e.target.value })}
                      readOnly={readOnly}
                      disabled={readOnly}
                      className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        readOnly ? "bg-gray-50 cursor-not-allowed" : ""
                      }`}
                      placeholder="예: 신규 오픈 특가"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      할인율 (%)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={event.discount || ""}
                      onChange={(e) => updateEvent(event.id, { discount: e.target.value })}
                      readOnly={readOnly}
                      disabled={readOnly}
                      className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        readOnly ? "bg-gray-50 cursor-not-allowed" : ""
                      }`}
                      placeholder="20"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      시작일
                    </label>
                    <input
                      type="date"
                      value={event.startDate || ""}
                      onChange={(e) => updateEvent(event.id, { startDate: e.target.value })}
                      readOnly={readOnly}
                      disabled={readOnly}
                      className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        readOnly ? "bg-gray-50 cursor-not-allowed" : ""
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      종료일
                    </label>
                    <input
                      type="date"
                      value={event.endDate || ""}
                      onChange={(e) => updateEvent(event.id, { endDate: e.target.value })}
                      readOnly={readOnly}
                      disabled={readOnly}
                      className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        readOnly ? "bg-gray-50 cursor-not-allowed" : ""
                      }`}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      이벤트 설명
                    </label>
                    <textarea
                      value={event.description || ""}
                      onChange={(e) => updateEvent(event.id, { description: e.target.value })}
                      rows={3}
                      readOnly={readOnly}
                      disabled={readOnly}
                      className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        readOnly ? "bg-gray-50 cursor-not-allowed" : ""
                      }`}
                      placeholder="이벤트 상세 내용을 입력하세요"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={event.isActive || false}
                        onChange={(e) => updateEvent(event.id, { isActive: e.target.checked })}
                        disabled={readOnly}
                        className={`rounded border-gray-300 text-blue-600 focus:ring-blue-500 ${
                          readOnly ? "cursor-not-allowed opacity-50" : ""
                        }`}
                      />
                      <span className="text-sm text-gray-700">이벤트 활성화</span>
                    </label>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HotelImages;
