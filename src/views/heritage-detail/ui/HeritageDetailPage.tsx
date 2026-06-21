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
  const [scrollY, setScrollY] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch(`/api/heritage/${id}`)
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onScroll = () => setScrollY(el.scrollTop);
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-dvh bg-white">
      <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!data) return (
    <div className="flex items-center justify-center h-dvh bg-white text-gray-400 text-sm">
      데이터를 불러올 수 없습니다.
    </div>
  );

  const allImages = (data.images ?? []).length > 0 ? data.images : data.thumbnail ? [data.thumbnail] : [];
  const formattedDate = data.designatedAt
    ? `${data.designatedAt.slice(0, 4)}.${data.designatedAt.slice(4, 6)}.${data.designatedAt.slice(6, 8)}`
    : "";

  const heroOpacity = Math.max(0, 1 - scrollY / 300);
  const titleY = Math.min(scrollY * 0.3, 60);

  return (
    <div ref={containerRef} className="h-dvh overflow-y-auto bg-white" style={{ scrollBehavior: "smooth" }}>

      {/* 뒤로가기 — 고정 */}
      <button
        onClick={() => router.back()}
        className="fixed top-4 left-4 z-50 w-8 h-8 rounded-full flex items-center justify-center transition-all"
        style={{
          background: scrollY > 200 ? "rgba(0,0,0,0.08)" : "rgba(255,255,255,0.25)",
          backdropFilter: "blur(10px)",
        }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
          stroke={scrollY > 200 ? "#000" : "#fff"} strokeWidth="2.5">
          <path d="M19 12H5M12 5l-7 7 7 7"/>
        </svg>
      </button>

      {/* 히어로 — 풀스크린 이미지 */}
      <div className="relative h-dvh overflow-hidden">
        {allImages[0] && (
          <img
            src={allImages[activeImg]}
            alt={data.name}
            className="absolute inset-0 w-full h-full object-cover"
            style={{ transform: `scale(${1 + scrollY * 0.0003}) translateY(${scrollY * 0.15}px)` }}
          />
        )}
        {/* 그라데이션 */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/70" />

        {/* 히어로 텍스트 */}
        <div
          className="absolute bottom-0 left-0 right-0 px-6 pb-16"
          style={{ transform: `translateY(${titleY}px)`, opacity: heroOpacity }}
        >
          <p className="text-white/70 text-sm font-medium tracking-widest uppercase mb-2">
            {data.category}
          </p>
          <h1 className="text-white text-5xl font-bold tracking-tight leading-none mb-4">
            {data.name}
          </h1>
          {data.subCategory && (
            <p className="text-white/60 text-base">{data.subCategory}</p>
          )}
        </div>
      </div>

      {/* 핵심 지표 — 애플 스펙 행 */}
      <div className="bg-[#f5f5f7] px-6 py-10">
        <div className="flex justify-around text-center">
          {formattedDate && (
            <div>
              <p className="text-2xl font-bold text-black tracking-tight">{formattedDate}</p>
              <p className="text-xs text-gray-500 mt-1">지정일</p>
            </div>
          )}
          {data.region && (
            <div>
              <p className="text-2xl font-bold text-black tracking-tight">{data.region.replace("특별시", "").replace("광역시", "").trim()}</p>
              <p className="text-xs text-gray-500 mt-1">소재지</p>
            </div>
          )}
          {allImages.length > 0 && (
            <div>
              <p className="text-2xl font-bold text-black tracking-tight">{allImages.length}</p>
              <p className="text-xs text-gray-500 mt-1">아카이브</p>
            </div>
          )}
        </div>
      </div>

      {/* 소개 — 대형 타이포그래피 */}
      {data.content && (
        <div className="px-6 py-16 bg-white">
          <p className="text-xs font-semibold text-[#ee7f12] tracking-widest uppercase mb-6">소개</p>
          <p className="text-xl font-light text-gray-900 leading-relaxed">
            {data.content.split("\n")[0]}
          </p>
          {data.content.split("\n").length > 1 && (
            <p className="text-base text-gray-500 leading-relaxed mt-6">
              {data.content.split("\n").slice(1).join(" ").trim()}
            </p>
          )}
        </div>
      )}

      {/* 이미지 갤러리 */}
      {allImages.length > 1 && (
        <div className="bg-black py-16">
          <p className="text-xs font-semibold text-[#ee7f12] tracking-widest uppercase px-6 mb-8">갤러리</p>

          {/* 메인 이미지 */}
          <div className="relative aspect-square overflow-hidden mb-3">
            <img
              src={allImages[activeImg]}
              alt=""
              className="w-full h-full object-cover transition-all duration-500"
            />
          </div>

          {/* 스크롤 썸네일 */}
          <div className="flex gap-1 px-1 overflow-x-auto scrollbar-hide">
            {allImages.slice(0, 12).map((img, i) => (
              <button
                key={i}
                onClick={() => setActiveImg(i)}
                className="flex-shrink-0 w-20 h-20 overflow-hidden transition-all duration-200"
                style={{ opacity: i === activeImg ? 1 : 0.4 }}
              >
                <img src={img} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 관리 정보 */}
      {data.admin && (
        <div className="px-6 py-16 bg-[#f5f5f7]">
          <p className="text-xs font-semibold text-[#ee7f12] tracking-widest uppercase mb-4">관리단체</p>
          <p className="text-2xl font-light text-black leading-snug">{data.admin}</p>
        </div>
      )}

      {/* 하단 여백 */}
      <div className="h-20 bg-white" />
    </div>
  );
}
