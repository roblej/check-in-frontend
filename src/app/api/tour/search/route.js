import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const keyword = searchParams.get("keyword");
    const areaCode = searchParams.get("areaCode");
    const contentTypeId = searchParams.get("contentTypeId");
    const numOfRows = searchParams.get("numOfRows") || "10";
    const pageNo = searchParams.get("pageNo") || "1";
    const arrange = searchParams.get("arrange") || "A"; // 제목순

    if (!keyword) {
      return NextResponse.json(
        { message: "keyword 파라미터가 필요합니다." },
        { status: 400 }
      );
    }

    const serviceKeyRaw = process.env.NEXT_TOUR_KEY;
    if (!serviceKeyRaw) {
      return NextResponse.json(
        { message: "TourAPI 키(NEXT_TOUR_KEY)가 설정되지 않았습니다." },
        { status: 500 }
      );
    }

    // 키 정규화 (이중 인코딩 방지)
    const normalizeKey = (k) => {
      let v = k;
      for (let i = 0; i < 2; i++) {
        try {
          const dec = decodeURIComponent(v);
          if (dec === v) break;
          v = dec;
        } catch {
          break;
        }
      }
      return v;
    };
    const serviceKey = normalizeKey(serviceKeyRaw);

    const buildParams = (over = {}) => {
      const p = new URLSearchParams({
        serviceKey,
        keyword: over.keyword || keyword,
        numOfRows: over.numOfRows || numOfRows,
        pageNo: over.pageNo || pageNo,
        MobileOS: "ETC",
        MobileApp: "checkIn",
        arrange: over.arrange || arrange,
        _type: "json",
      });

      if (areaCode) {
        p.set("areaCode", areaCode);
      }
      if (contentTypeId) {
        p.set("contentTypeId", contentTypeId);
      }

      return p;
    };

    const endpointV2 = "https://apis.data.go.kr/B551011/KorService2/searchKeyword2";
    const endpointV1 = "https://apis.data.go.kr/B551011/KorService1/searchKeyword1";

    // 1차: V2 호출
    let url = `${endpointV2}?${buildParams().toString()}`;
    let res = await fetch(url, { headers: { Accept: "application/json" }, cache: "no-store" });

    // V2 실패 시 V1 폴백
    if (!res.ok) {
      const text = await res.text();
      console.warn("TourAPI V2 실패, V1로 폴백", { status: res.status, detail: text?.slice?.(0, 300) });
      url = `${endpointV1}?${buildParams().toString()}`;
      res = await fetch(url, { headers: { Accept: "application/json" }, cache: "no-store" });
      if (!res.ok) {
        const text2 = await res.text();
        return NextResponse.json(
          { message: `TourAPI 오류: ${res.status}`, detail: text2 },
          { status: 502 }
        );
      }
    }

    const json = await res.json();
    let items =
      json?.response?.body?.items?.item &&
      (Array.isArray(json.response.body.items.item)
        ? json.response.body.items.item
        : [json.response.body.items.item]);

    if (!items) {
      items = [];
    }

    return NextResponse.json({ items });
  } catch (error) {
    console.error("TourAPI 검색 오류:", error);
    return NextResponse.json(
      { message: "서버 오류가 발생했습니다.", error: error.message },
      { status: 500 }
    );
  }
}


