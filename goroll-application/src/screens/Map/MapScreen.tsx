import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  View,
  TouchableOpacity,
  Text,
  Alert,
  AppState,
  AppStateStatus,
} from "react-native";
import * as Location from "expo-location";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  AntDesign,
  MaterialIcons,
  Feather,
  FontAwesome5,
  Entypo,
  MaterialCommunityIcons,
  Ionicons,
} from "@expo/vector-icons";
import { openSettings } from "expo-linking";
import Mapbox from "@rnmapbox/maps";
import { useTranslation } from "react-i18next";
import { handleUseLocation } from "../../utils/map/LocationUtil";
import { useRecordingStore } from "../../stores/recordingStore";
import { useNavigation } from "@react-navigation/native";
import { RootStacksParamList } from "../../navigation/NavigationTypes";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import MapComponent, { MapComponentRef } from "./components/MapComponent";
import MapBottomModal, {
  MapBottomModalHandle,
} from "./components/MapBottomModal";
import SearchBar from "./components/SearchBar";
import BaseText from "../../components/common/BaseText";

import ObstacleBottomModal, {
  ObstacleBottomModalHandle,
} from "./components/ObstacleBottomModal";

import {
  useFetchLocations,
  useFetchLocationDetail,
} from "../../services/api/hooks/useLocation";
import {
  LocationListResponse,
  LocationDetailResponse,
} from "../../services/api/types/location";
import {
  useFetchObstacles,
  useFetchObstacleDetail,
} from "../../services/api/hooks/useObstacle";
import {
  ObstacleListResponse,
  ObstacleDetilResponse,
} from "../../services/api/types/obstacle";
import { useFetchRoutes } from "../../services/api/hooks/useRoute";

import { calculateTotalDistanceMeters } from "../../utils/map/HaversineMap";

import { useAppContext } from "../../contexts/app/AppContext";
import { handleAxiosError } from "../../services/api/api";

