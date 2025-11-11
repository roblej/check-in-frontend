import Header from "@/components/Header";
import ShareLayout from "@/components/share/ShareLayout";
import { hotelAPI } from "@/lib/api/hotel";
import { normalizeHotelData } from "@/utils/hotel/normalizeHotelData";

const fetchHotelsByIds = async (ids) => {
  if (!ids || ids.length === 0) {
    return [];
  }

  try {
    const response = await hotelAPI.getHotelsByContentIds(ids);
    const rawHotels = Array.isArray(response?.data)
      ? response.data
      : Array.isArray(response)
      ? response
      : [];

    const normalizedMap = new Map();
    rawHotels.forEach((hotel) => {
      if (!hotel) return;
      const contentId = hotel.contentId || hotel.contentid || hotel.id;
      if (!contentId) return;
      normalizedMap.set(String(contentId), normalizeHotelData(hotel, contentId));
    });

    return ids
      .map((id) => normalizedMap.get(String(id)))
      .filter(Boolean);
  } catch (error) {
    console.error("공유 호텔 목록 조회 실패", error);
    return [];
  }
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
