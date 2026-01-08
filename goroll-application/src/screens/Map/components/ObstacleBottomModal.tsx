import { View, TouchableOpacity, Image } from "react-native";
import React, {
  useRef,
  useCallback,
  forwardRef,
  useImperativeHandle,
  useEffect,
  useMemo,
} from "react";
import BottomSheet, { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { AntDesign } from "@expo/vector-icons";
import {
  ObstacleDetilResponse,
  ObstacleStatusResponse,
} from "../../../services/api/types/obstacle";
import { useTranslation } from "react-i18next";
import NoImage from "../../../assets/no-image.png";
import { formatDate } from "../../../utils/time/FormatTimes";
import {
  useFetchObstacleStatus,
  useUpdateObstacleConfirmation,
  useFetchObstacleDetail,
  useCheckResolve,
} from "../../../services/api/hooks/useObstacle";
import Feather from "@expo/vector-icons/Feather";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import Ionicons from "@expo/vector-icons/Ionicons";

import BaseText from "../../../components/common/BaseText";
import BaseCarousel from "../../../components/common/BaseCarousel";

import { useAppContext } from "../../../contexts/app/AppContext";

import { handleAxiosError } from "../../../services/api/api";

export type ObstacleBottomModalHandle = {
  open: () => void;
  close: () => void;
};

type ObstacleBottomModalProps = {
  locationData: ObstacleDetilResponse | null;
  setLocationData: React.Dispatch<
    React.SetStateAction<ObstacleDetilResponse | null>
  >;
};

const ObstacleBottomModal = forwardRef<
  ObstacleBottomModalHandle,
  ObstacleBottomModalProps
>(({ locationData, setLocationData }, ref) => {
  const { handleShowError } = useAppContext();
  const { t, i18n } = useTranslation();
  const bottomSheetModalRef = useRef<BottomSheet>(null);

  const snapPoints = useMemo(() => ["50%", "75%"], []);

  const { mutateAsync: fetchObstacleDetail } = useFetchObstacleDetail();

  const handleOpenModal = useCallback(() => {
    bottomSheetModalRef.current?.snapToIndex(0);
  }, []);

  const handleCloseModal = useCallback(() => {
    setLocationData(null);
    bottomSheetModalRef.current?.close();
  }, []);

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

  const { mutateAsync: updateObstacleConfirmation } =
    useUpdateObstacleConfirmation();
  const { mutateAsync: checkResolve } = useCheckResolve();

  const handleStatusChange = useCallback(
    async (statusId: number) => {
      try {
        if (locationData) {
          const body = {
            obstacleId: Number(locationData.id),
            statusId: Number(statusId),
          };
          await updateObstacleConfirmation(body);
          await checkResolve(String(locationData.id));
          const obstacleData = await fetchObstacleDetail(
            String(locationData.id)
          );
          setLocationData(obstacleData);
        }
      } catch (error) {
        console.error("Error updating obstacle confirmation:", error);
        handleAxiosError(error, handleShowError);
      }
    },
    [
      locationData,
      updateObstacleConfirmation,
      fetchObstacleDetail,
      setLocationData,
      handleShowError,
    ]
  );

  useImperativeHandle(ref, () => ({
    open: handleOpenModal,
    close: handleCloseModal,
  }));
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
          >
            <TouchableOpacity
              className="rounded-full p-2 bg-white/60"
              onPress={handleCloseModal}
            >
              <AntDesign name="close" size={16} color="black" />
            </TouchableOpacity>
          </View>
          <View className="w-full aspect-[4/3]">
            {locationData?.img && locationData.img.length > 0 ? (
              <BaseCarousel imgUrl={locationData.img} />
            ) : (
              <Image
                source={NoImage}
                style={{ width: "100%", height: "100%", resizeMode: "cover" }}
              />
            )}
          </View>
          <View className="gap-y-3 p-4">
            <View className="gap-y-2">
              <View className="flex-row items-center gap-x-2">
                <AntDesign name="warning" size={24} color="#f97316" />
                <BaseText className="text-lg text-gray-500" fontWeight="medium">
                  {i18n.language === "th"
                    ? locationData?.subcategory?.category?.nameTh
                    : locationData?.subcategory?.category?.nameEn}
                </BaseText>
              </View>
              <BaseText className="text-base" fontWeight="medium">
                {i18n.language === "th"
                  ? locationData?.subcategory?.nameTh
                  : locationData?.subcategory?.nameEn}
              </BaseText>
            </View>
            <BaseText className="text-xs text-gray-600" fontWeight="medium">
              {locationData?.description}
            </BaseText>
            <View className="gap-y-2">
              <BaseText className="text-sm text-gray-500" fontWeight="medium">
                {t("obstacle.report_by")} :{" "}
                {locationData?.user?.fullName ?? "Unknown"}
              </BaseText>
              <BaseText className="text-sm text-gray-500" fontWeight="medium">
                {t("obstacle.date_reported")} :{" "}
                {formatDate(locationData?.createdAt, i18n.language)}
              </BaseText>
              <BaseText className="text-sm text-gray-500" fontWeight="medium">
                {t("obstacle.check_reporded")} :{" "}
                {formatDate(locationData?.updatedAt, i18n.language)}
              </BaseText>
            </View>

            <View className="flex-row border-b border-gray-300 pb-3">
              {statusData?.find(
                (status: ObstacleStatusResponse) =>
                  status.id === locationData?.statusId
              ) ? (
                <View
                  className={`px-3 py-1.5 rounded-full text-sm flex-row items-center gap-2 ${
                    locationData?.statusId === 1 ? "bg-red-100" : "bg-green-100"
                  }`}
                >
                  <View
                    className={`w-2 h-2 rounded-full ${
                      locationData?.statusId === 1
                        ? "bg-red-500"
                        : "bg-green-500"
                    }`}
                  />
                  <BaseText
                    className={`text-xs ${
                      locationData?.statusId === 1
                        ? "text-red-500"
                        : "text-green-500"
                    }`}
                    fontWeight="medium"
                  >
                    {i18n.language === "th"
                      ? statusData.find(
                          (status: ObstacleStatusResponse) =>
                            status.id === locationData?.statusId
                        )?.nameTh
                      : statusData.find(
                          (status: ObstacleStatusResponse) =>
                            status.id === locationData?.statusId
                        )?.nameEn}
                  </BaseText>
                </View>
              ) : null}
            </View>

            <View className="gap-y-2">
              <View>
                <BaseText className="text-sm text-gray-900" fontWeight="medium">
                  {t("obstacle.verify_status")}
                </BaseText>
                <BaseText className="text-xs text-gray-500" fontWeight="medium">
                  {t("obstacle.help_data")}
                </BaseText>
              </View>
              <View className="flex-row gap-x-2">
                {statusData?.map((status: ObstacleStatusResponse) => {
                  let backgroundClass = "";
                  let testClass = "";
                  let iconColor = "";
                  if (locationData?.isConfirmed !== status.id) {
                    backgroundClass = "bg-gray-100";
                    testClass = "text-gray-600";
                    iconColor = "#4b5563";
                  } else if (locationData?.isConfirmed === 1) {
                    backgroundClass = "bg-red-100";
                    testClass = "text-red-600";
                    iconColor = "#dc2626";
                  } else {
                    backgroundClass = "bg-green-100";
                    testClass = "text-green-600";
                    iconColor = "#16a34a";
                  }
                  return (
                    <TouchableOpacity
                      key={status.id}
                      className={`px-3 py-2 rounded-lg text-xs flex-1 flex-shrink-0 flex-row items-center justify-between gap-x-2 ${backgroundClass}`}
                      onPress={() => {
                        handleStatusChange(status.id);
                      }}
                    >
                      <View className="flex-row items-center gap-x-1.5 flex-shrink-0">
                        {status.id === 1 ? (
                          <MaterialIcons
                            name="error-outline"
                            size={12}
                            color={iconColor}
                          />
                        ) : (
                          <Feather
                            name="check-circle"
                            size={12}
                            color={iconColor}
                          />
                        )}
                        <BaseText
                          className={`text-xs ${testClass}`}
                          fontWeight="medium"
                        >
                          {i18n.language === "th"
                            ? status.nameTh
                            : status.nameEn}
                        </BaseText>
                      </View>
                      <View className="flex-row items-center gap-x-1.5 flex-shrink-0 bg-white/50 px-2 py-1 rounded-full">
                        <Ionicons
                          name="people-outline"
                          size={12}
                          color={iconColor}
                        />
                        <BaseText
                          className={`text-xs ${testClass}`}
                          fontWeight="medium"
                        >
                          {status.id === 1
                            ? locationData?.isAvailableCount
                            : locationData?.isEditedCount}
                        </BaseText>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </View>
        </View>
      </BottomSheetScrollView>
    </BottomSheet>
  );
});

export default ObstacleBottomModal;
