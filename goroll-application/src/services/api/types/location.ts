export type Category = {
  id: number;
  name: string;
};

export type AccessLevel = {
  id: number;
  name: string;
};

export type LocationListResponse = {
  id: number;
  name: string;
  latitude: string;
  longitude: string;
  description: string;
  accessLevelId: number;
  categoryId: number;
  accessLevel: SectionResponse;
  category: SectionResponse;
  img: {
    id: number;
    imageUrl: string;
  }[];
};

export type SectionResponse = {
  id: number;
  nameEn: string;
  nameTh: string;
};

export type LocationDetailResponse = {
  id: number;
  name: string;
  latitude: string;
  longitude: string;
  description: string;
  accessLevelId: number;
  accessLevelName: string;
  accessLevel: SectionResponse;
  categoryId: number;
  categoryName: string;
  category: SectionResponse;
  reviewCount: string;
  averageRating: number;
  img: string[];
};

export type LocationFeatureResponse = {
  featureId: number;
  isGoodCount: number;
  isNotGoodCount: number;
  nameEn: string;
  nameTh: string;
};

type SortOption = {
  column: string;
  direction: string;
};

export type LocationSearchParams = {
  name: string;
  categoryId?: string;
  accessLevelId?: string;
  sortBy?: SortOption[];
  limit: number;
  pageNumber: number;
};

export type LocationSearchList = {
  data: LocationListResponse[];
  total: number;
};
