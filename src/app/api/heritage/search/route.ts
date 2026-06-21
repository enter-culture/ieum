import { NextResponse } from "next/server";
import { parseStringPromise } from "xml2js";

const API_KEY = process.env.HERITAGE_API_KEY ?? "/AZVKcyk74moGpLTCAi6K6GDE9BUTRi+ReTZW6bHYsBD4qHJgi/9Odu1FEZ+PHCevoJ7nAb94xolpbyGCbZyZQ==";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q") ?? "";
  const page = searchParams.get("page") ?? "1";

  const key = encodeURIComponent(API_KEY);
  const url = `http://www.cha.go.kr/cha/SearchKindOpenapiList.do?serviceKey=${key}&pageUnit=20&pageIndex=${page}&ccbaKdcd=17&searchWrd=${encodeURIComponent(query)}`;

  const res = await fetch(url);
  const xml = await res.text();
  const parsed = await parseStringPromise(xml, { explicitArray: false, trim: true });

  const items = parsed?.result?.item;
  const list = items ? (Array.isArray(items) ? items : [items]) : [];

  return NextResponse.json(
    list.map((item: Record<string, string>) => ({
      asno: item.ccbaAsno,
      ctcd: item.ccbaCtcd,
      kdcd: "17",
      name: item.ccbaMnm1,
      region: item.ccbaCtcdNm,
      category: item.ccmaName,
    }))
  );
}
