"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Activity } from "@/lib/types/dashboard";
import { findAllActivities } from "@/services/api/endpoints/dashboard";
import { Pagination, Select } from "antd";
import {
  ArrowDown,
  ArrowUp,
  ChevronDown,
  // Download,
  Eye,
  Search,
  User,
} from "lucide-react";
import { renderActivityMetaData, getActivityActionLabel, getActivityLabel, viewActivityDetail } from "@/data/dashboard";

type SortField = "entityType" | "action" | "createdAt";
type SortDirection = "asc" | "desc";

const ActivitiesPage = () => {
  const router = useRouter();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [sortField, setSortField] = useState<SortField>("createdAt");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [total, setTotal] = useState<number>(0);

  useEffect(() => {
    const fetchData = async () => {
    setLoading(true);
    try {
        const body = {
        userName: searchTerm,
        entityType: categoryFilter === "all" ? "" : categoryFilter,
        sortBy: [{
          column: sortField,
          direction: sortDirection,
        }],
        limit: pageSize,
        pageNumber: currentPage,
      }

        const res = await findAllActivities(body);
        setActivities(res.data);
        setTotal(res.total);
    } catch (error) {
        console.error("Error fetching dashboard data:", error);

    } finally {
        setLoading(false);
    }
    };
    fetchData();
  }, [searchTerm, sortField, sortDirection, currentPage, pageSize, categoryFilter]);

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

  // ฟังก์ชันเปลี่ยนหน้า
  const handlePageChange = (page: number, newPageSize?: number) => {
    if (newPageSize && newPageSize !== pageSize) {
      setPageSize(newPageSize);
      setCurrentPage(1);
    } else {
      setCurrentPage(page);
    }
  };

  // ฟังก์ชันค้นหา
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  // ฟังก์ชันกรองข้อมูล
  const handleCategoryChange = (value: string) => {
    setCategoryFilter(value);
    setCurrentPage(1);
  };


  // ฟังก์ชันดูรายละเอียดกิจกรรม
  const handleViewActivity = (entityType: string, action: string, entityId: number | undefined) => {
    const path = viewActivityDetail(entityType, action, entityId);
    router.push(path);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">กิจกรรมล่าสุด</h1>
      
      {/* ส่วนค้นหา */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-grow">
          <input
            type="text"
            placeholder="ค้นหาผู้ดำเนินการกิจกรรม..."
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
              id="category"
              value={categoryFilter}
              onChange={handleCategoryChange}
              className="h-11 w-48"
              suffixIcon={<ChevronDown size={16} className="text-gray-400" />}
              placeholder="เลือกหมวดหมู่"
              options={[
                { value: "all", label: "ทุกหมวดหมู่" },
                { value: "user", label: "จัดการผู้ใช้" },
                { value: "location", label: "จัดการสถานที่" },
                { value: "obstacle", label: "จัดการอุปสรรค" },
                { value: "post", label: "จัดการโพสต์" },
                { value: "route", label: "จัดการเส้นทาง" },
              ]}
            />
          </div>

          {/* ปุ่มดาวน์โหลด */}
          {/* <button 
          // onClick={handleExportActivities}
          className="flex items-center gap-2 px-4 py-2 border rounded-md hover:bg-gray-50">
            <Download size={18} />
            <span>ส่งออก</span>
          </button> */}
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
                  วันที่ทำกิจกรรม
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
                ผู้ดำเนินการ
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                <button
                  onClick={() => handleSort("entityType")}
                  className="flex items-center"
                >
                  หมวดหมู่กิจกรรม
                  {sortField === "entityType" &&
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
                  onClick={() => handleSort("action")}
                  className="flex items-center"
                >
                  ประเภทกิจกรรม
                  {sortField === "action" &&
                    (sortDirection === "asc" ? (
                      <ArrowUp size={14} className="ml-1" />
                    ) : (
                      <ArrowDown size={14} className="ml-1" />
                    ))}
                </button>
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-xs text-left font-medium text-gray-500 uppercase tracking-wider"
              >
                รายละเอียดกิจกรรม
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
                      <td colSpan={6} className="px-6 py-4 text-center">
                        <div className="flex justify-center">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                        </div>
                      </td>
                    </tr>
                  );
                }
                if (activities.length === 0) {
                  return (
                    <tr>
                      <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                        ไม่พบข้อมูลกิจกรรม
                      </td>
                    </tr>
                  );
                }
                return activities.map((activities) => (
                  <tr key={activities.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {activities.createdAt
                        ? new Date(activities.createdAt).toLocaleString("th-TH", {
                          year: "numeric",
                          month: "2-digit",
                          day: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: false
                        })
                        : "ไม่ระบุ"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center">
                        <User size={16} className="mr-2 text-gray-400" />
                        <span className="text-gray-500">
                          {activities?.fullName || "ไม่ระบุผู้ใช้"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="text-sm font-medium text-gray-700">
                          {getActivityLabel(activities.entityType)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center">
                          {getActivityActionLabel(activities.entityType, activities.action)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="text-sm font-medium text-gray-500 max-w-xs truncate">
                          {renderActivityMetaData(activities) || "-"}
                        </span>
                      </div>
                    </td>
                    {!activities.action.startsWith('delete') && 
                    !['login', 'register'].includes(activities.action) && (
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleViewActivity(activities.entityType, activities.action, activities?.entityId)}
                            className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-100"
                            title="ดูรายละเอียด"
                          >
                            <Eye size={18} />
                          </button>
                        </div>
                      </td>
                    )}
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
  
};

export default ActivitiesPage;