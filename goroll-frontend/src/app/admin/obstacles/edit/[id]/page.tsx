// src/app/admin/obstacles/edit/[id]/page.tsx

"use client";

import { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ChevronLeft,
  Camera,
  X,
  AlertTriangle,
  Clock,
  Check,
  Save,
  Info,
  Calendar,
  User,
  Trash2,
  ChevronDown,
  Upload
} from "lucide-react";
import { Select, Upload as AntdUpload } from "antd";
import MapWithMarker from "@/components/maps/MapWithMarker";
import {
  CATEGORY_ICONS,
  Obstacle,
  ObstacleCategory,
  ObstacleImage,
} from "@/lib/types/obstacle";
import {
  findObstacleById,
  updateObstacle,
  deleteObstacle,
  getObstacleCategory,
  getSubObstacleCategory,
} from "@/services/api/endpoints/obstacle";
import { checkFileSizeType } from "../../../../../../utils/file";
import { uploadFile } from "@/services/api/endpoints/upload";

interface ObstacleData extends Obstacle {
  isAvailable: string;
  isEdited: string;
  img: ObstacleImage[];
}

export default function EditObstaclePage() {
  const router = useRouter();
  const params = useParams();
  const obstacleId = Number(params.id);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [tabIndex, setTabIndex] = useState(0);
  const [obstacleCategory, setObstacleCategory] = useState<ObstacleCategory[]>([]);
  const [obstacleSubCategory, setObstacleSubCategory] = useState<ObstacleCategory[]>([]);
  const [loadingCategory, setLoadingCategory] = useState(true);
  const [loadingSubCategory, setLoadingSubCategory] = useState(false);

  const [formData, setFormData] = useState<ObstacleData>({
    id: obstacleId,
    userId: 0,
    subcategoryId: 0,
    description: "",
    latitude: "",
    longitude: "",
    statusId: 1,
    createdBy: "",
    updatedBy: "",
    createdAt: "",
    updatedAt: "",
    subcategory: {
      id: 0,
      nameEn: "",
      nameTh: "",
      category: {
        id: 0,
        nameEn: "",
        nameTh: "",
      },
    },
    user: {
      id: 0,
      fullName: "",
    },
    isAvailable: "",
    isEdited: "",
    img: [],
  })

  const [originalImage, setOriginalImage] = useState<string[]>([]);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imgObstacleDelete, setImgObstacleDelete] = useState<number[]>([]);
  const [imageError, setImageError] = useState<string>("");
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // โหลดข้อมูลอุปสรรค
  useEffect(() => {
    const fetchObstacle = async () => {
      setLoading(true);
      setNotFound(false);
      try {
        const obstacle = await findObstacleById(obstacleId);
        if (!obstacle) {
          setNotFound(true);
          setLoading(false);
          return;
        }
        setFormData(obstacle);
        
        // ตั้งค่ารูปภาพ (ถ้ามี)
        if (obstacle.img && obstacle.img.length > 0) {
          setOriginalImage(obstacle.img.map((img) => img.imageUrl));
          setPreviewImages(obstacle.img.map((img) => img.imageUrl));
        } else {
          setOriginalImage([]);
          setPreviewImages([]);
        }
      } catch (error) {
        console.error("Error fetching obstacle:", error);
        setLoading(false);
      } finally {
        setLoading(false);
      }
    };

    fetchObstacle();
  }, [obstacleId]);

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
      if (formData.subcategory.category.id) {
        setLoadingSubCategory(true);
        try {
          const subCategoryData = await getSubObstacleCategory(formData.subcategory.category.id);
          setObstacleSubCategory(subCategoryData);

          if (subCategoryData.length > 0 && formData.subcategory.id === 0) {
            setFormData(prev => ({
              ...prev,
              subcategoryId: subCategoryData[0].id,
              subcategory: {
                ...prev.subcategory,
                id: subCategoryData[0].id,
                nameEn: subCategoryData[0].nameEn,
                nameTh: subCategoryData[0].nameTh,
              },
            }));
          }
        } catch (error) {
          console.error("Error loading subcategories:", error);
          setObstacleSubCategory([]);
        } finally {
          setLoadingSubCategory(false);
        }
      } 
    };

    fetchObstaclesSubCategory();
  }, [formData.subcategory.category.id, obstacleCategory]);
  
  const handleChange = (
    e: ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData({
    ...formData,
    [name]: name === "statusId" ? Number(value) : value,
    [name]: name === "description" ? value.replace(/^\s+/, "") : value,
  });
  };

  // จัดการการเปลี่ยนแปลงตำแหน่ง
  const handlePositionChange = (index: number, value: string) => {
    // ตรวจสอบว่าค่าที่ป้อนว่างเปล่าหรือไม่
    if (value === "") {
      if (index === 0) {
        setFormData((prevState) => ({
          ...prevState,
          latitude: "",
        }));
      } else {
        setFormData((prevState) => ({
          ...prevState,
          longitude: "",
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
            latitude: clampedLat.toString(),
        }));
      } else {
        const clampedLng = Math.max(-180, Math.min(180, num));
        setFormData((prevState) => ({
          ...prevState,
          longitude: clampedLng.toString(),
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

  // ลบรูปภาพ
  const removeImage = (index: number) => {
    if (index < originalImage.length) {
      // ลบรูปเดิม (ที่มาจาก server)
      const newOriginalImages = [...originalImage];
      const removedImageUrl = newOriginalImages[index];
      const removedImage = formData.img.find((img) => img.imageUrl === removedImageUrl);
      if (removedImage) {
        setImgObstacleDelete((prev) => [...prev, removedImage.id]);
      }
      newOriginalImages.splice(index, 1);
      setOriginalImage(newOriginalImages);

      // อัปเดต preview (originalImage ที่เหลือ + preview ของ selectedImages)
      setPreviewImages([
        ...newOriginalImages,
        ...selectedImages.map((file) => URL.createObjectURL(file)),
      ]);
    } else {
      // ลบรูปใหม่ (ที่เพิ่งอัปโหลด)
      const newIndex = index - originalImage.length;
      const newImageArray = [...selectedImages];
      newImageArray.splice(newIndex, 1);
      setSelectedImages(newImageArray);

      // อัปเดต preview (originalImage + preview ของ selectedImages ที่เหลือ)
      setPreviewImages([
        ...originalImage,
        ...newImageArray.map((file) => URL.createObjectURL(file)),
      ]);
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);

    try {
      let uploadedUrls: string[] = [];
        if ( selectedImages.length > 0) {
        // อัปโหลดรูปภาพทั้งหมดและรวม URL ของแต่ละรูป
        const uploadedResults = await Promise.all(
          selectedImages.map((file) => uploadFile(file))
        );
        uploadedUrls = uploadedResults
          .map((result) => result.result?.variants || [])
          .flat();
        }

      const body = {
        obstacle: {
          id: formData.id,
          subcategoryId: formData.subcategoryId,
          description: formData.description,
          latitude: formData.latitude,
          longitude: formData.longitude,
          statusId: formData.statusId,
        },
        imgObstacleDelete: imgObstacleDelete,
        imgObstacleAdd: uploadedUrls.map((url) => ({
          imageUrl: url,
        })),
      }

      await updateObstacle(body);
      // กลับไปยังหน้ารายการอุปสรรค
      router.push("/admin/obstacles");
    } catch (error) {
      console.error("Error updating obstacle:", error);
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteObstacle(obstacleId);
      setShowDeleteModal(false);
      router.push("/admin/obstacles");
    }  catch (error) {
      console.error("Error deleting obstacle:", error);
      setShowDeleteModal(false);
      alert("เกิดข้อผิดพลาดในการลบอุปสรรค กรุณาลองใหม่อีกครั้ง");
    }
  };

  const handleSelectLocation = (location: [number, number]) => {
    setFormData((prevState) => ({
      ...prevState,
      latitude: location[0].toFixed(6).toString(),
      longitude: location[1].toFixed(6).toString(),
    }));
  };

  // แสดงหน้า Loading
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

  // แสดงหน้า 404 ถ้าไม่พบข้อมูล
  if (notFound) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          ไม่พบข้อมูลอุปสรรค
        </h2>
        <p className="text-gray-600 mb-6">ไม่พบอุปสรรค ID: {obstacleId}</p>
        <Link
          href="/admin/obstacles"
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          กลับไปยังรายการอุปสรรค
        </Link>
      </div>
    );
  }

  // แท็บสำหรับฟอร์ม
  const tabs = [
    { name: "ข้อมูลทั่วไป", icon: <Info size={18} /> },
    { name: "รูปภาพ", icon: <Camera size={18} /> },
  ];

  return (
    <form onSubmit={handleSubmit} className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Link href="/admin/obstacles" className="mr-4">
            <ChevronLeft size={24} className="text-gray-500" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-800">แก้ไขอุปสรรค</h1>
        </div>

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={saving}
            className={`px-6 py-2 bg-blue-600 text-white rounded-md flex items-center gap-2 ${
              saving ? "opacity-70 cursor-not-allowed" : "hover:bg-blue-700"
            }`}
          >
            {saving ? (
              <>
                <Clock className="animate-spin" size={18} />
                <span>กำลังบันทึก...</span>
              </>
            ) : (
              <>
                <Save size={18} />
                <span>บันทึกการเปลี่ยนแปลง</span>
              </>
            )}
          </button>
          <button
            type="button"
            onClick={() => setShowDeleteModal(true)}
            className="flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            <Trash2 size={16} className="mr-2" />
            ลบอุปสรรค
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
              {/* ข้อมูลการรายงาน */}
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                <h3 className="text-md font-medium text-blue-800 mb-3 flex items-center">
                  <Info size={16} className="mr-2" />
                  ข้อมูลการรายงาน
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <User size={16} className="text-blue-500" />
                    <div>
                      <p className="text-xs text-blue-500">ผู้รายงาน</p>
                      <p className="font-medium text-blue-800">
                        {formData.user.fullName || "ไม่ระบุ"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar size={16} className="text-blue-500" />
                    <div>
                      <p className="text-xs text-blue-500">วันที่รายงาน</p>
                      <p className="font-medium text-blue-800">
                        {new Date(formData.createdAt).toLocaleDateString(
                          "th-TH"
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-blue-500">
                      การยืนยันว่ายังมีอุปสรรคอยู่
                    </p>
                    <p className="font-medium text-blue-800">
                      {formData.isAvailable} คน
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-blue-500">
                      การยืนยันว่าแก้ไขแล้ว
                    </p>
                    <p className="font-medium text-blue-800">
                      {formData.isEdited} คน
                    </p>
                  </div>
                </div>
              </div>

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
                  value={formData.subcategory.category.id || undefined}
                  onChange={(value) => {
                    const selectedCategory = obstacleCategory.find(cat => cat.id === value);
                    setFormData({
                      ...formData,
                      subcategoryId: 0,
                      subcategory: {
                        id: 0,
                        nameEn: "",
                        nameTh: "",
                        category: {
                          id: value,
                          nameEn: selectedCategory?.nameEn || "",
                          nameTh: selectedCategory?.nameTh || "",
                        },
                      },
                    });
                  }}
                  className="w-full"
                  size="large"
                  placeholder="เลือกหมวดหมู่"
                  options={obstacleCategory.map((cat) => ({
                    value: cat.id,
                    label: (
                      <span className="flex items-center gap-2 text-base">
                        {CATEGORY_ICONS[cat.nameEn] || "📍"} {cat.nameTh}
                      </span>
                    ),
                  }))}
                  suffixIcon={<ChevronDown size={16} className="text-gray-400" />}
                  loading={loadingCategory}
                />
              </div>

              {/* ประเภทย่อย */}
              {formData.subcategory.category.id && 
               formData.subcategory.category.nameEn !== "ETC." && 
               obstacleSubCategory.length > 0 && (
                <div>
                  <label
                    htmlFor="subcategory"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    ประเภทอุปสรรค <span className="text-red-500">*</span>
                  </label>
                  <Select
                    id="subcategory"
                    value={formData.subcategory.id || undefined}
                    onChange={(value) => {
                      const selectedSubCategory = obstacleSubCategory.find(sub => sub.id === value);
                      setFormData({
                        ...formData,
                        subcategoryId: value,
                        subcategory: {
                          ...formData.subcategory,
                          id: value,
                          nameEn: selectedSubCategory?.nameEn || "",
                          nameTh: selectedSubCategory?.nameTh || "",
                        },
                      });
                    }}
                    className="w-full"
                    size="large"
                    placeholder="เลือกประเภท"
                    options={obstacleSubCategory.map((sub) => ({
                      value: sub.id,
                      label: (
                        <span className="text-base">
                          {sub.nameTh}
                        </span>
                      ),
                    }))}
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
                  value={formData.description}
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
                    <div className="flex items-center mb-1">
                      <label htmlFor="lat" className="text-xs text-gray-500">
                        ละติจูด
                      </label>
                    </div>
                    <input
                      type="number"
                      id="lat"
                      value={formData.latitude}
                      onChange={(e) => handlePositionChange(0, e.target.value)}
                      onWheel={(e) => e.currentTarget.blur()}
                      step="0.000001"
                      placeholder="ละติจูด (เช่น 13.7563)"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500
                      [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      max={90}
                      min={-90}
                      required
                    />
                  </div>
                  <div>
                    <div className="flex items-center mb-1">
                      <label htmlFor="lng" className="text-xs text-gray-500">
                        ลองจิจูด
                      </label>
                    </div>
                    <input
                      type="number"
                      id="lng"
                      value={formData.longitude}
                      onChange={(e) => handlePositionChange(1, e.target.value)}
                      onWheel={(e) => e.currentTarget.blur()}
                      step="0.000001"
                      placeholder="ลองจิจูด (เช่น 100.5018)"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500
                      [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      max={180}
                      min={-180}
                      required
                    />
                  </div>
                  {(!formData.latitude || !formData.longitude) && (
                    <span className="text-red-500 text-xs col-span-2">
                      กรุณาเลือกตำแหน่งบนแผนที่
                    </span>
                  )}
                </div>
                <div className="aspect-video w-full max-h-[410px]">
                  <MapWithMarker
                    location={
                        formData.latitude !== "" &&
                        formData.longitude !== "" &&
                        !isNaN(Number(formData.latitude)) &&
                        !isNaN(Number(formData.longitude))
                          ? [
                              parseFloat(formData.latitude ?? "0"),
                              parseFloat(formData.longitude ?? "0"),
                            ]
                          : [13.7563, 100.5018]
                    }
                    handleSelectLocation={handleSelectLocation}
                  />
                </div>
              </div>

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
                      checked={formData.statusId == 1}
                      onChange={handleChange}
                      className="mr-2 h-4 w-4 text-red-600"
                    />
                    <span className="flex items-center gap-1">
                      <AlertTriangle size={18} className="text-red-500" />
                      <span>ยังมีอยู่</span>
                    </span>
                  </label>
                  <label className="flex items-center p-3 border rounded-md hover:bg-gray-50 cursor-pointer transition-colors">
                    <input
                      type="radio"
                      name="statusId"
                      value={2}
                      checked={formData.statusId == 2}
                      onChange={handleChange}
                      className="mr-2 h-4 w-4 text-green-600"
                    />
                    <span className="flex items-center gap-1">
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
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors mt-5">
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

      {/* Modal ยืนยันการลบอุปสรรค */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              ยืนยันการลบอุปสรรค
            </h3>
            <p className="text-gray-600 mb-6">
              คุณต้องการลบอุปสรรคนี้ใช่หรือไม่?
              การกระทำนี้ไม่สามารถย้อนกลับได้
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 border rounded-md hover:bg-gray-50"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                ยืนยันการลบ
              </button>
            </div>
          </div>
        </div>
      )}
    </form>
  );
}
