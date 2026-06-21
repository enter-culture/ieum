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

const CARD_W = 210;

// 가운데 카드 집중 — 옆 카드는 충분히 띄워서 보임
function getSlot(diff: number) {
  const abs = Math.abs(diff);
  const sign = diff >= 0 ? 1 : -1;
  if (abs === 0) return { tx: 0,          ty: -20, scale: 1,    rot: 0,         z: 10, opacity: 1    };
  if (abs === 1) return { tx: sign * 115, ty: 0,   scale: 0.75, rot: sign * 14, z: 6,  opacity: 0.65 };
  if (abs === 2) return { tx: sign * 165, ty: 0,   scale: 0.58, rot: sign * 25, z: 3,  opacity: 0.3  };
  return                 { tx: sign * 200, ty: 0,   scale: 0.4,  rot: sign * 35, z: 1,  opacity: 0    };
}

export default function BoardingPassFan({ options, selectedValues, onSelect }: BoardingPassFanProps) {
  const TOTAL = options.length;
  const [pivot, setPivot] = useState(0);
  const [flipped, setFlipped] = useState<boolean[]>(Array(TOTAL).fill(false));
  const [fanned, setFanned] = useState(false);
  const [uiReady, setUiReady] = useState(false);

  const dragX = useRef<number | null>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    for (let i = 0; i < TOTAL; i++) {
      timers.push(
        setTimeout(
          () => setFlipped((p) => { const n = [...p]; n[i] = true; return n; }),
          180 + i * 90
        )
      );
    }
    timers.push(setTimeout(() => setFanned(true),   180 + TOTAL * 90 + 700));
    timers.push(setTimeout(() => setUiReady(true),  180 + TOTAL * 90 + 1050));
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
    else         setPivot((p) => Math.max(p - 1, 0));
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

      {/* flex-1 로 남은 화면 전부 사용 */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%", flex: 1, gap: 12, paddingBottom: 8 }}>

        {/* 팬 컨테이너 — flex-1 로 높이 자동 확장 */}
        <div
          ref={trackRef}
          style={{
            flex: 1,
            touchAction: "pan-y",
            userSelect: "none",
            cursor: fanned ? "grab" : "default",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            width: "100%",
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
              const isActive   = diff === 0;
              const isFlipped  = flipped[cardIdx];
              const isVisible  = Math.abs(diff) <= 3;
              const isSelected = selectedValues.includes(option.value);

              const stackTy      = Math.max(0, diff) * 3;
              const preTransform = `translateY(${stackTy}px) scale(${1 - Math.max(0, diff) * 0.01})`;
              const fanTransform = `translateX(${slot.tx}px) translateY(${slot.ty}px) scale(${slot.scale}) rotate(${slot.rot}deg)`;

              return (
                <div
                  key={option.value}
                  onClick={() => {
                    if (!fanned) return;
                    if (isActive) onSelect(option.value);
                    else setPivot(cardIdx);
                  }}
                  style={{
                    position: "absolute",
                    left: `calc(50% - ${CARD_W / 2}px)`,
                    top: "50%",
                    width: `${CARD_W}px`,
                    transformOrigin: "center center",
                    transform: fanned ? `translateY(-50%) ${fanTransform}` : `translateY(-50%) ${preTransform}`,
                    zIndex: slot.z,
                    opacity: isVisible ? (isFlipped || !fanned ? slot.opacity : 0) : 0,
                    cursor: fanned && isVisible ? "pointer" : "default",
                    transition: "transform 0.45s cubic-bezier(.16,1,.3,1), opacity 0.35s ease",
                    pointerEvents: isVisible ? "auto" : "none",
                    filter: isActive && fanned
                      ? "drop-shadow(0 8px 30px rgba(0,0,0,0.5)) drop-shadow(0 0 16px rgba(238,127,18,0.4))"
                      : "drop-shadow(0 4px 16px rgba(0,0,0,0.3))",
                  }}
                >
                  <div style={{ width: "100%", position: "relative" }}>
                    {/* 뒷면 */}
                    <div style={{
                      position: "absolute", inset: 0, zIndex: 2,
                      borderRadius: "12px",
                      background: "linear-gradient(135deg, #1a1832 0%, #0f0e1a 50%, #1a1832 100%)",
                      border: "2px solid #ee7f12",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      boxShadow: "0 16px 48px rgba(0,0,0,0.7)",
                      opacity: isFlipped ? 0 : 1,
                      transform: isFlipped ? "rotateY(90deg)" : "rotateY(0deg)",
                      transition: "transform 0.28s ease, opacity 0.25s ease",
                    }}>
                      <span style={{ fontSize: "2rem", color: "rgba(238,127,18,0.4)" }}>✈</span>
                    </div>

                    {/* 앞면 */}
                    <div style={{
                      borderRadius: "12px",
                      overflow: "hidden",
                      position: "relative",
                      border: isSelected ? "2.5px solid #ee7f12" : "2px solid transparent",
                      boxShadow: isActive
                        ? "0 16px 48px rgba(0,0,0,0.5), 0 0 28px rgba(238,127,18,0.25)"
                        : "0 8px 24px rgba(0,0,0,0.3)",
                      opacity: isFlipped ? 1 : 0,
                      transform: isFlipped ? "rotateY(0deg)" : "rotateY(-90deg)",
                      transition: "opacity 0.3s ease 0.08s, transform 0.32s ease 0.06s, box-shadow 0.3s",
                      animation: isFlipped && !fanned ? "bp-flip 0.45s cubic-bezier(.16,1,.3,1) both" : "none",
                      background: "#fff",
                    }}>
                      {/* 헤더 */}
                      <div style={{ background: "#FFF3E0", padding: "7px 10px", display: "flex", flexDirection: "column", gap: 2 }}>
                        <span style={{ fontSize: "11px", fontWeight: 700, color: "#ee7f12", letterSpacing: "0.1em" }}>이음 AIR ✈</span>
                        <span style={{ fontSize: "10px", color: "#aaa" }}>GATE: {option.label}</span>
                      </div>

                      {/* 퍼포레이션 */}
                      <div style={{ borderTop: "1px dashed #e0e0e0", margin: "0 10px" }} />

                      {/* 이미지 */}
                      <div style={{ position: "relative", height: "240px", overflow: "hidden" }}>
                        {option.imageSrc ? (
                          <Image src={option.imageSrc} alt={option.label} fill style={{ objectFit: "cover" }} draggable={false} />
                        ) : (
                          <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#f5f5f5", fontSize: "3rem" }}>
                            {option.emoji}
                          </div>
                        )}
                        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(transparent 55%, rgba(0,0,0,0.65) 100%)", pointerEvents: "none" }} />
                        <span style={{ position: "absolute", bottom: "8%", left: 0, right: 0, textAlign: "center", fontWeight: 700, fontSize: "0.9rem", color: "#f0d48a", textShadow: "0 2px 8px rgba(0,0,0,0.9)", pointerEvents: "none" }}>
                          {option.label}
                        </span>
                        {isSelected && (
                          <div style={{ position: "absolute", top: 8, right: 8, background: "#ee7f12", color: "white", borderRadius: "999px", padding: "3px 8px", fontSize: "10px", fontWeight: 700 }}>
                            ✓
                          </div>
                        )}
                        {isActive && fanned && (
                          <div style={{ position: "absolute", inset: 0, pointerEvents: "none", background: "linear-gradient(105deg, transparent 30%, rgba(238,127,18,0.12) 50%, transparent 70%)", backgroundSize: "200% 100%", animation: "bp-shimmer 2.5s ease-in-out infinite" }} />
                        )}
                      </div>

                      {/* 퍼포레이션 */}
                      <div style={{ borderTop: "1px dashed #e0e0e0", margin: "0 10px" }} />

                      {/* 바코드 */}
                      <div style={{ padding: "6px 10px", display: "flex", gap: 1 }}>
                        {Array.from({ length: 26 }).map((_, i) => (
                          <div key={i} style={{ background: "#ccc", width: i % 3 === 0 ? 2 : 1, height: 9 }} />
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
          paddingBottom: 4,
        }}>
          <p style={{ fontSize: "1rem", color: "#333", fontWeight: 700 }}>
            {activeOption?.label}
            {isActiveSelected && <span style={{ marginLeft: 8, color: "#ee7f12" }}>✓</span>}
          </p>
          <p style={{ fontSize: "0.75rem", color: "#aaa", marginTop: 2 }}>탭해서 선택 · 스와이프로 이동</p>
        </div>
      </div>
    </>
  );
}
