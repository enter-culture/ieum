"use client";

import { useEffect, useState } from "react";

export default function LandingAnimation() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="relative w-full bg-[#e8e8e8] overflow-hidden" style={{ height: "100dvh" }}>
      {/* 배경 원형 데코 — 오른쪽 상단 */}
      <div
        className="absolute rounded-full"
        style={{
          width: 520,
          height: 520,
          top: -120,
          right: -140,
          background: "radial-gradient(circle, #ee7f12 0%, #f9a931 40%, transparent 70%)",
          opacity: 0.18,
          animation: "spin-slow 18s linear infinite",
        }}
      />

      {/* 배경 원형 데코 — 왼쪽 하단 */}
      <div
        className="absolute rounded-full"
        style={{
          width: 360,
          height: 360,
          bottom: -80,
          left: -100,
          background: "radial-gradient(circle, #ee7f12 0%, #f9a931 50%, transparent 70%)",
          opacity: 0.13,
          animation: "spin-slow 22s linear infinite reverse",
        }}
      />

      {/* 중앙 메인 영역 */}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-6">

        {/* 바깥 링 */}
        <div
          className="absolute rounded-full border-2 border-[#ee7f12]/20"
          style={{
            width: 280,
            height: 280,
            animation: "spin-slow 14s linear infinite",
          }}
        />

        {/* 중간 링 */}
        <div
          className="absolute rounded-full border border-[#ee7f12]/30"
          style={{
            width: 210,
            height: 210,
            animation: "spin-slow 10s linear infinite reverse",
          }}
        />

        {/* 안쪽 원 */}
        <div
          className="absolute rounded-full"
          style={{
            width: 150,
            height: 150,
            background: "radial-gradient(circle, #fde0b4 0%, #fef4e1 60%, transparent 100%)",
            animation: "pulse-ring 3s ease-in-out infinite",
          }}
        />

        {/* 텍스트 */}
        <div
          className="relative flex flex-col items-center gap-2 z-10"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(16px)",
            transition: "opacity 0.8s ease, transform 0.8s ease",
          }}
        >
          <p className="text-[#ee7f12] text-xs tracking-[0.35em] font-medium uppercase">
            Korea · Heritage
          </p>
          <h1
            className="font-black text-[#3E404C]"
            style={{ fontSize: 72, lineHeight: 1, letterSpacing: "-0.02em" }}
          >
            이음
          </h1>
          <p className="text-[#8C8F9F] text-sm tracking-widest mt-1">
            무형문화재를 잇다
          </p>
        </div>
      </div>

      {/* 하단 장식 점 */}
      <div className="absolute bottom-36 left-0 right-0 flex justify-center gap-2">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-[#ee7f12]"
            style={{
              opacity: 0.4,
              animation: `dot-bounce 1.4s ease-in-out ${i * 0.2}s infinite`,
            }}
          />
        ))}
      </div>

      <style>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes pulse-ring {
          0%, 100% { transform: scale(1);    opacity: 0.8; }
          50%       { transform: scale(1.08); opacity: 1; }
        }
        @keyframes dot-bounce {
          0%, 80%, 100% { transform: translateY(0);   opacity: 0.4; }
          40%           { transform: translateY(-8px); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
