'use client'

import Lottie from 'react-lottie'
import animationData from '@/public/lottie/landing.json'
import LandingFooter from './landing-footer'

export default function LandingLottie() {
  return (
    <div className="relative bg-[#0d0d0d]">
      {/* 텍스트 오버레이 — Lottie 위에 얹힘 */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10">
        <p className="text-white/30 text-xs tracking-[0.4em] uppercase mb-4">Korea · Heritage</p>
        <h1 className="text-white text-7xl font-bold tracking-tight">이음</h1>
        <p className="text-white/40 text-sm tracking-[0.2em] mt-3">Ieum · Living Heritage</p>
      </div>

      <Lottie
        options={{
          animationData,
          loop: true,
          autoplay: true,
          rendererSettings: { preserveAspectRatio: 'xMidYMid slice' },
        }}
        height="100dvh"
      />

      <div className="absolute bottom-0 w-full">
        <LandingFooter />
      </div>
    </div>
  )
}
