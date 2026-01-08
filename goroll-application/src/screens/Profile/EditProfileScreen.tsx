import { View, TextInput, TouchableOpacity, Image, Alert } from "react-native";
import React, { useState, useRef, useCallback, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStacksParamList } from "../../navigation/NavigationTypes";
import * as FileSystem from "expo-file-system";
import { AntDesign, Feather } from "@expo/vector-icons";

import { useAuth } from "../../contexts/auth/AuthContext";
import { validateEmail } from "../../utils/auth/AuthValidator";
import { useUpdateUserProfile } from "../../services/api/hooks/useUser";
import {
  handleUseCamera,
  handleUseGallery,
  handleCreateDirectory,
} from "../../utils/media/MediaUtil";
import { USER_IMAGE_DIR } from "../../constants/file";
import { uploadImage } from "../../utils/media/UploadUtil";

import BaseText from "../../components/common/BaseText";
import FormInput from "../../components/form/FormInput";
import MediaModal from "../../components/media/MediaModal";

import KeyboardScrollLayout from "../../layouts/KeyboardScrollLayout";
import HeaderLayout from "../../layouts/HeaderLayout";

import { useAppContext } from "../../contexts/app/AppContext";
import { handleAxiosError } from "../../services/api/api";

type EmailErrorType = "EMPTY" | "FORMAT" | null;

