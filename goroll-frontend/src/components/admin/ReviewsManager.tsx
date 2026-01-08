// src/components/admin/ReviewsManager.tsx
import React, { useState } from "react";
import { Trash2, Star, User, Edit2, Save, X } from "lucide-react";
import { updateReview } from "@/services/api/endpoints/location";

// กำหนดโครงสร้างข้อมูลรีวิว
interface Review {
  id: number;
  locationId: number;
  userId: number;
  rating: number;
  reviewText: string;
  createdAt: string;
  updatedAt: string;
  user: {
    fullName: string;
    avatarUrl: string;
  };
}

interface ReviewsManagerProps {
  reviewData?: Review[];
  currentUserId?: number | null;
  onDelete?: (reviewId: number) => void;
  onEdit?: (reviewId: number, newText: string, newRating: number) => void;
}

export function ReviewsManager({
  reviewData = [],
  currentUserId,
  onDelete,
  onEdit,
}: ReviewsManagerProps) {
  const [editingReviewId, setEditingReviewId] = useState<number | null>(null);
  const [editText, setEditText] = useState("");
  const [editRating, setEditRating] = useState<number>(0);

  const handleEditClick = (review: Review) => {
    setEditingReviewId(review.id);
    setEditText(review.reviewText);
    setEditRating(review.rating);
  };

  const handleSaveEdit = async (reviewId: number) => {
    try {
      await updateReview({
        id: reviewId,
        reviewText: editText.trim(),
        rating: editRating,
      });

      if (onEdit) {
        onEdit(reviewId, editText.trim(), editRating);
      }

      setEditingReviewId(null);
      setEditText("");
      setEditRating(0);
    } catch (error) {
      console.error("Error updating review:", error);
      alert("เกิดข้อผิดพลาดในการแก้ไขรีวิว");
    }
  };

  const handleCancelEdit = () => {
    setEditingReviewId(null);
    setEditText("");
    setEditRating(0);
  };

  const renderStarRating = (rating: number, onRatingChange?: (rating: number) => void) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={16}
            className={`cursor-pointer transition-colors ${
              star <= rating
                ? "text-yellow-500 fill-yellow-500"
                : "text-gray-300"
            }`}
            onClick={() => onRatingChange && onRatingChange(star)}
          />
        ))}
      </div>
    );
  };

  return (
    <div>
      <h3 className="text-lg font-medium">รีวิวและความคิดเห็น</h3>
      <p className="text-sm text-gray-600">
        จัดการรีวิวและความคิดเห็นจากผู้ใช้งานเกี่ยวกับสถานที่นี้
      </p>

      {reviewData.length === 0 ? (
        <div className="p-6 text-center bg-gray-50 rounded-lg mt-2">
          <p className="text-gray-500">ยังไม่มีรีวิวสำหรับสถานที่นี้</p>
        </div>
      ) : (
        <div className="mt-3">
          {reviewData.map((review) => (
            <div
              key={review.id}
              className="border rounded-lg overflow-hidden bg-white border-gray-200 mb-3"
            >
              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="flex-shrink-0 h-8 w-8 rounded-full overflow-hidden bg-gray-200">
                      {review.user.avatarUrl ? (
                        <img
                          src={review.user.avatarUrl}
                          alt={review.user.fullName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
                          <User size={16} />
                        </div>
                      )}
                    </div>
                    <div>
                      <span className="font-medium">{review.user.fullName}</span>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <span>
                          {new Date(review.updatedAt).toLocaleDateString(
                            "th-TH",
                            {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}
                        </span>
                        <div className="flex items-center">
                          {editingReviewId === review.id ? (
                            renderStarRating(editRating, setEditRating)
                          ) : (
                            <>
                              <Star
                                size={14}
                                className="text-yellow-500 fill-yellow-500"
                              />
                              <span className="ml-1">{review.rating}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    {currentUserId === review.userId && (
                      <>
                        {editingReviewId === review.id ? (
                          <>
                            <button
                              type="button"
                              onClick={() => handleSaveEdit(review.id)}
                              className="p-1 text-green-500 hover:text-green-700 rounded hover:bg-green-50"
                              title="บันทึก"
                            >
                              <Save size={18} />
                            </button>
                            <button
                              type="button"
                              onClick={handleCancelEdit}
                              className="p-1 text-gray-500 hover:text-gray-700 rounded hover:bg-gray-50"
                              title="ยกเลิก"
                            >
                              <X size={18} />
                            </button>
                          </>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleEditClick(review)}
                            className="p-1 text-blue-500 hover:text-blue-700 rounded hover:bg-blue-50"
                            title="แก้ไขรีวิว"
                          >
                            <Edit2 size={18} />
                          </button>
                        )}
                      </>
                    )}
                    <button
                      type="button"
                      onClick={() => onDelete && onDelete(review.id)}
                      className="p-1 text-red-500 hover:text-red-700 rounded hover:bg-red-50"
                      title="ลบรีวิว"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>

                {review.reviewText && (
                  <div className="p-3 bg-gray-50 rounded-md mt-2 text-gray-700">
                    {editingReviewId === review.id ? (
                      <textarea
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows={3}
                        placeholder="แก้ไขข้อความรีวิว..."
                      />
                    ) : (
                      <div className="text-wrap break-words">
                        {review.reviewText}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}