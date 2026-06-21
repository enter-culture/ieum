"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

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

  useEffect(() => {
    fetch(`/api/heritage/${id}`)
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div className="flex items-center justify-center h-dvh bg-black">
      <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!data) return (
    <div className="flex items-center justify-center h-dvh bg-black text-white">
      데이터를 불러올 수 없습니다.
    </div>
  );

  const allImages = (data.images ?? []).length > 0 ? data.images : data.thumbnail ? [data.thumbnail] : [];
  const formattedDate = data.designatedAt
    ? `${data.designatedAt.slice(0, 4)}년 ${data.designatedAt.slice(4, 6)}월 ${data.designatedAt.slice(6, 8)}일`
    : "";

  return (
    <div className="min-h-dvh bg-[#0d0d1a] text-white">
      {/* 헤더 */}
      <div className="sticky top-0 z-10 flex items-center gap-3 px-4 py-3 bg-[#0d0d1a]/90 backdrop-blur-sm border-b border-white/10">
        <button onClick={() => router.back()} className="text-white p-1">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 5l-7 7 7 7"/>
          </svg>
        </button>
        <h1 className="text-base font-bold">{data.name}</h1>
      </div>

      {/* 이미지 갤러리 */}
      {allImages.length > 0 && (
        <div className="relative">
          <div className="relative w-full aspect-video bg-black overflow-hidden">
            <img
              src={allImages[activeImg]}
              alt={data.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0d0d1a] via-transparent to-transparent" />
            {allImages.length > 1 && (
              <div className="absolute bottom-3 right-3 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
                {activeImg + 1} / {allImages.length}
              </div>
            )}
          </div>

          {/* 썸네일 */}
          {allImages.length > 1 && (
            <div className="flex gap-2 px-4 py-3 overflow-x-auto scrollbar-hide">
              {allImages.slice(0, 10).map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImg(i)}
                  className="flex-shrink-0 relative w-16 h-16 rounded-lg overflow-hidden"
                  style={{ border: i === activeImg ? "2px solid #ee7f12" : "2px solid transparent" }}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 정보 */}
      <div className="px-5 py-4 space-y-6">
        {/* 분류 태그 */}
        <div className="flex flex-wrap gap-2">
          {data.category && (
            <span className="bg-[#ee7f12]/20 text-[#ee7f12] text-xs px-3 py-1 rounded-full">{data.category}</span>
          )}
          {data.subCategory && data.subCategory.split(" > ").map((c) => (
            <span key={c} className="bg-white/10 text-white/70 text-xs px-3 py-1 rounded-full">{c}</span>
          ))}
        </div>

        {/* 기본 정보 */}
        <div className="grid grid-cols-2 gap-3">
          {formattedDate && (
            <div className="bg-white/5 rounded-xl p-3">
              <p className="text-white/40 text-xs mb-1">지정일</p>
              <p className="text-sm font-medium">{formattedDate}</p>
            </div>
          )}
          {data.region && (
            <div className="bg-white/5 rounded-xl p-3">
              <p className="text-white/40 text-xs mb-1">소재지</p>
              <p className="text-sm font-medium">{data.region}</p>
            </div>
          )}
          {data.admin && (
            <div className="bg-white/5 rounded-xl p-3 col-span-2">
              <p className="text-white/40 text-xs mb-1">관리단체</p>
              <p className="text-sm font-medium">{data.admin}</p>
            </div>
          )}
        </div>

        {/* 소개 */}
        {data.content && (
          <div>
            <h2 className="text-sm font-bold text-[#ee7f12] mb-3">소개</h2>
            <p className="text-sm leading-relaxed text-white/80 whitespace-pre-line">{data.content}</p>
          </div>
        )}
      </div>

      <div className="h-10" />
    </div>
  );
}
