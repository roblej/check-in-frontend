/**
 * 쿠키 관련 유틸리티 함수들
 */

/**
 * 쿠키에서 특정 값을 가져오기
 * @param {string} name - 쿠키 이름
 * @returns {string|null} 쿠키 값 또는 null
 */
export const getCookie = (name) => {
  if (typeof document === 'undefined') return null;
  
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return parts.pop().split(';').shift();
  }
  return null;
};

/**
 * 쿠키 설정
 * @param {string} name - 쿠키 이름
 * @param {string} value - 쿠키 값
 * @param {number} days - 만료일 (일 단위)
 * @param {string} path - 쿠키 경로
 */
export const setCookie = (name, value, days = 7, path = '/') => {
  if (typeof document === 'undefined') return;
  
  const expires = new Date();
  expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
  
  document.cookie = `${name}=${value}; expires=${expires.toUTCString()}; path=${path}`;
};

/**
 * 쿠키 삭제
 * @param {string} name - 쿠키 이름
 * @param {string} path - 쿠키 경로
 */
export const deleteCookie = (name, path = '/') => {
  if (typeof document === 'undefined') return;
  
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${path}`;
};

/**
 * adminIdx 쿠키 가져오기
 * @returns {string|null} adminIdx 또는 null
 */
export const getAdminIdxFromCookie = () => {
  return getCookie('adminIdx');
};

/**
 * adminIdx 쿠키 설정
 * @param {string|number} adminIdx - 관리자 ID
 * @param {number} days - 만료일 (일 단위)
 */
export const setAdminIdxCookie = (adminIdx, days = 7) => {
  setCookie('adminIdx', adminIdx.toString(), days);
};

/**
 * adminIdx 쿠키 삭제
 */
export const deleteAdminIdxCookie = () => {
  deleteCookie('adminIdx');
};
