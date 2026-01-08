import { TouchableOpacity, View } from "react-native";
import React, { useRef } from "react";
import {
  MapView,
  Camera,
  Images,
  ShapeSource,
  SymbolLayer,
  MarkerView,
} from "@rnmapbox/maps";
import { FontAwesome5, Feather } from "@expo/vector-icons";

type MapPreviewProps = {
  cameraRef?: React.RefObject<Camera>;
  showLocation: [number, number] | null;
  centerLocation?: number[];
  type: number;
  category: number;
  className?: string;
  isEdit?: boolean;
  defaultMarker?: boolean;
  scrollEnabled?: boolean;
  setScrollEnabled?: (enabled: boolean) => void;
  onSelectLocation?: (latitude: string, longitude: string) => void;
  onLayout?: () => void;
};

const ICON_MAPS = {
  "1-1": require("../../assets/icons/location/mall-easy.png"),
  "1-2": require("../../assets/icons/location/mall-medium.png"),
  "1-3": require("../../assets/icons/location/mall-hard.png"),
  "3-1": require("../../assets/icons/location/park-easy.png"),
  "3-2": require("../../assets/icons/location/park-medium.png"),
  "3-3": require("../../assets/icons/location/park-hard.png"),
  "4-1": require("../../assets/icons/location/restaurant-easy.png"),
  "4-2": require("../../assets/icons/location/restaurant-medium.png"),
  "4-3": require("../../assets/icons/location/restaurant-hard.png"),
  "2-1": require("../../assets/icons/location/transport-easy.png"),
  "2-2": require("../../assets/icons/location/transport-medium.png"),
  "2-3": require("../../assets/icons/location/transport-hard.png"),
  obstacle: require("../../assets/icons/location/obstacle-obstacle.png"),
};

export default function MapPreview({
  cameraRef,
  showLocation,
  centerLocation = [100.5480753, 13.790035],
  type,
  category,
  className = "",
  isEdit = false,
  defaultMarker = false,
  scrollEnabled = true,
  setScrollEnabled,
  onSelectLocation,
  onLayout,
}: MapPreviewProps) {
  const feature: GeoJSON.FeatureCollection<GeoJSON.Geometry> = {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: showLocation || [100.5480753, 13.790035],
        },
        properties: {
          iconKey:
            type === 0 && category === 0 ? "obstacle" : `${category}-${type}`,
        },
      },
    ],
  };

  const handleSelect = (event: any) => {
    const [longitude, latitude] = event.geometry.coordinates;
    onSelectLocation?.(latitude.toString(), longitude.toString());
  };

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
            {scrollEnabled ? (
              <Feather name="move" size={18} color="black" />
            ) : (
              <Feather name="lock" size={18} color="black" />
            )}
          </TouchableOpacity>
        </View>
      )}
      {scrollEnabled && <View className="absolute z-10 h-full w-full"/>}
      <MapView
        style={{ flex: 1 }}
        scaleBarEnabled={false}
        attributionEnabled={false}
        scrollEnabled={isEdit}
        zoomEnabled={isEdit}
        pitchEnabled={isEdit}
        rotateEnabled={isEdit}
        onPress={handleSelect}
        onLayout={onLayout}
      >
        {defaultMarker ? (
          <MarkerView
            coordinate={showLocation || [100.5480753, 13.790035]}
            anchor={{ x: 0.5, y: 1 }}
          >
            <FontAwesome5 name="map-marker-alt" size={30} color="red" />
          </MarkerView>
        ) : (
          <>
            <Images images={ICON_MAPS} />

            <ShapeSource id="marker-source" shape={feature}>
              <SymbolLayer
                id="marker-symbol"
                style={{
                  iconImage: ["get", "iconKey"],
                  iconSize: 0.3,
                  iconAnchor: "bottom",
                }}
              />
            </ShapeSource>
          </>
        )}

        <Camera
          ref={cameraRef}
          centerCoordinate={
            isEdit ? centerLocation : showLocation || [100.5480753, 13.790035]
          }
          zoomLevel={15}
          animationMode="none"
          animationDuration={0}
        />
      </MapView>
    </View>
  );
}
