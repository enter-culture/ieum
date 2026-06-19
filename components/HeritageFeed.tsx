'use client'
import { useState, useRef } from 'react'
import HeritageCard from './HeritageCard'
import type { Heritage } from '@/data/heritage'

interface Props {
  items: Heritage[]
}

export default function HeritageFeed({ items }: Props) {
  const [activeIndex, setActiveIndex] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

  const handleScroll = () => {
    const el = containerRef.current
    if (!el) return
    const index = Math.round(el.scrollLeft / el.clientWidth)
    setActiveIndex(index)
  }

  const goTo = (index: number) => {
    const el = containerRef.current
    if (!el) return
    el.scrollTo({ left: index * el.clientWidth, behavior: 'smooth' })
    setActiveIndex(index)
  }

  return (
    <div className="relative w-screen h-screen overflow-hidden">
      {/* 카드 스크롤 영역 */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="flex overflow-x-auto snap-x snap-mandatory h-full scrollbar-hide"
      >
        {items.map(item => (
          <HeritageCard key={item.id} heritage={item} />
        ))}
      </div>

      {/* 페이지 인디케이터 */}
      <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 pointer-events-none">
        {items.map((_, i) => (
          <button
            key={i}
            aria-label={`페이지 ${i + 1}`}
            onClick={() => goTo(i)}
            className={`w-1.5 h-1.5 rounded-full pointer-events-auto transition-all duration-200 ${
              i === activeIndex ? 'bg-white scale-125' : 'bg-white/40'
            }`}
          />
        ))}
      </div>

      {/* 데스크탑 화살표 */}
      {activeIndex > 0 && (
        <button
          onClick={() => goTo(activeIndex - 1)}
          aria-label="이전"
          className="absolute left-4 top-1/2 -translate-y-1/2 text-white/70 text-4xl hidden md:block hover:text-white transition-colors"
        >
          ‹
        </button>
      )}
      {activeIndex < items.length - 1 && (
        <button
          onClick={() => goTo(activeIndex + 1)}
          aria-label="다음"
          className="absolute right-4 top-1/2 -translate-y-1/2 text-white/70 text-4xl hidden md:block hover:text-white transition-colors"
        >
          ›
        </button>
      )}
    </div>
  )
}
