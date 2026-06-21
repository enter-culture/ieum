"use client";
import { useEffect, useState } from "react";
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

  useEffect(() => {
    fetch(`/api/heritage/${id}`)
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div className="flex items-center justify-center h-dvh bg-white">
      <div className="w-5 h-5 border-2 border-gray-200 border-t-gray-600 rounded-full animate-spin" />
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
    <div className="h-dvh overflow-y-auto bg-white">

      {/* 상단 네비게이션 바 */}
      <div className="sticky top-0 z-50 bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-2">
        <button onClick={() => router.back()} className="flex items-center gap-1.5 text-gray-500 hover:text-black transition-colors text-sm">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 5l-7 7 7 7"/>
          </svg>
          돌아가기
        </button>
      </div>

      {/* 히어로 이미지 — 꽉 차지 않게 */}
      {allImages[0] && (
        <div className="w-full bg-gray-50" style={{ height: "55vw", maxHeight: "320px" }}>
          <img
            src={allImages[0]}
            alt={data.name}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* 아티클 헤더 */}
      <div className="px-5 pt-8 pb-6 border-b border-gray-100">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xs font-semibold text-[#ee7f12] bg-orange-50 px-2.5 py-1 rounded-full">
            {data.category}
          </span>
          {data.region && (
            <span className="text-xs text-gray-400">{data.region}</span>
          )}
        </div>
        <h1 className="text-[28px] font-bold text-gray-900 leading-tight tracking-tight">
          {data.name}
        </h1>
        {paragraphs[0] && (
          <p className="mt-3 text-base text-gray-500 leading-relaxed">
            {paragraphs[0]}
          </p>
        )}
        {formattedDate && (
          <p className="mt-4 text-xs text-gray-400">{formattedDate} 지정</p>
        )}
      </div>

      {/* 본문 */}
      <div className="px-5 py-8 space-y-8">
        {paragraphs.slice(1).map((para, i) => (
          <div key={i}>
            <p className="text-[16px] text-gray-700 leading-[1.9]">{para}</p>
            {/* 본문 중간중간 이미지 삽입 */}
            {allImages[i + 1] && i % 2 === 1 && (
              <div className="mt-6 rounded-2xl overflow-hidden bg-gray-100" style={{ aspectRatio: "4/3" }}>
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

      {/* 메타 정보 카드 */}
      <div className="mx-5 mb-8 rounded-2xl bg-gray-50 p-5 space-y-4">
        <p className="text-xs font-semibold text-gray-400 tracking-widest uppercase">정보</p>
        {[
          { label: "분류", value: data.subCategory },
          { label: "소재지", value: data.region },
          { label: "지정일", value: formattedDate },
          { label: "관리단체", value: data.admin },
        ].filter(r => r.value).map(({ label, value }) => (
          <div key={label} className="flex gap-4">
            <span className="text-sm text-gray-400 w-16 flex-shrink-0">{label}</span>
            <span className="text-sm text-gray-900">{value}</span>
          </div>
        ))}
      </div>

      {/* 갤러리 */}
      {allImages.length > 2 && (
        <div className="px-5 pb-10">
          <p className="text-xs font-semibold text-gray-400 tracking-widest uppercase mb-4">사진 아카이브</p>
          <div className="grid grid-cols-2 gap-2">
            {allImages.slice(0, 6).map((img, i) => (
              <div key={i} className="rounded-xl overflow-hidden bg-gray-100" style={{ aspectRatio: "1" }}>
                <img src={img} alt="" className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="h-10" />
    </div>
  );
}
