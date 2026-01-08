import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  NativeSyntheticEvent,
  NativeScrollEvent,
  TouchableWithoutFeedback,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StarRatingDisplay } from "react-native-star-rating-widget";
import { AntDesign } from "@expo/vector-icons";
import { Dropdown } from "react-native-element-dropdown";
import { useRoute, RouteProp, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useTranslation } from "react-i18next";
import { useAppContext } from "../../contexts/app/AppContext";
import { useReviewStore } from "../../stores/reviewStore";

import { RootStacksParamList } from "../../navigation/NavigationTypes";
import {
  useFetchReviews,
  useFetchReviewSummary,
} from "../../services/api/hooks/useReview";
import { ReviewData, SortOption } from "../../services/api/types/review";
import { handleAxiosError } from "../../services/api/api";

import BaseText from "../../components/common/BaseText";
import BaseButton from "../../components/common/BaseButton";
import ReviewCard from "./components/ReviewCard";

const LIMIT_PER_PAGE = 10;

function CalculateBar({ count, total }: { count: number; total: number }) {
  const percent = total > 0 ? (count / total) * 100 : 0;

  return (
    <View className="bg-gray-300 h-2 w-40 rounded-full relative overflow-hidden">
      <View
        className="bg-blue-500 h-full absolute z-10 rounded-full"
        style={{ width: `${percent}%` }}
      />
    </View>
  );
}