export default function MapScreen() {
  const { handleShowError } = useAppContext();
  const { t } = useTranslation();
  const {
    isRecording,
    setIsRecording,
    showRecording,
    routeRecord,
    setShowRecording,
    setTimeDuration,
  } = useRecordingStore();
  const insets = useSafeAreaInsets();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStacksParamList>>();
  const cameraRef = useRef<Mapbox.Camera>(null);
  const mapRef = useRef<MapComponentRef>(null);
  const modalRef = useRef<MapBottomModalHandle>(null);
  const obstacleModalRef = useRef<ObstacleBottomModalHandle>(null);
  const [locationList, setLocationList] = useState<GeoJSON.FeatureCollection>({
    type: "FeatureCollection",
    features: [],
  });
  const [selectLocation, setSelectLocation] =
    useState<LocationDetailResponse | null>(null);
  const [selectObstacle, setSelectObstacle] =
    useState<ObstacleDetilResponse | null>(null);
  const [searchLocation, setSearchLocation] = useState<[number, number] | null>(
    null
  );
  const [isRouteVisible, setIsRouteVisible] = useState(true);
  const [is3D, setIs3D] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const totalDistanceMeters = calculateTotalDistanceMeters(routeRecord);

  const createGeoJSON = (
    locations: LocationListResponse[]
  ): GeoJSON.FeatureCollection => ({
    type: "FeatureCollection",
    features: locations.map((item: LocationListResponse) => ({
      type: "Feature",
      id: item.id,
      properties: {
        id: item.id,
        locationType: item.accessLevelId,
        locationCategory: item.categoryId,
        name: item.name,
        description: item.description,
      },
      geometry: {
        type: "Point",
        coordinates: [parseFloat(item.longitude), parseFloat(item.latitude)],
      },
    })),
  });

  const createObstacleGeoJSON = (
    obstacles: ObstacleListResponse[]
  ): GeoJSON.FeatureCollection => ({
    type: "FeatureCollection",
    features: obstacles.map((item: ObstacleListResponse) => ({
      type: "Feature",
      id: item.id,
      properties: {
        id: item.id,
        locationType: "obstacle",
        locationCategory: "obstacle",
        description: item.description,
      },
      geometry: {
        type: "Point",
        coordinates: [parseFloat(item.longitude), parseFloat(item.latitude)],
      },
    })),
  });

  const {
    data: locationsData,
    isError: isLocationError,
    error: locationError,
  } = useFetchLocations();
  useEffect(() => {
    if (isLocationError) {
      console.error("Error fetching locations:", locationError);
      handleAxiosError(locationError, handleShowError);
    }
  }, [isLocationError, locationError]);
  const {
    data: obstaclesData,
    isError: isErrorObstacles,
    error: errorObstacles,
  } = useFetchObstacles();
  useEffect(() => {
    if (isErrorObstacles) {
      console.error("Error fetching obstacles:", errorObstacles);
      handleAxiosError(errorObstacles, handleShowError);
    }
  }, [isErrorObstacles, errorObstacles]);
  useEffect(() => {
    if (locationsData && obstaclesData) {
      const locationGeoJSON = createGeoJSON(locationsData);
      const obstacleGeoJSON = createObstacleGeoJSON(obstaclesData ?? []);

      const combinedFeatures: GeoJSON.Feature[] = [
        ...locationGeoJSON.features,
        ...obstacleGeoJSON.features,
      ];

      setLocationList({
        type: "FeatureCollection",
        features: combinedFeatures,
      });
    }
  }, [locationsData, obstaclesData]);

  const {
    data: routeData,
    isError: isRouteError,
    error: routeError,
  } = useFetchRoutes();
  useEffect(() => {
    if (isRouteError) {
      console.error("Error fetching routes:", routeError);
      handleAxiosError(routeError, handleShowError);
    }
  }, [isRouteError, routeError]);

  const { mutateAsync: fetchLocationDetail } = useFetchLocationDetail();
  const { mutateAsync: fetchObstacleDetail } = useFetchObstacleDetail();

  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return [
      hours.toString().padStart(2, "0"),
      minutes.toString().padStart(2, "0"),
      seconds.toString().padStart(2, "0"),
    ].join(":");
  };

  const promptForLocationPermission = useCallback(() => {
    Alert.alert(
      t("main.location_unavailable_title"),
      t("main.location_unavailable_message"),
      [
        {
          text: t("main.cancel"),
          style: "cancel",
        },
        {
          text: t("main.setting"),
          onPress: () => {
            openSettings();
          },
        },
      ]
    );
  }, [t]);

  const requestLocationPermission = useCallback(async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();

    if (status !== "granted") return;

    handleGetCurrentLocation();
  }, []);

  const handleGetCurrentLocation = async () => {
    try {
      const newLocation = await handleUseLocation();

      if (!newLocation) {
        promptForLocationPermission();
        return;
      }

      cameraRef.current?.setCamera({
        centerCoordinate: [newLocation.longitude, newLocation.latitude],
        zoomLevel: is3D ? 17 : 14,
        heading: 0,
        animationMode: "flyTo",
        animationDuration: 1000,
      });
    } catch (error) {
      console.error("Error getting current location:", error);
      handleAxiosError(error, handleShowError);
    }
  };

  const handleClearRoute = () => {
    mapRef.current?.clearRoute();
    setSeconds(0);
    setIsRecording(false);
    setShowRecording(false);
  };

  const handleEndRecording = () => {
    setTimeDuration(seconds);
    mapRef.current?.saveRoute();
    handleClearRoute();
    navigation.navigate("CreateRoute");
  };

  const promptStoptRecording = useCallback(() => {
    setIsRecording(false);
    Alert.alert(
      t("location.confirm_stop_recording"),
      t("location.are_you_sure_stop_recording"),
      [
        {
          text: t("main.cancel"),
          style: "cancel",
          onPress: () => {
            setIsRecording(true);
            return;
          },
        },
        {
          text: t("main.confirm"),
          onPress: () => {
            handleEndRecording();
          },
          style: "destructive",
        },
      ]
    );
  }, [t, handleEndRecording]);

  const promptCancelRecording = useCallback(() => {
    setIsRecording(false);
    Alert.alert(
      t("location.confirm_cancel_recording"),
      t("location.are_you_sure_cancel_recording"),
      [
        {
          text: t("main.cancel"),
          style: "cancel",
          onPress: () => {
            setIsRecording(true);
            return;
          },
        },
        {
          text: t("main.confirm"),
          onPress: () => {
            handleClearRoute();
          },
          style: "destructive",
        },
      ]
    );
  }, [t, handleClearRoute]);

  const promptPauseRecording = useCallback(() => {
    Alert.alert(
      t("location.pause_recording"),
      t("location.pause_recording_message"),
      [
        {
          text: t("main.cancel"),
          style: "cancel",
          onPress: () => {
            handleClearRoute();
          },
        },
        {
          text: t("location.continue"),
          onPress: () => {
            setIsRecording(true);
            return;
          },
          style: "destructive",
        },
      ]
    );
  }, [t, handleClearRoute]);

  const promptCanNotStopRecording = useCallback(() => {
    Alert.alert(
      t("location.cannot_stop_recording"),
      t("location.no_recording_data")
    );
  }, [t]);

  const handleSelectLocation = useCallback(
    async (id: string, type: string) => {
      try {
        // if (isRecording) return;
        if (type === "obstacle") {
          if (selectObstacle?.id === Number(id)) return;
          obstacleModalRef.current?.close();
          const obstacleData = await fetchObstacleDetail(id);
          if (selectObstacle) {
            await new Promise((resolve) => setTimeout(resolve, 500));
          }
          setSelectObstacle(obstacleData);
          obstacleModalRef.current?.open();
        } else {
          if (selectLocation?.id === Number(id)) return;
          modalRef.current?.close();
          const locationData = await fetchLocationDetail(id);
          if (selectLocation) {
            await new Promise((resolve) => setTimeout(resolve, 500));
          }
          setSelectLocation(locationData);
          modalRef.current?.open();
        }
      } catch (error) {
        console.error("Error selecting location:", error);
        handleAxiosError(error, handleShowError);
      }
    },
    [
      fetchLocationDetail,
      fetchObstacleDetail,
      selectLocation,
      selectObstacle,
      isRecording,
      handleShowError,
    ]
  );

  const [appState, setAppState] = useState<AppStateStatus>(
    AppState.currentState
  );

  useEffect(() => {
    let subscription;

    subscription = AppState.addEventListener(
      "change",
      (nextAppState: AppStateStatus) => {
        if (
          appState.match(/inactive|background/) &&
          nextAppState === "active"
        ) {
          console.log("App has come to the foreground!");
          if (showRecording) {
            promptPauseRecording();
          }
        } else if (nextAppState === "background") {
          console.log("App has gone to the background!");
          if (showRecording) {
            setIsRecording(false);
          }
        }
        setAppState(nextAppState);
      }
    );

    return () => {
      subscription.remove();
    };
  }, [appState, showRecording, promptPauseRecording]);

  useEffect(() => {
    requestLocationPermission();
  }, []);

  useEffect(() => {
    let interval: number | null = null;

    if (isRecording) {
      interval = window.setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    }
    if (!isRecording && interval !== null) {
      clearInterval(interval);
    }

    return () => {
      if (interval !== null) clearInterval(interval);
    };
  }, [isRecording]);

  return (
    <View className="flex-1">
      <View
        style={{ top: insets.top }}
        className="absolute left-0 right-0 z-10"
      >
        <SearchBar
          onLocationSelect={(location) => {
            if (!location) {
              setSearchLocation(null);
              return;
            }

            const { latitude, longitude } = location;
            setSearchLocation([longitude, latitude]);
            cameraRef.current?.setCamera({
              centerCoordinate: [longitude, latitude],
              zoomLevel: 14,
              animationMode: "flyTo",
              animationDuration: 1000,
            });
            if (location.id.includes("be-")) {
              handleSelectLocation(location.id.replace("be-", ""), "location");
            }
          }}
        />
      </View>
      {/* Map Controller */}
      <View
        style={{ top: insets.top + 55 }}
        className="absolute right-0 mr-4 gap-y-4"
      >
        <TouchableOpacity
          className="bg-white rounded-full shadow-md w-12 h-12 items-center justify-center"
          onPress={handleGetCurrentLocation}
        >
          <MaterialIcons name="my-location" size={24} color="#2563eb" />
        </TouchableOpacity>
        <TouchableOpacity
          className="bg-white rounded-full shadow-md w-12 h-12 items-center justify-center"
          onPress={() => setIsRouteVisible(!isRouteVisible)}
        >
          {isRouteVisible ? (
            <MaterialIcons name="route" size={24} color="#2563eb" />
          ) : (
            <Feather name="eye-off" size={20} color="#2563eb" />
          )}
        </TouchableOpacity>
        {is3D && (
          <TouchableOpacity
            className="bg-white rounded-full shadow-md w-12 h-12 items-center justify-center"
            onPress={() => {
              cameraRef.current?.setCamera({
                pitch: 0,
                zoomLevel: 14,
                animationMode: "easeTo",
                animationDuration: 1000,
              });
            }}
          >
            <Text className="font-inter-bold text-blue-600">2D</Text>
          </TouchableOpacity>
        )}
      </View>
      {/* Map */}
      <MapComponent
        ref={mapRef}
        cameraRef={cameraRef}
        locationData={locationList}
        routeData={routeData}
        isRecording={isRecording}
        searchLocation={searchLocation}
        isRouteVisible={isRouteVisible}
        setIs3D={setIs3D}
        handleSelectLocation={handleSelectLocation}
      />

      {/* Time Up */}
      {showRecording && (
        <View className="absolute bottom-0 left-0 right-0 z-20 p-4">
          <View className="flex-row bg-white rounded-lg shadow-lg p-4 items-center justify-between">
            <View className="flex-row items-center gap-x-2">
              <Entypo name="controller-record" size={16} color="#dc2626" />
              <View className="gap-y-1">
                <View className="flex-row gap-x-2">
                  <MaterialCommunityIcons
                    name="timer-outline"
                    size={14}
                    color="#4b5563"
                  />
                  <BaseText className="text-gray-600 text-sm">
                    {formatTime(seconds)}
                  </BaseText>
                </View>
                <View className="flex-row gap-x-2">
                  <FontAwesome5 name="route" size={14} color="#4b5563" />
                  <BaseText className="text-gray-600 text-sm">
                    {(totalDistanceMeters / 1000).toFixed(3)}{" "}
                    {t("route.kilometer")}
                  </BaseText>
                </View>
              </View>
              {!isRecording && (
                <BaseText
                  className="text-xs text-red-600 rounded-full bg-red-50 px-2 py-0.5 ml-2"
                  fontWeight="medium"
                >
                  {t("location.pause")}
                </BaseText>
              )}
            </View>
            <View className="flex-row items-center gap-x-4">
              {/* <TouchableOpacity onPress={() => setIsRecording(!isRecording)}>
                {isRecording ? (
                  <Ionicons name="pause" size={18} color="#4b5563" />
                ) : (
                  <Feather name="play" size={18} color="#16a34a" />
                )}
              </TouchableOpacity> */}
              <TouchableOpacity
                onPress={() => {
                  if (seconds <= 0 || routeRecord.length <= 1) {
                    promptCanNotStopRecording();
                  } else {
                    promptStoptRecording();
                  }
                }}
              >
                <FontAwesome5 name="stop-circle" size={18} color="#dc2626" />
              </TouchableOpacity>
              <TouchableOpacity onPress={promptCancelRecording}>
                <AntDesign name="close" size={18} color="#4b5563" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
      {/* Map Modal */}
      <MapBottomModal
        ref={modalRef}
        locationData={selectLocation}
        setLocationData={setSelectLocation}
      />
      {/* Obstacle Modal */}
      <ObstacleBottomModal
        ref={obstacleModalRef}
        locationData={selectObstacle}
        setLocationData={setSelectObstacle}
      />
    </View>
  );
}
