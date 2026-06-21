export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000/api";

/** 백엔드(ieum-api) API URL을 생성한다. */
export const apiUrl = (path: string) =>
  `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
