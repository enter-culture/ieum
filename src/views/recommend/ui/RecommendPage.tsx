"use client";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useLikes } from "@/shared/lib/likes-store";
import { resolveHeritageCoord, type Coord } from "@/shared/lib/heritage-geo";
import { fetchEventsForCenters, type CultureEvent } from "@/shared/api/culture";
import { filterByKind } from "@/widgets/recommend-map/lib/filter";
import KakaoMap from "@/widgets/recommend-map/ui/KakaoMap";
import CategoryChips from "@/widgets/recommend-map/ui/CategoryChips";
import PlaceBottomSheet from "@/widgets/recommend-map/ui/PlaceBottomSheet";

function yyyymmdd(d: Date) {
  return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
}

export default function RecommendPage() {
  const router = useRouter();
  const { likedList } = useLikes();
  const [events, setEvents] = useState<CultureEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [chip, setChip] = useState("");
  const [selected, setSelected] = useState<CultureEvent | null>(null);

  const sources = useMemo<Coord[]>(() => {
    const seen = new Set<string>();
    const out: Coord[] = [];
    for (const l of likedList) {
      if (!l.heritageId || seen.has(l.heritageId)) continue;
      const c = resolveHeritageCoord(l.heritageId);
      if (c) { seen.add(l.heritageId); out.push(c); }
    }
    return out;
  }, [likedList]);

  useEffect(() => {
    if (sources.length === 0) { setLoading(false); setEvents([]); return; }
    setLoading(true);
    const now = new Date();
    const later = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);
    fetchEventsForCenters(sources, yyyymmdd(now), yyyymmdd(later))
      .then(setEvents)
      .catch(() => setEvents([]))
      .finally(() => setLoading(false));
  }, [sources]);

  const shown = useMemo(() => filterByKind(events, chip), [events, chip]);

  if (!loading && sources.length === 0) {
    return (
      <div className="flex h-dvh flex-col items-center justify-center gap-4 bg-white px-8 text-center">
        <p className="text-gray-500">쇼츠에서 마음에 드는 문화재에 좋아요를 눌러보세요.</p>
        <button onClick={() => router.push("/explore")} className="rounded-full bg-[#ee7f12] px-5 py-2 text-sm font-medium text-white">
          쇼츠 보러가기
        </button>
      </div>
    );
  }

  return (
    <div className="relative h-dvh bg-white pb-16">
      <div className="absolute left-0 right-0 top-0 z-50 bg-white/90 backdrop-blur-md">
        <h1 className="px-4 pt-10 text-xl font-bold text-gray-900">주변 문화 추천</h1>
        <CategoryChips active={chip} onChange={setChip} />
      </div>
      <div className="h-full pt-[120px]">
        <KakaoMap sources={sources} events={shown} onSelect={setSelected} />
      </div>
      {loading && (
        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 rounded-full bg-black/60 px-4 py-2 text-xs text-white">
          불러오는 중…
        </div>
      )}
      <PlaceBottomSheet event={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
