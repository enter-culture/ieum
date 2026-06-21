"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { apiUrl } from "@/shared/api/base";

interface Destination {
  id: string;
  title: string;
  address: string;
  category: string;
  contentTypeId: string;
  image: string | null;
  dist: number;
  lat: number;
  lng: number;
}

const FILTERS = [
  { label: "전체", type: "" },
  { label: "관광지", type: "12" },
  { label: "문화시설", type: "14" },
  { label: "행사", type: "15" },
  { label: "음식점", type: "39" },
  { label: "숙박", type: "32" },
];

function formatDist(m: number) {
  return m >= 1000 ? `${(m / 1000).toFixed(1)}km` : `${m}m`;
}

export default function DestinationsPage() {
  const router = useRouter();
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationError, setLocationError] = useState(false);
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState("");

  const fetchDestinations = useCallback(async (lat: number, lng: number, type: string) => {
    setLoading(true);
    try {
      const res = await fetch(apiUrl(`/destinations?lat=${lat}&lng=${lng}&radius=5000&type=${type}`));
      const data = await res.json();
      if (Array.isArray(data)) setDestinations(data);
    } catch {
      setDestinations([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const requestLocation = useCallback(() => {
    setLocationError(false);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setLocation(loc);
        fetchDestinations(loc.lat, loc.lng, activeFilter);
      },
      () => setLocationError(true),
      { timeout: 10000 }
    );
  }, [activeFilter, fetchDestinations]);

  useEffect(() => {
    requestLocation();
  }, []);

  const handleFilterChange = (type: string) => {
    setActiveFilter(type);
    if (location) fetchDestinations(location.lat, location.lng, type);
  };

  return (
    <div className="h-dvh overflow-y-auto bg-white pb-20">
      {/* 헤더 */}
      <div className="px-5 pt-12 pb-4">
        <h1 className="text-2xl font-bold text-gray-900">주변 여행지</h1>
        <p className="text-sm text-gray-400 mt-1">
          {location ? "현재 위치 기준 5km 이내" : "위치를 확인하는 중..."}
        </p>
      </div>

      {/* 위치 오류 */}
      {locationError && (
        <div className="mx-5 mb-4 bg-red-50 border border-red-100 rounded-2xl p-4 flex items-center gap-3">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <div className="flex-1">
            <p className="text-sm font-medium text-red-700">위치 접근 권한이 필요해요</p>
            <p className="text-xs text-red-400 mt-0.5">브라우저 설정에서 허용해주세요</p>
          </div>
          <button onClick={requestLocation} className="text-xs text-red-600 font-semibold">재시도</button>
        </div>
      )}

      {/* 필터 */}
      <div className="flex gap-2 px-5 pb-4 overflow-x-auto scrollbar-hide">
        {FILTERS.map((f) => (
          <button
            key={f.type}
            onClick={() => handleFilterChange(f.type)}
            className="flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all"
            style={{
              background: activeFilter === f.type ? "#ee7f12" : "#f3f4f6",
              color: activeFilter === f.type ? "white" : "#6b7280",
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* 로딩 */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <div className="w-6 h-6 border-2 border-gray-200 border-t-[#ee7f12] rounded-full animate-spin" />
          <p className="text-sm text-gray-400">주변 여행지를 찾고 있어요</p>
        </div>
      )}

      {/* 결과 */}
      {!loading && destinations.length > 0 && (
        <div className="px-5 space-y-3">
          {destinations.map((dest) => (
            <div key={dest.id} className="flex gap-3 p-3 rounded-2xl border border-gray-100 hover:border-gray-200 transition-colors cursor-pointer active:bg-gray-50">
              {/* 이미지 */}
              <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                {dest.image ? (
                  <img src={dest.image} alt={dest.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="1.5">
                      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                    </svg>
                  </div>
                )}
              </div>

              {/* 정보 */}
              <div className="flex-1 min-w-0 py-1">
                <p className="text-sm font-semibold text-gray-900 truncate">{dest.title}</p>
                <p className="text-xs text-gray-400 mt-0.5 truncate">{dest.address}</p>
                <div className="flex items-center gap-2 mt-2">
                  {dest.category && (
                    <span className="text-[10px] font-medium text-[#ee7f12] bg-orange-50 px-2 py-0.5 rounded-full">{dest.category}</span>
                  )}
                  <span className="text-[10px] text-gray-400">{formatDist(dest.dist)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 결과 없음 */}
      {!loading && destinations.length === 0 && location && (
        <div className="flex flex-col items-center justify-center py-20 text-gray-300">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
          </svg>
          <p className="mt-3 text-sm">주변 여행지를 찾지 못했어요</p>
          <p className="text-xs mt-1">반경을 넓히거나 다른 필터를 선택해보세요</p>
        </div>
      )}
    </div>
  );
}
