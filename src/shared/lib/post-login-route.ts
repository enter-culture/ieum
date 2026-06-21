import { getMyOnboarding, saveMyOnboarding } from "@/shared/api/onboarding";
import {
  getOnboardingDataFromSessionStorage,
  setIsCompletedOnboardingToSessionStorage,
  setOnboardingDataToSessionStorage,
} from "@/shared/lib/session-storage";
import {
  defaultValues,
  type OnboardingSchema,
} from "@/shared/model/onboarding-schema";

function hasSurvey(v?: {
  vibeList?: number[];
  placeCategoryList?: number[];
} | null) {
  return (
    !!v && (v.vibeList?.length ?? 0) > 0 && (v.placeCategoryList?.length ?? 0) > 0
  );
}

/**
 * 로그인된 사용자의 다음 목적지를 결정한다. (콜백/랜딩 등에서 공용 사용)
 * - 서버에 설문 있음            → 로컬 반영 후 /explore
 * - 서버 없음 + 로컬 설문 있음   → 서버 저장 후 /explore
 * - 둘 다 없음(관심지역 미설정)  → /onboarding
 */
export async function decidePostLoginRoute(): Promise<string> {
  try {
    const server = await getMyOnboarding();
    if (hasSurvey(server)) {
      setOnboardingDataToSessionStorage({
        ...defaultValues,
        ...server,
      } as OnboardingSchema);
      setIsCompletedOnboardingToSessionStorage();
      return "/explore";
    }

    const local = getOnboardingDataFromSessionStorage();
    if (hasSurvey(local)) {
      await saveMyOnboarding({
        vibeList: local!.vibeList,
        placeCategoryList: local!.placeCategoryList,
      });
      setIsCompletedOnboardingToSessionStorage();
      return "/explore";
    }

    // 관심지역/카테고리 미설정 → 온보딩 화면으로
    return "/onboarding";
  } catch {
    // 서버 오류 시엔 진입은 막지 않는다
    return "/explore";
  }
}
