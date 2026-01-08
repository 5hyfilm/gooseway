import { ActivityType, Activity, ActivityDetail } from "@/lib/types/dashboard";

export function getActivityLabel(entityType: ActivityType): string {
  switch (entityType) {
    case "user":
      return "จัดการผู้ใช้";
    case "location":
      return "จัดการสถานที่";
    case "obstacle":
      return "จัดการอุปสรรค";
    case "route":
      return "จัดการเส้นทาง";
    case "post":
      return "จัดการโพสต์";
    default:
      return "";
  }
}

export function getActivityActionLabel(entityType: ActivityType, action: string): string {
  const detail = ActivityDetail[entityType];
  if (!detail) return action;
  const found = detail.action.find((a) => a.value === action);
  return found ? found.label : action;
}

export function renderActivityMetaData(activity: Activity): string | null {
  const { entityType, action, metaData } = activity;
  if (!metaData) return null;

  switch (entityType) {
    case "user":
      return renderUserMetaData(action, metaData);
    case "location":
      return renderLocationMetaData(action, metaData);
    case "obstacle":
      return renderObstacleMetaData(action, metaData);
    case "route":
      return renderRouteMetaData(action, metaData);
    case "post":
      return renderPostMetaData(action, metaData);
    default:
      return "";
  }
}

export function renderUserMetaData(action: string, metaData: Activity["metaData"]): string {
  if (action === "login") return "เข้าสู่ระบบ";
  if (action === "register") return "สมัครสมาชิก";
  if (action === "create_user") {
    if (metaData.user?.fullName) {
      return `ผู้ใช้ ${metaData.user.fullName}`;
    } else if (metaData?.fullName) {
      return `ผู้ใช้ ${metaData.fullName}`;
    } else {
      return "";
    }
  }
  if (action === "update_user") {
    let label = "";
    if (metaData.user?.fullName) {
      label = `ผู้ใช้ ${metaData.user.fullName}`;
    } else if (metaData?.fullName) {
      label = `ผู้ใช้ ${metaData.fullName}`;
    }
    return label;
  }
  if (action === "delete_user") {
    return metaData.id ? `ลบผู้ใช้ #${metaData.id}` : "";
  }
  return "";
}

export function renderLocationMetaData(action: string, metaData: Activity["metaData"]): string {
  if (action === "review_location") {
    const reviewTextPart = metaData.reviewText ? `: "${metaData.reviewText}"` : "";
    return `ให้คะแนน ${metaData.rating}/5 ${reviewTextPart}`;
  }
  if (action === "create_location") {
    return metaData.name ? `สถานที่ใหม่: ${metaData.name}` : "";
  }
  if (action === "update_location") {
    return metaData.name ? `สถานที่: ${metaData.name}` : "";
  }
  if (action === "delete_location") {
    return metaData.id ? `ลบสถานที่ #${metaData.id}` : "";
  }
  return "";
}

export function renderObstacleMetaData(action: string, metaData: Activity["metaData"]): string {
  if (action === "create_obstacle" || action === "update_obstacle") {
    return metaData.description ? `${metaData.description}` : "";
  }
  if (action === "delete_obstacle") {
    return metaData.id ? `ลบอุปสรรค #${metaData.id}` : "";
  }
  return "";
}

export function renderRouteMetaData(action: string, metaData: Activity["metaData"]): string {
  if (action === "create_route") {
    const distanceKm = metaData.totalDistanceMeters
      ? (metaData.totalDistanceMeters / 1000).toFixed(2)
      : "0.0";
    return metaData.name
      ? `เส้นทาง ${metaData.name} (${metaData.startLocationName || "ไม่ระบุจุดเริ่มต้น"} → ${metaData.endLocationName || "ไม่ระบุปลายทาง"}, ${distanceKm} กม.)`
      : "";
  }
  if (action === "delete_route") {
    return metaData.id ? `ลบเส้นทาง #${metaData.id}` : "";
  }
  return "";
}

export function renderPostMetaData(action: string, metaData: Activity["metaData"]): string {
  if (["create_post", "update_post"].includes(action)) {
    return metaData.title ? `โพสต์เกี่ยวกับ ${metaData.title}` : "";
  }
  return "";
}

export function viewActivityDetail(entityType: string, action: string, entityId: number | undefined): string {
  if (action === "create_location" || action === "update_location" || action === "review_location") {
    return `/admin/locations/edit/${entityId}`;
  }
  
  if (action === "create_user" || action === "update_user") {
    return `/admin/users/edit/${entityId}`;
  }
  
  if (action.startsWith("create") || action.startsWith("update") || action.startsWith("review")) {
    return `/admin/${entityType}s/view/${entityId}`;
  }
  
  return `/admin/${entityType}s`;
}