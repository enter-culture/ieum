"use client";
import { useLikes } from "@/shared/lib/likes-store";
import { useRouter } from "next/navigation";

export default function LikesPage() {
  const { likedList } = useLikes();
  const router = useRouter();

  return (
    <div className="h-dvh overflow-y-auto bg-white pb-20">
      {/* 헤더 */}
      <div className="px-5 pt-12 pb-6 border-b border-gray-100">
        <h1 className="text-2xl font-bold text-gray-900">좋아요</h1>
        <p className="text-sm text-gray-400 mt-1">좋아요한 쇼츠를 모아볼 수 있어요</p>
        <button
          onClick={() => router.push("/recommend")}
          className="mt-3 rounded-full bg-[#ee7f12] px-4 py-2 text-sm font-medium text-white"
        >
          주변 추천 지도 보기
        </button>
      </div>

      {/* 좋아요 섹션 */}
      <div className="px-5 py-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold text-gray-900">좋아요한 쇼츠</h2>
          <span className="text-xs text-gray-400">{likedList.length}개</span>
        </div>

        {likedList.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-300">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
            <p className="mt-3 text-sm">아직 좋아요한 쇼츠가 없어요</p>
            <button
              onClick={() => router.push("/explore")}
              className="mt-4 px-4 py-2 bg-[#ee7f12] text-white text-xs font-semibold rounded-full"
            >
              쇼츠 보러 가기
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-1">
            {likedList.map((item) => (
              <button
                key={item.id}
                onClick={() => router.push("/explore")}
                className="relative overflow-hidden bg-gray-100"
                style={{ aspectRatio: "9/16" }}
              >
                {/* 비디오 썸네일 */}
                <video
                  src={item.videoSrc}
                  className="w-full h-full object-cover"
                  muted
                  playsInline
                  preload="metadata"
                />
                {/* 오버레이 */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute bottom-1.5 left-1.5 right-1.5">
                  <p className="text-white text-[10px] font-semibold leading-tight truncate">{item.title}</p>
                </div>
                {/* 하트 */}
                <div className="absolute top-1.5 right-1.5">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="#ff2d55">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                  </svg>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
