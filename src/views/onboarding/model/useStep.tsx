"use client";
import { useState } from "react";

const TOTAL_STEPS = 2;

const useStep = () => {
  const [step, setStep] = useState<"1" | "2">("1");

  const nextStep = () => {
    setStep((prev) => {
      if (prev === "1") return "2";
      return "2";
    });
  };

  const prevStep = () => {
    setStep((prev) => {
      if (prev === "2") return "1";
      return "1";
    });
  };

  const isLastStep = step === "2";
  const isFirstStep = step === "1";

  return { step, nextStep, prevStep, isLastStep, isFirstStep, totalSteps: TOTAL_STEPS };
};

export default useStep;
