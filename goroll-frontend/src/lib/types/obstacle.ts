// src/lib/types/obstacle.ts

// ข้อมูล Category พร้อมไอคอนและคำอธิบาย
export const OBSTACLE_CATEGORIES = {
  "Sidewalk Issues": {
    id: 1,
    label: "ปัญหาทางเท้า",
    icon: "🛑",
    types: [
      { value: 1, label: "พื้นผิวขรุขระ/ชำรุด" },
      { value: 2, label: "ท่อระบายน้ำชำรุด/ฝาท่อหาย" },
      { value: 3, label: "ทางเท้าแคบเกินไป" },
      { value: 4, label: "ไม่มีทางลาดขึ้น-ลง" },
    ],
  },
  "Permanent Obstacles": {
    id: 2,
    label: "อุปสรรคถาวร",
    icon: "🚧",
    types: [
      { value: 5, label: "เสาไฟฟ้า/เสาป้าย" },
      { value: 6, label: "สะพานลอยที่ไม่มีลิฟต์/ทางลาด" },
      { value: 7, label: "จุดก่อสร้างถาวร" },
    ],
  },
  "Temporary Obstacles": {
    id: 3,
    label: "อุปสรรคชั่วคราว",
    icon: "⚠️",
    types: [
      { value: 8, label: "ยานพาหนะบนทางเท้า" },
      { value: 9, label: "วัสดุก่อสร้าง" },
      { value: 10, label: "ถังขยะ" },
    ],
  },
  "ETC.": {
    id: 4,
    label: "อื่นๆ",
    icon: "❓",
    types: [{ value: 11, label: "อื่นๆ" }],
  },
} as const;

export type ObstacleKey = keyof typeof OBSTACLE_CATEGORIES;

export const CATEGORY_ICONS: Record<string, string> = {
  "Sidewalk Issues": "🛑",
  "Permanent Obstacles": "🚧", 
  "Temporary Obstacles": "⚠️",
  "ETC.": "❓"
};

// Image type
export interface ObstacleImage {
  id: number;
  imageUrl: string;
}

// User type
export interface ObstacleUser {
  id: number;
  fullName: string;
}

// Category type
export interface ObstacleCategory {
  id: number;
  nameEn: string;
  nameTh: string;
}

// Subcategory type
export interface ObstacleSubcategory {
  id: number;
  nameEn: string;
  nameTh: string;
  category: ObstacleCategory;
}

// Status type (only in getAll)
export interface ObstacleStatus {
  id: number;
  nameEn: string;
  nameTh: string;
}

export interface Obstacle {
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
  subcategory: ObstacleSubcategory;
  user: ObstacleUser;
}

type SortBy = {
  column: string;
  direction: "asc" | "desc";
};

export type ObstacleFindAllBody = {
  description: string;
  sortBy: SortBy[];
  limit: number;
  pageNumber: number;
};

export interface ObstacleFindAllResponse extends Obstacle {
  status: ObstacleStatus;
}

export interface ObstacleById extends Obstacle {
  isAvailable: string;
  isEdited: string;
  img: ObstacleImage[];
}

export type LocationFindAllResult = {
  data: ObstacleFindAllResponse[];
  total: number;
};

export type updateObstacleBody = {
  obstacle: {
    id: number;
    subcategoryId: number;
    description: string;
    latitude: string;
    longitude: string;
    statusId: number;
  }
  imgObstacleDelete: number[];
  imgObstacleAdd: {
    imageUrl: string;
  }[];
}

export type CreateObstacleBody = {
  obstacle: {
    subcategoryId: number;
    description: string;
    latitude: string;
    longitude: string;
    statusId: number;
    categoryId?: number;
  }
  imageUrl: string[];
}

