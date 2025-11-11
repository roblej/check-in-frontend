export const normalizeHotelData = (rawData, fallbackId) => {
  const data = rawData?.data ?? rawData ?? {};

  const contentId =
    data.contentId ||
    data.contentid ||
    data.contentID ||
    data.id ||
    fallbackId;

  const title =
    data.title ||
    data.name ||
    data.hotelName ||
    data.contentName ||
    data.subject ||
    "이름 미지정";

  const adress =
    data.adress ||
    data.address ||
    data.addr1 ||
    data.roadAddress ||
    data.addr ||
    "주소 정보 없음";

  const imageUrl =
    data.imageUrl ||
    data.firstImage ||
    data.firstimage ||
    data.mainImageUrl ||
    data.thumbnailImage ||
    "https://via.placeholder.com/640x360?text=Hotel";

  const minPrice =
    data.minPrice ?? data.lowestPrice ?? data.price ?? data.roomPrice ?? null;
  const maxPrice = data.maxPrice ?? data.highestPrice ?? null;

  const mapX =
    data.mapX ||
    data.longitude ||
    data.lng ||
    (data.hotelLocation && data.hotelLocation.mapX) ||
    (data.location && data.location.lng) ||
    null;

  const mapY =
    data.mapY ||
    data.latitude ||
    data.lat ||
    (data.hotelLocation && data.hotelLocation.mapY) ||
    (data.location && data.location.lat) ||
    null;

  const hotelLocation =
    data.hotelLocation ||
    (mapX && mapY
      ? {
          mapX,
          mapY,
        }
      : undefined);

  return {
    ...data,
    contentId,
    title,
    adress,
    imageUrl,
    minPrice,
    maxPrice,
    mapX,
    mapY,
    hotelLocation,
  };
};
