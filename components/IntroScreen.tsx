'use client'
import { useRouter } from 'next/navigation'

export default function IntroScreen() {
  const router = useRouter()

  return (
    <div className="relative w-screen h-screen bg-[#0d0d0d] flex flex-col items-center justify-between overflow-hidden">

      {/* 배경 — 전통 단청 색감 원형 빛 */}
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden
      >
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[480px] h-[480px] rounded-full bg-[#8B1A1A]/20 blur-[120px]" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[240px] h-[240px] rounded-full bg-[#C0392B]/10 blur-[60px]" />
      </div>

      {/* 상단 여백 */}
      <div />

      {/* 중앙 콘텐츠 */}
      <div className="flex flex-col items-center gap-8 px-8 text-center z-10">

        {/* 장식선 */}
        <div className="flex items-center gap-3 opacity-0 animate-fade-in delay-200">
          <div className="h-px w-12 bg-[#C0392B]/60 animate-breathe" />
          <span className="text-[#C0392B]/80 text-xs tracking-[0.3em] uppercase">Korea</span>
          <div className="h-px w-12 bg-[#C0392B]/60 animate-breathe" />
        </div>

        {/* 메인 타이틀 */}
        <div className="overflow-hidden">
          <h1 className="text-white text-[5rem] font-bold tracking-tight leading-none opacity-0 animate-fade-up delay-400">
            이음
          </h1>
        </div>

        {/* 영문 서브 */}
        <div className="overflow-hidden">
          <p className="text-white/40 text-sm tracking-[0.25em] uppercase opacity-0 animate-fade-up delay-700">
            Ieum · Living Heritage
          </p>
        </div>

        {/* 구분선 */}
        <div className="w-px h-12 bg-gradient-to-b from-white/20 to-transparent opacity-0 animate-fade-in delay-1000" />

        {/* 한글 설명 */}
        <p className="text-white/60 text-base leading-relaxed opacity-0 animate-fade-up delay-1000">
          우리 무형문화재를<br />숏폼으로 만나다
        </p>
      </div>

      {/* 하단 버튼 영역 */}
      <div className="w-full px-6 pb-14 z-10 opacity-0 animate-fade-up delay-1300">
        <button
          onClick={() => router.push('/feed')}
          className="w-full py-4 rounded-2xl bg-[#C0392B] text-white text-base font-semibold tracking-wide hover:bg-[#a93226] active:scale-[0.98] transition-all duration-150"
        >
          시작하기
        </button>
        <p className="text-center text-white/25 text-xs mt-4 tracking-wide">
          국가무형문화재 · 시도무형문화재
        </p>
      </div>
    </div>
  )
}
