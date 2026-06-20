"use client";
import { useState } from "react";
import { heritageList } from "@/data/heritage";

const useShorts = () => {
  const [bookmarks, setBookmarks] = useState<Record<string, boolean>>({});

  const data = heritageList.map((h, i) => ({
    id: i + 1,
    createdAt: "",
    updatedAt: "",
    deletedAt: null,
    title: h.name,
    address: h.region,
    latitude: "",
    longitude: "",
    categoryHigh: h.category,
    categoryMiddle: null,
    categoryLow: null,
    shortsUrl: h.videoSrc,
    openingHours: [h.designatedAt],
    phoneNumber: "",
    pricePerPerson: [],
    averagePrice: 0,
    averageRating: h.likes.toString(),
    bookmarks: bookmarks[h.id] ? [{ id: i + 1 }] : [],
    videoSrc: h.videoSrc,
    heritageId: h.id,
    holders: h.holders,
    number: h.number,
    description: h.description,
  }));

  const createBookmark = (placeId: number) => {
    const heritage = heritageList[placeId - 1];
    if (heritage) setBookmarks(prev => ({ ...prev, [heritage.id]: true }));
  };

  const deleteBookmark = (placeId: number) => {
    const heritage = heritageList[placeId - 1];
    if (heritage) setBookmarks(prev => ({ ...prev, [heritage.id]: false }));
  };

  return { data, isLoading: false, error: null, mutate: () => {}, createBookmark, deleteBookmark };
};

export default useShorts;
