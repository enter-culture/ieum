import { apiUrl } from "@/shared/api/base";
import type { Coord } from "@/shared/lib/heritage-geo";

export interface CultureEvent {
  id: string;
  kind: string;
  title: string;
  genre: string;
  place: string;
  area: string;
  sigungu: string;
  startDate: string;
  endDate: string;
  thumbnail: string | null;
  lat: number;
  lng: number;
}

export function toBbox(center: Coord, pad = 0.05) {
  return {
    xfrom: center.lng - pad,
    yfrom: center.lat - pad,
    xto: center.lng + pad,
    yto: center.lat + pad,
  };
}

async function fetchOne(
  center: Coord,
  from: string,
  to: string,
): Promise<CultureEvent[]> {
  const b = toBbox(center);
  const qs = `xfrom=${b.xfrom}&yfrom=${b.yfrom}&xto=${b.xto}&yto=${b.yto}&from=${from}&to=${to}`;
  const res = await fetch(apiUrl(`/culture/events?${qs}`));
  if (!res.ok) throw new Error(`culture ${res.status}`);
  return res.json();
}

/** 여러 중심 좌표에 대해 병렬 호출 후 id로 dedup. 일부 실패는 무시. */
export async function fetchEventsForCenters(
  centers: Coord[],
  from: string,
  to: string,
): Promise<CultureEvent[]> {
  const settled = await Promise.allSettled(
    centers.map((c) => fetchOne(c, from, to)),
  );
  const byId = new Map<string, CultureEvent>();
  for (const r of settled) {
    if (r.status !== "fulfilled") continue;
    for (const e of r.value) if (!byId.has(e.id)) byId.set(e.id, e);
  }
  return [...byId.values()];
}
