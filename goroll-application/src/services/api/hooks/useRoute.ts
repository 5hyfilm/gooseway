import {
  CreateRoutesParams,
  RouteDetailResponse,
  RouteListResponse,
  RouteListByUserResponse,
  RouteListByUserParams,
} from "../types/route";
import {
  createRoute,
  getRouteDetail,
  getRoutes,
  getRoutesByUser,
  getRoutesSearch
} from "../models/Route";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useCreateRoute = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateRoutesParams) => createRoute(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["routes"], exact: false });
    },
  });
};

export const useFetchRoutes = () => {
  return useQuery<RouteListResponse[]>({
    queryKey: ["routes"],
    queryFn: getRoutes,
  });
};

export const useFetchRouteDetail = () => {
  return useMutation<RouteDetailResponse, Error, string>({
    mutationFn: (id: string) => getRouteDetail(id),
  });
};

export const useQueryRouteDetail = (routeId: string) => {
  return useQuery<RouteDetailResponse>({
    queryKey: ["routeDetail", routeId],
    queryFn: () => getRouteDetail(routeId),
  });
};

export const useFetchRoutesByUser = (params: RouteListByUserParams) => {
  return useQuery<RouteListByUserResponse>({
    queryKey: ["routesByUser", params],
    queryFn: () => getRoutesByUser(params),
  });
};

export const useSearchRoutes = (params: RouteListByUserParams) => {
  const queryClient = useQueryClient();

  return useQuery<RouteListByUserResponse>({
    queryKey: ["searchRoutes", params],
    queryFn: () => getRoutesSearch(params),
  });
};
