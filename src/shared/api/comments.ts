import { apiUrl } from "@/shared/api/base";
import { getToken } from "@/shared/lib/auth-token";

export interface CommentAuthor {
  id: number;
  nickname: string | null;
  name: string;
  picture: string | null;
}

export interface CommentItem {
  id: number;
  shortsId: number;
  content: string;
  createdAt: string;
  author: CommentAuthor;
}

function authHeaders(): Record<string, string> {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/** 영상 댓글 목록(공개) */
export async function getComments(shortsId: number): Promise<CommentItem[]> {
  const res = await fetch(apiUrl(`/comments?shortsId=${shortsId}`));
  if (!res.ok) throw new Error("댓글을 불러오지 못했어요");
  return res.json();
}

/** 댓글 작성(로그인 필요) */
export async function createComment(
  shortsId: number,
  content: string,
): Promise<CommentItem> {
  const res = await fetch(apiUrl("/comments"), {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify({ shortsId, content }),
  });
  if (!res.ok) throw new Error("댓글 작성에 실패했어요");
  return res.json();
}
