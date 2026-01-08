"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ChevronLeft,
  MapPin,
  Route as RouteIcon,
  User,
  Trash2,
  TimerIcon,
  MapPinCheck,
  MapPinOff,
} from "lucide-react";
import { Route } from "@/lib/types/routes";
import { findRouteById, deleteRouteById, updateVisibilityRoute } from "@/services/api/endpoints/route";

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

export default function RouteDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const routeId = params.id as string;

  const [route, setRoute] = useState<Route | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showVisibilityModal, setShowVisibilityModal] = useState(false);

  useEffect(() => {
    const fetchRoute = async () => {
      setLoading(true);
     try {
      const routes = await findRouteById(routeId);
      if (!routes) {
        setLoading(false);
        return;
      }

      setRoute(routes);
     } catch (error) {
      console.error("Error fetching route:", error);
      setRoute(null);
     } finally {
      setLoading(false);
     }
    };

    fetchRoute();
  }, [routeId]);

  const handleSelectRoute = (selectedRoute: [number, number]) => {
    console.log("Selected route:", selectedRoute);
    setRoute((prev) => {
      if (prev) {
        return {
          ...prev,
          path: [...prev.routeCoordinates, selectedRoute],
        };
      }
      return prev;
    });
  };

  const handleDelete = async () => {
    try {
      await deleteRouteById(routeId);
      setShowDeleteModal(false);
     
      // Redirect กลับไปยังหน้ารายการเส้นทาง
      router.push("/admin/routes");
    } catch (error) {
      console.error("Error deleting route:", error);
      alert("ไม่สามารถลบเส้นทางได้ กรุณาลองใหม่อีกครั้ง");
      setShowDeleteModal(false);
    }
  };

  const handleToggleVisibility = async () => {
    if (!route) return;
    try {
      await updateVisibilityRoute({
        id: route.id,
        isPublic: !route.isPublic,
      });
      setShowVisibilityModal(false);
      setRoute((prev) =>
        prev ? { ...prev, isPublic: !prev.isPublic } : prev
      );
    } catch (error) {
      console.error("Error updating route visibility:", error);
      alert("เกิดข้อผิดพลาดในการเปลี่ยนสถานะการแสดงเส้นทาง");
      setShowVisibilityModal(false);
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

  if (!route) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          ไม่พบข้อมูลเส้นทาง
        </h2>
        <p className="text-gray-600 mb-6">ไม่พบเส้นทาง ID: {routeId}</p>
        <Link
          href="/admin/routes"
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          กลับไปยังรายการเส้นทาง
        </Link>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center">
          <Link href="/admin/routes" className="mr-4">
            <ChevronLeft size={24} className="text-gray-500" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-800">
            รายละเอียดเส้นทาง
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowVisibilityModal(true)}
            className={`px-4 py-2 ${
              route.isPublic
                ? "bg-green-500 hover:bg-green-600"
                : "bg-yellow-500 hover:bg-yellow-600"
            } text-white rounded-md flex items-center gap-2`}
          >
            {route.isPublic ? (
              <>
                <MapPinCheck size={18} />
                <span>แสดงสู่สาธารณะ</span>
              </>
            ) : (
              <>
                <MapPinOff size={18} />
                <span>ไม่แสดงสู่สาธารณะ</span>
              </>
            )}
          </button>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center gap-2"
          >
            <Trash2 size={18} />
            <span>ลบเส้นทาง</span>
          </button>
        </div>
      </div>

      {/* เนื้อหาหลัก */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ข้อมูลเส้นทาง */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <MapPin className="text-blue-500 w-5 h-5 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-gray-500">จุดเริ่มต้น</p>
                  <p className="font-medium text-xl">{route.startLocationName || "-"}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="text-red-500 w-5 h-5 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-gray-500">ปลายทาง</p>
                  <p className="font-medium text-xl">{route.endLocationName || "-"}</p>
                </div>
              </div>
            </div>

            <div className="border-t pt-6 space-y-4">
              <div className="flex items-start gap-3">
                <RouteIcon className="text-blue-500 w-5 h-5 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-gray-500">ระยะทาง</p>
                  <p className="font-medium text-lg">{(route.totalDistanceMeters / 1000).toFixed(2)} กม.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <TimerIcon className="text-yellow-500 w-5 h-5 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-gray-500">ระยะเวลา</p>
                  <p className="font-medium text-lg">
                    {route.time
                    ? (() => {
                        const hours = Math.floor(route.time / 3600);
                        const minutes = Math.floor((route.time % 3600) / 60);
                        const seconds = route.time % 60;
                        return [
                          hours ? `${hours} ชม.` : null,
                          minutes ? `${minutes} นาที` : null,
                          seconds ? `${seconds} วินาที` : null,
                        ]
                          .filter(Boolean)
                          .join(" ");
                      })()
                    : "ไม่ระบุ"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <User className="text-purple-500 w-5 h-5 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-gray-500">ผู้ใช้</p>
                  <p className="font-medium text-lg">{
                    route.user.fullName || "ไม่ระบุผู้ใช้"}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* แผนที่ */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow p-6 z-0">
          <h2 className="text-lg font-semibold mb-4">แผนที่เส้นทาง</h2>
          <div className="h-[400px] w-full">
            {route && (
              <RouteMapComponent
                path={route.routeCoordinates}
                handleSelectRoute={handleSelectRoute}
              />
            )}
          </div>
        </div>
      </div>

      {/* Modal ยืนยันการลบ */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              ยืนยันการลบเส้นทาง
            </h3>
            {route.startLocationName && route.endLocationName ? (
              <p className="text-gray-600 mb-6">
                คุณต้องการลบเส้นทางจาก &quot;{route.startLocationName}&quot; ไป &quot;
                {route.endLocationName}&quot; ใช่หรือไม่? การกระทำนี้ไม่สามารถย้อนกลับได้
              </p>
            ) : (
              <p className="text-gray-600 mb-6">
                คุณต้องการลบเส้นทางนี้ใช่หรือไม่? การกระทำนี้ไม่สามารถย้อนกลับได้
              </p>
            )}
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

      {/* Modal ยืนยันการเปลี่ยนสถานะการแสดงเส้นทาง */}
      {showVisibilityModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              ยืนยันการเปลี่ยนสถานะการแสดงเส้นทาง
            </h3>
            <p className="text-gray-600 mb-6">
              คุณต้องการ {route.isPublic ? "ไม่แสดง" : "แสดง"} เส้นทางนี้ต่อสาธารณะหรือไม่?
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowVisibilityModal(false)}
                className="px-4 py-2 border rounded-md hover:bg-gray-50"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleToggleVisibility}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                ยืนยัน
              </button>
            </div>
          </div>    
        </div>
      )}
    </div>
  );
}
