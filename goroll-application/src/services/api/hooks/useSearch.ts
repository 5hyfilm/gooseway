import { useQuery } from "@tanstack/react-query";
import { searchGlobal } from "../models/Search";
import { SearchResponse, SearchParams } from "../types/search";

export const useFetchGlobalSearch = (params: SearchParams) => {
  return useQuery<SearchResponse, Error>({
    queryKey: ["globalSearch", params],
    queryFn: () => searchGlobal(params),
  });
};