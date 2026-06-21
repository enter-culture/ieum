import { apiUrl } from "@/shared/api/base";

export interface CreateVideoPayload {
  r2Key: string;
  title: string;
  description?: string;
  category?: string;
  subCategory?: string;
  region?: string;
  heritageId?: string;
  heritageAsno?: string;
  heritageCtcd?: string;
}

/** R2 업로드 후 비디오를 백엔드에 등록 */
export async function createVideo(payload: CreateVideoPayload): Promise<void> {
  await fetch(apiUrl("/videos"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}
