"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";

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

const CARD_W = 130;

const RIGHT_SLOTS = [
  { tx: 0,   ty: -20, scale: 1,    rot: 0,  z: 7, opacity: 1   },
  { tx: 52,  ty: 0,   scale: 0.88, rot: 8,  z: 6, opacity: 1   },
  { tx: 104, ty: 0,   scale: 0.76, rot: 16, z: 5, opacity: 1   },
  { tx: 156, ty: 0,   scale: 0.64, rot: 24, z: 4, opacity: 0.4 },
  { tx: 208, ty: 0,   scale: 0.52, rot: 32, z: 3, opacity: 0.4 },
  { tx: 260, ty: 0,   scale: 0.40, rot: 40, z: 2, opacity: 0.4 },
  { tx: 312, ty: 0,   scale: 0.28, rot: 48, z: 1, opacity: 0.4 },
];
const LEFT_EXIT = { tx: -200, ty: 20, scale: 0.5, rot: -20, z: 0, opacity: 0 };

function getSlot(diff: number) {
  if (diff >= 0 && diff < RIGHT_SLOTS.length) return RIGHT_SLOTS[diff];
  if (diff === -1) return LEFT_EXIT;
  return { ...LEFT_EXIT, tx: -300, opacity: 0, z: 0 };
}

