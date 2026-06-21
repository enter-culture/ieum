let promise: Promise<unknown> | null = null;

export function loadKakao(): Promise<unknown> {
  if (typeof window === "undefined") return Promise.reject(new Error("no window"));
  const w = window as unknown as { kakao?: { maps?: unknown } };
  if (w.kakao?.maps) return Promise.resolve(w.kakao);
  if (promise) return promise;

  const key = process.env.NEXT_PUBLIC_KAKAO_MAP_KEY;
  if (!key) return Promise.reject(new Error("NEXT_PUBLIC_KAKAO_MAP_KEY missing"));

  promise = new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${key}&autoload=false&libraries=services`;
    s.onerror = () => reject(new Error("kakao sdk load failed"));
    s.onload = () => {
      const kakao = (window as unknown as { kakao: { maps: { load: (cb: () => void) => void } } }).kakao;
      kakao.maps.load(() => resolve(kakao));
    };
    document.head.appendChild(s);
  });
  return promise;
}
