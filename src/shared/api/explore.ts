export interface ShortsPlace {
  id: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  title: string;
  address: string;
  latitude: string;
  longitude: string;
  categoryHigh: string;
  categoryMiddle: string | null;
  categoryLow: string | null;
  shortsUrl: string;
  openingHours: string[];
  phoneNumber: string;
  pricePerPerson: number[];
  averagePrice: number;
  averageRating: string;
  bookmarks: { id: number }[];
  videoSrc?: string;
  heritageId?: string;
  holders?: string[];
  number?: string;
  description?: string;
}
