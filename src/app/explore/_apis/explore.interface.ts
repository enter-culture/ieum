export interface ShortsPlace {
  id: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: null | string;
  title: string;
  address: string;
  latitude: string;
  longitude: string;
  categoryHigh: string;
  categoryMiddle: null | string;
  categoryLow: null | string;
  shortsUrl: string;
  openingHours: string[];
  phoneNumber: string;
  pricePerPerson: string[];
  averagePrice: number;
  averageRating: string;
  bookmarks: { id: number }[];
  videoSrc: string;
  heritageId: string;
  holders: string[];
  number: string;
  description: string;
}
