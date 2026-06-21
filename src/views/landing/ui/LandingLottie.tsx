"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Lottie from "react-lottie";
// eslint-disable-next-line @typescript-eslint/no-require-imports
const animationData = require("../../../../public/lottie/landing.json");
import LandingFooter from "@/views/landing/ui/LandingFooter";
import { useAuth } from "@/shared/lib/auth-store";
import { decidePostLoginRoute } from "@/shared/lib/post-login-route";

export default function LandingLottie() {
  const router = useRouter();
  const { isLoggedIn } = useAuth();

  // 이미 로그인한 사용자는 랜딩을 건너뛴다.
  // 단, 설문(관심지역/카테고리)이 없으면 /onboarding으로, 있으면 /explore로.
  useEffect(() => {
    if (isLoggedIn) decidePostLoginRoute().then((dest) => router.replace(dest));
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
