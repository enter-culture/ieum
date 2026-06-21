"use client";
import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/shared/lib/auth-store";

function AuthCallback() {
  const router = useRouter();
  const params = useSearchParams();
  const { applyToken } = useAuth();

  useEffect(() => {
    const token = params.get("token");
    if (token) {
      applyToken(token);
      router.replace("/explore");
    } else {
      router.replace("/?error=login");
    }
  }, [params, applyToken, router]);

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
