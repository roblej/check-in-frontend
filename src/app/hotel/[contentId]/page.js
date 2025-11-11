import Header from "@/components/Header";
import Footer from "@/components/Footer";
import LiveViewerPanel from "@/components/hotel/LiveViewerPanel";
import { hotelAPI } from "@/lib/api/hotel";
import HotelDetailClient from "./HotelDetailClient";
import ScrollToTopButton from "./ScrollToTopButton";

/**
 * SSR 시점에서 동적 메타데이터 생성
 * @param {Object} params - 라우트 파라미터
 * @param {Object} searchParams - 쿼리 파라미터
 * @returns {Promise<Object>} 메타데이터 객체
 */
export async function generateMetadata({ params, searchParams }) {
  const awaitedParams = await params;
  const contentId = awaitedParams.contentId || awaitedParams.id;
  try {
    const res = await hotelAPI.getHotelDetail(contentId);
    const hotel = res?.data ?? res ?? {};
    const name = hotel?.title || "호텔 상세";
    const description = hotel?.hotelDetail?.scalelodging || "";
    const images = hotel?.images ?? (hotel?.imageUrl ? [hotel.imageUrl] : []);

    return {
      title: `${name} - 체크인`,
      description,
      keywords: `호텔, ${hotel?.adress || ""}, 숙박, 예약, ${name}`,
      openGraph: {
        title: `${name} - 체크인`,
        description,
        images,
        type: "website",
      },
      twitter: {
        card: "summary_large_image",
        title: `${name} - 체크인`,
        description,
        images,
      },
      alternates: {
        canonical: `/hotel/${contentId}`,
      },
    };
  } catch (e) {
    return {
      title: `호텔 상세 - 체크인`,
      description: "호텔 상세 정보",
      alternates: { canonical: `/hotel/${contentId}` },
    };
  }
}

const HotelDetailPage = async ({ params, searchParams }) => {
  const awaitedParams = await params;
  const contentId = awaitedParams.contentId || awaitedParams.id;
  const resolvedSearchParams = await searchParams;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <HotelDetailClient
        contentId={contentId}
        searchParams={resolvedSearchParams}
      />
      <Footer />
      <LiveViewerPanel contentId={contentId} />
      <ScrollToTopButton />
    </div>
  );
};

export default HotelDetailPage;
