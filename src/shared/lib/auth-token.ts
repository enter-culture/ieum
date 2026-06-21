export const TOKEN_KEY = "ieum_token";

export interface AuthUser {
  sub: string;
  email: string;
  name: string;
  picture: string;
  exp?: number;
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setToken(token: string): void {
  try {
    localStorage.setItem(TOKEN_KEY, token);
  } catch {}
}

export function clearToken(): void {
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch {}
}

/** JWT payload를 디코드해 사용자 정보를 반환. 만료됐으면 null. (서명 검증은 서버 몫) */
export function decodeUser(token: string | null): AuthUser | null {
  if (!token) return null;
  try {
    const payload = token.split(".")[1];
    const json = JSON.parse(
      atob(payload.replace(/-/g, "+").replace(/_/g, "/")),
    ) as AuthUser;
    if (json.exp && json.exp * 1000 < Date.now()) return null;
    return json;
  } catch {
    return null;
  }
}
