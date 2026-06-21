"use client";
import { useRouter } from "next/navigation";
import { ShortsPlace } from "@/shared/api/explore";
import DetailDrawerButton from "@/widgets/shorts-swiper/ui/DetailDrawerButton";

interface ShortsInfoSectionProps {
  item: ShortsPlace;
}

export default function ShortsInfoSection({ item }: ShortsInfoSectionProps) {
  const router = useRouter();

  const handleDetailClick = () => {
    if (item.heritageId) router.push(`/heritage/${item.heritageId}`);
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-2">
        <span className="text-white bg-white/30 rounded-full px-2 py-1 text-xs flex items-center gap-1 backdrop-blur-md">
          {item.categoryHigh}
        </span>
        {item.categoryMiddle && (
          <span className="text-white bg-white/30 rounded-full px-2 py-1 text-xs flex items-center gap-1 backdrop-blur-md">
            {item.categoryMiddle}
          </span>
        )}
      </div>
      <button className="text-left" onClick={handleDetailClick}>
        <h2 className="text-white text-xl font-bold drop-shadow-md">{item.title}</h2>
        <p className="text-white/80 text-sm mt-1 drop-shadow-sm">{item.address}</p>
        <p className="text-white/60 text-xs mt-1">자세히 보기 →</p>
      </button>
      <DetailDrawerButton item={item} />
    </div>
  );
}
