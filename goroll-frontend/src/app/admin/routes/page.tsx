"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Pagination } from "antd";
import {
  ArrowDown,
  ArrowUp,
  Download,
  Eye,
  MapPin,
  Plus,
  Search,
  User,
} from "lucide-react";
import { Route } from "@/lib/types/routes";
import { exportRoutes, findAllRoutes } from "@/services/api/endpoints/route";

type SortField = "startLocationName" | "endLocationName" | "totalDistanceMeters" | "createdAt";
type SortDirection = "asc" | "desc";

export default function AdminRoutesPage() {
  const router = useRouter();
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [sortField, setSortField] = useState<SortField>("createdAt");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [total, setTotal] = useState<number>(0);
  
  // โหลดข้อมูลเส้นทาง
  useEffect(() => {
    const fetchRoutes = async () => {
      setLoading(true);
      try {
       const body = {
        name: searchTerm,
        sortBy: [{
          column: sortField,
          direction: sortDirection,
        }],
        limit: pageSize,
        pageNumber: currentPage,
       }

       const res = await findAllRoutes(body);
        setRoutes(res.data);
        setTotal(res.total);
      } catch (error) {
        console.error("Error fetching routes:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRoutes();
  }, [ searchTerm, sortField, sortDirection, currentPage, pageSize]);

  // ฟังก์ชันเปลี่ยนการเรียงลำดับ
  const handleSort = (field: SortField) => {
    if (field === sortField) {
      // ถ้าคลิกฟิลด์เดิม เปลี่ยนทิศทางการเรียง
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      // ถ้าคลิกฟิลด์ใหม่ ตั้งค่าฟิลด์และทิศทางเริ่มต้น
      setSortField(field);
      setSortDirection("desc");
    }
  };

  // ฟังก์ชันค้นหา
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // รีเซ็ตหน้าเป็น 1 เมื่อค้นหาใหม่
  };

  // ฟังก์ชันดูรายละเอียดเส้นทาง
  const viewRouteDetails = (route: Route) => {
    router.push(`/admin/routes/view/${route.id}`);
  };

  const handleExportRoutes = async () => {
    try {
      const response = await exportRoutes();
      const blob = new Blob([response], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = `routes_export_${new Date().toISOString().split('T')[0]}.xlsx`;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error exporting routes:", error);
      alert("ไม่สามารถส่งออกข้อมูลได้ กรุณาลองใหม่อีกครั้ง");
    }
  };

  // ฟังก์ชันเปลี่ยนหน้า
  const handlePageChange = (page: number, newPageSize?: number) => {
    if (newPageSize && newPageSize !== pageSize) {
      setPageSize(newPageSize);
      setCurrentPage(1);
    } else {
      setCurrentPage(page);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">จัดการเส้นทาง</h1>
        <Link
          href="/admin/routes/add"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center"
        >
          <Plus size={18} className="mr-2" /> เพิ่มเส้นทางใหม่
        </Link>
      </div>

      {/* ส่วนค้นหา */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-grow">
          <input
            type="text"
            placeholder="ค้นหาจุดเริ่มต้นหรือปลายทาง..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="w-full pl-10 pr-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        </div>

        <div className="flex flex-wrap gap-2">
          {/* ปุ่มดาวน์โหลด */}
          <button 
          onClick={handleExportRoutes}
          className="flex items-center gap-2 px-4 py-2 border rounded-md hover:bg-gray-50">
            <Download size={18} />
            <span>ส่งออก</span>
          </button>
        </div>
      </div>

      {/* ตารางแสดงข้อมูล */}
      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                <button
                  onClick={() => handleSort("createdAt")}
                  className="flex items-center"
                >
                  วันที่สร้าง
                  {sortField === "createdAt" &&
                    (sortDirection === "asc" ? (
                      <ArrowUp size={14} className="ml-1" />
                    ) : (
                      <ArrowDown size={14} className="ml-1" />
                    ))}
                </button>
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                <button
                  onClick={() => handleSort("startLocationName")}
                  className="flex items-center"
                >
                  จุดเริ่มต้น
                  {sortField === "startLocationName" &&
                    (sortDirection === "asc" ? (
                      <ArrowUp size={14} className="ml-1" />
                    ) : (
                      <ArrowDown size={14} className="ml-1" />
                    ))}
                </button>
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                <button
                  onClick={() => handleSort("endLocationName")}
                  className="flex items-center"
                >
                  ปลายทาง
                  {sortField === "endLocationName" &&
                    (sortDirection === "asc" ? (
                      <ArrowUp size={14} className="ml-1" />
                    ) : (
                      <ArrowDown size={14} className="ml-1" />
                    ))}
                </button>
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                <button
                  onClick={() => handleSort("totalDistanceMeters")}
                  className="flex items-center"
                >
                  ระยะทาง
                  {sortField === "totalDistanceMeters" &&
                    (sortDirection === "asc" ? (
                      <ArrowUp size={14} className="ml-1" />
                    ) : (
                      <ArrowDown size={14} className="ml-1" />
                    ))}
                </button>
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                ผู้ใช้งาน
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                การจัดการ
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {
              (() => {
                // แสดง Loading
                if (loading) {
                  return (
                    <tr>
                      <td colSpan={7} className="px-6 py-4 text-center">
                        <div className="flex justify-center">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                        </div>
                      </td>
                    </tr>
                  );
                }
                if (routes.length === 0) {
                  return (
                    <tr>
                      <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                        ไม่พบข้อมูลเส้นทาง
                      </td>
                    </tr>
                  );
                }
                return routes.map((route) => (
                  <tr key={route.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {route.createdAt
                        ? new Date(route.createdAt).toLocaleDateString("th-TH")
                        : "ไม่ระบุ"}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <MapPin size={16} className="mr-2 text-gray-400" />
                        <span className="font-medium text-gray-900">
                          {route.startLocationName || "-"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <MapPin size={16} className="mr-2 text-gray-400" />
                        <span className="font-medium text-gray-900">
                          {route.endLocationName || "-"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {(route.totalDistanceMeters / 1000).toFixed(2)} km
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <User size={16} className="mr-2 text-gray-400" />
                        <span className="text-gray-900">
                          {route.user ? route.user.fullName : "ไม่ระบุผู้ใช้"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => viewRouteDetails(route)}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-100"
                          title="ดูรายละเอียด"
                        >
                          <Eye size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ));
              })()
            }
          </tbody>
        </table>
      </div>

      <div className="py-2 flex justify-center items-center">
        <Pagination
          total={total}
          showTotal={(total) => `Total ${total} items`}
          pageSize={pageSize}
          current={currentPage}
          onChange={handlePageChange}
          showSizeChanger
          pageSizeOptions={['10', '20', '50', '100']}
        />
      </div>
    </div>
  );
}
