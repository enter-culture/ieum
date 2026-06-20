"use client";
import Lottie from "react-lottie";
// eslint-disable-next-line @typescript-eslint/no-require-imports
const animationData = require("../../../../public/lottie/landing.json");

export default function Loading() {
  return (
    <div className="fixed top-0 left-0 w-full h-dvh flex items-center justify-center bg-[#E5E5EA] z-50">
      <div className="w-32 h-32">
        <Lottie options={{ animationData, loop: true }} />
      </div>
    </div>
  );
}
