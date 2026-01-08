import apiFetch from "../api";
import {
  LocationData,
  LocationFindAllBody,
  LocationFindAllResult,
  CreateLocationBody,
  UpdateLocationBody,
  LocationCategory,
  ReviewBody,
  RateBody,
} from "@/lib/types/location";

export const findAllLocations = async (
  body: LocationFindAllBody
): Promise<LocationFindAllResult> => {
  const response = await apiFetch.post("/location/admin/findAll", body);
  return {
    data: response.data.data,
    total: response.data.total,
  };
};

export const getLocationCategory = async (): Promise<
  Array<LocationCategory>
> => {
  const response = await apiFetch.get("locationCategory/findAll");
  return response.data;
};

export const getLocationById = async (id: number): Promise<LocationData> => {
  const response = await apiFetch.get(`/location/admin/findById/${id}`);
  return response.data;
};

export const createLocation = async (
  body: CreateLocationBody
): Promise<CreateLocationBody> => {
  const response = await apiFetch.post("/location/admin/insert", body);
  return response.data;
};

export const updateLocation = async (
  body: UpdateLocationBody
): Promise<UpdateLocationBody> => {
  const response = await apiFetch.post("/location/admin/updateLocation", body);

  return response.data;
};

export const deleteLocation = async (id: number): Promise<void> => {
  await apiFetch.delete(`/location/admin/delete/${id}`);
};

export const deleteReview = async (id: number): Promise<void> => {
  await apiFetch.delete(`/location/admin/deleteReviewById/${id}`);
};

export const exportLocations = async (): Promise<ArrayBuffer> => {
  const response = await apiFetch.post(
    "/location/admin/export",
    {},
    {
      responseType: "arraybuffer",
    }
  );
  return response.data;
};

export const updateRate = async (body: RateBody): Promise<void> => {
  await apiFetch.post("location/featureLocationReview", {
    features: body,
  });
};

export const updateReview = async (body: ReviewBody): Promise<void> => {
  await apiFetch.post("location/updateReview", body);
};

export const calculateLocationFeatures = async (
  id: string
): Promise<{ status: number }> => {
  const res = await apiFetch.get(`/location/calculateAccessibility/${id}`);
  return res.data;
};
