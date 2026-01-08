// src/app/admin/routes/add/page.tsx
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Undo2 } from "lucide-react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { TimePicker } from "antd";
import dayjs from "dayjs";
import { createRoute } from "@/services/api/endpoints/route";
import { createRouteBody } from "@/lib/types/routes";
import '@ant-design/v5-patch-for-react-19';
import { haversineDistance } from "../../../../../utils/mapUtils";

// ทำการ dynamic import ของ MapComponent เพื่อหลีกเลี่ยงปัญหา SSR
const RouteMapComponent = dynamic(
  () => import("@/components/maps/MapWithRoute"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full min-h-[300px] bg-gray-100 animate-pulse flex items-center justify-center">
        <p className="text-gray-500">กำลังโหลดแผนที่...</p>
      </div>
    ),
  }
);

export default function AddRoutePage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<createRouteBody>({
    name: "",
    description: "",
    routeCoordinates: [],
    time: 0,
    isPublic: false,
    routeDate: new Date().toISOString(),
    startLocationName: "",
    endLocationName: "",
    totalDistanceMeters: 0,
  });
  const [showLocationError, setShowLocationError] = useState(false);

  // จัดการการเปลี่ยนแปลงข้อมูลในฟอร์ม
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({ ...prevState, 
        [name]: name === "totalDistanceMeters" ? formData.totalDistanceMeters : value,
        [name]: name === "name" || name === "startLocationName" || name === "endLocationName" ? value.replace(/^\s+/, "") : value,
     }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.totalDistanceMeters === 0) {
      setShowLocationError(true);
      return;
    }

    setSaving(true);
    try {
      await createRoute(formData);
      router.push("/admin/routes");
    } catch (error) {
      console.error("Error saving route:", error);
      setSaving(false);
      alert("เกิดข้อผิดพลาดในการบันทึกเส้นทาง กรุณาลองใหม่อีกครั้ง");
    } finally {
      setSaving(false);
    }
  };

  const calculateTotalDistance = (coords: [number, number][]): number => {
    let total = 0;
    for (let i = 1; i < coords.length; i++) {
      total += haversineDistance(coords[i - 1], coords[i]);
    }
    return total;
  }

  const handleSelectRoute = (selectedRoute: [number, number]) => {
    setFormData((prev) => {
      if (prev) {
        const newCoords = [...prev.routeCoordinates, selectedRoute];
        return {
          ...prev,
          routeCoordinates: newCoords,
          totalDistanceMeters: calculateTotalDistance(newCoords),
        };
      }
      return prev;
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Link href="/admin/routes" className="mr-4">
            <ChevronLeft size={24} className="text-gray-500" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-800">เพิ่มเส้นทางใหม่</h1>
        </div>

        <div className="flex items-center space-x-2">
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
                href="/admin/routes"
                className="px-6 py-2 border border-gray-300 rounded-md hover:bg-gray-50 bg-white"
            >
                ยกเลิก
            </Link>
        </div>
      </div>

      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="space-y-6">
            {/* ข้อมูลเส้นทาง */}
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                ชื่อเส้นทาง <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="ป้อนชื่อเส้นทาง"
              />
            </div>

            {/* จุดเริ่มต้น/ปลายทาง */}
            <div>
              <label
                htmlFor="startLocationName"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                จุดเริ่มต้น <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="startLocationName"
                name="startLocationName"
                value={formData.startLocationName}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="จุดเริ่มต้น เช่น สถานี BTS, MRT หรือจุดที่ต้องการ"
              />
            </div>
            <div>
              <label
                htmlFor="endLocationName"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                ปลายทาง <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="endLocationName"
                name="endLocationName"
                value={formData.endLocationName}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="ปลายทาง เช่น สถานี BTS, MRT หรือจุดที่ต้องการ"
              />
            </div>

            {/* คำอธิบาย */}
            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                รายละเอียด
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="อธิบายรายละเอียดของเส้นทาง"
              />
            </div>

            {/* ระยะทาง */}
            <div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                      <label htmlFor="totalDistanceMeters" className="block text-sm font-medium text-gray-700 mb-1">
                      ระยะทาง (กม.) <span className="text-red-500">*</span>
                      <button
                        type="button"
                        onClick={() => setFormData((prev) => {
                          const newCoords = prev.routeCoordinates.slice(0, -1);
                          return {
                            ...prev,
                            routeCoordinates: newCoords,
                            totalDistanceMeters: calculateTotalDistance(newCoords),
                          };
                        })}
                        disabled={formData.routeCoordinates.length === 0}
                        className={`ml-2 text-gray-500 hover:underline ${
                          formData.routeCoordinates.length === 0 ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                      >
                        <Undo2 size={16} className="inline mr-1" />
                      </button>
                      </label>
                      <input
                          type="number"
                          id="totalDistanceMeters"
                          name="totalDistanceMeters"
                          value={(formData.totalDistanceMeters / 1000).toFixed(2)}
                          onChange={handleChange}
                          readOnly
                          required
                          min={0.01}
                          step={0.01}
                          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500
                            ${showLocationError && formData.totalDistanceMeters === 0 ? "border-red-500" : "border-gray-300"}
                          `}
                          placeholder="ระบุระยะทาง (เมตร)"
                      />
                      {formData.totalDistanceMeters === 0 && (
                        <span className="text-red-500 text-xs">กรุณาเลือกเส้นทางบนแผนที่</span>
                      )}
                  </div>
                  <div>
                      <label htmlFor="time" className="block text-sm font-medium text-gray-700 mb-1">
                          ระยะเวลา <span className="text-red-500">*</span>
                      </label>
                      <TimePicker
                        id="time"
                        name="time"
                        value={formData.time ? dayjs().startOf('day').add(formData.time, 'second') : null}
                        onChange={(time) => {
                            if (time) {
                                // บันทึกเวลาในรูปแบบวินาที
                                const seconds = time.diff(time.startOf('day'), 'second');
                                setFormData((prev) => ({
                                    ...prev,
                                    time: seconds,
                                }));
                            } else {
                                setFormData((prev) => ({
                                    ...prev,
                                    time: 0,
                                }));
                            }
                        }}
                        format="HH:mm:ss"
                        size="large"
                        showNow={false}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="ระบุเวลา (ชั่วโมง:นาที:วินาที)"
                        required
                      />
                  </div>
              </div>

              {/* แผนที่ */}
              <div className="aspect-video w-full max-h-[410px]">
                  {formData && (
                      <RouteMapComponent
                          path={formData.routeCoordinates}
                          handleSelectRoute={handleSelectRoute}
                          isEditable={true}
                      />
                  )}
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
          </div>
        </div>
      </div>
    </form>
  );
}
