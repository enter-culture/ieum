"use client";
import { useEffect, useRef, useState } from "react";
import type { CultureEvent } from "@/shared/api/culture";
import type { Coord } from "@/shared/lib/heritage-geo";
import { loadKakao } from "@/widgets/recommend-map/lib/loadKakao";

interface Props {
  sources: Coord[];
  events: CultureEvent[];
  onSelect: (e: CultureEvent) => void;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
export default function KakaoMap({ sources, events, onSelect }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const [mapReady, setMapReady] = useState(false);
  const [error, setError] = useState(false);

  // 지도 초기화 — 한 번만 실행 (sources identity 변화에 재생성하지 않음)
  useEffect(() => {
    if (mapRef.current) return; // 이미 초기화됨
    let cancelled = false;
    loadKakao()
      .then((k: any) => {
        if (cancelled || !ref.current || mapRef.current) return;
        const center = sources[0] ?? { lat: 37.5666, lng: 126.9784 };
        mapRef.current = new k.maps.Map(ref.current, {
          center: new k.maps.LatLng(center.lat, center.lng),
          level: 8,
        });
        setMapReady(true);
      })
      .catch(() => setError(true));
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 마커 갱신 — mapReady가 true가 된 뒤에도 재실행되도록 의존성에 포함
  useEffect(() => {
    const w = window as any;
    const k = w.kakao;
    const map = mapRef.current;
    if (!k?.maps || !map) return;

    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];
    const bounds = new k.maps.LatLngBounds();

    sources.forEach((s) => {
      const pos = new k.maps.LatLng(s.lat, s.lng);
      const m = new k.maps.Marker({
        position: pos, map,
        image: new k.maps.MarkerImage(
          "data:image/svg+xml;base64," + btoa(
            '<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28"><circle cx="14" cy="14" r="10" fill="#ee7f12"/></svg>',
          ),
          new k.maps.Size(28, 28),
        ),
      });
      markersRef.current.push(m);
      bounds.extend(pos);
    });

    events.forEach((e) => {
      if (!Number.isFinite(e.lat) || !Number.isFinite(e.lng)) return;
      const pos = new k.maps.LatLng(e.lat, e.lng);
      const m = new k.maps.Marker({ position: pos, map });
      k.maps.event.addListener(m, "click", () => onSelect(e));
      markersRef.current.push(m);
      bounds.extend(pos);
    });

    if (!bounds.isEmpty()) map.setBounds(bounds);
  }, [mapReady, sources, events, onSelect]);

  // 언마운트 시 마커 정리
  useEffect(() => {
    return () => {
      markersRef.current.forEach((m) => m.setMap(null));
    };
  }, []);

  if (error) {
    return (
      <div className="flex h-full items-center justify-center bg-gray-50 text-sm text-gray-400">
        지도를 불러오지 못했습니다.
      </div>
    );
  }
  return <div ref={ref} className="h-full w-full" />;
}
