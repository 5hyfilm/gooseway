// src/app/admin/users/add/page.tsx
"use client";

import React, { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  ChevronDown,
  ChevronLeft,
  Eye,
  EyeOff,
  Lock,
  Mail,
  Phone,
  Save,
  Shield,
  User,
} from "lucide-react";
import { Select } from "antd";
import { createUser } from "@/services/api/endpoints/user";
import { validatePassword } from "@/data/users";
import { CreateUserBody } from "@/lib/types/user";
import { uploadFile } from "@/services/api/endpoints/upload";
import { checkFileSizeType } from "../../../../../utils/file";
import { handleAxiosError } from "@/services/api/api";

export default function AddUserPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [imageError, setImageError] = useState<string>(""); 
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState<CreateUserBody>(
    {
      email: "",
      password: "",
      fullName: "",
      phoneNumber: "",
      statusId: 1, // กำหนดค่าเริ่มต้นเป็น "Active"
      roleId: 1, // กำหนดค่าเริ่มต้นเป็น "user"
      avatarUrl: "",
    }
  );
  const [passwordValidation, setPasswordValidation] = useState({
    isValid: true,
    isValidLength: true,
    hasUppercase: true,
    hasLowercase: true,
    hasNumber: true,
    hasSpecialChar: true,
    typesCount: 0,
  });
  const [emailError, setEmailError] = useState<string>("");

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;

    if (name === "password") {
      if (!value) {
        setPasswordValidation({
          isValid: true,
          isValidLength: true,
          hasUppercase: true,
          hasLowercase: true,
          hasNumber: true,
          hasSpecialChar: true,
          typesCount: 0,
        });
      } else {
        const validation = validatePassword(value);
        setPasswordValidation(validation);
      }
    }

    setFormData((prev) => ({
      ...prev,
      [name]: name === "fullName" ? value.replace(/^\s+/, "") : value,
      [name]: name === "roleId" || name === "statusId" ? Number(value) : value,
    }));
    setEmailError("");
  };

  const handleAvatarUrlButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const isValid = checkFileSizeType({
        file,
        allowedType: ["jpg", "jpeg", "png"],
      });
      if (!isValid) {
        setImageError("ไฟล์รูปต้องเป็น jpg, jpeg, png และขนาดไม่เกิน 10MB");
        return;
      }

      const imageUrl = URL.createObjectURL(file);
      setAvatarUrl(imageUrl);
      setAvatarFile(file);

      setFormData((prev) => ({
        ...prev,
        avatarUrl: imageUrl,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setSaving(true);

      try {
       let uploadedAvatarUrl = null;
        if (avatarFile) {
          const res = await uploadFile(avatarFile);
          uploadedAvatarUrl = res.result?.variants[0];
        }

        // บันทึกข้อมูลผู้ใช้ใหม่
        await createUser({
          email: formData.email,
          password: formData.password,
          fullName: formData.fullName,
          phoneNumber: formData.phoneNumber,
          statusId: formData.statusId,
          roleId: formData.roleId,
          avatarUrl: uploadedAvatarUrl || null,
        });
        // เสร็จสิ้นการบันทึก
        router.push("/admin/users");
      } catch (error) {
        setSaving(false);
        const errorResponse = handleAxiosError(error);
        if (errorResponse.status === 409) {
          setEmailError("อีเมลนี้ถูกใช้งานแล้ว กรุณาใช้อีเมลอื่น");
        } else {
          alert("เกิดข้อผิดพลาดในการบันทึกข้อมูล กรุณาลองใหม่อีกครั้ง");
        }
      } finally {
        setSaving(false);
      }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Link href="/admin/users" className="mr-4">
            <ChevronLeft size={24} className="text-gray-500" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-800">เพิ่มผู้ใช้ใหม่</h1>
        </div>
        <div className="flex gap-2">
          {/* ปุ่มบันทึก */}
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={saving || !passwordValidation.isValid}
              className={`px-6 py-2 bg-blue-600 text-white rounded-md flex items-center gap-2 ${
                saving
                  ? "opacity-70 cursor-not-allowed"
                  : "hover:bg-blue-700"
              }`}
            >
              <Save size={18} />
              {saving ? "กำลังบันทึก..." : "บันทึกข้อมูล"}
            </button>
            <Link
              href="/admin/users"
              className="px-6 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              ยกเลิก
            </Link>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow flex flex-col h-full overflow-y-hidden">
        <div className="p-6 space-y-6">
          {/* ข้อมูลทั่วไป */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1 flex flex-col items-center justify-start">
              <div className="w-40 h-40 rounded-full overflow-hidden bg-gray-200 mb-4">
                {formData.avatarUrl ? (
                  <img
                    src={avatarUrl || formData.avatarUrl}
                    alt={`รูปโปรไฟล์ของ ${formData.fullName}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 text-4xl">
                    <User size={64} />
                  </div>
                )}
              </div>
              {imageError && (
                <div className="text-red-500 text-xs mb-2">{imageError}</div>
              )}
              <input
                type="file"
                accept="image/jpeg, image/png, image/jpg"
                ref={fileInputRef}
                onChange={handleAvatarUrlChange}
                className="hidden"
              />
              <button
                type="button"
                onClick={handleAvatarUrlButtonClick}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50"
              >
                เพิ่มรูปโปรไฟล์
              </button>
            </div>

            <div className="md:col-span-2 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="fullName"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    ชื่อผู้ใช้ <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User size={16} className="text-gray-400" />
                    </div>
                    <input
                      type="text"
                      id="fullName"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      required
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="ชื่อผู้ใช้"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    อีเมล <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail size={16} className="text-gray-400" />
                    </div>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="example@email.com"
                    />
                  </div>
                  {emailError && (
                    <div className="text-red-500 text-xs mt-2">
                      {emailError}
                    </div>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="phoneNumber"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    เบอร์โทรศัพท์
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Phone size={16} className="text-gray-400" />
                    </div>
                    <input
                      type="tel"
                      id="phoneNumber"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleChange}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="0xx-xxx-xxxx"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    รหัสผ่าน <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      {/* Use a lock icon for password */}
                      <Lock size={16} className="text-gray-400" />
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="กรอกรหัสผ่าน"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 focus:outline-none"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                    {!passwordValidation.isValid && (
                      <div className="text-red-500 text-xs mt-2">
                        รหัสผ่านต้องมีความยาว 8-20 ตัวอักษร และมีอย่างน้อย 2 ประเภท (ตัวพิมพ์ใหญ่, ตัวพิมพ์เล็ก, ตัวเลข, อักขระพิเศษ)
                      </div>
                    )}
                </div>

                {/* ปิดตัวเลือกบทบาท และใช้เพียงแสดงผล */}
                <div>
                  <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                    บทบาท
                  </label>
                  <div className="relative">
                    <Select
                      id="role"
                      prefix={<Shield size={16} className="text-gray-400" />}
                      suffixIcon={<ChevronDown className="text-gray-400" size={16} />}
                      value={formData.roleId}
                      onChange={(value) => {
                        setFormData((prev) => ({
                          ...prev,
                          roleId: Number(value),
                        }));
                      }}
                      className="w-full h-11"
                      placeholder="เลือกบทบาท"
                      options={[
                        { value: 1, label: <span className="text-base">ผู้ใช้ทั่วไป</span> },
                        { value: 2, label: <span className="text-base">ผู้ดูแลระบบ</span> },
                      ]}
                    />
                  </div>
                </div>
              
                <div>
                  <label
                    htmlFor="status"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    สถานะ <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Select
                      id="status"
                      prefix={<AlertCircle size={16} className="text-gray-400" />}
                      suffixIcon={<ChevronDown className="text-gray-400" size={16} />}
                      value={formData.statusId}
                      onChange={(value) => {
                        setFormData((prev) => ({
                          ...prev,
                          statusId: Number(value),
                        }));
                      }}
                      className="w-full h-11"
                      placeholder="เลือกสถานะ"
                      options={[
                        { value: 1, label: <span className="text-base">กำลังใช้งาน</span> },
                        { value: 2, label: <span className="text-base">ไม่ได้ใช้งาน</span> },
                      ]}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
