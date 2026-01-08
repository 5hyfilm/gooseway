export type SortOption = {
  column: string;
  direction: "asc" | "desc";
};

export type ReviewsQueryParams = {
  locationId: number;
  last24hrs: boolean;
  sortBy: SortOption[];
  limit: number;
  pageNumber: number;
};

type ReviewUser = {
  fullName: string;
  avatarUrl: string;
  createdAt: string;
};

export type ReviewData = {
  id: number;
  locationId: number;
  userId: number;
  rating: number;
  reviewText: string;
  createdAt: string;
  updatedAt: string;
  user: ReviewUser;
};

export type ReviewResponse = {
  data: ReviewData[];
  total: number;
};

export type ReviewCreateParams = {
  review: {
    locationId: number;
    rating: number;
    reviewText: string;
  };
};

export type ReviewFeaturesCreateParams = {
  features: {
    locationId: string;
    featureId: string;
    imageUrl: string[];
    isGood: boolean;
  };
};

export type ReviewFeatureParams = {
  locationId: string;
  featureId: string;
  last24hrs: boolean;
  sortBy: SortOption[];
  limit: number;
  pageNumber: number;
};

export type ReviewFeatureUser = {
  fullName: string;
  avatarUrl: string;
};

export type ReviewFeatureItem = {
  imgId: number;
  imgUrl: string;
};

export type ReviewFeatureResponse = {
  data: {
    img: ReviewFeatureItem[];
    isGoodCount: string;
    isNotGoodCount: string;
    isLike: boolean | null;
  };
  total: number;
};

type ReviewSummaryData = {
  rating: number;
  count: string;
};

export type ReviewSummaryResponse = {
  avg: {
    averagerating: number;
    reviewcount: string;
  };
  data: ReviewSummaryData[];
};

type ReviewFeatureImg = {
  locationId: string;
  featureId: string;
  imageUrl: string[];
};

export type ReviewImgPayload = {
  features: ReviewFeatureImg;
};

type ReviewLike = {
  locationId: string;
  featureId: string;
  isGood: boolean;
};

export type ReviewLikePayload = {
  features: ReviewLike;
};

export type ReviewUpdateParams = {
  id: number;
  rating: number;
  reviewText: string;
};
