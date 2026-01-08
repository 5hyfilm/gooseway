// src/data/users.ts

export interface UserRole {
  id: number;
  name: "admin" | "user";
}
export interface UserStatus {
  id: number;
  name: "Active" | "Inactive" | "Suspended";
}
export interface User {
  id: number;
  fullName: string;
  email: string;
  phoneNumber?: string;
  role: UserRole;
  status: UserStatus;
  registeredAt: string;
  createdAt?: string; 
  lastLogin?: string;
  avatarUrl?: string;
  suspendedAt?: string; // เวลาที่ระงับบัญชี
  suspendedReason?: string; // เหตุผลในการระงับบัญชี
  suspendedBy?: number; // ID ของผู้ดูแลระบบที่ระงับบัญชี
  roleId?: number;
}

// ฟังก์ชันสำหรับตรวจสอบความถูกต้องของรหัสผ่าน
export const validatePassword = (password: string) => {
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = /[@#$%^&*(),.?":{}|<>]/.test(password);
  const isValidLength = password.length >= 8 && password.length <= 20;

  const typesCount = [
    hasUppercase,
    hasLowercase,
    hasNumber,
    hasSpecialChar,
  ].filter(Boolean).length;

  const isValid = isValidLength && typesCount >= 2;

  return {
    isValid,
    isValidLength,
    hasUppercase,
    hasLowercase,
    hasNumber,
    hasSpecialChar,
    typesCount,
  };
};

// ฟังก์ชันสำหรับแปลงค่าบทบาทเป็นภาษาไทย
export const getRoleLabel = (role: UserRole): string => {
  switch (role.name) {
    case "admin":
      return "ผู้ดูแลระบบ";
    case "user":
      return "ผู้ใช้ทั่วไป";
    default:
      return role.name;
  }
};

// ฟังก์ชันสำหรับแปลงค่าสถานะเป็นภาษาไทย
export const getStatusLabel = (status: UserStatus): string => {
  switch (status.name) {
    case "Active":
      return "กำลังใช้งาน";
    case "Inactive":
      return "ไม่ได้ใช้งาน";
    case "Suspended":
      return "ระงับการใช้งาน";
    default:
      return status.name;
  }
};
