// src/app/admin/posts/edit/[id]/page.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ChevronLeft,
  X,
  Plus,
  Save,
  Upload,
  AlertTriangle,
  ChevronDown,
} from "lucide-react";
import { Select, Upload as AntdUpload } from "antd";
import { Category, PostDetail } from "@/lib/types/community";
import { findPostById, getPostsCategory, updatePost } from "@/services/api/endpoints/post";
import { checkFileSizeType } from "../../../../../../utils/file";
import { uploadFile } from "@/services/api/endpoints/upload";

export default function EditPostPage() {
  const router = useRouter();
  const params = useParams();
  const postId = Number(params.id);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [notAdmin, setNotAdmin] = useState(false); // เพิ่มสถานะนี้เพื่อตรวจสอบว่าเป็นโพสต์ของ admin หรือไม่
  const [imageError, setImageError] = useState<string>("");

  const [formData, setFormData] = useState<PostDetail>({
    id: 0,
    userId: 0,
    title: "",
    content: "",
    categoryId: 0,
    statusId: 0,
    latitude: null,
    longitude: null,
    createdAt: "",
    updatedAt: "",
    likeCount: "0",
    commentCount: "0",
    user: { id: 0, fullName: "", avatarUrl: "", roleId: 0 },
    category: { id: 0, nameEn: "" },
    tags: [
      { postId: 0, tag: "" },
    ],
    images: [
      { id: 0, imageUrl: "" },
    ],
  });

  const [originalImages, setOriginalImages] = useState<string[]>([]);
  const [newImages, setNewImages] = useState<File[]>([]);
  const [imgPostDelete, setImgPostDelete] = useState<number[]>([]);
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [originalTags, setOriginalTags] = useState<{ postId: number; tag: string }[]>([]);
  const [tagError, setTagError] = useState<string>("");
  const [postsCategory, setPostsCategory] = useState<Category[]>([]);

  useEffect(() => {
    const fetchPost = async () => {
      setLoading(true);
      setNotFound(false);
      try {
        const post = await findPostById(postId);

        // ตรวจสอบว่าเป็นโพสต์ของ admin หรือไม่
        if (post.user.roleId !== 2) {
          setNotAdmin(true);
          setLoading(false);
          return;
        }

        setFormData(post);
        setOriginalTags(post.tags || []);

        // ตั้งค่ารูปภาพ (ถ้ามี)
        if (post.images && post.images.length > 0) {
          setOriginalImages(post.images.map((img: { id: number; imageUrl: string }) => img.imageUrl));
          setPreviewImages(post.images.map((img: { id: number; imageUrl: string }) => img.imageUrl));
        } else {
          setOriginalImages([]);
          setPreviewImages([]);
        }
      } catch (error) {
        console.error("Error fetching post:", error);
        setLoading(false);
        setNotFound(true);
        return;
      } finally {
        setLoading(false);
      }
    }

    fetchPost();
  }, [postId]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categoryData = await getPostsCategory();
        setPostsCategory(categoryData);
      } catch (error) {
        console.error("Error fetching categories:", error);
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
      [name]: name === "categoryId" ? Number(value) : value,
      [name]: name === "title" || name === "content" ? value.replace(/^\s+/, "") : value,
     }));
  };

  const handleTagChange = (index: number, value: string) => {
    const newTags = [...(formData.tags || [])];
    newTags[index] = { ...newTags[index], tag: value };

    // กรองแท็กที่ว่างเปล่า
    if (newTags.some((t) => t.tag.trim() === "")) {
      setTagError("กรุณากรอกแท็กให้ครบก่อนเพิ่มแท็กใหม่");
    } else {
      // ตรวจสอบแท็กซ้ำ
      const tagValues = newTags.map((t) => t.tag.trim().toLowerCase());
      const hasDuplicate = tagValues.some(
        (tag, idx) => tag && tagValues.indexOf(tag) !== idx
      );
      if (hasDuplicate) {
        setTagError("มีแท็กซ้ำกัน กรุณาตรวจสอบแท็กของคุณ");
      } else {
        setTagError("");
      }
    }

    setFormData((prev) => ({ ...prev, tags: newTags }));
  };

  const addTagField = () => {
    setFormData((prev) => ({ ...prev, tags: [
    ...(prev.tags || []),
    { postId: prev.id, tag: "" },
    ] }));
  };

  const removeTagField = (index: number) => {
    const newTags = [
      ...(formData.tags || []),
    ];
    newTags.splice(index, 1);
    setFormData((prev) => ({ ...prev, tags: newTags }));
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
    setNewImages((prev) => [...prev, file]);
    setPreviewImages((prev) => [...prev, URL.createObjectURL(file)]);
    return false;
  };

  const removeOriginalImage = (index: number) => {
    const newOriginalImages = [...originalImages];
    const removedImageUrl = newOriginalImages[index];
    const removedImage = (formData.images ?? []).find(
      (img) => img.imageUrl === removedImageUrl
    );
    if (removedImage) {
      setImgPostDelete((prev) => [...prev, removedImage.id]);
    }
    newOriginalImages.splice(index, 1);
    setOriginalImages(newOriginalImages);

    // อัพเดทพรีวิว
    const newPreviews = [...newOriginalImages];
    newImages.forEach((file) => {
      newPreviews.push(URL.createObjectURL(file));
    });
    setPreviewImages(newPreviews);
    setImageError("");
  };

  const removeNewImage = (index: number) => {
    const adjustedIndex = index - originalImages.length;
    const newImagesArray = [...newImages];
    newImagesArray.splice(adjustedIndex, 1);
    setNewImages(newImagesArray);

    // อัพเดทพรีวิว
    const newPreviews = [...originalImages];
    newImagesArray.forEach((file) => {
      newPreviews.push(URL.createObjectURL(file));
    });
    setPreviewImages(newPreviews);
    setImageError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      // กรองแท็กที่ว่างออก
      const filteredTags =  (formData.tags || []).filter((tag) => tag.tag.trim() !== "");

      let uploadedUrls: string[] = [];
      if (newImages.length > 0) {
        const uploadedResults = await Promise.all(
          newImages.map((file) => uploadFile(file))
        );
        uploadedUrls = uploadedResults
          .map(result => result.result?.variants || [])
          .flat();
      }
      
      const body = {
        id: formData.id,
        userId: formData.userId,
        title: formData.title,
        content: formData.content,
        categoryId: formData.categoryId,
        statusId: formData.statusId,
        latitude: formData.latitude,
        longitude: formData.longitude,
        createdAt: formData.createdAt,
        updatedAt: new Date().toISOString(),
        likeCount: formData.likeCount,
        commentCount: formData.commentCount,
        tagsDelete: originalTags
          .filter((tag) => !filteredTags.some((t) => t.tag === tag.tag))
          .map((tag) => tag.tag),
        tagsAdd: filteredTags
        .filter((tag) => !originalTags.some((orig) => orig.tag === tag.tag))
        .map((tag) => ({ tag: tag.tag })),
        imgPostDelete: imgPostDelete,
        imgPostAdd: uploadedUrls.map((url) => ({ imageUrl: url })),
      };

      await updatePost(body)
      // กลับไปยังหน้ารายละเอียด post
      router.push(`/admin/posts/view/${postId}`);
    } catch (error) {
      console.error("Error updating post:", error);
      setSaving(false);
    }
  };

  // แสดงหน้า Loading
  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // แสดงหน้า 404 ถ้าไม่พบโพสต์
  if (notFound) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-center">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">ไม่พบโพสต์</h1>
        <p className="text-gray-600 mb-6">ไม่พบโพสต์ที่คุณต้องการแก้ไข</p>
        <Link
          href="/admin/posts"
          className="bg-blue-600 text-white px-4 py-2 rounded-md inline-flex items-center"
        >
          <ChevronLeft size={18} className="mr-2" />
          กลับไปหน้ารายการโพสต์
        </Link>
      </div>
    );
  }

  // แสดงหน้าแจ้งเตือนถ้าไม่ใช่โพสต์ของ admin
  if (notAdmin) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-center">
        <div className="bg-yellow-100 border-l-4 border-yellow-500 p-4 mb-6 text-yellow-700 max-w-md">
          <div className="flex items-center mb-2">
            <AlertTriangle size={24} className="mr-2" />
            <h2 className="text-lg font-bold">ไม่สามารถแก้ไขได้</h2>
          </div>
          <p>โพสต์นี้ไม่ได้สร้างโดยผู้ดูแลระบบ จึงไม่สามารถแก้ไขได้</p>
          <p className="mt-2">คุณสามารถลบโพสต์ได้จากหน้ารายละเอียดโพสต์</p>
        </div>
        <Link
          href={`/admin/posts/view/${postId}`}
          className="bg-blue-600 text-white px-4 py-2 rounded-md inline-flex items-center"
        >
          <ChevronLeft size={18} className="mr-2" />
          กลับไปหน้ารายละเอียดโพสต์
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Link href={`/admin/posts/view/${postId}`} className="mr-4">
            <ChevronLeft size={24} className="text-gray-500" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-800">แก้ไขโพสต์</h1>
        </div>
        <div className="flex justify-end gap-2">
          <button
            type="submit"
            disabled={saving}
            className={`px-6 py-2 bg-blue-600 text-white rounded-md flex items-center gap-2 ${
              saving ? "opacity-70 cursor-not-allowed" : "hover:bg-blue-700"
            }`}
          >
            <Save size={18} />
            {saving ? "กำลังบันทึก..." : "บันทึกโพสต์"}
          </button>
          <Link
            href={`/admin/posts/view/${postId}`}
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

                  value={formData.categoryId || undefined}
                  onChange={(value) => {
                    setFormData((prev) => ({
                      ...prev,
                      categoryId: Number(value),
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
            {/* </div> */}

            <div>
              <p className="block text-sm font-medium text-gray-700 mb-1">
                แท็ก
              </p>
              <div className="space-y-2">
                {(formData?.tags ?? []).map((tag, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={tag.tag}
                      onChange={(e) => handleTagChange(index, e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder={`แท็ก ${index + 1}`}
                    />
                    {(formData?.tags?.length ?? 0) > 1 && (
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
              <label htmlFor="imageUpload" className="block text-sm font-medium text-gray-700 mb-2">
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
                  {previewImages.map((src, index) => (
                    <div key={index} className="relative aspect-[5/3]">
                      <img
                        src={src}
                        alt={`รูปที่ ${index + 1}`}
                        className="w-full h-full object-cover rounded-md"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          index < originalImages.length
                            ? removeOriginalImage(index)
                            : removeNewImage(index)
                        }
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                      >
                        <X size={16} />
                      </button>
                      {index >= originalImages.length && (
                        <div className="absolute bottom-0 left-0 right-0 bg-green-500 text-white text-xs py-1 px-2 text-center">
                          รูปใหม่
                        </div>
                      )}
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
