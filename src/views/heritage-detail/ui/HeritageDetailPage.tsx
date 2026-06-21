"use client";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";

interface HeritageDetail {
  name: string;
  category: string;
  subCategory: string;
  designatedAt: string;
  region: string;
  admin: string;
  content: string;
  thumbnail: string;
  images: string[];
}

export default function HeritageDetailPage({ id }: { id: string }) {
  const router = useRouter();
  const [data, setData] = useState<HeritageDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch(`/api/heritage/${id}`)
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div className="flex items-center justify-center h-dvh bg-black">
      <div className="w-5 h-5 border-[1.5px] border-white/20 border-t-white rounded-full animate-spin" />
    </div>
  );

  if (!data) return (
    <div className="flex items-center justify-center h-dvh bg-black text-white/40 text-sm">
      데이터를 불러올 수 없습니다.
    </div>
  );

  const allImages = (data.images ?? []).length > 0 ? data.images : data.thumbnail ? [data.thumbnail] : [];
  const year = data.designatedAt?.slice(0, 4) ?? "";
  const paragraphs = data.content?.split(/\n+/).map(p => p.trim()).filter(Boolean) ?? [];

  return (
    <div ref={containerRef} className="h-dvh overflow-y-auto bg-black">

      {/* 헤더 */}
      <div className="sticky top-0 z-50 px-5 py-4 flex items-center justify-between" style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(20px)" }}>
        <button onClick={() => router.back()} className="text-white/50 hover:text-white transition-colors">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M19 12H5M12 5l-7 7 7 7"/>
          </svg>
        </button>
        <span className="text-xs text-white/40 tracking-[0.2em] uppercase font-medium">{data.category}</span>
        <div className="w-5" />
      </div>

      {/* 히어로 — 이미지 + 텍스트 오버레이 */}
      <div className="relative" style={{ aspectRatio: "3/4", maxHeight: "70dvh" }}>
        {allImages[activeImg] && (
          <img
            src={allImages[activeImg]}
            alt={data.name}
            className="absolute inset-0 w-full h-full object-cover"
            style={{ filter: "brightness(0.65)" }}
          />
        )}
        {/* 이미지 선택 도트 */}
        {allImages.length > 1 && (
          <div className="absolute bottom-32 left-0 right-0 flex justify-center gap-1.5">
            {allImages.slice(0, 8).map((_, i) => (
              <button key={i} onClick={() => setActiveImg(i)}
                style={{ width: i === activeImg ? 16 : 4, height: 4, borderRadius: 99, background: i === activeImg ? "#fff" : "rgba(255,255,255,0.35)", transition: "all 0.3s" }}
              />
            ))}
          </div>
        )}
        {/* 타이틀 */}
        <div className="absolute bottom-0 left-0 right-0 px-5 pb-8 pt-16" style={{ background: "linear-gradient(transparent, rgba(0,0,0,0.9))" }}>
          <p className="text-white/50 text-xs tracking-[0.25em] uppercase mb-3">{data.region} · {year}</p>
          <h1 className="text-white font-black leading-none tracking-[-0.03em]" style={{ fontSize: "clamp(44px, 14vw, 72px)" }}>
            {data.name}
          </h1>
        </div>
      </div>

      {/* 화이트 섹션 시작 */}
      <div className="bg-white">

        {/* 리드 문단 */}
        {paragraphs[0] && (
          <div className="px-5 pt-10 pb-8">
            <p className="text-[18px] font-medium text-gray-800 leading-[1.8]">
              {paragraphs[0]}
            </p>
          </div>
        )}

        {/* 얇은 구분 */}
        <div className="mx-5 h-px bg-gray-100" />

        {/* 스펙 행 */}
        <div className="px-5 py-7 space-y-4">
          {[
            { label: "분류", value: data.subCategory?.split(" > ").pop() },
            { label: "소재지", value: data.region },
            { label: "관리", value: data.admin },
          ].filter(r => r.value).map(({ label, value }) => (
            <div key={label} className="flex justify-between items-start gap-4">
              <span className="text-xs text-gray-400 pt-0.5 flex-shrink-0">{label}</span>
              <span className="text-sm text-gray-900 text-right">{value}</span>
            </div>
          ))}
        </div>

        {/* 본문 — 다크 배경으로 전환 */}
        {paragraphs.length > 1 && (
          <div className="bg-[#111] px-5 py-10 space-y-5 mt-2">
            <p className="text-xs text-white/30 tracking-[0.2em] uppercase mb-6">소개</p>
            {paragraphs.slice(1).map((para, i) => (
              <p key={i} className="text-[15px] text-white/70 leading-[1.9]">{para}</p>
            ))}
          </div>
        )}

        {/* 갤러리 — 가로 스크롤 */}
        {allImages.length > 1 && (
          <div className="py-8 bg-white">
            <div className="flex items-baseline justify-between px-5 mb-4">
              <p className="text-xs font-semibold tracking-[0.2em] text-gray-900 uppercase">Photos</p>
              <p className="text-xs text-gray-400">{allImages.length}장</p>
            </div>
            <div className="flex gap-2 px-5 overflow-x-auto scrollbar-hide pb-1">
              {allImages.map((img, i) => (
                <button
                  key={i}
                  onClick={() => { setActiveImg(i); containerRef.current?.scrollTo({ top: 0, behavior: "smooth" }); }}
                  className="flex-shrink-0 overflow-hidden transition-all duration-200"
                  style={{
                    width: 110, height: 80, borderRadius: 10,
                    outline: i === activeImg ? "2px solid #111" : "2px solid transparent",
                    outlineOffset: 2,
                    opacity: i === activeImg ? 1 : 0.6,
                  }}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="h-10 bg-white" />
    </div>
  );
}
