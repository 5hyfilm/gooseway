import React,{useCallback} from "react";
import { View, ScrollView, TouchableOpacity } from "react-native";
import { useTranslation } from "react-i18next";
import BaseText from "../../components/common/BaseText";
import AntDesign from "@expo/vector-icons/AntDesign";
import Feather from "@expo/vector-icons/Feather";
import { useAppContext } from "../../contexts/app/AppContext";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { useAuth } from "../../contexts/auth/AuthContext";
import { useQueryClient } from '@tanstack/react-query';

export default function SettingScreen() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const { handleSwitchLanguage } = useAppContext();
  const { handleRemoveUserInfo } = useAuth();

  const handleSignOut = useCallback(() => {
    handleRemoveUserInfo();
    queryClient.clear();
  }, [handleRemoveUserInfo, queryClient]);

  return (
    <ScrollView className="flex-1">
      <View className="gap-y-6 py-4">
        <View className="gap-y-2">
          <View className="gap-y-2">
            <BaseText className="px-4">{t("main.app")}</BaseText>
            <TouchableOpacity
              className="flex-row justify-between p-4 bg-white border-b border-b-gray-200"
              onPress={handleSwitchLanguage}
            >
              <View className="flex flex-row items-center gap-x-4">
                <AntDesign name="earth" size={16} color="black" />
                <BaseText>{t("main.language")}</BaseText>
              </View>
              <BaseText>{t("main.trans_lang")}</BaseText>
            </TouchableOpacity>
          </View>
          <View className="gap-y-2">
            <BaseText className="px-4">{t("main.support")}</BaseText>
            <View>
              <TouchableOpacity className="flex-row justify-between p-4 bg-white border-b border-b-gray-200">
                <View className="flex flex-row items-center gap-x-4">
                  <Feather name="message-circle" size={16} color="black" />
                  <BaseText>{t("main.contact")}</BaseText>
                </View>
                <AntDesign name="right" size={16} color="black" />
              </TouchableOpacity>
              <TouchableOpacity className="flex-row justify-between p-4 bg-white border-b border-b-gray-200">
                <View className="flex flex-row items-center gap-x-4">
                  <AntDesign name="questioncircleo" size={16} color="black" />
                  <BaseText>{t("main.help")}</BaseText>
                </View>
                <AntDesign name="right" size={16} color="black" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
        <TouchableOpacity
          className="flex-row justify-center p-4 bg-red-100 mx-4 rounded-lg"
          onPress={handleSignOut}
        >
          <View className="flex flex-row items-center gap-x-4">
            <FontAwesome6
              name="arrow-right-from-bracket"
              size={16}
              color="#dc2626"
            />
            <BaseText className="text-red-600">{t("main.log_out")}</BaseText>
          </View>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
