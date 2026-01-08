export type WheelChairData = {
  id: number;
  userId: number;
  isFoldable: boolean;
  widthRegularCm: number;
  lengthRegularCm: number;
  weightKg: number;
  widthFoldedCm: number;
  lengthFoldedCm: number;
  heightFoldedCm: number;
  notes: string;
  createdBy?: string;
  updatedBy?: string;
  createdAt?: string;
  updatedAt?: string;
};

type TagData = {
  postId: number;
  tag: string;
};

export type PostData = {
  id: number;
  userId: number;
  categoryId: number;
  statusId: number;
  title: string;
  content: string;
  latitude: string;
  longitude: string;
  createdAt: string;
  updatedAt: string;
  tags: TagData[];
};

export type RouteData = {
  id: number;
  userId: number;
  name: string;
  description: string;
  startLocationName: string;
  endLocationName: string;
  routeCoordinates: [number, number][]; // Array of [longitude, latitude]
  routeDate: string;
  time: number;
  totalDistanceMeters: number;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
};


export type UserProfileResponse = {
  id: number;
  roleId: number;
  statusId: number;
  email: string;
  passwordHash: string;
  fullName: string;
  phoneNumber: string;
  avatarUrl: string | null;
  createdBy: string | null;
  updatedBy: string;
  suspendedReason: string | null;
  suspendedBy: string | null;
  suspendedAt: string | null;
  createdAt: string;
  updatedAt: string;
  routeCount: string;
  postCount: string;
  followerCount: string;
  followingCount: string;
  wheelChair: WheelChairData;
  post: PostData[];
  route: RouteData[];
};

export type UpdateUserProfileParams = {
  id: number;
  email: string;
  fullName: string;
  phoneNumber: string;
  avatarUrl: string | null;
};

export type UpdateWheelChairParams = {
  userId: number;
  isFoldable: boolean;
  widthRegularCm: number;
  lengthRegularCm: number;
  weightKg: number;
  widthFoldedCm: number;
  lengthFoldedCm: number;
  heightFoldedCm: number;
  notes: string;
};

export type UserFollowParams = {
  follow: boolean;
  followingId: number;
};
