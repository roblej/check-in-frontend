/**
 * URL 쿼리 파라미터 관련 유틸리티 함수들
 */

/**
 * 현재 URL에 쿼리 파라미터를 추가하거나 업데이트
 * @param {Object} params - 추가할 쿼리 파라미터 객체
 * @param {string} [baseUrl] - 기본 URL (선택사항)
 * @returns {string} 업데이트된 URL
 */
export const updateUrlParams = (params, baseUrl = null) => {
  // baseUrl이 상대 경로인 경우 절대 URL로 변환
  if (baseUrl && !baseUrl.startsWith("http")) {
    const urlObj = new URL(baseUrl, window.location.origin);

    Object.entries(params).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== "") {
        urlObj.searchParams.set(key, value.toString());
      } else {
        urlObj.searchParams.delete(key);
      }
    });

    return urlObj.pathname + urlObj.search;
  }

  // 절대 URL인 경우 기존 로직 사용
  const url = baseUrl || window.location.href;
  const urlObj = new URL(url);

  Object.entries(params).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== "") {
      urlObj.searchParams.set(key, value.toString());
    } else {
      urlObj.searchParams.delete(key);
    }
  });

  return urlObj.toString();
};

/**
 * URL 쿼리 파라미터를 객체로 변환
 * @param {URLSearchParams|string} searchParams - URLSearchParams 객체 또는 쿼리 문자열
 * @returns {Object} 쿼리 파라미터 객체
 */
export const parseUrlParams = (searchParams) => {
  const params =
    typeof searchParams === "string"
      ? new URLSearchParams(searchParams)
      : searchParams;

  const result = {};
  for (const [key, value] of params.entries()) {
    result[key] = value;
  }

  return result;
};

/**
 * 호텔 상세 페이지 URL 생성
 * @param {string|number} contentId - 호텔 콘텐츠 ID
 * @param {Object} searchParams - 검색 파라미터
 * @returns {string} 호텔 상세 페이지 URL
 */
export const createHotelDetailUrl = (contentId, searchParams = {}) => {
  const baseUrl = `/hotel/${contentId}`;

  if (!searchParams || Object.keys(searchParams).length === 0) {
    return baseUrl;
  }

  return updateUrlParams(searchParams, baseUrl);
};

/**
 * 호텔 검색 페이지 URL 생성
 * @param {Object} searchParams - 검색 파라미터
 * @returns {string} 호텔 검색 페이지 URL
 */
export const createHotelSearchUrl = (searchParams = {}) => {
  const baseUrl = "/hotel-search";

  if (!searchParams || Object.keys(searchParams).length === 0) {
    return baseUrl;
  }

  return updateUrlParams(searchParams, baseUrl);
};

/**
 * 검색 파라미터를 URL 쿼리 파라미터 형식으로 변환
 * @param {Object} searchParams - 검색 파라미터 객체
 * @returns {Object} URL 쿼리 파라미터 객체
 */
export const formatSearchParamsForUrl = (searchParams) => {
  const urlParams = {};

  if (searchParams.destination) {
    urlParams.destination = searchParams.destination;
  }

  if (searchParams.checkIn) {
    urlParams.checkIn = searchParams.checkIn;
  }

  if (searchParams.checkOut) {
    urlParams.checkOut = searchParams.checkOut;
  }

  if (searchParams.adults && searchParams.adults > 0) {
    urlParams.adults = searchParams.adults.toString();
  }

  if (searchParams.children && searchParams.children > 0) {
    urlParams.children = searchParams.children.toString();
  }

  return urlParams;
};
