"use client";
import { useRouter } from "next/navigation";

interface OnboardingHeaderProps {
  step: "1" | "2" | "3";
  totalSteps: number;
  isFirstStep: boolean;
  onPrevStep: () => void;
}

export default function OnboardingHeader({ step, totalSteps, isFirstStep, onPrevStep }: OnboardingHeaderProps) {
  const router = useRouter();

  const handleBack = () => {
    if (isFirstStep) {
      router.back();
    } else {
      onPrevStep();
    }
  };

  const stepNumber = parseInt(step);

  return (
    <div className="flex flex-col gap-4 px-6 pt-safe-top pt-4">
      <div className="flex items-center justify-between">
        <button
          onClick={handleBack}
          className="p-2 -ml-2 text-gray-700"
          aria-label="뒤로가기"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M15.41 16.59L10.83 12l4.58-4.59L14 6l-6 6 6 6z" fill="currentColor"/>
          </svg>
        </button>
        <span className="text-sm text-gray-400">{stepNumber}/{totalSteps}</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-1">
        <div
          className="bg-[#ee7f12] h-1 rounded-full transition-all duration-300"
          style={{ width: `${(stepNumber / totalSteps) * 100}%` }}
        />
      </div>
    </div>
  );
}
