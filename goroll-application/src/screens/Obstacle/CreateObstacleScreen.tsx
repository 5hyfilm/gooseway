import { View, StyleSheet, TouchableOpacity, Image, Alert } from "react-native";
import React, { useState, useCallback, useEffect } from "react";
import { Octicons, AntDesign, Feather } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import {
  CreateObstacleParams,
  ObstacleStatusResponse,
} from "../../services/api/types/obstacle";
import { useAppContext } from "../../contexts/app/AppContext";
import {
  handleUseCamera,
  handleUseGallery,
  handleCreateDirectory,
} from "../../utils/media/MediaUtil";
import { LOCATION_IMAGE_DIR } from "../../constants/file";
import { handleUseLocation } from "../../utils/map/LocationUtil";
import { openSettings } from "expo-linking";
import {
  useCreateObstacle,
  useFetchObstacleCategories,
  useFetchObstacleSubCategories,
} from "../../services/api/hooks/useObstacle";
import { useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, { FadeInDown, FadeOutUp } from "react-native-reanimated";

import HeaderLayout from "../../layouts/HeaderLayout";
import KeyboardScrollLayout from "../../layouts/KeyboardScrollLayout";

import BaseText from "../../components/common/BaseText";
import BaseInput from "../../components/common/BaseInput";
import { Dropdown } from "react-native-element-dropdown";
import MediaModal from "../../components/media/MediaModal";
import MapPreview from "../../components/map/MapPreview";
import BaseButton from "../../components/common/BaseButton";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

import { uploadImage } from "../../utils/media/UploadUtil";
import { handleAxiosError } from "../../services/api/api";

function FormCard({
  headerIcon,
  headerText,
  children,
}: {
  headerIcon?: React.ReactNode;
  headerText: string;
  children: React.ReactNode;
}) {
  return (
    <View className="bg-white rounded-lg shadow-sm">
      <View className="flex-row items-center gap-2 p-4 border-b border-gray-200">
        {headerIcon}
        <BaseText fontWeight="semibold">{headerText}</BaseText>
      </View>
      <View>{children}</View>
    </View>
  );
}

const OBSTACLE_FORM_DEFAULT: CreateObstacleParams = {
  obstacle: {
    subcategoryId: 0,
    description: "",
    latitude: "13.7563",
    longitude: "100.5018",
    statusId: 1,
  },
  imageUrl: [],
};

export default function CreateObstacleScreen() {
  const { t, i18n } = useTranslation();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { fontFamily, handleShowError } = useAppContext();
  const [obstacleForm, setObstacleForm] = useState<CreateObstacleParams>(
    OBSTACLE_FORM_DEFAULT
  );
  const [scrollEnabled, setScrollEnabled] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [categoryDropdownList, setCategoryDropdownList] = useState<
    { label: string; value: number }[]
  >([]);
  const [categorySelected, setCategorySelected] = useState<number>(0);
  const [subcategoryDropdownList, setSubcategoryDropdownList] = useState<
    { label: string; value: number }[]
  >([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch Obstacle Categories
  const {
    data: obstacleCategories,
    isError: isObstacleCategoriesError,
    error: obstacleCategoriesError,
  } = useFetchObstacleCategories();
  useEffect(() => {
    if (obstacleCategories && obstacleCategories.length > 0) {
      const categories = obstacleCategories.map(
        (category: ObstacleStatusResponse) => ({
          label: i18n.language === "en" ? category.nameEn : category.nameTh,
          value: category.id,
        })
      );
      setCategoryDropdownList(categories);
    }
  }, [obstacleCategories]);
  useEffect(() => {
    if (isObstacleCategoriesError) {
      handleAxiosError(obstacleCategoriesError, handleShowError);
    }
  }, [isObstacleCategoriesError, obstacleCategoriesError]);

  //  Fetch Obstacle Subcategories
  const {
    data: obstacleSubCategories,
    isError: isObstacleSubCategoriesError,
    error: obstacleSubCategoriesError,
  } = useFetchObstacleSubCategories(categorySelected);
  useEffect(() => {
    if (obstacleSubCategories && obstacleSubCategories.length > 0) {
      const subcategories = obstacleSubCategories.map(
        (subcategory: ObstacleStatusResponse) => ({
          label:
            i18n.language === "en" ? subcategory.nameEn : subcategory.nameTh,
          value: subcategory.id,
        })
      );
      setSubcategoryDropdownList(subcategories);
    }
  }, [obstacleSubCategories]);
  useEffect(() => {
    if (isObstacleSubCategoriesError) {
      console.error(
        "Error fetching obstacle subcategories:",
        obstacleSubCategoriesError
      );
      handleAxiosError(obstacleSubCategoriesError, handleShowError);
    }
  }, [isObstacleSubCategoriesError, obstacleSubCategoriesError]);

  const createObstacleMutation = useCreateObstacle();

  const handleChangeObstacleField = useCallback(
    (field: keyof CreateObstacleParams["obstacle"], value: any) => {
      setObstacleForm((prev) => ({
        ...prev,
        obstacle: {
          ...prev.obstacle,
          [field]: value,
        },
      }));
    },
    []
  );

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

  const promptStopCreating = useCallback(() => {
    if (obstacleForm === OBSTACLE_FORM_DEFAULT) {
      navigation.goBack();
      return;
    }
    Alert.alert(
      t("obstacle.confirm_stop_report"),
      t("obstacle.confirm_stop_report_description"),
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
  }, [navigation, obstacleForm, t]);

  const [centerLocation, setCenterLocation] = useState<number[]>([
    100.5480753, 13.790035,
  ]);
  const handleGetCurrentLocation = async () => {
    try {
      const newLocation = await handleUseLocation();

      if (!newLocation) {
        promptForLocationPermission();
        return;
      }

      setObstacleForm((prev) => ({
        ...prev,
        obstacle: {
          ...prev.obstacle,
          latitude: newLocation.latitude.toString(),
          longitude: newLocation.longitude.toString(),
        },
      }));

      setCenterLocation([newLocation.longitude, newLocation.latitude]);
    } catch (error) {
      console.error("Error getting current location:", error);
      handleAxiosError(error, handleShowError);
    }
  };

  const hadleSelectLocation = useCallback(
    (latitude: string, longitude: string) => {
      if (isLoading) return;
      setObstacleForm((prev) => ({
        ...prev,
        obstacle: {
          ...prev.obstacle,
          latitude,
          longitude,
        },
      }));
    },
    [isLoading]
  );

  const handleChangeImageUrl = useCallback(
    (update: string[] | ((prev: string[]) => string[])) => {
      setObstacleForm((prev) => ({
        ...prev,
        imageUrl: typeof update === "function" ? update(prev.imageUrl) : update,
      }));
    },
    []
  );

  const handleChangeImageByGallery = useCallback(async () => {
    try {
      const uri = await handleUseGallery();
      if (uri) {
        handleChangeImageUrl((prev) => [...prev, ...uri]);
      }
    } catch (error) {
      console.error("Failed to change image:", error);
      handleAxiosError(error, handleShowError);
    } finally {
      setModalVisible(false);
    }
  }, [obstacleForm.imageUrl, handleChangeImageUrl, setModalVisible, handleShowError]);

  const handleChangeImageByPhoto = useCallback(async () => {
    try {
      const newImagePath = await handleUseCamera({
        directory: LOCATION_IMAGE_DIR,
      });
      if (newImagePath) {
        handleChangeImageUrl((prev) => [...prev, newImagePath]);
      }
    } catch (error) {
      console.error("Failed to change image:", error);
      handleAxiosError(error, handleShowError);
    } finally {
      setModalVisible(false);
    }
  }, [obstacleForm.imageUrl, handleChangeImageUrl, setModalVisible, handleShowError]);

  const handleSubmit = useCallback(async () => {
    setIsSubmitting(true);
    setIsLoading(true);
    if (!obstacleSubCategories || !categorySelected || (!obstacleForm.obstacle.subcategoryId && categorySelected !== 4)) {
      setIsLoading(false);
      return
    };
    try {
      const uploadedUrls: string[] = [];

      for (const uri of obstacleForm.imageUrl) {
        const url = await uploadImage(uri);
        if (url) {
          uploadedUrls.push(url);
        } else {
          throw new Error("One of the image uploads failed.");
        }
      }

      const body: CreateObstacleParams = {
        obstacle: {
          ...obstacleForm.obstacle,
          subcategoryId:
            categorySelected === 4
              ? obstacleSubCategories[0].id
              : obstacleForm.obstacle.subcategoryId,
        },
        imageUrl: uploadedUrls,
      };

      await createObstacleMutation.mutateAsync(body);
      Alert.alert(t("main.success"), t("obstacle.obstacle_reported_success"));
      navigation.goBack();
    } catch (error) {
      console.error("Error submitting obstacle report:", error);
      handleAxiosError(error, handleShowError);
    } finally {
      setIsLoading(false);
    }
  }, [
    obstacleForm,
    createObstacleMutation,
    navigation,
    categorySelected,
    obstacleSubCategories,
    handleShowError,
  ]);

  const renderItem = (item: { label: string; value: number }) => {
    return (
      <View
        className={`p-4 ${
          item.value === obstacleForm.obstacle.subcategoryId && "bg-blue-50"
        }`}
      >
        <BaseText
          className={`text-sm ${
            item.value === obstacleForm.obstacle.subcategoryId
              ? "text-blue-600"
              : "text-gray-700"
          }`}
        >
          {item.label}
        </BaseText>
      </View>
    );
  };

  useEffect(() => {
    handleGetCurrentLocation();
    handleCreateDirectory(LOCATION_IMAGE_DIR);
  }, []);

  return (
    <HeaderLayout
      headerTitle={t("main.report_obstacle")}
      rightButtonTitle={t("obstacle.submit_report")}
      handlePressRightButton={handleSubmit}
      rightIcon={<Feather name="send" size={16} color="#fff" />}
      loading={isLoading}
      handleBackPress={promptStopCreating}
    >
      <KeyboardScrollLayout scrollEnabled={scrollEnabled}>
        <View
          className="flex-1 p-4 gap-y-6"
          style={{ paddingBottom: insets.bottom + 16 }}
        >
          <FormCard
            headerIcon={<Octicons name="location" size={16} color="black" />}
            headerText={t("obstacle.obstacle_location")}
          >
            <View className="p-4 gap-y-4">
              <MapPreview
                showLocation={[
                  parseFloat(obstacleForm.obstacle.longitude),
                  parseFloat(obstacleForm.obstacle.latitude),
                ]}
                centerLocation={centerLocation}
                type={0}
                category={0}
                className="!rounded-md"
                isEdit
                scrollEnabled={scrollEnabled}
                setScrollEnabled={setScrollEnabled}
                onSelectLocation={hadleSelectLocation}
              />
              <BaseButton
                className="bg-blue-600 w-full !py-3"
                onPress={handleGetCurrentLocation}
                disabled={isLoading}
              >
                <View className="flex-row items-center justify-center gap-x-2">
                  <MaterialIcons name="my-location" size={20} color="white" />
                  <BaseText className="text-white text-center text-sm">
                    {t("obstacle.use_current_location")}
                  </BaseText>
                </View>
              </BaseButton>
            </View>
          </FormCard>
          <FormCard
            headerIcon={<AntDesign name="camerao" size={16} color="black" />}
            headerText={t("obstacle.add_photos")}
          >
            <View className="flex-row flex-wrap justify-between p-2">
              <View className="w-1/2 h-full aspect-square p-2">
                <TouchableOpacity
                  className="h-full w-full border-2 border-dashed border-gray-300 rounded-lg flex-col items-center justify-center gap-2"
                  onPress={() => setModalVisible(true)}
                  disabled={isLoading}
                >
                  <AntDesign name="camerao" size={24} color="#4b5563" />
                  <BaseText className="text-gray-500 text-sm">
                    {t("obstacle.click_to_add_photos")}
                  </BaseText>
                </TouchableOpacity>
              </View>
              {obstacleForm.imageUrl.map((imageUrl) => (
                <View key={imageUrl} className="w-1/2 h-full aspect-square p-2">
                  <View className="h-full w-full relative shadow-sm rounded-lg overflow-hidden">
                    <Image
                      source={{ uri: imageUrl }}
                      className="w-full h-full"
                    />
                    <TouchableOpacity
                      className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-md"
                      onPress={() => {
                        const updatedImages = obstacleForm.imageUrl.filter(
                          (url) => url !== imageUrl
                        );
                        handleChangeImageUrl(updatedImages);
                      }}
                      disabled={isLoading}
                    >
                      <AntDesign name="close" size={16} color="#4b5563" />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          </FormCard>
          <FormCard headerText={t("obstacle.obstacle_details")}>
            <View className="p-4 gap-y-1.5">
              <View className="gap-y-1">
                <BaseText className="text-gray-700 text-sm" fontWeight="medium">
                  {t("obstacle.category")} *
                </BaseText>
                <View className="gap-y-0.5">
                  <Dropdown
                    style={styles.dropdown}
                    containerStyle={styles.containerStyle}
                    placeholderStyle={[
                      styles.placeholderStyle,
                      { fontFamily: fontFamily() },
                    ]}
                    selectedTextStyle={[
                      styles.textStyle,
                      { fontFamily: fontFamily() },
                    ]}
                    inputSearchStyle={[
                      styles.textStyle,
                      { fontFamily: fontFamily() },
                    ]}
                    data={categoryDropdownList}
                    labelField="label"
                    valueField="value"
                    placeholder={t("obstacle.select_category")}
                    value={categorySelected}
                    onChange={(item) => {
                      setCategorySelected(item.value);
                      handleChangeObstacleField("subcategoryId", 0);
                    }}
                    renderRightIcon={() => (
                      <AntDesign name="down" size={12} color="#4b5563" />
                    )}
                    renderItem={renderItem}
                    dropdownPosition="top"
                    disable={isLoading}
                  />
                  <BaseText className="text-xs text-red-600">
                    {isSubmitting && !categorySelected
                      ? t("obstacle.error_select_category")
                      : ""}
                  </BaseText>
                </View>
              </View>
              {subcategoryDropdownList.length !== 0 &&
                categorySelected !== 4 && (
                  <Animated.View
                    className="gap-y-1"
                    entering={FadeInDown.duration(300)}
                    exiting={FadeOutUp.duration(200)}
                  >
                    <BaseText
                      className="text-gray-700 text-sm"
                      fontWeight="medium"
                    >
                      {t("obstacle.type_of_obstacle")} *
                    </BaseText>
                    <View className="gap-y-0.5">
                      <Dropdown
                        style={styles.dropdown}
                        containerStyle={styles.containerStyle}
                        placeholderStyle={[
                          styles.placeholderStyle,
                          { fontFamily: fontFamily() },
                        ]}
                        selectedTextStyle={[
                          styles.textStyle,
                          { fontFamily: fontFamily() },
                        ]}
                        inputSearchStyle={[
                          styles.textStyle,
                          { fontFamily: fontFamily() },
                        ]}
                        data={subcategoryDropdownList}
                        labelField="label"
                        valueField="value"
                        placeholder={t("obstacle.select_type")}
                        value={obstacleForm.obstacle.subcategoryId}
                        onChange={(item) => {
                          handleChangeObstacleField(
                            "subcategoryId",
                            item.value
                          );
                        }}
                        renderRightIcon={() => (
                          <AntDesign name="down" size={12} color="#4b5563" />
                        )}
                        renderItem={renderItem}
                        dropdownPosition="top"
                        disable={isLoading}
                      />
                      <BaseText className="text-xs text-red-600">
                        {isSubmitting && !obstacleForm.obstacle.subcategoryId
                          ? t("obstacle.error_select_type")
                          : ""}
                      </BaseText>
                    </View>
                  </Animated.View>
                )}
              <View className="gap-y-1">
                <BaseText className="text-gray-700 text-sm" fontWeight="medium">
                  {t("obstacle.description")}
                </BaseText>
                <BaseInput
                  placeholder={t("obstacle.enter_description")}
                  multiline
                  numberOfLines={4}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg h-28"
                  style={{ textAlignVertical: "top" }}
                  placeholderTextColor="#9ca3af"
                  value={obstacleForm.obstacle.description}
                  onChangeText={(text) =>
                    handleChangeObstacleField("description", text)
                  }
                  editable={!isLoading}
                />
              </View>
            </View>
          </FormCard>
        </View>
        <MediaModal
          modalVisible={modalVisible}
          setModalVisible={setModalVisible}
          onCameraPress={handleChangeImageByPhoto}
          onGalleryPress={handleChangeImageByGallery}
        />
      </KeyboardScrollLayout>
    </HeaderLayout>
  );
}

const styles = StyleSheet.create({
  dropdown: {
    backgroundColor: "white",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  placeholderStyle: {
    fontSize: 14,
    color: "#9ca3af",
  },
  textStyle: {
    fontSize: 14,
    color: "#4b5563",
  },
  containerStyle: {
    overflow: "hidden",
    backgroundColor: "white",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});
