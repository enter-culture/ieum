"use client";
import { useFormContext } from "react-hook-form";
import { OnboardingSchema } from "../../_schemas/onboarding_schema";
import OnboardingTitle from "../onboarding-title";
import CheckboxButtonGroup from "@/app/_components/checkbox-button-group";
import { LOCATION_FILTER_OPTIONS } from "@/app/_constants/filter";

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
    <div className="flex flex-col gap-8 px-6 py-8">
      <OnboardingTitle
        title="어느 지역의 무형문화재를 찾으세요?"
        subtitle="관심 있는 지역을 선택해주세요 (복수 선택 가능)"
      />
      <CheckboxButtonGroup
        options={LOCATION_FILTER_OPTIONS}
        selectedValues={vibeList}
        onSelect={handleSelect}
      />
    </div>
  );
}
