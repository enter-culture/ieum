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

interface FormData {
  title: string;
  description: string;
  category: string;
  subCategory: string;
  region: string;
  heritageAsno: string;
  heritageCtcd: string;
}

export default function UploadPage() {
  const router = useRouter();

  // 문화재 검색
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState<HeritageItem[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedHeritage, setSelectedHeritage] = useState<HeritageItem | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // 폼 데이터
  const [form, setForm] = useState<FormData>({
    title: "",
    description: "",
    category: "",
    subCategory: "",
    region: "",
    heritageAsno: "",
    heritageCtcd: "",
  });

  // 영상
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  // 업로드 상태
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // 문화재 검색
  const handleSearch = useCallback(async () => {
    if (!query.trim()) return;
    setSearching(true);
    setSearchResults([]);
    try {
      const res = await fetch(`/api/heritage/search?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      setSearchResults(data);
    } finally {
      setSearching(false);
    }
  }, [query]);

  // 문화재 선택 → 상세 정보 자동 채우기
  const handleSelectHeritage = async (item: HeritageItem) => {
    setSelectedHeritage(item);
    setSearchResults([]);
    setLoadingDetail(true);
    try {
      const res = await fetch(`/api/heritage/detail?asno=${item.asno}&ctcd=${item.ctcd}&kdcd=${item.kdcd}`);
      const detail = await res.json();
      setForm((prev) => ({
        ...prev,
        title: detail.name || item.name,
        description: detail.content || "",
        category: detail.category || item.category,
        subCategory: detail.subCategory || "",
        region: detail.region || item.region,
        heritageAsno: item.asno,
        heritageCtcd: item.ctcd,
      }));
    } catch {
      setForm((prev) => ({
        ...prev,
        title: item.name,
        category: item.category,
        region: item.region,
        heritageAsno: item.asno,
        heritageCtcd: item.ctcd,
      }));
    } finally {
      setLoadingDetail(false);
    }
  };

  // 영상 선택
  const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setVideoFile(file);
    setVideoPreview(URL.createObjectURL(file));
  };

  // 업로드
  const handleSubmit = async () => {
    if (!videoFile) { setError("영상 파일을 선택해주세요."); return; }
    if (!form.title.trim()) { setError("제목을 입력해주세요."); return; }
    setError(null);
    setUploading(true);
    setProgress(0);

    try {
      // 1. Presigned URL 발급
      const presignRes = await fetch("/api/upload/presign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filename: videoFile.name, contentType: videoFile.type }),
      });
      if (!presignRes.ok) throw new Error("Presigned URL 발급 실패");
      const { presignedUrl, key } = await presignRes.json();

      // 2. R2에 직접 업로드
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) setProgress(Math.round((e.loaded / e.total) * 100));
        };
        xhr.onload = () => (xhr.status === 200 ? resolve() : reject(new Error(`Upload failed: ${xhr.status}`)));
        xhr.onerror = () => reject(new Error("네트워크 오류"));
        xhr.open("PUT", presignedUrl);
        xhr.setRequestHeader("Content-Type", videoFile.type);
        xhr.send(videoFile);
      });

      const publicUrl = `${process.env.NEXT_PUBLIC_R2_PUBLIC_URL ?? ""}/${key}`;
      setUploadedUrl(publicUrl);
      setDone(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "업로드 실패");
    } finally {
      setUploading(false);
    }
  };

  // 완료 화면
  if (done) {
    return (
      <div className="h-dvh bg-white flex flex-col items-center justify-center px-6 text-center">
        <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mb-5">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">업로드 완료!</h2>
        <p className="text-sm text-gray-400 mb-1">{form.title}</p>
        {uploadedUrl && <p className="text-xs text-gray-300 mb-8 break-all px-4">{uploadedUrl}</p>}
        <div className="flex gap-3 w-full">
          <button onClick={() => { setDone(false); setVideoFile(null); setVideoPreview(null); setSelectedHeritage(null); setForm({ title:"",description:"",category:"",subCategory:"",region:"",heritageAsno:"",heritageCtcd:"" }); setQuery(""); }}
            className="flex-1 py-3.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600">
            또 등록하기
          </button>
          <button onClick={() => router.push("/explore")}
            className="flex-1 py-3.5 rounded-xl bg-[#ee7f12] text-white text-sm font-bold">
            쇼츠 보기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-dvh overflow-y-auto bg-white">
      {/* 헤더 */}
      <div className="sticky top-0 z-50 bg-white border-b border-gray-100 px-4 h-12 flex items-center gap-3">
        <button onClick={() => router.back()} className="text-gray-400 hover:text-gray-900">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M19 12H5M12 5l-7 7 7 7"/>
          </svg>
        </button>
        <h1 className="text-sm font-semibold text-gray-900">쇼츠 등록</h1>
      </div>

      <div className="max-w-lg mx-auto px-5 py-6 space-y-8 pb-24">

        {/* ── 문화재 검색 ── */}
        <section>
          <label className="block text-xs font-semibold text-gray-400 tracking-widest uppercase mb-3">문화재 연결</label>
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="판소리, 강강술래, 택견..."
              className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#ee7f12] transition-colors"
            />
            <button onClick={handleSearch} disabled={searching}
              className="px-4 py-3 bg-[#ee7f12] text-white text-sm font-semibold rounded-xl disabled:opacity-50 flex-shrink-0">
              {searching ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : "검색"}
            </button>
          </div>

          {/* 검색 결과 드롭다운 */}
          {searchResults.length > 0 && (
            <div className="border border-gray-100 rounded-xl overflow-hidden shadow-sm">
              {searchResults.map((item, i) => (
                <button key={item.asno} onClick={() => handleSelectHeritage(item)}
                  className={`w-full text-left px-4 py-3 hover:bg-orange-50 transition-colors ${i > 0 ? "border-t border-gray-50" : ""}`}>
                  <p className="text-sm font-medium text-gray-900">{item.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{item.category} · {item.region}</p>
                </button>
              ))}
            </div>
          )}

          {/* 선택된 문화재 */}
          {selectedHeritage && (
            <div className="flex items-center gap-3 bg-orange-50 border border-orange-100 rounded-xl px-4 py-3">
              {loadingDetail ? (
                <div className="w-4 h-4 border-2 border-orange-200 border-t-[#ee7f12] rounded-full animate-spin flex-shrink-0" />
              ) : (
                <div className="w-2 h-2 rounded-full bg-[#ee7f12] flex-shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">{selectedHeritage.name}</p>
                <p className="text-xs text-gray-400">{selectedHeritage.category} · {selectedHeritage.region}</p>
              </div>
              <button onClick={() => { setSelectedHeritage(null); setForm({ title:"",description:"",category:"",subCategory:"",region:"",heritageAsno:"",heritageCtcd:"" }); }}
                className="text-gray-300 hover:text-gray-500 flex-shrink-0">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
              </button>
            </div>
          )}
        </section>

        {/* ── 폼 필드 ── */}
        <section className="space-y-4">
          <label className="block text-xs font-semibold text-gray-400 tracking-widest uppercase">기본 정보</label>

          {/* 제목 */}
          <div>
            <label className="block text-xs text-gray-500 mb-1.5">제목 <span className="text-red-400">*</span></label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm(p => ({ ...p, title: e.target.value }))}
              placeholder="쇼츠 제목"
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#ee7f12] transition-colors"
            />
          </div>

          {/* 카테고리 / 지역 */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1.5">카테고리</label>
              <input
                type="text"
                value={form.category}
                onChange={(e) => setForm(p => ({ ...p, category: e.target.value }))}
                placeholder="국가무형유산"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-3 text-sm outline-none focus:border-[#ee7f12] transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1.5">지역</label>
              <input
                type="text"
                value={form.region}
                onChange={(e) => setForm(p => ({ ...p, region: e.target.value }))}
                placeholder="전라남도"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-3 text-sm outline-none focus:border-[#ee7f12] transition-colors"
              />
            </div>
          </div>

          {/* 설명 */}
          <div>
            <label className="block text-xs text-gray-500 mb-1.5">설명</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm(p => ({ ...p, description: e.target.value }))}
              placeholder="쇼츠 설명을 입력하세요"
              rows={5}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#ee7f12] transition-colors resize-none"
            />
          </div>
        </section>

        {/* ── 영상 업로드 ── */}
        <section>
          <label className="block text-xs font-semibold text-gray-400 tracking-widest uppercase mb-3">영상 파일 <span className="text-red-400 normal-case font-normal">*</span></label>

          {!videoFile ? (
            <button onClick={() => videoInputRef.current?.click()}
              className="w-full border-2 border-dashed border-gray-200 rounded-2xl py-12 flex flex-col items-center gap-3 hover:border-[#ee7f12] hover:bg-orange-50 transition-all">
              <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ee7f12" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="17 8 12 3 7 8"/>
                  <line x1="12" y1="3" x2="12" y2="15"/>
                </svg>
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold text-gray-700">영상 파일 선택</p>
                <p className="text-xs text-gray-400 mt-1">MP4, MOV · 최대 500MB</p>
              </div>
            </button>
          ) : (
            <div className="relative">
              <div className="rounded-2xl overflow-hidden bg-black" style={{ aspectRatio: "9/16", maxHeight: 280 }}>
                <video src={videoPreview!} className="w-full h-full object-contain" controls muted playsInline />
              </div>
              <div className="flex items-center justify-between mt-2 px-1">
                <p className="text-xs text-gray-400 truncate">{videoFile.name} · {(videoFile.size/1024/1024).toFixed(1)}MB</p>
                <button onClick={() => { setVideoFile(null); setVideoPreview(null); }}
                  className="text-xs text-gray-400 hover:text-red-500 transition-colors flex-shrink-0 ml-2">변경</button>
              </div>
            </div>
          )}
          <input ref={videoInputRef} type="file" accept="video/mp4,video/mov,video/quicktime,video/*" className="hidden" onChange={handleVideoSelect} />
        </section>

        {/* 에러 메시지 */}
        {error && (
          <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* 업로드 진행률 */}
        {uploading && (
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-600">업로드 중...</span>
              <span className="text-[#ee7f12] font-bold">{progress}%</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-1.5">
              <div className="bg-[#ee7f12] h-1.5 rounded-full transition-all duration-200" style={{ width: `${progress}%` }} />
            </div>
          </div>
        )}
      </div>

      {/* 하단 고정 버튼 */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-5 py-4">
        <button
          onClick={handleSubmit}
          disabled={uploading || !videoFile || !form.title.trim()}
          className="w-full py-4 rounded-2xl bg-[#ee7f12] text-white text-base font-bold disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
        >
          {uploading ? `업로드 중 ${progress}%` : "등록하기"}
        </button>
      </div>
    </div>
  );
}
