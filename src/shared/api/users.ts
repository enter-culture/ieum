import { apiUrl } from "@/shared/api/base";
import { getToken } from "@/shared/lib/auth-token";

export interface MyProfile {
  id: number;
  email: string;
  name: string;
  picture: string | null;
  nickname: string | null;
  region: string | null;
  category: string | null;
}

export interface UpdateProfilePayload {
  nickname?: string;
  region?: string;
  category?: string;
  picture?: string;
}

function authHeaders(): Record<string, string> {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/** 내 프로필 조회 (DB 최신값, 로그인 필요) */
export async function getMe(): Promise<MyProfile> {
  const res = await fetch(apiUrl("/users/me"), {
    headers: { ...authHeaders() },
  });
  if (!res.ok) throw new Error("프로필을 불러오지 못했어요");
  return res.json();
}

/** 내 프로필 수정 (로그인 필요) */
export async function updateMe(
  payload: UpdateProfilePayload,
): Promise<MyProfile> {
  const res = await fetch(apiUrl("/users/me"), {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("프로필 저장에 실패했어요");
  return res.json();
}

/**
 * 이미지를 R2에 업로드하고 공개 URL을 반환한다. (presign → PUT → public URL)
 * folder 기본값은 백엔드에서 'avatars'로 지정해 프로필 사진 경로에 저장.
 */
export async function uploadImage(file: File): Promise<string> {
  const presignRes = await fetch(apiUrl("/upload/presign"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      filename: file.name,
      contentType: file.type,
      folder: "avatars",
    }),
  });
  if (!presignRes.ok) throw new Error("업로드 URL 발급 실패");
  const { presignedUrl, key } = await presignRes.json();

  const putRes = await fetch(presignedUrl, {
    method: "PUT",
    headers: { "Content-Type": file.type },
    body: file,
  });
  if (!putRes.ok) throw new Error("이미지 업로드 실패");

  return `${process.env.NEXT_PUBLIC_R2_PUBLIC_URL ?? ""}/${key}`;
}
