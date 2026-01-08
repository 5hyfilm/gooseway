import { View, TouchableOpacity, StyleSheet } from "react-native";
import React from "react";
import {
  MapView,
  Camera,
  ShapeSource,
  LineLayer,
  MarkerView,
} from "@rnmapbox/maps";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useTranslation } from "react-i18next";
import Feather from "@expo/vector-icons/Feather";

type MapRoutePreviewProps = {
  showLocation: [number, number][];
  centerLocation?: number[];
  className?: string;
  zoomLevel?: number;
  scrollEnabled?: boolean;
  setScrollEnabled?: (enabled: boolean) => void;
};

import BaseText from "../common/BaseText";

export default function MapRoutePreview({
  showLocation,
  centerLocation = [100.5480753, 13.790035],
  className = "",
  zoomLevel = 15,
  scrollEnabled = true,
  setScrollEnabled,
}: MapRoutePreviewProps) {
  const { t } = useTranslation();

  return (
    <View
      className={`w-full aspect-square rounded-3xl overflow-hidden shadow relative ${className}`}
    >
      {setScrollEnabled && (
        <View className="absolute top-2 right-2 z-20">
          <TouchableOpacity
            onPress={() => setScrollEnabled(!scrollEnabled)}
            className="bg-white rounded-full shadow-md w-10 h-10 items-center justify-center"
          >
            {scrollEnabled ? <Feather name="move" size={18} color="black" /> : <Feather name="lock" size={18} color="black" />}
          </TouchableOpacity>
        </View>
      )}
      {scrollEnabled && <View className="absolute z-10 h-full w-full"/>}
      <MapView
        style={{ flex: 1 }}
        scaleBarEnabled={false}
        attributionEnabled={false}
        scrollEnabled={true}
        zoomEnabled={true}
        pitchEnabled={true}
        rotateEnabled={false}
      >
        <Camera
          centerCoordinate={centerLocation || [100.5480753, 13.790035]}
          zoomLevel={zoomLevel}
          animationMode="none"
          animationDuration={0}
        />

        {showLocation.length > 1 && (
          <ShapeSource
            id="route"
            shape={{
              type: "Feature",
              properties: {},
              geometry: {
                type: "LineString",
                coordinates: showLocation,
              },
            }}
          >
            <LineLayer
              id="routeLine"
              style={{
                lineColor: "#15803d",
                lineWidth: 5,
                lineOpacity: 0.6,
                lineCap: "round",
                lineJoin: "round",
              }}
            />
          </ShapeSource>
        )}

        <MarkerView
          id="start-marker"
          coordinate={showLocation[0]}
          anchor={{ x: 0.5, y: 1 }}
        >
          <View className="items-center gap-y-0.5">
            <View className="bg-white shadow-sm p-1.5 rounded bg-bl">
              <BaseText className="text-xs">{t("route.from")}</BaseText>
            </View>
            <FontAwesome name="map-marker" size={24} color="#2563eb" />
          </View>
        </MarkerView>

        <MarkerView
          id="end-marker"
          coordinate={showLocation[showLocation.length - 1]}
          anchor={{ x: 0.5, y: 1 }}
        >
          <View className="items-center gap-y-0.5">
            <View className="bg-white shadow-sm  p-1.5 rounded">
              <BaseText className="text-xs">{t("route.to")}</BaseText>
            </View>
            <FontAwesome name="map-marker" size={24} color="#2563eb" />
          </View>
        </MarkerView>
      </MapView>
    </View>
  );
}
