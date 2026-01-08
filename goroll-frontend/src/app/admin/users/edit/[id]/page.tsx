// src/app/admin/users/edit/[id]/page.tsx
"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ChevronLeft,
  User,
  Mail,
  Phone,
  Calendar,
  Shield,
  // Lock,
  AlertCircle,
  Save,
  Trash2,
  ShieldAlert,
  ShieldOff,
  ChevronDown,
} from "lucide-react";
import { Select } from "antd";
import { UserStatus } from "@/data/users";
import { WheelchairInfoAdmin } from "@/components/admin/WheelchairInfoAdmin";
import {
  getUserById,
  updateUser,
  deleteUser,
} from "@/services/api/endpoints/user";
import { UserWithWheelchair, WheelchairInfo } from "@/lib/types/user";
import { uploadFile } from "@/services/api/endpoints/upload";
import { checkFileSizeType } from "../../../../../../utils/file";
import { handleAxiosError } from "@/services/api/api";

export default function EditUserPage() {
  const router = useRouter();
  const params = useParams();
  const userId = Number(params.id);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [imageError, setImageError] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [notFound, setNotFound] = useState(false);
  const [originalName, setOriginalName] = useState<string>("");
  const [originalStatus, setOriginalStatus] = useState<UserStatus | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [suspensionReason, setSuspensionReason] = useState("");
  const [emailError, setEmailError] = useState<string>("");

  const [formData, setFormData] = useState<UserWithWheelchair>({
    id: 0,
    avatarUrl: "",
    email: "",
    fullName: "",
    phoneNumber: "",
    registeredAt: "",
    createdAt: undefined,
    lastLogin: undefined,
    status: { id: 0, name: "Active" },
    role: { id: 0, name: "user" },
    suspendedReason: undefined,
    roleId: 0,
    wheelChair: {
      isFoldable: undefined,
      widthRegularCm: undefined,
      lengthRegularCm: undefined,
      weightKg: undefined,
      widthFoldedCm: undefined,
      lengthFoldedCm: undefined,
      heightFoldedCm: undefined,
      customizations: [],
      notes: "",
    },
  });

  const statusOptions: UserStatus[] = [
    { id: 1, name: "Active" },
    { id: 2, name: "Inactive" },
    { id: 3, name: "Suspended" },
  ];

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      setNotFound(false);
      try {
        const user = await getUserById(userId);
        setFormData(user);
        setOriginalName(user.fullName);
        setOriginalStatus(user.status);
      } catch (err) {
        console.error("Error fetching user:", err);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [userId]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;

    if (name === "status.id") {
      const selected = statusOptions.find((opt) => String(opt.id) === value);
      setFormData((prev) => ({
        ...prev,
        status: selected
          ? { id: selected.id, name: selected.name }
          : prev.status,
      }));
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: name === "fullName" ? value.replace(/^\s+/, "") : value,
    }));
    setEmailError("");
  };

  // ตรวจสอบให้แน่ใจว่า handleWheelchairInfoSave มีประกาศ parameter ที่ตรงกับ interface ที่ WheelchairInfoAdmin ต้องการ
  const handleWheelchairInfoSave = (data: WheelchairInfo) => {
    setFormData((prev) => ({ ...prev, wheelChair: data }));
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
    if (formData.status.id !== originalStatus?.id) {
      setShowStatusModal(true);
      return;
    }

    await saveUser();
  };

  const saveUser = async () => {
    setSaving(true);
    try {
      let uploadedAvatarUrl = null;
      if (avatarFile) {
        const res = await uploadFile(avatarFile);
        uploadedAvatarUrl = res.result?.variants[0];
      }

      const body = {
        user: {
          id: formData.id,
          email: formData.email,
          fullName: formData.fullName,
          avatarUrl: uploadedAvatarUrl || null,
          phoneNumber: formData.phoneNumber || "",
          statusId: formData.status.id,
          suspendedReason:
            formData.status.id === 3 ? suspensionReason : undefined,
          roleId: formData.roleId,
        },
        wheelchair: formData.wheelChair,
      };
      // เรียก API สำหรับอัปเดตข้อมูลผู้ใช้
      await updateUser(body);

      setSaving(false);
      setSuspensionReason("");
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

  const handleConfirmStatusChange = async () => {
    setShowStatusModal(false);
    if (formData.status.id === 3) {
      // ระงับการใช้งานบัญชี
      setFormData((prev) => ({
        ...prev,
        status: { id: 3, name: "Suspended" }, // เปลี่ยนสถานะเป็น "ระงับการใช้งาน"
        suspendedReason: suspensionReason,
      }));
    } else if (formData.status.id === 1) {
      // เปิดใช้งานบัญชี
      setFormData((prev) => ({
        ...prev,
        status: { id: 1, name: "Active" },
        suspendedAt: undefined,
        suspendedReason: undefined,
        suspendedBy: undefined,
      }));
    }
    await saveUser();
  };

  const handleCancelStatusChange = () => {
    setShowStatusModal(false);
    setSuspensionReason("");
    // Reset status to original
    if (originalStatus) {
      setFormData((prev) => ({
        ...prev,
        status: originalStatus,
      }));
    }
  };

  const handleDelete = async () => {
    try {
      await deleteUser(userId);

      setShowDeleteModal(false);
      router.push("/admin/users");
    } catch (error) {
      console.error("Error deleting user:", error);
      setShowDeleteModal(false);
      alert("เกิดข้อผิดพลาดในการลบผู้ใช้ กรุณาลองใหม่อีกครั้ง");
    }
  };

  const handleResetPassword = async () => {
    try {
      // จำลองการรีเซ็ตรหัสผ่าน
      console.log("Resetting password for user:", formData.id);

      // จำลองการเรียก API
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setShowResetPasswordModal(false);
      alert(
        `ระบบได้ส่งอีเมลรีเซ็ตรหัสผ่านไปยัง ${formData.email} เรียบร้อยแล้ว`
      );
    } catch (error) {
      console.error("Error resetting password:", error);
      setShowResetPasswordModal(false);
      alert("เกิดข้อผิดพลาดในการรีเซ็ตรหัสผ่าน กรุณาลองใหม่อีกครั้ง");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4 mx-auto"></div>
          <p className="text-gray-600">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          ไม่พบข้อมูลผู้ใช้
        </h2>
        <p className="text-gray-600 mb-6">ไม่พบผู้ใช้ ID: {userId}</p>
        <Link
          href="/admin/users"
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          กลับไปยังรายการผู้ใช้
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col mb-2">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Link href="/admin/users" className="mr-4">
            <ChevronLeft size={24} className="text-gray-500" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-800">
            แก้ไขข้อมูลผู้ใช้: {originalName}
          </h1>
        </div>
        <div className="flex gap-2">
          {/* ปุ่มบันทึก */}
          <button
            type="submit"
            disabled={saving}
            className={`px-6 py-2 bg-blue-600 text-white rounded-md flex items-center gap-2 ${
              saving ? "opacity-70 cursor-not-allowed" : "hover:bg-blue-700"
            }`}
          >
            <Save size={18} />
            {saving ? "กำลังบันทึก..." : "บันทึกข้อมูล"}
          </button>
          {/* <button
            type="button"
            onClick={() => setShowResetPasswordModal(true)}
            className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 flex items-center gap-2"
          >
            <Lock size={18} />
            <span>รีเซ็ตรหัสผ่าน</span>
          </button> */}
          {/* ปุ่มลบ */}
          <button
            type="button"
            onClick={() => setShowDeleteModal(true)}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center gap-2"
          >
            <Trash2 size={18} />
            <span>ลบผู้ใช้</span>
          </button>
          {/* ปุ่มยกเลิก */}
          <Link
            href="/admin/users"
            className="px-6 py-2 border border-gray-300 bg-white rounded-md hover:bg-gray-50"
          >
            ยกเลิก
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow flex flex-col h-full">
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
                เปลี่ยนรูปโปรไฟล์
              </button>

              {/* ข้อมูลเพิ่มเติม */}
              <div className="mt-6 w-full text-sm text-gray-500 space-y-2">
                <div className="flex items-center">
                  <Calendar size={14} className="mr-2" />
                  <div>
                    <p>สมัครสมาชิกเมื่อ</p>
                    <p className="font-medium text-gray-700">
                      {new Date(formData.createdAt ?? "").toLocaleDateString(
                        "th-TH",
                        {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        }
                      )}
                    </p>
                  </div>
                </div>
                {formData.lastLogin && (
                  <div className="flex items-center">
                    <Calendar size={14} className="mr-2" />
                    <div>
                      <p>เข้าสู่ระบบล่าสุด</p>
                      <p className="font-medium text-gray-700">
                        {new Date(formData.lastLogin).toLocaleDateString(
                          "th-TH",
                          {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )}
                      </p>
                    </div>
                  </div>
                )}

                {/* แสดงข้อมูลการระงับบัญชี */}
                {originalStatus?.name === "Suspended" &&
                  formData.status.name === "Suspended" &&
                  formData.suspendedAt && (
                    <div className="flex items-center mt-2">
                      <ShieldAlert size={14} className="mr-2 text-red-500" />
                      <div>
                        <p className="text-red-500">ระงับการใช้งานเมื่อ</p>
                        <p className="font-medium text-red-600">
                          {new Date(formData.suspendedAt).toLocaleDateString(
                            "th-TH",
                            {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}
                        </p>
                      </div>
                    </div>
                  )}
              </div>
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

                {/* ปิดตัวเลือกบทบาท และใช้เพียงแสดงผล */}
                {/* <div>
                  <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                    บทบาท
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Shield size={16} className="text-gray-400" />
                    </div>
                    <input
                      id="role"
                      type="text"
                      value={getRoleLabel(formData.role)}
                      readOnly
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                    />
                  </div>
                </div> */}
                <div>
                  <label
                    htmlFor="role"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    บทบาท
                  </label>
                  <div className="relative">
                    <Select
                      id="role"
                      prefix={<Shield size={16} className="text-gray-400" />}
                      suffixIcon={
                        <ChevronDown className="text-gray-400" size={16} />
                      }
                      value={formData.roleId}
                      onChange={(value) => {
                        setFormData((prev) => ({
                          ...prev,
                          roleId: Number(value),
                        }));
                      }}
                      // disabled={formData.role.id == 2}
                      className="w-full h-11"
                      placeholder="เลือกบทบาท"
                      options={[
                        {
                          value: 1,
                          label: (
                            <span className="text-base">ผู้ใช้ทั่วไป</span>
                          ),
                        },
                        {
                          value: 2,
                          label: <span className="text-base">ผู้ดูแลระบบ</span>,
                        },
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
                      prefix={
                        <AlertCircle size={16} className="text-gray-400" />
                      }
                      suffixIcon={
                        <ChevronDown className="text-gray-400" size={16} />
                      }
                      value={formData.status.id}
                      onChange={(value) => {
                        handleChange({
                          target: {
                            name: "status.id",
                            value: String(value),
                          },
                        } as unknown as React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>);
                      }}
                      className="w-full h-11"
                      placeholder="เลือกสถานะ"
                      options={statusOptions.map((status) => {
                        let thLabel;
                        if (status.name === "Active") thLabel = "กำลังใช้งาน";
                        else if (status.name === "Inactive")
                          thLabel = "ไม่ได้ใช้งาน";
                        else if (status.name === "Suspended")
                          thLabel = "ระงับการใช้งาน";

                        return {
                          value: status.id,
                          label: (
                            <span className="flex items-center gap-2 text-base">
                              {thLabel}
                            </span>
                          ),
                        };
                      })}
                    />
                  </div>
                </div>
              </div>

              {/* แสดงข้อมูลเพิ่มเติมเกี่ยวกับการระงับบัญชี */}
              {originalStatus?.name === "Suspended" &&
                formData.status.name === "Suspended" && (
                  <div className="bg-red-50 p-4 rounded-md border border-red-200">
                    <h3 className="text-sm font-medium text-red-800 flex items-center gap-2 mb-2">
                      <ShieldOff size={16} />
                      สถานะบัญชี: ระงับการใช้งาน
                    </h3>
                    <div className="text-sm text-red-700">
                      <p>
                        บัญชีนี้ถูกระงับการใช้งาน
                        ผู้ใช้จะไม่สามารถเข้าสู่ระบบได้
                      </p>
                      {formData.suspendedReason && (
                        <p className="mt-1">
                          <strong>เหตุผล:</strong> {formData.suspendedReason}
                        </p>
                      )}
                    </div>
                  </div>
                )}

              {/* ข้อมูลรถเข็น */}
              <div className="border-t pt-6 ">
                <WheelchairInfoAdmin
                  initialData={formData?.wheelChair}
                  onSave={handleWheelchairInfoSave}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal ยืนยันการลบผู้ใช้ */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              ยืนยันการลบผู้ใช้
            </h3>
            <p className="text-gray-600 mb-6">
              คุณต้องการลบผู้ใช้ &quot;{formData.fullName}&quot; ใช่หรือไม่?
              การกระทำนี้ไม่สามารถย้อนกลับได้
            </p>
            <div className="flex justify-end gap-4">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 border rounded-md hover:bg-gray-50"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                ยืนยันการลบ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal รีเซ็ตรหัสผ่าน */}
      {showResetPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              รีเซ็ตรหัสผ่าน
            </h3>
            <p className="text-gray-600 mb-6">
              คุณต้องการรีเซ็ตรหัสผ่านของผู้ใช้ &quot;{formData.fullName}&quot;
              ใช่หรือไม่?
              <br />
              <br />
              ระบบจะส่งลิงก์รีเซ็ตรหัสผ่านไปยังอีเมล:{" "}
              <strong>{formData.email}</strong>
            </p>
            <div className="flex justify-end gap-4">
              <button
                type="button"
                onClick={() => setShowResetPasswordModal(false)}
                className="px-4 py-2 border rounded-md hover:bg-gray-50"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={handleResetPassword}
                className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600"
              >
                ส่งลิงก์รีเซ็ตรหัสผ่าน
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal ยืนยันการเปลี่ยนสถานะบัญชี */}
      {showStatusModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {formData.status.name === "Suspended"
                ? "ระงับการใช้งานบัญชี"
                : formData.status.name === "Active"
                ? "เปิดใช้งานบัญชี"
                : "เปลี่ยนสถานะบัญชี"}
            </h3>
            <p className="text-gray-600 mb-4">
              {formData.status.name === "Suspended"
                ? `คุณต้องการระงับการใช้งานบัญชีของ "${formData.fullName}" ใช่หรือไม่?`
                : formData.status.name === "Active"
                ? `คุณต้องการเปิดใช้งานบัญชีของ "${formData.fullName}" ใช่หรือไม่?`
                : `คุณต้องการเปลี่ยนสถานะบัญชีของ "${formData.fullName}" ใช่หรือไม่?`}
            </p>
            {/* แสดงฟิลด์กรอกเหตุผลเฉพาะกรณีระงับบัญชี */}
            {formData.status.name === "Suspended" && (
              <div className="mb-4">
                <label
                  htmlFor="suspensionReason"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  เหตุผลในการระงับบัญชี (ไม่บังคับ)
                </label>
                <textarea
                  id="suspensionReason"
                  value={suspensionReason}
                  onChange={(e) => setSuspensionReason(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="ระบุเหตุผลในการระงับบัญชี..."
                />
              </div>
            )}

            <div className="flex justify-end gap-4">
              <button
                type="button"
                onClick={handleCancelStatusChange}
                className="px-4 py-2 border rounded-md hover:bg-gray-50"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={handleConfirmStatusChange}
                disabled={saving}
                className={`px-4 py-2 text-white rounded-md ${
                  formData.status.name === "Suspended"
                    ? "bg-yellow-600 hover:bg-yellow-700"
                    : formData.status.name === "Active"
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-blue-600 hover:bg-blue-700"
                } ${saving ? "opacity-70 cursor-not-allowed" : ""}`}
              >
                {saving ? "กำลังบันทึก..." : "ยืนยัน"}
              </button>
            </div>
          </div>
        </div>
      )}
    </form>
  );
}
