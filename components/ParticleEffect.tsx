'use client'
import { useState, useEffect, useRef } from 'react'

const EMOJIS = ['🤍', '🐱', '🐶', '🐾', '💕']

type Particle = {
  id: number
  emoji: string
  x: number
}

interface Props {
  trigger: number
}

export default function ParticleEffect({ trigger }: Props) {
  const [particles, setParticles] = useState<Particle[]>([])
  // render 시점에 최신 trigger를 기록 — cleanup에서 "새 trigger로 변경됐는지" 판단에 사용
  const latestTriggerRef = useRef(trigger)
  latestTriggerRef.current = trigger

  useEffect(() => {
    if (trigger === 0) return

    const id = Date.now() + Math.random()
    const particle: Particle = {
      id,
      emoji: EMOJIS[Math.floor(Math.random() * EMOJIS.length)],
      x: Math.random() * 60 + 20,
    }

    setParticles(prev => [...prev, particle])

    const timer = setTimeout(() => {
      setParticles(prev => prev.filter(p => p.id !== id))
    }, 1500)

    return () => {
      clearTimeout(timer)
      // latestTriggerRef.current === trigger: StrictMode 재실행(같은 trigger 값)
      // latestTriggerRef.current !== trigger: 새 trigger 값 — 타이머가 파티클 제거를 담당
      if (latestTriggerRef.current === trigger) {
        setParticles(prev => prev.filter(p => p.id !== id))
      }
    }
  }, [trigger])

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {particles.map(p => (
        <span
          key={p.id}
          className="absolute text-3xl animate-float-up"
          style={{ left: `${p.x}%`, bottom: '80px' }}
        >
          {p.emoji}
        </span>
      ))}
    </div>
  )
}
