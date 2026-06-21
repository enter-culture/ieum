import { apiUrl } from "@/shared/api/base";
import { getToken } from "@/shared/lib/auth-token";

export interface OnboardingInfo {
  vibeList: number[];
  placeCategoryList: number[];
}

function authHeaders(): Record<string, string> {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/** 내 온보딩 설문 조회 (로그인 필요). 없으면 null. */
export async function getMyOnboarding(): Promise<OnboardingInfo | null> {
  const res = await fetch(apiUrl("/onboarding/me"), {
    headers: { ...authHeaders() },
  });
  if (!res.ok) return null;
  return (await res.json()) as OnboardingInfo | null;
}

/** 내 온보딩 설문 저장 (upsert, 로그인 필요). */
export async function saveMyOnboarding(info: OnboardingInfo): Promise<void> {
  await fetch(apiUrl("/onboarding/me"), {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(info),
  });
}
