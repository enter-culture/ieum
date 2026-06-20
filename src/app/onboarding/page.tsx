"use client";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { onboardingSchema, OnboardingSchema } from "./_schemas/onboarding_schema";
import useStep from "./_hooks/useStep";
import OnboardingHeader from "./_components/onboarding-header";
import OnboardingFooter from "./_components/onboarding-footer";
import Step01 from "./_components/step01/step-01";
import Step02 from "./_components/step02/step-02";
import Step03 from "./_components/step03/step03";

export default function OnboardingPage() {
  const { step, nextStep, prevStep, isLastStep, isFirstStep, totalSteps } = useStep();

  const methods = useForm<OnboardingSchema>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      placeCategoryList: [],
      vibeList: [],
    },
  });

  const renderStep = () => {
    switch (step) {
      case "1": return <Step01 />;
      case "2": return <Step02 />;
      case "3": return <Step03 />;
    }
  };

  return (
    <FormProvider {...methods}>
      <div className="flex flex-col h-dvh bg-white">
        <OnboardingHeader
          step={step}
          totalSteps={totalSteps}
          isFirstStep={isFirstStep}
          onPrevStep={prevStep}
        />
        <div className="flex-1 overflow-y-auto">
          {renderStep()}
        </div>
        <OnboardingFooter step={step} isLastStep={isLastStep} onNextStep={nextStep} />
      </div>
    </FormProvider>
  );
}
