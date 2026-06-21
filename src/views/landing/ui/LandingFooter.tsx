"use client";
import Link from "next/link";
import { useAuth } from "@/shared/lib/auth-store";

export default function LandingFooter() {
  const { login } = useAuth();
  return (
    <div className="w-full px-6 pb-10 pt-4 bg-[#e8e8e8]">
      <Link href="/onboarding" className="block w-full">
        <button className="w-full py-4 rounded-xl bg-[#ee7f12] text-white text-base font-semibold hover:bg-[#e77011] active:scale-[0.98] transition-all duration-150">
          시작하기
        </button>
      </Link>
      <button
        onClick={login}
        className="mt-3 w-full py-3 text-sm font-medium text-gray-600 active:scale-[0.98] transition-all"
      >
        구글로 로그인
      </button>
    </div>
  );
}
