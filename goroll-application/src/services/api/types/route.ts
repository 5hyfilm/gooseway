export type CreateRoutesParams = {
  name: string;
  description: string;
  totalDistanceMeters: number;
  startLocationName: string;
  endLocationName: string;
  time: number;
  isPublic: boolean;
  routeDate: string;
  routeCoordinates: [number, number][]; // Array of [longitude, latitude]
};

export type RouteListResponse = {
  id: number;
  name: string;
  routeCoordinates: [number, number][]; // Array of [longitude, latitude]
};

export type RouteDetailResponse = {
  id: number;
  userId: number;
  name: string;
  description: string;
  totalDistanceMeters: number;
  startLocationName: string;
  endLocationName: string;
  routeCoordinates: [number, number][]; // Array of [longitude, latitude]
  time: number;
  routeDate: string;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
  user: {
    id: number;
    fullName: string;
  };
};

type SortOption = {
  column: string;
  direction: string;
};

export type RouteListByUserParams = {
  name: string;
  sortBy: SortOption[];
  limit: number;
  pageNumber: number;
};


export type RouteListByUserData = {
  id: number;
  name: string;
  startLocationName: string;
  endLocationName: string;
  totalDistanceMeters: number;
  time: number;
  createdAt: string;
}

export type RouteListByUserResponse = {
  data: RouteListByUserData[];
  total: number;
};
