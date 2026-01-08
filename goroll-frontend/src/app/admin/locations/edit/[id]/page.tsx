// src/app/admin/locations/edit/[id]/page.tsx

"use client";

import { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ChevronDown,
  ChevronLeft,
  MapPin,
  MessageCircle,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { Select, Upload as AntdUpload } from "antd";
import MapWithMarker from "@/components/maps/MapWithMarker";
import { AccessibilityDetailsEditor } from "@/components/admin/AccessibilityDetailsEditor";
import { ReviewsManager } from "@/components/admin/ReviewsManager";
import type {
  Location,
  LocationFeature,
  Image,
  Review,
  LocationCategory,
} from "@/lib/types/location";
import {
  deleteLocation,
  deleteReview,
  getLocationById,
  getLocationCategory,
  updateLocation,
  calculateLocationFeatures,
} from "@/services/api/endpoints/location";
import { checkFileSizeType } from "../../../../../../utils/file";
import { uploadFile } from "@/services/api/endpoints/upload";

// สำหรับการจัดการรูปภาพที่ถูกลบ
interface LocationDeletedImage extends LocationFeature {
  deletedImgIds?: number[];
}

// สำหรับการจัดการรูปภาพที่อัปโหลดใหม่
interface FeatureMediaImageWithFile extends Image {
  isNew?: boolean;
  file?: File;
}

//  สำหรับข้อมูลฟอร์มที่ใช้ในการแก้ไขสถานที่
interface LocationFormData extends Omit<Location, "latitude" | "longitude"> {
  latitude: string;
  longitude: string;
  reviews: Review[];
  img: Image[];
  featureMedia: LocationDeletedImage[];
}

export default function EditLocation() {
  const router = useRouter();
  const params = useParams();
  const locationId = Number(params.id);

  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [originalName, setOriginalName] = useState<string>("");
  const [locationCategory, setLocationCategory] = useState<LocationCategory[]>(
    []
  );
  const [selectedReviewId, setSelectedReviewId] = useState<number | null>(null);
  const [showDeleteReviewModal, setShowDeleteReviewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [formData, setFormData] = useState<LocationFormData>({
    id: 0,
    name: "",
    accessLevelId: 0,
    categoryId: 0,
    description: "",
    latitude: "",
    longitude: "",
    createdAt: "",
    updatedAt: "",
    category: {
      id: 1,
      nameEn: "Shopping Mall",
      nameTh: "ห้างสรรพสินค้า",
    },
    accessLevel: {
      id: 1,
      nameEn: "Hard to Access",
      nameTh: "เข้าถึงยาก",
    },
    reviews: [],
    img: [],
    featureMedia: [
      {
        featureId: 0,
        featureMediaId: 0,
        goodCount: 0,
        notGoodCount: 0,
        img: [],
      },
    ],
    isAutoStatus: true,
  });
  const [originalImages, setOriginalImages] = useState<string[]>([]);
  const [newImages, setNewImages] = useState<File[]>([]);
  const [imgLocationDelete, setImgLocationDelete] = useState<number[]>([]);
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [imageError, setImageError] = useState<string>("");
  const [tabIndex, setTabIndex] = useState<number>(0);
  const [notFound, setNotFound] = useState<boolean>(false);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  // const [currentAccessLevel, setCurrentAccessLevel] = useState<number | null>(
  //   null
  // );

  // แท็บสำหรับฟอร์ม
  // src/app/admin/locations/edit/[id]/page.tsx

  const tabs = [
    { name: "ข้อมูลทั่วไป", icon: <MapPin size={18} /> },
    { name: "การเข้าถึงโดยละเอียด", icon: <MapPin size={18} /> },
    { name: "รีวิวและความคิดเห็น", icon: <MessageCircle size={18} /> },
    { name: "รูปภาพ", icon: <Upload size={18} /> },
  ];

  // โหลดข้อมูลสถานที่ที่ต้องการแก้ไข
  useEffect(() => {
    const fetchLocation = async () => {
      setLoading(true);
      setNotFound(false);
      try {
        const location = await getLocationById(locationId);

        if (!location) {
          setNotFound(true);
          return;
        }
        setFormData(location);
        setOriginalName(location.name ?? "");
        // setCurrentAccessLevel(location.accessLevelId);

        if (location.img && location.img.length > 0) {
          // เก็บ URL ของรูปภาพเดิมสำหรับพรีวิว
          const imageUrls = location.img.map((img) => img.imageUrl);
          setOriginalImages(imageUrls);
          setPreviewImages(imageUrls);
        } else {
          setOriginalImages([]);
          setPreviewImages([]);
        }
      } catch (error) {
        console.error("Error fetching location data:", error);
        setNotFound(true);
        alert("ไม่พบข้อมูลสถานที่ที่ต้องการแก้ไข");
      } finally {
        setLoading(false);
      }
    };

    fetchLocation();
  }, [locationId]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categoryData = await getLocationCategory();
        setLocationCategory(categoryData);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const getUserId = () => {
      const user = localStorage.getItem("user");
      if (user) {
        const userData = JSON.parse(user);
        if (userData.id) {
          setCurrentUserId(userData.id);
          return;
        }
      }
    };

    getUserId();
  }, []);

  // จัดการการเปลี่ยนแปลงข้อมูลในฟอร์ม
  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    let newValue;
    if (name === "description" || name === "name") {
      newValue = value.replace(/^\s+/, "");
    } else if (name === "accessLevelId") {
      newValue = Number(value);
    } else {
      newValue = value;
    }
    setFormData({
      ...formData,
      [name]: newValue,
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
    setNewImages((prev) => [...prev, file]);
    setPreviewImages((prev) => [...prev, URL.createObjectURL(file)]);
    return false;
  };

  // ลบรูปภาพเดิม
  const removeOriginalImage = (index: number) => {
    const newOriginalImages = [...originalImages];
    // ตรวจสอบว่ามีรูปภาพเดิมหรือไม่
    const removedImageUrl = newOriginalImages[index];
    // ถ้ามีรูปภาพเดิม ให้หาค่า id ของรูปภาพนั้นจาก formData.img
    const removedImage = formData.img.find(
      (img) => img.imageUrl === removedImageUrl
    );
    if (removedImage) {
      setImgLocationDelete((prev) => [...prev, removedImage.id]);
    }
    newOriginalImages.splice(index, 1);
    setOriginalImages(newOriginalImages);

    // อัพเดทพรีวิว
    setPreviewImages([
      ...newOriginalImages,
      ...newImages.map((file) => URL.createObjectURL(file)),
    ]);
    setImageError("");
  };

  // ลบรูปภาพใหม่
  const removeNewImage = (index: number) => {
    const newImageArray = [...newImages];
    newImageArray.splice(index, 1);
    setNewImages(newImageArray);

    // อัพเดทพรีวิว
    setPreviewImages([
      ...originalImages,
      ...newImageArray.map((file) => URL.createObjectURL(file)),
    ]);
    setImageError("");
  };

  // อัพเดทข้อมูลคุณสมบัติการเข้าถึงโดยละเอียด
  const handleUpdateAccessibilityFeature = (
    featureMedia: LocationDeletedImage[]
  ) => {
    setFormData((prevState) => ({
      ...prevState,
      featureMedia,
    }));
  };

  // บันทึกข้อมูล
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    if (showDeleteModal || showDeleteReviewModal) {
      e.preventDefault();
      return;
    }

    e.preventDefault();
    setSaving(true);

    try {
      // กรองคุณสมบัติที่ว่างออกและอัปโหลดรูปภาพของแต่ละ feature
      const featureMediaWithUploads = await Promise.all(
        formData.featureMedia.map(async (feature) => {
          const newFeatureImages = (
            feature.img as FeatureMediaImageWithFile[]
          ).filter((img) => img.isNew && img.file);

          let uploadedFeatureUrls: string[] = [];
          if (newFeatureImages.length > 0) {
            const uploadedResults = await Promise.all(
              newFeatureImages.map((img) => uploadFile(img.file as File))
            );
            uploadedFeatureUrls = uploadedResults
              .map((result) => result.result?.variants?.[0] || "")
              .filter((url) => !!url);
          }

          return {
            featureId: feature.featureId,
            imgDelete: feature.deletedImgIds || [],
            imgAdd: uploadedFeatureUrls.map((url) => ({
              imageUrl: url,
            })),
          };
        })
      );

      // อัปโหลดรูปภาพสถานที่
      let uploadedUrls: string[] = [];
      if (newImages.length > 0) {
        const uploadedResults = await Promise.all(
          newImages.map((file) => uploadFile(file))
        );
        uploadedUrls = uploadedResults
          .map((result) => result.result?.variants || [])
          .flat();
      }

      const body = {
        id: formData.id,
        name: formData.name,
        accessLevelId: formData.accessLevelId,
        categoryId: formData.categoryId,
        description: formData.description,
        latitude: formData.latitude,
        longitude: formData.longitude,
        imgLocationDelete: imgLocationDelete,
        imgLocationAdd: uploadedUrls.map((url) => ({
          imageUrl: url,
        })),
        featureMedia: featureMediaWithUploads,
        isAutoStatus: formData.isAutoStatus,
      };

      console.log("Submitting location data:", body);
      await updateLocation(body);
      router.push("/admin/locations");
    } catch (error) {
      console.error("Error saving location:", error);
      alert("เกิดข้อผิดพลาดในการบันทึกข้อมูล กรุณาลองใหม่อีกครั้ง");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteLocation(locationId);

      setShowDeleteModal(false);
      router.push("/admin/locations");
    } catch (error) {
      console.error("Error deleting location:", error);
      setShowDeleteModal(false);
      alert("เกิดข้อผิดพลาดในการลบสถานที่ กรุณาลองใหม่อีกครั้ง");
    }
  };

  // ลบรีวิว
  const handleReviewDelete = async (reviewId: number) => {
    setSelectedReviewId(reviewId);
    setShowDeleteReviewModal(true);
  };

  const confirmDeleteReview = async () => {
    if (!selectedReviewId) return;
    try {
      await deleteReview(selectedReviewId);
      setFormData((prev) => ({
        ...prev,
        reviews: prev.reviews.filter((r) => r.id !== selectedReviewId),
      }));
      setShowDeleteReviewModal(false);
      setSelectedReviewId(null);
    } catch (error) {
      console.error("Error deleting review:", error);
      setShowDeleteReviewModal(false);
      setSelectedReviewId(null);
      alert("เกิดข้อผิดพลาดในการลบความคิดเห็น กรุณาลองใหม่อีกครั้ง");
    }
  };

  // แก้ไขรีวิว
  const handleReviewEdit = async (
    reviewId: number,
    newText: string,
    newRating: number
  ) => {
    try {
      // เรียก API เพื่อบันทึกการแก้ไขรีวิว
      // await updateReview(reviewId, { reviewText: newText });

      setFormData((prev) => ({
        ...prev,
        reviews: prev.reviews.map((review) =>
          review.id === reviewId
            ? { ...review, reviewText: newText, rating: newRating }
            : review
        ),
      }));
    } catch (error) {
      console.error("Error updating review:", error);
      alert("เกิดข้อผิดพลาดในการแก้ไขรีวิว กรุณาลองใหม่อีกครั้ง");
    }
  };

  const handleSelectLocation = (location: [number, number]) => {
    setFormData((prevState) => ({
      ...prevState,
      latitude: location[0].toFixed(6).toString(),
      longitude: location[1].toFixed(6).toString(),
    }));
  };

  const handleCalculateFeatures = async () => {
    try {
      const res = await calculateLocationFeatures(formData.id.toString());
      setFormData((prevState) => ({
        ...prevState,
        accessLevelId: res.status,
      }));
    } catch (error) {
      console.log("Error calculating features:", error);
    }
  };

  // แสดงหน้า 404 ถ้าไม่พบข้อมูล
  if (notFound && !loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">404</h1>
          <p className="text-gray-600 mb-6">
            ไม่พบข้อมูลสถานที่ที่ต้องการแก้ไข
          </p>
          <Link
            href="/admin/locations"
            className="bg-blue-600 text-white px-4 py-2 rounded-md inline-flex items-center"
          >
            <ChevronLeft size={16} className="mr-2" />
            กลับไปหน้ารายการสถานที่
          </Link>
        </div>
      </div>
    );
  }

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

  return (
    <>
      <form onSubmit={handleSubmit} className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Link href="/admin/locations" className="mr-4">
              <ChevronLeft size={24} className="text-gray-500" />
            </Link>
            <h1 className="text-2xl font-bold text-gray-800">
              แก้ไขสถานที่: {originalName}
            </h1>
          </div>

          <div className="flex gap-2">
            {/* <button
              type="button"
              onClick={openLocationOnMap}
              className="flex items-center px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
            >
              <MapPin size={16} className="mr-2" />
              ดูบนแผนที่
            </button> */}
            <button
              type="submit"
              disabled={saving}
              className={`px-6 py-2 bg-blue-600 text-white rounded-md ${
                saving ? "opacity-70 cursor-not-allowed" : "hover:bg-blue-700"
              }`}
            >
              {saving ? "กำลังบันทึก..." : "บันทึกการเปลี่ยนแปลง"}
            </button>
            <button
              type="button"
              onClick={() => setShowDeleteModal(true)}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center gap-2"
            >
              <Trash2 size={16} />
              <span>ลบสถานที่</span>
            </button>
            <Link
              href="/admin/locations"
              className="px-6 py-2 border border-gray-300 bg-white rounded-md hover:bg-gray-50"
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
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      ชื่อสถานที่ <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="ป้อนชื่อสถานที่"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="categoryId"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      หมวดหมู่ <span className="text-red-500">*</span>
                    </label>
                    <Select
                      id="categoryId"
                      value={formData.categoryId.toString()}
                      onChange={(value) => {
                        setFormData((prevState) => ({
                          ...prevState,
                          categoryId: Number(value),
                        }));
                      }}
                      className="w-full h-11"
                      placeholder="เลือกหมวดหมู่"
                      suffixIcon={
                        <ChevronDown size={16} className="text-gray-400" />
                      }
                      options={locationCategory.map((category) => ({
                        value: category.id.toString(),
                        label: (
                          <span className="text-base">
                            {category.nameTh || category.nameEn}
                          </span>
                        ),
                      }))}
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="accessLevelId"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    ระดับการเข้าถึง <span className="text-red-500">*</span>
                  </label>
                  {/* <div className="flex border p-2 rounded-md bg-gray-50">
                    {(() => {
                      let accessLevelClass = "";
                      if (formData.accessLevelId === 1) {
                        accessLevelClass = "inline-block w-3 h-3 bg-green-500 rounded-full mr-1";
                      } else if (formData.accessLevelId === 2) {
                        accessLevelClass = "inline-block w-3 h-3 bg-yellow-500 rounded-full mr-1";
                      } else {
                        accessLevelClass = "inline-block w-3 h-3 bg-red-500 rounded-full mr-1";
                      }
                      return (
                        <p>
                          <span className={accessLevelClass}></span> {formData.accessLevel.nameTh}
                        </p>
                      );
                    })()}
                  </div> */}
                  <div className="space-y-2">
                    <div className="flex gap-4">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="accessLevelId"
                          value={1}
                          checked={formData.accessLevelId === 1}
                          onChange={handleChange}
                          className="mr-2 disabled:cursor-not-allowed"
                          disabled={formData.isAutoStatus}
                        />
                        <span className="flex items-center">
                          <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
                          เข้าถึงได้ง่าย
                        </span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="accessLevelId"
                          value={2}
                          checked={formData.accessLevelId === 2}
                          onChange={handleChange}
                          className="mr-2 disabled:cursor-not-allowed"
                          disabled={formData.isAutoStatus}
                        />
                        <span className="flex items-center">
                          <span className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></span>
                          เข้าถึงได้ปานกลาง
                        </span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="accessLevelId"
                          value={3}
                          checked={formData.accessLevelId === 3}
                          onChange={handleChange}
                          className="mr-2 disabled:cursor-not-allowed"
                          disabled={formData.isAutoStatus}
                        />
                        <span className="flex items-center">
                          <span className="w-3 h-3 bg-red-500 rounded-full mr-2"></span>
                          เข้าถึงได้ยาก
                        </span>
                      </label>
                    </div>
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.isAutoStatus}
                        onChange={async (e) => {
                          const newValue = e.target.checked;
                          setFormData((prev) => ({
                            ...prev,
                            isAutoStatus: newValue,
                          }));
                          if (newValue) {
                            await handleCalculateFeatures();
                          }
                        }}
                        className="mr-2 cursor-pointer"
                      />
                      <span className="flex items-center">
                        เปลี่ยนสถานะการเข้าถึงอัตโนมัติ
                      </span>
                    </label>
                  </div>
                </div>

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
                    placeholder="ข้อมูลเกี่ยวกับสถานที่นี้"
                  />
                </div>

                <div className="space-y-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ตำแหน่ง (ละติจูด, ลองจิจูด){" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <input
                        type="number"
                        value={formData.latitude ?? ""}
                        onChange={(e) =>
                          handlePositionChange(0, e.target.value)
                        }
                        onWheel={(e) => e.currentTarget.blur()}
                        step="0.00000001"
                        placeholder="ละติจูด (เช่น 13.7563)"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500
                          [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        max={90}
                        min={-90}
                        required
                      />
                    </div>
                    <div>
                      <input
                        type="number"
                        value={formData.longitude ?? ""}
                        onChange={(e) =>
                          handlePositionChange(1, e.target.value)
                        }
                        onWheel={(e) => e.currentTarget.blur()}
                        step="0.00000001"
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
              </div>
            </div>

            {/* การเข้าถึงโดยละเอียด */}
            <div className={tabIndex === 1 ? "block" : "hidden"}>
              <AccessibilityDetailsEditor
                locationId={formData.id}
                features={formData.featureMedia ?? []}
                onUpdate={handleUpdateAccessibilityFeature}
                editable={true}
              />
            </div>

            {/* รีวิวและความคิดเห็น */}
            <div className={tabIndex === 2 ? "block" : "hidden"}>
              <ReviewsManager
                reviewData={formData.reviews}
                currentUserId={currentUserId}
                onDelete={handleReviewDelete}
                onEdit={handleReviewEdit}
              />
            </div>

            {/* รูปภาพ */}
            <div className={tabIndex === 3 ? "block" : "hidden"}>
              <div className="space-y-4">
                <h3 className="block text-sm font-medium text-gray-700 mb-2">
                  รูปภาพสถานที่
                </h3>

                {/* รูปภาพพรีวิว */}
                {previewImages.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-4">
                    <AntdUpload
                      accept=".jpg,.jpeg,.png"
                      multiple
                      showUploadList={false}
                      beforeUpload={handleImageUpload}
                      customRequest={() => {}}
                      style={{ width: "100%" }}
                    >
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors aspect-[5/3] flex flex-col justify-center">
                        <Upload
                          size={32}
                          className="mx-auto text-gray-400 mb-2"
                        />
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
                          <div className="text-red-500 text-sm mt-2">
                            {imageError}
                          </div>
                        )}
                      </div>
                    </AntdUpload>
                    {originalImages.map((src, index) => (
                      <div
                        key={`original-${index}`}
                        className="relative aspect-[5/3]"
                      >
                        <img
                          src={src}
                          alt={`รูปที่ ${index + 1}`}
                          className="w-full h-full object-cover rounded-md"
                        />
                        <button
                          type="button"
                          onClick={() => removeOriginalImage(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}

                    {newImages.map((file, index) => (
                      <div
                        key={`new-${index}`}
                        className="relative aspect-[5/3]"
                      >
                        <img
                          src={URL.createObjectURL(file)}
                          alt={`รูปใหม่ที่ ${index + 1}`}
                          className="w-full h-full object-cover rounded-md"
                        />
                        <button
                          type="button"
                          onClick={() => removeNewImage(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                        >
                          <X size={16} />
                        </button>
                        <div className="absolute bottom-0 left-0 right-0 bg-green-500 text-white text-xs py-1 px-2 text-center">
                          รูปใหม่
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div>
                    <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center mb-2">
                      <p className="text-gray-500">ยังไม่มีรูปภาพ</p>
                    </div>
                    {/* ฟอร์มอัปโหลดรูปภาพ */}
                    <AntdUpload
                      accept=".jpg,.jpeg,.png"
                      multiple
                      showUploadList={false}
                      beforeUpload={handleImageUpload}
                      customRequest={() => {}}
                      style={{ width: "100%" }}
                    >
                      <div className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center cursor-pointer hover:border-blue-500 mt-5">
                        <Upload
                          size={32}
                          className="mx-auto text-gray-400 mb-2"
                        />
                        <p className="text-sm text-gray-600">
                          คลิกเพื่ออัปโหลดรูปภาพ หรือลากและวางไฟล์ที่นี่
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          PNG, JPG, JPEG สูงสุด 10 MB
                        </p>
                        {imageError && (
                          <div className="text-red-500 text-sm mt-2">
                            {imageError}
                          </div>
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

      {/* Modal ยืนยันการลบสถานที่ */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              ยืนยันการลบสถานที่
            </h3>
            <p className="text-gray-600 mb-6">
              คุณต้องการลบผสถานที่ &quot;{formData.name}&quot; ใช่หรือไม่?
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

      {/* Modal ยืนยันการลบความคิดเห็น */}
      {showDeleteReviewModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              ยืนยันการลบความคิดเห็น
            </h3>
            <p className="text-gray-600 mb-6">
              คุณต้องการลบความคิดเห็นนี้ใช่หรือไม่?
              การกระทำนี้ไม่สามารถย้อนกลับได้
            </p>
            <div className="flex justify-end gap-4">
              <button
                type="button"
                onClick={() => {
                  setShowDeleteReviewModal(false);
                  setSelectedReviewId(null);
                }}
                className="px-4 py-2 border rounded-md hover:bg-gray-50"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={confirmDeleteReview}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                ยืนยันการลบ
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
