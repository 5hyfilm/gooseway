import React from "react";
import { View, ActivityIndicator } from "react-native";
import { useTranslation } from "react-i18next";

import BaseText from "./BaseText";

export default function BaseEmpty({
  isLoading,
  haveLoading = true,
}: {
  isLoading: boolean;
  haveLoading?: boolean;
}) {
  const { t } = useTranslation();

  return (
    <>
      {!isLoading ? (
        <View className="flex-1 items-center justify-center">
          <BaseText className="text-gray-500 text-lg">
            {t("main.no_data")}
          </BaseText>
        </View>
      ) : (
        haveLoading && (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#2563eb" />
          </View>
        )
      )}
    </>
  );
}
