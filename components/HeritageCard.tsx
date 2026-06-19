'use client'
import { useState } from 'react'
import Link from 'next/link'
import VideoPlayer from './VideoPlayer'
import LikeButton from './LikeButton'
import ParticleEffect from './ParticleEffect'
import type { Heritage } from '@/data/heritage'

interface Props {
  heritage: Heritage
}

export default function HeritageCard({ heritage }: Props) {
  const [likeCount, setLikeCount] = useState(0)

  const handleLike = () => {
    setLikeCount(prev => prev + 1)
  }

  return (
    <div className="snap-center flex-none w-screen h-screen relative bg-black">
      <VideoPlayer src={heritage.videoSrc} />
      <ParticleEffect trigger={likeCount} />

      {/* 하단 오버레이 */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent px-4 pb-10 pt-16 flex justify-between items-end">
        <h2 className="text-white text-xl font-bold drop-shadow">
          {heritage.name}
        </h2>
        <div className="flex items-center gap-3">
          <LikeButton initialCount={heritage.likes} onLike={handleLike} />
          <Link
            href={`/heritage/${heritage.id}`}
            aria-label={`${heritage.name} 더보기`}
            className="text-white text-sm border border-white/60 px-3 py-1 rounded-full backdrop-blur-sm"
          >
            더보기 →
          </Link>
        </div>
      </div>
    </div>
  )
}
