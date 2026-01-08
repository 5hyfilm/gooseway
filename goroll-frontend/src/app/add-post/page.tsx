"use client";

import { useState } from "react";
import { Camera, ChevronLeft, X, MapPin, Send } from "lucide-react";
import { useRouter } from "next/navigation";
import { useLanguage } from "../../../contexts/LanguageContext";

export default function AddPostPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    category: "",
    location: "",
  });
  const [submitting, setSubmitting] = useState(false);

  // ตรวจสอบว่าฟอร์มมีข้อมูลที่จำเป็นครบถ้วนหรือไม่
  const isFormValid = formData.title.trim() !== "" && formData.category !== "";

  // ใช้คีย์การแปลสำหรับหมวดหมู่
  const categories = [
    {
      key: "accessible_place",
      translationKey: "community.categories.accessible_place",
    },
    { key: "route_review", translationKey: "community.categories.routes" },
    { key: "tips", translationKey: "community.categories.guides" },
    { key: "experience", translationKey: "community.categories.stories" },
    { key: "question", translationKey: "community.categories.question" },
  ];

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newImages = Array.from(files).map((file) =>
        URL.createObjectURL(file)
      );
      setSelectedImages([...selectedImages, ...newImages]);
    }
  };

  const removeImage = (index: number) => {
    setSelectedImages(selectedImages.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isFormValid) return;

    setSubmitting(true);

    try {
      // จำลองการส่งข้อมูลไปยังเซิร์ฟเวอร์
      console.log("Post data:", { ...formData, images: selectedImages });
      await new Promise((resolve) => setTimeout(resolve, 1000)); // จำลองการรอเวลาส่งข้อมูล
      router.push("/community");
    } catch (error) {
      console.error("Error submitting post:", error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-16 text-gray-600">
      {/* Header */}
      <div className="bg-white sticky top-0 z-10">
        <div className="flex items-center justify-between p-4 border-b">
          <button onClick={() => router.back()} className="p-1">
            <ChevronLeft size={24} />
          </button>
          <h1 className="text-lg font-semibold">
            {t("community.create.post")}
          </h1>
          <button
            onClick={handleSubmit}
            disabled={submitting || !isFormValid}
            className={`px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2 ${
              submitting || !isFormValid ? "opacity-50" : ""
            }`}
          >
            {submitting ? (
              <>
                <span className="animate-spin h-4 w-4 border-2 border-white border-opacity-50 border-t-white rounded-full"></span>
                {t("common.saving") || "กำลังส่ง..."}
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                {t("community.share")}
              </>
            )}
          </button>
        </div>
      </div>

      <form className="p-4 space-y-6">
        {/* Category Selection */}
        <div className="flex gap-2 overflow-x-auto py-2">
          {categories.map((category) => (
            <button
              key={category.key}
              type="button"
              onClick={() =>
                setFormData({ ...formData, category: category.key })
              }
              className={`px-4 py-2 rounded-full whitespace-nowrap ${
                formData.category === category.key
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              {t(category.translationKey)}
            </button>
          ))}
        </div>

        {/* Photos */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-4">
            {selectedImages.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mb-4">
                {selectedImages.map((image, index) => (
                  <div key={index} className="relative aspect-square">
                    <img
                      src={image}
                      alt={t("media.photo.selected", { number: index + 1 })}
                      className="w-full h-full object-cover rounded-lg"
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
            )}

            <label className="block">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="hidden"
              />
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-500">
                <Camera className="mx-auto w-8 h-8 text-gray-400" />
                <p className="mt-2 text-sm text-gray-600">
                  {t("media.photos.add")}
                </p>
              </div>
            </label>
          </div>
        </div>

        {/* Post Content */}
        <div className="space-y-4">
          <input
            type="text"
            placeholder={t("community.post.write.title")}
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
            className="w-full p-4 bg-white rounded-lg shadow-sm border-0 focus:ring-2 focus:ring-blue-500"
            required
          />

          <textarea
            placeholder={t("community.post.write.experience")}
            value={formData.content}
            onChange={(e) =>
              setFormData({ ...formData, content: e.target.value })
            }
            rows={6}
            className="w-full p-4 bg-white rounded-lg shadow-sm border-0 focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Location */}
        <button
          type="button"
          onClick={() => {
            /* Handle location selection */
          }}
          className="w-full flex items-center gap-2 p-4 bg-white rounded-lg shadow-sm text-gray-600"
        >
          <MapPin size={20} />
          <span>{formData.location || t("community.add.location")}</span>
        </button>
      </form>
    </div>
  );
}
