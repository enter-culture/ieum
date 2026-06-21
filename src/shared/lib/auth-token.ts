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
    const part = token.split(".")[1];
    if (!part) return null;
    // base64url → base64 + 패딩 보정 (atob은 길이%4==1이면 throw)
    let base64 = part.replace(/-/g, "+").replace(/_/g, "/");
    base64 += "=".repeat((4 - (base64.length % 4)) % 4);
    // atob은 Latin1만 다루므로 UTF-8로 다시 디코딩해야 한글 이름이 안 깨진다
    const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
    const json = new TextDecoder().decode(bytes);
    const payload = JSON.parse(json) as AuthUser;
    if (payload.exp && payload.exp * 1000 < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}
