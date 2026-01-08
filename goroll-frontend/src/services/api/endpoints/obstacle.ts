import apiFetch from "../api";
import { 
  ObstacleFindAllBody, 
  LocationFindAllResult, 
  ObstacleById, 
  updateObstacleBody, 
  CreateObstacleBody,
  ObstacleCategory
 } from "@/lib/types/obstacle";

export const findAllObstacles = async (body: ObstacleFindAllBody): Promise<LocationFindAllResult> => {
    const response = await apiFetch.post("/obstacle/admin/findAll", body);
    return {
      data: response.data.data,
      total: response.data.total,
    };
}

export const getObstacleCategory = async (): Promise<Array<ObstacleCategory>> => {
  const response = await apiFetch.get("obstacleCategory/findAll");
  return response.data;
}

export const getSubObstacleCategory = async (id: number): Promise<Array<ObstacleCategory>> => {
  const response = await apiFetch.get(`obstacleSubCategory/findByCategoryId/${id}`);
  return response.data;
}

export const findObstacleById = async (id: number): Promise<ObstacleById> => {
  const response = await apiFetch.get(`/obstacle/admin/findById/${id}`);
  return response.data;
};

export const updateObstacle = async (body: Partial<updateObstacleBody>): Promise<updateObstacleBody> => {
  const response = await apiFetch.post("/obstacle/admin/update", body);
  return response.data;
};

export const createObstacle = async (body: Partial<CreateObstacleBody>): Promise<CreateObstacleBody> => {
  const response = await apiFetch.post("/obstacle/admin/insert", body);
  return response.data;
};

export const deleteObstacle = async (id: number): Promise<void> => {
  await apiFetch.delete(`/obstacle/admin/delete/${id}`);
};

export const exportObstacles = async (): Promise<ArrayBuffer> => {
  const response = await apiFetch.post("/obstacle/admin/export", {}, {
    responseType: "arraybuffer",
  });
  return response.data;
};