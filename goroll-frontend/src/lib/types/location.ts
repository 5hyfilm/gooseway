// src/lib/types/location.ts

export const ACCESSIBILITY_FEATURES = [
  "parking",
  "entrance",
  "ramp",
  "pathway",
  "elevator",
  "restroom",
  "seating",
  "staffAssistance",
  "etc",
] as const;

export interface Review {
  id: number;
  locationId: number;
  userId: number;
  rating: number;
  reviewText: string;
  createdAt: string;
  updatedAt: string;
  user: {
    fullName: string;
    avatarUrl: string;
  };
}

export interface Image {
  id: number;
  imageUrl: string;
}

export interface FeatureMediaImage extends Image {
  // featureMediaId: number;
  featureId: number;
}

export interface LocationFeature {
  featureId: number;
  featureMediaId: number;
  isGood?: boolean | null;
  goodCount?: number;
  notGoodCount?: number;
  img: FeatureMediaImage[];
  imageFiles?: File[];
}

export interface LocationCategory {
  id: number;
  // name: "Shopping Mall" | "Public Transportation" | "Public Park" | "Restaurant";
  nameEn: string;
  nameTh: string;
}

export interface LocationAccessLevel {
  id: number;
  // name: "Hard to Access" | "Moderately Accessible" | "Easily Accessible"
  nameEn: string;
  nameTh: string;
}

export interface Location {
  id: number;
  name: string;
  accessLevelId: number;
  categoryId: number;
  description: string;
  latitude: string;
  longitude: string;
  createdAt?: string;
  updatedAt?: string;
  category: LocationCategory;
  accessLevel: LocationAccessLevel;
  isAutoStatus?: boolean;
}

type SortBy = {
  column: string;
  direction: "asc" | "desc";
};

export type LocationFindAllBody = {
  name: string;
  sortBy: SortBy[];
  limit: number;
  pageNumber: number;
};

export type LocationData = {
  id: number;
  name: string;
  accessLevelId: number;
  categoryId: number;
  description: string;
  latitude: string;
  longitude: string;
  createdAt?: string;
  updatedAt?: string;
  category: LocationCategory;
  accessLevel: LocationAccessLevel;
  reviews: Review[];
  img: Image[];
  featureMedia: LocationFeature[];
}

export type UpdateLocationBody = {
  id: number;
  name: string;
  accessLevelId: number;
  categoryId: number;
  description: string;
  latitude: string;
  longitude: string;
  imgLocationDelete: number[];
  imgLocationAdd: {
      imageUrl: string;
  }[],
  featureMedia: {
      featureId: number;
      imgDelete: number[];
      imgAdd: {
          imageUrl: string;
      }[];
  }[];
}

export type CreateLocationBody = {
  location: {
      categoryId: number;
      name: string;
      accessLevelId: number;
      description: string;
      latitude: string;
      longitude: string;
      imageUrl?: string[];
      isAutoStatus?: boolean;
  };
  features?: {
      featureId: number;
      imageUrl?: string[];
      imageFiles?: File[]; 
      isGood?: boolean  | null;
  }[];
  review?: {
      rating: number;
      reviewText?: string;
  };
}

export type LocationFindAllResult = {
  data: Location[];
  total: number;
};

export type AccessibilityFeature = (typeof ACCESSIBILITY_FEATURES)[number];

// เพิ่มเติม interface สำหรับสถานที่พร้อมระยะทาง (ใช้สำหรับการแสดงสถานที่ใกล้เคียง)
export interface LocationWithDistance extends Location {
  distance: number;
}

export type RateBody = {
  locationId: number;
  featureId: number;
  isGood: boolean | null;
};

export type ReviewBody = {
  id: number;
  rating: number;
  reviewText?: string;
};
