"use client";
import CheckboxButtonGroup from "@/app/_components/checkbox-button-group";

interface ShortsFilterGroupProps {
  title: string;
  options: { label: string; value: number | string }[];
  selectedValues: (number | string)[];
  onSelect: (value: number | string) => void;
  className?: string;
}

export default function ShortsFilterGroup({ title, options, selectedValues, onSelect, className }: ShortsFilterGroupProps) {
  return (
    <div className={`p-4 ${className || ""}`}>
      <div className="flex items-center gap-2 mb-3">
        <h3 className="text-base font-semibold">{title}</h3>
        <span className="text-xs text-[#ee7f12] border border-[#ee7f12] rounded-full px-2 py-0.5">복수 선택</span>
      </div>
      <CheckboxButtonGroup
        options={options}
        selectedValues={selectedValues}
        onSelect={onSelect}
      />
    </div>
  );
}
