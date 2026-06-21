"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Lottie from "react-lottie";
// eslint-disable-next-line @typescript-eslint/no-require-imports
const animationData = require("../../../../public/lottie/landing.json");
import LandingFooter from "@/views/landing/ui/LandingFooter";
import { useAuth } from "@/shared/lib/auth-store";

export default function LandingLottie() {
  const router = useRouter();
  const { isLoggedIn } = useAuth();

  // 이미 로그인한 사용자는 랜딩을 건너뛰고 쇼츠로 이동
  useEffect(() => {
    if (isLoggedIn) router.replace("/explore");
  }, [isLoggedIn, router]);

  return (
    <div className="relative bg-[#e8e8e8]">
      <Lottie options={{ animationData, loop: true }} height="100dvh" />
      <div className="absolute bottom-0 w-full">
        <LandingFooter />
      </div>
    </div>
  );
}
