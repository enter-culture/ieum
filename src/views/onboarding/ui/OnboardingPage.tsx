"use client";
import { Suspense } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { onboardingSchema, OnboardingSchema, defaultValues } from "@/views/onboarding/model/onboarding_schema";
import OnboardingHeader from "@/views/onboarding/ui/OnboardingHeader";
import OnboardingFooter from "@/views/onboarding/ui/OnboardingFooter";
import Step02 from "@/views/onboarding/ui/Step02";
import Step03 from "@/views/onboarding/ui/Step03";
import useStep from "@/views/onboarding/model/useStep";

function OnboardingContent() {
  const form = useForm<OnboardingSchema>({
    resolver: zodResolver(onboardingSchema),
    defaultValues,
  });
  const { step, nextStep, prevStep, isLastStep, isFirstStep, totalSteps } = useStep();

  const renderStep = () => {
    switch (step) {
      case "1": return <Step02 />;
      case "2": return <Step03 />;
      default: return null;
    }
  };

  return (
    <FormProvider {...form}>
      <div className="relative h-full bg-white">
        <OnboardingHeader step={step} totalSteps={totalSteps} isFirstStep={isFirstStep} onPrevStep={prevStep} />
        {renderStep()}
        <div className="absolute bottom-0 w-full">
          <OnboardingFooter step={step as "1"|"2"} isLastStep={isLastStep} onNextStep={nextStep} />
        </div>
      </div>
    </FormProvider>
  );
}

export default function OnboardingPage() {
  return (
    <Suspense fallback={null}>
      <OnboardingContent />
    </Suspense>
  );
}
