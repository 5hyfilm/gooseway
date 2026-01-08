// utils/obstacleUtils.tsx
// แปลงชื่อหมวดหมู่ให้เป็นภาษาไทย
export function getCategoryLabel(category: string): string {
  const categoryLabels: Record<string, string> = {
    sidewalk_issues: "Sidewalk Issues",
    permanent_obstacles: "Permanent Obstacles",
    temporary_obstacles: "Temporary Obstacles",
    other_obstacles: "Etc.",
  };
  return categoryLabels[category] || category;
}

// แปลงชื่อประเภทย่อยให้เป็นภาษาไทย
// export function getTypeLabel(type: Obstacle): string {
//   const typeLabels: Record<Obstacle, string> = {
//     rough_surface: "พื้นผิวขรุขระ/ชำรุด",
//     broken_drain: "ท่อระบายน้ำชำรุด/ฝาท่อหาย",
//     narrow_path: "ทางเท้าแคบเกินไป",
//     no_ramp: "ไม่มีทางลาดขึ้น-ลง",
//     utility_pole: "เสาไฟฟ้า/เสาป้าย",
//     footbridge_no_lift: "สะพานลอยที่ไม่มีลิฟต์/ทางลาด",
//     construction: "จุดก่อสร้างถาวร",
//     vehicles_on_sidewalk: "ยานพาหนะบนทางเท้า",
//     construction_material: "วัสดุก่อสร้าง",
//     garbage_bin: "ถังขยะ",
//     other: "อื่นๆ",
//   };
//   return typeLabels[type] || type;
// }
