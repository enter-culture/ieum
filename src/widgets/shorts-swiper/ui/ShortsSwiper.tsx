"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import useShorts from "@/entities/heritage/model/useShorts";
import Shorts from "@/widgets/shorts-swiper/ui/Shorts";
import FilterDrawerButton from "@/widgets/filter-drawer/ui/FilterDrawerButton";

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
        className="h-[calc(100dvh-80px)] overflow-y-scroll snap-y snap-mandatory scrollbar-hide"
        onScroll={handleScroll}
        style={{ scrollSnapType: "y mandatory" }}
      >
        {data.map((item, index) => (
          <div key={item.id} className="snap-start snap-always h-[calc(100dvh-80px)]">
            <Shorts item={item} page={index} currentPage={currentPage} />
          </div>
        ))}
      </div>
      <div className="absolute bottom-4 left-4 z-20">
        <FilterDrawerButton onApplyFilter={() => {}} />
      </div>
    </div>
  );
}
