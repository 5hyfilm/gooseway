import { ENDPOINTS } from "../../../constants/endpoints";
import axiosInstance from "../api";
import {
  LocationDetailResponse,
  LocationListResponse,
  LocationFeatureResponse,
  LocationSearchList,
  LocationSearchParams,
} from "../types/location";

export const getLocations = async (): Promise<LocationListResponse[]> => {
  const { data } = await axiosInstance.get<LocationListResponse[]>(
    ENDPOINTS.LOCATION.GET_LOCATIONS
  );

  return data;
};

export const getLocationDetail = async (
  id: string
): Promise<LocationDetailResponse> => {
  const { data } = await axiosInstance.get<LocationDetailResponse>(
    `${ENDPOINTS.LOCATION.GET_LOCATION_DETAIL}/${id}`
  );

  return data;
};

export const getLocationFeatures = async (
  id: string
): Promise<LocationFeatureResponse[]> => {
  const { data } = await axiosInstance.get<LocationFeatureResponse[]>(
    `${ENDPOINTS.LOCATION.GET_LOCATION_FEATURES}/${id}`
  );

  return data;
};

export const getLocationSearch = async (
  params: LocationSearchParams
): Promise<LocationSearchList> => {
  const { data } = await axiosInstance.post<LocationSearchList>(
    ENDPOINTS.LOCATION.GET_LOCATION_SEARCH,
    params
  );

  return data;
};

export const calculateLocationFeatures = async (id: string): Promise<void> => {
  await axiosInstance.get(
    `${ENDPOINTS.LOCATION.CALCULATE_LOCATION_FEATURES}/${id}`
  );
};
