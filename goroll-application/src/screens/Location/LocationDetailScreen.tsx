import { View, ScrollView, TouchableOpacity, Image } from "react-native";
import React, { useEffect } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRoute, RouteProp, useNavigation } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStacksParamList } from "../../navigation/NavigationTypes";
import { AntDesign } from "@expo/vector-icons";
import { StarRatingDisplay } from "react-native-star-rating-widget";
import NoImage from "../../assets/no-image.png";

import MallIcon from "../../components/icons/location/MallIcon";
import ParkIcon from "../../components/icons/location/ParkIcon";
import ResturantIcon from "../../components/icons/location/ResturantIcon";
import TransportIcon from "../../components/icons/location/TransportIcon";

import BaseCarousel from "../../components/common/BaseCarousel";
import BaseButton from "../../components/common/BaseButton";

import ReviewCardList from "./components/ReviewCardList";
import BaseText from "../../components/common/BaseText";
import ReviewCategoryList from "./components/ReviewCategoryList";
import MapPreview from "../../components/map/MapPreview";

import { useFetchLocationById } from "../../services/api/hooks/useLocation";
import { useFetchReviews } from "../../services/api/hooks/useReview";
import i18n from "../../languages/i18n";

import { useAppContext } from "../../contexts/app/AppContext";

import AccessLevelStatus from "../Map/components/AccessLevelStatus";
import { handleAxiosError } from "../../services/api/api";

export default function LocationDetailScreen() {
  const { handleShowError } = useAppContext();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStacksParamList>>();
  const route = useRoute<RouteProp<RootStacksParamList, "LocationDetail">>();

  const LocationIcon = (id: number) => {
    switch (id) {
      case 1:
        return <MallIcon color="black" />;
      case 2:
        return <TransportIcon color="black" />;
      case 3:
        return <ParkIcon color="black" />;
      case 4:
        return <ResturantIcon color="black" />;
      default:
        break;
    }
  };

  const {
    data: locationData,
    isError: isErrorLocation,
    error: errorLocation,
  } = useFetchLocationById(route.params.locationId);
  useEffect(() => {
    if (isErrorLocation) {
      console.error("Error fetching location data:", errorLocation);
      handleAxiosError(errorLocation, handleShowError);
    }
  }, [isErrorLocation, errorLocation]);

  const {
    data: reviewsData,
    isError: isErrorReviews,
    error: errorReviews,
  } = useFetchReviews(
    {
      locationId: Number(route.params.locationId),
      last24hrs: false,
      sortBy: [{ column: "createdAt", direction: "desc" }],
      limit: 10,
      pageNumber: 1,
    },
    !!route.params.locationId
  );
  useEffect(() => {
    if (isErrorReviews) {
      console.error("Error fetching reviews data:", errorReviews);
      handleAxiosError(errorReviews, handleShowError);
    }
  }, [isErrorReviews, errorReviews]);

  return (
    <ScrollView className="bg-white">
      <View style={{ paddingBottom: insets.bottom + 16 }}>
        <View className="w-full aspect-[4/3]">
          {locationData?.img && locationData.img.length > 0 ? (
            <BaseCarousel
              positionVertical="bottom"
              positionHorizontal="right"
              imgUrl={locationData.img}
            />
          ) : (
            <Image
              source={NoImage}
              style={{ width: "100%", height: "100%", resizeMode: "cover" }}
            />
          )}
          <View
            style={{
              position: "absolute",
              right: 16,
              top: insets.top,
            }}
          >
            <TouchableOpacity
              className="rounded-full p-2 bg-white/60"
              onPress={() => navigation.goBack()}
            >
              <AntDesign name="close" size={16} color="black" />
            </TouchableOpacity>
          </View>
        </View>
        <View className="p-4 gap-y-2">
          <BaseText className="text-2xl text-center" fontWeight="bold">
            {locationData?.name || "Location Name"}
          </BaseText>
          <AccessLevelStatus
            label={
              i18n.language === "th"
                ? locationData?.accessLevel.nameTh || ""
                : locationData?.accessLevel.nameEn || ""
            }
            accessLevel={locationData?.accessLevel.id || 0}
            className="self-center"
          />
          <BaseText className="text-sm text-center text-gray-500">
            {locationData?.description || "Location Description"}
          </BaseText>
          <View className="flex-row justify-between items-center w-full mt-4">
            <View className="flex-col items-center flex-1">
              <BaseText fontWeight="semibold">
                {locationData?.averageRating.toFixed(2) || 0}
              </BaseText>
              <StarRatingDisplay
                rating={locationData?.averageRating || 0}
                maxStars={5}
                starSize={11}
                starStyle={{ marginHorizontal: 0 }}
                color="black"
              />
            </View>
            <View className="flex-col items-center flex-1 border-x border-gray-300 gap-y-1">
              {LocationIcon(locationData?.categoryId || 0)}
              <BaseText fontWeight="semibold">
                {i18n.language === "th"
                  ? locationData?.category?.nameTh
                  : locationData?.category?.nameEn || "N/A"}
              </BaseText>
            </View>
            <View className="flex-col items-center flex-1">
              <BaseText fontWeight="semibold">
                {locationData?.reviewCount || "N/A"}
              </BaseText>
              <BaseText className="text-xs" fontWeight="semibold">
                {t("location.reviews")}
              </BaseText>
            </View>
          </View>
        </View>
        <View className="flex-1 px-4 gap-y-4">
          <View className="flex-col gap-y-4">
            <ReviewCategoryList id={route.params.locationId} />
          </View>
          <View className="flex-col gap-y-4">
            <BaseText className="text-lg" fontWeight="semibold">
              {t("location.reviews")}
            </BaseText>
            <ReviewCardList reviews={reviewsData?.data ?? []} />
            <BaseButton
              className="bg-gray-300 w-full"
              onPress={() =>
                navigation.navigate("LocationReviews", {
                  locationId: route.params.locationId,
                })
              }
            >
              <BaseText className="text-center text-sm" fontWeight="semibold">
                {t("location.show_all_reviews")}
              </BaseText>
            </BaseButton>
          </View>
          <View className="flex-col gap-y-4">
            <BaseText className="text-lg" fontWeight="semibold">
              {t("location.location")}
            </BaseText>
            <MapPreview
              showLocation={[
                Number(locationData?.longitude) || 0,
                Number(locationData?.latitude) || 0,
              ]}
              type={locationData?.accessLevelId || 0}
              category={locationData?.categoryId || 0}
            />
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
