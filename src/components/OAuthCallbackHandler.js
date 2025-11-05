"use client";

import { useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { useCustomerStore } from "@/stores/customerStore";

/**
 * OAuth 콜백 핸들러 컴포넌트
 * 백엔드에서 OAuth 로그인 성공 후 "/"로 리다이렉트될 때 감지하여 Zustand 상태 업데이트
 */
export default function OAuthCallbackHandler() {
  const searchParams = useSearchParams();
  const { verifyTokenWithBackend, isInlogged } = useCustomerStore();
  const hasProcessed = useRef(false);

  useEffect(() => {
    // 중복 실행 방지 (StrictMode 대응)
    if (hasProcessed.current) return;
    
    const handleOAuthCallback = async () => {
      // URL 파라미터에서 OAuth 콜백 확인
      // 백엔드가 쿼리 파라미터를 추가할 수도 있고 안 할 수도 있음
      const oauthSuccess = searchParams.get('oauth2');
      const fromNaver = searchParams.get('from') === 'naver';
      
      // 이미 로그인된 상태면 처리하지 않음
      if (isInlogged()) {
        hasProcessed.current = true;
        return;
      }

      // OAuth 콜백인 경우에만 처리
      // 백엔드가 쿼리 파라미터 없이 리다이렉트하는 경우를 대비해
      // 세션 스토리지를 사용하여 OAuth 로그인 시도 여부 확인
      const oauthAttempted = typeof window !== 'undefined' 
        ? sessionStorage.getItem('oauth_attempted') 
        : null;
      
      if (oauthSuccess || fromNaver || oauthAttempted === 'true') {
        try {
          const result = await verifyTokenWithBackend();
          
          if (result.success) {
            // 로그인 성공
            // Zustand 상태는 verifyTokenWithBackend에서 이미 업데이트됨
            console.log("소셜 로그인 성공:", result.userData);
            hasProcessed.current = true;
            
            // 세션 스토리지 정리
            if (typeof window !== 'undefined') {
              sessionStorage.removeItem('oauth_attempted');
            }
            
            // 쿼리 파라미터가 있으면 제거
            if ((oauthSuccess || fromNaver) && typeof window !== 'undefined') {
              window.history.replaceState({}, '', '/');
            }
          } else {
            // 로그인 실패 또는 토큰 없음
            hasProcessed.current = true;
            if (typeof window !== 'undefined') {
              sessionStorage.removeItem('oauth_attempted');
            }
          }
        } catch (error) {
          console.error("OAuth 콜백 처리 중 오류:", error);
          hasProcessed.current = true;
          if (typeof window !== 'undefined') {
            sessionStorage.removeItem('oauth_attempted');
          }
        }
      }
    };

    handleOAuthCallback();
  }, [searchParams, verifyTokenWithBackend, isInlogged]);

  // 이 컴포넌트는 UI를 렌더링하지 않음
  return null;
}

