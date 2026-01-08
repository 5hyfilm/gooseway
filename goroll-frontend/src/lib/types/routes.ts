// src/lib/types/routes.ts

export interface RouteUser {
  id: number;
  fullName: string;
}

export interface Route {
  id: number;
  userId: number;
  name: string;
  description: string;
  totalDistanceMeters: number;
  startLocationName: string;
  endLocationName: string;
  routeCoordinates: [number, number][];
  time: number;
  routeDate: string;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string; 
  user: RouteUser;
}

type SortBy = {
  column: string;
  direction: "asc" | "desc";
};

export type RouteFindAllBody = {
  name: string;
  sortBy: SortBy[];
  limit: number;
  pageNumber: number;
};

export type RouteFindAllResult = {
  data: Route[];
  total: number;
};

export type createRouteBody = {
  name: string;
  description?: string;
  routeCoordinates: [number, number][];
  time: number;
  isPublic: boolean;
  routeDate: string;
  startLocationName: string;
  endLocationName: string;
  totalDistanceMeters: number;
}