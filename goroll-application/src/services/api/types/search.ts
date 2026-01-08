type PostList = {
  id: number;
  userId: number;
  title: string;
  content: string;
  categoryId: number;
  statusId: number;
  latitude: string | null;
  longitude: string | null;
  createdAt: string;
  updatedAt: string;
  likeCount: string;
  commentCount: string;
  user: {
    id: number;
    fullName: string;
  };
  category: {
    id: number;
    nameTh: string;
  };
  tags: {
    postId: number;
    tag: string;
  }[];
  images: {
    id: number;
    imageUrl: string;
  }[];
};

type ObstacleList = {
  id: number;
  userId: number;
  subcategoryId: number;
  description: string;
  latitude: string;
  longitude: string;
  statusId: number;
  createdBy: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
  subcategory: {
    id: number;
    nameTh: string;
    nameEn: string;
    category: {
      id: number;
      nameTh: string;
      nameEn: string;
    };
  };
  status: {
    id: number;
    nameTh: string;
    nameEn: string;
  };
  user: {
    id: number;
    fullName: string;
  };
  img: {
    id: number;
    imageUrl: string;
  }[];
};

type LocationList = {
  id: number;
  categoryId: number;
  name: string;
  accessLevelId: number;
  description: string;
  latitude: string;
  longitude: string;
  createdAt: string;
  updatedAt: string;
  category: {
    id: number;
    nameEn: string;
    nameTh: string;
  };
  accessLevel: {
    id: number;
    nameEn: string;
    nameTh: string;
  };
  img: {
    id: number;
    imageUrl: string;
  }[];
};

type RecordRouteList = {
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
  user: {
    id: number;
    fullName: string;
  };
  img: {
    id: number;
    imageUrl: string;
  }[];
};

type SortOption = {
  column: string;
  direction: string;
};

export type SearchParams = {
  keyword: string;
  sortBy: SortOption[];
  limit: number;
  pageNumber: number;
};

export type SearchResponse = {
  data: {
    posts: PostList[];
    obstacles: ObstacleList[];
    locations: LocationList[];
    recordRoutes: RecordRouteList[];
  };
  total: {
    posts: number;
    obstacles: number;
    locations: number;
    recordRoutes: number;
  };
};
