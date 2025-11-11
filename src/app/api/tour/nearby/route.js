import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);

    // 입력 파라미터 (mapX/mapY 우선, 없으면 lat/lng 매핑)
    const mapX = searchParams.get("mapX") || searchParams.get("lng"); // 경도
    const mapY = searchParams.get("mapY") || searchParams.get("lat"); // 위도
    const radius = searchParams.get("radius") || "3000"; // meters
    const numOfRows = searchParams.get("numOfRows") || "18";
    const pageNo = searchParams.get("pageNo") || "1";
    const arrange = searchParams.get("arrange") || "E"; // 거리순 기본
    const contentTypeId = searchParams.get("contentTypeId"); // optional

    if (!mapX || !mapY) {
      return NextResponse.json(
        { message: "mapX/mapY 또는 lat/lng 파라미터가 필요합니다." },
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
        numOfRows: over.numOfRows || numOfRows,
        pageNo: over.pageNo || pageNo,
        MobileOS: "ETC",
        MobileApp: "checkIn",
        arrange: over.arrange || arrange,
        mapX: String(over.mapX || mapX),
        mapY: String(over.mapY || mapY),
        radius: String(over.radius || radius),
        _type: "json",
      });
      const cti = over.hasOwnProperty("contentTypeId") ? over.contentTypeId : contentTypeId;
      if (cti) p.set("contentTypeId", cti);

      // 선택 파라미터 패스스루
      [
        "areaCode",
        "sigunguCode",
        "cat1",
        "cat2",
        "cat3",
        "lDongRegnCd",
        "lDongSignguCd",
        "lclsSystm1",
        "lclsSystm2",
        "lclsSystm3",
        "modifiedtime",
      ].forEach((k) => {
        const v = searchParams.get(k);
        if (v) p.set(k, v);
      });
      return p;
    };

    const endpointV2 = "https://apis.data.go.kr/B551011/KorService2/locationBasedList2";
    const endpointV1 = "https://apis.data.go.kr/B551011/KorService1/locationBasedList1";

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

    let json;
    try {
      json = await res.json();
    } catch (parseError) {
      const text = await res.text();
      console.error("[TourAPI] JSON 파싱 실패:", parseError);
      console.error("[TourAPI] 응답 텍스트:", text?.slice(0, 500));
      return NextResponse.json(
        { message: "TourAPI 응답 파싱 실패", detail: text?.slice(0, 500) },
        { status: 502 }
      );
    }

    // TourAPI 에러 응답 확인
    if (json?.response?.header?.resultCode !== "0000" && json?.response?.header?.resultCode !== undefined) {
      const resultMsg = json?.response?.header?.resultMsg || "알 수 없는 오류";
      console.error("[TourAPI] API 오류:", {
        resultCode: json?.response?.header?.resultCode,
        resultMsg
      });
      return NextResponse.json(
        { message: `TourAPI 오류: ${resultMsg}`, resultCode: json?.response?.header?.resultCode },
        { status: 502 }
      );
    }

    let items =
      json?.response?.body?.items?.item && Array.isArray(json.response.body.items.item)
        ? json.response.body.items.item
        : json?.response?.body?.items?.item
        ? [json.response.body.items.item]
        : [];

    // 폴백: 결과가 없으면 반경 확대 → contentTypeId 제거 재시도
    if (!items.length) {
      const rNum = parseInt(radius, 10) || 0;
      if (rNum < 10000) {
        try {
        url = `${endpointV2}?${buildParams({ radius: Math.min(10000, (rNum || 3000) * 2) }).toString()}`;
        res = await fetch(url, { headers: { Accept: "application/json" }, cache: "no-store" });
        if (res.ok) {
          const j2 = await res.json();
            if (j2?.response?.header?.resultCode === "0000" || j2?.response?.header?.resultCode === undefined) {
          items = j2?.response?.body?.items?.item && Array.isArray(j2.response.body.items.item)
            ? j2.response.body.items.item
            : j2?.response?.body?.items?.item ? [j2.response.body.items.item] : [];
            }
          }
        } catch (e) {
          console.warn("[TourAPI] 반경 확대 재시도 실패:", e);
        }
      }
    }

    if (!items.length && contentTypeId) {
      try {
      url = `${endpointV2}?${buildParams({ contentTypeId: null }).toString()}`;
      res = await fetch(url, { headers: { Accept: "application/json" }, cache: "no-store" });
      if (res.ok) {
        const j3 = await res.json();
          if (j3?.response?.header?.resultCode === "0000" || j3?.response?.header?.resultCode === undefined) {
        items = j3?.response?.body?.items?.item && Array.isArray(j3.response.body.items.item)
          ? j3.response.body.items.item
          : j3?.response?.body?.items?.item ? [j3.response.body.items.item] : [];
          }
        }
      } catch (e) {
        console.warn("[TourAPI] contentTypeId 제거 재시도 실패:", e);
      }
    }

    return NextResponse.json({ items });
  } catch (e) {
    console.error("[TourAPI] 에러 발생:", e);
    console.error("[TourAPI] 에러 스택:", e?.stack);
    return NextResponse.json(
      { 
        message: e?.message || "server error",
        error: String(e),
        stack: process.env.NODE_ENV === 'development' ? e?.stack : undefined
      }, 
      { status: 500 }
    );
  }
}


