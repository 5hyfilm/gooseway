import { View, StyleSheet, TouchableOpacity, Image, Alert } from "react-native";
import React, { useState, useCallback, useEffect } from "react";
import { Octicons, AntDesign, Feather } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { CreatePostParams } from "../../services/api/types/post";
import { useCreatePost } from "../../services/api/hooks/usePost";
import {
  handleUseCamera,
  handleUseGallery,
  handleCreateDirectory,
} from "../../utils/media/MediaUtil";
import { LOCATION_IMAGE_DIR } from "../../constants/file";
import { handleUseLocation } from "../../utils/map/LocationUtil";
import { openSettings } from "expo-linking";
import { useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import HeaderLayout from "../../layouts/HeaderLayout";
import KeyboardScrollLayout from "../../layouts/KeyboardScrollLayout";

import BaseText from "../../components/common/BaseText";
import BaseInput from "../../components/common/BaseInput";
import MediaModal from "../../components/media/MediaModal";
import MapPreview from "../../components/map/MapPreview";
import BaseButton from "../../components/common/BaseButton";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

import { uploadImage } from "../../utils/media/UploadUtil";
import FormInput from "../../components/form/FormInput";
import PostCategoryTabs from "../../components/post/PostCategoryTabs";

import { useAppContext } from "../../contexts/app/AppContext";
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

const POST_FORM_DEFAULT: CreatePostParams = {
  title: "",
  content: "",
  categoryId: 1,
  statusId: 1,
  latitude: null,
  longitude: null,
  tag: [],
  imageUrl: [],
};

export default function CreatePostScreen() {
  const { handleShowError } = useAppContext();
  const { t } = useTranslation();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [postForm, setPostForm] = useState<CreatePostParams>(POST_FORM_DEFAULT);
  const [tagInput, setTagInput] = useState("");
  const [scrollEnabled, setScrollEnabled] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const createPostMutation = useCreatePost();

  const handleChangePostField = useCallback(
    (field: keyof CreatePostParams, value: any) => {
      setPostForm((prev) => ({
        ...prev,
        [field]: value,
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
    if (postForm === POST_FORM_DEFAULT) {
      navigation.goBack();
      return;
    }
    Alert.alert(
      t("post.confirm_stop_create"),
      t("post.confirm_stop_create_description"),
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
  }, [navigation, postForm, t]);

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

      setPostForm((prev) => ({
        ...prev,
        latitude: newLocation.latitude,
        longitude: newLocation.longitude,
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
      setPostForm((prev) => ({
        ...prev,
        latitude: Number(latitude),
        longitude: Number(longitude),
      }));
    },
    [isLoading]
  );

  const handleChangeImageUrl = useCallback(
    (update: string[] | ((prev: string[]) => string[])) => {
      setPostForm((prev) => ({
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
  }, [
    postForm.imageUrl,
    handleChangeImageUrl,
    setModalVisible,
    handleShowError,
  ]);

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
  }, [
    postForm.imageUrl,
    handleChangeImageUrl,
    setModalVisible,
    handleShowError,
  ]);

  const handleSubmit = useCallback(async () => {
    setIsSubmitting(true);
    setIsLoading(true);
    try {
      const hasEmptyValue = postForm.tag.some(
        (item) => item === null || item === undefined || item === ""
      );
      if (!postForm.title.trim() || hasEmptyValue) {
        return;
      }
      const uploadedUrls: string[] = [];

      for (const uri of postForm.imageUrl) {
        const url = await uploadImage(uri);
        if (url) {
          uploadedUrls.push(url);
        } else {
          throw new Error("One of the image uploads failed.");
        }
      }

      const body: CreatePostParams = {
        ...postForm,
        imageUrl: uploadedUrls,
      };

      await createPostMutation.mutateAsync(body);
      Alert.alert(t("main.success"), t("post.create_post_success"));
      navigation.goBack();
    } catch (error) {
      console.error("Error submitting post:", error);
      handleAxiosError(error, handleShowError);
    } finally {
      setIsLoading(false);
    }
  }, [postForm, createPostMutation, navigation, handleShowError]);

  useEffect(() => {
    handleCreateDirectory(LOCATION_IMAGE_DIR);
  }, []);

  return (
    <HeaderLayout
      headerTitle={t("post.create_post")}
      rightButtonTitle={t("post.share")}
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
          <PostCategoryTabs
            selectedId={postForm.categoryId.toString()}
            onSelectCategory={(id) => handleChangePostField("categoryId", id)}
          />
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
              {postForm.imageUrl.map((imageUrl) => (
                <View key={imageUrl} className="w-1/2 h-full aspect-square p-2">
                  <View className="h-full w-full relative shadow-sm rounded-lg overflow-hidden">
                    <Image
                      source={{ uri: imageUrl }}
                      className="w-full h-full"
                    />
                    <TouchableOpacity
                      className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-md"
                      onPress={() => {
                        const updatedImages = postForm.imageUrl.filter(
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
          <FormCard headerText={t("post.post_detail")}>
            <View className="p-4 gap-y-1.5">
              <View className="gap-y-1">
                <BaseText className="text-gray-700 text-sm" fontWeight="medium">
                  {t("post.title")} *
                </BaseText>
                <FormInput
                  placeholder={t("post.enter_title")}
                  value={postForm.title}
                  onChangeText={(text) => handleChangePostField("title", text)}
                  onError={isSubmitting && !postForm.title.trim()}
                  errorMessage={t("post.please_enter_title")}
                  editable={!isLoading}
                />
              </View>
              <View className="gap-y-1 pb-[14px]">
                <BaseText className="text-gray-700 text-sm" fontWeight="medium">
                  {t("post.experience")}
                </BaseText>
                <BaseInput
                  placeholder={t("post.enter_experience")}
                  multiline
                  numberOfLines={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg h-28"
                  style={{ textAlignVertical: "top" }}
                  placeholderTextColor="#9ca3af"
                  value={postForm.content}
                  onChangeText={(text) =>
                    handleChangePostField("content", text)
                  }
                  editable={!isLoading}
                />
              </View>
              <View>
                <BaseText className="text-gray-700 text-sm" fontWeight="medium">
                  {t("post.tag")}
                </BaseText>
                <View className="gap-y-2">
                  <View className="flex-row flex-wrap items-center gap-2">
                    {postForm.tag.map((tag, index) => (
                      <View
                        key={index}
                        className="bg-gray-100 px-3 py-1.5 rounded-full flex-row items-center gap-2"
                      >
                        <BaseText className="text-gray-600"># {tag}</BaseText>
                        <TouchableOpacity
                          onPress={() => {
                            const updatedTags = [...postForm.tag];
                            updatedTags.splice(index, 1);
                            handleChangePostField("tag", updatedTags);
                          }}
                          className="flex-shrink-0"
                          disabled={isLoading}
                        >
                          <AntDesign name="close" size={16} color="#ef4444" />
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                  <BaseInput
                    value={tagInput}
                    onChangeText={(text) => setTagInput(text)}
                    onSubmitEditing={() => {
                      if (tagInput.trim()) {
                        handleChangePostField("tag", [
                          ...postForm.tag,
                          tagInput.trim(),
                        ]);
                        setTagInput("");
                      }
                    }}
                    returnKeyType="done"
                    placeholder={t("post.enter_tag")}
                    className="px-3 py-2 border rounded-lg flex-1 border-gray-300"
                    editable={!isLoading}
                  />
                </View>
              </View>
            </View>
          </FormCard>
          <FormCard
            headerIcon={<Octicons name="location" size={16} color="black" />}
            headerText={t("post.add_location")}
          >
            <View className="p-4 gap-y-4">
              {postForm.latitude && postForm.longitude && (
                <MapPreview
                  showLocation={[postForm.longitude, postForm.latitude]}
                  centerLocation={centerLocation}
                  type={0}
                  category={0}
                  className="!rounded-md"
                  isEdit
                  defaultMarker
                  scrollEnabled={scrollEnabled}
                  setScrollEnabled={setScrollEnabled}
                  onSelectLocation={hadleSelectLocation}
                />
              )}
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
              {postForm.latitude && postForm.longitude && (
                <BaseButton
                  className="bg-red-600 w-full !py-3"
                  onPress={() => {
                    setPostForm((prev) => ({
                      ...prev,
                      latitude: null,
                      longitude: null,
                    }));
                    setScrollEnabled(true);
                  }}
                  disabled={isLoading}
                >
                  <View className="flex-row items-center justify-center gap-x-2">
                    <MaterialIcons
                      name="location-off"
                      size={20}
                      color="white"
                    />
                    <BaseText className="text-white text-center text-sm">
                      {t("post.clear_location")}
                    </BaseText>
                  </View>
                </BaseButton>
              )}
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
