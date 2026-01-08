import { useState } from "react";
import { View, Image, TouchableOpacity } from "react-native";
import { StarRatingDisplay } from "react-native-star-rating-widget";
import { ReviewData } from "../../../services/api/types/review";
import { AntDesign, Entypo } from "@expo/vector-icons";
import { formatDate } from "../../../utils/time/FormatTimes";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../../contexts/auth/AuthContext";
import { useReviewStore } from "../../../stores/reviewStore";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStacksParamList } from "../../../navigation/NavigationTypes";
import { useNavigation } from "@react-navigation/native";

import BaseText from "../../../components/common/BaseText";

type ReviewCardProps = {
  review: ReviewData;
  width?: number;
  className?: string;
  lineLimit?: string;
  showEdit?: boolean;
  expandedReviewId?: number | null;
  setExpandedReviewId?: (id: number | null) => void;
};

export default function ReviewCard({
  review,
  width,
  className,
  lineLimit,
  showEdit = false,
  expandedReviewId,
  setExpandedReviewId,
}: ReviewCardProps) {
  const { i18n, t } = useTranslation();
  const { userInfo } = useAuth();
  const { setReviews } = useReviewStore();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStacksParamList>>();

  const isExpanded = expandedReviewId === review.id;

  const isValidUrl = (url: string) => {
    return url.startsWith("http://") || url.startsWith("https://");
  };

  return (
    <View
      key={review.id}
      className={`flex-col gap-y-2 ${className}`}
      style={{ width: width }}
    >
      <View className="flex-row justify-between gap-x-3">
        <View className="flex-row items-center gap-x-3">
          {review.user.avatarUrl && isValidUrl(review.user.avatarUrl) ? (
            <Image
              source={{ uri: review.user.avatarUrl }}
              className="w-10 h-10 rounded-full"
            />
          ) : (
            <View className="w-10 h-10 border border-gray-400 rounded-full items-center justify-center">
              <AntDesign name="user" size={20} color="#9ca3af" />
            </View>
          )}
          <View className="flex-col">
            <BaseText className="text-sm" fontWeight="semibold">
              {review.user.fullName}
            </BaseText>
            <BaseText className="text-sm text-gray-500">
              {formatDate(review.createdAt, i18n.language)}
            </BaseText>
          </View>
        </View>
        {review.userId.toString() === userInfo?.id && showEdit && (
          <View className="relative flex-shrink-0">
            <TouchableOpacity
              onPress={() => {
                if (isExpanded) {
                  setExpandedReviewId?.(null);
                } else {
                  setExpandedReviewId?.(review.id);
                }
              }}
              className="p-1 rounded bg-gray-100 h-fit self-start"
            >
              <Entypo name="dots-three-horizontal" size={16} color="#6b7280" />
            </TouchableOpacity>
            {expandedReviewId === review.id && (
              <View className="absolute top-7 right-0 w-24 bg-white border border-gray-200 rounded-lg shadow z-50 overflow-hidden">
                <TouchableOpacity
                  className={`py-1 px-2 border-b border-gray-200`}
                  onPress={() => {
                    setExpandedReviewId?.(null);
                    setReviews({
                      id: review.id,
                      rating: review.rating,
                      reviewText: review.reviewText,
                    });
                    navigation.push("LocationUserReviews", {
                      locationId: review.locationId.toString(),
                    });
                  }}
                >
                  <BaseText className={`text-sm text-gray-700`}>
                    {t("main.edit")}
                  </BaseText>
                </TouchableOpacity>
                {/* <TouchableOpacity className={`py-1 px-2`}>
                  <BaseText className={`text-sm text-gray-700`}>
                    {t("main.delete")}
                  </BaseText>
                </TouchableOpacity> */}
              </View>
            )}
          </View>
        )}
      </View>

      <View className="flex-col gap-y-3">
        <View className="flex-row items-center gap-x-2">
          <StarRatingDisplay
            rating={review.rating}
            color="#3b82f6"
            emptyColor="#D3D3D3"
            maxStars={5}
            starSize={10}
            starStyle={{ marginHorizontal: 0 }}
          />

          <BaseText className="text-sm text-gray-500">
            {formatDate(review.updatedAt, i18n.language)}
          </BaseText>
        </View>
        <BaseText className={`text-sm text-gray-600 ${lineLimit}`}>
          {review.reviewText}
        </BaseText>
      </View>
    </View>
  );
}