export default function BoardingPassFan({ options, selectedValues, onSelect }: BoardingPassFanProps) {
  const TOTAL = options.length;
  const [pivot, setPivot] = useState(0);
  const [flipped, setFlipped] = useState<boolean[]>(Array(TOTAL).fill(false));
  const [fanned, setFanned] = useState(false);
  const [uiReady, setUiReady] = useState(false);

  const dragX = useRef<number | null>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  const FLIP_INTERVAL = 90;
  const FAN_DELAY = 700;

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    for (let i = 0; i < TOTAL; i++) {
      timers.push(
        setTimeout(
          () => setFlipped((p) => { const n = [...p]; n[i] = true; return n; }),
          180 + i * FLIP_INTERVAL
        )
      );
    }
    timers.push(setTimeout(() => setFanned(true), 180 + TOTAL * FLIP_INTERVAL + FAN_DELAY));
    timers.push(setTimeout(() => setUiReady(true), 180 + TOTAL * FLIP_INTERVAL + FAN_DELAY + 350));
    return () => timers.forEach(clearTimeout);
  }, [TOTAL]);

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    dragX.current = e.clientX;
    trackRef.current?.setPointerCapture(e.pointerId);
  }, []);

  const onPointerUp = useCallback((e: React.PointerEvent) => {
    if (dragX.current === null) return;
    const dx = e.clientX - dragX.current;
    dragX.current = null;
    if (Math.abs(dx) < 12) return;
    if (dx < 0) setPivot((p) => Math.min(p + 1, TOTAL - 1));
    else setPivot((p) => Math.max(p - 1, 0));
  }, [TOTAL]);

  const activeOption = options[pivot];
  const isActiveSelected = activeOption ? selectedValues.includes(activeOption.value) : false;

  return (
    <>
      <style>{`
        @keyframes bp-flip {
          0%   { opacity: 0; transform: rotateY(90deg) scale(0.85); }
          55%  { transform: rotateY(-5deg) scale(1.03); opacity: 1; }
          100% { transform: rotateY(0deg) scale(1); opacity: 1; }
        }
        @keyframes bp-shimmer {
          0%   { background-position: -200% center; }
          100% { background-position:  200% center; }
        }
      `}</style>

      <div className="flex flex-col items-center w-full gap-4 py-4">
        {/* 팬 컨테이너 */}
        <div
          ref={trackRef}
          style={{
            touchAction: "pan-y",
            userSelect: "none",
            cursor: fanned ? "grab" : "default",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            width: "100%",
            height: "280px",
            position: "relative",
            overflow: "hidden",
          }}
          onPointerDown={onPointerDown}
          onPointerUp={onPointerUp}
        >
          {options
            .map((option, cardIdx) => {
              const diff = cardIdx - pivot;
              const slot = getSlot(diff);
              return { option, cardIdx, diff, slot };
            })
            .sort((a, b) => a.slot.z - b.slot.z)
            .map(({ option, cardIdx, diff, slot }) => {
              const isActive = diff === 0;
              const isFlipped = flipped[cardIdx];
              const isVisible = diff >= -1 && diff < RIGHT_SLOTS.length;
              const isSelected = selectedValues.includes(option.value);

              const stackTy = Math.max(0, diff) * 2;
              const preTransform = `translateY(${stackTy}px) scale(${1 - Math.max(0, diff) * 0.008})`;
              const fanTransform = `translateX(${slot.tx}px) translateY(${slot.ty}px) scale(${slot.scale}) rotate(${slot.rot}deg)`;

              return (
                <div
                  key={option.value}
                  onClick={() => {
                    if (!fanned) return;
                    if (isActive) onSelect(option.value);
                    else if (diff > 0) setPivot(cardIdx);
                  }}
                  style={{
                    position: "absolute",
                    left: `calc(50% - ${CARD_W / 2}px)`,
                    bottom: 0,
                    width: `${CARD_W}px`,
                    transformOrigin: "bottom center",
                    transform: fanned ? fanTransform : preTransform,
                    zIndex: slot.z,
                    opacity: isVisible ? (isFlipped || !fanned ? slot.opacity : 0) : 0,
                    cursor: fanned && isVisible ? "pointer" : "default",
                    transition: "transform 0.45s cubic-bezier(.16,1,.3,1), opacity 0.35s ease",
                    pointerEvents: isVisible ? "auto" : "none",
                    filter: isActive && fanned
                      ? "drop-shadow(0 8px 30px rgba(0,0,0,0.6)) drop-shadow(0 0 12px rgba(238,127,18,0.4))"
                      : "drop-shadow(0 8px 24px rgba(0,0,0,0.5))",
                  }}
                >
                  <div style={{ width: "100%", position: "relative" }}>
                    {/* 뒷면 */}
                    <div style={{
                      position: "absolute", inset: 0, zIndex: 2,
                      borderRadius: "10px",
                      background: "linear-gradient(135deg, #1a1832 0%, #0f0e1a 50%, #1a1832 100%)",
                      border: "2px solid #ee7f12",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      boxShadow: "0 16px 48px rgba(0,0,0,0.7)",
                      opacity: isFlipped ? 0 : 1,
                      transform: isFlipped ? "rotateY(90deg)" : "rotateY(0deg)",
                      transition: "transform 0.28s ease, opacity 0.25s ease",
                    }}>
                      <span style={{ fontSize: "1.5rem", color: "rgba(238,127,18,0.4)" }}>✈</span>
                    </div>

                    {/* 앞면 - 탑승권 스타일 */}
                    <div style={{
                      borderRadius: "10px",
                      overflow: "hidden",
                      position: "relative",
                      border: isSelected ? "2px solid #ee7f12" : "2px solid transparent",
                      boxShadow: isActive
                        ? "0 16px 48px rgba(0,0,0,0.7), 0 0 24px rgba(238,127,18,0.3)"
                        : "0 16px 48px rgba(0,0,0,0.7)",
                      opacity: isFlipped ? 1 : 0,
                      transform: isFlipped ? "rotateY(0deg)" : "rotateY(-90deg)",
                      transition: "opacity 0.3s ease 0.08s, transform 0.32s ease 0.06s, box-shadow 0.3s",
                      animation: isFlipped && !fanned ? "bp-flip 0.45s cubic-bezier(.16,1,.3,1) both" : "none",
                      background: "#fff",
                    }}>
                      {/* 헤더 */}
                      <div style={{
                        background: "#FFF3E0",
                        padding: "5px 8px",
                        display: "flex", flexDirection: "column", gap: 2,
                      }}>
                        <span style={{ fontSize: "8px", fontWeight: 700, color: "#ee7f12", letterSpacing: "0.1em" }}>이음 AIR ✈</span>
                        <span style={{ fontSize: "7px", color: "#999" }}>GATE: {option.label}</span>
                      </div>

                      {/* 퍼포레이션 */}
                      <div style={{ borderTop: "1px dashed #e0e0e0", margin: "0 8px" }} />

                      {/* 이미지 영역 */}
                      <div style={{ position: "relative", height: "140px", overflow: "hidden" }}>
                        {option.imageSrc ? (
                          <Image
                            src={option.imageSrc}
                            alt={option.label}
                            fill
                            style={{ objectFit: "cover" }}
                            draggable={false}
                          />
                        ) : (
                          <div style={{
                            width: "100%", height: "100%",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            background: "#f5f5f5", fontSize: "2.5rem",
                          }}>
                            {option.emoji}
                          </div>
                        )}
                        {/* 하단 그라데이션 페이드 */}
                        <div style={{
                          position: "absolute", inset: 0,
                          background: "linear-gradient(transparent 50%, rgba(0,0,0,0.6) 100%)",
                          pointerEvents: "none",
                        }} />
                        {/* 카드명 */}
                        <span style={{
                          position: "absolute", bottom: "8%", left: "10%", right: "10%",
                          textAlign: "center",
                          fontWeight: 700, fontSize: "0.75rem",
                          color: "#f0d48a",
                          textShadow: "0 2px 8px rgba(0,0,0,0.9)",
                          pointerEvents: "none",
                        }}>
                          {option.label}
                        </span>
                        {/* 선택됨 배지 */}
                        {isSelected && (
                          <div style={{
                            position: "absolute", top: 6, right: 6,
                            background: "#ee7f12", color: "white",
                            borderRadius: "999px", padding: "2px 6px",
                            fontSize: "8px", fontWeight: 700,
                          }}>
                            ✓
                          </div>
                        )}
                        {/* shimmer */}
                        {isActive && fanned && (
                          <div style={{
                            position: "absolute", inset: 0, pointerEvents: "none",
                            background: "linear-gradient(105deg, transparent 30%, rgba(238,127,18,0.15) 50%, transparent 70%)",
                            backgroundSize: "200% 100%",
                            animation: "bp-shimmer 2.5s ease-in-out infinite",
                          }} />
                        )}
                      </div>

                      {/* 퍼포레이션 */}
                      <div style={{ borderTop: "1px dashed #e0e0e0", margin: "0 8px" }} />

                      {/* 바코드 */}
                      <div style={{ padding: "5px 8px", display: "flex", gap: 1 }}>
                        {Array.from({ length: 22 }).map((_, i) => (
                          <div key={i} style={{
                            background: "#ccc",
                            width: i % 3 === 0 ? 2 : 1,
                            height: 8,
                          }} />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
        </div>

        {/* 카드명 */}
        <div style={{
          textAlign: "center",
          opacity: uiReady ? 1 : 0,
          transform: uiReady ? "translateY(0)" : "translateY(8px)",
          transition: "opacity 0.35s ease, transform 0.35s ease",
        }}>
          <p style={{ fontSize: "0.9rem", color: "#333", fontWeight: 700 }}>
            {activeOption?.label}
            {isActiveSelected && <span style={{ marginLeft: 6, color: "#ee7f12" }}>✓</span>}
          </p>
        </div>
      </div>
    </>
  );
}
