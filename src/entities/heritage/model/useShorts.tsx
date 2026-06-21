"use client";
import { useState } from "react";
import { heritageList } from "@/entities/heritage/data/heritageList";

const useShorts = () => {
  const [bookmarks, setBookmarks] = useState<Record<string, boolean>>({});

  const LOCAL_VIDEOS = [
    "/video/01.mp4",
    "/video/02.mp4",
    "/video/03.mp4",
    "/video/04.mp4",
    "/video/05.mp4",
  ];

  const data = heritageList.slice(0, 5).map((h, i) => ({
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
    shortsUrl: LOCAL_VIDEOS[i],
    openingHours: [h.designatedAt],
    phoneNumber: "",
    pricePerPerson: [],
    averagePrice: 0,
    averageRating: h.likes.toString(),
    bookmarks: bookmarks[h.id] ? [{ id: i + 1 }] : [],
    videoSrc: LOCAL_VIDEOS[i],
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
