import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const contentId = searchParams.get("contentId") || searchParams.get("contentid");
    const contentTypeId = searchParams.get("contentTypeId") || searchParams.get("contenttypeid");

    if (!contentId || !contentTypeId) {
      return NextResponse.json({ message: "contentId, contentTypeId가 필요합니다." }, { status: 400 });
    }

    const rawKey = process.env.NEXT_TOUR_KEY;
    if (!rawKey) return NextResponse.json({ message: "NEXT_TOUR_KEY 미설정" }, { status: 500 });

    const normalize = (k) => {
      let v = k;
      for (let i = 0; i < 2; i++) {
        try { const d = decodeURIComponent(v); if (d === v) break; v = d; } catch { break; }
      }
      return v;
    };
    const serviceKey = normalize(rawKey);

    const commonParams = {
      serviceKey,
      contentId: String(contentId),
      contentTypeId: String(contentTypeId),
      MobileOS: "ETC",
      MobileApp: "checkIn",
      _type: "json",
    };

    const build = (base, extra) => `${base}?${new URLSearchParams({ ...commonParams, ...extra }).toString()}`;
    const baseV2 = "https://apis.data.go.kr/B551011/KorService2";
    const baseV1 = "https://apis.data.go.kr/B551011/KorService1";

    const urlsV2 = {
      common: build(`${baseV2}/detailCommon2`, { overviewYN: "Y", defaultYN: "Y", addrinfoYN: "Y", mapinfoYN: "Y", areacodeYN: "Y" }),
      intro: build(`${baseV2}/detailIntro2`, {}),
      images: build(`${baseV2}/detailImage2`, { imageYN: "Y", subImageYN: "Y" }),
    };

    let [cRes, iRes, imgRes] = await Promise.all([
      fetch(urlsV2.common, { headers: { Accept: "application/json" }, cache: "no-store" }),
      fetch(urlsV2.intro, { headers: { Accept: "application/json" }, cache: "no-store" }),
      fetch(urlsV2.images, { headers: { Accept: "application/json" }, cache: "no-store" }),
    ]);

    const toItems = async (res) => {
      if (!res.ok) return null;
      const json = await res.json();
      const it = json?.response?.body?.items?.item;
      return Array.isArray(it) ? it : it ? [it] : [];
    };

    let [commonItems, introItems, imageItems] = await Promise.all([
      toItems(cRes),
      toItems(iRes),
      toItems(imgRes),
    ]);

    // 폴백: V2 응답이 실패/빈 경우 V1 재시도
    const isEmpty = (arr) => !arr || (Array.isArray(arr) && arr.length === 0);
    if (isEmpty(commonItems) && isEmpty(introItems) && isEmpty(imageItems)) {
      const urlsV1 = {
        common: build(`${baseV1}/detailCommon1`, { overviewYN: "Y", defaultYN: "Y", addrinfoYN: "Y", mapinfoYN: "Y", areacodeYN: "Y" }),
        intro: build(`${baseV1}/detailIntro1`, {}),
        images: build(`${baseV1}/detailImage1`, { imageYN: "Y", subImageYN: "Y" }),
      };
      [cRes, iRes, imgRes] = await Promise.all([
        fetch(urlsV1.common, { headers: { Accept: "application/json" }, cache: "no-store" }),
        fetch(urlsV1.intro, { headers: { Accept: "application/json" }, cache: "no-store" }),
        fetch(urlsV1.images, { headers: { Accept: "application/json" }, cache: "no-store" }),
      ]);
      [commonItems, introItems, imageItems] = await Promise.all([
        toItems(cRes),
        toItems(iRes),
        toItems(imgRes),
      ]);
    }

    return NextResponse.json({
      common: commonItems && commonItems[0],
      intro: introItems && introItems[0],
      images: imageItems || [],
    });
  } catch (e) {
    return NextResponse.json({ message: e?.message || "server error" }, { status: 500 });
  }
}


