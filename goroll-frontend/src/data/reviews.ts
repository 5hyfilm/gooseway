// src/data/reviews.ts

export interface Review {
  id: number;
  locationId: number;
  userId: number;
  username: string;
  date: string;
  rating: number;
  comment: string;
  likes: number;
  profileImage?: string;
}

// รีวิวตัวอย่างสำหรับสถานที่ต่างๆ
export const sampleReviews: Review[] = [
  // รีวิวสำหรับ EmQuartier (locationId: 1)
  {
    id: 1,
    locationId: 1,
    userId: 1,
    username: "สมชาย ใจดี",
    date: "2023-12-15",
    rating: 4.5,
    comment:
      "ที่นี่สะดวกมาก มีทางลาดสำหรับรถเข็นเกือบทุกจุด พนักงานให้ความช่วยเหลือดี ห้องน้ำสำหรับผู้พิการมีเพียงพอและสะอาด",
    likes: 12,
    profileImage: "/api/placeholder/48/48",
  },
  {
    id: 2,
    locationId: 1,
    userId: 2,
    username: "มานี รักดี",
    date: "2023-11-28",
    rating: 3.5,
    comment:
      "ทางเข้าหลักสะดวกดี ลิฟต์กว้างพอสำหรับรถเข็น แต่ห้องน้ำสำหรับคนพิการมีน้อยไปหน่อย ต้องรอคิวนาน",
    likes: 5,
    profileImage: "/api/placeholder/48/48",
  },

  // รีวิวสำหรับ Terminal 21 (locationId: 2)
  {
    id: 3,
    locationId: 2,
    userId: 3,
    username: "วิชัย สะอาด",
    date: "2023-10-05",
    rating: 5.0,
    comment:
      "ประทับใจมากกับสิ่งอำนวยความสะดวกสำหรับผู้ใช้รถเข็น ลิฟต์กว้างขวาง ทางลาดได้มาตรฐาน พนักงานให้ความช่วยเหลือดีเยี่ยม",
    likes: 24,
    profileImage: "/api/placeholder/48/48",
  },
  {
    id: 4,
    locationId: 2,
    userId: 4,
    username: "นิภา ใจงาม",
    date: "2023-09-20",
    rating: 4.0,
    comment:
      "สถานที่เข้าถึงง่าย มีที่จอดรถสำหรับผู้พิการติดกับทางเข้า แต่บางจุดทางลาดชันไปหน่อย ต้องมีคนช่วยเข็น",
    likes: 8,
    profileImage: "/api/placeholder/48/48",
  },

  // รีวิวสำหรับ IconSiam (locationId: 3)
  {
    id: 5,
    locationId: 3,
    userId: 5,
    username: "สมศรี มีสุข",
    date: "2023-12-10",
    rating: 4.2,
    comment:
      "เป็นห้างที่เข้าถึงง่ายมาก มีทางลาดเข้าทุกประตู ทางเดินกว้าง ไม่แออัด ลิฟต์ก็กว้างพอสำหรับรถเข็น มีห้องน้ำผู้พิการทุกชั้น",
    likes: 15,
    profileImage: "/api/placeholder/48/48",
  },
  {
    id: 6,
    locationId: 3,
    userId: 6,
    username: "ประเสริฐ มากมี",
    date: "2023-11-15",
    rating: 3.8,
    comment:
      "เข้าถึงได้ค่อนข้างดี แต่ระยะทางจากที่จอดรถถึงลิฟต์ค่อนข้างไกล อาจเป็นอุปสรรคสำหรับบางคน พนักงานช่วยเหลือดีมาก",
    likes: 7,
    profileImage: "/api/placeholder/48/48",
  },

  // รีวิวสำหรับ Siam Paragon (locationId: 4)
  {
    id: 7,
    locationId: 4,
    userId: 7,
    username: "จินตนา ดาวเรือง",
    date: "2023-12-01",
    rating: 4.7,
    comment:
      "ประทับใจกับสิ่งอำนวยความสะดวกและการออกแบบที่คำนึงถึงผู้ใช้รถเข็น ทางลาดไม่ชัน ห้องน้ำผู้พิการสะอาด มีจุดชาร์จรถเข็นไฟฟ้าด้วย",
    likes: 19,
    profileImage: "/api/placeholder/48/48",
  },
  {
    id: 8,
    locationId: 4,
    userId: 8,
    username: "สมหมาย ใจร้อน",
    date: "2023-10-25",
    rating: 3.5,
    comment:
      "โดยรวมใช้งานได้ดี แต่บางครั้งลิฟต์แออัดมาก ต้องรอนาน ห้องน้ำผู้พิการชั้น 3 และ 4 ปิดซ่อมบ่อยไปหน่อย",
    likes: 6,
    profileImage: "/api/placeholder/48/48",
  },

  // รีวิวสำหรับ CentralWorld (locationId: 5)
  {
    id: 9,
    locationId: 5,
    userId: 9,
    username: "วันชัย คงมั่น",
    date: "2023-11-30",
    rating: 4.3,
    comment:
      "เข้าถึงง่าย มีทางลาดหลายจุด ลิฟต์กว้างขวาง แต่ที่จอดรถผู้พิการมีน้อยและอยู่ไกลจากทางเข้า พนักงานช่วยเหลือดี",
    likes: 13,
    profileImage: "/api/placeholder/48/48",
  },
  {
    id: 10,
    locationId: 5,
    userId: 10,
    username: "มาลี สดใส",
    date: "2023-10-15",
    rating: 4.0,
    comment:
      "ห้างใหญ่มาก ทางเดินกว้าง ลิฟต์สะดวก แต่บางจุดชันไปหน่อย ควรมีป้ายบอกทางไปห้องน้ำผู้พิการให้ชัดเจนกว่านี้",
    likes: 9,
    profileImage: "/api/placeholder/48/48",
  },

  // รีวิวเพิ่มเติมสำหรับสถานที่อื่นๆ
  {
    id: 11,
    locationId: 6,
    userId: 11,
    username: "ประภา วงศ์ไทย",
    date: "2023-11-05",
    rating: 3.0,
    comment:
      "อาคารเก่า ทางลาดน้อย บางจุดต้องใช้ทางลาดเคลื่อนที่ ลิฟต์แคบไปนิด แต่พนักงานช่วยเหลือดีมาก พยายามอำนวยความสะดวกเต็มที่",
    likes: 5,
    profileImage: "/api/placeholder/48/48",
  },
  {
    id: 12,
    locationId: 7,
    userId: 12,
    username: "สมศักดิ์ รักธรรม",
    date: "2023-12-12",
    rating: 3.2,
    comment:
      "เป็นสวนสาธารณะที่พยายามปรับปรุงให้เข้าถึงได้ ทางเดินส่วนใหญ่เรียบแต่บางจุดขรุขระ ห้องน้ำผู้พิการมีแค่จุดเดียว ควรเพิ่ม",
    likes: 7,
    profileImage: "/api/placeholder/48/48",
  },
];

// ฟังก์ชั่นสำหรับดึงรีวิวตามรหัสสถานที่
export function getReviewsByLocationId(locationId: number): Review[] {
  return sampleReviews.filter((review) => review.locationId === locationId);
}

// ฟังก์ชั่นสำหรับคำนวณคะแนนเฉลี่ยของสถานที่
export function getAverageRating(locationId: number): number {
  const reviews = getReviewsByLocationId(locationId);
  if (reviews.length === 0) return 0;

  const sum = reviews.reduce((total, review) => total + review.rating, 0);
  return Math.round((sum / reviews.length) * 10) / 10; // ปัดทศนิยม 1 ตำแหน่ง
}
