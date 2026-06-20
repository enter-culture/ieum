"use client";
import { useFormContext } from "react-hook-form";
import { DateRange } from "react-day-picker";
import { OnboardingSchema } from "../../_schemas/onboarding_schema";
import OnboardingTitle from "../onboarding-title";
import Step01DateRange from "./step-01-date-range";

export default function Step01() {
  const { setValue, watch } = useFormContext<OnboardingSchema>();

  const departureDate = watch("departure_date");
  const arrivalDate = watch("arrival_date");

  const selectedRange: DateRange | undefined =
    departureDate || arrivalDate
      ? { from: departureDate, to: arrivalDate }
      : undefined;

  const handleSelect = (range: DateRange) => {
    if (range.from) setValue("departure_date", range.from);
    if (range.to) setValue("arrival_date", range.to);
  };

  return (
    <div className="flex flex-col gap-8 px-6 py-8">
      <OnboardingTitle
        title="여행 일정을 알려주세요"
        subtitle="출발일과 도착일을 선택해주세요"
      />
      <Step01DateRange
        onSelect={handleSelect}
        inputSelectedRange={selectedRange}
      />
    </div>
  );
}
