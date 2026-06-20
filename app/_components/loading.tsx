"use client";
import Lottie from "react-lottie";
import animationData from "@/public/lottie/landing.json";

export default function Loading() {
  return (
    <div className="fixed top-0 left-0 w-full h-dvh flex items-center justify-center bg-[#E5E5EA] z-50">
      <div className="w-32 h-32">
        <Lottie options={{ animationData, loop: true }} />
      </div>
    </div>
  );
}
