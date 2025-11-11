import Header from "@/components/Header";
import ShareLayout from "@/components/share/ShareLayout";
import { hotelAPI } from "@/lib/api/hotel";
import { normalizeHotelData } from "@/utils/hotel/normalizeHotelData";

const fetchHotelsByIds = async (ids) => {
  if (!ids || ids.length === 0) {
    return [];
  }

  const results = await Promise.all(
    ids.map(async (contentId) => {
      try {
        const detail = await hotelAPI.getHotelDetail(contentId);
        return normalizeHotelData(detail, contentId);
      } catch (error) {
        console.error(`공유 호텔 정보를 불러오지 못했습니다. contentId: ${contentId}`, error);
        return null;
      }
    })
  );

  return results.filter(Boolean);
};

const parseIds = (idxsString) => {
  if (!idxsString) return [];
  const seen = new Set();
  const result = [];

  idxsString
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean)
    .forEach((value) => {
      if (!seen.has(value)) {
        seen.add(value);
        result.push(value);
      }
    });

  return result;
};

const SharePage = async ({ searchParams }) => {
  const idxsString = searchParams?.idxs || "";
  const selectedHotelParam = searchParams?.selectedHotel || null;

  const hotelIds = parseIds(idxsString);
  const hotels = await fetchHotelsByIds(hotelIds);

  const initialSelectedHotelId = selectedHotelParam && hotelIds.includes(selectedHotelParam)
    ? selectedHotelParam
    : null;

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-gray-50">
      <Header />
      <ShareLayout
        hotels={hotels}
        initialSelectedHotelId={initialSelectedHotelId}
      />
    </div>
  );
};

export default SharePage;
