const StructuredData = ({ hotelData }) => {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Hotel",
    name: hotelData.name,
    description: hotelData.description,
    address: {
      "@type": "PostalAddress",
      streetAddress: hotelData.location,
      addressLocality: hotelData.district,
      addressCountry: "KR",
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: hotelData.rating,
      reviewCount: hotelData.reviewCount,
      bestRating: 10,
      worstRating: 1,
    },
    amenityFeature:
      hotelData.amenities?.map((amenity) => ({
        "@type": "LocationFeatureSpecification",
        name: amenity,
      })) || [],
    checkinTime: hotelData.checkInTime,
    checkoutTime: hotelData.checkOutTime,
    starRating: {
      "@type": "Rating",
      ratingValue: hotelData.starRating,
    },
    image: hotelData.images || [],
    offers:
      hotelData.rooms?.map((room) => ({
        "@type": "Offer",
        name: room.name,
        description: room.description,
        price: room.price,
        priceCurrency: "KRW",
        availability: "https://schema.org/InStock",
        validFrom: new Date().toISOString().split("T")[0],
        url: `/hotel/${hotelData.id}`,
      })) || [],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
};

export default StructuredData;
