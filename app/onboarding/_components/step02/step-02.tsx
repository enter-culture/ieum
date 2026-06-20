"use client";
import { useFormContext } from "react-hook-form";
import { OnboardingSchema } from "../../_schemas/onboarding_schema";
import OnboardingTitle from "../onboarding-title";
import CheckboxButtonGroup from "@/app/_components/checkbox-button-group";
import { CATEGORY_FILTER_OPTIONS } from "@/app/_constants/filter";

export default function Step02() {
  const { setValue, watch } = useFormContext<OnboardingSchema>();
  const placeCategoryList = watch("placeCategoryList") || [];

  const handleSelect = (value: number | string) => {
    const numValue = Number(value);
    if (placeCategoryList.includes(numValue)) {
      setValue("placeCategoryList", placeCategoryList.filter((v) => v !== numValue));
    } else {
      setValue("placeCategoryList", [...placeCategoryList, numValue]);
    }
  };

  return (
    <div className="flex flex-col gap-8 px-6 py-8">
      <OnboardingTitle
        title="어떤 무형문화재에 관심있으세요?"
        subtitle="관심 있는 카테고리를 선택해주세요 (복수 선택 가능)"
      />
      <CheckboxButtonGroup
        options={CATEGORY_FILTER_OPTIONS}
        selectedValues={placeCategoryList}
        onSelect={handleSelect}
      />
    </div>
  );
}
