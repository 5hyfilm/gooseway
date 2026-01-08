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
import {
  getReviews,
  createReview,
  createReviewFeatures,
  getReviewFeatures,
  getReviewSummary,
  uploadReviewImage,
  LikeReviewFeatures,
  updateReview,
} from "../models/Review";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export const useFetchReviews = (
  body: ReviewsQueryParams,
  enabled: boolean = true
) => {
  return useQuery<ReviewResponse>({
    queryKey: ["reviews", body],
    queryFn: () => getReviews(body),
  });
};

export const useCreateReview = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: ReviewCreateParams) => createReview(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviews"], exact: false });
      queryClient.invalidateQueries({
        queryKey: ["reviewSummary"],
        exact: false,
      });
    },
  });
};

export const useCreateReviewFeatures = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: ReviewFeaturesCreateParams) =>
      createReviewFeatures(body),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["reviewFeatures"],
        exact: false,
      });
    },
  });
};

export const useFetchReviewFeatures = (body: ReviewFeatureParams) => {
  return useQuery<ReviewFeatureResponse>({
    queryKey: ["reviewFeatures", body],
    queryFn: () => getReviewFeatures(body),
  });
};

export const useFetchReviewSummary = (locationId: string) => {
  return useQuery<ReviewSummaryResponse>({
    queryKey: ["reviewSummary", locationId],
    queryFn: () => getReviewSummary(locationId),
    enabled: !!locationId,
  });
};

export const useUploadReviewImage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: ReviewImgPayload) => uploadReviewImage(body),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["reviewFeatures"],
        exact: false,
      });
    },
  });
};

export const useLikeReviewFeatures = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: ReviewLikePayload) => LikeReviewFeatures(body),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["reviewFeatures"],
        exact: false,
      });
      queryClient.invalidateQueries({
        queryKey: ["locationFeatures"],
        exact: false,
      });
    },
  });
};

export const useUpdateReview = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: ReviewUpdateParams) => updateReview(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviews"], exact: false });
      queryClient.invalidateQueries({
        queryKey: ["reviewSummary"],
        exact: false,
      });
    },
  });
};
