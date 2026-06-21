import Image from "next/image";

interface BoardingPassCardProps {
  label: string;
  emoji: string;
  imageSrc?: string;
  isSelected: boolean;
  onClick: () => void;
}

export default function BoardingPassCard({
  label,
  emoji,
  imageSrc,
  isSelected,
  onClick,
}: BoardingPassCardProps) {
  return (
    <button
      onClick={onClick}
      className="relative w-[110px] h-[170px] bg-white rounded-xl shadow-md flex flex-col overflow-hidden select-none"
      style={{
        border: isSelected ? "2px solid #ee7f12" : "2px solid transparent",
      }}
    >
      {/* 선택 배지 */}
      {isSelected && (
        <div className="absolute top-2 right-2 z-10 bg-[#ee7f12] text-white text-[9px] font-bold rounded-full px-1.5 py-0.5 leading-tight">
          ✓ SELECTED
        </div>
      )}

      {/* 헤더 */}
      <div className="bg-[#FFF3E0] px-2 py-1.5 flex flex-col gap-0.5">
        <span className="text-[9px] font-bold text-[#ee7f12] tracking-widest">이음 AIR ✈️</span>
        <span className="text-[8px] text-gray-500 truncate">GATE: {label}</span>
      </div>

      {/* 퍼포레이션 */}
      <div className="border-t border-dashed border-gray-200 mx-2" />

      {/* 이미지 or 이모지 */}
      <div className="flex-1 relative overflow-hidden">
        {imageSrc ? (
          <Image
            src={imageSrc}
            alt={label}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-50">
            <span className="text-4xl">{emoji}</span>
          </div>
        )}
      </div>

      {/* 퍼포레이션 */}
      <div className="border-t border-dashed border-gray-200 mx-2" />

      {/* 하단 */}
      <div className="px-2 py-1.5 flex flex-col gap-0.5">
        <span className="text-[11px] font-bold text-gray-800 truncate">{label}</span>
        <span className="text-[7px] text-gray-400 tracking-widest">BOARDING PASS</span>
        {/* 바코드 */}
        <div className="flex gap-px mt-0.5">
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className="bg-gray-300"
              style={{ width: i % 3 === 0 ? 2 : 1, height: 8 }}
            />
          ))}
        </div>
      </div>
    </button>
  );
}
