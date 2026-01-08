import {
  View,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from "react-native";
import React, { useState, useCallback, useRef, useEffect, memo } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import FormInput from "../../components/form/FormInput";
import { Ionicons, Feather } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useNavigation } from "@react-navigation/native";
import { useSearchRoutes } from "../../services/api/hooks/useRoute";
import {
  RouteListByUserParams,
  RouteListByUserData,
} from "../../services/api/types/route";
import BaseText from "../../components/common/BaseText";
import { RootStacksParamList } from "../../navigation/NavigationTypes";
import { formatDurationAbbreviated } from "../../utils/time/FormatTimes";
import { FontAwesome5, MaterialIcons, Entypo } from "@expo/vector-icons";
import { useAppContext } from "../../contexts/app/AppContext";
import { use } from "i18next";
import BaseEmpty from "../../components/common/BaseEmpty";
import { handleAxiosError } from "../../services/api/api";

const PAGE_SIZE = 10;
const DEFAULT_FILTER: RouteListByUserParams = {
  name: "",
  sortBy: [{ column: "createdAt", direction: "desc" }],
  limit: PAGE_SIZE,
  pageNumber: 1,
};

const InfoBlock = ({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
}) => (
  <View className="flex-shrink-0 flex-1 gap-y-0.5">
    <View className="flex-row gap-x-1">
      {icon}
      <BaseText className="text-sm" fontWeight="medium">
        {label}
      </BaseText>
    </View>
    <BaseText className="text-gray-500 text-sm line-clamp-1">{value}</BaseText>
  </View>
);

const RouteCard = memo(
  ({ item, onPress }: { item: RouteListByUserData; onPress: () => void }) => {
    const { t, i18n } = useTranslation();

    return (
      <TouchableOpacity
        onPress={onPress}
        className="p-4 bg-white rounded-lg shadow-sm gap-y-1.5"
      >
        <View className="flex-row gap-x-2">
          <Entypo name="location" size={16} color="black" />
          <BaseText className="text-base" fontWeight="semibold">
            {item.name}
          </BaseText>
        </View>
        <View className="flex-row items-center gap-x-2">
          <InfoBlock
            label={t("route.distance")}
            value={`${(item.totalDistanceMeters / 1000).toFixed(3)} ${t(
              "route.kilometer"
            )}`}
            icon={<FontAwesome5 name="route" size={14} color="black" />}
          />
          <InfoBlock
            label={t("route.duration")}
            value={formatDurationAbbreviated(item.time, i18n.language)}
            icon={<Ionicons name="time-sharp" size={14} color="black" />}
          />
        </View>
        <View className="flex-row items-center gap-x-2">
          <InfoBlock
            label={t("route.from")}
            value={item.startLocationName || "-"}
            icon={<MaterialIcons name="location-on" size={14} color="black" />}
          />
          <InfoBlock
            label={t("route.to")}
            value={item.endLocationName || "-"}
            icon={<MaterialIcons name="location-on" size={14} color="black" />}
          />
        </View>
      </TouchableOpacity>
    );
  }
);

export default function SearchRouteScreen() {
  const { searchText, setSearchText, handleShowError } = useAppContext();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStacksParamList>>();

  const flatListRef = useRef<FlatList>(null);
  const [searchFilter, setSearchFilter] = useState<RouteListByUserParams>({
    ...DEFAULT_FILTER,
    name: searchText,
  });
  const [sortBy, setSortBy] = useState("1");
  const [routeList, setRouteList] = useState<RouteListByUserData[]>([]);
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
    data: routes,
    isError: isRoutesError,
    error: routesError,
    refetch: routesRefetch,
    isLoading: isRoutesLoading,
  } = useSearchRoutes(searchFilter);
  useEffect(() => {
    if (!routes) return;

    if (searchFilter.pageNumber === 1) {
      setRouteList(routes.data);
    } else {
      setRouteList((prev) => [...prev, ...routes.data]);
    }

    setTotalPages(Math.ceil(routes.total / PAGE_SIZE));
    setIsFetchingMore(false);
    setIsRefreshing(false);
  }, [routes, searchFilter]);
  useEffect(() => {
    if (isRoutesError) {
      console.error("Error fetching routes:", routesError);
      handleAxiosError(routesError, handleShowError);
    }
  }, [isRoutesError, routesError]);

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
      const result = await routesRefetch();
      setRouteList(result.data?.data ?? []);
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
        data={routeList}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <RouteCard
            item={item}
            onPress={() =>
              navigation.navigate("RouteDetail", {
                routeId: item.id.toString(),
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
        ListEmptyComponent={<BaseEmpty isLoading={isRoutesLoading} />}
      />
    </View>
  );
}
