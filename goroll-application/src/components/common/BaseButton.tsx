import React from "react";
import { TouchableOpacity } from "react-native";
import { View } from "react-native";
import AntDesign from "@expo/vector-icons/AntDesign";
import Animated, { FadeInLeft, FadeOutRight } from "react-native-reanimated";

type ButtonProps = {
  children: React.ReactNode;
  onPress?: () => void;
  disabled?: boolean;
  loading?: boolean;
  loadingSize?: number;
  loadingColor?: string;
  className?: string;
};

export default function BaseButton({
  children,
  onPress,
  disabled = false,
  loading = false,
  loadingSize = 20,
  loadingColor = "#fff",
  className = "",
}: ButtonProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      className={`w-full rounded-lg p-4 ${className} ${
        disabled || loading ? "opacity-50" : "opacity-100"
      }`}
    >
      <View className="flex-row items-center justify-center gap-x-5">
        {children}
        {loading && (
          <Animated.View
            entering={FadeInLeft.duration(300)}
            exiting={FadeOutRight.duration(300)}
          >
            <View className="animate-spin">
              <AntDesign
                name="loading1"
                size={loadingSize}
                color={loadingColor}
              />
            </View>
          </Animated.View>
        )}
      </View>
    </TouchableOpacity>
  );
}
