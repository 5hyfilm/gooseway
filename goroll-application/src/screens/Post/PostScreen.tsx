import {
  View,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from "react-native";
import React, { useState, useCallback, useRef, useEffect, memo } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import FormInput from "../../components/form/FormInput";
import { Ionicons, Feather, Entypo } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useNavigation } from "@react-navigation/native";
import BaseText from "../../components/common/BaseText";
import { RootStacksParamList } from "../../navigation/NavigationTypes";
import BaseEmpty from "../../components/common/BaseEmpty";

import { useAppContext } from "../../contexts/app/AppContext";

import {
  PostByUserParams,
  PostByUserData,
} from "../../services/api/types/post";
import { useFetchPostsByUser } from "../../services/api/hooks/usePost";
import { handleAxiosError } from "../../services/api/api";

const PAGE_SIZE = 10;
const DEFAULT_FILTER: PostByUserParams = {
  title: "",
  sortBy: [{ column: "createdAt", direction: "desc" }],
  limit: PAGE_SIZE,
  pageNumber: 1,
};

const PostCard = memo(
  ({ item, onPress }: { item: PostByUserData; onPress: () => void }) => {
    return (
      <TouchableOpacity
        onPress={onPress}
        key={item.id}
        className="p-4 bg-white rounded-lg shadow-sm gap-y-1.5"
      >
        <View className="flex-row gap-x-2">
          <Entypo name="location" size={16} color="black" />
          <BaseText fontWeight="medium">{item.title}</BaseText>
        </View>
        <BaseText className="text-gray-600 text-sm line-clamp-2">
          {item.content || "-"}
        </BaseText>
        {item.tags.length > 0 && (
          <View className="flex-row flex-wrap items-center gap-x-2">
            {item.tags.map((tag) => (
              <BaseText
                key={tag}
                className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full"
              >
                #{tag}
              </BaseText>
            ))}
          </View>
        )}
      </TouchableOpacity>
    );
  }
);

export default function RouteScreen() {
  const { handleShowError } = useAppContext();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStacksParamList>>();

  const flatListRef = useRef<FlatList>(null);

  const [searchText, setSearchText] = useState("");
  const [searchFilter, setSearchFilter] =
    useState<PostByUserParams>(DEFAULT_FILTER);
  const [sortBy, setSortBy] = useState("1");
  const [postList, setPostList] = useState<PostByUserData[]>([]);
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
    data: posts,
    isError: isPostsError,
    error: postsError,
    refetch: postsRefetch,
    isLoading: isPostsLoading,
  } = useFetchPostsByUser(searchFilter);
  useEffect(() => {
    if (!posts) return;

    if (searchFilter.pageNumber === 1) {
      setPostList(posts.data);
    } else {
      setPostList((prev) => [...prev, ...posts.data]);
    }
  }, [posts, searchFilter]);
  useEffect(() => {
    if (isPostsError) {
      console.error("Error fetching posts:", postsError);
      handleAxiosError(postsError, handleShowError);
    }
  }, [isPostsError, postsError]);

  const handleSearchSubmit = useCallback(() => {
    if (showFilter) setShowFilter(false);
    setSearchFilter((prev) => ({ ...prev, title: searchText, pageNumber: 1 }));
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
      const result = await postsRefetch();
      setPostList(result.data?.data ?? []);
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
    setSearchFilter(DEFAULT_FILTER);
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
        data={postList}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <PostCard
            item={item}
            onPress={() => {
              navigation.push("PostDetail", {
                communityId: item.id.toString(),
              });
            }}
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
        ListEmptyComponent={<BaseEmpty isLoading={isPostsLoading} />}
      />
    </View>
  );
}
