import apiFetch from "../api";
import { 
  Route,
  RouteFindAllBody,
  RouteFindAllResult,
  createRouteBody
 } from "@/lib/types/routes";

export const findAllRoutes = async (body: RouteFindAllBody): Promise<RouteFindAllResult> => {
  const response = await apiFetch.post("/recordedRoute/admin/findAll", body);
  return response.data;
}

export const findRouteById = async (id: string): Promise<Route> => {
  const response = await apiFetch.get(`/recordedRoute/admin/findById/${id}`);
  return response.data;
}

export const deleteRouteById = async (id: string): Promise<void> => {
  await apiFetch.delete(`/recordedRoute/admin/delete/${id}`);
}

export const createRoute = async (route: createRouteBody): Promise<createRouteBody> => {
  const response = await apiFetch.post("/recordedRoute/admin/insert", route);
  return response.data;
}

export const updateVisibilityRoute = async (body: {id: number, isPublic: boolean}): Promise<void> => {
  const response = await apiFetch.post("/recordedRoute/visibility/", { 
    id: body.id,
    isPublic: body.isPublic
  });
  return response.data;
}

export const exportRoutes = async (): Promise<ArrayBuffer> => {
  const response = await apiFetch.post("/recordedRoute/admin/export", {}, {
    responseType: "arraybuffer",
  });
  return response.data;
};