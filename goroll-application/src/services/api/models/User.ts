import { ENDPOINTS } from "../../../constants/endpoints";
import axiosInstance from "../api";
import {
  UserProfileResponse,
  UpdateUserProfileParams,
  UpdateWheelChairParams,
  UserFollowParams
} from "../types/user";

export const getUserProfile = async (): Promise<UserProfileResponse> => {
  const { data } = await axiosInstance.get<UserProfileResponse>(
    ENDPOINTS.USER.GET_USER
  );
  return data;
};

export const updateUserProfile = async (body: UpdateUserProfileParams) => {
  await axiosInstance.post<UserProfileResponse>(
    ENDPOINTS.USER.UPDATE_USER,
    body
  );
};

export const updateWheelChair = async (body: UpdateWheelChairParams) => {
  await axiosInstance.post<UserProfileResponse>(
    ENDPOINTS.USER.UPDATE_WHEEL_CHAIR,
    body
  );
};

export const followUser = async (body: UserFollowParams) => {
  await axiosInstance.post<UserProfileResponse>(
    ENDPOINTS.USER.FOLLOW_USER,
    body
  );
};
