import { NextResponse } from "next/server";
import { parseStringPromise } from "xml2js";

const API_KEY = process.env.HERITAGE_API_KEY ?? "/AZVKcyk74moGpLTCAi6K6GDE9BUTRi+ReTZW6bHYsBD4qHJgi/9Odu1FEZ+PHCevoJ7nAb94xolpbyGCbZyZQ==";

const HERITAGE_CODES: Record<string, { ccbaAsno: string; ccbaCtcd: string; ccbaKdcd: string }> = {
  "ganggang-sullae": { ccbaAsno: "0000080000000", ccbaCtcd: "36", ccbaKdcd: "17" },
  "pansori":         { ccbaAsno: "0000050000000", ccbaCtcd: "ZZ", ccbaKdcd: "17" },
  "hahoetal":        { ccbaAsno: "0000680000000", ccbaCtcd: "37", ccbaKdcd: "17" },
  "namsadang":       { ccbaAsno: "0000030000000", ccbaCtcd: "11", ccbaKdcd: "17" },
  "taekkyeon":       { ccbaAsno: "0000750000000", ccbaCtcd: "33", ccbaKdcd: "17" },
};

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const code = HERITAGE_CODES[id];
  if (!code) return NextResponse.json({ error: "not found" }, { status: 404 });

  const key = encodeURIComponent(API_KEY);
  const base = "http://www.cha.go.kr/cha";

  const [detailRes, imageRes] = await Promise.all([
    fetch(`${base}/SearchKindOpenapiDt.do?serviceKey=${key}&ccbaKdcd=${code.ccbaKdcd}&ccbaAsno=${code.ccbaAsno}&ccbaCtcd=${code.ccbaCtcd}`),
    fetch(`${base}/SearchImageOpenapi.do?serviceKey=${key}&ccbaKdcd=${code.ccbaKdcd}&ccbaAsno=${code.ccbaAsno}&ccbaCtcd=${code.ccbaCtcd}`),
  ]);

  const [detailXml, imageXml] = await Promise.all([detailRes.text(), imageRes.text()]);

  const [detailData, imageData] = await Promise.all([
    parseStringPromise(detailXml, { explicitArray: false, trim: true }),
    parseStringPromise(imageXml,  { explicitArray: false, trim: true }),
  ]);

  const item = detailData?.result?.item ?? {};
  const imgItem = imageData?.result?.item;
  const images: string[] = [];

  if (imgItem) {
    // xml2js가 같은 태그명 여러 개를 배열로 묶음 → imageUrl이 배열일 수 있음
    const imageUrls = imgItem.imageUrl;
    if (Array.isArray(imageUrls)) {
      images.push(...imageUrls.filter(Boolean));
    } else if (typeof imageUrls === "string" && imageUrls) {
      images.push(imageUrls);
    }
  }

  return NextResponse.json({
    name:         item.ccbaMnm1 ?? "",
    category:     item.ccmaName ?? "",
    subCategory:  [item.gcodeName, item.bcodeName, item.mcodeName].filter(Boolean).join(" > "),
    designatedAt: item.ccbaAsdt ?? "",
    region:       item.ccbaCtcdNm ?? "",
    admin:        item.ccbaAdmin ?? "",
    content:      item.content ?? "",
    thumbnail:    item.imageUrl ?? "",
    images,
  });
}
