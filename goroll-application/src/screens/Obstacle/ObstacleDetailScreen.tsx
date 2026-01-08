import { View, TouchableOpacity, Image, ScrollView } from "react-native";
import React, { useEffect, useCallback } from "react";
import { AntDesign } from "@expo/vector-icons";
import {
  ObstacleDetilResponse,
  ObstacleStatusResponse,
} from "../../services/api/types/obstacle";
import { useTranslation } from "react-i18next";
import NoImage from "../../assets/no-image.png";
import { formatDate } from "../../utils/time/FormatTimes";
import {
  useFetchObstacleStatus,
  useFetchObstacleDetail,
} from "../../services/api/hooks/useObstacle";
import { useRoute, RouteProp } from "@react-navigation/native";
import { RootStacksParamList } from "../../navigation/NavigationTypes";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import BaseText from "../../components/common/BaseText";
import BaseCarousel from "../../components/common/BaseCarousel";
import { handleAxiosError } from "../../services/api/api";

import { useAppContext } from "../../contexts/app/AppContext";

export default function ObstacleDetailScreen() {
  const { handleShowError } = useAppContext();
  const { t, i18n } = useTranslation();
  const route = useRoute<RouteProp<RootStacksParamList, "ObstacleDetail">>();
  const insets = useSafeAreaInsets();

  const [obstacleData, setObstacleData] =
    React.useState<ObstacleDetilResponse | null>(null);

  const { mutateAsync: fetchObstacleDetail } = useFetchObstacleDetail();

  const handleFetchObstacleDetail = useCallback(async () => {
    try {
      const data = await fetchObstacleDetail(route.params.obstacleId);
      setObstacleData(data);
    } catch (error) {
      console.error("Error fetching obstacle detail:", error);
      handleAxiosError(error, handleShowError);
    }
  }, [fetchObstacleDetail, route.params.obstacleId, handleShowError]);

  const {
    data: statusData,
    isError: isErrorStatus,
    error: errorStatus,
  } = useFetchObstacleStatus();
  useEffect(() => {
    if (isErrorStatus) {
      console.error("Error fetching obstacle status:", errorStatus);
      handleAxiosError(errorStatus, handleShowError);
    }
  }, [isErrorStatus, errorStatus]);

  useEffect(() => {
    if (route.params.obstacleId) {
      handleFetchObstacleDetail();
    }
  }, [route.params.obstacleId]);

  return (
    <ScrollView
      className="bg-white shadow-lg"
      style={{ paddingBottom: insets.bottom }}
    >
      <View className="w-full aspect-[4/3]">
        {obstacleData?.img && obstacleData.img.length > 0 ? (
          <BaseCarousel imgUrl={obstacleData.img} />
        ) : (
          <Image
            source={NoImage}
            style={{ width: "100%", height: "100%", resizeMode: "cover" }}
          />
        )}
      </View>
      <View className="gap-y-3 p-4">
        <View className="gap-y-2">
          {statusData?.find(
            (status: ObstacleStatusResponse) =>
              status.id === obstacleData?.statusId
          ) ? (
            <View
              className={`px-3 py-1.5 rounded-full text-sm flex-row items-center self-start gap-2 ${
                obstacleData?.statusId === 1 ? "bg-red-100" : "bg-green-100"
              }`}
            >
              <View
                className={`w-2 h-2 rounded-full ${
                  obstacleData?.statusId === 1 ? "bg-red-500" : "bg-green-500"
                }`}
              />
              <BaseText
                className={`text-xs ${
                  obstacleData?.statusId === 1
                    ? "text-red-500"
                    : "text-green-500"
                }`}
                fontWeight="medium"
              >
                {i18n.language === "th"
                  ? statusData.find(
                      (status: ObstacleStatusResponse) =>
                        status.id === obstacleData?.statusId
                    )?.nameTh
                  : statusData.find(
                      (status: ObstacleStatusResponse) =>
                        status.id === obstacleData?.statusId
                    )?.nameEn}
              </BaseText>
            </View>
          ) : null}
          <View className="flex-row items-center gap-x-2">
            <AntDesign name="warning" size={24} color="#f97316" />
            <BaseText className="text-lg text-gray-500" fontWeight="medium">
              {i18n.language === "th"
                ? obstacleData?.subcategory?.category?.nameTh
                : obstacleData?.subcategory?.category?.nameEn}
            </BaseText>
          </View>
          <BaseText className="text-base" fontWeight="medium">
            {i18n.language === "th"
              ? obstacleData?.subcategory?.nameTh
              : obstacleData?.subcategory?.nameEn}
          </BaseText>
        </View>
        <BaseText className="text-xs text-gray-600" fontWeight="medium">
          {obstacleData?.description || "-"}
        </BaseText>
        <View className="gap-y-2">
          <BaseText className="text-sm text-gray-500" fontWeight="medium">
            {t("obstacle.report_by")} :{" "}
            {obstacleData?.user?.fullName ?? "Unknown"}
          </BaseText>
          <BaseText className="text-sm text-gray-500" fontWeight="medium">
            {t("obstacle.date_reported")} :{" "}
            {formatDate(obstacleData?.createdAt, i18n.language)}
          </BaseText>
          <BaseText className="text-sm text-gray-500" fontWeight="medium">
            {t("obstacle.check_reporded")} :{" "}
            {formatDate(obstacleData?.updatedAt, i18n.language)}
          </BaseText>
        </View>
      </View>
    </ScrollView>
  );
}
