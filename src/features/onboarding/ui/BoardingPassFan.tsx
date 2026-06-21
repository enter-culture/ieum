import BoardingPassCard from "./BoardingPassCard";

// 8장 기준 각도 배열: -70° ~ +70°, 20° 간격
const ANGLES = [-70, -50, -30, -10, 10, 30, 50, 70];
// 중앙 카드가 위에 오도록 z-index 설정
const Z_INDICES = [1, 2, 3, 4, 4, 3, 2, 1];

interface BoardingPassFanProps {
  options: { label: string; value: number | string; emoji: string; imageSrc?: string }[];
  selectedValues: (number | string)[];
  onSelect: (value: number | string) => void;
}

export default function BoardingPassFan({
  options,
  selectedValues,
  onSelect,
}: BoardingPassFanProps) {
  return (
    <div className="relative w-full h-72 flex items-end justify-center overflow-hidden">
      {options.map((option, index) => {
        const isSelected = selectedValues.includes(option.value);
        const angle = ANGLES[index] ?? 0;
        const zIndex = isSelected ? 10 : (Z_INDICES[index] ?? 1);

        return (
          <div
            key={option.value}
            className="absolute bottom-4"
            style={{
              zIndex,
              transform: `rotate(${angle}deg) translateY(${isSelected ? "-24px" : "0px"})`,
              transformOrigin: "bottom center",
              transition: "transform 0.2s ease-out, z-index 0s",
            }}
          >
            <BoardingPassCard
              label={option.label}
              emoji={option.emoji}
              imageSrc={option.imageSrc}
              isSelected={isSelected}
              onClick={() => onSelect(option.value)}
            />
          </div>
        );
      })}
    </div>
  );
}
