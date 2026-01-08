import {
  View,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Image,
} from "react-native";
import React, { useState, useCallback, useRef, useEffect, memo } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import FormInput from "../../components/form/FormInput";
import { Ionicons, Feather } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useNavigation } from "@react-navigation/native";
import BaseText from "../../components/common/BaseText";
import { RootStacksParamList } from "../../navigation/NavigationTypes";
import { useAppContext } from "../../contexts/app/AppContext";
import {
  LocationListResponse,
  LocationSearchParams,
} from "../../services/api/types/location";
import { useSearchLocations } from "../../services/api/hooks/useLocation";
import AccessLevelStatus from "../Map/components/AccessLevelStatus";

import MallIcon from "../../components/icons/location/MallIcon";
import ParkIcon from "../../components/icons/location/ParkIcon";
import ResturantIcon from "../../components/icons/location/ResturantIcon";
import TransportIcon from "../../components/icons/location/TransportIcon";

import NoImage from "../../assets/no-image.png";
import BaseEmpty from "../../components/common/BaseEmpty";
import { handleAxiosError } from "../../services/api/api";

const PAGE_SIZE = 10;
const DEFAULT_FILTER: LocationSearchParams = {
  name: "",
  categoryId: "",
  accessLevelId: "",
  sortBy: [{ column: "createdAt", direction: "desc" }],
  limit: PAGE_SIZE,
  pageNumber: 1,
};

