import Link from 'next/link'

export default function LandingFooter() {
  return (
    <div className="w-full px-6 pb-14 bg-[#0d0d0d]">
      <Link href="/feed" className="block w-full">
        <button className="w-full py-4 rounded-2xl bg-[#C0392B] text-white text-base font-semibold tracking-wide hover:bg-[#a93226] active:scale-[0.98] transition-all duration-150">
          시작하기
        </button>
      </Link>
      <p className="text-center text-white/25 text-xs mt-4 tracking-wide">
        국가무형문화재 · 시도무형문화재
      </p>
    </div>
  )
}
