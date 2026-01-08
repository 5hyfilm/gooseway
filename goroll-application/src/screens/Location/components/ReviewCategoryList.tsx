import { View, TouchableOpacity } from "react-native";
import React, { useEffect, useState } from "react";
import {
  MaterialIcons,
  FontAwesome5,
  Feather,
  FontAwesome6,
} from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStacksParamList } from "../../../navigation/NavigationTypes";
import { useFetchLocationFeatures } from "../../../services/api/hooks/useLocation";
import { AntDesign } from "@expo/vector-icons";

import BaseText from "../../../components/common/BaseText";

type CategoryItem = {
  id: string;
  key: string;
  label: string;
  primary: string;
  secondary: string;
  icon: JSX.Element;
  isGoodCount?: number;
  isNotGoodCount?: number;
};

export default function ReviewCategoryList({ id }: { id: string }) {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStacksParamList>>();
  const { t } = useTranslation();
  const [categories, setCategories] = useState<CategoryItem[]>([
    {
      id: "1",
      key: "parking",
      label: t("location.parking"),
      primary: "#dcfce7",
      secondary: "#16a34a",
      icon: <MaterialIcons name="local-parking" size={32} color="#16a34a" />,
    },
    {
      id: "2",
      key: "mainEntrance",
      label: t("location.mainEntrance"),
      primary: "#e0f2fe",
      secondary: "#0284c7",
      icon: <MaterialIcons name="door-front" size={32} color="#0284c7" />,
    },
    {
      id: "3",
      key: "ramps",
      label: t("location.ramps"),
      primary: "#dbeafe",
      secondary: "#2563eb",
      icon: <FontAwesome5 name="wheelchair" size={32} color="#2563eb" />,
    },
    {
      id: "4",
      key: "pathways",
      label: t("location.pathways"),
      primary: "#f3e8ff",
      secondary: "#9333ea",
      icon: <MaterialIcons name="alt-route" size={32} color="#9333ea" />,
    },
    {
      id: "5",
      key: "elevators",
      label: t("location.elevators"),
      primary: "#ede9fe",
      secondary: "#7c3aed",
      icon: <MaterialIcons name="elevator" size={32} color="#7c3aed" />,
    },
    {
      id: "6",
      key: "restrooms",
      label: t("location.restrooms"),
      primary: "#e0f2fe",
      secondary: "#0ea5e9",
      icon: <MaterialIcons name="wc" size={32} color="#0ea5e9" />,
    },
    {
      id: "7",
      key: "seating",
      label: t("location.seating"),
      primary: "#fef9c3",
      secondary: "#ca8a04",
      icon: <MaterialIcons name="weekend" size={32} color="#ca8a04" />,
    },
    {
      id: "8",
      key: "staff",
      label: t("location.staff"),
      primary: "#fce7f3",
      secondary: "#db2777",
      icon: <MaterialIcons name="support-agent" size={32} color="#db2777" />,
    },
    {
      id: "9",
      key: "etc",
      label: t("location.etc"),
      primary: "#f3f4f6",
      secondary: "#4b5563",
      icon: <Feather name="more-horizontal" size={32} color="#4b5563" />,
    },
  ]);

  const { data: features } = useFetchLocationFeatures(id);
  useEffect(() => {
    if (features) {
      setCategories((prevCategories) =>
        prevCategories.map((category) => {
          const matchedFeature = features.find(
            (feature) => feature.featureId.toString() === category.id
          );
          return matchedFeature
            ? {
                ...category,
                isGoodCount: matchedFeature.isGoodCount,
                isNotGoodCount: matchedFeature.isNotGoodCount,
              }
            : category;
        })
      );
    }
  }, [features]);

  return (
    <View className="flex-col gap-y-4">
      {categories.map((category) => (
        <TouchableOpacity
          className="rounded-lg p-4 shadow-xs"
          key={category.key}
          style={{ backgroundColor: category.primary }}
          onPress={() =>
            navigation.navigate("LocationReviewsByType", {
              locationId: id,
              featureId: category.id,
              type: category.key,
            })
          }
        >
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-x-2">
              {category.icon}
              <View>
                <BaseText
                  className="text-sm"
                  style={{ color: category.secondary }}
                  fontWeight="semibold"
                >
                  {category.label}
                </BaseText>
                <View className="flex-row items-center gap-x-2">
                  <View className="flex-row gap-x-1">
                    <AntDesign
                      name="like1"
                      size={10}
                      color={category.secondary}
                    />
                    <BaseText
                      className="text-xs"
                      style={{ color: category.secondary }}
                      fontWeight="medium"
                    >
                      {category.isGoodCount || 0}
                    </BaseText>
                  </View>
                  <View className="flex-row gap-x-1">
                    <AntDesign
                      name="dislike1"
                      size={10}
                      color={category.secondary}
                    />
                    <BaseText
                      className="text-xs"
                      style={{ color: category.secondary }}
                      fontWeight="medium"
                    >
                      {category.isNotGoodCount || 0}
                    </BaseText>
                  </View>
                </View>
              </View>
            </View>
            <View className="flex-row items-center gap-x-2">
              <BaseText
                className="text-xs"
                style={{ color: category.secondary }}
                fontWeight="medium"
              >
                {t("location.see_more")}
              </BaseText>
              <FontAwesome6
                name="chevron-right"
                size={14}
                color={category.secondary}
              />
            </View>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
}
