import { z } from "zod";

export const onboardingSchema = z.object({
  departure_date: z.date({ message: "출발 날짜를 선택해주세요" }),
  arrival_date: z.date({ message: "도착 날짜를 선택해주세요" }),
  placeCategoryList: z.array(z.number()).min(1, "카테고리를 하나 이상 선택해주세요"),
  vibeList: z.array(z.number()).min(1, "지역을 하나 이상 선택해주세요"),
});

export type OnboardingSchema = z.infer<typeof onboardingSchema>;
