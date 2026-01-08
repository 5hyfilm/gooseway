// src/app/admin/posts/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Select, Pagination } from "antd";
import {
  ArrowDown,
  ArrowUp,
  ChevronDown,
  Download,
  Eye,
  MessageCircle,
  Plus,
  Search,
  Shield,
  ThumbsUp,
} from "lucide-react";
import type { Category, Post } from "@/lib/types/community";
import { exportPosts, findAllPosts, getPostsCategory } from "@/services/api/endpoints/post";

type SortField =
  | "title"
  | "userId"
  | "createdAt"
  | "likeCount"
  | "commentCount"
  | "categoryId";
type SortDirection = "asc" | "desc";

export default function AdminPosts() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [sortField, setSortField] = useState<SortField>("createdAt");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [postToDelete, setPostToDelete] = useState<Post | null>(null);
  const [postCategory, setPostCategory] = useState<Category[]>([]);

  // ฟังก์ชันเรียงลำดับ (ย้ายมาไว้ตรงนี้)
  function handleSort(field: SortField) {
    if (field === sortField) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  }

  // ฟังก์ชันค้นหา
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // รีเซ็ตหน้าเป็น 1 เมื่อค้นหาใหม่
  };

  // ฟังก์ชันกรองหมวดหมู่
  const handleCategoryChange = (value: string) => {
    setCategoryFilter(value);
    setCurrentPage(1); // รีเซ็ตหน้าเป็น 1 เมื่อเปลี่ยนหมวดหมู่
  };

  // Pagination state
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [pageSize, setPageSize] = useState<number>(10);
    const [total, setTotal] = useState<number>(0);

  // โหลดข้อมูลโพสต์
  useEffect(() => {
   const fetchPosts = async () => {
      setLoading(true);
      try {
        const body = {
          title: searchTerm,
          categoryId: categoryFilter === "all" ? "" : categoryFilter,
          sortBy: [{ column: sortField, direction: sortDirection }],
          limit: pageSize,
          pageNumber: currentPage,
        }

        const res = await findAllPosts(body);
        setPosts(res.data);
        setTotal(res.total);
      } catch (error) {
        console.error("Error fetching posts:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchPosts();
  }, [searchTerm, sortField, sortDirection, categoryFilter, currentPage, pageSize]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categoryData = await getPostsCategory();
        setPostCategory(categoryData);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchCategories();
  }, []);

  // ฟังก์ชันลบโพสต์
  const deletePost = () => {
    if (postToDelete) {
      setPosts(posts.filter((post) => post.id !== postToDelete.id));
      setShowDeleteModal(false);
      setPostToDelete(null);
    }
  };

  const handleExportPosts = async () => {
    try {
      const response = await exportPosts();
      const blob = new Blob([response], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = `posts_export_${new Date().toISOString().split('T')[0]}.xlsx`;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error exporting posts:", error);
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
        <h1 className="text-2xl font-bold text-gray-800">จัดการโพสต์ชุมชน</h1>
        <Link
          href="/admin/posts/add"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center gap-2"
        >
          <Plus size={18} />
          <span>เพิ่มโพสต์ใหม่</span>
        </Link>
      </div>

      {/* ส่วนค้นหาและกรอง */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-grow">
          <input
            type="text"
            placeholder="ค้นหาโพสต์..."
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
              className="h-11 min-w-56"
              suffixIcon={<ChevronDown size={16} className="text-gray-400" />}
              placeholder="เลือกหมวดหมู่"
              options={[
                { value: "all", label: <span className="text-base">ทุกหมวดหมู่</span> },
                ...(postCategory?.map((category) => ({
                  value: category.id.toString(),
                  label: (
                    <span className="text-base">
                      {category.nameTh || category.nameEn}
                    </span>
                  ),
                })) || [])
              ]}
            />
          </div>

          {/* ปุ่มดาวน์โหลด */}
          <button 
          onClick={handleExportPosts}
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
                  onClick={() => handleSort("title")}
                  className="flex items-center"
                >
                  หัวข้อ
                  {sortField === "title" &&
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
                  onClick={() => handleSort("userId")}
                  className="flex items-center"
                >
                  ผู้เขียน
                  {sortField === "userId" &&
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
                  onClick={() => handleSort("createdAt")}
                  className="flex items-center"
                >
                  วันที่โพสต์
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
                  onClick={() => handleSort("likeCount")}
                  className="flex items-center"
                >
                  ถูกใจ
                  {sortField === "likeCount" &&
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
                  onClick={() => handleSort("commentCount")}
                  className="flex items-center"
                >
                  ความคิดเห็น
                  {sortField === "commentCount" &&
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
                if (posts.length === 0) {
                  return (
                    <tr>
                      <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                        ไม่พบข้อมูลโพสต์ชุมชน
                      </td>
                    </tr>
                  );
                }
                return posts.map((post) => (
                  <tr key={post.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 max-w-xs truncate">
                        {post.title}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center">
                        {post.user.roleId == 2 && (
                          <Shield
                            size={16}
                            className="mr-1 text-blue-500"
                            data-tooltip="โพสต์โดยแอดมิน"
                          />
                        )}
                        {post.user.fullName || "ไม่ระบุผู้เขียน"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {post.category.nameTh ?? "ไม่ระบุหมวดหมู่"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {post.createdAt
                        ? new Date(post.createdAt).toLocaleDateString("th-TH")
                        : "ไม่ระบุ"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <ThumbsUp size={16} className="mr-1 text-gray-400" />
                        <span className="text-sm text-gray-500">
                          {post.likeCount || 0}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <MessageCircle size={16} className="mr-1 text-gray-400" />
                        <span className="text-sm text-gray-500">
                          {post.commentCount || 0}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        <Link
                          href={`/admin/posts/view/${post.id}`}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-100"
                          title="ดูรายละเอียด"
                        >
                          <Eye size={18} />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
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
              ยืนยันการลบโพสต์
            </h3>
            <p className="text-gray-600 mb-6">
              คุณต้องการลบโพสต์ &quot;{postToDelete?.title}&quot; ใช่หรือไม่?
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
                onClick={deletePost}
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
