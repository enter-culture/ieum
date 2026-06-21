"use client";
import { useFormContext } from "react-hook-form";
import { OnboardingSchema } from "@/views/onboarding/model/onboarding_schema";
import OnboardingTitle from "@/views/onboarding/ui/OnboardingTitle";
import BoardingPassFan from "@/features/onboarding/ui/BoardingPassFan";
import { LOCATION_FILTER_OPTIONS } from "@/shared/config/filter";

export default function Step03() {
  const { setValue, watch } = useFormContext<OnboardingSchema>();
  const vibeList = watch("vibeList") || [];

  const handleSelect = (value: number | string) => {
    const numValue = Number(value);
    if (vibeList.includes(numValue)) {
      setValue("vibeList", vibeList.filter((v) => v !== numValue));
    } else {
      setValue("vibeList", [...vibeList, numValue]);
    }
  };

  return (
    <div className="flex flex-col gap-4 px-6 pt-6 pb-24 h-full">
      <OnboardingTitle
        title="어느 지역의 무형문화재를 찾으세요?"
        subtitle="카드를 눌러 지역을 선택해보세요"
      />
      <BoardingPassFan
        options={LOCATION_FILTER_OPTIONS}
        selectedValues={vibeList}
        onSelect={handleSelect}
      />
    </div>
  );
}
