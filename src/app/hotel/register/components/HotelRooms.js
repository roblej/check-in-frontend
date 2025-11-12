"use client";

import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import axiosInstance from "@/lib/axios";

const HotelRooms = ({
  rooms,
  addRoom,
  removeRoom,
  updateRoom,
  errors,
  initialData,
  readOnly = false,
}) => {
  const roomImageBaseUrl = process.env.NEXT_PUBLIC_ROOM_IMAGE_BASE_URL;
  if (!roomImageBaseUrl) {
    throw new Error(
      "NEXT_PUBLIC_ROOM_IMAGE_BASE_URL 환경 변수가 설정되어 있지 않습니다."
    );
  }
  const ensureTrailingSlash = (url) => (url.endsWith("/") ? url : `${url}/`);
  const baseUrlWithSlash = ensureTrailingSlash(roomImageBaseUrl);
  const [expandedRoom, setExpandedRoom] = useState(null);
  const [uploadingRooms, setUploadingRooms] = useState({}); // roomId별 업로드 상태
  const [uploadingThumbnails, setUploadingThumbnails] = useState({}); // roomId별 대표 이미지 업로드 상태
  const capacitySelectRefs = useRef({}); // 수용 인원 선택 필드 ref

  // 외부에서 오류가 발생했을 때 포커스 이동 (useEffect로 처리)
  useEffect(() => {
    if (errors.capacity) {
      const roomId = errors.capacity.roomId;
      if (roomId && capacitySelectRefs.current[roomId]) {
        // 해당 객실이 접혀있으면 펼치기
        setExpandedRoom(roomId);
        // 포커스 이동
        setTimeout(() => {
          capacitySelectRefs.current[roomId]?.focus();
        }, 100);
      }
    }
  }, [errors.capacity]);

  const toggleRoomExpansion = (roomId) => {
    setExpandedRoom(expandedRoom === roomId ? null : roomId);
  };

  const handleRoomImageFiles = async (roomId, files) => {
    if (readOnly) return;

    // 현재 객실의 이미지 개수 확인
    const room = rooms.find((r) => r.id === roomId);
    const currentImages = Array.isArray(room?.images) ? room.images : [];
    const currentCount = currentImages.length;
    const maxCount = 10;

    // 최대 개수 초과 체크
    if (currentCount >= maxCount) {
      alert(`객실 이미지는 최대 ${maxCount}개까지 업로드할 수 있습니다.`);
      return;
    }

    // 추가 가능한 개수 계산
    const remainingSlots = maxCount - currentCount;
    const filesToUpload = files.slice(0, remainingSlots);

    if (files.length > remainingSlots) {
      alert(
        `이미지가 너무 많습니다. ${remainingSlots}개만 업로드됩니다. (최대 ${maxCount}개)`
      );
    }

    try {
      setUploadingRooms((prev) => ({ ...prev, [roomId]: true }));

      // FormData 생성
      const formData = new FormData();
      filesToUpload.forEach((file) => {
        formData.append("images", file);
      });

      // S3에 객실 이미지 업로드 (호텔 등록 중이므로 roomIdx 없이)
      // 실제로는 마스터 승인 후 roomIdx가 생성되므로, 여기서는 이미지만 업로드하고
      // 임시 ID로 관리 (마스터 승인 시 실제 roomIdx와 연결)
      const response = await axiosInstance.post(
        "/imageUpload/hotel/room/images",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data.success && response.data.images) {
        // 업로드된 이미지 정보 (파일명만 저장됨)
        // 기존 이미지의 최대 imageOrder를 찾아서 그 다음 순서부터 할당
        const maxOrder =
          currentImages.length > 0
            ? Math.max(...currentImages.map((img) => img.imageOrder || 0))
            : 0;

        const uploadedImages = response.data.images.map((img, idx) => ({
          id: img.roomImageIdx || Date.now() + Math.random(),
          roomImageIdx: img.roomImageIdx || null, // roomImageIdx도 포함
          imageUrl: img.imageUrl, // 파일명만 저장됨
          imageOrder: maxOrder + idx + 1, // 기존 최대 순서 + 1부터 시작
        }));

        // 해당 객실의 기존 이미지에 추가
        const updatedImages = [...currentImages, ...uploadedImages];

        updateRoom(roomId, { images: updatedImages });
      } else {
        alert("객실 이미지 업로드에 실패했습니다.");
      }
    } catch (error) {
      console.error("객실 이미지 업로드 실패:", error);
      alert("객실 이미지 업로드 중 오류가 발생했습니다.");
    } finally {
      setUploadingRooms((prev) => ({ ...prev, [roomId]: false }));
    }
  };

  const handleRoomImageDrop = async (roomId, e) => {
    e.preventDefault();

    // 현재 객실의 이미지 개수 확인
    const room = rooms.find((r) => r.id === roomId);
    const currentImages = Array.isArray(room?.images) ? room.images : [];
    const currentCount = currentImages.length;
    const maxCount = 10;

    // 최대 개수 초과 시 드롭 차단
    if (currentCount >= maxCount) {
      alert(`객실 이미지는 최대 ${maxCount}개까지 업로드할 수 있습니다.`);
      return;
    }

    const files = Array.from(e.dataTransfer.files);
    const imageFiles = files.filter((file) => file.type.startsWith("image/"));

    if (imageFiles.length > 0) {
      await handleRoomImageFiles(roomId, imageFiles);
    }
  };

  const handleRoomImageSelect = async (roomId, e) => {
    // 현재 객실의 이미지 개수 확인
    const room = rooms.find((r) => r.id === roomId);
    const currentImages = Array.isArray(room?.images) ? room.images : [];
    const currentCount = currentImages.length;
    const maxCount = 10;

    // 최대 개수 초과 시 선택 차단
    if (currentCount >= maxCount) {
      alert(`객실 이미지는 최대 ${maxCount}개까지 업로드할 수 있습니다.`);
      e.target.value = "";
      return;
    }

    const files = Array.from(e.target.files);
    const imageFiles = files.filter((file) => file.type.startsWith("image/"));

    if (imageFiles.length > 0) {
      await handleRoomImageFiles(roomId, imageFiles);
    }

    e.target.value = "";
  };

  const removeRoomImage = (roomId, imageId) => {
    if (readOnly) return;

    const room = rooms.find((r) => r.id === roomId);
    if (!room) return;

    const currentImages = Array.isArray(room.images) ? room.images : [];
    const updatedImages = currentImages.filter((img) => img.id !== imageId);

    // 이미지 삭제 후 순서 재조정 (1부터 시작)
    const reorderedImages = updatedImages.map((img, idx) => ({
      ...img,
      imageOrder: idx + 1,
    }));

    updateRoom(roomId, { images: reorderedImages });
  };

  // 객실 대표 이미지 업로드 핸들러 (1장만, Room.imageUrl용)
  const handleRoomThumbnailFile = async (roomId, file) => {
    if (readOnly) return;

    try {
      setUploadingThumbnails((prev) => ({ ...prev, [roomId]: true }));

      // FormData 생성
      const formData = new FormData();
      formData.append("images", file);

      // S3에 객실 대표 이미지 업로드
      const response = await axiosInstance.post(
        "/imageUpload/hotel/room/images",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (
        response.data.success &&
        response.data.images &&
        response.data.images.length > 0
      ) {
        // 첫 번째 이미지만 대표 이미지로 설정
        const uploadedImage = response.data.images[0];
        updateRoom(roomId, { imageUrl: uploadedImage.imageUrl });
      } else {
        alert("객실 대표 이미지 업로드에 실패했습니다.");
      }
    } catch (error) {
      console.error("객실 대표 이미지 업로드 실패:", error);
      alert("객실 대표 이미지 업로드 중 오류가 발생했습니다.");
    } finally {
      setUploadingThumbnails((prev) => ({ ...prev, [roomId]: false }));
    }
  };

  // 객실 대표 이미지 드래그 앤 드롭 핸들러
  const handleRoomThumbnailDrop = async (roomId, e) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    const imageFiles = files.filter((file) => file.type.startsWith("image/"));

    if (imageFiles.length > 0) {
      // 첫 번째 파일만 사용
      await handleRoomThumbnailFile(roomId, imageFiles[0]);
    }
  };

  // 객실 대표 이미지 파일 선택 핸들러
  const handleRoomThumbnailSelect = async (roomId, e) => {
    const files = Array.from(e.target.files);
    const imageFiles = files.filter((file) => file.type.startsWith("image/"));

    if (imageFiles.length > 0) {
      // 첫 번째 파일만 사용
      await handleRoomThumbnailFile(roomId, imageFiles[0]);
    }

    e.target.value = "";
  };

  // 객실 대표 이미지 삭제 핸들러
  const removeRoomThumbnail = (roomId) => {
    if (readOnly) return;
    updateRoom(roomId, { imageUrl: "" });
  };

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium text-gray-900">
            객실 관리 <span className="text-red-500">*</span>
          </h3>
          <p className="text-sm text-gray-500">
            호텔의 객실 정보를 등록하세요 (최소 1개 필수)
          </p>
        </div>
        {!readOnly && (
          <button
            onClick={addRoom}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            + 객실 추가
          </button>
        )}
      </div>

      {/* 객실 목록 */}
      {rooms.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <div className="text-gray-400 text-6xl mb-4">🛏️</div>
          <h4 className="text-lg font-medium text-gray-900 mb-2">
            등록된 객실이 없습니다
          </h4>
          <p className="text-gray-500 mb-4">첫 번째 객실을 추가해보세요</p>
          {!readOnly && (
            <button
              onClick={addRoom}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              객실 추가하기
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {rooms.map((room, index) => (
            <div
              key={room.id}
              className="border border-gray-200 rounded-lg overflow-hidden"
            >
              {/* 객실 헤더 */}
              <div className="bg-gray-50 px-4 py-3 flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <span className="text-sm font-medium text-gray-500">
                    객실 {index + 1}
                  </span>
                  <input
                    type="text"
                    value={room.name}
                    onChange={(e) =>
                      updateRoom(room.id, { name: e.target.value })
                    }
                    readOnly={readOnly}
                    disabled={readOnly}
                    className={`text-lg font-medium bg-transparent border-none focus:outline-none focus:ring-0 p-0 ${
                      readOnly ? "cursor-not-allowed" : ""
                    }`}
                    placeholder="객실명을 입력하세요"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => toggleRoomExpansion(room.id)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    {expandedRoom === room.id ? "접기" : "펼치기"}
                  </button>
                  {!readOnly && (
                    <button
                      onClick={() => removeRoom(room.id)}
                      className="text-red-400 hover:text-red-600"
                    >
                      삭제
                    </button>
                  )}
                </div>
              </div>

              {/* 객실 상세 정보 */}
              {expandedRoom === room.id && (
                <div className="p-4 space-y-6">
                  {/* 기본 정보 */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        침대 타입
                      </label>
                      <select
                        value={room.bedType}
                        onChange={(e) =>
                          updateRoom(room.id, { bedType: e.target.value })
                        }
                        disabled={readOnly}
                        className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          readOnly ? "bg-gray-100 cursor-not-allowed" : ""
                        }`}
                      >
                        <option value="">침대 타입을 선택하세요</option>
                        <option value="싱글">싱글</option>
                        <option value="더블">더블</option>
                        <option value="트윈">트윈</option>
                        <option value="퀸">퀸</option>
                        <option value="킹">킹</option>
                        <option value="온돌">온돌</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        가격 (원)
                      </label>
                      <input
                        type="number"
                        value={room.price || ""}
                        onChange={(e) =>
                          updateRoom(room.id, { price: e.target.value })
                        }
                        readOnly={readOnly}
                        disabled={readOnly}
                        className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          readOnly ? "bg-gray-100 cursor-not-allowed" : ""
                        }`}
                        placeholder="100000"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        수용 인원
                      </label>
                      <select
                        value={room.capacity || 2}
                        onChange={(e) =>
                          updateRoom(room.id, {
                            capacity: parseInt(e.target.value, 10),
                          })
                        }
                        ref={(el) => {
                          if (el) {
                            capacitySelectRefs.current[room.id] = el;
                          }
                        }}
                        disabled={readOnly}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          errors.capacity?.roomId === room.id
                            ? "border-red-500 focus:ring-red-500"
                            : "border-gray-300"
                        } ${readOnly ? "bg-gray-100 cursor-not-allowed" : ""}`}
                      >
                        <option value={2}>2명</option>
                        <option value={4}>4명</option>
                        <option value={6}>6명</option>
                        <option value={8}>8명</option>
                      </select>
                      {errors.capacity?.roomId === room.id && (
                        <p className="mt-1 text-sm text-red-500">
                          {errors.capacity?.message ||
                            "수용 인원을 선택해주세요"}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        객실 크기 (㎡)
                      </label>
                      <input
                        type="text"
                        value={room.size}
                        onChange={(e) =>
                          updateRoom(room.id, { size: e.target.value })
                        }
                        readOnly={readOnly}
                        disabled={readOnly}
                        className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          readOnly ? "bg-gray-100 cursor-not-allowed" : ""
                        }`}
                        placeholder="25"
                      />
                    </div>
                  </div>

                  {/* 옵션 (체크박스) */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      객실 옵션
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={room.refundable || false}
                          onChange={(e) =>
                            updateRoom(room.id, {
                              refundable: e.target.checked,
                            })
                          }
                          disabled={readOnly}
                          className={`rounded border-gray-300 text-blue-600 focus:ring-blue-500 ${
                            readOnly ? "cursor-not-allowed" : ""
                          }`}
                        />
                        <span className="text-sm text-gray-700">환불 가능</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={room.breakfastIncluded || false}
                          onChange={(e) =>
                            updateRoom(room.id, {
                              breakfastIncluded: e.target.checked,
                            })
                          }
                          disabled={readOnly}
                          className={`rounded border-gray-300 text-blue-600 focus:ring-blue-500 ${
                            readOnly ? "cursor-not-allowed" : ""
                          }`}
                        />
                        <span className="text-sm text-gray-700">조식 포함</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={room.smoking || false}
                          onChange={(e) =>
                            updateRoom(room.id, { smoking: e.target.checked })
                          }
                          disabled={readOnly}
                          className={`rounded border-gray-300 text-blue-600 focus:ring-blue-500 ${
                            readOnly ? "cursor-not-allowed" : ""
                          }`}
                        />
                        <span className="text-sm text-gray-700">흡연 가능</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={
                            room.status === 1 || room.status === undefined
                          }
                          onChange={(e) =>
                            updateRoom(room.id, {
                              status: e.target.checked ? 1 : 0,
                            })
                          }
                          disabled={readOnly}
                          className={`rounded border-gray-300 text-blue-600 focus:ring-blue-500 ${
                            readOnly ? "cursor-not-allowed" : ""
                          }`}
                        />
                        <span className="text-sm text-gray-700">사용 가능</span>
                      </label>
                    </div>
                  </div>

                  {/* 객실 대표 이미지 (Room.imageUrl) */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          객실 대표 이미지
                        </label>
                        <p className="text-xs text-gray-500 mt-1">
                          객실을 대표하는 이미지를 등록하세요 (1장)
                        </p>
                      </div>
                      {!readOnly && (
                        <>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) =>
                              handleRoomThumbnailSelect(room.id, e)
                            }
                            className="hidden"
                            id={`room-thumbnail-upload-${room.id}`}
                          />
                          <label
                            htmlFor={`room-thumbnail-upload-${room.id}`}
                            className="inline-flex items-center px-3 py-1 bg-purple-600 text-white rounded-md hover:bg-purple-700 cursor-pointer text-sm"
                          >
                            {room.imageUrl
                              ? "대표 이미지 변경"
                              : "대표 이미지 선택"}
                          </label>
                        </>
                      )}
                    </div>
                    <div
                      className={`border-2 border-dashed rounded-lg p-6 transition-colors ${"border-gray-300 hover:border-gray-400"}`}
                      onDragOver={(e) => {
                        e.preventDefault();
                      }}
                      onDrop={(e) => handleRoomThumbnailDrop(room.id, e)}
                    >
                      {room.imageUrl ? (
                        <div className="flex justify-center">
                          <div className="relative group">
                            <div className="aspect-video bg-gray-200 rounded-lg overflow-hidden max-w-xl w-full relative">
                              <Image
                                src={
                                  room.imageUrl?.startsWith("http")
                                    ? room.imageUrl
                                    : `${baseUrlWithSlash}${room.imageUrl}`
                                }
                                alt="객실 대표 이미지"
                                fill
                                sizes="(max-width: 768px) 100vw, 640px"
                                className="object-cover"
                              />
                            </div>
                            {!readOnly && (
                              <button
                                onClick={() => removeRoomThumbnail(room.id)}
                                className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
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
                        <div className="text-center">
                          <div className="text-gray-400 text-4xl mb-2">🖼️</div>
                          <p className="text-gray-500 text-sm">
                            객실 대표 이미지를 드래그하여 업로드하세요
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            또는 위의 버튼을 클릭하여 파일을 선택하세요
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            JPG, PNG, GIF 파일만 업로드 가능 (최대 10MB, 1장만
                            업로드 가능)
                          </p>
                        </div>
                      )}
                    </div>
                    {uploadingThumbnails[room.id] && (
                      <div className="mt-2 text-center">
                        <div className="inline-flex items-center space-x-2 text-purple-600 text-sm">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>
                          <span>대표 이미지 업로드 중...</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 객실 상세 이미지 (RoomImage 테이블용) */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <div>
                        <div className="flex items-center space-x-2">
                          <label className="block text-sm font-medium text-gray-700">
                            객실 상세 이미지 (최대 10개)
                          </label>
                          <span
                            className={`text-sm font-medium ${
                              (Array.isArray(room.images)
                                ? room.images.length
                                : 0) >= 10
                                ? "text-red-500"
                                : "text-gray-500"
                            }`}
                          >
                            (
                            {Array.isArray(room.images)
                              ? room.images.length
                              : 0}
                            /10)
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          객실의 다양한 이미지를 업로드하세요
                        </p>
                      </div>
                      {!readOnly && (
                        <>
                          <input
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={(e) => handleRoomImageSelect(room.id, e)}
                            className="hidden"
                            id={`room-image-upload-${room.id}`}
                            disabled={
                              (Array.isArray(room.images)
                                ? room.images.length
                                : 0) >= 10
                            }
                          />
                          <label
                            htmlFor={`room-image-upload-${room.id}`}
                            className={`inline-flex items-center px-3 py-1 rounded-md text-sm ${
                              (Array.isArray(room.images)
                                ? room.images.length
                                : 0) >= 10
                                ? "bg-gray-400 text-white cursor-not-allowed"
                                : "bg-blue-600 text-white hover:bg-blue-700 cursor-pointer"
                            }`}
                          >
                            이미지 선택
                          </label>
                        </>
                      )}
                    </div>
                    <div
                      className={`border-2 border-dashed rounded-lg p-6 transition-colors ${
                        (Array.isArray(room.images) ? room.images.length : 0) >=
                        10
                          ? "border-gray-300 cursor-not-allowed"
                          : "border-gray-300 hover:border-gray-400"
                      }`}
                      onDragOver={(e) => {
                        e.preventDefault();
                      }}
                      onDrop={(e) => {
                        if (
                          (Array.isArray(room.images)
                            ? room.images.length
                            : 0) < 10
                        ) {
                          handleRoomImageDrop(room.id, e);
                        }
                      }}
                    >
                      {!room.images ||
                      !Array.isArray(room.images) ||
                      room.images.length === 0 ? (
                        <div className="text-center">
                          <div className="text-gray-400 text-4xl mb-2">📷</div>
                          <p className="text-gray-500 text-sm">
                            객실 이미지를 업로드하세요
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            드래그 앤 드롭 또는 이미지 선택 버튼 사용
                          </p>
                        </div>
                      ) : (
                        <div>
                          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                            {room.images.map((image, imgIndex) => (
                              <div
                                key={image.id || imgIndex}
                                className="relative group"
                              >
                                <div className="aspect-square bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden relative">
                                  {image.imageUrl ? (
                                    <Image
                                      src={
                                        image.imageUrl?.startsWith("http")
                                          ? image.imageUrl
                                          : `${baseUrlWithSlash}${image.imageUrl}`
                                      }
                                      alt="객실 이미지"
                                      fill
                                      sizes="120px"
                                      className="object-cover"
                                    />
                                  ) : (
                                    <span className="text-gray-400 text-xl">
                                      🖼️
                                    </span>
                                  )}
                                </div>
                                {!readOnly && (
                                  <button
                                    onClick={() =>
                                      removeRoomImage(room.id, image.id)
                                    }
                                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 text-xs"
                                  >
                                    ×
                                  </button>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    {uploadingRooms[room.id] && (
                      <div className="mt-2 text-center">
                        <div className="inline-flex items-center space-x-2 text-blue-600 text-sm">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                          <span>이미지 업로드 중...</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* 에러 메시지 */}
      {errors.rooms && (
        <div className="text-red-500 text-sm mt-2">{errors.rooms}</div>
      )}
    </div>
  );
};

export default HotelRooms;
