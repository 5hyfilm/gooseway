import React, { useState, useEffect, useCallback } from "react";
import { View } from "react-native";
import { useRoute, RouteProp, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStacksParamList } from "../../navigation/NavigationTypes";
import { useTranslation } from "react-i18next";
import { useFetchLocationById } from "../../services/api/hooks/useLocation";
import {
  useCreateReview,
  useUpdateReview,
} from "../../services/api/hooks/useReview";
import { useReviewStore } from "../../stores/reviewStore";
import StarRating from "react-native-star-rating-widget";

import BaseText from "../../components/common/BaseText";
import BaseInput from "../../components/common/BaseInput";
import BaseButton from "../../components/common/BaseButton";

import KeyboardScrollLayout from "../../layouts/KeyboardScrollLayout";

import { useAppContext } from "../../contexts/app/AppContext";
import { handleAxiosError } from "../../services/api/api";

export default function LocationUserReviewsScreen() {
  const { handleShowError } = useAppContext();
  const { t, i18n } = useTranslation();
  const route =
    useRoute<RouteProp<RootStacksParamList, "LocationUserReviews">>();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStacksParamList>>();
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const { reviews, setReviews } = useReviewStore();

  const {
    data: locationData,
    isError: isErrorLocation,
    error: errorLocation,
  } = useFetchLocationById(route.params.locationId ?? "");
  useEffect(() => {
    if (isErrorLocation) {
      console.error("Error fetching location data:", errorLocation);
      handleAxiosError(errorLocation, handleShowError);
    }
  }, [isErrorLocation, errorLocation]);

  const createReviewMutation = useCreateReview();
  const updateReviewMutation = useUpdateReview();

  const handleCreateReview = useCallback(async () => {
    try {
      const reviewBody = {
        review: {
          locationId: Number(route.params.locationId),
          rating: rating,
          reviewText: reviewText,
        },
      };
      await createReviewMutation.mutateAsync(reviewBody);
      navigation.goBack();
    } catch (error) {
      console.error("Error creating review:", error);
      handleAxiosError(error, handleShowError);
    }
  }, [
    createReviewMutation,
    navigation,
    route.params.locationId,
    rating,
    reviewText,
    handleShowError,
  ]);

  const handleEditReview = useCallback(async () => {
    try {
      if (!reviews) return;
      const reviewBody = {
        id: reviews.id,
        rating: rating,
        reviewText: reviewText,
      };
      await updateReviewMutation.mutateAsync(reviewBody);
      setReviews(null);
      navigation.goBack();
    } catch (error) {
      console.error("Error editing review:", error);
      handleAxiosError(error, handleShowError);
    }
  }, [
    navigation,
    reviews,
    rating,
    reviewText,
    updateReviewMutation,
    setReviews,
    handleShowError,
  ]);

  useEffect(() => {
    if (reviews) {
      setRating(reviews.rating);
      setReviewText(reviews.reviewText);
    }
  }, [reviews]);

  return (
    <KeyboardScrollLayout>
      <View className="p-4 gap-y-4">
        <View className="bg-white rounded-lg shadow-sm p-4">
          <BaseText className="text-xl text-gray-900" fontWeight="bold">
            {locationData?.name ?? "Location"}
          </BaseText>
          <BaseText className="text-lg text-gray-700 h-" fontWeight="semibold">
            {i18n.language === "th"
              ? locationData?.category.nameTh
              : locationData?.category.nameEn ?? "Category"}
          </BaseText>
        </View>
        <View className="bg-white rounded-lg shadow-sm p-4 gap-y-1">
          <BaseText className="text-gray-600 text-sm">
            {t("review.here_review")}
          </BaseText>
          <StarRating
            rating={rating}
            onChange={(rating) => setRating(rating)}
            color="#3b82f6"
            emptyColor="#D3D3D3"
            maxStars={5}
            starSize={32}
            enableHalfStar={false}
            starStyle={{ marginHorizontal: 0 }}
          />
          <BaseInput
            placeholder={t("review.description_placeholder")}
            value={reviewText}
            onChangeText={(text) => setReviewText(text)}
            multiline
            numberOfLines={10}
            className="h-64 px-3 py-2 border border-gray-300 rounded-lg mt-4"
            style={{ textAlignVertical: "top" }}
          />
          <BaseButton
            className="bg-blue-600 w-full mt-4"
            loading={
              createReviewMutation.isPending || updateReviewMutation.isPending
            }
            disabled={rating <= 0}
            onPress={reviews?.id ? handleEditReview : handleCreateReview}
          >
            <BaseText className="text-white text-center">
              {t("review.write_review")}
            </BaseText>
          </BaseButton>
        </View>
      </View>
    </KeyboardScrollLayout>
  );
}