export default function LocationReviewsScreen() {
  const { t } = useTranslation();
  const { fontFamily,handleShowError } = useAppContext();
  const insets = useSafeAreaInsets();
  const route = useRoute<RouteProp<RootStacksParamList, "LocationReviews">>();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStacksParamList>>();
  const { setReviews } = useReviewStore();

  const sortOptions = [
    {
      label: t("review.lastest"),
      value: "1",
      data: { column: "createdAt", direction: "desc" },
    },
    {
      label: t("review.highest"),
      value: "2",
      data: { column: "rating", direction: "desc" },
    },
    {
      label: t("review.lowest"),
      value: "3",
      data: { column: "rating", direction: "asc" },
    },
    // { label: "Most Liked", value: { column: "createdAt", direction: "desc" } },
  ];

  const [value, setValue] = useState(null); // dropdown value
  // const [refreshing, setRefreshing] = useState(false);

  const [page, setPage] = useState(1);
  const [allReviews, setAllReviews] = useState<ReviewData[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption[]>([
    { column: "createdAt", direction: "asc" },
  ]);
  const [ratingMap, setRatingMap] = useState<Record<number, number>>({});
  const [totalReviews, setTotalReviews] = useState(0);
  const [expandedReviewId, setExpandedReviewId] = useState<number | null>(null);

  const { data: reviewsData, isFetching } = useFetchReviews({
    locationId: Number(route.params.locationId),
    pageNumber: page,
    limit: LIMIT_PER_PAGE,
    sortBy: sortBy,
    last24hrs: false,
  });

  // Update all reviews when data changes
  useEffect(() => {
    if (reviewsData?.data) {
      if (page === 1) {
        setAllReviews(reviewsData.data);
      } else {
        setAllReviews((prev) => [...prev, ...reviewsData.data]);
      }

      const totalFetched =
        (page - 1) * LIMIT_PER_PAGE + reviewsData.data.length;
      setHasMore(totalFetched < reviewsData.total);
    }
  }, [reviewsData]);

  const {
    data: reviewSummaryData,
    isError: isErrorReviewSummary,
    error: errorReviewSummary,
  } = useFetchReviewSummary(route.params.locationId);
  useEffect(() => {
    if (reviewSummaryData) {
      setTotalReviews(Number(reviewSummaryData?.avg.reviewcount));

      setRatingMap(
        Object.fromEntries(
          reviewSummaryData?.data.map((item) => [
            item.rating,
            Number(item.count),
          ])
        )
      );
    }
  }, [reviewSummaryData]);
  useEffect(() => {
    if (isErrorReviewSummary) {
      console.error("Error fetching review summary data:", errorReviewSummary);
      handleAxiosError(errorReviewSummary, handleShowError);
    }
  }, [isErrorReviewSummary, errorReviewSummary]);

  const fetchData = async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate network delay
    setPage((prev) => prev + 1);
    setLoadingMore(false);
  };

  // const onRefresh = useCallback(() => {
  //   setRefreshing(true);
  //   setPage(1);
  //   setHasMore(true);
  //   setTimeout(() => {
  //     setRefreshing(false);
  //   }, 1000);
  // }, []);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    const paddingToBottom = 100;

    const isBottom =
      layoutMeasurement.height + contentOffset.y >=
      contentSize.height - paddingToBottom;

    if (isBottom && !loadingMore && hasMore) {
      fetchData();
    }
  };

  const renderItem = (item: { label: string; value: string }) => (
    <View className={`px-4 py-2 ${item.value === value && "bg-blue-50"}`}>
      <BaseText
        className={`text-sm ${
          item.value === value ? "text-blue-600" : "text-gray-700"
        }`}
      >
        {item.label}
      </BaseText>
    </View>
  );

  return (
    <View className="flex-1">
      <ScrollView
        stickyHeaderIndices={[1]}
        // refreshControl={
        //   <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        // }
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        <TouchableWithoutFeedback
          onPress={() => {
            setExpandedReviewId(null);
          }}
        >
          <View>
            {/* Rating summary */}
            <View className="bg-white p-4">
              <View className="flex-row items-center justify-between">
                <View className="gap-y-2 flex-col flex-1 items-center p-2">
                  <BaseText className="text-xl" fontWeight="semibold">
                    {reviewSummaryData?.avg.averagerating?.toFixed(2) || "0.00"}
                  </BaseText>
                  <StarRatingDisplay
                    rating={reviewSummaryData?.avg.averagerating || 0}
                    maxStars={5}
                    starSize={12}
                    starStyle={{ marginHorizontal: 0 }}
                    color="#3b82f6"
                  />
                </View>
                <View className="flex-1 flex-col items-center gap-x-2">
                  {[5, 4, 3, 2, 1].map((score) => {
                    const count = ratingMap[score] || 0;

                    return (
                      <View
                        key={score}
                        className="flex-row gap-x-2 items-center"
                      >
                        <BaseText className="text-sm" fontWeight="semibold">
                          {score}
                        </BaseText>
                        <CalculateBar count={count} total={totalReviews} />
                      </View>
                    );
                  })}
                </View>
              </View>
            </View>

            {/* Sort dropdown */}
            <View className="bg-white p-4 flex-row items-center justify-between gap-5">
              <BaseText fontWeight="medium" className="flex-shrink-0">
                {t("review.user_reviews")} ({reviewsData?.total || 0})
              </BaseText>
              <Dropdown
                style={styles.dropdown}
                placeholderStyle={{
                  fontSize: 12,
                  fontFamily: fontFamily(),
                }}
                selectedTextStyle={{
                  fontSize: 12,
                  color: "#4b5563",
                  fontFamily: fontFamily(),
                }}
                inputSearchStyle={{
                  fontSize: 12,
                  color: "#4b5563",
                  fontFamily: fontFamily(),
                }}
                containerStyle={styles.containerStyle}
                data={sortOptions}
                labelField="label"
                valueField="value"
                placeholder={t("review.select_item")}
                value={value}
                onChange={(item) => {
                  if (item.value === value) return;
                  setValue(item.value);
                  setPage(1);
                  setAllReviews([]);
                  setHasMore(true);
                  setSortBy([item.data]);
                }}
                renderLeftIcon={() => (
                  <AntDesign
                    style={{ marginRight: 4 }}
                    name="filter"
                    size={12}
                    color="#4b5563"
                  />
                )}
                renderRightIcon={() => (
                  <AntDesign name="down" size={12} color="#4b5563" />
                )}
                renderItem={renderItem}
              />
            </View>

            {/* Reviews */}
            <View className="p-4 gap-y-4">
              {allReviews.length > 0 ? (
                allReviews.map((review) => (
                  <View
                    key={review.id}
                    className="bg-white rounded-md overflow-hidden shadow-sm"
                  >
                    <ReviewCard
                      review={review}
                      showEdit
                      className="w-full p-2"
                      expandedReviewId={expandedReviewId}
                      setExpandedReviewId={setExpandedReviewId}
                    />
                  </View>
                ))
              ) : isFetching && !loadingMore ? (
                <ActivityIndicator size="large" color="#2563eb" />
              ) : (
                <BaseText className="text-gray-500">{t("main.no_data")}</BaseText>
              )}
            </View>

            {/* Loading more */}
            {loadingMore && (
              <View style={{ padding: 20 }}>
                <ActivityIndicator size="large" color="#2563eb" />
              </View>
            )}
          </View>
        </TouchableWithoutFeedback>
      </ScrollView>

      {/* Button to write review */}
      <View
        className="p-4 bg-white rounded-t-xl shadow-xl"
        style={{ paddingBottom: insets.bottom + 16 }}
      >
        <BaseButton
          className="bg-blue-600 w-full"
          onPress={() => {
            setReviews(null);
            navigation.navigate("LocationUserReviews", {
              locationId: route.params.locationId,
            });
          }}
        >
          <BaseText className="text-white text-sm text-center">
            {t("review.write_review")}
          </BaseText>
        </BaseButton>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  dropdown: {
    backgroundColor: "white",
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#4b5563",
    paddingHorizontal: 12,
    paddingVertical: 4,
    width: 150,
  },
  containerStyle: {
    overflow: "hidden",
    backgroundColor: "white",
    borderRadius: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});
