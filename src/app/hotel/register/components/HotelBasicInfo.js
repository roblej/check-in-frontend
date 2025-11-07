"use client";

import { useEffect, useState } from "react";

const HotelBasicInfo = ({ formData, updateFormData, errors, initialData, readOnly = false }) => {
  // 기본 주소(도로명주소)와 상세주소 분리 관리
  const [baseAddress, setBaseAddress] = useState(""); // 도로명 주소
  const [detailAddress, setDetailAddress] = useState(""); // 상세 주소

  // formData에서 주소가 변경될 때 기본 주소와 상세주소 분리
  useEffect(() => {
    const currentAddress = formData.hotelInfo.adress || "";
    // 주소가 업데이트되었는데 현재 baseAddress와 다르면 (주소 검색으로 업데이트된 경우)
    const expectedAddress = baseAddress + (detailAddress ? " " + detailAddress : "");
    if (currentAddress && currentAddress !== expectedAddress) {
      // 외부에서 주소가 업데이트된 경우 (예: 임시저장 불러오기)
      // 현재 주소를 기본 주소로 설정하고 상세주소는 초기화
      setBaseAddress(currentAddress);
      setDetailAddress("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.hotelInfo.adress]);

  // Daum 우편번호 서비스 스크립트 로드
  useEffect(() => {
    // 스크립트가 이미 로드되었는지 확인
    if (window.daum && window.daum.Postcode) {
      return;
    }

    // 스크립트 동적 로드
    const script = document.createElement('script');
    script.src = '//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js';
    script.async = true;
    document.head.appendChild(script);

    return () => {
      // 컴포넌트 언마운트 시 스크립트 제거 (선택사항)
      // document.head.removeChild(script);
    };
  }, []);

  // 카카오 지도 API 스크립트 로드 (좌표 변환용)
  useEffect(() => {
    // 스크립트가 이미 로드되었는지 확인
    if (window.kakao && window.kakao.maps && window.kakao.maps.services) {
      return;
    }

    // 환경 변수에서 API 키 가져오기
    const apiKey = process.env.NEXT_PUBLIC_KAKAO_MAP_API_KEY;
    if (!apiKey) {
      console.warn('카카오 지도 API 키가 설정되지 않았습니다. 좌표 변환 기능을 사용할 수 없습니다.');
      return;
    }

    // 카카오 지도 API 스크립트 동적 로드
    const script = document.createElement('script');
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${apiKey}&autoload=false&libraries=services`;
    script.async = true;

    script.onload = () => {
      if (window.kakao && window.kakao.maps) {
        window.kakao.maps.load(() => {
          console.log('카카오 지도 API 로드 완료');
        });
      }
    };

    document.head.appendChild(script);

    return () => {
      // 컴포넌트 언마운트 시 스크립트 제거 (선택사항)
    };
  }, []);

  // 주소를 좌표로 변환하는 함수
  const getCoordinatesFromAddress = (address) => {
    return new Promise((resolve, reject) => {
      // 카카오 지도 API가 로드되지 않았으면 실패
      if (!window.kakao || !window.kakao.maps || !window.kakao.maps.services) {
        console.warn('카카오 지도 API가 로드되지 않았습니다.');
        resolve(null);
        return;
      }

      const geocoder = new window.kakao.maps.services.Geocoder();
      
      geocoder.addressSearch(address, (result, status) => {
        if (status === window.kakao.maps.services.Status.OK && result && result.length > 0) {
          // result[0].y = 위도(latitude), result[0].x = 경도(longitude)
          resolve({
            latitude: parseFloat(result[0].y), // mapY
            longitude: parseFloat(result[0].x) // mapX
          });
        } else {
          console.warn('주소를 좌표로 변환하는데 실패했습니다:', address);
          resolve(null);
        }
      });
    });
  };

  // 주소 검색 버튼 클릭 핸들러
  const handleAddressSearch = () => {
    if (readOnly) return;

    // Daum 우편번호 서비스가 로드되지 않았으면 경고
    if (!window.daum || !window.daum.Postcode) {
      alert('주소 검색 서비스를 불러오는 중입니다. 잠시 후 다시 시도해주세요.');
      return;
    }

    new window.daum.Postcode({
      oncomplete: function(data) {
        // 선택한 주소 정보
        let fullAddress = ''; // 최종 주소 변수
        let extraAddress = ''; // 참고항목 변수

        // 사용자가 선택한 주소 타입에 따라 해당 주소 값을 가져온다.
        if (data.userSelectedType === 'R') {
          // 사용자가 도로명 주소를 선택했을 경우
          fullAddress = data.roadAddress;
        } else {
          // 사용자가 지번 주소를 선택했을 경우(J)
          fullAddress = data.jibunAddress;
        }

        // 사용자가 선택한 주소가 도로명 타입일때 참고항목을 조합한다.
        if (data.userSelectedType === 'R') {
          // 법정동명이 있을 경우 추가한다.
          if (data.bname !== '') {
            extraAddress += data.bname;
          }
          // 건물명이 있을 경우 추가한다.
          if (data.buildingName !== '') {
            extraAddress += extraAddress !== '' ? ', ' + data.buildingName : data.buildingName;
          }
          // 표시할 참고항목이 있을 경우, 괄호까지 추가한 최종 문자열을 만든다.
          if (extraAddress !== '') {
            extraAddress = ' (' + extraAddress + ')';
          }
          // 조합된 참고항목을 해당 필드에 넣는다.
          fullAddress += extraAddress;
        }

        // 기본 주소만 업데이트 (상세주소는 유지)
        setBaseAddress(fullAddress);
        // 기본 주소 + 상세주소 조합하여 formData에 저장
        const finalAddress = fullAddress + (detailAddress ? ' ' + detailAddress : '');
        
        // 주소를 좌표로 변환
        getCoordinatesFromAddress(finalAddress).then(coords => {
          if (coords) {
            updateFormData("hotelInfo", { 
              adress: finalAddress,
              latitude: coords.latitude.toString(),
              longitude: coords.longitude.toString()
            });
          } else {
            // 좌표 변환 실패 시 주소만 저장
            updateFormData("hotelInfo", { adress: finalAddress });
          }
        });
      },
      // 팝업 창 크기 설정
      width: '100%',
      height: '100%',
      maxSuggestItems: 5
    }).open();
  };

  // 상세주소 변경 핸들러
  const handleDetailAddressChange = (e) => {
    if (readOnly) return;
    const newDetailAddress = e.target.value;
    setDetailAddress(newDetailAddress);
    // 기본 주소 + 상세주소 조합하여 formData에 저장
    const finalAddress = baseAddress + (newDetailAddress ? ' ' + newDetailAddress : '');
    
    // 기본 주소가 있으면 좌표도 다시 조회
    if (baseAddress) {
      getCoordinatesFromAddress(finalAddress).then(coords => {
        if (coords) {
          updateFormData("hotelInfo", { 
            adress: finalAddress,
            latitude: coords.latitude.toString(),
            longitude: coords.longitude.toString()
          });
        } else {
          // 좌표 변환 실패 시 주소만 저장
          updateFormData("hotelInfo", { adress: finalAddress });
        }
      });
    } else {
      updateFormData("hotelInfo", { adress: finalAddress });
    }
  };

  return (
    <div className="space-y-8">
      {/* 호텔 기본 정보 */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">호텔 기본 정보</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              호텔명 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.hotelInfo.title || ""}
              onChange={(e) => updateFormData("hotelInfo", { title: e.target.value })}
              readOnly={readOnly}
              disabled={readOnly}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.title ? "border-red-500" : "border-gray-300"
              } ${readOnly ? "bg-gray-100 cursor-not-allowed" : ""}`}
              placeholder="호텔명을 입력하세요"
            />
            {errors.title && <p className="mt-1 text-sm text-red-500">{errors.title}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              연락처 <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              value={formData.hotelInfo.phone || ""}
              onChange={(e) => updateFormData("hotelInfo", { phone: e.target.value })}
              readOnly={readOnly}
              disabled={readOnly}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.phone ? "border-red-500" : "border-gray-300"
              } ${readOnly ? "bg-gray-100 cursor-not-allowed" : ""}`}
              placeholder="02-1234-5678"
            />
            {errors.phone && <p className="mt-1 text-sm text-red-500">{errors.phone}</p>}
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              주소 <span className="text-red-500">*</span>
            </label>
            <div className="space-y-2">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleAddressSearch}
                  disabled={readOnly}
                  className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                    readOnly ? "bg-gray-400 cursor-not-allowed hover:bg-gray-400" : ""
                  }`}
                >
                  주소 검색
                </button>
                <input
                  type="text"
                  value={baseAddress || ""}
                  readOnly
                  disabled={readOnly}
                  className={`flex-1 px-3 py-2 border rounded-md bg-gray-50 cursor-not-allowed ${
                    errors.adress ? "border-red-500" : "border-gray-300"
                  } ${readOnly ? "bg-gray-100" : ""}`}
                  placeholder="주소 검색 버튼을 클릭하여 주소를 선택하세요"
                />
              </div>
              <input
                type="text"
                value={detailAddress || ""}
                onChange={handleDetailAddressChange}
                readOnly={readOnly}
                disabled={readOnly}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.adress ? "border-red-500" : "border-gray-300"
                } ${readOnly ? "bg-gray-100 cursor-not-allowed" : ""}`}
                placeholder="상세주소를 입력하세요 (예: 101호, 지하 1층)"
              />
            </div>
            {errors.adress && <p className="mt-1 text-sm text-red-500">{errors.adress}</p>}
          </div>
        </div>
      </div>

      {/* 호텔 상세 정보 */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">호텔 상세 정보</h3>
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              호텔 소개
            </label>
            <textarea
              value={formData.hotelDetail.reservationlodging || formData.hotelDetail.description || ""}
              onChange={(e) => updateFormData("hotelDetail", { reservationlodging: e.target.value })}
              readOnly={readOnly}
              disabled={readOnly}
              rows={4}
              className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${readOnly ? "bg-gray-100 cursor-not-allowed" : ""}`}
              placeholder="호텔의 특징과 매력을 소개해주세요"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              식당 정보
            </label>
            <textarea
              value={formData.hotelDetail.foodplace || ""}
              onChange={(e) => updateFormData("hotelDetail", { foodplace: e.target.value })}
              readOnly={readOnly}
              disabled={readOnly}
              rows={3}
              className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${readOnly ? "bg-gray-100 cursor-not-allowed" : ""}`}
              placeholder="식당 정보를 입력하세요"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                호텔 규모
              </label>
              <input
                type="text"
                value={formData.hotelDetail.scalelodging || formData.hotelDetail.scale || ""}
                onChange={(e) => updateFormData("hotelDetail", { scalelodging: e.target.value })}
                readOnly={readOnly}
                disabled={readOnly}
                className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${readOnly ? "bg-gray-100 cursor-not-allowed" : ""}`}
                placeholder="예: 지하 1층, 지상 10층, 총 120개 객실"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                주차 정보
              </label>
              <input
                type="text"
                value={formData.hotelDetail.parkinglodging || ""}
                onChange={(e) => updateFormData("hotelDetail", { parkinglodging: e.target.value })}
                readOnly={readOnly}
                disabled={readOnly}
                className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${readOnly ? "bg-gray-100 cursor-not-allowed" : ""}`}
                placeholder="예: 주차장 위치, 요금, 운영시간 등을 입력하세요"
              />
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default HotelBasicInfo;
