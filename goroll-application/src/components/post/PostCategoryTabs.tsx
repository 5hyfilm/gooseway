import React, { useEffect, useState } from "react";
import { FlatList, TouchableOpacity, View } from "react-native";
import { useTranslation } from "react-i18next";
import { useFetchPostCategories } from "../../services/api/hooks/usePost";
import { useAppContext } from "../../contexts/app/AppContext";
import { handleAxiosError } from "../../services/api/api";

import BaseText from "../common/BaseText";

export default function PostCategoryTabs({
  selectedId,
  onSelectCategory,
}: {
  selectedId: string;
  onSelectCategory: (id: string) => void;
}) {
  const { i18n } = useTranslation();
  const { handleShowError } = useAppContext();

  const {
    data: postCategories,
    isError: isCategoriesError,
    error: categoriesError,
  } = useFetchPostCategories();
  useEffect(() => {
    if (isCategoriesError) {
      console.error("Error fetching post categories:", categoriesError);
      handleAxiosError(categoriesError, handleShowError);
    }
  }, [isCategoriesError, categoriesError, handleShowError]);

  return (
    <FlatList
      horizontal
      data={postCategories}
      keyExtractor={(item) => item.id.toString()}
      showsHorizontalScrollIndicator={false}
      ItemSeparatorComponent={() => <View style={{ width: 4 }} />}
      renderItem={({ item }) => {
        const isActive = item.id.toString() === selectedId;

        return (
          <TouchableOpacity
            onPress={() => onSelectCategory(item.id.toString())}
            className={`px-4 py-1.5 rounded-full h-fit ${
              isActive ? "bg-blue-500" : "bg-white"
            }`}
          >
            <BaseText
              className={`text-sm ${isActive ? "text-white" : "text-gray-600"}`}
            >
              {i18n.language === "th" ? item.nameTh : item.nameEn}
            </BaseText>
          </TouchableOpacity>
        );
      }}
    />
  );
}
