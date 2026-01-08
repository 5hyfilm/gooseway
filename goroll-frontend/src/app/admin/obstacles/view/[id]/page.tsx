// src/app/admin/obstacles/view/[id]/page.tsx

"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  AlertTriangle,
  Calendar,
  Camera,
  Check,
  ChevronLeft,
  Info,
  User,
} from "lucide-react";
import MapWithMarker from "@/components/maps/MapWithMarker";
import {
  CATEGORY_ICONS,
  Obstacle,
  ObstacleImage,
} from "@/lib/types/obstacle";
import { findObstacleById } from "@/services/api/endpoints/obstacle";

interface ObstacleData extends Obstacle {
  isAvailable: string;
  isEdited: string;
  img: ObstacleImage[];
}

export default function EditObstaclePage() {
  const params = useParams();
  const obstacleId = Number(params.id);

  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [tabIndex, setTabIndex] = useState(0);

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

  const [previewImages, setPreviewImages] = useState<string[]>([]);

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

        if (obstacle.img && obstacle.img.length > 0) {
          setPreviewImages(obstacle.img.map((img) => img.imageUrl));
        } else {
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
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Link href="/admin/obstacles" className="mr-4">
            <ChevronLeft size={24} className="text-gray-500" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-800">รายละเอียดอุปสรรค</h1>
        </div>
      </div>

      {/* Form Tabs */}
      <div className="bg-white rounded-lg shadow flex flex-col h-full overflow-y-hidden">
        <div className="border-b">
          <nav className="flex overflow-x-auto">
            {tabs.map((tab, index) => (
              <button
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
        <div className="h-full overflow-y-auto">
          {/* ข้อมูลทั่วไป */}
          <div className={tabIndex === 0 ? "block" : "hidden"}>
            <div className="space-y-6 p-6">
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
                <p className="block text-xs text-gray-700 mb-2">หมวดหมู่อุปสรรค</p>
                <p className="font-medium text-gray-700 mb-1">
                  {
                    CATEGORY_ICONS[formData.subcategory.category.nameEn]
                  }{" "}
                  {
                    formData.subcategory.category.nameTh || "ไม่ระบุ"
                  }
                </p>
              </div>

              {/* ประเภทย่อย */}
              {formData.subcategory && formData.subcategory.nameEn !== "Etc." && (
                <div>
                  <p className="block text-xs text-gray-700 mb-2">ประเภทอุปสรรค</p>
                  <p className="font-medium text-gray-700 mb-1">
                    {
                        formData.subcategory.nameTh || "ไม่ระบุ"
                    }
                  </p>
                </div>
              )}

              {/* คำอธิบาย */}
              <div>
                <p className="block text-xs text-gray-700 mb-2">รายละเอียด</p>
                <p className="font-medium text-gray-700 mb-1">{formData.description}</p>
              </div>

              {/* ตำแหน่ง */}
              <div>
                <p className="font-medium text-gray-700 pt-4 mb-2">ตำแหน่ง (ละติจูด, ลองจิจูด)</p>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-gray-500">ละติจูด</p>
                    <p className="font-medium">
                        {formData.latitude}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">ลองจิจูด</p>
                    <p className="font-medium">
                        {formData.longitude}
                    </p>
                  </div>
                </div>
                <div className="aspect-video w-full max-h-[410px]">
                  <MapWithMarker
                    location={[
                      parseFloat(formData.latitude ?? "0"),
                      parseFloat(formData.longitude ?? "0"),
                    ]}
                  />
                </div>
              </div>

              {/* สถานะ */}
              <div>
                <p className="block text-xs text-gray-700 mb-2">สถานะ</p>
                <p>
                    {formData.statusId == 1 ? (
                    <span className="font-medium flex items-center gap-1">
                        <AlertTriangle size={18} className="text-red-500" />
                        <span>ยังมีอยู่</span>
                    </span>
                    ) : (
                    <span className="font-medium flex items-center gap-1">
                        <Check size={18} className="text-green-500" />
                        <span>แก้ไขแล้ว</span>
                    </span>
                    )}
                </p>
                </div>
            </div>
          </div>

          {/* รูปภาพ */}
          <div className={tabIndex === 1 ? "block" : "hidden"}>
            <div className="space-y-6 p-6">
              <h3 className="text-lg font-medium text-gray-900">
                รูปภาพอุปสรรค
              </h3>
              {/* รูปภาพพรีวิว */}
              {previewImages.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-6">
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
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <p className="text-gray-500">ยังไม่มีรูปภาพ</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
