import { View, TouchableOpacity} from "react-native";
import React, { useCallback } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { RootStacksParamList } from "../../navigation/NavigationTypes";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import Ionicons from "@expo/vector-icons/Ionicons";
import BaseText from "../../components/common/BaseText";
import BaseButton from "../../components/common/BaseButton";
import { useTranslation } from "react-i18next";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { openInbox } from "react-native-email-link";
import { useAppContext } from "../../contexts/app/AppContext";
import { handleAxiosError } from "../../services/api/api";

export default function ResetPasswordSuccessScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStacksParamList>>();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const { handleShowError } = useAppContext();

  const handleOpenEmailApp = useCallback(() => {
    try {
      openInbox();
    } catch (error) {
      console.error("Error opening email app:", error);
      handleAxiosError(error, handleShowError);
    }
  }, [handleShowError]);

  return (
    <View
      className="flex-1 flex-col justify-center items-center p-6 gap-y-8"
      style={{
        paddingTop: insets.top + 24,
        paddingLeft: insets.left + 24,
        paddingRight: insets.right + 24,
        paddingBottom: insets.bottom + 24,
      }}
    >
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        className="absolute"
        style={{
          top: insets.top + 24,
          left: insets.left + 24,
        }}
      >
        <Ionicons name="chevron-back" size={24} color="#000" />
      </TouchableOpacity>
      <MaterialCommunityIcons name="email-fast" size={96} color="#2563eb" />
      <View className="items-center gap-y-6">
        <BaseText className="text-3xl" fontWeight="bold">
          {t("auth.email_sent")}
        </BaseText>
        <BaseText className="font-noto text-gray-600">
          {t("auth.please_check_your_email")}
        </BaseText>
      </View>

      <BaseButton className="bg-blue-600 w-full" onPress={handleOpenEmailApp}>
        <BaseText className="text-white text-center">
          {t("auth.open_email_app")}
        </BaseText>
      </BaseButton>
    </View>
  );
}
