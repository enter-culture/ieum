"use client";
import Lottie from "react-lottie";
// eslint-disable-next-line @typescript-eslint/no-require-imports
const animationData = require("../../../../public/lottie/landing.json");
import LandingFooter from "@/views/landing/ui/LandingFooter";

export default function LandingLottie() {
  return (
    <div className="relative bg-[#e8e8e8]">
      <Lottie options={{ animationData, loop: true }} height="100dvh" />
      <div className="absolute bottom-0 w-full">
        <LandingFooter />
      </div>
    </div>
  );
}