const LocationCard = memo(
  ({ item, onPress }: { item: LocationListResponse; onPress: () => void }) => {
    const { t, i18n } = useTranslation();

    const isValidUrl = (url: string) => {
      return url.startsWith("http://") || url.startsWith("https://");
    };

    const LocationIcon = (id: number) => {
      switch (id) {
        case 1:
          return <MallIcon color="black" />;
        case 2:
          return <TransportIcon color="black" />;
        case 3:
          return <ParkIcon color="black" />;
        case 4:
          return <ResturantIcon color="black" />;
        default:
          break;
      }
    };

    return (
      <TouchableOpacity
        onPress={onPress}
        className="p-4 bg-white rounded-lg shadow-sm flex-row items-center gap-x-4"
      >
        <View className="w-24 aspect-square bg-gray-100 flex-shrink-0 rounded overflow-hidden">
          {item.img && item.img.length > 0 ? (
            <Image
              source={
                item.img[0].imageUrl && isValidUrl(item.img[0].imageUrl)
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
        <View className="gap-y-1.5 flex-shrink-0 flex-1">
          <AccessLevelStatus
            label={
              i18n.language === "th"
                ? item.accessLevel.nameTh
                : item.accessLevel.nameEn
            }
            accessLevel={item.accessLevel.id || 0}
            className="self-start"
          />
          <View>
            <View className="flex-row gap-x-2 items-center">
              {LocationIcon(item.categoryId)}
              <BaseText className="text-base flex-1 break-words" fontWeight="semibold">
                {item.name}
              </BaseText>
            </View>

            <BaseText className="text-sm text-gray-700">
              {i18n.language === "th"
                ? item.category.nameTh
                : item.category.nameEn}
            </BaseText>
          </View>
          <BaseText className="text-gray-500 text-sm line-clamp-1">
            {item.description}
          </BaseText>
        </View>
      </TouchableOpacity>
    );
  }
);

export default function SearchLocationScreen() {
  const { searchText, setSearchText, handleShowError } = useAppContext();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStacksParamList>>();

  const flatListRef = useRef<FlatList>(null);
  const [searchFilter, setSearchFilter] = useState<LocationSearchParams>({
    ...DEFAULT_FILTER,
    name: searchText,
  });
  const [sortBy, setSortBy] = useState("1");
  const [locationList, setLocationList] = useState<LocationListResponse[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showFilter, setShowFilter] = useState(false);

  const SORT_OPTIONS = [
    {
      label: t("main.newest"),
      value: "1",
      sortBy: [{ column: "createdAt", direction: "desc" }],
    },
    {
      label: t("main.oldest"),
      value: "2",
      sortBy: [{ column: "createdAt", direction: "asc" }],
    },
  ];

  const {
    data: locations,
    isError: isLocationsError,
    error: locationsError,
    refetch: locationsRefetch,
    isLoading: isLocationsLoading,
  } = useSearchLocations(searchFilter);
  useEffect(() => {
    if (!locations) return;
    if (searchFilter.pageNumber === 1) {
      setLocationList(locations.data);
    } else {
      setLocationList((prev) => [...prev, ...locations.data]);
    }
    setTotalPages(Math.ceil(locations.total / PAGE_SIZE));
    setIsFetchingMore(false);
    setIsRefreshing(false);
  }, [locations, searchFilter]);
  useEffect(() => {
    if (isLocationsError) {
      console.error("Error fetching locations:", locationsError);
      handleAxiosError(locationsError, handleShowError);
    }
  }, [isLocationsError, locationsError]);

  const handleSearchSubmit = useCallback(() => {
    if (showFilter) setShowFilter(false);
    setSearchFilter((prev) => ({ ...prev, name: searchText, pageNumber: 1 }));
  }, [searchText, showFilter]);

  const handleNextPage = useCallback(() => {
    if (searchFilter.pageNumber < totalPages && !isFetchingMore) {
      setIsFetchingMore(true);
      setSearchFilter((prev) => ({ ...prev, pageNumber: prev.pageNumber + 1 }));
    }
  }, [searchFilter.pageNumber, totalPages, isFetchingMore]);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    if (searchFilter.pageNumber === 1) {
      const result = await locationsRefetch();
      setLocationList(result.data?.data ?? []);
      setTotalPages(Math.ceil((result.data?.total ?? 0) / PAGE_SIZE));
      setIsRefreshing(false);
    } else {
      setSearchFilter(DEFAULT_FILTER);
    }
  }, [searchFilter.pageNumber]);

  const handleSortSelect = (value: string) => {
    const option = SORT_OPTIONS.find((opt) => opt.value === value);
    if (!option) return;

    setSortBy(value);
    setShowFilter(false);
    setSearchFilter((prev) => ({
      ...prev,
      sortBy: option.sortBy,
      pageNumber: 1,
    }));
    flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
  };

  const SortDropdown = ({
    show,
    sortBy,
    onSelect,
  }: {
    show: boolean;
    sortBy: string;
    onSelect: (value: string) => void;
  }) =>
    show ? (
      <View className="absolute top-14 right-0 w-40 bg-white border border-gray-200 rounded-lg shadow z-50 overflow-hidden">
        {SORT_OPTIONS.map((option, index) => (
          <TouchableOpacity
            key={option.value}
            onPress={() => onSelect(option.value)}
            className={`p-3 ${
              index + 1 !== SORT_OPTIONS.length && "border-b"
            } border-gray-200 ${option.value === sortBy ? "bg-blue-50" : ""}`}
          >
            <BaseText
              className={`text-sm ${
                option.value === sortBy ? "text-blue-500" : "text-gray-700"
              }`}
            >
              {option.label}
            </BaseText>
          </TouchableOpacity>
        ))}
      </View>
    ) : null;

  useEffect(() => {
    setSearchFilter((prev) => ({ ...prev, name: searchText }));
  }, []);

  return (
    <View className="flex-1">
      <View className="bg-white border-b border-gray-200 px-4 pb-4 flex-row items-center gap-x-2">
        <View className="flex-1">
          <FormInput
            leftIcon={() => (
              <Ionicons name="search" size={20} color="#9ca3af" />
            )}
            placeholder={t("post.search_here")}
            value={searchText}
            onChangeText={setSearchText}
            onSubmitEditing={handleSearchSubmit}
            onBlur={handleSearchSubmit}
            onFocus={() => showFilter && setShowFilter(false)}
          />
        </View>
        <View className="relative flex-shrink-0">
          <TouchableOpacity
            onPress={() => setShowFilter((prev) => !prev)}
            className="p-3 rounded-lg border border-gray-300"
          >
            <Feather name="filter" size={20} color="#4b5563" />
          </TouchableOpacity>
          <SortDropdown
            show={showFilter}
            sortBy={sortBy}
            onSelect={handleSortSelect}
          />
        </View>
      </View>

      <FlatList
        ref={flatListRef}
        data={locationList}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <LocationCard
            item={item}
            onPress={() =>
              navigation.navigate("SearchLocationDetail", {
                locationId: item.id.toString(),
              })
            }
          />
        )}
        contentContainerStyle={{
          flexGrow: 1,
          gap: 8,
          paddingBottom: insets.bottom + 16,
          paddingTop: 16,
          paddingHorizontal: 16,
        }}
        refreshing={isRefreshing}
        onRefresh={handleRefresh}
        onEndReached={handleNextPage}
        onEndReachedThreshold={0}
        ListFooterComponent={
          isFetchingMore ? (
            <ActivityIndicator size="large" color="#2563eb" className="py-4" />
          ) : null
        }
        ListEmptyComponent={<BaseEmpty isLoading={isLocationsLoading} />}
      />
    </View>
  );
}
