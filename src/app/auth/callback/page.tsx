"use client";
import { Suspense, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/shared/lib/auth-store";
import { getMyOnboarding, saveMyOnboarding } from "@/shared/api/onboarding";
import {
  getOnboardingDataFromSessionStorage,
  setIsCompletedOnboardingToSessionStorage,
  setOnboardingDataToSessionStorage,
} from "@/shared/lib/session-storage";
import { defaultValues, type OnboardingSchema } from "@/shared/model/onboarding-schema";

function hasSurvey(v?: { vibeList?: number[]; placeCategoryList?: number[] } | null) {
  return !!v && (v.vibeList?.length ?? 0) > 0 && (v.placeCategoryList?.length ?? 0) > 0;
}

function AuthCallback() {
  const router = useRouter();
  const { applyToken } = useAuth();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    // useSearchParams 타이밍에 의존하지 않도록 주소창에서 직접 읽는다.
    const sp = new URLSearchParams(window.location.search);
    const token = sp.get("token");
    if (!token) {
      // 백엔드가 보낸 실패 이유를 화면에 표시 (랜딩으로 튕기지 않고 진단 가능하게)
      const reason = sp.get("reason") || sp.get("error") || "토큰이 전달되지 않았어요";
      setErrorMsg(reason);
      return;
    }
    applyToken(token); // localStorage에 토큰 저장 → 이후 인증 요청에 사용

    (async () => {
      try {
        // 1) 기존 유저: 서버에 저장된 설문이 있으면 그대로 사용
        const server = await getMyOnboarding();
        if (hasSurvey(server)) {
          setOnboardingDataToSessionStorage({
            ...defaultValues,
            ...server,
          } as OnboardingSchema);
          setIsCompletedOnboardingToSessionStorage();
          router.replace("/explore");
          return;
        }

        // 2) 서버에 없음 + 로컬 설문 있음(처음 온보딩만 하고 로그인): 로컬을 서버에 저장
        const local = getOnboardingDataFromSessionStorage();
        if (hasSurvey(local)) {
          await saveMyOnboarding({
            vibeList: local!.vibeList,
            placeCategoryList: local!.placeCategoryList,
          });
          router.replace("/explore");
          return;
        }

        // 3) 둘 다 없음(신규, 온보딩 안 함): 온보딩 화면으로
        router.replace("/onboarding");
      } catch {
        // 네트워크 등 실패 시 일단 진입은 시켜준다
        router.replace("/explore");
      }
    })();
    // applyToken/router/params는 안정적이므로 마운트 시 1회 실행
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (errorMsg) {
    return (
      <div className="flex flex-col items-center justify-center h-dvh bg-white px-8 text-center">
        <p className="text-base font-bold text-gray-900">로그인 실패</p>
        <p className="mt-3 text-sm text-red-500 break-all">{errorMsg}</p>
        <button
          onClick={() => router.replace("/")}
          className="mt-6 rounded-xl bg-[#ee7f12] px-5 py-3 text-sm font-semibold text-white"
        >
          처음으로
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center h-dvh bg-white">
      <div className="w-5 h-5 border-[1.5px] border-gray-200 border-t-gray-600 rounded-full animate-spin" />
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={null}>
      <AuthCallback />
    </Suspense>
  );
}
