"use client";
import { useFormContext } from "react-hook-form";
import { OnboardingSchema } from "@/views/onboarding/model/onboarding_schema";
import OnboardingTitle from "@/views/onboarding/ui/OnboardingTitle";
import BoardingPassFan from "@/features/onboarding/ui/BoardingPassFan";
import { CATEGORY_FILTER_OPTIONS } from "@/shared/config/filter";

export default function Step02() {
  const { setValue, watch } = useFormContext<OnboardingSchema>();
  const placeCategoryList = watch("placeCategoryList") ?? [];

  const handleSelect = (value: number | string) => {
    const numValue = Number(value);
    if (placeCategoryList.includes(numValue)) {
      setValue("placeCategoryList", placeCategoryList.filter((v) => v !== numValue));
    } else {
      setValue("placeCategoryList", [...placeCategoryList, numValue]);
    }
  };

  return (
    <div className="flex flex-col gap-4 px-6 pt-8 pb-4 h-full">
      <OnboardingTitle
        title="어떤 무형문화재에 관심있으세요?"
        subtitle="좌우로 스와이프해서 탑승권을 골라보세요"
      />
      <BoardingPassFan
        options={CATEGORY_FILTER_OPTIONS}
        selectedValues={placeCategoryList}
        onSelect={handleSelect}
      />
    </div>
  );
}
