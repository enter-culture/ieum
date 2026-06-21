"use client";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { apiUrl } from "@/shared/api/base";
import {
  AuthUser,
  clearToken,
  decodeUser,
  getToken,
  setToken,
} from "@/shared/lib/auth-token";

interface AuthContextType {
  user: AuthUser | null;
  isLoggedIn: boolean;
  /** 구글 로그인 시작 (백엔드로 이동) */
  login: () => void;
  logout: () => void;
  /** 로그인 상태면 action 실행, 아니면 로그인 모달 노출 */
  requireAuth: (action: () => void) => void;
  /** 토큰 저장 후 상태 갱신 (콜백 페이지에서 사용) */
  applyToken: (token: string) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  useEffect(() => {
    setUser(decodeUser(getToken()));
  }, []);

  const login = useCallback(() => {
    // 로그인 완료 후 돌아올 프론트 주소
    const redirectUri = `${window.location.origin}/auth/callback`;
    // 구글이 code를 보낼 백엔드 콜백 — 프론트의 API_BASE로 만들어 전달 (localhost/배포 자동 대응)
    const callbackUrl = apiUrl("/auth/google/callback");
    window.location.href = apiUrl(
      `/auth/google?redirect_uri=${encodeURIComponent(
        redirectUri,
      )}&callback_url=${encodeURIComponent(callbackUrl)}`,
    );
  }, []);

  const logout = useCallback(() => {
    clearToken();
    setUser(null);
  }, []);

  const applyToken = useCallback((token: string) => {
    setToken(token);
    setUser(decodeUser(token));
  }, []);

  const requireAuth = useCallback(
    (action: () => void) => {
      if (decodeUser(getToken())) action();
      else setShowLoginPrompt(true);
    },
    [],
  );

  const value = useMemo<AuthContextType>(
    () => ({
      user,
      isLoggedIn: !!user,
      login,
      logout,
      requireAuth,
      applyToken,
    }),
    [user, login, logout, requireAuth, applyToken],
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
      {showLoginPrompt && (
        <LoginPrompt
          onLogin={login}
          onClose={() => setShowLoginPrompt(false)}
        />
      )}
    </AuthContext.Provider>
  );
}

function LoginPrompt({
  onLogin,
  onClose,
}: {
  onLogin: () => void;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-t-2xl bg-white px-6 pb-10 pt-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-semibold text-gray-900">로그인이 필요해요</h2>
        <p className="mt-2 text-sm text-gray-500">
          좋아요를 누르려면 로그인해주세요.
        </p>
        <button
          onClick={onLogin}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 py-3.5 text-sm font-medium text-gray-700 active:scale-[0.98] transition-all"
        >
          <GoogleIcon />
          구글로 로그인
        </button>
        <button
          onClick={onClose}
          className="mt-2 w-full py-3 text-sm text-gray-400"
        >
          나중에
        </button>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden>
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.71-1.57 2.68-3.89 2.68-6.62z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.81.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.33A9 9 0 0 0 9 18z"
      />
      <path
        fill="#FBBC05"
        d="M3.97 10.72a5.4 5.4 0 0 1 0-3.44V4.95H.96a9 9 0 0 0 0 8.1l3.01-2.33z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.47.89 11.43 0 9 0A9 9 0 0 0 .96 4.95l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58z"
      />
    </svg>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
