import { View, TextInput, Alert } from "react-native";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useRecordingStore } from "../../stores/recordingStore";
import { useTranslation } from "react-i18next";
import { Feather } from "@expo/vector-icons";
import { useCreateRoute } from "../../services/api/hooks/useRoute";
import { useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAppContext } from "../../contexts/app/AppContext";
import { handleAxiosError } from "../../services/api/api";

import {
  formatDateTime,
  formatDurationAbbreviated,
} from "../../utils/time/FormatTimes";
import {
  calculateTotalDistanceMeters,
  calculateMapBounds,
} from "../../utils/map/HaversineMap";

import HeaderLayout from "../../layouts/HeaderLayout";
import KeyboardScrollLayout from "../../layouts/KeyboardScrollLayout";

import BaseText from "../../components/common/BaseText";
import FormInput from "../../components/form/FormInput";
import MapRoutePreview from "../../components/map/MapRoutePreview";

type CreateRouteFormData = {
  name: string;
  description: string;
  startLocationName: string;
  endLocationName: string;
};

export default function CreateRouteScreen() {
  const { handleShowError } = useAppContext();
  const insets = useSafeAreaInsets();
  const { routeRecord, timeDuration, dateRecording } = useRecordingStore();
  const { t, i18n } = useTranslation();
  const navigation = useNavigation();
  const [formData, setFormData] = useState<CreateRouteFormData>({
    name: "",
    description: "",
    startLocationName: "",
    endLocationName: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const totalDistanceMeters = calculateTotalDistanceMeters(routeRecord);
  const [scrollEnabled, setScrollEnabled] = useState(true);

  const fromRef = useRef<TextInput>(null);
  const toRef = useRef<TextInput>(null);
  const descriptionRef = useRef<TextInput>(null);

  const createRouteMutation = useCreateRoute();

  const [centerLocation, setCenterLocation] = useState<[number, number]>([
    13.7563, 100.5018,
  ]);
  const [zoomLevel, setZoomLevel] = useState(15);
  useEffect(() => {
    const bounds = calculateMapBounds(routeRecord);
    setCenterLocation(bounds.center);
    setZoomLevel(bounds.zoom - 0.5);
  }, [routeRecord]);

  const promptStopCreating = useCallback(() => {
    Alert.alert(
      t("route.confirm_stop_create"),
      t("route.confirm_stop_create_description"),
      [
        {
          text: t("main.cancel"),
          style: "cancel",
        },
        {
          text: t("main.confirm"),
          onPress: () => {
            navigation.goBack();
          },
        },
      ]
    );
  }, [navigation, t]);

  const handleSaveRoute = useCallback(async () => {
    try {
      setIsSubmitting(true);
      if (
        !formData.name.trim() ||
        !formData.startLocationName.trim() ||
        !formData.endLocationName.trim()
      ) {
        return;
      }
      const routeData = {
        name: formData.name,
        description: formData.description,
        totalDistanceMeters: totalDistanceMeters,
        startLocationName: formData.startLocationName,
        endLocationName: formData.endLocationName,
        time: timeDuration,
        isPublic: true,
        routeDate: dateRecording,
        routeCoordinates: routeRecord,
      };

      await createRouteMutation.mutateAsync(routeData);
      Alert.alert(t("main.success"), t("route.create_route_success"));
      navigation.goBack();
    } catch (error) {
      console.error("Error saving route:", error);
      handleAxiosError(error, handleShowError);
    }
  }, [
    createRouteMutation,
    routeRecord,
    timeDuration,
    dateRecording,
    handleShowError,
  ]);

  return (
    <HeaderLayout
      headerTitle={t("route.save_route")}
      rightButtonTitle={t("route.save_changes")}
      rightIcon={<Feather name="save" size={16} color="#fff" />}
      handlePressRightButton={handleSaveRoute}
      loading={createRouteMutation.isPending}
      disabled={routeRecord.length < 2}
      handleBackPress={promptStopCreating}
    >
      <KeyboardScrollLayout scrollEnabled={scrollEnabled}>
        <View
          className="flex-1 gap-y-6 p-4"
          style={{ paddingBottom: insets.bottom + 16 }}
        >
          <MapRoutePreview
            centerLocation={centerLocation}
            showLocation={routeRecord}
            zoomLevel={zoomLevel}
            className="!rounded-lg !shadow-sm"
            scrollEnabled={scrollEnabled}
            setScrollEnabled={setScrollEnabled}
          />
          <View className="bg-white rounded-lg shadow-sm p-4 gap-y-2">
            <View className="flex-row gap-x-2">
              <View className="flex-1">
                <BaseText className="text-base font-semibold">
                  {t("route.distance")}
                </BaseText>
                <BaseText className="text-sm text-gray-500">
                  {(totalDistanceMeters / 1000).toFixed(3)}{" "}
                  {t("route.kilometer")}
                </BaseText>
              </View>
              <View className="flex-1">
                <BaseText className="text-base font-semibold">
                  {t("route.duration")}
                </BaseText>
                <BaseText className="text-sm text-gray-500">
                  {formatDurationAbbreviated(timeDuration, i18n.language)}
                </BaseText>
              </View>
            </View>
            <View className="flex-1">
              <BaseText className="text-base font-semibold">
                {t("route.date")}
              </BaseText>
              <BaseText className="text-sm text-gray-500">
                {formatDateTime(dateRecording, i18n.language)}
              </BaseText>
            </View>
          </View>
          <View className="bg-white rounded-lg shadow-sm p-4 gap-y-1.5">
            <FormInput
              label={t("route.route_name") + " *"}
              placeholder={t("route.route_name_placeholder")}
              returnKeyType="next"
              value={formData.name}
              onChangeText={(text) =>
                setFormData((prev) => ({ ...prev, name: text }))
              }
              onSubmitEditing={() => fromRef.current?.focus()}
              onError={isSubmitting && !formData.name.trim()}
              errorMessage={t("route.error_name_required")}
              editable={!createRouteMutation.isPending}
            />
            <FormInput
              label={t("route.from") + " *"}
              placeholder={t("route.from_placeholder")}
              ref={fromRef}
              returnKeyType="next"
              value={formData.startLocationName}
              onChangeText={(text) =>
                setFormData((prev) => ({ ...prev, startLocationName: text }))
              }
              onSubmitEditing={() => toRef.current?.focus()}
              onError={isSubmitting && !formData.startLocationName.trim()}
              errorMessage={t("route.error_start_location_required")}
              editable={!createRouteMutation.isPending}
            />
            <FormInput
              label={t("route.to") + " *"}
              placeholder={t("route.to_placeholder")}
              ref={toRef}
              returnKeyType="next"
              value={formData.endLocationName}
              onChangeText={(text) =>
                setFormData((prev) => ({ ...prev, endLocationName: text }))
              }
              onSubmitEditing={() => descriptionRef.current?.focus()}
              onError={isSubmitting && !formData.endLocationName.trim()}
              errorMessage={t("route.error_end_location_required")}
              editable={!createRouteMutation.isPending}
            />
            <FormInput
              label={t("route.description")}
              placeholder={t("route.description_placeholder")}
              multiline
              numberOfLines={4}
              value={formData.description}
              onChangeText={(text) =>
                setFormData((prev) => ({ ...prev, description: text }))
              }
              style={{ textAlignVertical: "top", height: 112 }}
              ref={descriptionRef}
              editable={!createRouteMutation.isPending}
            />
          </View>
        </View>
      </KeyboardScrollLayout>
    </HeaderLayout>
  );
}
