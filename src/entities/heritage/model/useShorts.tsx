"use client";
import useSWR from "swr";
import { apiUrl } from "@/shared/api/base";
import { heritageList } from "@/entities/heritage/data/heritageList";

interface ApiVideo {
  id: number;
  title: string;
  description?: string | null;
  category?: string | null;
  subCategory?: string | null;
  region?: string | null;
  url: string;
  heritageId?: string | null;
  createdAt: string;
}

const fetcher = (u: string) => fetch(u).then((r) => r.json());

const useShorts = () => {
  // 백엔드(R2 등록 영상) 목록으로 피드 구성
  const { data: videos, isLoading } = useSWR<ApiVideo[]>(
    apiUrl("/videos"),
    fetcher,
  );

  const data = (videos ?? []).map((v) => {
    // heritageId가 있으면 정적 heritage 데이터로 상세 정보 보강
    const h = v.heritageId
      ? heritageList.find((x) => x.id === v.heritageId)
      : undefined;

    return {
      id: v.id,
      createdAt: v.createdAt,
      updatedAt: "",
      deletedAt: null,
      title: v.title,
      address: v.region ?? h?.region ?? "",
      latitude: "",
      longitude: "",
      categoryHigh: v.category ?? h?.category ?? "",
      categoryMiddle: null,
      categoryLow: null,
      shortsUrl: v.url,
      openingHours: h ? [h.designatedAt] : [],
      phoneNumber: "",
      pricePerPerson: [],
      averagePrice: 0,
      averageRating: (h?.likes ?? 0).toString(),
      bookmarks: [],
      videoSrc: v.url,
      heritageId: v.heritageId ?? undefined,
      holders: h?.holders,
      number: h?.number,
      description: v.description ?? h?.description,
    };
  });

  return {
    data,
    isLoading,
    error: null,
    mutate: () => {},
    createBookmark: () => {},
    deleteBookmark: () => {},
  };
};

export default useShorts;
