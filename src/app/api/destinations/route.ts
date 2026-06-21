import { NextResponse } from "next/server";

const TOUR_API_KEY = process.env.TOUR_API_KEY ?? "";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const lat = searchParams.get("lat") ?? "37.5666";
  const lng = searchParams.get("lng") ?? "126.9784";
  const radius = searchParams.get("radius") ?? "5000";
  const contentTypeId = searchParams.get("type") ?? ""; // 12:관광지 14:문화시설 15:행사 39:음식점

  if (!TOUR_API_KEY) {
    return NextResponse.json({ error: "TOUR_API_KEY not set" }, { status: 500 });
  }

  const key = encodeURIComponent(TOUR_API_KEY);
  const params = new URLSearchParams({
    serviceKey: TOUR_API_KEY,
    numOfRows: "20",
    pageNo: "1",
    MobileOS: "ETC",
    MobileApp: "이음",
    _type: "json",
    mapX: lng,
    mapY: lat,
    radius,
    ...(contentTypeId && { contentTypeId }),
    arrange: "S", // 거리순
  });

  const res = await fetch(
    `https://apis.data.go.kr/B551011/KorService1/locationBasedList1?${params}`
  );

  if (!res.ok) {
    return NextResponse.json({ error: "Tour API error", status: res.status }, { status: 502 });
  }

  const data = await res.json();
  const items = data?.response?.body?.items?.item ?? [];
  const list = Array.isArray(items) ? items : [items];

  return NextResponse.json(
    list.map((item: Record<string, string>) => ({
      id: item.contentid,
      title: item.title,
      address: item.addr1,
      category: item.cat2name ?? item.cat1name ?? "",
      contentTypeId: item.contenttypeid,
      image: item.firstimage || item.firstimage2 || null,
      dist: Math.round(Number(item.dist)),
      lat: Number(item.mapy),
      lng: Number(item.mapx),
    }))
  );
}
