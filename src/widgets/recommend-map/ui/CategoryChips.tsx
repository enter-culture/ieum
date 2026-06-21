"use client";
import { CHIPS } from "@/widgets/recommend-map/lib/filter";

interface Props {
  active: string;
  onChange: (kind: string) => void;
}

export default function CategoryChips({ active, onChange }: Props) {
  return (
    <div className="flex gap-2 overflow-x-auto scrollbar-hide px-4 py-3">
      {CHIPS.map((c) => {
        const on = active === c.kind;
        return (
          <button
            key={c.kind || "all"}
            onClick={() => onChange(c.kind)}
            className="whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium transition-colors"
            style={{
              background: on ? "#ee7f12" : "rgba(0,0,0,0.05)",
              color: on ? "white" : "#4b5563",
            }}
          >
            {c.label}
          </button>
        );
      })}
    </div>
  );
}
