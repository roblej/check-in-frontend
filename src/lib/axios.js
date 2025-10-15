import axios from "axios";

// Axios 인스턴스 생성
const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8888/api",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

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

      // 403 에러 처리 (권한 없음)
      if (error.response.status === 403) {
        console.error("권한이 없습니다.");
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
