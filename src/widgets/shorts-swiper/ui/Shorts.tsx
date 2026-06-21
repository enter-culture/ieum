"use client";
import { useEffect, useRef, useState } from "react";
import { useLongPress } from "use-long-press";
import MuteToggleIcon from "@/shared/ui/MuteToggleIcon/MuteToggleIcon";
import ShortsInfoSection from "@/widgets/shorts-swiper/ui/ShortsInfoSection";
import { ShortsPlace } from "@/shared/api/explore";

interface FloatingHeart { id: number; x: number; }
interface ShortsProps { item: ShortsPlace & { videoSrc: string }; page: number; currentPage: number; }

export default function Shorts({ item, page, currentPage }: ShortsProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [showVolumeIcon, setShowVolumeIcon] = useState(false);
  const [isLongPressing, setIsLongPressing] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(item.averageRating ? parseInt(item.averageRating) : 0);
  const [floatingHearts, setFloatingHearts] = useState<FloatingHeart[]>([]);
  const heartIdRef = useRef(0);

  const handleToggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setIsMuted(video.muted);
  };

  const handleShowVolumeIcon = () => {
    setShowVolumeIcon(true);
    setTimeout(() => setShowVolumeIcon(false), 500);
  };

  const handleLike = () => {
    setLiked((prev) => !prev);
    setLikeCount((prev) => liked ? prev - 1 : prev + 1);

    // 하트 3개 살짝 다른 위치에서 동시에 올라옴
    const newHearts: FloatingHeart[] = Array.from({ length: 3 }, (_, i) => ({
      id: heartIdRef.current++,
      x: -10 + i * 10,
    }));
    setFloatingHearts((prev) => [...prev, ...newHearts]);
    setTimeout(() => {
      setFloatingHearts((prev) =>
        prev.filter((h) => !newHearts.find((n) => n.id === h.id))
      );
    }, 900);
  };

  const onLongPressVideo = useLongPress(
    () => {
      setIsLongPressing(true);
      setIsPaused(true);
      videoRef.current?.pause();
    },
    {
      onFinish: () => {
        if (isPaused) {
          if (page === currentPage) videoRef.current?.play();
          setIsPaused(false);
        }
        setTimeout(() => setIsLongPressing(false), 50);
      },
      onCancel: () => {
        if (isPaused) {
          if (page === currentPage) videoRef.current?.play();
          setIsPaused(false);
        }
        setIsLongPressing(false);
      },
      threshold: 500,
      captureEvent: true,
      cancelOnMovement: 10,
    }
  );

  const onClickVideo = () => {
    if (isLongPressing) return;
    handleToggleMute();
    handleShowVolumeIcon();
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const onTimeUpdate = () => {
      if (video.duration) setProgress(video.currentTime / video.duration);
    };
    video.addEventListener("timeupdate", onTimeUpdate);
    return () => video.removeEventListener("timeupdate", onTimeUpdate);
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (page === currentPage) {
      video.muted = false;
      video.play().catch(() => {
        video.muted = true;
        setIsMuted(true);
        video.play().catch(() => {});
      });
    } else {
      video.pause();
      video.currentTime = 0;
    }
  }, [page, currentPage]);

  return (
    <>
      <style>{`
        @keyframes heart-float {
          0%   { transform: translateY(0) scale(1);    opacity: 1; }
          60%  { transform: translateY(-80px) scale(1.3); opacity: 1; }
          100% { transform: translateY(-130px) scale(0.8); opacity: 0; }
        }
        @keyframes heart-pop {
          0%   { transform: scale(1); }
          40%  { transform: scale(1.4); }
          70%  { transform: scale(0.9); }
          100% { transform: scale(1); }
        }
      `}</style>

      <div className="flex bg-black h-dvh relative">
        <div className="w-full aspect-[9/16] relative max-w-sm mx-auto max-h-dvh">
          <video
            ref={videoRef}
            src={item.videoSrc || item.shortsUrl}
            className="w-full h-full rounded-lg object-cover"
            loop
            playsInline
            autoPlay={page === 0}
          />
          <div
            className="absolute inset-0 z-10 bg-transparent cursor-grab"
            onClick={onClickVideo}
            {...onLongPressVideo()}
          />
          <div className="absolute left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%]">
            <MuteToggleIcon showVolumeIcon={showVolumeIcon} isMuted={isMuted} />
          </div>

          {/* 오른쪽 사이드 하트 버튼 */}
          <div className="absolute right-3 bottom-24 z-20 flex flex-col items-center gap-1">
            {/* 떠오르는 하트들 */}
            <div className="relative w-10 h-1">
              {floatingHearts.map((h) => (
                <div
                  key={h.id}
                  style={{
                    position: "absolute",
                    bottom: 0,
                    left: `calc(50% + ${h.x}px)`,
                    transform: "translateX(-50%)",
                    animation: "heart-float 0.9s ease-out forwards",
                    fontSize: "1.4rem",
                    pointerEvents: "none",
                  }}
                >
                  ❤️
                </div>
              ))}
            </div>

            {/* 하트 버튼 */}
            <button
              onClick={(e) => { e.stopPropagation(); handleLike(); }}
              className="flex flex-col items-center gap-1"
              style={{ animation: liked ? "heart-pop 0.35s ease" : "none" }}
            >
              <span style={{ fontSize: "2rem", filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.5))" }}>
                {liked ? "❤️" : "🤍"}
              </span>
              <span className="text-white text-xs font-semibold drop-shadow">
                {likeCount.toLocaleString()}
              </span>
            </button>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 z-30">
          <div className="p-4">
            <ShortsInfoSection item={item} />
          </div>
          <div className="h-[3px] w-full bg-white/20">
            <div
              className="h-full bg-[#FF0000] transition-none"
              style={{ width: `${progress * 100}%` }}
            />
          </div>
        </div>
      </div>
    </>
  );
}
