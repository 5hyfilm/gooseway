import {
  View,
  ScrollView,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Image,
} from "react-native";
import React, { useState, useCallback, useEffect, useRef } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import {
  Ionicons,
  Entypo,
  AntDesign,
  MaterialIcons,
  FontAwesome5,
} from "@expo/vector-icons";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStacksParamList } from "../../navigation/NavigationTypes";
import { useFetchGlobalSearch } from "../../services/api/hooks/useSearch";
import { SearchParams } from "../../services/api/types/search";
import { useAppContext } from "../../contexts/app/AppContext";

import FormInput from "../../components/form/FormInput";
import BaseText from "../../components/common/BaseText";
import i18n from "../../languages/i18n";

import NoImage from "../../assets/no-image.png";
import { handleAxiosError } from "../../services/api/api";

const DEFAULT_FILTERS: SearchParams = {
  keyword: "",
  sortBy: [
    {
      column: "id",
      direction: "desc",
    },
  ],
  limit: 10,
  pageNumber: 1,
};

function SearchLabel({
  label,
  count,
  icon,
  onPress,
}: {
  label: string;
  count?: number;
  icon: React.ReactNode;
  onPress?: () => void;
}) {
  const { t } = useTranslation();

  return (
    <TouchableOpacity
      className="flex-row items-center justify-between gap-x-4"
      onPress={onPress}
    >
      <View className="flex-row items-center gap-x-4">
        {icon}
        <View>
          <BaseText fontWeight="semibold">{label}</BaseText>
          <BaseText className="text-gray-500 text-sm -mt-0.5">
            {count || 0} {t("main.list")}
          </BaseText>
        </View>
      </View>
      <AntDesign name="right" size={14} color="#6b7280" />
    </TouchableOpacity>
  );
}

