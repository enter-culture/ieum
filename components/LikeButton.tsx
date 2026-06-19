'use client'
import { useState } from 'react'

interface Props {
  initialCount: number
  onLike: () => void
}

function formatCount(n: number): string {
  if (n >= 1000) {
    const k = n / 1000
    return k % 1 === 0 ? `${k}k` : `${k.toFixed(1)}k`
  }
  return String(n)
}

export default function LikeButton({ initialCount, onLike }: Props) {
  const [count, setCount] = useState(initialCount)

  const handleClick = () => {
    setCount(prev => prev + 1)
    onLike()
  }

  return (
    <button
      onClick={handleClick}
      className="flex items-center gap-1 text-white"
      aria-label="좋아요"
    >
      <span className="text-xl">🤍</span>
      <span className="text-sm font-medium">{formatCount(count)}</span>
    </button>
  )
}
