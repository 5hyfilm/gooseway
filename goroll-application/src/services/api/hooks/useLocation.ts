import {
  LocationDetailResponse,
  LocationListResponse,
  LocationFeatureResponse,
  LocationSearchList,
  LocationSearchParams,
} from "../types/location";
import {
  getLocations,
  getLocationDetail,
  getLocationFeatures,
  getLocationSearch,
  calculateLocationFeatures
} from "../models/Location";
import { useQuery, useMutation,useQueryClient } from "@tanstack/react-query";

export const useFetchLocations = () => {
  return useQuery<LocationListResponse[]>({
    queryKey: ["locations"],
    queryFn: getLocations,
  });
};

export const useFetchLocationById = (id: string) => {
  return useQuery<LocationDetailResponse>({
    queryKey: ["locationById", id],
    queryFn: () => getLocationDetail(id),
    enabled: !!id,
  });
};
  
export const useFetchLocationDetail = () => {
  return useMutation<LocationDetailResponse, Error, string>({
    mutationFn: (id: string) => getLocationDetail(id),
  });
};

export const useFetchLocationFeatures = (id: string) => {
  return useQuery<LocationFeatureResponse[]>({
    queryKey: ["locationFeatures", id],
    queryFn: () => getLocationFeatures(id),
    enabled: !!id,
  });
};

export const useSearchLocations = (params: LocationSearchParams) => {
  return useQuery<LocationSearchList>({
    queryKey: ["locationSearch", params],
    queryFn: () => getLocationSearch(params),
    enabled: !!params,
  });
};

export const useLocationSearch = () => {
  return useMutation<LocationSearchList, Error, LocationSearchParams>({
    mutationFn: (params: LocationSearchParams) => getLocationSearch(params),
  });
};

export const useCalculateLocationFeatures = () => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: (id: string) => calculateLocationFeatures(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["locationById"], exact: false });
      queryClient.invalidateQueries({ queryKey: ["locationDetail"], exact: false });
      queryClient.invalidateQueries({ queryKey: ["locations"], exact: false });
    },
  });
};
