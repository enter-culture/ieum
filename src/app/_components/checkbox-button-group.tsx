import clsx from "clsx";

export interface CheckboxButtonGroupProps {
  options: { label: string; value: number | string; icon?: { active: React.ReactNode; inactive: React.ReactNode } }[];
  selectedValues: (number | string)[];
  onSelect: (value: number | string) => void;
  className?: string;
}

export default function CheckboxButtonGroup({ options, selectedValues, onSelect, className }: CheckboxButtonGroupProps) {
  return (
    <div className={clsx("flex flex-wrap gap-x-[8px] gap-y-[12px]", className)}>
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => onSelect(option.value)}
          className={clsx(
            "rounded-full border px-4 py-2 text-sm font-medium text-black bg-[#F7F7FA] border-[#F7F7FA]",
            selectedValues.includes(option.value) && "bg-[#fcf5ec] text-[#ee7f12] border border-[#ee7f12]"
          )}
        >
          <div className="flex gap-[8px] items-center">
            {option.icon && selectedValues.includes(option.value) ? option.icon.active : option.icon?.inactive}
            {option.label}
          </div>
        </button>
      ))}
    </div>
  );
}
