import { Star } from "lucide-react";
import React, { useState } from "react";

export interface ReviewFormData {
  rating: number; // คะแนนรีวิว
  reviewText: string; // ข้อความรีวิว
}

interface ReviewsEditorProps {
  onChange: (reviews: ReviewFormData) => void;
}

export function ReviewsEditor({ onChange }: Readonly<ReviewsEditorProps>) {
  // สร้างรีวิวใหม่
  const [newReview, setNewReview] = useState<string>("");
  const [rating, setRating] = useState<number>(0);

  const handleRatingChange = (newRating: number) => {
    setRating(newRating);
    onChange({ rating: newRating, reviewText: newReview });
  };

  const handleReviewChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNewReview(e.target.value);
    onChange({ rating, reviewText: e.target.value });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">รีวิวของ Admin</h3>
      </div>

      {/* ช่องข้อความสำหรับเพิ่มรีวิวใหม่ */}
      <div className="space-y-4">
        <div className="flex items-center gap-1">
          {[...Array(5)].map((_, i) => (
            <button
              key={`star-${i + 1}`}
              type="button"
              onClick={() => handleRatingChange(rating === i + 1 ? 0 : i + 1)}
              className="focus:outline-none"
            >
              <Star
                size={20}
                className={i < rating ? "text-yellow-500 fill-yellow-500" : "text-gray-300 fill-gray-200"}
                fill={i < rating ? "#F59E42" : "#E5E7EB"}
              />
            </button>
          ))}
          <span className="ml-2 font-medium text-gray-800">{rating} คะแนน</span>
        </div>
        <textarea
          className="w-full min-h-[200px] p-4 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
          value={newReview}
          onChange={handleReviewChange}
          placeholder="พิมพ์ความคิดเห็นของคุณที่นี่..."
        />
      </div>
    </div>
  );
}