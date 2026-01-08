// src/app/admin/obstacles/add/page.tsx

"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Camera, Upload, X, Info, AlertTriangle, Check, ChevronDown } from "lucide-react";
import { Select, Upload as AntdUpload } from "antd";
import Link from "next/link";
import { CATEGORY_ICONS } from "@/lib/types/obstacle";
import type { CreateObstacleBody, ObstacleCategory } from "@/lib/types/obstacle";
import { createObstacle, getObstacleCategory, getSubObstacleCategory } from "@/services/api/endpoints/obstacle";
import MapWithMarker from "@/components/maps/MapWithMarker";
import { checkFileSizeType } from "../../../../../utils/file";
import { uploadFile } from "@/services/api/endpoints/upload";

export default function AddObstaclePage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [tabIndex, setTabIndex] = useState(0);
  const [obstacleCategory, setObstacleCategory] = useState<ObstacleCategory[]>([]);
  const [obstacleSubCategory, setObstacleSubCategory] = useState<ObstacleCategory[]>([]);
  const [loadingCategory, setLoadingCategory] = useState(true);
  const [loadingSubCategory, setLoadingSubCategory] = useState(false);

  const [formData, setFormData] = useState<CreateObstacleBody>({
    obstacle: {
      subcategoryId: 0,
      description: "",
      latitude: "",
      longitude: "",
      statusId: 1,
      categoryId: 1,
    },
    imageUrl: [],
  });

  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [imageError, setImageError] = useState<string>("");
  const [showLocationError, setShowLocationError] = useState(false);

  useEffect(() => {
    const fetchObstaclesCategory = async () => {
      try {
        const categoryData = await getObstacleCategory();
        setObstacleCategory(categoryData);
      } catch (error) {
        console.error("Error loading categories:", error);
      } finally {
        setLoadingCategory(false);
      }
    };

    fetchObstaclesCategory();
  }, []);

  useEffect(() => {
    const fetchObstaclesSubCategory = async () => {
      if (formData.obstacle.categoryId) {
        setLoadingSubCategory(true);
        try {
          const subCategoryData = await getSubObstacleCategory(formData.obstacle.categoryId);
          setObstacleSubCategory(subCategoryData);
          setFormData(prev => ({
            ...prev,
            obstacle: {
              ...prev.obstacle,
              subcategoryId: subCategoryData.length > 0 ? subCategoryData[0].id : 0,
            }
          }));
        } catch (error) {
          console.error("Error loading subcategories:", error);
          setObstacleSubCategory([]);
        } finally {
          setLoadingSubCategory(false);
        }
      }
    };

    fetchObstaclesSubCategory();
  }, [formData.obstacle.categoryId, obstacleCategory]);

  // จัดการการเปลี่ยนแปลงข้อมูลในฟอร์ม
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, 
      obstacle: {
        ...formData.obstacle,
        [name]:  name === "subcategoryId" ? Number(value) : value,
        [name]: name === "description" ? value.replace(/^\s+/, "") : value,
      },
    });
  };

  // จัดการการเปลี่ยนแปลงตำแหน่ง
  const handlePositionChange = (index: number, value: string) => {
    // ตรวจสอบว่าค่าที่ป้อนว่างเปล่าหรือไม่
    if (value === "") {
      if (index === 0) {
        setFormData((prevState) => ({
          ...prevState,
          obstacle: {
            ...prevState.obstacle,
            latitude: "",
          },
        }));
      } else {
        setFormData((prevState) => ({
          ...prevState,
          obstacle: {
            ...prevState.obstacle,
            longitude: "",
          },
        }));
      }
      return;
    }

    // แปลงค่าเป็นตัวเลขและตรวจสอบความถูกต้อง
    const num = parseFloat(value);
    if (!isNaN(num)) {
      if (index === 0) {
        const clampedLat = Math.max(-90, Math.min(90, num));
        setFormData((prevState) => ({
          ...prevState,
          obstacle: {
            ...prevState.obstacle,
            latitude: clampedLat.toString(),
          },
        }));
      } else {
        const clampedLng = Math.max(-180, Math.min(180, num));
        setFormData((prevState) => ({
          ...prevState,
          obstacle: {
            ...prevState.obstacle,
            longitude: clampedLng.toString(),
          },
        }));
      }
    }
  };

  // จัดการการอัปโหลดรูปภาพ
  const handleImageUpload = (file: File) => {
    const isValid = checkFileSizeType({
      file,
      allowedType: ["jpg", "jpeg", "png"],
    });
    if (!isValid) {
      setImageError("ไฟล์รูปต้องเป็น jpg, jpeg, png และขนาดไม่เกิน 10MB");
      return AntdUpload.LIST_IGNORE;
    }
    setImageError("");
    setSelectedImages((prev) => [...prev, file]);
    setPreviewImages((prev) => [...prev, URL.createObjectURL(file)]);
    return false;
  };

  const removeImage = (index: number) => {
    const newImages = [...selectedImages];
    const newPreviews = [...previewImages];

    newImages.splice(index, 1);
    newPreviews.splice(index, 1);

    setSelectedImages(newImages);
    setPreviewImages(newPreviews);
    setImageError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.obstacle.latitude || !formData.obstacle.longitude) {
      setShowLocationError(true);
      return;
    }
    setShowLocationError(false);

    setSaving(true);

    try {
      let uploadedUrls: string[] = [];
      if (selectedImages.length > 0) {
        const uploadedResults = await Promise.all(
          selectedImages.map((file) => uploadFile(file))
        );
        uploadedUrls = uploadedResults
          .map((result) => result.result?.variants || [])
          .flat();
      }

      await createObstacle({
        obstacle: formData.obstacle,
        imageUrl: uploadedUrls,
      });
      setSaving(false);

      // กลับไปยังหน้ารายการอุปสรรค
      router.push("/admin/obstacles");
    } catch (error) {
      console.error("Error saving obstacle:", error);
      setSaving(false);
      alert("เกิดข้อผิดพลาดในการบันทึกอุปสรรค กรุณาลองใหม่อีกครั้ง");
    }
  };

  // ฟังก์ชันเมื่อเลือกตำแหน่งจากแผนที่
  const handleSelectLocation = (location: [number, number]) => {
    setFormData((prevState) =>  ({
      ...prevState,
      obstacle: {
        ...prevState.obstacle,
        latitude: location[0].toFixed(6).toString(),
        longitude: location[1].toFixed(6).toString(),
      },
    }));
  };

  // แสดงหน้า Loading
  if (loadingCategory) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4 mx-auto"></div>
          <p className="text-gray-600">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    );
  }

  // แท็บสำหรับฟอร์ม
  const tabs = [
    { name: "ข้อมูลทั่วไป", icon: <Info size={18} /> },
    { name: "รูปภาพ", icon: <Camera size={18} /> },
  ];

  return (
    <form onSubmit={handleSubmit} className="flex flex-col space-y-6 h-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Link href="/admin/obstacles" className="mr-4">
            <ChevronLeft size={24} className="text-gray-500" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-800">เพิ่มอุปสรรคใหม่</h1>
        </div>

        <div className="flex items-center space-x-3">
          <button
            type="submit"
            disabled={saving}
            className={`px-6 py-2 bg-blue-600 text-white rounded-md ${
              saving ? "opacity-70 cursor-not-allowed" : "hover:bg-blue-700"
            }`}
          >
            {saving ? "กำลังบันทึก..." : "บันทึกข้อมูล"}
          </button>
          <Link
            href="/admin/obstacles"
            className="px-6 py-2 border border-gray-300 rounded-md hover:bg-gray-50 bg-white"
          >
            ยกเลิก
          </Link>
        </div>
      </div>

      {/* Form Tabs */}
      <div className="bg-white rounded-lg shadow flex flex-col h-full overflow-y-hidden">
        <div className="border-b">
          <nav className="flex overflow-x-auto">
            {tabs.map((tab, index) => (
              <button
                type="button"
                key={tab.name}
                onClick={() => setTabIndex(index)}
                className={`px-4 py-3 flex items-center space-x-2 ${
                  tabIndex === index
                    ? "border-b-2 border-blue-500 text-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {tab.icon}
                <span>{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Form Content */}
        <div className="p-6 h-full overflow-y-auto">
          {/* ข้อมูลทั่วไป */}
          <div className={tabIndex === 0 ? "block" : "hidden"}>
            <div className="space-y-6">
              {/* ประเภทอุปสรรค */}
              <div>
                <label
                  htmlFor="category"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  หมวดหมู่อุปสรรค <span className="text-red-500">*</span>
                </label>
                <Select
                  id="category"
                  value={formData.obstacle.categoryId ?? undefined}
                  onChange={(value) => {
                    setFormData({
                      ...formData,
                      obstacle: {
                        ...formData.obstacle,
                        categoryId: value,
                        subcategoryId: 0,
                      },
                    });
                  }}
                  options={obstacleCategory.map((category) => ({
                    value: category.id,
                    label: (
                      <span className="flex items-center gap-2 text-base">
                        {CATEGORY_ICONS[category.nameEn] || "📍"} {category.nameTh}
                      </span>
                    ),
                  }))}
                  className="w-full"
                  size="large"
                  placeholder="เลือกหมวดหมู่"
                  suffixIcon={<ChevronDown size={16} className="text-gray-400" />}
                  loading={loadingCategory}
                />
              </div>

              {/* ประเภทย่อย */}
              {formData.obstacle.categoryId && formData.obstacle.categoryId !== obstacleCategory.find(cat => cat.nameEn === "ETC.")?.id && (
                <div>
                  <label
                    htmlFor="subcategory"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    ประเภทอุปสรรค <span className="text-red-500">*</span>
                  </label>
                  <Select
                    id="subcategory"
                    value={formData.obstacle.subcategoryId ?? undefined}
                    onChange={(value) => {
                      setFormData({
                        ...formData,
                        obstacle: {
                          ...formData.obstacle,
                          subcategoryId: Number(value),
                        },
                      });
                    }}
                    options={obstacleSubCategory.map((subCategory) => ({
                      value: subCategory.id,
                      label: <span className="text-base">{subCategory.nameTh}</span>,
                    }))}
                    className="w-full"
                    size="large"
                    placeholder="เลือกประเภท"
                    suffixIcon={<ChevronDown size={16} className="text-gray-400" />}
                    loading={loadingSubCategory}
                  />
                </div>
              )}

              {/* คำอธิบาย */}
              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  รายละเอียด <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.obstacle.description}
                  onChange={handleChange}
                  required
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="อธิบายรายละเอียดของอุปสรรค"
                />
              </div>

              {/* ตำแหน่ง */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ตำแหน่ง (ละติจูด, ลองจิจูด){" "}
                  <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <input
                      type="number"
                      name="latitude"
                      value={formData.obstacle.latitude ?? ""}
                      onChange={(e) => handlePositionChange(0, e.target.value)}
                      onWheel={(e) => e.currentTarget.blur()}
                      step="0.000001"
                      placeholder="ละติจูด (เช่น 13.7563)"
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500
                        [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none
                        ${showLocationError && (!formData.obstacle.latitude || !formData.obstacle.longitude) ? "border-red-500" : "border-gray-300"}
                      `}
                      max={90}
                      min={-90}
                      required
                    />
                  </div>
                  <div>
                    <input
                      type="number"
                      name="longitude"
                      value={formData.obstacle.longitude ?? ""}
                      onChange={(e) => handlePositionChange(1, e.target.value)}
                      onWheel={(e) => e.currentTarget.blur()}
                      step="0.000001"
                      placeholder="ลองจิจูด (เช่น 100.5018)"
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500
                        [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none
                        ${showLocationError && (!formData.obstacle.latitude || !formData.obstacle.longitude) ? "border-red-500" : "border-gray-300"}
                      `}
                      max={180}
                      min={-180}
                      required
                    />
                  </div>
                  {(!formData.obstacle.latitude || !formData.obstacle.longitude) && (
                    <span className="text-red-500 text-xs col-span-2">
                      กรุณาเลือกตำแหน่งบนแผนที่
                    </span>
                  )}
                </div>
                <div className="aspect-video w-full max-h-[410px]">
                  <MapWithMarker
                      location={
                        formData.obstacle.latitude !== "" &&
                        formData.obstacle.longitude !== "" &&
                        !isNaN(Number(formData.obstacle.latitude)) &&
                        !isNaN(Number(formData.obstacle.longitude))
                          ? [
                              parseFloat(formData.obstacle.latitude),
                              parseFloat(formData.obstacle.longitude),
                            ]
                          : [13.7563, 100.5018]
                      }
                      handleSelectLocation={handleSelectLocation}
                  />
                </div>
              </div>

              {/* ผู้รายงาน */}
              {/* <div>
                <label
                  htmlFor="reportedBy"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  ผู้รายงาน <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="reportedBy"
                  name="reportedBy"
                  value={formData.reportedBy}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="ระบุชื่อผู้รายงาน"
                />
              </div> */}

              {/* สถานะ */}
              <div>
                <label
                  htmlFor="statusId"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  สถานะ <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <label className="flex items-center p-3 border rounded-md hover:bg-gray-50 cursor-pointer transition-colors">
                    <input
                      type="radio"
                      name="statusId"
                      value={1}
                      checked={formData.obstacle.statusId == 1}
                      onChange={handleChange}
                      className="mr-2 h-4 w-4 text-red-600"
                    />
                    <span className="flex items-center gap-1">
                      {/* <span className="w-3 h-3 bg-red-500 rounded-full mr-2"></span>ยังมีอยู่ */}
                      <AlertTriangle size={18} className="text-red-500" />
                      <span>ยังมีอยู่</span>
                    </span>
                  </label>
                  <label className="flex items-center p-3 border rounded-md hover:bg-gray-50 cursor-pointer transition-colors">
                    <input
                      type="radio"
                      name="statusId"
                      value={2}
                      checked={formData.obstacle.statusId == 2}
                      onChange={handleChange}
                      className="mr-2 h-4 w-4 text-green-600"
                    />
                    <span className="flex items-center">
                      {/* <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>แก้ไขแล้ว */}
                      <Check size={18} className="text-green-500" />
                      <span>แก้ไขแล้ว</span>
                    </span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* รูปภาพ */}
          <div className={tabIndex === 1 ? "block" : "hidden"}>
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">
                รูปภาพอุปสรรค
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                อัพโหลดรูปภาพเพื่อแสดงอุปสรรคให้ชัดเจนขึ้น
                ทำให้เจ้าหน้าที่สามารถแก้ไขปัญหาได้ตรงจุด
              </p>

              {/* รูปภาพพรีวิว */}
              {previewImages.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-6">
                  <AntdUpload
                    accept=".jpg,.jpeg,.png"
                    multiple
                    showUploadList={false}
                    beforeUpload={handleImageUpload}
                    customRequest={() => {}}
                    style={{ width: "100%" }}
                  >
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors aspect-[5/3] flex flex-col justify-center">
                      <Upload size={32} className="mx-auto text-gray-400 mb-2" />
                      <p className="text-xs lg:text-sm text-gray-600">
                        คลิกเพื่ออัปโหลดรูปภาพ
                      </p>
                      <p className="text-xs lg:text-sm text-gray-600 mt-1">
                        หรือลากและวางไฟล์ที่นี่
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        PNG, JPG, JPEG สูงสุด 10 MB
                      </p>
                      {imageError && (
                        <div className="text-red-500 text-sm mt-2">{imageError}</div>
                      )}
                    </div>
                  </AntdUpload>
                  
                  {previewImages.map((src, index) => (
                    <div
                      key={index}
                      className="relative aspect-[5/3]"
                    >
                      <img
                        src={src}
                        alt={`รูปที่ ${index + 1}`}
                        className="w-full h-full object-cover rounded-md"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div>
                  <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center mb-2">
                    <p className="text-gray-500">ยังไม่มีรูปภาพ</p>
                  </div>
                  
                  {/* อัพโหลดรูปภาพ */}
                  <AntdUpload
                    accept=".jpg,.jpeg,.png"
                    multiple
                    showUploadList={false}
                    beforeUpload={handleImageUpload}
                    customRequest={() => {}}
                    style={{ width: "100%" }}
                  >
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors">
                      <Upload size={32} className="mx-auto text-gray-400 mb-2" />
                      <p className="text-sm text-gray-600">
                        คลิกเพื่ออัปโหลดรูปภาพ หรือลากและวางไฟล์ที่นี่
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        PNG, JPG, JPEG สูงสุด 10 MB
                      </p>
                      {imageError && (
                        <div className="text-red-500 text-sm mt-2">{imageError}</div>
                      )}
                    </div>
                  </AntdUpload>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
