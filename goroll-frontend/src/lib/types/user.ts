// src/lib/types/user.ts
import { User, UserRole, UserStatus } from "@/data/users";

type SortBy = {
  column: string;
  direction: "asc" | "desc";
};

export type UserFindAllBody = {
  fullName: string;
  statusId: string | number;
  roleId: string | number;
  sortBy: SortBy[];
  limit: number;
  pageNumber: number;
};


export type UserFindAllResponse = {
  id: number;
  avatarUrl: string | null;
  email: string;
  fullName: string;
  phoneNumber: string;
  registeredAt: string;
  createdAt?: string | null;
  lastLogin: string | null;
  status: UserStatus;
  role: UserRole;
};

export type WheelchairInfo = {
  isFoldable: boolean | undefined;
  widthRegularCm?: number;
  lengthRegularCm?: number;
  weightKg?: number;
  widthFoldedCm?: number;
  lengthFoldedCm?: number;
  heightFoldedCm?: number;
  customizations?: string[];
  notes?: string;
}

export type UserWithWheelchair = User & {
  wheelChair: WheelchairInfo;
};

export type UpdateUserBody = {
  user: {
    id: number;
    email: string;
    fullName: string;
    avatarUrl?: string | null;
    phoneNumber?: string;
    statusId?: UserStatus["id"];
    roleId?: UserRole["id"];
  };
  wheelchair: WheelchairInfo;
};

export type CreateUserBody = {
  email: string;
  password: string;
  fullName: string;
  phoneNumber?: string;
  statusId?: UserStatus["id"];
  roleId?: UserRole["id"];
  avatarUrl?: string | null;
};

export type UserFindAllResult = {
  data: UserFindAllResponse[];
  total: number;
};