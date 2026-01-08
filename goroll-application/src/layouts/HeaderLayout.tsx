import { View, TouchableOpacity } from "react-native";
import React from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useNavigation } from "@react-navigation/native";
import { RootStacksParamList } from "../navigation/NavigationTypes";
import AntDesign from "@expo/vector-icons/AntDesign";
import Animated, { FadeInLeft, FadeOutLeft } from "react-native-reanimated";

import BaseText from "../components/common/BaseText";

type HeaderLayoutProps = {
  children: React.ReactNode;
  headerTitle: string;
  rightButtonTitle?: string;
  handleBackPress?: () => void;
  handlePressRightButton?: () => void;
  loading?: boolean;
  rightIcon?: React.ReactNode;
  isModal?: boolean;
  isBorder?: boolean;
  customRightButton?: React.ReactNode;
  disabled?: boolean;
};

export default function HeaderLayout({
  children,
  headerTitle,
  rightButtonTitle,
  handleBackPress,
  handlePressRightButton = () => {},
  loading = false,
  disabled = false,
  rightIcon = null,
  isModal = false,
  isBorder = false,
  customRightButton = null,
}: HeaderLayoutProps) {
  const insets = useSafeAreaInsets();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStacksParamList>>();
  return (
    <View className="flex-1">
      <View
        className={`bg-white flex-row items-center justify-between ${
          isBorder ? "border-b border-gray-200" : ""
        }`}
        style={{
          paddingTop: isModal ? 16 : insets.top + 16,
          paddingLeft: isModal ? 16 : insets.left + 16,
          paddingRight: isModal ? 16 : insets.right + 16,
          paddingBottom: 16,
        }}
      >
        <View className="flex-row items-center gap-x-3">
          <TouchableOpacity
            disabled={loading}
            className={`${loading && "opacity-50"}`}
            onPress={() => {
              if (handleBackPress) {
                handleBackPress();
              } else {
                navigation.goBack();
              }
            }}
          >
            <Ionicons name="chevron-back" size={24} color="#000" />
          </TouchableOpacity>
          <BaseText className="text-lg">{headerTitle}</BaseText>
        </View>
        {rightButtonTitle && (
          <TouchableOpacity
            disabled={loading || disabled}
            className={`px-4 py-2 bg-blue-600 text-white rounded-lg flex-row items-center gap-x-2 ${
              loading || disabled ? "opacity-50" : ""
            }`}
            onPress={handlePressRightButton}
          >
            {rightIcon && <View>{rightIcon}</View>}
            <BaseText className="text-white">{rightButtonTitle}</BaseText>
            {loading && (
              <Animated.View
                entering={FadeInLeft.duration(300)}
                exiting={FadeOutLeft.duration(300)}
              >
                <View className="animate-spin">
                  <AntDesign name="loading1" size={16} color="#fff" />
                </View>
              </Animated.View>
            )}
          </TouchableOpacity>
        )}
        {customRightButton}
      </View>
      {children}
    </View>
  );
}
