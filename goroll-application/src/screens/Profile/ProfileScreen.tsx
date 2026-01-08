import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
} from "react-native";
import { useAuth } from "../../contexts/auth/AuthContext";
import AntDesign from "@expo/vector-icons/AntDesign";
import Feather from "@expo/vector-icons/Feather";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";
import { RootStacksParamList } from "../../navigation/NavigationTypes";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useTranslation } from "react-i18next";
import {
  useFetchUserProfile,
  useUpdateWheelChair,
} from "../../services/api/hooks/useUser";
import {
  WheelChairData,
  UpdateWheelChairParams,
} from "../../services/api/types/user";

import BaseText from "../../components/common/BaseText";
import BaseInput from "../../components/common/BaseInput";
import BaseButton from "../../components/common/BaseButton";

import { useAppContext } from "../../contexts/app/AppContext";
import { handleAxiosError } from "../../services/api/api";

const WHEEL_CHANGE_DEFAULT: WheelChairData = {
  id: 0,
  userId: 0,
  isFoldable: false,
  widthRegularCm: 0,
  lengthRegularCm: 0,
  weightKg: 0,
  widthFoldedCm: 0,
  lengthFoldedCm: 0,
  heightFoldedCm: 0,
  notes: "",
};

export default function ProfileScreen() {
  const { handleShowError } = useAppContext();
  const { t } = useTranslation();
  const { userInfo, handleSetUserInfo } = useAuth();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStacksParamList>>();
  const [routeType, setRouteType] = useState("saved");
  const [isEditMode, setIsEditMode] = useState(false);
  const [wheelchairInfo, setWheelchairInfo] =
    useState<WheelChairData>(WHEEL_CHANGE_DEFAULT);
  const [confirmWheelchairInfo, setConfirmWheelchairInfo] =
    useState<WheelChairData>(WHEEL_CHANGE_DEFAULT);

  const {
    data: userProfile,
    isError: isUserProfileError,
    error: userProfileError,
  } = useFetchUserProfile();
  useEffect(() => {
    if (userProfile) {
      handleSetUserInfo({
        id: userProfile.id.toString(),
        email: userProfile.email,
        fullName: userProfile.fullName,
        avatarUrl: userProfile.avatarUrl ?? "",
        phoneNumber: userProfile.phoneNumber ?? "",
        accessToken: userInfo?.accessToken ?? "",
      });
      setWheelchairInfo(userProfile.wheelChair || WHEEL_CHANGE_DEFAULT);
      if (userProfile.wheelChair) {
        setConfirmWheelchairInfo(userProfile.wheelChair);
      }
    }
  }, [userProfile]);
  useEffect(() => {
    if (isUserProfileError) {
      console.error("Error fetching user profile:", userProfileError);
      handleAxiosError(userProfileError, handleShowError);
    }
  }, [isUserProfileError, userProfileError]);

  const useUpdateWheelChairMutation = useUpdateWheelChair();

  const handleUpdateWheelchair = useCallback(
    (field: string, value: string) => {
      setWheelchairInfo((prev) => ({
        ...prev,
        [field]: value,
      }));
    },
    [setWheelchairInfo]
  );

  const handleConfirmWheelchair = useCallback(async () => {
    try {
      const body: UpdateWheelChairParams = {
        ...wheelchairInfo,
        userId: Number(userProfile?.id ?? userInfo?.id),
      };
      await useUpdateWheelChairMutation.mutateAsync(body);
      Alert.alert(t("main.success"), t("profile.edit_wheelchair_success"));
      setConfirmWheelchairInfo(wheelchairInfo);
      setIsEditMode(false);
    } catch (error) {
      console.error("Error updating wheelchair info:", error);
      handleAxiosError(error, handleShowError);
    }
  }, [wheelchairInfo, userProfile, userInfo, useUpdateWheelChairMutation, handleShowError]);

  const handleCancelEdit = useCallback(() => {
    if (!isEditMode) {
      setIsEditMode(true);
      return;
    }
    setWheelchairInfo(confirmWheelchairInfo);
    setIsEditMode(false);
  }, [isEditMode, confirmWheelchairInfo]);

  return (
    <ScrollView className="flex-1">
      <View className="gap-y-4 pb-4">
        <View className="flex-row flex-wrap gap-3 bg-white p-4 border-b border-gray-200">
          {userProfile?.avatarUrl || userInfo?.avatarUrl ? (
            <View className="h-20 w-20 rounded-full overflow-hidden border border-gray-400">
              <Image
                source={{ uri: userProfile?.avatarUrl ?? userInfo?.avatarUrl }}
                className="h-full w-full object-cover object-center"
                resizeMode="cover"
              />
            </View>
          ) : (
            <View className="h-20 w-20 border-[3px] border-gray-400 rounded-full items-center justify-center">
              <AntDesign name="user" size={40} color="#9ca3af" />
            </View>
          )}
          <View className="gap-y-3">
            <View>
              <BaseText className="text-lg text-gray-500" fontWeight="semibold">
                {userProfile?.fullName ?? userInfo?.fullName}
              </BaseText>
              <BaseText className="text-sm">
                {t("main.profiles.active_explorer")}
              </BaseText>
            </View>
            <View className="flex-row flex-wrap gap-x-2">
              <BaseText className="text-xs">
                {userProfile?.routeCount ?? 0} {t("main.profiles.routes")}
              </BaseText>
              <BaseText className="text-xs">
                {userProfile?.postCount ?? 0} {t("main.profiles.posts")}
              </BaseText>
              <BaseText className="text-xs">
                {userProfile?.followingCount ?? 0}{" "}
                {t("main.profiles.following")}
              </BaseText>
              <BaseText className="text-xs">
                {userProfile?.followerCount ?? 0} {t("main.profiles.followers")}
              </BaseText>
            </View>
          </View>
          <View className="w-full flex-row gap-x-2">
            <TouchableOpacity
              className="flex-row items-center justify-center flex-1 gap-2 bg-blue-600 rounded-full h-12"
              onPress={() => navigation.navigate("EditProfile")}
            >
              <Feather name="edit-2" size={16} color="white" />
              <BaseText className="text-white" fontWeight="semibold">
                {t("main.profiles.edit_profile")}
              </BaseText>
            </TouchableOpacity>
            <TouchableOpacity
              className="bg-gray-200 rounded-full h-12 w-12 justify-center items-center"
              onPress={() => navigation.navigate("Setting")}
            >
              <AntDesign name="setting" size={16} color="#4b5563" />
            </TouchableOpacity>
          </View>
        </View>
        <View className="bg-white mx-4 shadow-sm rounded-lg">
          <View className="flex-row justify-between items-center border-b border-gray-200 px-4 py-3 ">
            <BaseText className="text-gray-500" fontWeight="semibold">
              {t("main.profiles.wheelchair_info")}
            </BaseText>
            <TouchableOpacity
              onPress={handleCancelEdit}
              disabled={useUpdateWheelChairMutation.isPending}
            >
              {isEditMode ? (
                <BaseText className="text-gray-500 text-sm" fontWeight="medium">
                  {t("main.cancel")}
                </BaseText>
              ) : (
                <Feather name="edit-2" size={14} color="#6b7280" />
              )}
            </TouchableOpacity>
          </View>
          <View className="mx-4 py-3 gap-y-3 border-b border-gray-200">
            <View className="gap-y-1">
              <BaseText className="text-sm" fontWeight="semibold">
                {t("main.profiles.foldability")}
              </BaseText>
              {isEditMode ? (
                <View className="flex-row gap-x-4">
                  <TouchableOpacity
                    onPress={() =>
                      setWheelchairInfo((prev) => ({
                        ...prev,
                        isFoldable: true,
                      }))
                    }
                    className="flex-row items-center gap-x-2"
                  >
                    <View className="w-5 h-5 bg-white rounded-full border border-gray-500">
                      <View
                        className={`w-3 h-3 rounded-full m-auto ${
                          wheelchairInfo?.isFoldable
                            ? "bg-blue-500"
                            : "bg-white"
                        }`}
                      />
                    </View>
                    <BaseText>{t("main.profiles.yes")}</BaseText>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() =>
                      setWheelchairInfo((prev) => ({
                        ...prev,
                        isFoldable: false,
                      }))
                    }
                    className="flex-row items-center gap-x-2"
                  >
                    <View className="w-5 h-5 bg-white rounded-full border border-gray-500">
                      <View
                        className={`w-3 h-3 rounded-full m-auto ${
                          !wheelchairInfo?.isFoldable
                            ? "bg-blue-500"
                            : "bg-white"
                        }`}
                      />
                    </View>
                    <BaseText>{t("main.profiles.no")}</BaseText>
                  </TouchableOpacity>
                </View>
              ) : (
                <BaseText className="text-gray-500 text-xs">
                  {wheelchairInfo?.isFoldable
                    ? t("main.profiles.foldable")
                    : t("main.profiles.not_foldable")}
                </BaseText>
              )}
            </View>
            <View className="gap-y-1">
              <BaseText className="text-sm" fontWeight="semibold">
                {t("main.profiles.regular_dimensions")}
              </BaseText>
              <View className="flex-row justify-between gap-x-2">
                <View className="flex-1">
                  <BaseText className="text-xs" fontWeight="medium">
                    {t("main.profiles.width")}
                  </BaseText>
                  {isEditMode ? (
                    <BaseInput
                      value={wheelchairInfo.widthRegularCm?.toString() ?? "0"}
                      onChangeText={(value) =>
                        handleUpdateWheelchair("widthRegularCm", value)
                      }
                      className="text-sm p-1 border border-gray-300 rounded"
                      keyboardType="numeric"
                    />
                  ) : (
                    <BaseText className="text-gray-500 text-xs">
                      {wheelchairInfo.widthRegularCm} {t("main.profiles.cm")}
                    </BaseText>
                  )}
                </View>
                <View className="flex-1">
                  <BaseText className="text-xs" fontWeight="medium">
                    {t("main.profiles.length")}
                  </BaseText>
                  {isEditMode ? (
                    <BaseInput
                      value={wheelchairInfo.lengthRegularCm?.toString() ?? "0"}
                      onChangeText={(value) =>
                        handleUpdateWheelchair("lengthRegularCm", value)
                      }
                      className="text-sm p-1 border border-gray-300 rounded"
                      keyboardType="numeric"
                    />
                  ) : (
                    <BaseText className="text-gray-500 text-xs">
                      {wheelchairInfo.lengthRegularCm} {t("main.profiles.cm")}
                    </BaseText>
                  )}
                </View>
                <View className="flex-1">
                  <BaseText className="text-xs" fontWeight="medium">
                    {t("main.profiles.weight")}
                  </BaseText>
                  {isEditMode ? (
                    <BaseInput
                      value={wheelchairInfo.weightKg?.toString() ?? "0"}
                      onChangeText={(value) =>
                        handleUpdateWheelchair("weightKg", value)
                      }
                      className="text-sm p-1 border border-gray-300 rounded"
                      keyboardType="numeric"
                    />
                  ) : (
                    <BaseText className="text-gray-500 text-xs">
                      {wheelchairInfo.weightKg} {t("main.profiles.kg")}
                    </BaseText>
                  )}
                </View>
              </View>
            </View>
            {wheelchairInfo?.isFoldable && (
              <View className="gap-y-1">
                <BaseText className="text-sm" fontWeight="semibold">
                  {t("main.profiles.folded_dimensions")}
                </BaseText>
                <View className="flex-row justify-between gap-x-2">
                  <View className="flex-1">
                    <BaseText className="text-xs" fontWeight="medium">
                      {t("main.profiles.width")}
                    </BaseText>
                    {isEditMode ? (
                      <BaseInput
                        value={wheelchairInfo.widthFoldedCm?.toString() ?? "0"}
                        onChangeText={(value) =>
                          handleUpdateWheelchair("widthFoldedCm", value)
                        }
                        className="text-sm p-1 border border-gray-300 rounded"
                        keyboardType="numeric"
                      />
                    ) : (
                      <BaseText className="text-gray-500 text-xs">
                        {wheelchairInfo.widthFoldedCm} {t("main.profiles.cm")}
                      </BaseText>
                    )}
                  </View>
                  <View className="flex-1">
                    <BaseText className="text-xs" fontWeight="medium">
                      {t("main.profiles.length")}
                    </BaseText>
                    {isEditMode ? (
                      <BaseInput
                        value={wheelchairInfo.lengthFoldedCm?.toString() ?? "0"}
                        onChangeText={(value) =>
                          handleUpdateWheelchair("lengthFoldedCm", value)
                        }
                        className="text-sm p-1 border border-gray-300 rounded"
                        keyboardType="numeric"
                      />
                    ) : (
                      <BaseText className="text-gray-500 text-xs">
                        {wheelchairInfo.lengthFoldedCm} {t("main.profiles.cm")}
                      </BaseText>
                    )}
                  </View>
                  <View className="flex-1">
                    <BaseText className="text-xs" fontWeight="medium">
                      {t("main.profiles.height")}
                    </BaseText>
                    {isEditMode ? (
                      <BaseInput
                        value={wheelchairInfo.heightFoldedCm?.toString() ?? "0"}
                        onChangeText={(value) =>
                          handleUpdateWheelchair("heightFoldedCm", value)
                        }
                        className="text-sm p-1 border border-gray-300 rounded"
                        keyboardType="numeric"
                      />
                    ) : (
                      <BaseText className="text-gray-500 text-xs">
                        {wheelchairInfo.heightFoldedCm} {t("main.profiles.cm")}
                      </BaseText>
                    )}
                  </View>
                </View>
              </View>
            )}
          </View>
          <View className="gap-y-1 py-3 px-4">
            <BaseText className="text-sm" fontWeight="semibold">
              {t("main.profiles.additional_notes")}
            </BaseText>
            {isEditMode ? (
              <BaseInput
                value={wheelchairInfo.notes}
                onChangeText={(value) =>
                  setWheelchairInfo((prev) => ({
                    ...prev,
                    notes: value,
                  }))
                }
                className="text-sm p-1 border border-gray-300 rounded min-h-24"
                multiline
                numberOfLines={4}
                style={{ textAlignVertical: "top" }}
              />
            ) : (
              <BaseText className="text-gray-500 text-xs">
                {wheelchairInfo.notes || t("main.no_data")}
              </BaseText>
            )}
          </View>
          {isEditMode && (
            <View className="p-4">
              <BaseButton
                className="bg-blue-600 w-full !py-3"
                onPress={handleConfirmWheelchair}
                loading={useUpdateWheelChairMutation.isPending}
                disabled={!wheelchairInfo.widthRegularCm || !wheelchairInfo.lengthRegularCm || !wheelchairInfo.weightKg || (wheelchairInfo?.isFoldable && (!wheelchairInfo.widthFoldedCm || !wheelchairInfo.lengthFoldedCm || !wheelchairInfo.heightFoldedCm))}
              >
                <BaseText className="text-white text-center text-sm">
                  {t("profile.save_changes")}
                </BaseText>
              </BaseButton>
            </View>
          )}
        </View>
        <View className="bg-white mx-4 shadow-sm rounded-lg">
          <View className="flex-row justify-between items-center border-b border-gray-200 px-4 py-3 ">
            <BaseText className="text-gray-500" fontWeight="semibold">
              {t("profile.my_post")}
            </BaseText>
            {userProfile?.post && userProfile?.post.length > 0 && (
              <TouchableOpacity
                className="flex-row items-center gap-x-2"
                onPress={() => navigation.push("PostScreen")}
              >
                <BaseText
                  className="text-gray-500 text-sm"
                  fontWeight="semibold"
                >
                  {t("profile.see_all")}
                </BaseText>
                <AntDesign name="right" size={14} color="#6b7280" />
              </TouchableOpacity>
            )}
          </View>
          {(userProfile?.post ?? []).length > 0 ? (
            (userProfile?.post ?? []).map((post) => (
              <TouchableOpacity
                onPress={() => {
                  navigation.push("PostDetail", {
                    communityId: post.id.toString(),
                  });
                }}
                key={post.id}
                className="mx-4 py-3 gap-y-2 border-b border-gray-200"
              >
                <View className="flex-row items-center gap-x-2 justify-between">
                  <BaseText fontWeight="medium">{post.title}</BaseText>
                  <TouchableOpacity
                    onPress={() => {
                      navigation.navigate("EditPost", {
                        postId: post.id.toString(),
                      });
                    }}
                  >
                    <Feather name="edit" size={14} color="#6b7280" />
                  </TouchableOpacity>
                </View>
                <BaseText className="text-gray-600 text-sm line-clamp-2">
                  {post.content || "-"}
                </BaseText>
                {post.tags.length > 0 && (
                  <View className="flex-row flex-wrap items-center gap-x-2">
                    {post.tags.map((tag) => (
                      <BaseText
                        key={tag.tag}
                        className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full"
                      >
                        #{tag.tag}
                      </BaseText>
                    ))}
                  </View>
                )}
              </TouchableOpacity>
            ))
          ) : (
            <BaseText className="text-gray-500 text-sm p-2">
              {t("main.no_data")}
            </BaseText>
          )}
        </View>
        <View className="bg-white mx-4 shadow-sm rounded-lg">
          <View className="flex-row justify-between items-center border-b border-gray-200 px-4 py-3 ">
            <BaseText className="text-gray-500" fontWeight="semibold">
              {t("profile.route_lib")}
            </BaseText>
            {userProfile?.route && userProfile?.route.length > 0 && (
              <TouchableOpacity
                onPress={() => navigation.push("RouteScreen")}
                className="flex-row items-center gap-x-2"
              >
                <BaseText
                  className="text-gray-500 text-sm"
                  fontWeight="semibold"
                >
                  {t("profile.view_all")}
                </BaseText>
                <AntDesign name="right" size={14} color="#6b7280" />
              </TouchableOpacity>
            )}
          </View>
          <View className="gap-y-2 p-2">
            <View className="flex-row flex-wrap">
              {(userProfile?.route ?? []).length > 0 ? (
                (userProfile?.route ?? []).map((route) => (
                  <View className="w-1/2 p-1" key={route.id}>
                    <TouchableOpacity
                      key={route.id}
                      className="gap-y-2 bg-white rounded-lg p-3 flex-1"
                      style={styles.shadowBox}
                      onPress={() => {
                        navigation.push("RouteDetail", {
                          routeId: route.id.toString(),
                        });
                      }}
                    >
                      <View className="flex-row items-center gap-x-2 justify-between">
                        <BaseText
                          className="text-gray-900 text-sm w-1/2 line-clamp-1"
                          fontWeight="medium"
                        >
                          {route.name}
                        </BaseText>
                        {/* <BaseText className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-800">
                          เข้าถึงง่าย
                        </BaseText> */}
                      </View>
                      <View className="flex-row flex-wrap items-center gap-x-2">
                        <View className="flex-row gap-x-1 text-xs text-gray-500">
                          <Ionicons
                            name="location-outline"
                            size={12}
                            color="#6b7280"
                          />
                          <BaseText className="text-xs text-gray-500">
                            {(route.totalDistanceMeters / 1000).toFixed(3)}{" "}
                            {t("route.kilometer")}
                          </BaseText>
                        </View>
                        {/* <View className="flex-row gap-x-1 text-xs text-gray-500">
                          <AntDesign name="star" size={12} color="#6b7280" />
                          <BaseText className="text-xs text-gray-500">
                            {route.rating}
                          </BaseText>
                        </View> */}
                      </View>
                    </TouchableOpacity>
                  </View>
                ))
              ) : (
                <BaseText className="text-gray-500 text-sm">
                  {t("main.no_data")}
                </BaseText>
              )}
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  shadowBox: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
});
