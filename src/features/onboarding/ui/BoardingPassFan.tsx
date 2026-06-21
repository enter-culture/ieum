"use client";
import { useState, useRef } from "react";
import BoardingPassCard from "./BoardingPassCard";

interface Option {
  label: string;
  value: number | string;
  emoji: string;
  imageSrc?: string;
}

interface BoardingPassFanProps {
  options: Option[];
  selectedValues: (number | string)[];
  onSelect: (value: number | string) => void;
}

export default function BoardingPassFan({ options, selectedValues, onSelect }: BoardingPassFanProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) {
      if (diff > 0) setActiveIndex((i) => Math.min(i + 1, options.length - 1));
      else setActiveIndex((i) => Math.max(i - 1, 0));
    }
    touchStartX.current = null;
  };

  const getCardStyle = (index: number): React.CSSProperties => {
    const offset = index - activeIndex;
    const absOffset = Math.abs(offset);
    const translateX = offset * 72;
    const rotate = offset * 10;
    const scale = Math.max(0.55, 1 - absOffset * 0.18);
    const opacity = absOffset > 2 ? 0 : Math.max(0.35, 1 - absOffset * 0.3);

    return {
      transform: `translateX(${translateX}px) rotate(${rotate}deg) scale(${scale})`,
      opacity,
      zIndex: 20 - absOffset,
      transition: "transform 0.3s ease, opacity 0.3s ease",
      pointerEvents: absOffset > 2 ? "none" : "auto",
    };
  };

  const activeOption = options[activeIndex];
  const isActiveSelected = activeOption ? selectedValues.includes(activeOption.value) : false;

  return (
    <div className="flex flex-col flex-1 bg-[#0d0d1a] rounded-2xl overflow-hidden">
      {/* 카드 영역 */}
      <div
        className="flex-1 relative flex items-center justify-center"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* 배경 glow */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-40 h-40 rounded-full bg-[#ee7f12] opacity-10 blur-3xl" />
        </div>

        {/* 카드들 */}
        {options.map((option, index) => (
          <div
            key={option.value}
            className="absolute"
            style={getCardStyle(index)}
            onClick={() => {
              if (index !== activeIndex) setActiveIndex(index);
            }}
          >
            <BoardingPassCard
              label={option.label}
              emoji={option.emoji}
              imageSrc={option.imageSrc}
              isSelected={selectedValues.includes(option.value)}
              onClick={() => {
                if (index === activeIndex) onSelect(option.value);
                else setActiveIndex(index);
              }}
            />
          </div>
        ))}

        {/* 좌우 화살표 */}
        <button
          className="absolute left-3 z-30 w-8 h-8 rounded-full bg-white/10 text-white flex items-center justify-center text-lg"
          onClick={() => setActiveIndex((i) => Math.max(i - 1, 0))}
        >
          ‹
        </button>
        <button
          className="absolute right-3 z-30 w-8 h-8 rounded-full bg-white/10 text-white flex items-center justify-center text-lg"
          onClick={() => setActiveIndex((i) => Math.min(i + 1, options.length - 1))}
        >
          ›
        </button>
      </div>

      {/* 카드명 + 인디케이터 */}
      <div className="flex flex-col items-center gap-2 py-3">
        <p className="text-white font-bold text-base">{activeOption?.label}</p>
        <div className="flex gap-1.5">
          {options.map((_, i) => (
            <button
              key={i}
              onClick={() => setActiveIndex(i)}
              className="rounded-full transition-all duration-300"
              style={{
                width: i === activeIndex ? 16 : 6,
                height: 6,
                background: i === activeIndex ? "#ee7f12" : "rgba(255,255,255,0.3)",
              }}
            />
          ))}
        </div>
      </div>

      {/* 선택 버튼 */}
      <div className="px-4 pb-4">
        <button
          onClick={() => activeOption && onSelect(activeOption.value)}
          className="w-full py-3 rounded-xl font-bold text-sm transition-all"
          style={{
            background: isActiveSelected ? "rgba(238,127,18,0.15)" : "#ee7f12",
            color: isActiveSelected ? "#ee7f12" : "white",
            border: isActiveSelected ? "1px solid #ee7f12" : "none",
          }}
        >
          {isActiveSelected ? "✓ 선택됨 (탭하여 해제)" : "카드 선택"}
        </button>
      </div>
    </div>
  );
}
