import { View, ScrollView } from "react-native";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useRoute, RouteProp } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { RootStacksParamList } from "../../navigation/NavigationTypes";
import { calculateMapBounds } from "../../utils/map/HaversineMap";
import { handleAxiosError } from "../../services/api/api";

import {
  formatDateTime,
  formatDurationAbbreviated,
} from "../../utils/time/FormatTimes";

import HeaderLayout from "../../layouts/HeaderLayout";

import BaseText from "../../components/common/BaseText";
import MapRoutePreview from "../../components/map/MapRoutePreview";

import { useQueryRouteDetail } from "../../services/api/hooks/useRoute";

import { useAppContext } from "../../contexts/app/AppContext";

export default function RouteDetailScreen() {
  const { handleShowError } = useAppContext();
  const insets = useSafeAreaInsets();
  const { t, i18n } = useTranslation();
  const route = useRoute<RouteProp<RootStacksParamList, "RouteDetail">>();

  const [scrollEnabled, setScrollEnabled] = useState(true);
  const [centerLocation, setCenterLocation] = useState<[number, number]>([
    13.7563, 100.5018,
  ]);
  const [zoomLevel, setZoomLevel] = useState(15);

  const {
    data: routeDetail,
    isError: isRouteDetailError,
    error: routeDetailError,
  } = useQueryRouteDetail(route.params.routeId);
  useEffect(() => {
    if (routeDetail) {
      const bounds = calculateMapBounds(routeDetail.routeCoordinates);

      setCenterLocation(bounds.center);
      setZoomLevel(bounds.zoom - 0.5);
    }
  }, [routeDetail]);
  useEffect(() => {
    if (isRouteDetailError) {
      console.error("Error fetching route detail:", routeDetailError);
      handleAxiosError(routeDetailError, handleShowError);
    }
  }, [isRouteDetailError, routeDetailError, handleShowError]);

  return (
    <HeaderLayout headerTitle={t("route.save_route")}>
      <ScrollView scrollEnabled={scrollEnabled}>
        <View
          className="flex-1 p-4"
          style={{ paddingBottom: insets.bottom + 16 }}
        >
          {routeDetail && (
            <View className=" gap-y-6">
              <MapRoutePreview
                centerLocation={centerLocation}
                showLocation={routeDetail.routeCoordinates}
                className="!rounded-lg !shadow-sm"
                zoomLevel={zoomLevel}
                scrollEnabled={scrollEnabled}
                setScrollEnabled={setScrollEnabled}
              />
              <View className="bg-white rounded-lg shadow-sm p-4 gap-y-2">
                <View>
                  <BaseText className="text-base" fontWeight="semibold">
                    {t("route.route_name")}
                  </BaseText>
                  <BaseText className="text-sm text-gray-500">
                    {routeDetail.name}
                  </BaseText>
                </View>
                <View>
                  <BaseText className="text-base" fontWeight="semibold">
                    {t("route.from")}
                  </BaseText>
                  <BaseText className="text-sm text-gray-500">
                    {routeDetail.startLocationName}
                  </BaseText>
                </View>
                <View>
                  <BaseText className="text-base" fontWeight="semibold">
                    {t("route.to")}
                  </BaseText>
                  <BaseText className="text-sm text-gray-500">
                    {routeDetail.endLocationName}
                  </BaseText>
                </View>
                <View>
                  <BaseText className="text-base" fontWeight="semibold">
                    {t("route.description")}
                  </BaseText>
                  <BaseText className="text-sm text-gray-500">
                    {routeDetail.description}
                  </BaseText>
                </View>
              </View>
              <View className="bg-white rounded-lg shadow-sm p-4 gap-y-2">
                <View className="flex-row gap-x-2">
                  <View className="flex-1">
                    <BaseText className="text-sm" fontWeight="semibold">
                      {t("route.distance")}
                    </BaseText>
                    <BaseText className="text-sm text-gray-500">
                      {(routeDetail.totalDistanceMeters / 1000).toFixed(3)}{" "}
                      {t("route.kilometer")}
                    </BaseText>
                  </View>
                  <View className="flex-1">
                    <BaseText className="text-sm" fontWeight="semibold">
                      {t("route.duration")}
                    </BaseText>
                    <BaseText className="text-sm text-gray-500">
                      {formatDurationAbbreviated(
                        routeDetail.time,
                        i18n.language
                      )}
                    </BaseText>
                  </View>
                </View>
                <View className="flex-1">
                  <BaseText className="text-sm" fontWeight="semibold">
                    {t("route.date")}
                  </BaseText>
                  <BaseText className="text-sm text-gray-500">
                    {formatDateTime(routeDetail.createdAt, i18n.language)}
                  </BaseText>
                </View>
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </HeaderLayout>
  );
}
