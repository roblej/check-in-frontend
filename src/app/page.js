import Header from "@/components/Header";
import Footer from "@/components/Footer";
import HeroSection from "@/components/HeroSection";
import PopularHotels from "@/components/PopularHotels";
import DartGameSection from "@/components/DartGameSection";

/**
 * 체크인 호텔 메인 페이지 (SSR)
 *
 * 기능:
 * - 서버사이드 렌더링으로 초기 로딩 성능 최적화
 * - 클라이언트 컴포넌트들을 조합하여 구성
 */
const CheckinHotel = () => {
  // 여행 전 체크 아이템 데이터 (서버 컴포넌트에서 관리)
  const travelCheckItems = [
    {
      title: "출장 항공권",
      subtitle: "해외출장 가시나요?",
      description: "출장 선호 호텔을 알려드려요",
      bgColor: "bg-blue-50",
      textColor: "text-blue-600",
    },
    {
      title: "호텔 할인쿠폰",
      subtitle: "호텔에서 제공하는 프로모션 쿠폰 및 혜택",
      description: "누구나 언제든 사용 가능",
      bgColor: "bg-blue-50",
      textColor: "text-blue-600",
    },
    {
      title: "멤버십 혜택",
      subtitle: "멤버십 혜택 챙기셨나요?",
      description: "할인은 기본, 적립은 중복으로",
      bgColor: "bg-purple-50",
      textColor: "text-purple-600",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <Header />

      {/* 히어로 섹션 */}
      <HeroSection />

      {/* 메인 컨텐츠 */}
      <main className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* 다트 게임 섹션 (클라이언트 컴포넌트) */}
        <DartGameSection />

        {/* 가장 인기있는 숙소 섹션 */}
        <PopularHotels />

        {/* 여행 전 체크 섹션 */}
        <section className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
              여행 전 체크
            </h2>
            <p className="text-gray-600">여행 전에 필수 체크!</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {travelCheckItems.map((item, index) => (
              <div
                key={index}
                className={`${item.bgColor} rounded-2xl p-6 hover:shadow-xl transition-all cursor-pointer border border-transparent hover:border-gray-200`}
              >
                <div className={`${item.textColor} text-4xl font-bold mb-4`}>
                  {index === 0 ? "✈️" : index === 1 ? "🎫" : "💎"}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {item.title}
                </h3>
                <p className={`${item.textColor} font-semibold mb-2 text-sm`}>
                  {item.subtitle}
                </p>
                <p className="text-gray-600 text-sm">{item.description}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* 푸터 */}
      <Footer />

      {/* 
        다트 게임 모달은 이제 DartGameSection 컴포넌트 내부에 렌더링됩니다.
        하지만 position: fixed 속성으로 인해 최종 DOM에서는 페이지 전체를 기준으로 위치하게 됩니다.
      */}
    </div>
  );
};

export default CheckinHotel;