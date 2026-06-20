"use client";
import { useState } from "react";

const TOTAL_STEPS = 3;

const useStep = () => {
  const [step, setStep] = useState<"1" | "2" | "3">("1");

  const nextStep = () => {
    setStep((prev) => {
      if (prev === "1") return "2";
      if (prev === "2") return "3";
      return "3";
    });
  };

  const prevStep = () => {
    setStep((prev) => {
      if (prev === "3") return "2";
      if (prev === "2") return "1";
      return "1";
    });
  };

  const isLastStep = step === "3";
  const isFirstStep = step === "1";

  return { step, nextStep, prevStep, isLastStep, isFirstStep, totalSteps: TOTAL_STEPS };
};

export default useStep;
