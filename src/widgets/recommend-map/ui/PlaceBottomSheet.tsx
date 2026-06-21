"use client";
import type { CultureEvent } from "@/shared/api/culture";

function fmtPeriod(s: string, e: string) {
  const d = (v: string) =>
    v && v.length === 8 ? `${v.slice(0, 4)}.${v.slice(4, 6)}.${v.slice(6, 8)}` : v;
  if (s && e && s !== e) return `${d(s)} ~ ${d(e)}`;
  return d(s || e);
}

interface Props {
  event: CultureEvent | null;
  onClose: () => void;
}

export default function PlaceBottomSheet({ event, onClose }: Props) {
  const open = !!event;
  return (
    <>
      <div
        onClick={onClose}
        className="fixed inset-0 z-[60] bg-black/40 transition-opacity"
        style={{ opacity: open ? 1 : 0, pointerEvents: open ? "auto" : "none" }}
      />
      <div
        className="fixed left-0 right-0 bottom-0 z-[61] rounded-t-2xl bg-white transition-transform duration-300"
        style={{ transform: open ? "translateY(0)" : "translateY(100%)" }}
      >
        <div className="mx-auto my-3 h-1 w-10 rounded-full bg-gray-300" />
        {event && (
          <div className="px-5 pb-8">
            {event.thumbnail && (
              <div className="mb-4 w-full overflow-hidden rounded-xl bg-gray-100" style={{ aspectRatio: "16/9" }}>
                <img src={event.thumbnail} alt={event.title} className="h-full w-full object-cover" />
              </div>
            )}
            <span className="text-xs font-semibold text-[#ee7f12]">
              {event.kind}{event.genre ? ` · ${event.genre}` : ""}
            </span>
            <h2 className="mt-1 text-lg font-bold text-gray-900">{event.title}</h2>
            <p className="mt-2 text-sm text-gray-600">{event.place}</p>
            <p className="text-sm text-gray-400">{event.area} {event.sigungu}</p>
            <p className="mt-1 text-sm text-gray-400">{fmtPeriod(event.startDate, event.endDate)}</p>
          </div>
        )}
      </div>
    </>
  );
}
