// src/app/admin/obstacles/page.tsx

"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  Check,
  ChevronDown,
  Clock,
  Download,
  Edit,
  MapPin,
  Plus,
  Search,
} from "lucide-react";
import { Pagination, Select } from "antd";
import { Obstacle, ObstacleCategory, ObstacleStatus } from "@/lib/types/obstacle";
import { exportObstacles, findAllObstacles, getObstacleCategory } from "@/services/api/endpoints/obstacle";

interface ObstacleAll extends Obstacle {
  status: ObstacleStatus;
}

// Define type for sorting fields
type SortField = "createdAt" | "description" | "categoryId" | "subcategoryId" | "statusId";
type SortDirection = "asc" | "desc";

export default function AdminObstacles() {
  const [obstacles, setObstacles] = useState<ObstacleAll[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortField, setSortField] = useState<SortField>("createdAt");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [showResolveModal, setShowResolveModal] = useState<boolean>(false);
  const [selectedObstacle, setSelectedObstacle] = useState<ObstacleAll | null>(
    null
  );
  const [obstacleCategory, setObstacleCategory] = useState<ObstacleCategory[]>([]);

   // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [total, setTotal] = useState<number>(0);

  // โหลดข้อมูลอุปสรรค
  useEffect(() => {
    const fetchObstacles = async () => {
      setLoading(true);
      try {
        const body = {
          description: searchTerm,
          categoryId: categoryFilter === "all" ? "" : categoryFilter,
          statusId: statusFilter === "all" ? "" : statusFilter,
          sortBy: [{ column: sortField, direction: sortDirection }],
          limit: pageSize,
          pageNumber: currentPage,
        }

        const res = await findAllObstacles(body);
        setObstacles(res.data);
        setTotal(res.total);
      } catch (error) {
        console.error("Error fetching obstacles:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchObstacles();
  },  [searchTerm, categoryFilter, statusFilter, sortField, sortDirection, currentPage, pageSize]);

  useEffect(() => {
     const fetchCategories = async () => {
      try {
        const categoryData = await getObstacleCategory();
        setObstacleCategory(categoryData);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchCategories();
  }, []);

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
    setCurrentPage(1); // รีเซ็ตหน้าเมื่อค้นหาใหม่
  };

  // ฟังก์ชันกรองตามหมวดหมู่
  const handleCategoryChange = (value: string) => {
    setCategoryFilter(value);
    setCurrentPage(1); // รีเซ็ตหน้าเมื่อเปลี่ยนหมวดหมู่
  };

  // ฟังก์ชันกรองตามสถานะ
  const handleStatusChange = (value: string) => {
    setStatusFilter(value);
    setCurrentPage(1); // รีเซ็ตหน้าเมื่อเปลี่ยนสถานะ
  };

  // ฟังก์ชันเปลี่ยนสถานะอุปสรรค
  const resolveObstacle = () => {
    if (selectedObstacle) {
      // อัพเดทสถานะเป็น "resolved" โดยระบุประเภทให้ถูกต้อง
      const updatedObstacles = obstacles.map((o) =>
        o.id === selectedObstacle.id
          ? { 
              ...o,
              status: {
                id: o.status.id,
                nameEn: "resolved",
                nameTh: "แก้ไขแล้ว",
              },
           }
          : o
      );
      setObstacles(updatedObstacles);
      setShowResolveModal(false);
      setSelectedObstacle(null);
    }
  };
  
  const handleExportObstacles = async () => {
    try {
      const response = await exportObstacles();
      const blob = new Blob([response], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      
      link.href = url;
      link.download = `obstacles_export_${new Date().toISOString().split('T')[0]}.xlsx`;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error exporting obstacles:", error);
      alert("ไม่สามารถส่งออกข้อมูลได้ กรุณาลองใหม่อีกครั้ง");
    }
  };

  // ฟังก์ชันแสดงสถานะด้วยสี
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Existing":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <AlertTriangle size={12} className="mr-1" />
            ยังมีอยู่
          </span>
        );
      case "Resolved":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <Check size={12} className="mr-1" />
            แก้ไขแล้ว
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            <Clock size={12} className="mr-1" />
            ไม่ทราบสถานะ
          </span>
        );
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
        <h1 className="text-2xl font-bold text-gray-800">จัดการอุปสรรค</h1>
        <Link
          href="/admin/obstacles/add"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center gap-2"
        >
          <Plus size={18} />
          <span>เพิ่มอุปสรรคใหม่</span>
        </Link>
      </div>

      {/* ส่วนค้นหาและกรอง */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-grow">
          <input
            type="text"
            placeholder="ค้นหาอุปสรรค..."
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
              className=" h-11 min-w-36"
              placeholder="เลือกหมวดหมู่"
              options={[
                { value: "all", label: <span className="text-base">ทุกหมวดหมู่</span> },
                ...(obstacleCategory?.map((category) => ({
                  value: category.id.toString(),
                  label: (
                    <span className="text-base">
                      {category.nameTh || category.nameEn}
                    </span>
                  ),
                })) || [])
              ]}
              suffixIcon={<ChevronDown className="text-gray-400" size={16} />}
            />
          </div>

          {/* กรองตามสถานะ */}
          <div className="relative">
            <Select
              value={statusFilter}
              onChange={handleStatusChange}
              className="h-11 min-w-32"
              placeholder="เลือกสถานะ"
              options={[
                { value: "all", label: <span className="text-base">ทุกสถานะ</span> },
                { value: "1", label: <span className="text-base">ยังมีอยู่</span> },
                { value: "2", label: <span className="text-base">แก้ไขแล้ว</span> },
              ]}
              suffixIcon={<ChevronDown className="text-gray-400" size={16} />}
            />
          </div>

          {/* ปุ่มดาวน์โหลด */}
          <button 
          onClick={handleExportObstacles}
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
                  วันที่รายงาน
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
                รายละเอียด
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
                  onClick={() => handleSort("subcategoryId")}
                  className="flex items-center"
                >
                  ประเภท
                  {sortField === "subcategoryId" &&
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
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                <button
                  onClick={() => handleSort("statusId")}
                  className="flex items-center"
                >
                  สถานะ
                  {sortField === "statusId" &&
                    (sortDirection === "asc" ? (
                      <ArrowUp size={14} className="ml-1" />
                    ) : (
                      <ArrowDown size={14} className="ml-1" />
                    ))}
                </button>
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                การดำเนินการ
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
              {
                (() => {
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
                  if (obstacles.length === 0) {
                    return (
                      <tr>
                        <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                          ไม่พบข้อมูลอุปสรรค
                        </td>
                      </tr>
                    );
                  }
                  return obstacles.map((obstacle) => (
                    <tr key={obstacle.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(obstacle.createdAt).toLocaleDateString("th-TH")}
                        <div className="text-xs text-gray-400">
                          โดย: {obstacle.user.fullName}
                        </div>
                      </td>

                      <td className="px-6 py-4 text-sm text-gray-900">
                        {/* <div className="font-medium">
                          {obstacle.title ?? obstacle.subcategory.nameTh}
                        </div> */}
                        <div className="text-gray-500 line-clamp-2">
                          {obstacle.description}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {obstacle.subcategory.category.nameTh}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {obstacle.subcategory.nameTh}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center">
                          <MapPin size={16} className="mr-1 text-red-500" />
                          {`${Number(obstacle.latitude).toFixed(
                            4
                          )}, ${Number(obstacle.longitude).toFixed(4)}`}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(obstacle.status.nameEn)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end">
                          <Link
                            href={`/admin/obstacles/view/${obstacle.id}`}
                            className="text-blue-600 hover:text-blue-900 p-1 ml-2 rounded hover:bg-blue-100"
                            title="ดูรายละเอียด"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              strokeWidth={1.5}
                              stroke="currentColor"
                              className="w-5 h-5"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                            </svg>
                          </Link>
                          <Link
                            href={`/admin/obstacles/edit/${obstacle.id}`}
                            className="text-green-600 hover:text-green-900 p-1 ml-2 rounded hover:bg-green-100"
                            title="แก้ไข"
                          >
                            <Edit size={18} />
                          </Link>
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

      {/* Modal ยืนยันการเปลี่ยนสถานะ */}
      {showResolveModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              ยืนยันการแก้ไขอุปสรรค
            </h3>
            <p className="text-gray-600 mb-6">
              คุณต้องการทำเครื่องหมายอุปสรรคนี้เป็น &quot;แก้ไขแล้ว&quot;
              ใช่หรือไม่?
              <br />
              หมายเหตุ: ผู้ใช้จะไม่สามารถระบุอุปสรรคนี้เป็น
              &quot;ยังมีอยู่&quot; ได้อีกหลังจากเจ้าหน้าที่ยืนยันการแก้ไขแล้ว
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowResolveModal(false)}
                className="px-4 py-2 border rounded-md hover:bg-gray-50"
              >
                ยกเลิก
              </button>
              <button
                onClick={resolveObstacle}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                ยืนยันการแก้ไข
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
