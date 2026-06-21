"use client";
import { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import { useAuth } from "@/shared/lib/auth-store";
import { addLike, fetchLikes, removeLike } from "@/shared/api/likes";

interface LikedItem {
  id: number;
  title: string;
  address: string;
  categoryHigh: string;
  videoSrc: string;
  heritageId?: string;
  likedAt: number;
}

interface LikesContextType {
  likes: Record<number, LikedItem>;
  isLiked: (id: number) => boolean;
  toggleLike: (item: LikedItem) => void;
  likedList: LikedItem[];
}

const LikesContext = createContext<LikesContextType | null>(null);
const STORAGE_KEY = "ieum_likes";

export function LikesProvider({ children }: { children: React.ReactNode }) {
  const { isLoggedIn } = useAuth();
  const [likes, setLikes] = useState<Record<number, LikedItem>>({});

  // 로그인 상태: 백엔드에서 목록 로드 / 비로그인: localStorage
  useEffect(() => {
    if (isLoggedIn) {
      fetchLikes()
        .then((list) => {
          const map: Record<number, LikedItem> = {};
          for (const l of list) {
            map[l.shortsId] = {
              id: l.shortsId,
              title: l.title,
              address: l.address ?? "",
              categoryHigh: l.categoryHigh ?? "",
              videoSrc: l.videoSrc ?? "",
              heritageId: l.heritageId ?? undefined,
              likedAt: new Date(l.createdAt).getTime(),
            };
          }
          setLikes(map);
        })
        .catch(() => {});
    } else {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        setLikes(stored ? JSON.parse(stored) : {});
      } catch {}
    }
  }, [isLoggedIn]);

  const toggleLike = useCallback(
    (item: LikedItem) => {
      setLikes((prev) => {
        const next = { ...prev };
        const willLike = !next[item.id];
        if (willLike) {
          next[item.id] = { ...item, likedAt: Date.now() };
        } else {
          delete next[item.id];
        }

        if (isLoggedIn) {
          // 백엔드에 저장 (실패해도 UI는 유지, 다음 로드 때 동기화)
          if (willLike) {
            addLike({
              shortsId: item.id,
              title: item.title,
              address: item.address,
              categoryHigh: item.categoryHigh,
              videoSrc: item.videoSrc,
              heritageId: item.heritageId,
            }).catch(() => {});
          } else {
            removeLike(item.id).catch(() => {});
          }
        } else {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        }
        return next;
      });
    },
    [isLoggedIn],
  );

  const isLiked = useCallback((id: number) => !!likes[id], [likes]);

  const likedList = useMemo(
    () => Object.values(likes).sort((a, b) => b.likedAt - a.likedAt),
    [likes],
  );

  return (
    <LikesContext.Provider value={{ likes, isLiked, toggleLike, likedList }}>
      {children}
    </LikesContext.Provider>
  );
}

export function useLikes() {
  const ctx = useContext(LikesContext);
  if (!ctx) throw new Error("useLikes must be used within LikesProvider");
  return ctx;
}
