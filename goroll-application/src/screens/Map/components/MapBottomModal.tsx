import React, {
  useRef,
  forwardRef,
  useImperativeHandle,
  useCallback,
  useState,
  useMemo,
} from "react";
import BottomSheet, { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { View, Pressable, TouchableOpacity, Image } from "react-native";
import BaseText from "../../../components/common/BaseText";
import BaseCarousel from "../../../components/common/BaseCarousel";
import { AntDesign, FontAwesome } from "@expo/vector-icons";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { RootStacksParamList } from "../../../navigation/NavigationTypes";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { LocationDetailResponse } from "../../../services/api/types/location";
import NoImage from "../../../assets/no-image.png";
import { useTranslation } from "react-i18next";
import { useRecordingStore } from "../../../stores/recordingStore";

import AccessLevelStatus from "./AccessLevelStatus";

export type MapBottomModalHandle = {
  open: () => void;
  close: () => void;
};

type MapBottomModalProps = {
  locationData: LocationDetailResponse | null;
  setLocationData: React.Dispatch<
    React.SetStateAction<LocationDetailResponse | null>
  >;
};

const MapBottomModal = forwardRef<MapBottomModalHandle, MapBottomModalProps>(
  ({ locationData, setLocationData }, ref) => {
    const navigation =
      useNavigation<NativeStackNavigationProp<RootStacksParamList>>();
    const { t, i18n } = useTranslation();
    const { isRecording } = useRecordingStore();
    const [isClicked, setIsClicked] = useState(false);

    const bottomSheetModalRef = useRef<BottomSheet>(null);

    const snapPoints = useMemo(() => ["50%", "75%"], []);

    const handleOpenModal = useCallback(() => {
      bottomSheetModalRef.current?.snapToIndex(0);
    }, []);

    const handleCloseModal = useCallback(() => {
      setLocationData(null);
      bottomSheetModalRef.current?.close();
    }, [setLocationData]);

    useImperativeHandle(ref, () => ({
      open: handleOpenModal,
      close: handleCloseModal,
    }));

    useFocusEffect(
      useCallback(() => {
        setIsClicked(false);
      }, [])
    );

    return (
      <BottomSheet
        ref={bottomSheetModalRef}
        style={{
          overflow: "hidden",
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16,
        }}
        containerStyle={{ zIndex: 30 }}
        handleComponent={() => (
          <View
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              alignItems: "center",
              zIndex: 20,
              paddingTop: 8,
            }}
          >
            <View
              style={{
                width: 30,
                height: 4,
                borderRadius: 2,
                backgroundColor: "white",
              }}
              className="shadow-lg"
            />
          </View>
        )}
        onChange={(index) => {
          if (index === -1) {
            setLocationData(null);
          }
        }}
        index={-1}
        snapPoints={snapPoints}
        enableDynamicSizing={false}
        enablePanDownToClose
      >
        <BottomSheetScrollView className="bg-white shadow-lg">
          <View>
            <View
              style={{
                position: "absolute",
                right: 16,
                top: 16,
                zIndex: 10,
              }}
              className="flex-row items-center gap-x-2"
            >
              {!isRecording && (
                <TouchableOpacity
                  className="rounded-full p-2 bg-white/60 flex-row gap-x-2"
                  onPress={() => {
                    if (!locationData || isRecording) return;
                    setIsClicked(true);
                    navigation.push("LocationDetail", {
                      locationId: locationData.id.toString(),
                    });
                  }}
                  disabled={isClicked}
                >
                  <AntDesign name="eyeo" size={16} color="black" />
                  <BaseText className="text-sm">
                    {t("location.see_more")}
                  </BaseText>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                className="rounded-full p-2 bg-white/60"
                onPress={handleCloseModal}
              >
                <AntDesign name="close" size={16} color="black" />
              </TouchableOpacity>
            </View>
            <Pressable
              onPress={() => {
                if (!locationData || isRecording) return;
                setIsClicked(true);
                navigation.push("LocationDetail", {
                  locationId: locationData.id.toString(),
                });
              }}
              disabled={isClicked}
            >
              <View className="w-full aspect-[4/3]">
                {locationData?.img && locationData.img.length > 0 ? (
                  <BaseCarousel imgUrl={locationData.img} preview={false} />
                ) : (
                  <Image
                    source={NoImage}
                    resizeMode="cover"
                    className="w-full h-full bg-gray-200"
                  />
                )}
              </View>
            </Pressable>
            <View className="p-4 gap-y-1">
              <AccessLevelStatus
                label={
                  i18n.language === "th"
                    ? locationData?.accessLevel.nameTh ?? ""
                    : locationData?.accessLevel.nameEn ?? ""
                }
                accessLevel={locationData?.accessLevel.id ?? 0}
                className="self-start"
              />
              <View className="flex-row justify-between items-center gap-x-5">
                <BaseText
                  className="text-lg line-clamp-1 flex-1"
                  fontWeight="bold"
                >
                  {locationData?.name ?? "Location Name"}
                </BaseText>
                <View className="flex-row items-center gap-x-2 flex-shrink-0">
                  <FontAwesome name="star" size={16} color="black" />
                  <BaseText className="text-lg" fontWeight="bold">
                    {locationData?.averageRating.toFixed(2) ?? 0} (
                    {locationData?.reviewCount ?? 0})
                  </BaseText>
                </View>
              </View>
              <BaseText className="text-gray-600">
                {locationData?.description ?? "No description available."}
              </BaseText>
            </View>
          </View>
        </BottomSheetScrollView>
      </BottomSheet>
    );
  }
);

export default MapBottomModal;
