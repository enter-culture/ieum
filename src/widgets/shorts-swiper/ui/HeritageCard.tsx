'use client'
import { useState } from 'react'
import Link from 'next/link'
import VideoPlayer from '@/shared/ui/VideoPlayer/VideoPlayer'
import LikeButton from '@/features/like/ui/LikeButton'
import ParticleEffect from '@/features/like/ui/ParticleEffect'
import type { Heritage } from '@/entities/heritage/model/heritage'

interface Props {
  heritage: Heritage
}

export default function HeritageCard({ heritage }: Props) {
  const [likeCount, setLikeCount] = useState(0)

  const handleLike = () => {
    setLikeCount(prev => prev + 1)
  }

  return (
    <div className="snap-start flex-none w-screen h-screen relative bg-black">
      <VideoPlayer src={heritage.videoSrc} />
      <ParticleEffect trigger={likeCount} />

      {/* 우측 액션 버튼 (유튜브 쇼츠 스타일) */}
      <div className="absolute right-3 bottom-28 flex flex-col items-center gap-6">
        {/* 좋아요 */}
        <div className="flex flex-col items-center gap-1">
          <LikeButton initialCount={heritage.likes} onLike={handleLike} vertical />
        </div>

        {/* 더보기 */}
        <Link
          href={`/heritage/${heritage.id}`}
          aria-label={`${heritage.name} 더보기`}
          className="flex flex-col items-center gap-1"
        >
          <div className="w-11 h-11 rounded-full bg-white/10 border border-white/30 flex items-center justify-center backdrop-blur-sm text-white text-lg">
            →
          </div>
          <span className="text-white text-xs font-medium drop-shadow">더보기</span>
        </Link>
      </div>

      {/* 하단 텍스트 (좌하단) */}
      <div className="absolute bottom-0 left-0 right-16 bg-gradient-to-t from-black/70 to-transparent px-4 pb-8 pt-20">
        <h2 className="text-white text-lg font-bold drop-shadow leading-tight">
          {heritage.name}
        </h2>
        <p className="text-white/60 text-sm mt-1">
          {heritage.category} {heritage.number}
        </p>
      </div>
    </div>
  )
}
