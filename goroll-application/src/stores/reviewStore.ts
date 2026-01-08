import { create } from "zustand";
import { ReviewUpdateParams } from "../services/api/types/review";

type ReviewState = {
  reviews: ReviewUpdateParams | null;
  setReviews: (reviews: ReviewUpdateParams | null) => void;
};

export const useReviewStore = create<ReviewState>((set) => ({
  reviews: null,
  setReviews: (reviews) => set({ reviews }),
}));
