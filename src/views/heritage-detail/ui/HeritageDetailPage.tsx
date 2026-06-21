"use client";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { apiUrl } from "@/shared/api/base";

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
    fetch(apiUrl(`/heritage/${id}`))
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div className="flex items-center justify-center h-dvh bg-white">
      <div className="w-5 h-5 border-[1.5px] border-gray-200 border-t-gray-600 rounded-full animate-spin" />
    </div>
  );

  if (!data) return (
    <div className="flex items-center justify-center h-dvh bg-white text-gray-400 text-sm">
      데이터를 불러올 수 없습니다.
    </div>
  );

  const allImages = (data.images ?? []).length > 0 ? data.images : data.thumbnail ? [data.thumbnail] : [];
  const formattedDate = data.designatedAt
    ? `${data.designatedAt.slice(0, 4)}년 ${data.designatedAt.slice(4, 6)}월 ${data.designatedAt.slice(6, 8)}일`
    : "";
  const paragraphs = data.content?.split(/\n+/).map(p => p.trim()).filter(Boolean) ?? [];

  return (
    <div ref={containerRef} className="h-dvh overflow-y-auto bg-white">

      {/* 네비바 */}
      <div className="sticky top-0 z-50 bg-white border-b border-gray-100 px-4 h-12 flex items-center">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M19 12H5M12 5l-7 7 7 7"/>
          </svg>
          목록으로
        </button>
      </div>

      <article className="max-w-2xl mx-auto px-5">

        {/* 카테고리 */}
        <div className="pt-10 pb-4">
          <span className="text-sm font-semibold text-[#3182f6]">{data.category}</span>
        </div>

        {/* 제목 */}
        <h1 className="text-[28px] font-bold text-gray-900 leading-[1.35] tracking-[-0.01em] pb-5">
          {data.name}
        </h1>

        {/* 메타 */}
        <div className="flex items-center gap-3 pb-8 border-b border-gray-100">
          <div className="w-7 h-7 rounded-full bg-[#3182f6] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            이
          </div>
          <div>
            <p className="text-sm font-medium text-gray-800">{data.admin || "국가유산청"}</p>
            <p className="text-xs text-gray-400 mt-0.5">
              {formattedDate} 지정 · {data.region}
            </p>
          </div>
        </div>

        {/* 히어로 이미지 */}
        {allImages[activeImg] && (
          <div className="py-8">
            <div className="w-full overflow-hidden rounded-xl bg-gray-100" style={{ aspectRatio: "16/9" }}>
              <img
                src={allImages[activeImg]}
                alt={data.name}
                className="w-full h-full object-cover"
              />
            </div>
            {allImages.length > 1 && (
              <p className="text-xs text-gray-400 text-center mt-2">
                {activeImg + 1} / {allImages.length}
              </p>
            )}
          </div>
        )}

        {/* 본문 */}
        <div className="pb-10 space-y-5">
          {paragraphs.map((para, i) => (
            <div key={i}>
              <p className="text-[16px] text-gray-700 leading-[1.85]">{para}</p>
              {/* 중간 이미지 */}
              {allImages[i + 1] && i > 0 && i % 3 === 2 && (
                <div className="my-8 w-full overflow-hidden rounded-xl bg-gray-100" style={{ aspectRatio: "16/9" }}>
                  <img
                    src={allImages[i + 1]}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* 구분선 */}
        <div className="border-t border-gray-100 py-8">
          <p className="text-sm font-semibold text-gray-900 mb-4">사진 아카이브</p>
          <div className="grid grid-cols-3 gap-2">
            {allImages.slice(0, 9).map((img, i) => (
              <button
                key={i}
                onClick={() => {
                  setActiveImg(i);
                  containerRef.current?.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="overflow-hidden rounded-lg"
                style={{ aspectRatio: "1", outline: i === activeImg ? "2px solid #3182f6" : "none", outlineOffset: 2 }}
              >
                <img src={img} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

      </article>

      <div className="h-16" />
    </div>
  );
}
