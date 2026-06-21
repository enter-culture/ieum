import type { CultureEvent } from "@/shared/api/culture";

export const CHIPS: { label: string; kind: string }[] = [
  { label: "전체", kind: "" },
  { label: "공연", kind: "공연" },
  { label: "전시", kind: "전시" },
];

export function filterByKind(events: CultureEvent[], kind: string): CultureEvent[] {
  if (!kind) return events;
  return events.filter((e) => e.kind === kind);
}
