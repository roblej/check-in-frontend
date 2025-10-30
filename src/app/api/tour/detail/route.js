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
    const base = "https://apis.data.go.kr/B551011/KorService2";

    const urls = {
      common: build(`${base}/detailCommon2`, { overviewYN: "Y", defaultYN: "Y", addrinfoYN: "Y", mapinfoYN: "Y", areacodeYN: "Y" }),
      intro: build(`${base}/detailIntro2`, {}),
      images: build(`${base}/detailImage2`, { imageYN: "Y", subImageYN: "Y" }),
    };

    const [cRes, iRes, imgRes] = await Promise.all([
      fetch(urls.common, { headers: { Accept: "application/json" }, cache: "no-store" }),
      fetch(urls.intro, { headers: { Accept: "application/json" }, cache: "no-store" }),
      fetch(urls.images, { headers: { Accept: "application/json" }, cache: "no-store" }),
    ]);

    const toItems = async (res) => {
      if (!res.ok) return null;
      const json = await res.json();
      const it = json?.response?.body?.items?.item;
      return Array.isArray(it) ? it : it ? [it] : [];
    };

    const [commonItems, introItems, imageItems] = await Promise.all([
      toItems(cRes),
      toItems(iRes),
      toItems(imgRes),
    ]);

    return NextResponse.json({
      common: commonItems && commonItems[0],
      intro: introItems && introItems[0],
      images: imageItems || [],
    });
  } catch (e) {
    return NextResponse.json({ message: e?.message || "server error" }, { status: 500 });
  }
}


