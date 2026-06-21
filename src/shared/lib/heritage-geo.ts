import { heritageList } from "@/entities/heritage/data/heritageList";

export interface Coord {
  lat: number;
  lng: number;
}

/** heritageId → 대표 좌표. 없으면 null. */
export function resolveHeritageCoord(heritageId?: string): Coord | null {
  if (!heritageId) return null;
  const h = heritageList.find((x) => x.id === heritageId);
  if (!h || typeof h.lat !== "number" || typeof h.lng !== "number") return null;
  return { lat: h.lat, lng: h.lng };
}
