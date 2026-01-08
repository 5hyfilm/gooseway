import { ActivityFindAllBody } from "@/lib/types/dashboard";
import apiFetch from "../api";

export const getDashboardData = async (day: string) => {
  const response = await apiFetch.post("/dashboard",{
    day: day,
  });
  return response.data;
};

export const findAllActivities = async (body: ActivityFindAllBody) => {
  const response = await apiFetch.post("/dashboard/log", body);
  return response.data;
};