export default function EditProfileScreen() {
  const { handleShowError } = useAppContext();
  const { t } = useTranslation();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStacksParamList>>();
  const { handleSetUserInfo, userInfo } = useAuth();

  const fullNameRef = useRef<TextInput>(null);
  const phoneNumberRef = useRef<TextInput>(null);

  const [imageUrl, setImageUrl] = useState<string>("");
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState<EmailErrorType>(null);
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [phoneNumberError, setPhoneNumberError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const updateUserMutation = useUpdateUserProfile();

  const promptStopEdit = useCallback(() => {
    if (
      userInfo?.email === email &&
      userInfo?.fullName === fullName &&
      userInfo?.phoneNumber === phoneNumber &&
      userInfo?.avatarUrl === imageUrl
    ) {
      navigation.goBack();
      return;
    }
    Alert.alert(
      t("profile.confirm_stop_edit"),
      t("profile.confirm_stop_edit_description"),
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
  }, [userInfo, imageUrl, email, fullName, phoneNumber, navigation, t]);

  const handleValidateEmail = useCallback(() => {
    if (!email.trim()) {
      setEmailError("EMPTY");
      return false;
    }
    const isValid = validateEmail(email.trim());
    setEmailError(isValid ? null : "FORMAT");
    return isValid;
  }, [email]);

  const handleValidPhoneNumber = useCallback(() => {
    const isValid = /^\d{10}$/.test(phoneNumber);

    setPhoneNumberError(!isValid);
    return isValid;
  }, [phoneNumber]);

  const handleEditProfile = useCallback(async () => {
    try {
      if (!userInfo) return;
      setIsLoading(true);
      setIsSubmitting(true);

      const isEmailValid = handleValidateEmail();
      const isFullNameValid = fullName.trim() !== "";
      const isPhoneNumberValid = handleValidPhoneNumber();
      if (!isEmailValid || !isFullNameValid || !isPhoneNumberValid) {
        return;
      }

      let uploadImagePath = imageUrl;

      if (imageUrl === "") {
        FileSystem.deleteAsync(userInfo?.avatarUrl ?? "", { idempotent: true });
      } else {
        const res = await uploadImage(imageUrl);
        uploadImagePath = res;
      }

      const userData = {
        avatarUrl: uploadImagePath,
        email: email.trim(),
        fullName: fullName.trim(),
        phoneNumber: phoneNumber.trim(),
      };

      await updateUserMutation.mutateAsync({
        id: Number(userInfo.id),
        ...userData,
      });

      handleSetUserInfo({
        ...userInfo,
        ...userData,
      });
      Alert.alert(t("main.success"), t("profile.update_profile_success"));
      navigation.goBack();
    } catch (error) {
      console.error("Failed to update profile:", error);
      handleAxiosError(error, handleShowError);
    } finally {
      setIsLoading(false);
    }
  }, [
    email,
    fullName,
    phoneNumber,
    imageUrl,
    handleValidateEmail,
    handleSetUserInfo,
    handleValidPhoneNumber,
    updateUserMutation,
    userInfo,
    navigation,
    handleShowError,
  ]);

  const handleChangeImageByGallery = useCallback(async () => {
    try {
      const uri = await handleUseGallery();
      if (uri) {
        setImageUrl(uri[0]);
      }
    } catch (error) {
      console.error("Failed to change image:", error);
      handleAxiosError(error, handleShowError);
    } finally {
      setModalVisible(false);
    }
  }, [handleUseGallery, setModalVisible, handleShowError]);

  const handleChangeImageByPhoto = useCallback(async () => {
    try {
      const newImagePath = await handleUseCamera({
        oldImagePath: imageUrl,
        directory: USER_IMAGE_DIR,
      });
      if (newImagePath) {
        setImageUrl(newImagePath);
      }
    } catch (error) {
      console.error("Failed to change image:", error);
      handleAxiosError(error, handleShowError);
    } finally {
      setModalVisible(false);
    }
  }, [handleUseCamera, setModalVisible, handleShowError]);

  const handleRemovePhoto = useCallback(() => {
    if (!imageUrl) return;

    setImageUrl("");
  }, [imageUrl]);

  useEffect(() => {
    if (userInfo) {
      setEmail(userInfo.email);
      setFullName(userInfo.fullName);
      setPhoneNumber(userInfo.phoneNumber ?? "");
      setImageUrl(userInfo.avatarUrl ?? "");
    }
  }, [userInfo]);

  useEffect(() => {
    handleCreateDirectory(USER_IMAGE_DIR);
  }, []);

  return (
    <HeaderLayout
      headerTitle={t("profile.edit_profile")}
      rightButtonTitle={t("profile.save_changes")}
      handlePressRightButton={handleEditProfile}
      rightIcon={<Feather name="save" size={16} color="#fff" />}
      loading={isLoading}
      handleBackPress={promptStopEdit}
    >
      <KeyboardScrollLayout>
        <View className="flex-1 gap-y-6 p-4">
          <View className="bg-white rounded-lg shadow-sm p-4 gap-y-4 items-center">
            <View className="relative">
              {imageUrl ? (
                <View className="h-24 w-24 rounded-full overflow-hidden border border-gray-400">
                  <Image
                    source={{ uri: imageUrl }}
                    className="h-full w-full object-cover object-center"
                    resizeMode="cover"
                  />
                </View>
              ) : (
                <View className="h-24 w-24 border-[3px] border-gray-400 rounded-full items-center justify-center">
                  <AntDesign name="user" size={52} color="#9ca3af" />
                </View>
              )}
              <TouchableOpacity
                onPress={() => setModalVisible(true)}
                className="absolute bottom-0 right-0 bg-blue-600 p-2 rounded-full shadow-md"
              >
                <AntDesign name="camerao" size={16} color="white" />
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              className="flex-row gap-x-2 items-center"
              onPress={handleRemovePhoto}
              disabled={!imageUrl}
            >
              <AntDesign
                name="delete"
                size={14}
                color={imageUrl ? "#ef4444" : "#9ca3af"}
              />
              <BaseText
                className={`text-sm ${
                  imageUrl ? "text-red-500" : "text-gray-400"
                } `}
              >
                {t("profile.remove_photo")}
              </BaseText>
            </TouchableOpacity>
          </View>
          <View className="bg-white rounded-lg shadow-sm p-4 gap-y-4">
            <BaseText className="text-lg" fontWeight="medium">
              {t("profile.basic_info")}
            </BaseText>
            <View className="gap-y-1.5">
              <FormInput
                label={t("auth.email")}
                placeholder={t("auth.enter_email")}
                value={email}
                onChangeText={(text) => setEmail(text.trim())}
                keyboardType="email-address"
                onError={emailError !== null}
                errorMessage={
                  emailError === "EMPTY"
                    ? t("auth.please_enter_email")
                    : t("auth.invalid_email")
                }
                onBlur={() => isSubmitting && handleValidateEmail()}
                returnKeyType="next"
                onSubmitEditing={() => fullNameRef.current?.focus()}
              />
              <FormInput
                label={t("auth.full_name")}
                placeholder={t("auth.enter_full_name")}
                value={fullName}
                onChangeText={setFullName}
                onError={isSubmitting && !fullName.trim()}
                errorMessage={t("auth.please_enter_full_name")}
                ref={fullNameRef}
                returnKeyType="next"
                onSubmitEditing={() => phoneNumberRef.current?.focus()}
              />
              <FormInput
                label={t("auth.mobile_number")}
                placeholder={t("auth.enter_mobile_number")}
                value={phoneNumber}
                onChangeText={(text) => setPhoneNumber(text.trim())}
                keyboardType="phone-pad"
                maxLength={10}
                onError={phoneNumberError}
                errorMessage={
                  phoneNumber === ""
                    ? t("auth.please_enter_mobile_number")
                    : t("auth.invalid_mobile_number")
                }
                onBlur={() => isSubmitting && handleValidPhoneNumber()}
                ref={phoneNumberRef}
                returnKeyType="done"
              />
            </View>
          </View>
        </View>
      </KeyboardScrollLayout>
      <MediaModal
        modalVisible={modalVisible}
        setModalVisible={setModalVisible}
        onCameraPress={handleChangeImageByPhoto}
        onGalleryPress={handleChangeImageByGallery}
      />
    </HeaderLayout>
  );
}
