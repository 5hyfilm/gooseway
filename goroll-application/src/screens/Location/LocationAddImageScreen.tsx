import React, { useState, useCallback, useEffect } from "react";
import { View, TouchableOpacity, Image, ScrollView,Alert } from "react-native";

import { AntDesign, Feather } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { useRoute, RouteProp } from "@react-navigation/native";
import { RootStacksParamList } from "../../navigation/NavigationTypes";
import { handleAxiosError } from "../../services/api/api";

import { uploadImage } from "../../utils/media/UploadUtil";
import {
  handleUseCamera,
  handleUseGallery,
  handleCreateDirectory,
} from "../../utils/media/MediaUtil";
import { LOCATION_IMAGE_DIR } from "../../constants/file";
import { useAppContext } from "../../contexts/app/AppContext";

import { useUploadReviewImage } from "../../services/api/hooks/useReview";
import { ReviewImgPayload } from "../../services/api/types/review";

import BaseText from "../../components/common/BaseText";
import MediaModal from "../../components/media/MediaModal";

import HeaderLayout from "../../layouts/HeaderLayout";

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

const POST_FORM_DEFAULT: ReviewImgPayload = {
  features: {
    locationId: "",
    featureId: "",
    imageUrl: [],
  },
};

export default function LocationAddImageScreen() {
  const { handleShowError } = useAppContext();
  const { t } = useTranslation();
  const navigation = useNavigation();
  const route =
    useRoute<RouteProp<RootStacksParamList, "LocationReviewsByType">>();
  const insets = useSafeAreaInsets();

  const [postForm, setPostForm] = useState<ReviewImgPayload>(POST_FORM_DEFAULT);
  const [modalVisible, setModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const uploadImageMutation = useUploadReviewImage();

  const handleChangeImageUrl = useCallback(
    (update: string[] | ((prev: string[]) => string[])) => {
      setPostForm((prev) => ({
        features: {
          locationId: route.params.locationId,
          featureId: route.params.featureId,
          imageUrl:
            typeof update === "function"
              ? update(prev.features.imageUrl)
              : update,
        },
      }));
    },
    []
  );

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
  }, [postForm, handleChangeImageUrl, setModalVisible, handleShowError]);

  const handleChangeImageByGallery = useCallback(async () => {
    try {
      const uri = await handleUseGallery(false,true);
      if (uri) {
        handleChangeImageUrl((prev) => [...prev, ...uri]);
      }
    } catch (error) {
      console.error("Failed to change image:", error);
      handleAxiosError(error, handleShowError);
    } finally {
      setModalVisible(false);
    }
  }, [postForm, handleChangeImageUrl, setModalVisible, handleShowError]);

  const handleSubmit = useCallback(async () => {
    setIsLoading(true);
    try {
      const uploadedUrls: string[] = [];

      for (const uri of postForm.features.imageUrl) {
        const url = await uploadImage(uri);
        if (url) {
          uploadedUrls.push(url);
        } else {
          throw new Error("One of the image uploads failed.");
        }
      }

      const body: ReviewImgPayload = {
        features: {
          locationId: postForm.features.locationId,
          featureId: postForm.features.featureId,
          imageUrl: uploadedUrls,
        },
      };
      await uploadImageMutation.mutateAsync(body);
      Alert.alert(t("main.success"), t("main.uploaded_image_success"));
      navigation.goBack();
    } catch (error) {
      console.error("Error submitting post:", error);
      handleAxiosError(error, handleShowError);
    } finally {
      setIsLoading(false);
    }
  }, [postForm, navigation, handleShowError]);

  useEffect(() => {
    handleCreateDirectory(LOCATION_IMAGE_DIR);
  }, []);

  return (
    <HeaderLayout
      headerTitle={t("obstacle.add_photos")}
      rightButtonTitle={t("post.share")}
      handlePressRightButton={handleSubmit}
      rightIcon={<Feather name="send" size={16} color="#fff" />}
      loading={isLoading}
    >
      <ScrollView>
        <View
          className="flex-1 p-4 gap-y-6"
          style={{ paddingBottom: insets.bottom + 16 }}
        >
          <FormCard
            headerIcon={<AntDesign name="camerao" size={16} color="black" />}
            headerText={t("obstacle.add_photos")}
          >
            <View className="flex-row flex-wrap justify-between p-2">
              <View className="w-1/2 h-full aspect-square p-2">
                <TouchableOpacity
                  className="h-full w-full border-2 border-dashed border-gray-300 rounded-lg flex-col items-center justify-center gap-2"
                  onPress={() => setModalVisible(true)}
                >
                  <AntDesign name="camerao" size={24} color="#4b5563" />
                  <BaseText className="text-gray-500 text-sm">
                    {t("obstacle.click_to_add_photos")}
                  </BaseText>
                </TouchableOpacity>
              </View>
              {postForm.features.imageUrl.map((imageUrl) => (
                <View key={imageUrl} className="w-1/2 h-full aspect-square p-2">
                  <View className="h-full w-full relative shadow-sm rounded-lg overflow-hidden">
                    <Image
                      source={{ uri: imageUrl }}
                      className="w-full h-full"
                    />
                    <TouchableOpacity
                      className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-md"
                      onPress={() => {
                        const updatedImages = postForm.features.imageUrl.filter(
                          (url) => url !== imageUrl
                        );
                        handleChangeImageUrl(updatedImages);
                      }}
                    >
                      <AntDesign name="close" size={16} color="#4b5563" />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          </FormCard>
          <MediaModal
            modalVisible={modalVisible}
            setModalVisible={setModalVisible}
            onCameraPress={handleChangeImageByPhoto}
            onGalleryPress={handleChangeImageByGallery}
          />
        </View>
      </ScrollView>
    </HeaderLayout>
  );
}
