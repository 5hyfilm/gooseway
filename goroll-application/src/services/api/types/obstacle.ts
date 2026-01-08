export type CreateObstacleParams = {
  obstacle: {
    subcategoryId: number;
    description: string;
    latitude: string;
    longitude: string;
    statusId: number;
  };
  imageUrl: string[];
};

export type ObstacleListResponse = {
  id: number;
  latitude: string;
  longitude: string;
  description: string;
};

export type ObstacleStatusResponse = {
  id: number;
  nameEn: string;
  nameTh: string;
};

export type ObstacleDetilResponse = {
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
  isConfirmed: number;
  isAvailableCount: string;
  isEditedCount: string;
  img: string[];
  user: {
    id: number;
    fullName: string;
  };
  subcategory: {
    id: number;
    nameEn: string;
    nameTh: string;
    category: {
      id: number;
      nameEn: string;
      nameTh: string;
    };
  };
};

export type ObstacleConfirmationParams = {
  obstacleId: number;
  statusId: number;
};

export type ObstacleSearchList = {
  id: number;
  userId: number;
  subcategoryId: number;
  description: string;
  latitude: string;
  longitude: string;
  statusId: number;
  createdBy: string;
  updatedBy: string;
  createdAt: string; // ISO Date string
  updatedAt: string; // ISO Date string
  subcategory: {
    id: number;
    nameEn: string;
    nameTh: string;
    category: {
      id: number;
      nameEn: string;
      nameTh: string;
    };
  };
  status: {
    id: number;
    nameEn: string;
    nameTh: string;
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

export type ObstacleSearchResponse = {
  data: ObstacleSearchList[];
  total: number;
};

export type ObstacleSearchParams = {
  categoryId: string;
  statusId: string;
  description: string;
  sortBy: {
    column: string;
    direction: string;
  }[];
  limit: number;
  pageNumber: number;
};
