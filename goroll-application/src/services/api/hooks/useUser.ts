import {
  UserProfileResponse,
  UpdateUserProfileParams,
  UpdateWheelChairParams,
  UserFollowParams
} from "../types/user";
import {
  getUserProfile,
  updateUserProfile,
  updateWheelChair,
  followUser
} from "../models/User";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";

export const useFetchUserProfile = () => {
  return useQuery<UserProfileResponse>({
    queryKey: ["userProfile"],
    queryFn: getUserProfile,
  });
};

export const useUpdateUserProfile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: UpdateUserProfileParams) => updateUserProfile(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userProfile"], exact: false });
    },
  });
};

export const useUpdateWheelChair = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: UpdateWheelChairParams) => updateWheelChair(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userProfile"], exact: false });
    },
  });
};

export const useFollowUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: UserFollowParams) => followUser(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["postDetail"], exact: false });
      queryClient.invalidateQueries({ queryKey: ["userProfile"], exact: false });
    },
  });
}