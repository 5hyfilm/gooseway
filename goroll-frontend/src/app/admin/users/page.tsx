// src/app/admin/users/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Pagination, Select } from "antd";
import {
  Search,
  Plus,
  Edit,
  ChevronDown,
  Download,
  Phone,
  User,
  ArrowUp,
  ArrowDown,
  ShieldCheck,
} from "lucide-react";
import {
  User as UserType,
  UserRole,
  UserStatus,
  getRoleLabel,
  getStatusLabel,
} from "@/data/users";
import { exportUsers, findAllUsers } from "@/services/api/endpoints/user";
import { UserFindAllResponse } from "@/lib/types/user";

type SortField = "fullName" | "email" | "registeredAt" | "roleId" | "statusId";
type SortDirection = "asc" | "desc";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserFindAllResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortField, setSortField] = useState<SortField>("registeredAt");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [userToDelete, setUserToDelete] = useState<UserType | null>(null);

    // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [total, setTotal] = useState<number>(0);

  // โหลดข้อมูลผู้ใช้งาน
useEffect(() => {
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const body = {
        fullName: searchTerm,
        statusId: statusFilter === "all" ? "" : statusFilter,
        roleId: roleFilter === "all" ? "" : roleFilter,
        sortBy: [
          {
            column: sortField,
            direction: sortDirection,
          },
        ],
        limit: pageSize,
        pageNumber: currentPage,
      };

      const res = await findAllUsers(body);
      setUsers(res.data);
      setTotal(res.total);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };
  fetchUsers();
}, [searchTerm, statusFilter, roleFilter, sortField, sortDirection, currentPage, pageSize]);

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

  // ฟังก์ชันกรองบทบาท
  const handleRoleFilterChange = (value: string) => {
    setRoleFilter(value);
    setCurrentPage(1); // รีเซ็ตหน้าเป็น 1 เมื่อเปลี่ยนบทบาท
  };

  // ฟังก์ชันกรองสถานะ
  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value);
    setCurrentPage(1); // รีเซ็ตหน้าเป็น 1 เมื่อเปลี่ยนสถานะ
  };

  // ฟังก์ชันลบผู้ใช้
  const deleteUser = () => {
    if (userToDelete) {
      // ทำการลบผู้ใช้จากข้อมูล (ในโปรเจคจริงควรเรียก API)
      setUsers(users.filter((user) => user.id !== userToDelete.id));
      setShowDeleteModal(false);
      setUserToDelete(null);
    }
  };

  const handleExportUsers = async () => {
    try {
      const response = await exportUsers();
      const blob = new Blob([response], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = `users_export_${new Date().toISOString().split('T')[0]}.xlsx`;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error exporting users:", error);
      alert("ไม่สามารถส่งออกข้อมูลได้ กรุณาลองใหม่อีกครั้ง");
    }
  };

  // ฟังก์ชันแสดงสถานะด้วยสี
  const getUserStatusBadge = (status: UserStatus) => {
    switch (status.name) {
      case "Active":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            {getStatusLabel(status)}
          </span>
        );
      case "Inactive":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            {getStatusLabel(status)}
          </span>
        );
      case "Suspended":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            {getStatusLabel(status)}
          </span>
        );
      default:
        return null;
    }
  };

  // ฟังก์ชันแสดงบทบาทด้วยสี
  const getUserRoleBadge = (role: UserRole) => {
    switch (role.name) {
      case "admin":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
            <ShieldCheck size={12} className="mr-1" />
            {getRoleLabel(role)}
          </span>
        );
      case "user":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            <User size={12} className="mr-1" />
            {getRoleLabel(role)}
          </span>
        );
      default:
        return null;
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
        <h1 className="text-2xl font-bold text-gray-800">จัดการผู้ใช้งาน</h1>
        <Link
          href="/admin/users/add"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center"
        >
          <Plus size={18} className="mr-2" /> เพิ่มผู้ใช้ใหม่
        </Link>
      </div>

      {/* ส่วนค้นหาและกรอง */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-grow">
          <input
            type="text"
            placeholder="ค้นหาผู้ใช้..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="w-full pl-10 pr-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        </div>

        <div className="flex flex-wrap gap-2">
          {/* กรองตามบทบาท */}
          <div className="relative">
            <Select
              id="role"
              value={roleFilter}
              onChange={handleRoleFilterChange}
              className="w-full h-11"
              placeholder="เลือกบทบาท"
              options={[
                { value: "all", label: <span className="text-base">ทุกบทบาท</span> },
                { value: "1", label: <span className="text-base">ผู้ใช้ทั่วไป</span> },
                { value: "2", label: <span className="text-base">ผู้ดูแลระบบ</span> },
              ]}
              suffixIcon={<ChevronDown className="text-gray-400" size={16} />}
              style={{ minWidth: 100 }}
            />
          </div>

          {/* กรองตามสถานะ */}
          <div className="relative">
            <Select
              value={statusFilter}
              onChange={handleStatusFilterChange}
              className="w-full h-11"
              options={[
                { value: "all", label: <span className="text-base">ทุกสถานะ</span> },
                { value: "1", label: <span className="text-base">กำลังใช้งาน</span> },
                { value: "2", label: <span className="text-base">ไม่ได้ใช้งาน</span> },
                { value: "3", label: <span className="text-base">ระงับการใช้งาน</span> },
              ]}
              suffixIcon={<ChevronDown className="text-gray-400" size={16} />}
              style={{ minWidth: 145 }}
            />
          </div>

          {/* ปุ่มดาวน์โหลด */}
          <button
          onClick={handleExportUsers}
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
                  onClick={() => handleSort("fullName")}
                  className="flex items-center"
                >
                  ชื่อผู้ใช้
                  {sortField === "fullName" &&
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
                  onClick={() => handleSort("email")}
                  className="flex items-center"
                >
                  อีเมล
                  {sortField === "email" &&
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
                ข้อมูลติดต่อ
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                <button
                  onClick={() => handleSort("roleId")}
                  className="flex items-center"
                >
                  บทบาท
                  {sortField === "roleId" &&
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
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                <button
                  onClick={() => handleSort("registeredAt")}
                  className="flex items-center"
                >
                  วันที่สมัคร
                  {sortField === "registeredAt" &&
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
                การจัดการ
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
                  if (users.length === 0) {
                    return (
                      <tr>
                        <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                          ไม่พบข้อมูลผู้ใช้
                        </td>
                      </tr>
                    );
                  }
                  return users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 rounded-full overflow-hidden bg-gray-200">
                            {user.avatarUrl ? (
                              <img
                                src={user.avatarUrl}
                                alt={`รูปโปรไฟล์ของ ${user.fullName}`}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-400 text-4xl">
                                <User size={35} />
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {user.fullName}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{user.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {user.phoneNumber ? (
                          <div className="flex items-center text-sm text-gray-500">
                            <Phone size={14} className="mr-1" />
                            {user.phoneNumber}
                          </div>
                        ) : (
                          <div className="flex items-center text-sm text-gray-500">
                            <Phone size={14} className="mr-1" />
                            ไม่ระบุ
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getUserRoleBadge(user.role)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getUserStatusBadge(user.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(user.registeredAt).toLocaleDateString("th-TH")}
                        {user.lastLogin ? (
                          <div className="text-xs text-gray-400 mt-1">
                            เข้าสู่ระบบล่าสุด:{" "}
                            {new Date(user.lastLogin).toLocaleDateString("th-TH")}
                          </div>
                        ) : (
                          <div className="text-xs text-gray-400 mt-1">
                            เข้าสู่ระบบล่าสุด: ไม่ระบุ
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end items-center space-x-2">
                          <Link
                            href={`/admin/users/edit/${user.id}`}
                            className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-100"
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

      {/* Modal ยืนยันการลบ */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              ยืนยันการลบผู้ใช้
            </h3>
            <p className="text-gray-600 mb-6">
              คุณต้องการลบผู้ใช้ &quot;{userToDelete?.fullName}&quot; ใช่หรือไม่?
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
                onClick={deleteUser}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                ยืนยันการลบ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
