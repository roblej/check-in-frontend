"use client";

import { useSearchParams, useRouter } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const FailPage = () => {
  const search = useSearchParams();
  const router = useRouter();
  const code = search.get("code");
  const message = search.get("message");
  const error = search.get("error");

  const getErrorMessage = () => {
    if (error) return decodeURIComponent(error);
    if (message) return message;
    if (code) return `오류 코드: ${code}`;
    return "결제 처리 중 오류가 발생했습니다.";
  };

  const getErrorTitle = () => {
    if (code === "PAY_PROCESS_CANCELED") return "결제가 취소되었습니다";
    if (code === "PAY_PROCESS_ABORTED") return "결제가 중단되었습니다";
    if (code === "INVALID_CARD_COMPANY") return "카드 정보가 올바르지 않습니다";
    if (code === "INVALID_CARD_NUMBER") return "카드 번호가 올바르지 않습니다";
    if (code === "INVALID_CARD_EXPIRY") return "카드 만료일이 올바르지 않습니다";
    if (code === "INVALID_CARD_CVC") return "CVC 번호가 올바르지 않습니다";
    return "결제 실패";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-2xl mx-auto px-4 py-20">
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          {/* 실패 아이콘 */}
          <div className="text-red-500 text-6xl mb-6">❌</div>
          
          {/* 제목 */}
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            {getErrorTitle()}
          </h1>
          
          {/* 설명 */}
          <p className="text-gray-600 mb-8">
            결제 처리 중 문제가 발생했습니다. 다시 시도하거나 다른 결제 방법을 이용해주세요.
          </p>

          {/* 오류 정보 */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-8 text-left">
            <h2 className="text-lg font-semibold text-red-900 mb-4">오류 정보</h2>
            <div className="space-y-2">
              {code && (
                <div className="flex justify-between">
                  <span className="text-red-700">오류 코드:</span>
                  <span className="font-mono font-medium text-red-900">{code}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-red-700">오류 메시지:</span>
                <span className="text-red-900">{getErrorMessage()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-red-700">발생 시간:</span>
                <span>{new Date().toLocaleString('ko-KR')}</span>
              </div>
            </div>
          </div>

          {/* 해결 방법 안내 */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8 text-left">
            <h3 className="font-semibold text-blue-900 mb-3">💡 해결 방법</h3>
            <ul className="text-blue-800 text-sm space-y-2">
              <li>• 카드 정보를 다시 확인해주세요</li>
              <li>• 카드 잔액이 충분한지 확인해주세요</li>
              <li>• 카드사에서 온라인 결제를 차단했을 수 있습니다</li>
              <li>• 다른 결제 방법을 시도해보세요</li>
              <li>• 문제가 지속되면 고객센터에 문의해주세요</li>
            </ul>
          </div>

          {/* 버튼들 */}
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => router.back()}
              className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              다시 시도
            </button>
            <button
              onClick={() => router.push("/")}
              className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              홈으로
            </button>
            <button
              onClick={() => router.push("/used")}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              중고 호텔 둘러보기
            </button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default FailPage;
