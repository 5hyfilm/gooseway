import { ENDPOINTS } from "../../../constants/endpoints";
import axiosInstance from "../api";
import {
  ReviewResponse,
  ReviewsQueryParams,
  ReviewCreateParams,
  ReviewFeaturesCreateParams,
  ReviewFeatureResponse,
  ReviewFeatureParams,
  ReviewSummaryResponse,
  ReviewImgPayload,
  ReviewLikePayload,
  ReviewUpdateParams,
} from "../types/review";

export const getReviews = async (
  body: ReviewsQueryParams
): Promise<ReviewResponse> => {
  const { data } = await axiosInstance.post<ReviewResponse>(
    ENDPOINTS.REVIEW.GET_REVIEWS,
    body
  );

  return data;
};

export const createReview = async (
  body: ReviewCreateParams
): Promise<ReviewResponse> => {
  const { data } = await axiosInstance.post<ReviewResponse>(
    ENDPOINTS.REVIEW.CREATE_REVIEW,
    body
  );

  return data;
};

export const createReviewFeatures = async (
  body: ReviewFeaturesCreateParams
): Promise<ReviewResponse> => {
  const { data } = await axiosInstance.post<ReviewResponse>(
    ENDPOINTS.REVIEW.CREATE_REVIEW_FEATURES,
    body
  );

  return data;
};

export const LikeReviewFeatures = async (
  body: ReviewLikePayload
): Promise<void> => {
  await axiosInstance.post(ENDPOINTS.REVIEW.CREATE_REVIEW_FEATURES, body);
};

export const getReviewFeatures = async (
  body: ReviewFeatureParams
): Promise<ReviewFeatureResponse> => {
  const { data } = await axiosInstance.post<ReviewFeatureResponse>(
    ENDPOINTS.REVIEW.GET_REVIEW_FEATURES,
    body
  );

  return data;
};

export const getReviewSummary = async (
  locationId: string
): Promise<ReviewSummaryResponse> => {
  const { data } = await axiosInstance.get<ReviewSummaryResponse>(
    `${ENDPOINTS.REVIEW.GET_REVIEW_SUMMARY}/${locationId}`
  );

  return data;
};

export const uploadReviewImage = async (
  body: ReviewImgPayload
): Promise<void> => {
  await axiosInstance.post(ENDPOINTS.REVIEW.UPLOAD_REVIEW_IMAGE, body);
};

export const updateReview = async (body: ReviewUpdateParams): Promise<void> => {
  await axiosInstance.post(ENDPOINTS.REVIEW.UPDATE_REVIEW, body);
};
