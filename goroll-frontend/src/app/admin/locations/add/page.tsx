// src/app/admin/locations/add/page.tsx

"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronDown, ChevronLeft, MapPin, MessageCircle, Upload, X } from "lucide-react";
import { Select, Upload as AntdUpload } from "antd";
import MapWithMarker from "@/components/maps/MapWithMarker";
import { AccessibilityDetailsEditor } from "@/components/admin/AccessibilityDetailsEditor";
import {
  ReviewsEditor,
  ReviewFormData,
} from "@/components/admin/ReviewsEditor";
import { createLocation, getLocationCategory } from "@/services/api/endpoints/location";
import { CreateLocationBody, LocationCategory } from "@/lib/types/location";
import { checkFileSizeType } from "../../../../../utils/file";
import { uploadFile } from "@/services/api/endpoints/upload";

// กำหนด interface สำหรับแท็บ
interface TabItem {
  name: string;
  icon: React.ReactElement;
}

export default function AddLocation() {
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(false);
  const [locationCategory, setLocationCategory] = useState<LocationCategory[]>([]);
  const [loadingCategory, setLoadingCategory] = useState(true);

  // สร้างข้อมูลเริ่มต้นสำหรับ คุณสมบัติการเข้าถึง
  const featureTranslations = {
    1: "ที่จอดรถ",
    2: "ทางเข้าหลัก",
    3: "ทางลาด",
    4: "ทางเดิน",
    5: "ลิฟต์",
    6: "ห้องน้ำ",
    7: "พื้นที่นั่ง",
    8: "พนักงานช่วยเหลือ",
    9: "อื่นๆ",
  };
  const defaultFeatures = Object.keys(featureTranslations).map((key) => ({
    featureId: Number(key),
    imageUrl: [],
    imageFiles: [],
    isGood: null,
  }));

  const [formData, setFormData] = useState<CreateLocationBody>({
    location: {
      categoryId: 1,
      name: "",
      accessLevelId: 1,
      description: "",
      latitude: "",
      longitude: "",
      imageUrl: [],
      isAutoStatus: false,
    },
    features: defaultFeatures,
    review: {
      rating: 0,
      reviewText: "",
    },
  });

  const [images, setImages] = useState<File[]>([]);
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [imageError, setImageError] = useState<string>("");
  const [tabIndex, setTabIndex] = useState<number>(0);

  // แท็บสำหรับฟอร์ม
  const tabs: TabItem[] = [
    { name: "ข้อมูลทั่วไป", icon: <MapPin size={18} /> },
    { name: "การเข้าถึงโดยละเอียด", icon: <MapPin size={18} /> },
    { name: "รีวิวและความคิดเห็น", icon: <MessageCircle size={18} /> },
    { name: "รูปภาพ", icon: <Upload size={18} /> },
  ];

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categoryData = await getLocationCategory();
        setLocationCategory(categoryData);
      } catch (error) {
        console.error("Error fetching categories:", error);
      } finally {
        setLoadingCategory(false);
      }
    };

    fetchCategories();
  }, []);

  // เพิ่มฟังก์ชันสำหรับอัพเดทรีวิว
  const handleReviewsChange = (reviews: ReviewFormData) => {
    setFormData((prevState) => ({
      ...prevState,
      review: reviews
    }));
  };

  // จัดการการเปลี่ยนแปลงข้อมูลในฟอร์ม - แก้ไขประเภทของอีเวนต์
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    let newValue;
    if (name === "description" || name === "name") {
      newValue = value.replace(/^\s+/, "");
    } else if (name === "accessLevelId" || name === "categoryId") {
      newValue = Number(value);
    } else {
      newValue = value;
    }
    setFormData((prevState) => ({
      ...prevState,
      location: {
        ...prevState.location,
        [name]: newValue,
      },
    }));
  };

  // จัดการการเปลี่ยนแปลงตำแหน่ง
  const handlePositionChange = (index: number, value: string) => {
    // ตรวจสอบว่าค่าที่ป้อนว่างเปล่าหรือไม่
    if (value === "") {
      if (index === 0) {
        setFormData((prevState) => ({
          ...prevState,
          location: {
            ...prevState.location,
            latitude: "",
          },
        }));
      } else {
        setFormData((prevState) => ({
          ...prevState,
          location: {
            ...prevState.location,
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
          location: {
            ...prevState.location,
            latitude: clampedLat.toString(),
          },
        }));
      } else {
        const clampedLng = Math.max(-180, Math.min(180, num));
        setFormData((prevState) => ({
          ...prevState,
          location: {
            ...prevState.location,
            longitude: clampedLng.toString(),
          },
        }));
      }
    }
  };

  // ฟังก์ชันอัพเดทข้อมูลการเข้าถึงโดยละเอียด
  const handleUpdateAccessibilityFeature = (features: CreateLocationBody["features"]) => {
    setFormData((prevState) => ({
      ...prevState,
      features,
    }));
  };

  // จัดการการอัปโหลดรูปภาพ - แก้ไขประเภทของอีเวนต์
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
    setImages((prev) => [...prev, file]);
    setPreviewImages((prev) => [...prev, URL.createObjectURL(file)]);
    return false;
  };

  // ลบรูปภาพ
  const removeImage = (index: number) => {
    const newImages = [...images];
    const newPreviewImages = [...previewImages];

    // ลบออกจากอาร์เรย์
    newImages.splice(index, 1);
    newPreviewImages.splice(index, 1);

    setImages(newImages);
    setPreviewImages(newPreviewImages);
    setImageError("");
  };

  // บันทึกข้อมูล
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formData.location.latitude || !formData.location.longitude) {
      setTabIndex(0);
      return;
    }
    setLoading(true);

    try {
       // กรองคุณสมบัติที่ว่างออกและอัปโหลดรูปภาพของแต่ละ feature
      const filteredFeaturesArr = await Promise.all(
        (formData.features ?? []).map(async (feature) => {
          const imageFiles = (feature.imageFiles ?? []).filter((img) => img instanceof File);
          let imageUrls: string[] = [];

          if (imageFiles.length > 0) {
            const uploadResults = await Promise.all(
              imageFiles.map((file) => uploadFile(file))
            );
            imageUrls = uploadResults
              .map((result) => (result.result?.variants?.[0] ?? null))
              .filter(Boolean) as string[];
          }

          return {
            featureId: feature.featureId,
            imageUrl: imageUrls,
            isGood: feature.isGood ?? null,
          };
        })
      );

      const filteredFeatures = filteredFeaturesArr.filter(
        (f) =>
          (Array.isArray(f.imageUrl) && f.imageUrl.length > 0) ||
          typeof f.isGood === "boolean"
      );

       // กรองรีวิวที่ว่างออก
      const hasReview =
        formData.review &&
        (formData.review.rating > 0 ||
          (formData.review.reviewText && formData.review.reviewText.trim() !== ""));

      // อัปโหลดรูปภาพสถานที่
      let uploadedUrls: string[] = []; 
      if (images.length > 0) {
        const uploadedResults = await Promise.all(
          images.map((file) => uploadFile(file))
        );
        uploadedUrls = uploadedResults
          .map((result) => result.result?.variants || [])
          .flat();
      }

      const body = {
        location: {
          ...formData.location,
          imageUrl: uploadedUrls,
        },
        features: filteredFeatures,
        ...(hasReview ? { review: formData.review } : {}),
      };

      console.log("Submitting location data:", body);
      await createLocation(body)
      // กลับไปยังหน้ารายการสถานที่
      router.push("/admin/locations");
    } catch (error) {
      // แสดงข้อความแสดงข้อผิดพลาด
      console.error("Error saving location:", error);
      alert("เกิดข้อผิดพลาดในการบันทึกข้อมูล กรุณาลองใหม่อีกครั้ง");
    } finally {
      setLoading(false);
    }
  };

  // ฟังก์ชันเมื่อเลือกตำแหน่งจากแผนที่
  const handleSelectLocation = (location: [number, number]) => {
    setFormData((prevState) => ({
      ...prevState,
      location: {
        ...prevState.location,
        latitude: location[0].toFixed(6).toString(),
        longitude: location[1].toFixed(6).toString(),
      },
    }));
  };

  const mappedFeatures = (formData.features ?? []).map((f) => ({
    featureId: f.featureId,
    img: (f.imageUrl ?? []).map((url, idx) => ({
      id: idx,
      imageUrl: url,
      featureId: f.featureId,
    })),
    imageFiles: f.imageFiles ?? [],
    isGood: f.isGood,
    featureMediaId: f.featureId,
  }));

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

  return (
    <form onSubmit={handleSubmit} className="flex flex-col space-y-6 h-full">
      {/* Header */}
      <div className="flex items-center justify-between gap-5 flex-wrap">
        <div className="flex items-center">
          <Link href="/admin/locations" className="mr-4">
            <ChevronLeft size={24} className="text-gray-500" />
          </Link>
          <h1 className="text-lg md:text-xl lg:text-2xl font-bold text-gray-800">
            เพิ่มสถานที่ใหม่
          </h1>
        </div>

        <div className="flex items-center space-x-4">
          {/* <button
            type="button"
            onClick={openLocationOnMap}
            className="flex items-center px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 text-sm md:text-base"
          >
            <MapPin size={16} className="mr-2" />
            ดูบนแผนที่
          </button> */}
          <button
            type="submit"
            disabled={loading}
            className={`px-6 py-2 bg-blue-600 text-white text-sm md:text-base rounded-md ${
              loading ? "opacity-70 cursor-not-allowed" : "hover:bg-blue-700"
            }`}
          >
            {loading ? "กำลังบันทึก..." : "บันทึกข้อมูล"}
          </button>
          <Link
            href="/admin/locations"
            className="px-6 py-2 border border-gray-300 bg-white rounded-md hover:bg-gray-50 text-sm md:text-base"
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
                className={`flex-shrink-0 px-4 py-3 flex items-center space-x-2 ${
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
                    value={formData.location.name}
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
                    value={formData.location.categoryId.toString()}
                    onChange={(value) =>
                      setFormData((prevState) => ({
                        ...prevState,
                        location: {
                          ...prevState.location,
                          categoryId: Number(value),
                        },
                      }))
                    }
                    className="w-full h-11"
                    placeholder="เลือกหมวดหมู่"
                    suffixIcon={<ChevronDown size={16} className="text-gray-400" />}
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
                <div className="flex flex-wrap gap-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="accessLevelId"
                      value={1}
                      checked={formData.location.accessLevelId === 1}
                      onChange={handleChange}
                      className="mr-2"
                    />
                    <span className="flex items-center">
                      <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>เข้าถึงได้ง่าย
                    </span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="accessLevelId"
                      value={2}
                      checked={formData.location.accessLevelId === 2}
                      onChange={handleChange}
                      className="mr-2"
                    />
                    <span className="flex items-center">
                      <span className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></span>เข้าถึงได้ปานกลาง
                    </span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="accessLevelId"
                      value={3}
                      checked={formData.location.accessLevelId === 3}
                      onChange={handleChange}
                      className="mr-2"
                    />
                    <span className="flex items-center">
                      <span className="w-3 h-3 bg-red-500 rounded-full mr-2"></span>เข้าถึงได้ยาก
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
                  value={formData.location.description}
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
                      name="latitude"
                      value={(formData.location.latitude) ?? ""}
                      onChange={(e) => handlePositionChange(0, e.target.value)}
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
                      name="longitude"
                      value={formData.location.longitude ?? ""}
                      onChange={(e) => handlePositionChange(1, e.target.value)}
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
                  {(!formData.location.latitude || !formData.location.longitude) && (
                    <span className="text-red-500 text-xs col-span-2">
                      กรุณาเลือกตำแหน่งบนแผนที่
                    </span>
                  )}
                </div>
                <div className="aspect-video w-full max-h-[410px]">
                  <MapWithMarker
                     location={
                        formData.location.latitude !== "" &&
                        formData.location.longitude !== "" &&
                        !isNaN(Number(formData.location.latitude)) &&
                        !isNaN(Number(formData.location.longitude))
                          ? [
                              parseFloat(formData.location.latitude),
                              parseFloat(formData.location.longitude),
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
              features={mappedFeatures}
              onUpdate={(updatedFeatures) => {
                console.log("Updated features:", updatedFeatures);
                const newFeatures = updatedFeatures.map((f) => ({
                  featureId: f.featureId,
                  imageUrl: (f.img ?? []).map((img) => img.imageUrl),
                  imageFiles: Array.isArray(f.imageFiles) ? f.imageFiles : [],
                  isGood: f.isGood ?? null,
                }));
                handleUpdateAccessibilityFeature(newFeatures);
              }}
              editable={true} // กำหนดให้สามารถกด like/dislike ได้
            />
          </div>

          {/* รีวิวและความคิดเห็น */}
          <div className={tabIndex === 2 ? "block" : "hidden"}>
            <ReviewsEditor
              onChange={handleReviewsChange}
            />
          </div>

          {/* รูปภาพ */}
          <div className={tabIndex === 3 ? "block" : "hidden"}>
            <div className="space-y-4">
              <p className="block text-sm font-medium text-gray-700 mb-2">
                รูปภาพสถานที่
              </p>

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
                    <div key={index} className="relative aspect-[5/3]">
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
