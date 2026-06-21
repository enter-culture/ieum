import { apiUrl } from "@/shared/api/base";
import { getToken } from "@/shared/lib/auth-token";

export interface ServerLike {
  id: number;
  shortsId: number;
  title: string;
  address?: string | null;
  categoryHigh?: string | null;
  videoSrc?: string | null;
  heritageId?: string | null;
  createdAt: string;
}

export interface LikePayload {
  shortsId: number;
  title: string;
  address?: string;
  categoryHigh?: string;
  videoSrc?: string;
  heritageId?: string;
}

function authHeaders(): Record<string, string> {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/** 내 좋아요 목록 (로그인 필요) */
export async function fetchLikes(): Promise<ServerLike[]> {
  const res = await fetch(apiUrl("/likes"), { headers: authHeaders() });
  if (!res.ok) return [];
  return res.json();
}

/** 좋아요 추가 */
export async function addLike(payload: LikePayload): Promise<void> {
  await fetch(apiUrl("/likes"), {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(payload),
  });
}

/** 좋아요 취소 */
export async function removeLike(shortsId: number): Promise<void> {
  await fetch(apiUrl(`/likes/${shortsId}`), {
    method: "DELETE",
    headers: authHeaders(),
  });
}
