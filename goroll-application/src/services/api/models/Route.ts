import { ENDPOINTS } from "../../../constants/endpoints";
import axiosInstance from "../api";
import {
  CreateRoutesParams,
  RouteListResponse,
  RouteDetailResponse,
  RouteListByUserResponse,
  RouteListByUserParams,
} from "../types/route";

export const createRoute = async (body: CreateRoutesParams) => {
  await axiosInstance.post(ENDPOINTS.ROUTE.CREATE_ROUTE, body);
};

export const getRoutes = async (): Promise<RouteListResponse[]> => {
  const { data } = await axiosInstance.get<RouteListResponse[]>(
    ENDPOINTS.ROUTE.GET_ROUTES
  );

  return data;
};

export const getRouteDetail = async (
  id: string
): Promise<RouteDetailResponse> => {
  const { data } = await axiosInstance.get<RouteDetailResponse>(
    `${ENDPOINTS.ROUTE.GET_ROUTE_DETAIL}/${id}`
  );

  return data;
};

export const getRoutesByUser = async (
  body: RouteListByUserParams
): Promise<RouteListByUserResponse> => {
  const { data } = await axiosInstance.post<RouteListByUserResponse>(
    ENDPOINTS.ROUTE.GET_ROUTES_BY_USER,
    body
  );
  return data;
};

export const getRoutesSearch = async (
  params: RouteListByUserParams
): Promise<RouteListByUserResponse> => {
  const { data } = await axiosInstance.post<RouteListByUserResponse>(
    ENDPOINTS.ROUTE.GET_ROUTES_SEARCH,
    params
  );
  return data;
};
