import { ENDPOINTS } from "../../../constants/endpoints";
import axiosInstance from "../api";
import {
  CreateObstacleParams,
  ObstacleListResponse,
  ObstacleDetilResponse,
  ObstacleConfirmationParams,
  ObstacleStatusResponse,
  ObstacleSearchResponse,
  ObstacleSearchParams,
} from "../types/obstacle";

export const createObstacle = async (body: CreateObstacleParams) => {
  await axiosInstance.post(ENDPOINTS.OBSTACLE.CREATE_OBSTACLE, body);
};

export const getObstacles = async (): Promise<ObstacleListResponse[]> => {
  const { data } = await axiosInstance.get<ObstacleListResponse[]>(
    ENDPOINTS.OBSTACLE.GET_OBSTACLES
  );

  return data;
};

export const getObstacleDetail = async (
  id: string
): Promise<ObstacleDetilResponse> => {
  const { data } = await axiosInstance.get<ObstacleDetilResponse>(
    `${ENDPOINTS.OBSTACLE.GET_OBSTACLE_DETAIL}/${id}`
  );
  return data;
};

export const getStatusOnObstacle = async (): Promise<
  ObstacleStatusResponse[]
> => {
  const { data } = await axiosInstance.get<ObstacleStatusResponse[]>(
    ENDPOINTS.OBSTACLE.GET_STATUS
  );
  return data;
};

export const getCategoriesOnObstacle = async (): Promise<
  ObstacleStatusResponse[]
> => {
  const { data } = await axiosInstance.get<ObstacleStatusResponse[]>(
    ENDPOINTS.OBSTACLE.GET_CATEGORIES
  );
  return data;
};

export const getSubCategoriesOnObstacle = async (
  categoryId: number
): Promise<ObstacleStatusResponse[]> => {
  const { data } = await axiosInstance.get<ObstacleStatusResponse[]>(
    `${ENDPOINTS.OBSTACLE.GET_SUBCATEGORIES}/${categoryId}`
  );
  return data;
};

export const updateObstacleConfirmation = async (
  body: ObstacleConfirmationParams
): Promise<void> => {
  await axiosInstance.post(ENDPOINTS.OBSTACLE.UPDATE_CONFIRMATION, body);
};

export const searchObstacles = async (
  params: ObstacleSearchParams
): Promise<ObstacleSearchResponse> => {
  const { data } = await axiosInstance.post<ObstacleSearchResponse>(
    ENDPOINTS.OBSTACLE.GET_OBSTACLES_SEARCH,
    params
  );
  return data;
};

export const checkResolve = async (id: string): Promise<void> => {
  await axiosInstance.get(`${ENDPOINTS.OBSTACLE.CHECK_RESOLVE}/${id}`);
};
