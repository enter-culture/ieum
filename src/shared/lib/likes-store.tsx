"use client";
import { createContext, useContext, useState, useEffect, useCallback } from "react";

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
  const [likes, setLikes] = useState<Record<number, LikedItem>>({});

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setLikes(JSON.parse(stored));
    } catch {}
  }, []);

  const toggleLike = useCallback((item: LikedItem) => {
    setLikes((prev) => {
      const next = { ...prev };
      if (next[item.id]) {
        delete next[item.id];
      } else {
        next[item.id] = { ...item, likedAt: Date.now() };
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const isLiked = useCallback((id: number) => !!likes[id], [likes]);

  const likedList = Object.values(likes).sort((a, b) => b.likedAt - a.likedAt);

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
