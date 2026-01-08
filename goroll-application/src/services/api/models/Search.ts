import { ENDPOINTS } from "../../../constants/endpoints";
import { SearchResponse, SearchParams } from "../types/search";
import axiosInstance from "../api";

export const searchGlobal = async (
  params: SearchParams
): Promise<SearchResponse> => {
  const { data } = await axiosInstance.post<SearchResponse>(
    ENDPOINTS.SEARCH.SEARCH,
    params
  );

  return data;
};
