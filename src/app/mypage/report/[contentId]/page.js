import { Suspense } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ReportClient from './ReportClient';

// 동적 렌더링 강제 설정 (prerendering 방지)
export const dynamic = 'force-dynamic';

/**
 * 호텔 신고 페이지 (SSR)
 * 
 * 기능:
 * - 서버사이드 렌더링으로 기본 레이아웃 제공
 * - 클라이언트 컴포넌트로 실제 폼과 인터랙션 처리
 */
export default async function ReportPage({ params }) {
  const awaitedParams = await params;
  const contentId = awaitedParams.contentId;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <Suspense fallback={
        <div className="flex items-center justify-center py-20">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="ml-3 text-gray-600">로딩 중...</span>
        </div>
      }>
        <ReportClient contentId={contentId} />
      </Suspense>
      <Footer />
    </div>
  );
}
