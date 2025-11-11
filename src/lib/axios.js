import axios from "axios";

// 서버/클라이언트 구분하여 적절한 인스턴스 반환
const getAxiosInstance = () => {
  try {
  // 서버 사이드
  if (typeof window === 'undefined') {
      // 서버 사이드에서는 백엔드로 직접 요청
      // BACKEND_HOST 환경 변수 사용 (없으면 NEXT_PUBLIC_API_URL 사용)
      let apiUrl = process.env.BACKEND_HOST || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8888';
      
      // api.checkinn.store를 백엔드 직접 주소로 변경
      // 또는 checkinn.store를 백엔드 직접 주소로 변경
      if (apiUrl && (apiUrl.includes('api.checkinn.store') || apiUrl.includes('checkinn.store'))) {
        // 프로덕션 환경에서는 BACKEND_HOST 사용 (백엔드 EC2 직접 주소)
        // 로컬에서는 localhost:8888 사용
        apiUrl = process.env.BACKEND_HOST || 'http://localhost:8888';
      }
      
      // apiUrl이 유효한지 확인
      if (!apiUrl || typeof apiUrl !== 'string') {
        apiUrl = 'http://localhost:8888';
      }
      
    return axios.create({
        baseURL: `${apiUrl}/api`,
      timeout: 10000,
      headers: {
        "Content-Type": "application/json",
      },
      withCredentials: true,
    });
  }
  
  // 클라이언트 사이드
  return axios.create({
    baseURL: "/api",
    timeout: 10000,
    headers: {
      "Content-Type": "application/json",
    },
    withCredentials: true,
  });
  } catch (error) {
    // 에러 발생 시 기본 인스턴스 반환
    console.error('Axios 인스턴스 생성 실패:', error);
    return axios.create({
      baseURL: "/api",
      timeout: 10000,
      headers: {
        "Content-Type": "application/json",
      },
      withCredentials: true,
    });
  }
};

// Axios 인스턴스 생성
let axiosInstance;
try {
  axiosInstance = getAxiosInstance();
  // 인스턴스가 유효한지 확인
  if (!axiosInstance || typeof axiosInstance.interceptors === 'undefined') {
    throw new Error('Invalid axios instance');
  }
} catch (error) {
  console.error('Axios 인스턴스 초기화 실패:', error);
  // 기본 인스턴스로 폴백
  axiosInstance = axios.create({
    baseURL: "/api",
    timeout: 10000,
    headers: {
      "Content-Type": "application/json",
    },
    withCredentials: true,
  });
}

// 요청 인터셉터
axiosInstance.interceptors.request.use(
  (config) => {
    // 토큰이 있다면 헤더에 추가
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("accessToken")
        : null;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 응답 인터셉터
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // 에러 처리
    if (error.response) {
      // 401 에러 처리 (인증 실패)
      if (error.response.status === 401) {
        if (typeof window !== "undefined") {
          localStorage.removeItem("accessToken");
          // window.location.href = '/login';
        }
      }

      // 403 에러 처리 (권한 없음 - 호텔 미등록 관리자)
      if (error.response.status === 403) {
        const data = error.response.data;
        if (data && data.redirect) {
          // 리다이렉트 플래그가 있으면 메인 화면으로 이동
          if (typeof window !== "undefined") {
            alert(data.message || "호텔이 등록되지 않은 관리자입니다. 메인 화면으로 이동합니다.");
            window.location.href = '/';
          }
        }
      }

      // 500 에러 처리
      if (error.response.status === 500) {
        console.error("서버 오류가 발생했습니다.");
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
