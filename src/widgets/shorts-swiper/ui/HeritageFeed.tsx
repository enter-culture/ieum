'use client'
import { useState, useRef } from 'react'
import HeritageCard from '@/widgets/shorts-swiper/ui/HeritageCard'
import type { Heritage } from '@/entities/heritage/model/heritage'

interface Props {
  items: Heritage[]
}

export default function HeritageFeed({ items }: Props) {
  const [activeIndex, setActiveIndex] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

  const handleScroll = () => {
    const el = containerRef.current
    if (!el) return
    const index = Math.round(el.scrollTop / el.clientHeight)
    setActiveIndex(index)
  }

  const goTo = (index: number) => {
    const el = containerRef.current
    if (!el) return
    el.scrollTo({ top: index * el.clientHeight, behavior: 'smooth' })
  }

  return (
    <div className="relative w-screen h-screen overflow-hidden">
      {/* 카드 스크롤 영역 */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="flex flex-col overflow-y-auto snap-y snap-mandatory h-full scrollbar-hide"
      >
        {items.map(item => (
          <HeritageCard key={item.id} heritage={item} />
        ))}
      </div>

      {/* 우측 세로 인디케이터 */}
      <div className="absolute right-2 top-1/2 -translate-y-1/2 flex flex-col gap-2 pointer-events-none">
        {items.map((_, i) => (
          <button
            key={i}
            aria-label={`페이지 ${i + 1}`}
            onClick={() => goTo(i)}
            className={`w-1 h-1 rounded-full pointer-events-auto transition-all duration-200 p-2 box-content ${
              i === activeIndex ? 'bg-white scale-125' : 'bg-white/40'
            }`}
          />
        ))}
      </div>

      {/* 데스크탑 위아래 화살표 */}
      {activeIndex > 0 && (
        <button
          onClick={() => goTo(activeIndex - 1)}
          aria-label="이전"
          className="absolute top-6 left-1/2 -translate-x-1/2 text-white/70 text-3xl hidden md:block hover:text-white transition-colors"
        >
          ∧
        </button>
      )}
      {activeIndex < items.length - 1 && (
        <button
          onClick={() => goTo(activeIndex + 1)}
          aria-label="다음"
          className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/70 text-3xl hidden md:block hover:text-white transition-colors"
        >
          ∨
        </button>
      )}
    </div>
  )
}
