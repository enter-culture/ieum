"use client";
import { useFormContext } from "react-hook-form";
import { OnboardingSchema } from "@/views/onboarding/model/onboarding_schema";
import { useRouter } from "next/navigation";
import { setIsCompletedOnboardingToSessionStorage, setOnboardingDataToSessionStorage } from "@/shared/lib/session-storage";
import { useState } from "react";
import Loading from "@/shared/ui/Loading/Loading";

interface OnboardingFooterProps {
  step: "1" | "2" | "3";
  isLastStep: boolean;
  onNextStep: () => void;
}

export default function OnboardingFooter({ step, isLastStep, onNextStep }: OnboardingFooterProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const { getValues, watch } = useFormContext<OnboardingSchema>();

  const isValid = () => {
    const values = watch();
    if (step === "1") {
      return !!values.departure_date && !!values.arrival_date;
    }
    if (step === "2") {
      return Array.isArray(values.placeCategoryList) && values.placeCategoryList.length > 0;
    }
    if (step === "3") {
      return Array.isArray(values.vibeList) && values.vibeList.length > 0;
    }
    return true;
  };

  const onSubmit = async () => {
    const raw = getValues();
    setOnboardingDataToSessionStorage(raw);
    setIsCompletedOnboardingToSessionStorage();
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
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
