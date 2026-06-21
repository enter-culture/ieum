"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import useShorts from "@/entities/heritage/model/useShorts";
import Shorts from "@/widgets/shorts-swiper/ui/Shorts";
export default function ShortsSwiper() {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(0);
  const { data, isLoading, createBookmark, deleteBookmark } = useShorts();

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const scrollTop = e.currentTarget.scrollTop;
    const height = e.currentTarget.clientHeight;
    const newPage = Math.round(scrollTop / height);
    setCurrentPage(newPage);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-black">
        <div className="text-white text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="relative">
      <div
        className="h-dvh overflow-y-scroll snap-y snap-mandatory scrollbar-hide"
        onScroll={handleScroll}
        style={{ scrollSnapType: "y mandatory" }}
      >
        {data.map((item, index) => (
          <div key={item.id} className="snap-start snap-always h-dvh">
            <Shorts item={item} page={index} currentPage={currentPage} />
          </div>
        ))}
      </div>

      {/* 업로드 버튼 */}
      <button
        onClick={() => router.push("/upload")}
        className="fixed bottom-8 left-1/2 z-50 flex items-center gap-2 px-5 py-3 rounded-full text-sm font-bold shadow-lg transition-transform active:scale-95"
        style={{
          transform: "translateX(-50%)",
          background: "rgba(255,255,255,0.15)",
          backdropFilter: "blur(12px)",
          border: "1.5px solid rgba(255,255,255,0.3)",
          color: "white",
        }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <line x1="12" y1="5" x2="12" y2="19"/>
          <line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
        쇼츠 등록
      </button>
    </div>
  );
}
