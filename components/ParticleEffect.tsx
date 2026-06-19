'use client'
import { useState, useEffect } from 'react'

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

    return () => clearTimeout(timer)
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
