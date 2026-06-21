"use client";
import { useEffect, useRef, useState } from "react";
import { useLongPress } from "use-long-press";
import MuteToggleIcon from "@/shared/ui/MuteToggleIcon/MuteToggleIcon";
import ShortsInfoSection from "@/widgets/shorts-swiper/ui/ShortsInfoSection";
import { ShortsPlace } from "@/shared/api/explore";
import CommentDrawer from "@/widgets/shorts-swiper/ui/CommentDrawer";

interface FloatingHeart {
  id: number;
  x: number;
  size: number;
  rotate: number;
  duration: number;
  delay: number;
}

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
  const [popKey, setPopKey] = useState(0);
  const [commentOpen, setCommentOpen] = useState(false);
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
    const isNowLiked = !liked;
    setLiked(isNowLiked);
    setLikeCount((prev) => isNowLiked ? prev + 1 : prev - 1);
    setPopKey((k) => k + 1);

    if (!isNowLiked) return;

    // 6개 하트, 각자 다른 방향·크기·속도로 퍼짐
    const offsets = [-50, -28, -10, 10, 28, 50];
    const newHearts: FloatingHeart[] = offsets.map((x, i) => ({
      id: heartIdRef.current++,
      x,
      size: 52 + (i % 3) * 16,
      rotate: -25 + i * 10,
      duration: 900 + i * 90,
      delay: i * 50,
    }));
    setFloatingHearts((prev) => [...prev, ...newHearts]);
    setTimeout(() => {
      setFloatingHearts((prev) =>
        prev.filter((h) => !newHearts.find((n) => n.id === h.id))
      );
    }, 1400);
  };

  const onLongPressVideo = useLongPress(
    () => { setIsLongPressing(true); setIsPaused(true); videoRef.current?.pause(); },
    {
      onFinish: () => {
        if (isPaused) { if (page === currentPage) videoRef.current?.play(); setIsPaused(false); }
        setTimeout(() => setIsLongPressing(false), 50);
      },
      onCancel: () => {
        if (isPaused) { if (page === currentPage) videoRef.current?.play(); setIsPaused(false); }
        setIsLongPressing(false);
      },
      threshold: 500,
      captureEvent: true,
      cancelOnMovement: 10,
    }
  );

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
        @keyframes heart-burst {
          0%   { transform: translateY(0px)    translateX(0px) rotate(0deg)  scale(0.5); opacity: 1; }
          30%  { opacity: 1; }
          100% { transform: translateY(-200px) translateX(var(--hx)) rotate(var(--hr)) scale(0.2); opacity: 0; }
        }
        @keyframes heart-spring {
          0%   { transform: scale(1); }
          25%  { transform: scale(0.85); }
          60%  { transform: scale(1.2); }
          80%  { transform: scale(0.95); }
          100% { transform: scale(1); }
        }
        @keyframes heart-unlike {
          0%   { transform: scale(1); }
          40%  { transform: scale(0.8); }
          100% { transform: scale(1); }
        }
      `}</style>

      <div className="flex bg-black h-dvh relative">
        <div className="w-full aspect-[9/16] relative max-w-sm mx-auto max-h-dvh">
          <video
            ref={videoRef}
            src={page >= currentPage - 1 && page <= currentPage + 1 ? (item.videoSrc || item.shortsUrl) : undefined}
            className="w-full h-full rounded-lg object-cover"
            loop
            playsInline
            preload="none"
            autoPlay={page === 0}
          />
          <div
            className="absolute inset-0 z-10 bg-transparent cursor-grab"
            onClick={() => { if (!isLongPressing) { handleToggleMute(); handleShowVolumeIcon(); } }}
            {...onLongPressVideo()}
          />
          <div className="absolute left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%]">
            <MuteToggleIcon showVolumeIcon={showVolumeIcon} isMuted={isMuted} />
          </div>

        </div>

        {/* 하트 버튼 — 비디오 오른쪽 검정 영역에 위치 */}
        <div className="absolute right-6 bottom-28 z-20 flex flex-col items-center gap-1.5">
          <button
            onClick={(e) => { e.stopPropagation(); handleLike(); }}
            className="flex flex-col items-center gap-1"
            style={{ position: "relative" }}
          >
            {/* 파티클 — 버튼 기준으로 올라옴 */}
            {floatingHearts.map((h) => (
              <div
                key={h.id}
                style={{
                  position: "absolute",
                  bottom: "50%",
                  left: "50%",
                  marginLeft: -h.size / 2,
                  pointerEvents: "none",
                  ["--hx" as string]: `${h.x}px`,
                  ["--hr" as string]: `${h.rotate}deg`,
                  animation: `heart-burst ${h.duration}ms cubic-bezier(.25,.46,.45,.94) ${h.delay}ms forwards`,
                  zIndex: 30,
                }}
              >
                <svg width={h.size} height={h.size} viewBox="0 0 24 24" fill="#ff2d55">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                </svg>
              </div>
            ))}
            <div
              key={popKey}
              style={{
                animation: liked
                  ? "heart-spring 0.4s cubic-bezier(.34,1.56,.64,1) both"
                  : "heart-unlike 0.25s ease both",
                transformOrigin: "center",
              }}
            >
              <svg
                width={38} height={38} viewBox="0 0 24 24"
                fill={liked ? "#ff2d55" : "none"}
                stroke={liked ? "#ff2d55" : "white"}
                strokeWidth="1.8"
                strokeLinejoin="round"
                style={{ transition: "fill 0.15s ease, stroke 0.15s ease" }}
              >
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
            </div>
            <span className="text-white text-xs font-semibold" style={{ textShadow: "0 1px 3px rgba(0,0,0,0.7)" }}>
              {likeCount.toLocaleString()}
            </span>
          </button>

          {/* 댓글 버튼 */}
          <button
            onClick={(e) => { e.stopPropagation(); setCommentOpen(true); }}
            className="flex flex-col items-center gap-1 mt-2"
          >
            <svg width={36} height={36} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
            <span className="text-white text-xs font-semibold" style={{ textShadow: "0 1px 3px rgba(0,0,0,0.7)" }}>
              댓글
            </span>
          </button>
        </div>

        <CommentDrawer
          open={commentOpen}
          onClose={() => setCommentOpen(false)}
          videoTitle={item.title}
        />

        <div className="absolute bottom-0 left-0 right-0 z-30">
          <div className="p-4">
            <ShortsInfoSection item={item} />
          </div>
          <div className="h-[3px] w-full bg-white/20">
            <div className="h-full bg-[#FF0000] transition-none" style={{ width: `${progress * 100}%` }} />
          </div>
        </div>
      </div>
    </>
  );
}
