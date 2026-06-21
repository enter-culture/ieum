"use client";
import { useEffect, useRef, useState } from "react";
import { useLongPress } from "use-long-press";
import MuteToggleIcon from "@/shared/ui/MuteToggleIcon/MuteToggleIcon";
import ShortsInfoSection from "@/widgets/shorts-swiper/ui/ShortsInfoSection";
import { ShortsPlace } from "@/shared/api/explore";

interface ShortsProps { item: ShortsPlace & { videoSrc: string }; page: number; currentPage: number; }

export default function Shorts({ item, page, currentPage }: ShortsProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [showVolumeIcon, setShowVolumeIcon] = useState(false);
  const [isLongPressing, setIsLongPressing] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);

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
        // 브라우저 정책으로 unmuted 자동재생 실패 시 muted로 재시도
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
      </div>
      <div className="absolute bottom-0 left-0 right-0 z-30">
        <div className="p-4">
          <ShortsInfoSection item={item} />
        </div>
        {/* 프로그레스 바 */}
        <div className="h-[3px] w-full bg-white/20">
          <div
            className="h-full bg-[#FF0000] transition-none"
            style={{ width: `${progress * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}
