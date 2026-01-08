import React, {
  useState,
  useRef,
  useImperativeHandle,
  forwardRef,
  useCallback,
} from "react";
import Mapbox, {
  MapView,
  Camera,
  LocationPuck,
  UserLocation,
  ShapeSource,
  LineLayer,
  MarkerView,
  FillExtrusionLayer,
  VectorSource,
  Images,
} from "@rnmapbox/maps";
import { useRecordingStore } from "../../../stores/recordingStore";
import { haversineDistance } from "../../../utils/map/HaversineMap";
import FontAwesome from "@expo/vector-icons/FontAwesome";

import RouteLayer from "./RouteLayer";
import MapCluster from "./MapCluster";

type LocationType = {
  cameraRef: React.RefObject<Mapbox.Camera>;
  locationData: GeoJSON.FeatureCollection;
  routeData: any;
  isRecording: boolean;
  searchLocation: [number, number] | null;
  isRouteVisible: boolean;
  setIs3D: React.Dispatch<React.SetStateAction<boolean>>;
  handleSelectLocation: (id: string, type: string) => void;
};

export type MapComponentRef = {
  saveRoute: () => void;
  clearRoute: () => void;
};

const ICON_MAPS = {
  "1-1": require("../../../assets/icons/location/mall-easy.png"),
  "1-2": require("../../../assets/icons/location/mall-medium.png"),
  "1-3": require("../../../assets/icons/location/mall-hard.png"),
  "3-1": require("../../../assets/icons/location/park-easy.png"),
  "3-2": require("../../../assets/icons/location/park-medium.png"),
  "3-3": require("../../../assets/icons/location/park-hard.png"),
  "4-1": require("../../../assets/icons/location/restaurant-easy.png"),
  "4-2": require("../../../assets/icons/location/restaurant-medium.png"),
  "4-3": require("../../../assets/icons/location/restaurant-hard.png"),
  "2-1": require("../../../assets/icons/location/transport-easy.png"),
  "2-2": require("../../../assets/icons/location/transport-medium.png"),
  "2-3": require("../../../assets/icons/location/transport-hard.png"),
  obstacle: require("../../../assets/icons/location/obstacle-obstacle.png"),
};

const STYLE_URL = "mapbox://styles/mapbox/streets-v12";
Mapbox.setAccessToken(process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN);
Mapbox.setTelemetryEnabled(true);

const MapComponent = forwardRef<MapComponentRef, LocationType>(
  (
    {
      cameraRef,
      locationData,
      routeData,
      isRecording,
      searchLocation,
      isRouteVisible,
      setIs3D,
      handleSelectLocation,
    },
    ref
  ) => {
    const { setRouteRecord, frequencyRange } = useRecordingStore();
    const [showRoute, setShowRoute] = useState(true);
    const [routeCoords, setRouteCoords] = useState<[number, number][]>([]);
    const [routesClicked, setRoutesClicked] = useState<[number, number][]>([]);

    const lastCoordRef = useRef<[number, number] | null>(null);
    const lastBearingRef = useRef<number | null>(null);

    useImperativeHandle(ref, () => ({
      saveRoute: () => {
        if (routeCoords.length > 0) {
          setRouteRecord(routeCoords);
        }
      },
      clearRoute: () => {
        setRouteCoords([]);
        lastCoordRef.current = null;
        lastBearingRef.current = null;
      },
    }));

    const handleRegionChange = useCallback(
      (event: Mapbox.MapState) => {
        const { zoom, pitch } = event.properties;

        if (pitch > 0.5) {
          setIs3D(true);
        } else {
          setIs3D(false);
        }
      },
      [setIs3D]
    );

    const handleLocationUpdate = (location: Mapbox.Location) => {
      const { coords } = location;
      const newCoord: [number, number] = [coords.longitude, coords.latitude];
      const lastCoord = lastCoordRef.current;

      if (
        !lastCoord ||
        haversineDistance(lastCoord, newCoord) > frequencyRange
      ) {
        setRouteRecord([...routeCoords, newCoord]);
        setRouteCoords((prev) => [...prev, newCoord]);
        lastCoordRef.current = newCoord;

        if (cameraRef?.current) {
          cameraRef.current.setCamera({
            centerCoordinate: newCoord,
            heading: coords.heading,
            // zoomLevel: 14,
            animationMode: "easeTo",
            animationDuration: 1000,
          });
        }
      }
    };

    const handleClickLocation = (id: string, type: string) => {
      handleSelectLocation(id, type);
    };

    // const handleMapPress = (e: any) => {
    //   const [longitude, latitude] = e.geometry.coordinates;
    //   const newCoord: [number, number] = [longitude, latitude];
    //   setRoutesClicked((prev) => [...prev, newCoord]);
    //   console.log("Map pressed at:", newCoord);

    // };

    // useEffect(() => {
    //   if (routesClicked.length > 0) {
    //     console.log("Routes clicked:", routesClicked);
    //   }
    // }, [routesClicked]);

    return (
      <MapView
        style={{ flex: 1, zIndex: -10 }}
        // styleURL={STYLE_URL}
        scaleBarEnabled={false}
        attributionEnabled={false}
        onCameraChanged={handleRegionChange}
        // onPress={handleMapPress}
      >
        <VectorSource id="composite" existing>
          <FillExtrusionLayer
            id="3d-buildings"
            sourceLayerID="building"
            minZoomLevel={15}
            maxZoomLevel={22}
            style={{
              fillExtrusionColor: "#aaa",
              fillExtrusionHeight: ["get", "height"],
              fillExtrusionBase: ["get", "min_height"],
              fillExtrusionOpacity: 0.6,
            }}
          />
        </VectorSource>

        <Camera
          ref={cameraRef}
          centerCoordinate={[100.5480753, 13.790035]}
          zoomLevel={10}
          animationMode="flyTo"
          animationDuration={1000}
        />

        <UserLocation
          visible={false}
          onUpdate={(location) => {
            if (isRecording) {
              handleLocationUpdate(location);
            }
          }}
        />

        {searchLocation && (
          <MarkerView
            id="search-marker"
            coordinate={searchLocation}
            anchor={{ x: 0.5, y: 1 }}
          >
            <FontAwesome name="map-marker" size={24} color="#2563eb" />
          </MarkerView>
        )}

        <Images images={ICON_MAPS} />

        <MapCluster
          combinedGeoJSON={locationData}
          onClick={handleClickLocation}
        />

        {routeData?.length > 0 && (
          <RouteLayer visible={isRouteVisible} routes={routeData} />
        )}

        {routeCoords.length > 1 && (
          <ShapeSource
            id="route"
            shape={{
              type: "Feature",
              properties: {},
              geometry: {
                type: "LineString",
                coordinates: routeCoords,
              },
            }}
          >
            <LineLayer
              id="routeLine"
              style={{
                lineColor: "#2563eb",
                lineWidth: 5,
                lineOpacity: 0.6,
                lineCap: "round",
                lineJoin: "round",
              }}
            />
          </ShapeSource>
        )}

        <LocationPuck
          puckBearingEnabled
          puckBearing="heading"
          pulsing={{ isEnabled: true }}
        />
      </MapView>
    );
  }
);

export default MapComponent;