export default function SearchScreen() {
  const { searchText, setSearchText, handleShowError } = useAppContext();
  const insets = useSafeAreaInsets();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStacksParamList>>();
  const { t } = useTranslation();

  const [refreshing, setRefreshing] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [searchParams, setSearchParams] =
    useState<SearchParams>(DEFAULT_FILTERS);

  const flatListRef = useRef<FlatList>(null);

  const isValidUrl = (url: string) => {
    return url.startsWith("http://") || url.startsWith("https://");
  };

  const {
    data: searchList,
    isError: isSearchError,
    error: searchError,
    isLoading: isSearchLoading,
    refetch: refetchSearch,
  } = useFetchGlobalSearch(searchParams);
  useEffect(() => {
    if (isSearchError) {
      console.error("Search Error:", searchError);
      handleAxiosError(searchError, handleShowError);
    }
  }, [isSearchError, searchError]);

  const handleSearchSubmit = useCallback(() => {
    setSearchText(searchValue.trim());
  }, [searchValue, setSearchText]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refetchSearch();
    } finally {
      setRefreshing(false);
    }
  }, [refetchSearch, setRefreshing]);

  useFocusEffect(
    useCallback(() => {
      setSearchValue(searchText);
      setSearchParams((prev) => ({ ...prev, keyword: searchText.trim() }));
    }, [searchText, setSearchParams, setSearchValue])
  );

  return (
    <View className="flex-1 bg-white" style={{ paddingTop: insets.top }}>
      <View className="bg-white border-b border-gray-200 p-4 gap-y-4">
        <View className="flex-row items-center gap-x-2">
          <View className="flex-1">
            <FormInput
              leftIcon={() => (
                <Ionicons name="search" size={20} color="#9ca3af" />
              )}
              placeholder={t("post.search_here")}
              value={searchValue}
              onChangeText={setSearchValue}
              onSubmitEditing={handleSearchSubmit}
              onBlur={handleSearchSubmit}
            />
          </View>
        </View>
      </View>
      {isSearchLoading ? (
        <View className="flex-1 flex-row justify-center items-center">
          <ActivityIndicator size="large" color="#2563eb" />
        </View>
      ) : (
        <ScrollView
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
          className="flex-1"
          contentContainerStyle={{ flexGrow: 1 }}
        >
          {!searchList ? (
            <View className="flex-1 flex-row justify-center items-center">
              <BaseText className="text-gray-500 text-lg">
                {t("main.no_data")}
              </BaseText>
            </View>
          ) : searchList.total.locations > 0 ||
            searchList.total.obstacles > 0 ||
            searchList.total.recordRoutes > 0 ? (
            <View className="p-4 gap-y-4">
              {searchList.total.locations && searchList.total.locations > 0 ? (
                <View className="gap-y-2">
                  <SearchLabel
                    label={t("main.locations")}
                    count={searchList?.total.locations}
                    icon={<Entypo name="location" size={24} color="black" />}
                    onPress={() => navigation.push("SearchLocation")}
                  />
                  <FlatList
                    ref={flatListRef}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    data={searchList?.data.locations || []}
                    keyExtractor={(item) => item.id.toString()}
                    scrollEventThrottle={16}
                    contentContainerStyle={{
                      gap: 16,
                    }}
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        className="w-40 rounded-lg overflow-hidden border border-gray-200"
                        onPress={() =>
                          navigation.push("SearchLocationDetail", {
                            locationId: item.id.toString(),
                          })
                        }
                      >
                        <View className="w-full aspect-square bg-gray-100">
                          {item.img && item.img.length > 0 ? (
                            <Image
                              source={
                                item.img[0].imageUrl &&
                                isValidUrl(item.img[0].imageUrl)
                                  ? { uri: item.img[0].imageUrl }
                                  : NoImage
                              }
                              style={{
                                width: "100%",
                                height: "100%",
                                resizeMode: "cover",
                              }}
                            />
                          ) : (
                            <Image
                              source={NoImage}
                              style={{
                                width: "100%",
                                height: "100%",
                                resizeMode: "cover",
                              }}
                            />
                          )}
                        </View>
                        <View className="p-2 gap-y-0.5">
                          <BaseText
                            className="line-clamp-1 text-xs text-gray-500"
                            fontWeight="medium"
                          >
                            {i18n.language === "th"
                              ? item.category.nameTh
                              : item.category.nameEn}
                          </BaseText>
                          <BaseText
                            className="line-clamp-1 text-sm text-gray-700"
                            fontWeight="medium"
                          >
                            {item.name}
                          </BaseText>
                        </View>
                      </TouchableOpacity>
                    )}
                  />
                </View>
              ) : null}
              {searchList.total.obstacles && searchList.total.obstacles > 0 ? (
                <View className="gap-y-2">
                  <SearchLabel
                    label={t("main.obstacles")}
                    count={searchList?.total.obstacles}
                    icon={<AntDesign name="warning" size={24} color="black" />}
                    onPress={() => navigation.push("SearchObstacle")}
                  />
                  <FlatList
                    ref={flatListRef}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    data={searchList?.data.obstacles || []}
                    keyExtractor={(item) => item.id.toString()}
                    scrollEventThrottle={16}
                    contentContainerStyle={{
                      gap: 16,
                    }}
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        className="w-40 rounded-lg overflow-hidden border border-gray-200"
                        onPress={() =>
                          navigation.push("ObstacleDetail", {
                            obstacleId: item.id.toString(),
                          })
                        }
                      >
                        <View className="w-full aspect-square bg-gray-100">
                          {item.img && item.img.length > 0 ? (
                            <Image
                              source={
                                item.img[0].imageUrl &&
                                isValidUrl(item.img[0].imageUrl)
                                  ? { uri: item.img[0].imageUrl }
                                  : NoImage
                              }
                              style={{
                                width: "100%",
                                height: "100%",
                                resizeMode: "cover",
                              }}
                            />
                          ) : (
                            <Image
                              source={NoImage}
                              style={{
                                width: "100%",
                                height: "100%",
                                resizeMode: "cover",
                              }}
                            />
                          )}
                        </View>
                        <View className="p-2 gap-y-0.5">
                          <BaseText
                            className="line-clamp-1 text-xs text-gray-500"
                            fontWeight="medium"
                          >
                            {i18n.language === "th"
                              ? item.subcategory.nameTh
                              : item.subcategory.nameEn}
                          </BaseText>
                          <BaseText
                            className="line-clamp-1 text-sm text-gray-700"
                            fontWeight="medium"
                          >
                            {item.description || "-"}
                          </BaseText>
                        </View>
                      </TouchableOpacity>
                    )}
                  />
                </View>
              ) : null}
              {searchList.total.recordRoutes &&
              searchList.total.recordRoutes > 0 ? (
                <View className="gap-y-2">
                  <SearchLabel
                    label={t("main.routes")}
                    count={searchList?.total.recordRoutes}
                    icon={
                      <MaterialIcons name="route" size={24} color="black" />
                    }
                    onPress={() => navigation.push("SearchRoute")}
                  />
                  <FlatList
                    ref={flatListRef}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    data={searchList?.data.recordRoutes || []}
                    keyExtractor={(item) => item.id.toString()}
                    scrollEventThrottle={16}
                    contentContainerStyle={{
                      gap: 16,
                    }}
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        className="w-40 rounded-lg overflow-hidden border border-gray-200"
                        onPress={() =>
                          navigation.push("RouteDetail", {
                            routeId: item.id.toString(),
                          })
                        }
                      >
                        <View className="p-2 gap-y-1">
                          <View className="flex-row gap-x-2 flex-1">
                            {/* <FontAwesome5
                              name="route"
                              size={14}
                              color="black"
                            /> */}
                            <BaseText
                              className="line-clamp-1 text-sm text-gray-700"
                              fontWeight="medium"
                            >
                              {item.name}
                            </BaseText>
                          </View>
                          <BaseText className="line-clamp-1 text-xs text-gray-500">
                            {(item.totalDistanceMeters / 1000).toFixed(3)}{" "}
                            {t("route.kilometer")}
                          </BaseText>
                          <View className="flex-row gap-x-1 flex-1">
                            <MaterialIcons
                              name="location-on"
                              size={10}
                              color="black"
                            />
                            <BaseText
                              className="text-xs text-gray-700"
                              fontWeight="medium"
                            >
                              {t("route.from")}
                            </BaseText>
                          </View>
                          <BaseText className="line-clamp-1 text-xs text-gray-500">
                            {item.startLocationName}
                          </BaseText>
                          <View className="flex-row gap-x-1 flex-1">
                            <MaterialIcons
                              name="location-on"
                              size={10}
                              color="black"
                            />
                            <BaseText
                              className="text-xs text-gray-700"
                              fontWeight="medium"
                            >
                              {t("route.to")}
                            </BaseText>
                          </View>
                          <BaseText className="line-clamp-1 text-xs text-gray-500">
                            {item.endLocationName}
                          </BaseText>
                        </View>
                      </TouchableOpacity>
                    )}
                  />
                </View>
              ) : null}
            </View>
          ) : (
            <View className="flex-1 flex-row justify-center items-center">
              <BaseText className="text-gray-500 text-lg">
                {t("main.no_data")}
              </BaseText>
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
}
