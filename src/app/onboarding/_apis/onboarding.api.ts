import { OnboardingSchema } from "../_schemas/onboarding_schema";

// No-op: no real API call
export const postOnboardingInfo = async (_data: OnboardingSchema): Promise<void> => {
  return Promise.resolve();
};
