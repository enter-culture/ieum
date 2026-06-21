"use client";
import { useFormContext } from "react-hook-form";
import { OnboardingSchema } from "@/views/onboarding/model/onboarding_schema";
import { useRouter } from "next/navigation";
import { setIsCompletedOnboardingToSessionStorage, setOnboardingDataToSessionStorage } from "@/shared/lib/session-storage";
import { useState } from "react";
import Loading from "@/shared/ui/Loading/Loading";
import { useAuth } from "@/shared/lib/auth-store";
import { saveMyOnboarding } from "@/shared/api/onboarding";

interface OnboardingFooterProps {
  step: "1" | "2";
  isLastStep: boolean;
  onNextStep: () => void;
}

export default function OnboardingFooter({ step, isLastStep, onNextStep }: OnboardingFooterProps) {
  const router = useRouter();
  const { isLoggedIn } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const { getValues, watch } = useFormContext<OnboardingSchema>();

  const isValid = () => {
    const values = watch();
    if (step === "1") {
      return Array.isArray(values.placeCategoryList) && values.placeCategoryList.length > 0;
    }
    if (step === "2") {
      return Array.isArray(values.vibeList) && values.vibeList.length > 0;
    }
    return true;
  };

  const onSubmit = async () => {
    const raw = getValues();
    setOnboardingDataToSessionStorage(raw);
    setIsCompletedOnboardingToSessionStorage();
    setIsLoading(true);
    // 로그인 상태면 서버에도 저장 (다음 로그인/다른 기기에서 복원)
    if (isLoggedIn) {
      try {
        await saveMyOnboarding({
          vibeList: raw.vibeList,
          placeCategoryList: raw.placeCategoryList,
        });
      } catch {
        // 저장 실패해도 진입은 막지 않는다
      }
    }
    router.push("/explore");
  };

  return (
    <div className="p-4 border-t border-gray-100 bg-white">
      <button
        className="w-full py-4 rounded-xl bg-[#ee7f12] text-white font-semibold disabled:opacity-40 disabled:cursor-not-allowed"
        onClick={() => { if (isLastStep) { onSubmit(); } else { onNextStep(); } }}
        disabled={!isValid()}
      >
        {isLastStep ? "시작하기" : "다음으로"}
      </button>
      {isLoading && <Loading />}
    </div>
  );
}
