'use client'
import { useState } from 'react'

interface Props {
  initialCount: number
  onLike: () => void
  vertical?: boolean
}

function formatCount(n: number): string {
  if (n >= 1000) {
    const k = n / 1000
    return k % 1 === 0 ? `${k}k` : `${k.toFixed(1)}k`
  }
  return String(n)
}

export default function LikeButton({ initialCount, onLike, vertical = false }: Props) {
  const [count, setCount] = useState(initialCount)

  const handleClick = () => {
    setCount(prev => prev + 1)
    onLike()
  }

  return (
    <button
      onClick={handleClick}
      className={`flex items-center text-white ${vertical ? 'flex-col gap-1' : 'flex-row gap-1'}`}
      aria-label="좋아요"
    >
      <span className={vertical ? 'text-3xl' : 'text-xl'}>🤍</span>
      <span className="text-sm font-medium">{formatCount(count)}</span>
    </button>
  )
}
