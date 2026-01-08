
export type ActivityType = "user" | "location" | "obstacle" | "post" | "route";

export const ActivityDetail = {
 "user": {
    action: [
      {value: "login", label: "มีการเข้าสู่ระบบ"},
      {value: "register", label: "ผู้ใช้ใหม่ลงทะเบียน"},
      {value: "create_user", label: "เพิ่มบัญชีผู้ใช้ใหม่"},
      {value: "update_user", label: "แก้ไขบัญชีผู้ใช้"},
      {value: "delete_user", label: "ลบบัญชีผู้ใช้"},
    ]
 },
  "location": {
    action: [
      {value: "create_location", label: "เพิ่มสถานที่ใหม่"},
      {value: "update_location", label: "แก้ไขสถานที่"},
      {value: "delete_location", label: "ลบสถานที่"},
      {value: "review_location", label: "รีวิวสถานที่"},
    ]
  },
  "obstacle": {
    action: [
      {value: "create_obstacle", label: "รายงานอุปสรรคใหม่"},
      {value: "update_obstacle", label: "แก้ไขอุปสรรค"},
      {value: "delete_obstacle", label: "ลบอุปสรรค"},
    ]
  },
  "post": {
    action: [
      {value: "create_post", label: "เพิ่มโพสต์ใหม่"},
      {value: "update_post", label: "แก้ไขโพสต์"},
    ]
  },
  "route": {
    action: [
      {value: "create_route", label: "เพิ่มเส้นทางใหม่"},
      {value: "delete_route", label: "ลบเส้นทาง"},
    ]
  }
}

export const locationCategoryMap: Record<number, string> = {
  1: "ห้างสรรพสินค้า",
  2: "ระบบขนส่งสาธารณะ",
  3: "สวนสาธารณะ",
  4: "ร้านอาหาร",
};
export const obstacleCategoryMap: Record<number, string> = {
  1: "🛑 ปัญหาทางเท้า",
  2: "🚧 สิ่งกีดขวางถาวร",
  3: "⚠️ สิ่งกีดขวางชั่วคราว",
  4: "❓ อื่นๆ",
};
export const obstacleIconMap: Record<number, string> = {
  1: "🛑",
  2: "🚧",
  3: "⚠️",
  4: "❓",
};
export const accessLevelMap: Record<number, string> = {
  1: "เข้าถึงได้ง่าย",
  2: "เข้าถึงได้ปานกลาง",
  3: "เข้าถึงได้ยาก",
};

export interface DashboardStats {
  user: {
    totalUsers: number;
    thisMonth: number;
    lastMonth: number;
    growthPercent: number;
  }
  location: {
    totalLocation: number;
    thisMonth: number;
    lastMonth: number;
    growthPercent: number;
  }
  obstacle: {
    totalObstacle: number;
    thisMonth: number;
    lastMonth: number;
    growthPercent: number;
  }
  review: {
    totalReview: number;
    thisMonth: number;
    lastMonth: number;
    growthPercent: number;
  };
}

export interface Activity {
    id: number;
    entityType: ActivityType;
    action: string;
    userName: string;
    createdAt: string;
    fullName?: string;
    entityId?: number;
    metaData: {
        id?: number;
        title?: string;
        statusId?: number; 
        description?: string;
        name?: string;
        user?: {
            id?: number;
            fullName?: string;
            email?: string;
            phoneNumber?: string;
            statusId?: number;
            roleId?: number;
        }
        fullName?: string;
        endLocationName?: string;
        startLocationName?: string;
        totalDistanceMeters?: number;
        locationId?: number;
        rating?: number;
        reviewText?: string;
    };
}

export interface DashboardChart {
  accessLevelId?: number;
  accessLevelName?: string;
  categoryId: number;
  categoryName?: string;
  count: string;
  percent: string;
}

type SortBy = {
  column: string;
  direction: "asc" | "desc";
};

export type ActivityFindAllBody = {
  entityType: string;
  userName: string;
  sortBy: SortBy[];
  limit: number;
  pageNumber: number;
};