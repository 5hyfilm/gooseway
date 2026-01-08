import React, {
  useEffect,
  useState,
  useCallback,
  useMemo,
  useRef,
} from "react";
import {
  View,
  FlatList,
  ActivityIndicator,
  Image,
  TouchableOpacity,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { AntDesign, Ionicons, Feather } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStacksParamList } from "../../navigation/NavigationTypes";
import { useAppContext } from "../../contexts/app/AppContext";

import BaseEmpty from "../../components/common/BaseEmpty";

import {
  useFetchPosts,
  useFetchPostCategories,
} from "../../services/api/hooks/usePost";
import {
  PostFilter,
  PostData,
  PostCategory,
} from "../../services/api/types/post";

import FormInput from "../../components/form/FormInput";
import BaseText from "../../components/common/BaseText";
import { handleAxiosError } from "../../services/api/api";

import NoImage from "../../assets/no-image.png";
import { i18n } from "i18next";

const PAGE_SIZE = 10;
const DEFAULT_FILTER: PostFilter = {
  follower: false,
  isBookMark: false,
  title: "",
  categoryId: "",
  sort: "",
  limit: PAGE_SIZE,
  pageNumber: 1,
};

function PostCard(item: PostData) {
  const isValidUrl = (url: string) => {
    return url.startsWith("http://") || url.startsWith("https://");
  };
  return (
    <View className="bg-white rounded-lg overflow-hidden flex-1 flex-col justify-between gap-y-2 shadow">
      <View className="gap-y-2">
        <View className="w-full aspect-square bg-gray-100">
          {item.images && item.images.length > 0 ? (
            <Image
              source={
                item.images[0].imageUrl && isValidUrl(item.images[0].imageUrl)
                  ? { uri: item.images[0].imageUrl }
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
        <View className="px-1">
          <View className="flex-row items-center gap-2">
            <BaseText className="text-sm" fontWeight="medium">
              {item.user.fullName}
            </BaseText>
          </View>
          <BaseText className="text-xs text-gray-500 line-clamp-2">
            {item.content}
          </BaseText>
        </View>
      </View>
      <View className="px-1 pb-2">
        <View className="flex-row items-center gap-2">
          <View className="flex-row gap-x-1">
            <AntDesign name="hearto" size={12} color="#4b5563" />
            <BaseText className="text-xs text-gray-600">
              {item.likeCount}
            </BaseText>
          </View>
          <View className="flex-row gap-x-1">
            <Ionicons name="chatbubble-outline" size={12} color="#4b5563" />
            <BaseText className="text-xs text-gray-600">
              {item.commentCount}
            </BaseText>
          </View>
        </View>
      </View>
    </View>
  );
}

function CategoryTabsHeader({
  i18n,
  categories,
  selectedId,
  onSelectCategory,
}: {
  i18n: i18n;
  categories: PostCategory[];
  selectedId: string;
  onSelectCategory: (id: string) => void;
}) {
  const fullCategoryList = useMemo(
    () => [{ id: "", nameEn: "All", nameTh: "ทั้งหมด" }, ...categories],
    [categories]
  );

  return (
    <FlatList
      horizontal
      data={fullCategoryList}
      keyExtractor={(item) => item.id.toString()}
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 12, paddingVertical: 8 }}
      ItemSeparatorComponent={() => <View style={{ width: 4 }} />}
      renderItem={({ item }) => {
        const isActive = item.id.toString() === selectedId;

        return (
          <TouchableOpacity
            onPress={() => onSelectCategory(item.id.toString())}
            className={`px-4 py-1.5 rounded-full h-fit ${
              isActive ? "bg-blue-500" : "bg-gray-100"
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

export default function CommunityScreen() {
  const { handleShowError } = useAppContext();
  const insets = useSafeAreaInsets();
  const { t, i18n } = useTranslation();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStacksParamList>>();

  const flatListRef = useRef<FlatList>(null);

  const [postList, setPostList] = useState<PostData[]>([]);
  const [totalPost, setTotalPost] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [searchFilter, setSearchFilter] = useState<PostFilter>(DEFAULT_FILTER);
  const [showFilter, setShowFilter] = useState(false);

  const sortOptions = [
    {
      label: t("post.most_recent"),
      value: "1",
      data: "mostRecent",
    },
    {
      label: t("post.most_liked"),
      value: "2",
      data: "mostLike",
    },
    {
      label: t("post.most_commented"),
      value: "3",
      data: "mostComment",
    },
  ];

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
  }, [isCategoriesError, categoriesError]);
  const postMutation = useFetchPosts();

  const handleSearchSubmit = useCallback(() => {
    if (showFilter) {
      setShowFilter(false);
    }
    setSearchFilter((prev) => ({
      ...prev,
      title: searchText,
      pageNumber: 1,
    }));
  }, [setSearchFilter, searchText]);

  const handleSelectCategory = useCallback(
    (id: string) => {
      if (isLoading || isRefreshing || isFetchingMore) return;
      flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
      if (showFilter) {
        setShowFilter(false);
      }
      setSearchFilter((prev) => ({
        ...prev,
        categoryId: id,
        pageNumber: 1,
      }));
    },
    [setSearchFilter, isLoading, isRefreshing, isFetchingMore]
  );

  const handleFetchPosts = useCallback(
    async (isLoadMore = false) => {
      if (isLoading || isFetchingMore) return;

      if (isLoadMore) {
        setIsFetchingMore(true);
      } else if (!isLoadMore && !isRefreshing) {
        setIsLoading(true);
      }

      try {
        const response = await postMutation.mutateAsync(searchFilter);

        if (isLoadMore) {
          setPostList((prev) => [...prev, ...response.data]);
        } else {
          setPostList(response.data);
        }

        setTotalPost(response.total);
      } catch (error) {
        console.error("Error fetching posts:", error);
        handleAxiosError(error, handleShowError);
      } finally {
        setIsRefreshing(false);
        isLoadMore ? setIsFetchingMore(false) : setIsLoading(false);
      }
    },
    [postMutation, searchFilter, isLoading, isFetchingMore, isRefreshing, handleShowError]
  );

  const handleNextPage = useCallback(() => {
    const hasMore = postList.length < totalPost;

    if (hasMore) {
      setSearchFilter((prev) => ({
        ...prev,
        pageNumber: prev.pageNumber + 1,
      }));
    }
  }, [setSearchFilter, postList.length, totalPost]);

  const handleRefresh = useCallback(() => {
    if (isLoading || isRefreshing) return;
    flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
    setIsRefreshing(true);
    setSearchFilter((prev) => ({
      ...prev,
      pageNumber: 1,
    }));
    if (searchFilter.pageNumber === 1) {
      handleFetchPosts();
    }
  }, [isLoading, isRefreshing, searchFilter.pageNumber, handleFetchPosts]);

  useEffect(() => {
    handleFetchPosts(searchFilter.pageNumber > 1);
  }, [searchFilter]);

  return (
    <View className="flex-1 bg-white">
      <View
        style={{ paddingTop: insets.top }}
        className="bg-white border-b border-gray-200 px-4 gap-y-4"
      >
        <View className="flex-row items-center gap-x-2">
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
              onFocus={() => {
                if (showFilter) {
                  setShowFilter(false);
                }
              }}
            />
          </View>
          <View className="relative flex-shrink-0 ">
            <TouchableOpacity
              onPress={() => setShowFilter((prev) => !prev)}
              className="p-3 rounded-lg border border-gray-300"
            >
              <Feather name="filter" size={20} color="#4b5563" />
            </TouchableOpacity>
            {showFilter && (
              <View className="absolute top-14 right-0 w-40 bg-white border border-gray-200 rounded-lg shadow z-50 overflow-hidden">
                {sortOptions.map((option, index) => (
                  <TouchableOpacity
                    key={option.value}
                    onPress={() => {
                      setSearchFilter((prev) => ({
                        ...prev,
                        sort: option.data as PostFilter["sort"],
                        pageNumber: 1,
                      }));
                      setShowFilter(false);
                      flatListRef.current?.scrollToOffset({
                        offset: 0,
                        animated: true,
                      });
                    }}
                    className={`p-3 ${
                      index + 1 !== sortOptions.length && "border-b"
                    } border-gray-200 ${
                      option.data === searchFilter.sort ? "bg-blue-50" : ""
                    }`}
                  >
                    <BaseText
                      className={`text-sm ${
                        option.data === searchFilter.sort
                          ? "text-blue-500"
                          : "text-gray-700"
                      }`}
                    >
                      {option.label}
                    </BaseText>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        </View>
        <View className="flex-row items-center justify-center gap-x-4">
          <TouchableOpacity
            disabled={isLoading || isRefreshing || isFetchingMore}
            onPress={() => {
              flatListRef.current?.scrollToOffset({
                offset: 0,
                animated: true,
              });
              setSearchFilter({
                ...DEFAULT_FILTER,
                follower: true,
              });
              setSearchText("");
            }}
            className={`${
              searchFilter.follower &&
              !searchFilter.isBookMark &&
              "border-b-2 border-blue-500 -mb-0.5"
            } px-1 pb-1.5`}
          >
            <BaseText
              className={`text-sm ${
                searchFilter.follower && !searchFilter.isBookMark
                  ? "text-blue-500"
                  : "text-gray-500"
              }`}
              fontWeight={
                searchFilter.follower && !searchFilter.isBookMark
                  ? "bold"
                  : undefined
              }
            >
              {t("post.following")}
            </BaseText>
          </TouchableOpacity>
          <TouchableOpacity
            disabled={isLoading || isRefreshing || isFetchingMore}
            onPress={() => {
              flatListRef.current?.scrollToOffset({
                offset: 0,
                animated: true,
              });
              setSearchFilter({
                ...DEFAULT_FILTER,
                follower: false,
              });
              setSearchText("");
            }}
            className={`${
              !searchFilter.follower &&
              !searchFilter.isBookMark &&
              "border-b-2 border-blue-500 -mb-0.5"
            } px-1 pb-1.5`}
          >
            <BaseText
              className={`text-sm ${
                !searchFilter.follower && !searchFilter.isBookMark
                  ? "text-blue-500"
                  : "text-gray-500"
              }`}
              fontWeight={
                !searchFilter.follower && !searchFilter.isBookMark
                  ? "bold"
                  : undefined
              }
            >
              {t("post.for_you")}
            </BaseText>
          </TouchableOpacity>
          <TouchableOpacity
            disabled={isLoading || isRefreshing || isFetchingMore}
            onPress={() => {
              flatListRef.current?.scrollToOffset({
                offset: 0,
                animated: true,
              });
              setSearchFilter({
                ...DEFAULT_FILTER,
                follower: false,
                isBookMark: true,
              });
              setSearchText("");
            }}
            className={`${
              searchFilter.isBookMark && "border-b-2 border-blue-500 -mb-0.5"
            } px-1 pb-1.5`}
          >
            <BaseText
              className={`text-sm ${
                searchFilter.isBookMark ? "text-blue-500" : "text-gray-500"
              }`}
              fontWeight={searchFilter.isBookMark ? "bold" : undefined}
            >
              {t("post.bookmarks")}
            </BaseText>
          </TouchableOpacity>
        </View>
      </View>

      <View className="flex-1">
        <View className="flex-shrink-0">
          <CategoryTabsHeader
            i18n={i18n}
            categories={postCategories || []}
            selectedId={searchFilter.categoryId}
            onSelectCategory={handleSelectCategory}
          />
        </View>
        <FlatList
          ref={flatListRef}
          onScroll={() => {
            if (showFilter) {
              setShowFilter(false);
            }
          }}
          data={postList}
          keyExtractor={(item) => item.id.toString()}
          numColumns={2}
          columnWrapperStyle={{
            justifyContent: "space-between",
            paddingHorizontal: 12,
          }}
          ListHeaderComponent={() =>
            isLoading && !isRefreshing ? (
              <ActivityIndicator
                size="large"
                color="#2563eb"
                className="py-4"
              />
            ) : null
          }
          contentContainerStyle={{ paddingBottom: 8, flexGrow: 1 }}
          renderItem={({ item }) => (
            <View className="w-1/2 px-1 pb-2">
              <TouchableOpacity
                className="shadow-sm flex-1"
                onPress={() =>
                  navigation.navigate("CommunityDetail", {
                    communityId: item.id,
                  })
                }
              >
                <PostCard {...item} />
              </TouchableOpacity>
            </View>
          )}
          onEndReachedThreshold={0.5}
          onEndReached={() => {
            if (!isLoading && !isRefreshing && !isFetchingMore) {
              handleNextPage();
            }
          }}
          ListFooterComponent={
            isFetchingMore ? (
              <ActivityIndicator
                size="large"
                color="#2563eb"
                className="py-4"
              />
            ) : null
          }
          refreshing={isRefreshing}
          onRefresh={handleRefresh}
          ListEmptyComponent={
            <BaseEmpty isLoading={isLoading} haveLoading={false} />
          }
        />
      </View>
    </View>
  );
}
