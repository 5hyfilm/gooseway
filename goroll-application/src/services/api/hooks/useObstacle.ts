import {
  CreateObstacleParams,
  ObstacleListResponse,
  ObstacleDetilResponse,
  ObstacleConfirmationParams,
  ObstacleSearchResponse,
  ObstacleSearchParams,
} from "../types/obstacle";
import {
  createObstacle,
  getObstacles,
  getStatusOnObstacle,
  getCategoriesOnObstacle,
  getSubCategoriesOnObstacle,
  getObstacleDetail,
  updateObstacleConfirmation,
  searchObstacles,
  checkResolve,
} from "../models/Obstacle";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useCreateObstacle = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateObstacleParams) => createObstacle(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["obstacles"], exact: false });
    },
  });
};

export const useFetchObstacles = () => {
  return useQuery<ObstacleListResponse[]>({
    queryKey: ["obstacles"],
    queryFn: getObstacles,
  });
};

export const useFetchObstacleDetail = () => {
  return useMutation<ObstacleDetilResponse, Error, string>({
    mutationFn: (id: string) => getObstacleDetail(id),
  });
};

export const useFetchObstacleStatus = () => {
  return useQuery({
    queryKey: ["obstacleStatus"],
    queryFn: getStatusOnObstacle,
  });
};

export const useFetchObstacleCategories = () => {
  return useQuery({
    queryKey: ["obstacleCategories"],
    queryFn: getCategoriesOnObstacle,
  });
};

export const useFetchObstacleSubCategories = (categoryId: number) => {
  return useQuery({
    queryKey: ["obstacleSubCategories", categoryId],
    queryFn: () => getSubCategoriesOnObstacle(categoryId),
    enabled: !!categoryId,
  });
};

export const useUpdateObstacleConfirmation = () => {
  return useMutation({
    mutationFn: (body: ObstacleConfirmationParams) =>
      updateObstacleConfirmation(body),
  });
};

export const useSearchObstacles = (params: ObstacleSearchParams) => {
  return useQuery({
    queryKey: ["obstaclesSearch", params],
    queryFn: () => searchObstacles(params),
  });
};

export const useCheckResolve = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => checkResolve(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["obstacles"], exact: false });
    },
  });
};
