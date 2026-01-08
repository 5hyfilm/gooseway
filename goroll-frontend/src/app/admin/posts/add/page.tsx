// src/app/admin/posts/add/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronDown, ChevronLeft, Plus, Upload, X } from "lucide-react";
import { Select, Upload as AntdUpload } from "antd";
import { createPost, getPostsCategory } from "@/services/api/endpoints/post";
import { Category, CreatePostBody } from "@/lib/types/community";
import { checkFileSizeType } from "../../../../../utils/file";
import { uploadFile } from "@/services/api/endpoints/upload";

export default function AddPostPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<CreatePostBody>({
    title: "",
    content: "",
    categoryId: 1,
    statusId: 3,
    latitude: null,
    longitude: null,
    tag: ["", ""],
    imageUrl: [] as string[],
  });
  const [images, setImages] = useState<File[]>([]);
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [tagError, setTagError] = useState<string>("");
  const [imageError, setImageError] = useState<string>("");
  const [postsCategory, setPostsCategory] = useState<Category[]>([]);
  const [loadingCategory, setLoadingCategory] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categoryData = await getPostsCategory();
        setPostsCategory(categoryData);
      } catch (error) {
        console.error("Error fetching categories:", error);
      } finally {
        setLoadingCategory(false);
      }
    };

    fetchCategories();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ 
      ...prev, 
      [name]: name === "title" || name === "content" ? value.replace(/^\s+/, "") : value,
     }));
  };

  const handleTagChange = (index: number, value: string) => {
    const newTags = [...formData.tag || []];
    newTags[index] = value;

    // กรองแท็กที่ว่างเปล่า
    if (newTags[index].trim() === "") {
      setTagError("กรุณากรอกแท็กให้ครบก่อนเพิ่มแท็กใหม่");
    } else {
      // ตรวจสอบแท็กซ้ำ
      const uniqueTags = new Set(newTags.map(tag => tag.trim().toLowerCase()));
      if (uniqueTags.size < newTags.length) {
        setTagError("มีแท็กซ้ำกัน กรุณาตรวจสอบแท็กของคุณ");
      } else {
        setTagError("");
      }
    }
    setFormData((prev) => ({ ...prev, tag: newTags }));
  };

  const addTagField = () => {
    setFormData((prev) => ({ ...prev, tag: [...prev.tag, ""] }));
  };

  const removeTagField = (index: number) => {
    const newTags = [...formData.tag || []];
    newTags.splice(index, 1);
    setFormData((prev) => ({ ...prev, tag: newTags }));
    setTagError("");
  };

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

  const removeImage = (index: number) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    setImages(newImages);

    const newPreviews = [...previewImages];
    newPreviews.splice(index, 1);
    setPreviewImages(newPreviews);
    setImageError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      // กรองแท็กที่ว่างออก
      const filteredTags = formData.tag.filter((tag) => tag.trim() !== "");

     let uploadedUrls: string[] = [];
      if (images.length > 0) {
        // อัปโหลดรูปภาพทั้งหมดและรวม URL ของแต่ละรูป
        const uploadedResults = await Promise.all(
          images.map((file) => uploadFile(file))
        );
        uploadedUrls = uploadedResults
          .map(result => result.result?.variants || [])
          .flat();
      }

      const body = {
        ...formData,
        tag: filteredTags,
        imageUrl: uploadedUrls,
      }

      await createPost(body)
      // กลับไปยังหน้ารายการโพสต์
      router.push("/admin/posts");
    } catch (error) {
      console.error("Error saving post:", error);
      alert("เกิดข้อผิดพลาดในการบันทึกโพสต์ กรุณาลองใหม่อีกครั้ง");
      setSaving(false);
    } finally {
      setSaving(false);
    }
  };

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
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Link href="/admin/posts" className="mr-4">
            <ChevronLeft size={24} className="text-gray-500" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-800">เพิ่มโพสต์ใหม่</h1>
        </div>
        <div className="flex justify-end gap-2">
          <button
            type="submit"
            disabled={saving}
            className={`px-6 py-2 bg-blue-600 text-white rounded-md ${
              saving ? "opacity-70 cursor-not-allowed" : "hover:bg-blue-700"
            }`}
          >
            {saving ? "กำลังบันทึก..." : "บันทึกโพสต์"}
          </button>
          <Link
            href="/admin/posts"
            className="px-6 py-2 border border-gray-300 rounded-md hover:bg-gray-50 bg-white"
          >
            ยกเลิก
          </Link>
        </div>
      </div>

      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="space-y-6">
            <div>
              <label
                htmlFor="title"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                หัวข้อ <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="กรอกหัวข้อโพสต์"
              />
            </div>

            <div>
              <label
                htmlFor="content"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                เนื้อหา <span className="text-red-500">*</span>
              </label>
              <textarea
                id="content"
                name="content"
                value={formData.content}
                onChange={handleChange}
                required
                rows={8}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="กรอกเนื้อหาโพสต์"
              />
            </div>

            {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-6"> */}
              <div>
                <label
                  htmlFor="categoryId"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  หมวดหมู่ <span className="text-red-500">*</span>
                </label>
                <Select
                  id="categoryId"
                  value={formData.categoryId}
                  onChange={(value) => {
                    setFormData((prev) => ({
                      ...prev,
                      categoryId: value,
                    }));
                  }}
                  className="w-full h-11"
                  suffixIcon={<ChevronDown size={16} className="text-gray-400" />}
                  placeholder="เลือกหมวดหมู่"
                  options={postsCategory.map((category) => ({
                    value: category.id,
                    label: (
                      <span className="text-base">
                        {category.nameTh}
                      </span>
                    ),
                  }))}
                />
              </div>

              {/* <div>
                <label
                  htmlFor="statusId"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  สถานะ <span className="text-red-500">*</span>
                </label>
                <select
                  id="statusId"
                  name="statusId"
                  value={formData.statusId}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="1">แบบร่าง</option>
                  <option value="2">กำลังตรวจสอบ</option>
                  <option value="3">เผยแพร่</option>
                </select>
              </div> */}
            {/* </div> */}

            <div>
              <p className="block text-sm font-medium text-gray-700 mb-1">
                แท็ก
              </p>
              <div className="space-y-2">
                {formData.tag.map((tag, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={tag}
                      onChange={(e) => handleTagChange(index, e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder={`แท็ก ${index + 1}`}
                    />
                    {formData.tag.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeTagField(index)}
                        className="p-2 text-red-500 hover:text-red-700"
                      >
                        <X size={18} />
                      </button>
                    )}
                  </div>
                ))}

                {tagError && (
                  <div className="text-red-500 text-sm">{tagError}</div>
                )}

                <button
                  type="button"
                  onClick={addTagField}
                  className="flex items-center gap-1 text-blue-600 hover:text-blue-800 mt-2"
                >
                  <Plus size={16} />
                  <span>เพิ่มแท็ก</span>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                รูปภาพ
              </label>

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
                      <p className="text-xs lg:text-sm text-gray-600">
                        คลิกเพื่ออัปโหลดรูปภาพ
                      </p>
                      <p className="text-xs lg:text-sm text-gray-600 mt-1">
                        หรือลากและวางไฟล์ที่นี่
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
                  {/* ฟอร์มอัปโหลดรูปภาพ */}
                  <AntdUpload
                    accept=".jpg,.jpeg,.png"
                    multiple
                    showUploadList={false}
                    beforeUpload={handleImageUpload}
                    customRequest={() => {}}
                    style={{ width: "100%" }}
                  >
                    <div className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center cursor-pointer hover:border-blue-500">
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
