import { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import HotelDetail from "@/components/hotel/HotelDetail";
import StructuredData from "@/components/SEO/StructuredData";
import LiveViewerPanel from "@/components/hotel/LiveViewerPanel";
import { hotelAPI } from "@/lib/api/hotel";

// SSR시점에서 동적 메타데이터 생성
export async function generateMetadata({ params, searchParams }) {
  const contentId = params.id;
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

const HotelDetailPage = ({ params, searchParams }) => {
  const contentId = params.id;

  // URL에서 검색 파라미터 가져오기
  const searchParamsData = {
    destination: searchParams?.destination || "",
    checkIn: searchParams?.checkIn || "",
    checkOut: searchParams?.checkOut || "",
    nights: parseInt(searchParams?.nights || "1"),
    adults: parseInt(searchParams?.adults || "2"),
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* StructuredData는 추후 실제 데이터 연결 시 보완 */}
      <Header />
      <HotelDetail contentId={contentId} searchParams={searchParamsData} />
      <Footer />
      {/* 실시간 조회수 플로팅 패널 */}
      <LiveViewerPanel contentId={contentId} />
    </div>
  );
};

export default HotelDetailPage;
