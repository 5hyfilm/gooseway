import React, { useEffect, useCallback, useState, useMemo } from "react";
import {
  View,
  TouchableOpacity,
  Image,
  BackHandler,
  Modal,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRoute, RouteProp, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStacksParamList } from "../../navigation/NavigationTypes";
import MasonryList from "react-native-masonry-list";
import { AntDesign, MaterialCommunityIcons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import {
  useFetchReviewFeatures,
  useLikeReviewFeatures,
} from "../../services/api/hooks/useReview";
import { useCalculateLocationFeatures } from "../../services/api/hooks/useLocation";
import { ReviewFeatureParams } from "../../services/api/types/review";
import BaseToggleSwitch from "../../components/common/BaseToggleSwitch";

import HeaderLayout from "../../layouts/HeaderLayout";
import BaseText from "../../components/common/BaseText";
import BaseEmpty from "../../components/common/BaseEmpty";
import { handleAxiosError } from "../../services/api/api";

import { useAppContext } from "../../contexts/app/AppContext";
import { useImageStore } from "../../stores/imageStore";

import Animated, { FadeIn, FadeOut } from "react-native-reanimated";

const PAGE_SIZE = 20;

export default function LocationReviewsByTypeScreen() {
  const { handleShowError } = useAppContext();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStacksParamList>>();
  const route =
    useRoute<RouteProp<RootStacksParamList, "LocationReviewsByType">>();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(
    "N/A"
  );

  const DEFAULT_FILTER: ReviewFeatureParams = {
    locationId: route.params.locationId,
    featureId: route.params.featureId,
    last24hrs: false,
    sortBy: [{ column: "id", direction: "asc" }],
    limit: PAGE_SIZE,
    pageNumber: 1,
  };

  const switchOptions = useMemo(
    () => [
      { label: t("location.last_24_hours"), value: true },
      { label: t("location.all_time"), value: false },
    ],
    [t]
  );

  const [searchFilter, setSearchFilter] =
    useState<ReviewFeatureParams>(DEFAULT_FILTER);
  const [totalPages, setTotalPages] = useState(0);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [resolveCount, setResolveCount] = useState(0);
  const [imageList, setImageList] = useState<{ uri: string; id: number }[]>([]);
  const [showImage, setShowImage] = useState<number | null>(null);
  const { imageData, setImageData } = useImageStore();

  const likeFeatureMutation = useLikeReviewFeatures();

  const categories = [
    {
      key: "parking",
      label: t("location.parking"),
    },
    {
      key: "mainEntrance",
      label: t("location.mainEntrance"),
    },
    {
      key: "ramps",
      label: t("location.ramps"),
    },
    {
      key: "pathways",
      label: t("location.pathways"),
    },
    {
      key: "elevators",
      label: t("location.elevators"),
    },
    {
      key: "restrooms",
      label: t("location.restrooms"),
    },
    {
      key: "seating",
      label: t("location.seating"),
    },
    {
      key: "staff",
      label: t("location.staff"),
    },
    {
      key: "etc",
      label: t("location.etc"),
    },
  ];

  const [isFetching, setIsFetching] = useState(false);

  const {
    data: reviewFeatures,
    isError: isReviewFeaturesError,
    error: reviewFeaturesError,
    refetch: reviewFeaturesRefetch,
    isLoading: isReviewFeaturesLoading,
  } = useFetchReviewFeatures(searchFilter);
  useEffect(() => {
    if (!reviewFeatures) return;

    const newImages = reviewFeatures.data.img.map((item) => ({
      uri: item.imgUrl,
      id: item.imgId,
    }));
    const newImageData = newImages.map((img) => ({
      url: img.uri,
    }));
    if (searchFilter.pageNumber === 1) {
      setImageList(newImages);
      setImageData(newImageData);
    } else {
      setImageList((prev) => [...prev, ...newImages]);
      setImageData([...imageData, ...newImageData]);
    }

    setTotalPages(Math.ceil(reviewFeatures.total / PAGE_SIZE));
    setIsFetchingMore(false);
    setIsRefreshing(false);
    setTimeout(() => {
      setIsFetching(false);
    }, 1000);
  }, [reviewFeatures]);
  useEffect(() => {
    if (isReviewFeaturesError) {
      console.error("Error fetching review features:", reviewFeaturesError);
      handleAxiosError(reviewFeaturesError, handleShowError);
    }
  }, [isReviewFeaturesError, reviewFeaturesError]);

  useEffect(() => {
    const type = route.params?.type;
    if (type) {
      const category = categories.find((cat) => cat.key === type);
      if (category) {
        setSelectedCategory(category.label);
      }
    }
  }, [route.params?.type]);

  const caluculateFeaturesMutation = useCalculateLocationFeatures();

  const handleLikeDislike = useCallback(
    async (isLike: boolean) => {
      try {
        if (reviewFeatures) {
          await likeFeatureMutation.mutateAsync({
            features: {
              locationId: route.params.locationId,
              featureId: route.params.featureId,
              isGood: isLike,
            },
          });
          await caluculateFeaturesMutation.mutateAsync(route.params.locationId);
        }
      } catch (error) {
        console.error("Error creating review features:", error);
        handleAxiosError(error, handleShowError);
      }
    },
    [
      reviewFeatures,
      likeFeatureMutation,
      route.params,
      handleShowError,
      caluculateFeaturesMutation,
    ]
  );

  const handleNextPage = useCallback(() => {
    if (
      searchFilter.pageNumber < totalPages &&
      !isFetchingMore &&
      resolveCount >= PAGE_SIZE
    ) {
      setIsFetchingMore(true);
      setSearchFilter((prev) => ({
        ...prev,
        pageNumber: prev.pageNumber + 1,
      }));
    }
  }, [searchFilter.pageNumber, totalPages, isFetchingMore, resolveCount]);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    if (searchFilter.pageNumber === 1) {
      const result = await reviewFeaturesRefetch();
      setImageList(
        result.data?.data.img.map((item) => ({
          uri: item.imgUrl,
          id: item.imgId,
        })) || []
      );
      setTotalPages(Math.ceil((result.data?.total ?? 0) / PAGE_SIZE));
      setIsRefreshing(false);
    } else {
      setSearchFilter(DEFAULT_FILTER);
    }
  }, [searchFilter.pageNumber]);

  useEffect(() => {
    setSearchFilter(DEFAULT_FILTER);
  }, []);

  const handleCloseModal = useCallback(() => {
    if (showImage) {
      setShowImage(null);
    } else {
      navigation.goBack();
    }
  }, [showImage, navigation]);

  useEffect(() => {
    const backAction = () => {
      handleCloseModal();
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );

    return () => backHandler.remove();
  }, [showImage]);

  return (
    <HeaderLayout headerTitle={selectedCategory || t("location.reviews")}>
      <View className="flex-1">
        <View className="bg-white p-4 gap-y-2">
          <View className="flex-row items-center justify-between">
            <View className="flex-row rounded-lg overflow-hidden border border-gray-200">
              <TouchableOpacity
                className={`flex-row gap-1 px-4 py-1.5 ${
                  reviewFeatures?.data.isLike === true && "bg-green-100"
                }`}
                onPress={() => handleLikeDislike(true)}
              >
                <AntDesign
                  name="like2"
                  size={16}
                  color={
                    reviewFeatures?.data.isLike === true ? "#15803d" : "#6b7280"
                  }
                />
                <BaseText
                  className={`${
                    reviewFeatures?.data.isLike === true
                      ? "text-green-700"
                      : "text-gray-500"
                  }`}
                >
                  {reviewFeatures?.data?.isGoodCount || 0}
                </BaseText>
              </TouchableOpacity>
              <TouchableOpacity
                className={`flex-row gap-1 px-4 py-1.5 border-l border-l-gray-200 ${
                  reviewFeatures?.data.isLike === false && "bg-red-100"
                }`}
                onPress={() => handleLikeDislike(false)}
              >
                <AntDesign
                  name="dislike2"
                  size={16}
                  color={
                    reviewFeatures?.data.isLike === false
                      ? "#b91c1c"
                      : "#6b7280"
                  }
                />
                <BaseText
                  className={`${
                    reviewFeatures?.data.isLike === false
                      ? "text-red-700"
                      : "text-gray-500"
                  }`}
                >
                  {reviewFeatures?.data?.isNotGoodCount || 0}
                </BaseText>
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              onPress={() =>
                navigation.push("LocationAddImage", {
                  locationId: route.params.locationId,
                  featureId: route.params.featureId,
                })
              }
              className="flex-row items-center gap-2 bg-blue-50 px-4 py-2 rounded-lg"
            >
              <MaterialCommunityIcons
                name="camera-plus-outline"
                size={16}
                color="#3b82f6"
              />
              <BaseText className="text-blue-500">Add Image</BaseText>
            </TouchableOpacity>
          </View>
          <BaseText className="text-gray-500 text-sm">
            {t("review.accessibility_review")}
          </BaseText>
        </View>
        <View className="flex-row justify-end p-2">
          <BaseToggleSwitch
            options={switchOptions}
            selectedValue={searchFilter.last24hrs}
            onChange={(value) => {
              setIsFetching(true);
              setSearchFilter((prev) => ({
                ...prev,
                last24hrs: value as boolean,
                pageNumber: 1,
              }));
              setImageList([]);
            }}
          />
        </View>
        {!isFetching ? (
          <MasonryList
            images={imageList}
            columns={2}
            spacing={2}
            backgroundColor="none"
            listContainerStyle={{
              // flexGrow: 1,
              paddingBottom: insets.bottom + 16,
            }}
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            onEndReachedThreshold={0}
            onEndReached={handleNextPage}
            onImageResolved={() => setResolveCount((prev) => prev + 1)}
            emptyView={<BaseEmpty isLoading={isReviewFeaturesLoading} />}
            rerender
            onPressImage={(image: any) => {
              navigation.push("ImagePreview", {
                initialIndex: image.index,
              });
            }}
          />
        ) : (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#3b82f6" />
          </View>
        )}
      </View>
    </HeaderLayout>
  );
}
