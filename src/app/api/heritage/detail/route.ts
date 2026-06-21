import { NextResponse } from "next/server";
import { parseStringPromise } from "xml2js";

const API_KEY = process.env.HERITAGE_API_KEY ?? "/AZVKcyk74moGpLTCAi6K6GDE9BUTRi+ReTZW6bHYsBD4qHJgi/9Odu1FEZ+PHCevoJ7nAb94xolpbyGCbZyZQ==";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const asno = searchParams.get("asno");
  const ctcd = searchParams.get("ctcd");
  const kdcd = searchParams.get("kdcd") ?? "17";

  if (!asno || !ctcd) return NextResponse.json({ error: "missing params" }, { status: 400 });

  const key = encodeURIComponent(API_KEY);
  const base = "http://www.cha.go.kr/cha";

  const [detailRes, imageRes] = await Promise.all([
    fetch(`${base}/SearchKindOpenapiDt.do?serviceKey=${key}&ccbaKdcd=${kdcd}&ccbaAsno=${asno}&ccbaCtcd=${ctcd}`),
    fetch(`${base}/SearchImageOpenapi.do?serviceKey=${key}&ccbaKdcd=${kdcd}&ccbaAsno=${asno}&ccbaCtcd=${ctcd}`),
  ]);

  const [detailXml, imageXml] = await Promise.all([detailRes.text(), imageRes.text()]);
  const [detailData, imageData] = await Promise.all([
    parseStringPromise(detailXml, { explicitArray: false, trim: true }),
    parseStringPromise(imageXml, { explicitArray: false, trim: true }),
  ]);

  const item = detailData?.result?.item ?? {};
  const imgItem = imageData?.result?.item;
  const images: string[] = [];
  if (imgItem) {
    const urls = imgItem.imageUrl;
    if (Array.isArray(urls)) images.push(...urls.filter(Boolean));
    else if (typeof urls === "string" && urls) images.push(urls);
  }

  return NextResponse.json({
    name: item.ccbaMnm1 ?? "",
    category: item.ccmaName ?? "",
    subCategory: [item.gcodeName, item.bcodeName, item.mcodeName].filter(Boolean).join(" > "),
    designatedAt: item.ccbaAsdt ?? "",
    region: item.ccbaCtcdNm ?? "",
    admin: item.ccbaAdmin ?? "",
    content: item.content ?? "",
    thumbnail: item.imageUrl ?? "",
    images,
  });
}
