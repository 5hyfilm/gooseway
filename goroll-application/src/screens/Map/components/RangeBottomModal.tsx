import { View } from "react-native";
import React, {
  useRef,
  useCallback,
  forwardRef,
  useImperativeHandle,
  useState,
} from "react";
import { BottomSheetModal, BottomSheetView } from "@gorhom/bottom-sheet";
import { useTranslation } from "react-i18next";
import Slider from "@react-native-community/slider";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation, useNavigationState } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStacksParamList } from "../../../navigation/NavigationTypes";
import { useRecordingStore } from "../../../stores/recordingStore";

import BaseText from "../../../components/common/BaseText";
import BaseButton from "../../../components/common/BaseButton";

export type RangeBottomModalHandle = {
  open: () => void;
  close: () => void;
};

const RangeBottomModal = forwardRef<RangeBottomModalHandle, {}>(
  (props, ref) => {
    const { t } = useTranslation();
    const insets = useSafeAreaInsets();
    const navigation =
      useNavigation<NativeStackNavigationProp<RootStacksParamList>>();
    const tabState = useNavigationState((state) => {
      const homeTabs = state.routes.find((r) => r.name === "HomeTabs");
      return homeTabs?.state;
    });
    const currentTabName =
      tabState && typeof tabState.index === "number"
        ? tabState.routes?.[tabState.index]?.name
        : undefined;
    const bottomSheetModalRef = useRef<BottomSheetModal>(null);
    const {
      frequencyRange,
      setFrequencyRange,
      setIsRecording,
      setShowRecording,
      setDateRecording,
    } = useRecordingStore();
    const [showRange, setShowRange] = useState(frequencyRange);

    const handleOpenModal = useCallback(() => {
      bottomSheetModalRef.current?.present();
    }, []);

    const handleCloseModal = useCallback(() => {
      bottomSheetModalRef.current?.close();
    }, []);

    useImperativeHandle(ref, () => ({
      open: handleOpenModal,
      close: handleCloseModal,
    }));

    // const handleSliderChange = useCallback(
    //   (value: number) => {
    //     const km = Math.floor(value);
    //     const m = Math.round((value - km) * 1000);
    //     setFrequencyRange(km + m / 1000);
    //     setKilometers(km);
    //     setMeters(m);
    //   },
    //   [setFrequencyRange, setKilometers, setMeters]
    // );

    // const handleKmChange = (text: string) => {
    //   const val = parseInt(text) || 0;
    //   setKilometers(val);
    // };

    // const handleMeterChange = (text: string) => {
    //   let val = parseInt(text) || 0;
    //   if (val >= 1000) val = 999;
    //   setMeters(val);
    // };

    const handleSubmit = useCallback(() => {
      if (frequencyRange <= 0) {
        return;
      }
      if (currentTabName !== "Map") {
        navigation.navigate("HomeTabs", {
          screen: "Map",
        });
      }
      setIsRecording(true);
      setShowRecording(true);
      setDateRecording(new Date().toISOString());
      handleCloseModal();
    }, [
      frequencyRange,
      currentTabName,
      navigation,
      handleCloseModal,
      setIsRecording,
      setShowRecording,
      setDateRecording,
      handleCloseModal,
    ]);

    // useEffect(() => {
    //   setKilometers(Math.floor(frequencyRange));
    //   setMeters(
    //     Math.round((frequencyRange - Math.floor(frequencyRange)) * 1000)
    //   );
    // }, []);

    // useEffect(() => {
    //   setFrequencyRange(kilometers + meters / 1000);
    // }, [kilometers, meters, setFrequencyRange]);

    return (
      <BottomSheetModal
        ref={bottomSheetModalRef}
        style={{
          overflow: "hidden",
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16,
        }}
        enableOverDrag={false}
        enableContentPanningGesture={false}
      >
        <BottomSheetView
          className="bg-white shadow-lg"
          style={{ paddingBottom: insets.bottom + 48 }}
        >
          <View className="p-4 pb-8 gap-y-4">
            <View className="gap-y-1">
              <BaseText className="text-lg font-semibold text-gray-800">
                {t("route.frequency_route")}
              </BaseText>
              <BaseText className="text-sm text-gray-600">
                {t("route.frequency_route_description")} {showRange.toFixed(1)}{" "}
                {t("route.meter")}
              </BaseText>
              <BaseText className="text-xs text-gray-500">
                ({t("route.high_frequency")})
              </BaseText>
            </View>

            <Slider
              style={{ width: "100%" }}
              minimumValue={0.5}
              maximumValue={20}
              step={0.5}
              value={frequencyRange}
              onValueChange={setShowRange}
              onSlidingComplete={setFrequencyRange}
              minimumTrackTintColor="#3b82f6"
              maximumTrackTintColor="#d1d5db"
            />

            {/* <View className="gap-y-1">
                <View className="flex-row flex-wrap items-center gap-x-4">
                  <View className="flex-1">
                    <BaseText
                      className="text-sm text-gray-700 mb-1"
                      fontWeight="medium"
                    >
                      {t("route.kilometer")}
                    </BaseText>
                    <BottomSheetTextInput
                      value={kilometers.toString()}
                      onChangeText={handleKmChange}
                      className="bg-white rounded-lg border border-gray-300 py-3 px-4"
                      maxLength={2}
                      keyboardType="numeric"
                      style={{ fontFamily: fontFamily() }}
                    />
                  </View>

                  <View className="flex-1">
                    <BaseText
                      className="text-sm text-gray-700 mb-1"
                      fontWeight="medium"
                    >
                      {t("route.meter")}
                    </BaseText>
                    <BottomSheetTextInput
                      value={meters.toString()}
                      onChangeText={handleMeterChange}
                      className="bg-white rounded-lg border border-gray-300 py-3 px-4"
                      maxLength={3}
                      keyboardType="numeric"
                      style={{ fontFamily: fontFamily() }}
                    />
                  </View>
                </View>
                <BaseText className="text-xs text-red-600">
                  {frequencyRange <= 0
                    ? t("route.record_error")
                    : ""}
                </BaseText>
              </View> */}

            <BaseButton
              disabled={frequencyRange <= 0}
              onPress={handleSubmit}
              className="bg-blue-600 w-full"
            >
              <BaseText className="text-white text-center">
                {t("route.record_route")}
              </BaseText>
            </BaseButton>
          </View>
        </BottomSheetView>
      </BottomSheetModal>
    );
  }
);

export default RangeBottomModal;
