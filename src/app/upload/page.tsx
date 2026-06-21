"use client";
import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";

interface HeritageItem {
  asno: string;
  ctcd: string;
  kdcd: string;
  name: string;
  region: string;
  category: string;
}

interface HeritageDetail {
  name: string;
  category: string;
  subCategory: string;
  designatedAt: string;
  region: string;
  admin: string;
  content: string;
  thumbnail: string;
  images: string[];
}

type Step = "heritage" | "video" | "preview" | "done";

export default function UploadPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("heritage");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<HeritageItem[]>([]);
  const [searching, setSearching] = useState(false);
  const [selected, setSelected] = useState<HeritageItem | null>(null);
  const [detail, setDetail] = useState<HeritageDetail | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedKey, setUploadedKey] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const search = useCallback(async () => {
    if (!query.trim()) return;
    setSearching(true);
    const res = await fetch(`/api/heritage/search?q=${encodeURIComponent(query)}`);
    const data = await res.json();
    setResults(data);
    setSearching(false);
  }, [query]);

  const selectHeritage = async (item: HeritageItem) => {
    setSelected(item);
    const res = await fetch(`/api/heritage/${item.name}`);
    // 이름으로 못 찾으면 asno 직접 조회
    const apiRes = await fetch(
      `/api/heritage/detail?asno=${item.asno}&ctcd=${item.ctcd}&kdcd=${item.kdcd}`
    );
    if (apiRes.ok) {
      const d = await apiRes.json();
      setDetail(d);
    }
    setStep("video");
  };

  const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setVideoFile(file);
    setVideoPreview(URL.createObjectURL(file));
    setStep("preview");
  };

  const handleUpload = async () => {
    if (!videoFile || !selected) return;
    setUploading(true);
    setUploadProgress(0);

    // 1. Presigned URL 발급
    const presignRes = await fetch("/api/upload/presign", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ filename: videoFile.name, contentType: videoFile.type }),
    });
    const { presignedUrl, key } = await presignRes.json();

    // 2. R2에 직접 업로드 (XHR로 progress 추적)
    await new Promise<void>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) setUploadProgress(Math.round((e.loaded / e.total) * 100));
      };
      xhr.onload = () => (xhr.status === 200 ? resolve() : reject());
      xhr.onerror = reject;
      xhr.open("PUT", presignedUrl);
      xhr.setRequestHeader("Content-Type", videoFile.type);
      xhr.send(videoFile);
    });

    setUploadedKey(key);
    setUploading(false);
    setStep("done");
  };

  return (
    <div className="h-dvh overflow-y-auto bg-white">
      {/* 헤더 */}
      <div className="sticky top-0 z-50 bg-white border-b border-gray-100 px-4 h-12 flex items-center gap-3">
        <button onClick={() => router.back()} className="text-gray-400 hover:text-gray-900 transition-colors">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M19 12H5M12 5l-7 7 7 7"/>
          </svg>
        </button>
        <h1 className="text-sm font-semibold text-gray-900">쇼츠 등록</h1>
        {/* 스텝 인디케이터 */}
        <div className="flex gap-1.5 ml-auto">
          {(["heritage", "video", "preview", "done"] as Step[]).map((s, i) => (
            <div key={s} className="w-5 h-1 rounded-full transition-all"
              style={{ background: ["heritage", "video", "preview", "done"].indexOf(step) >= i ? "#ee7f12" : "#e5e7eb" }} />
          ))}
        </div>
      </div>

      <div className="max-w-lg mx-auto px-5 py-8">

        {/* STEP 1: 문화재 선택 */}
        {step === "heritage" && (
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-1">문화재 선택</h2>
            <p className="text-sm text-gray-400 mb-6">등록할 쇼츠와 관련된 무형문화재를 검색해주세요</p>

            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && search()}
                placeholder="문화재 이름 검색 (예: 판소리, 강강술래)"
                className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#ee7f12] transition-colors"
              />
              <button
                onClick={search}
                disabled={searching}
                className="px-4 py-3 bg-[#ee7f12] text-white text-sm font-semibold rounded-xl disabled:opacity-50"
              >
                {searching ? "..." : "검색"}
              </button>
            </div>

            {results.length > 0 && (
              <div className="space-y-2">
                {results.map((item) => (
                  <button
                    key={item.asno}
                    onClick={() => selectHeritage(item)}
                    className="w-full text-left p-4 rounded-xl border border-gray-100 hover:border-[#ee7f12] hover:bg-orange-50 transition-all"
                  >
                    <p className="text-sm font-semibold text-gray-900">{item.name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{item.category} · {item.region}</p>
                  </button>
                ))}
              </div>
            )}

            {results.length === 0 && query && !searching && (
              <p className="text-sm text-gray-400 text-center py-8">검색 결과가 없습니다</p>
            )}
          </div>
        )}

        {/* STEP 2: 영상 선택 */}
        {step === "video" && selected && (
          <div>
            <button onClick={() => setStep("heritage")} className="flex items-center gap-1 text-sm text-gray-400 mb-6 hover:text-gray-700">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
              문화재 다시 선택
            </button>

            {/* 선택된 문화재 카드 */}
            <div className="bg-orange-50 border border-orange-100 rounded-xl p-4 mb-6">
              <p className="text-xs text-[#ee7f12] font-semibold mb-1">{selected.category}</p>
              <p className="text-base font-bold text-gray-900">{selected.name}</p>
              <p className="text-xs text-gray-400 mt-0.5">{selected.region}</p>
            </div>

            <h2 className="text-xl font-bold text-gray-900 mb-1">영상 업로드</h2>
            <p className="text-sm text-gray-400 mb-6">MP4, MOV 형식을 지원해요 (최대 500MB)</p>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full border-2 border-dashed border-gray-200 rounded-2xl py-16 flex flex-col items-center gap-3 hover:border-[#ee7f12] hover:bg-orange-50 transition-all"
            >
              <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ee7f12" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="17 8 12 3 7 8"/>
                  <line x1="12" y1="3" x2="12" y2="15"/>
                </svg>
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold text-gray-700">영상 파일 선택</p>
                <p className="text-xs text-gray-400 mt-1">또는 여기에 드래그하세요</p>
              </div>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="video/mp4,video/mov,video/quicktime"
              className="hidden"
              onChange={handleVideoSelect}
            />
          </div>
        )}

        {/* STEP 3: 미리보기 & 등록 */}
        {step === "preview" && videoFile && selected && (
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-6">등록 확인</h2>

            {/* 영상 미리보기 */}
            {videoPreview && (
              <div className="rounded-2xl overflow-hidden bg-black mb-5" style={{ aspectRatio: "9/16", maxHeight: 300 }}>
                <video src={videoPreview} className="w-full h-full object-contain" controls muted />
              </div>
            )}

            {/* 정보 확인 */}
            <div className="space-y-3 mb-8">
              {[
                { label: "문화재명", value: selected.name },
                { label: "분류", value: selected.category },
                { label: "지역", value: selected.region },
                { label: "파일명", value: videoFile.name },
                { label: "파일 크기", value: `${(videoFile.size / 1024 / 1024).toFixed(1)}MB` },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between items-start gap-4 py-2.5 border-b border-gray-50">
                  <span className="text-sm text-gray-400 flex-shrink-0">{label}</span>
                  <span className="text-sm text-gray-900 text-right">{value}</span>
                </div>
              ))}
            </div>

            {/* 업로드 버튼 */}
            {!uploading ? (
              <div className="flex gap-2">
                <button
                  onClick={() => setStep("video")}
                  className="flex-1 py-3.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600"
                >
                  다시 선택
                </button>
                <button
                  onClick={handleUpload}
                  className="flex-[2] py-3.5 rounded-xl bg-[#ee7f12] text-white text-sm font-bold"
                >
                  등록하기
                </button>
              </div>
            ) : (
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600 font-medium">업로드 중...</span>
                  <span className="text-[#ee7f12] font-bold">{uploadProgress}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div
                    className="bg-[#ee7f12] h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* STEP 4: 완료 */}
        {step === "done" && (
          <div className="flex flex-col items-center text-center py-12">
            <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center mb-5">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ee7f12" strokeWidth="2.5" strokeLinecap="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">등록 완료!</h2>
            <p className="text-sm text-gray-400 mb-2">{selected?.name} 쇼츠가 업로드됐어요</p>
            {uploadedKey && (
              <p className="text-xs text-gray-300 mb-8 break-all">{uploadedKey}</p>
            )}
            <div className="flex gap-3 w-full">
              <button
                onClick={() => {
                  setStep("heritage");
                  setSelected(null);
                  setDetail(null);
                  setVideoFile(null);
                  setVideoPreview(null);
                  setUploadedKey(null);
                  setQuery("");
                  setResults([]);
                }}
                className="flex-1 py-3.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600"
              >
                또 등록하기
              </button>
              <button
                onClick={() => router.push("/explore")}
                className="flex-1 py-3.5 rounded-xl bg-[#ee7f12] text-white text-sm font-bold"
              >
                쇼츠 보러 가기
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
