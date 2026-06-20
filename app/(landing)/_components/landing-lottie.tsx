"use client";

import LandingAnimation from "./landing-animation";
import LandingFooter from "./landing-footer";

export default function LandingLottie() {
  return (
    <div className="relative bg-[#e8e8e8]">
      <LandingAnimation />
      <div className="absolute bottom-0 w-full">
        <LandingFooter />
      </div>
    </div>
  );
}
