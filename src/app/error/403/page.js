'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { ShieldX, Home, AlertCircle } from 'lucide-react';

export default function ForbiddenPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8 space-y-6 text-center">
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center">
              <ShieldX className="w-8 h-8 text-orange-600" />
            </div>
          </div>
          
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-gray-900">접근 권한이 없습니다</h1>
            <p className="text-sm text-gray-500">
              이 페이지에 접근할 권한이 없습니다.
              <br />
              필요한 권한이 있다면 관리자에게 문의해주세요.
            </p>
          </div>

          <div className="flex flex-col gap-3 pt-4">
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
            >
              <Home className="w-4 h-4" />
              홈으로 돌아가기
            </Link>
            <Link
              href="/center"
              className="inline-flex items-center justify-center rounded-xl border border-gray-200 px-6 py-3 text-sm font-medium text-gray-600 transition-colors hover:border-gray-300 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2"
            >
              <AlertCircle className="w-4 h-4" />
              고객센터 문의
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

