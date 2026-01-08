// src/app/community/[id]/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Heart,
  MessageCircle,
  User,
  ChevronLeft,
  ChevronRight,
  Map,
} from "lucide-react";
import { PostUser, PostUserComment } from "@/lib/types/community";
import { useLanguage } from "../../../../contexts/LanguageContext";
import { findPostByIdForUser } from "@/services/api/endpoints/post";

export default function CommunityPostDetail() {
  const params = useParams();
  const router = useRouter();
  const { t } = useLanguage();
  const [post, setPost] = useState<PostUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [likeCount, setLikeCount] = useState(0);
  const [comments, setComments] = useState<PostUserComment[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [allImages, setAllImages] = useState<string[]>([]);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await findPostByIdForUser(Number(params.id));
        setPost(response);
        setLikeCount(response.likeCount ? parseInt(response.likeCount, 10) : 0);
        setAllImages(response.images.map((img) => img.imageUrl));
        setComments(response.comments || []);
      } catch (error) {
        console.error("Error fetching post:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [params.id]);

  const goToNextImage = () => {
    if (currentImageIndex < allImages.length - 1) {
      setCurrentImageIndex(currentImageIndex + 1);
    }
  };

  const goToPrevImage = () => {
    if (currentImageIndex > 0) {
      setCurrentImageIndex(currentImageIndex - 1);
    }
  };

  const openMap = () => {
    if (!post || !post.latitude || !post.longitude) {
      alert("No location data available for this post.");

      return;
    }

    const url = `https://www.google.com/maps?q=${post.latitude},${post.longitude}`;
    window.open(url, "_blank");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="bg-white p-4 shadow-sm sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="h-6 w-32 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>

        <div className="animate-pulse space-y-4 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gray-200"></div>
            <div className="space-y-2">
              <div className="h-4 w-24 bg-gray-200 rounded"></div>
              <div className="h-3 w-16 bg-gray-200 rounded"></div>
            </div>
          </div>
          <div className="h-96 bg-gray-200 rounded"></div>
          <div className="space-y-2">
            <div className="h-6 w-3/4 bg-gray-200 rounded"></div>
            <div className="h-4 w-full bg-gray-200 rounded"></div>
            <div className="h-4 w-full bg-gray-200 rounded"></div>
            <div className="h-4 w-1/2 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-white">
        <div className="bg-white p-4 shadow-sm sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-semibold">ไม่พบโพสต์</h1>
          </div>
        </div>

        <div className="p-4 flex flex-col items-center justify-center min-h-[60vh]">
          <p className="text-gray-500 mb-4 text-center">
            ไม่พบโพสต์ที่คุณต้องการ
          </p>
          <button
            onClick={() => router.push("/community")}
            className="px-4 py-2 bg-blue-600 text-white rounded-full"
          >
            กลับไปยังชุมชน
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-white px-4 py-3 sticky top-0 z-10 flex items-center justify-between border-b">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-medium">
            {t("community.post") || "โพสต์"}
          </h1>
        </div>
        {post.latitude && post.longitude && (
          <button onClick={openMap}>
            <Map size={20} />
          </button>
        )}
      </div>

      <div>
        {/* User info */}
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
              {post.user.avatarUrl ? (
                <img
                  src={post.user.avatarUrl}
                  alt={post.user.fullName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <User size={18} className="text-gray-600" />
              )}
            </div>
            <div>
              <p className="font-semibold text-sm">@{post.user.fullName}</p>
              <p className="text-xs text-gray-500">
                {post.createdAt
                  ? new Date(post.createdAt)
                      .toLocaleDateString("th-TH", {
                        day: "numeric",
                        month: "numeric",
                        year: "numeric",
                      })
                      .replace(/\//g, "/")
                  : ""}
              </p>
            </div>
          </div>
        </div>
        {/* Post title */}
        <div className="px-4 py-2 mb-1">
          <h2 className="text-xl font-bold text-gray-900">{post.title}</h2>
        </div>
        {/* Image Slider */}
        {allImages.length > 0 && (
          <div className="relative mb-4 bg-gray-100">
            <div className="aspect-video w-full overflow-hidden">
              <img
                src={allImages[currentImageIndex]}
                alt={`${post.title} image ${currentImageIndex + 1}`}
                className="w-full h-full object-cover"
              />
            </div>

            {/* ตัวแสดงตำแหน่งรูปภาพด้านล่าง */}
            {allImages.length > 1 && (
              <div className="absolute bottom-2 sm:bottom-3 left-0 right-0 flex justify-center gap-1 sm:gap-1.5">
                {allImages.map((_, index) => (
                  <div
                    key={index}
                    className={`w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full ${
                      index === currentImageIndex ? "bg-white" : "bg-white/40"
                    }`}
                  />
                ))}
              </div>
            )}

            {/* ปุ่มเลื่อนซ้าย */}
            {currentImageIndex > 0 && (
              <button
                onClick={goToPrevImage}
                className="absolute left-1 sm:left-2 top-1/2 transform -translate-y-1/2 p-1 sm:p-2 bg-black/20 rounded-full hover:bg-black/30 transition-colors"
                aria-label="Previous image"
              >
                <ChevronLeft
                  size={24}
                  className="sm:w-[30px] sm:h-[30px] text-white drop-shadow-md"
                />
              </button>
            )}

            {/* ปุ่มเลื่อนขวา */}
            {currentImageIndex < allImages.length - 1 && (
              <button
                onClick={goToNextImage}
                className="absolute right-1 sm:right-2 top-1/2 transform -translate-y-1/2 p-1 sm:p-2 bg-black/20 rounded-full hover:bg-black/30 transition-colors"
                aria-label="Next image"
              >
                <ChevronRight
                  size={24}
                  className="sm:w-[30px] sm:h-[30px] text-white drop-shadow-md"
                />
              </button>
            )}
          </div>
        )}
        {/* Post content */}
        <div className="px-4 py-2">
          <p className="text-gray-800 text-base leading-relaxed whitespace-pre-line">
            {post.content}
          </p>

          {/* Tags - Horizontal scrollable */}
          {post.tags && post.tags.length > 0 && (
            <div className="mt-4 flex gap-2 overflow-x-auto py-2 no-scrollbar">
              {post.tags.map((tag, i) => (
                <span
                  key={i}
                  className="text-xs bg-gray-100 text-gray-600 px-3 py-1.5 rounded-full whitespace-nowrap"
                >
                  #{tag.tag}
                </span>
              ))}
            </div>
          )}
        </div>
        {/* Engagement bar */}
        <div className="px-4 py-3 flex items-center justify-between mt-1 border-t border-gray-100">
          <div className="flex items-center gap-5">
            <div className="flex items-center gap-1.5">
              <Heart size={22} />
              <span className="text-sm">{likeCount}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <MessageCircle size={22} />
              <span className="text-sm">{comments.length}</span>
            </div>
          </div>
        </div>

        {/* Comments Section */}
        <div className="mt-1 mb-2">
          <div className="p-4">
            <h3 className="font-semibold text-base mb-4">
              ความคิดเห็น ({comments.length})
            </h3>

            {comments.length === 0 ? (
              <div className="text-center py-6 text-gray-500">
                <MessageCircle
                  size={36}
                  className="mx-auto mb-2 text-gray-300"
                />
                <p>{t("community.no.comments") || "ยังไม่มีความคิดเห็น"}</p>
                <p className="text-sm mt-1">
                  {t("community.be.first") || "เป็นคนแรกที่แสดงความคิดเห็น"}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {comments.map((comment) => (
                  <div
                    key={comment.id}
                    className="flex gap-3 pb-4 border-b border-gray-100 last:border-0"
                  >
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex-shrink-0 flex items-center justify-center overflow-hidden">
                      {comment.user.avatarUrl ? (
                        <img
                          src={comment.user.avatarUrl}
                          alt={comment.user.fullName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User size={14} className="text-gray-600" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-sm">
                          {comment.user.fullName}
                        </span>
                        <p className="text-xs text-gray-500">
                          {new Date(comment.createdAt).toLocaleDateString(
                            "th-TH"
                          )}
                        </p>
                      </div>
                      <p className="text-gray-800 text-sm">{comment.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
