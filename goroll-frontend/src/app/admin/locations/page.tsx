// src/app/admin/locations/page.tsx

"use client";

import { useState, useEffect, ChangeEvent } from "react";
import Link from "next/link";
import {
  ArrowDown,
  ArrowUp,
  ChevronDown,
  Download,
  Edit,
  Map as MapIcon,
  MapPin,
  Plus,
  Search,
} from "lucide-react";
import { Pagination, Select } from "antd";
import type { Location, LocationCategory } from "@/lib/types/location";
import { exportLocations, findAllLocations, getLocationCategory } from "@/services/api/endpoints/location";

type SortField = "name" | "categoryId" | "accessLevelId";
type SortDirection = "asc" | "desc";

export default function AdminLocations() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [accessibilityFilter, setAccessibilityFilter] =
    useState<string>("all");
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [locationCategory, setLocationCategory] = useState<LocationCategory[]>([]);

  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [total, setTotal] = useState<number>(0);

  // โหลดข้อมูลสถานที่
  useEffect(() => {
    const fetchLocations = async () => {
      setLoading(true);
      try {
        const body = {
          name: searchTerm,
          categoryId: categoryFilter === "all" ? "" : categoryFilter,
          accessLevelId: accessibilityFilter === "all" ? "" : accessibilityFilter,
          sortBy: [
            {
              column: sortField,
              direction: sortDirection,
            }
          ],
          limit: pageSize,
          pageNumber: currentPage,
        }

        const res = await findAllLocations(body);
        setLocations(res.data);
        setTotal(res.total);
      } catch (error) {
        console.error("Error fetching locations:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchLocations();
  }, [searchTerm, categoryFilter, accessibilityFilter, sortField, sortDirection, currentPage, pageSize]);

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

  const handleViewOnMap = (location: Location) => {
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${location.latitude},${location.longitude}`;

    window.open(mapsUrl, "_blank", "noopener,noreferrer");
  };

  // ฟังก์ชันเปลี่ยนการเรียงลำดับ
  const handleSort = (field: SortField) => {
    if (field === sortField) {
      // ถ้าคลิกฟิลด์เดิม เปลี่ยนทิศทางการเรียง
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      // ถ้าคลิกฟิลด์ใหม่ ตั้งค่าฟิลด์และทิศทางเริ่มต้น
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // ฟังก์ชันค้นหา
  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  // ฟังก์ชันกรองข้อมูล
  const handleCategoryChange = (value: string) => {
    setCategoryFilter(value);
    setCurrentPage(1);
  };

  // ฟังก์ชันกรองตามระดับการเข้าถึง
  const handleAccessibilityChange = (value: string) => {
    setAccessibilityFilter(value);
    setCurrentPage(1);
  };

  const handleExportLocations = async () => {
    try {
      const response = await exportLocations();
      const blob = new Blob([response], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");

      a.href = url;
      a.download = `locations_export_${new Date().toISOString().split('T')[0]}.xlsx`;
      
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error exporting locations:", error);
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
        <h1 className="text-2xl font-bold text-gray-800">จัดการสถานที่</h1>
        <Link
          href="/admin/locations/add"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center"
        >
          <Plus size={18} className="mr-2" /> เพิ่มสถานที่ใหม่
        </Link>
      </div>

      {/* ส่วนค้นหาและกรอง */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-grow">
          <input
            type="text"
            placeholder="ค้นหาสถานที่..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="w-full pl-10 pr-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        </div>

        <div className="flex flex-wrap gap-2">
          {/* กรองตามหมวดหมู่ */}
          <div className="relative">
            <Select
              value={categoryFilter}
              onChange={handleCategoryChange}
              className="w-full h-11"
              placeholder="เลือกหมวดหมู่"
              options={[
                { value: "all", label: <span className="text-base">ทุกหมวดหมู่</span> },
                ...(locationCategory?.map((category) => ({
                  value: category.id.toString(),
                  label: (
                    <span className="text-base">
                      {category.nameTh || category.nameEn}
                    </span>
                  ),
                })) || [])
              ]}
              suffixIcon={<ChevronDown className="text-gray-400" size={16} />}
              style={{ minWidth: 175 }}
            />
          </div>

          {/* กรองตามระดับการเข้าถึง */}
          <div className="relative">
            <Select
              value={accessibilityFilter}
              onChange={handleAccessibilityChange}
              className="w-full h-11"
              placeholder="เลือกระดับการเข้าถึง"
              options={[
                { value: "all", label: <span className="text-base">ทุกระดับการเข้าถึง</span> },
                { value: "1", label: <span className="text-base">เข้าถึงได้ง่าย</span> },
                { value: "2", label: <span className="text-base">เข้าถึงได้ปานกลาง</span> },
                { value: "3", label: <span className="text-base">เข้าถึงได้ยาก</span> },
              ]}
              suffixIcon={<ChevronDown className="text-gray-400" size={16} />}
              style={{ minWidth: 170 }}
            />
          </div>

          {/* ปุ่มดาวน์โหลด */}
          <button 
          onClick={handleExportLocations}
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
                  onClick={() => handleSort("name")}
                  className="flex items-center"
                >
                  ชื่อสถานที่
                  {sortField === "name" &&
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
                  onClick={() => handleSort("categoryId")}
                  className="flex items-center"
                >
                  หมวดหมู่
                  {sortField === "categoryId" &&
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
                  onClick={() => handleSort("accessLevelId")}
                  className="flex items-center"
                >
                  ระดับการเข้าถึง
                  {sortField === "accessLevelId" &&
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
                ตำแหน่ง
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
                      <td colSpan={5} className="px-6 py-4 text-center">
                        <div className="flex justify-center">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                        </div>
                      </td>
                    </tr>
                  );
                }
                if (locations.length === 0) {
                  return (
                    <tr>
                      <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                        ไม่พบข้อมูลสถานที่
                      </td>
                    </tr>
                  );
                }
                return locations.map((location) => (
                  <tr key={location.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {location.name}
                      </div>
                      <div className="text-sm text-gray-500 truncate max-w-xs">
                        {location.description}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {location.category.nameTh}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getAccessibilityBadgeColor(
                          location.accessLevel
                        )}`}
                      >
                        {location.accessLevel.nameTh}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center">
                        <MapPin size={16} className="mr-1 text-red-500" />
                        {`${Number(location.latitude).toFixed(
                          4
                        )}, ${Number(location.longitude).toFixed(4)}`}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        <Link
                          href={`/admin/locations/edit/${location.id}`}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-100"
                        >
                          <Edit size={18} />
                        </Link>
                        {/* ปุ่มดูบนแผนที่ */}
                        <button
                          onClick={() => handleViewOnMap(location)}
                          className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-100"
                          title="ดูสถานที่บนแผนที่"
                        >
                          <MapIcon size={18} />
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

// Helper functions
function getAccessibilityBadgeColor(
  accessibility: { id: number; nameEn: string; nameTh: string }
): string {
  switch (accessibility.nameEn) {
    case "Easily Accessible":
      return "bg-green-100 text-green-800";
    case "Moderately Accessible":
      return "bg-yellow-100 text-yellow-800";
    case "Hard to Access":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}
