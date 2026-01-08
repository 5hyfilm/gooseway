import React, { useEffect, useCallback, useState, useRef } from "react";
import {
  View,
  Image,
  ScrollView,
  TouchableOpacity,
  Platform,
  KeyboardAvoidingView,
  Keyboard,
  Share,
  Alert,
  Linking,
  TextInput,
} from "react-native";
import { useRoute, RouteProp, useNavigation } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import { RootStacksParamList } from "../../navigation/NavigationTypes";
import {
  AntDesign,
  Ionicons,
  Feather,
  FontAwesome,
  Entypo,
} from "@expo/vector-icons";
import { formatDate, formatDateTime } from "../../utils/time/FormatTimes";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "../../contexts/auth/AuthContext";
import PostSkeleton from "../../components/post/PostSkeleton";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import {
  useFetchPostById,
  useFetchCommentsByPostId,
  useLikePost,
  useCommentPost,
  useDeletePost,
  useBookMarkPost,
  useDeleteBookmarkPost,
  useUpdateComment,
} from "../../services/api/hooks/usePost";
import { useFollowUser } from "../../services/api/hooks/useUser";
import { useAppContext } from "../../contexts/app/AppContext";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";

import NoImage from "../../assets/no-image.png";
import BaseCarousel from "../../components/common/BaseCarousel";
import BaseText from "../../components/common/BaseText";
import BaseInput from "../../components/common/BaseInput";

import HeaderLayout from "../../layouts/HeaderLayout";
import { handleAxiosError } from "../../services/api/api";

type CommunityOrPostDetailRoute = RouteProp<
  RootStacksParamList,
  "CommunityDetail" | "PostDetail"
>;

export default function CommunityDetailScreen({
  manageAction = false,
}: {
  manageAction?: boolean;
}) {
  const route = useRoute<CommunityOrPostDetailRoute>();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStacksParamList>>();
  const { t, i18n } = useTranslation();
  const insets = useSafeAreaInsets();
  const { userInfo } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isKeyboardShow, setKeyboardShow] = useState(false);
  const [commentContent, setCommentContent] = useState("");
  const [editId, setEditId] = useState<number | null>(null);
  const [isEdit, setIsEdit] = useState<number | null>(null);
  const [editContent, setEditContent] = useState("");
  const { handleShowError } = useAppContext();

  const scrollViewRef = useRef<ScrollView>(null);
  const inputRef = useRef<TextInput>(null);

  const isValidUrl = (url: string) => {
    return url.startsWith("http://") || url.startsWith("https://");
  };

  const {
    data: postDetail,
    isError: isErrorPostDetail,
    error: errorPostDetail,
    isFetchedAfterMount: isPostDetailFetch,
    isFetching: isPostDetailFetching,
  } = useFetchPostById(route.params.communityId);
  useEffect(() => {
    if (isErrorPostDetail) {
      console.error("Error fetching post detail:", errorPostDetail);
      handleAxiosError(errorPostDetail, handleShowError);
    }
  }, [isErrorPostDetail, errorPostDetail]);
  useEffect(() => {
    if (postDetail && isPostDetailFetch) {
      setTimeout(() => {
        setIsLoading(false);
      }, 1000);
    }
  }, [postDetail, isPostDetailFetch]);

  const {
    data: comments,
    isError: isErrorComments,
    error: errorComments,
  } = useFetchCommentsByPostId(route.params.communityId);
  useEffect(() => {
    if (isErrorComments) {
      console.error("Error fetching comments:", errorComments);
      handleAxiosError(errorComments, handleShowError);
    }
  }, [isErrorComments, errorComments]);

  const likePostMutation = useLikePost();
  const followUserMutation = useFollowUser();
  const commentPostMutation = useCommentPost();
  const deletePostMutation = useDeletePost();
  const bookMarkPostMutation = useBookMarkPost();
  const deleteBookmarkPostMutation = useDeleteBookmarkPost();
  const updateCommentMutation = useUpdateComment();

  const handleBookMarkPost = useCallback(async () => {
    try {
      if (
        !postDetail ||
        bookMarkPostMutation.isPending ||
        deleteBookmarkPostMutation.isPending
      )
        return;
      if (postDetail.isBookMark) {
        await deleteBookmarkPostMutation.mutateAsync(route.params.communityId);
      } else {
        await bookMarkPostMutation.mutateAsync(route.params.communityId);
      }
    } catch (error) {
      console.error("Error bookmarking post:", error);
      handleAxiosError(error, handleShowError);
    }
  }, [bookMarkPostMutation, postDetail, route.params.communityId, deleteBookmarkPostMutation, handleShowError]);

  const handleLikePost = useCallback(async () => {
    try {
      if (!postDetail || likePostMutation.isPending) return;
      await likePostMutation.mutateAsync({
        postId: route.params.communityId,
        like: !postDetail.isLike,
      });
    } catch (error) {
      console.error("Error liking post:", error);
      handleAxiosError(error, handleShowError);
    }
  }, [likePostMutation, postDetail, route.params.communityId, handleShowError]);

  const handleFollowUser = useCallback(async () => {
    try {
      if (!postDetail || followUserMutation.isPending) return;
      await followUserMutation.mutateAsync({
        followingId: postDetail.user.id,
        follow: !postDetail.isFollowing,
      });
    } catch (error) {
      console.error("Error following user:", error);
      handleAxiosError(error, handleShowError);
    }
  }, [followUserMutation, postDetail, handleShowError]);

  const handleCommentPost = useCallback(async () => {
    if (!commentContent.trim() || commentPostMutation.isPending) return;
    try {
      await commentPostMutation.mutateAsync({
        postId: route.params.communityId,
        content: commentContent,
      });
      setCommentContent("");
      Keyboard.dismiss();
    } catch (error) {
      console.error("Error commenting on post:", error);
      handleAxiosError(error, handleShowError);
    }
  }, [commentContent, commentPostMutation, route.params.communityId, handleShowError]);

  const handleEditComment = useCallback(async () => {
    if (
      !editContent.trim() ||
      isEdit === null ||
      updateCommentMutation.isPending
    )
      return;
    try {
      await updateCommentMutation.mutateAsync({
        id: isEdit,
        content: editContent,
      });
      setIsEdit(null);
      setEditContent("");
    } catch (error) {
      console.error("Error updating comment:", error);
      handleAxiosError(error, handleShowError);
    }
  }, [editContent, isEdit, updateCommentMutation, handleShowError]);

  const handleDeletePost = useCallback(async () => {
    try {
      await deletePostMutation.mutateAsync(route.params.communityId);
      Alert.alert(t("main.success"), t("post.delete_post_success"));
      navigation.goBack();
    } catch (error) {
      console.error("Error deleting post:", error);
      handleAxiosError(error, handleShowError);
    }
  }, [deletePostMutation, route.params.communityId, navigation, handleShowError]);

  const promptDeletePost = useCallback(() => {
    Alert.alert(
      t("post.confirm_delete_post"),
      t("post.confirm_delete_post_description"),
      [
        {
          text: t("main.cancel"),
          style: "cancel",
        },
        {
          text: t("main.confirm"),
          onPress: () => {
            handleDeletePost();
          },
        },
      ]
    );
  }, [handleDeletePost, t]);

  const handleOpenMap = useCallback(async () => {
    try {
      if (!postDetail) return;
      const { latitude, longitude } = postDetail;
      const url =
        Platform.select({
          ios: `http://maps.apple.com/?q=${latitude},${longitude}`,
          android: `geo:${latitude},${longitude}?q=${latitude},${longitude}`,
        }) || "";
      await Linking.openURL(url);
    } catch (error) {
      console.error("Failed to open map:", error);
      handleAxiosError(error, handleShowError);
    }
  }, [postDetail, handleShowError]);

  const handleShare = useCallback(async () => {
    try {
      await Share.share({
        message: `${process.env.EXPO_PUBLIC_URL}/community/${route.params.communityId}`,
      });
    } catch (error) {
      console.error("Error sharing:", error);
      handleAxiosError(error, handleShowError);
    }
  }, [handleShowError]);

  useEffect(() => {
    const showListener = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow",
      () => setKeyboardShow(true)
    );

    const hideListener = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide",
      () => setKeyboardShow(false)
    );

    return () => {
      showListener.remove();
      hideListener.remove();
    };
  }, []);

  const ManagePostButton = () => {
    return (
      <View className="flex-row items-center gap-x-5">
        <TouchableOpacity
          onPress={() => {
            navigation.navigate("EditPost", {
              postId: route.params.communityId,
            });
          }}
        >
          <Feather name="edit" size={18} color="black" />
        </TouchableOpacity>
        <TouchableOpacity onPress={promptDeletePost}>
          <AntDesign name="delete" size={20} color="black" />
        </TouchableOpacity>
      </View>
    );
  };

  const SocialButton = () => {
    return (
      <View className="flex-row items-center gap-x-5">
        {postDetail?.latitude !== null && postDetail?.longitude !== null && (
          <TouchableOpacity onPress={handleOpenMap}>
            <Ionicons name="map-outline" size={20} color="black" />
          </TouchableOpacity>
        )}
        <TouchableOpacity onPress={handleShare}>
          <Feather name="share-2" size={20} color="black" />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <HeaderLayout
      headerTitle={t("post.post_detail")}
      isBorder
      customRightButton={manageAction ? <ManagePostButton /> : <SocialButton />}
    >
      <KeyboardAvoidingView
        className="flex-1 bg-white"
        behavior={isKeyboardShow ? "padding" : undefined}
      >
        <ScrollView
          className="bg-white py-4"
          ref={scrollViewRef}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{
            paddingBottom: isEdit ? insets.bottom + 16 : 16,
          }}
          onScroll={() => {
            if (editId) {
              setEditId(null);
            }
          }}
        >
          {isLoading ? (
            <PostSkeleton showHeader={route.name === "CommunityDetail"} />
          ) : (
            <View className="gap-y-4">
              {route.name !== "PostDetail" && (
                <View className="px-4 flex-row items-center justify-between gap-x-3">
                  <View className="flex-row items-center gap-x-3">
                    {postDetail?.user.avatarUrl &&
                    isValidUrl(postDetail?.user.avatarUrl) ? (
                      <Image
                        source={{ uri: postDetail.user.avatarUrl }}
                        className="w-10 h-10 rounded-full bg-gray-300"
                      />
                    ) : (
                      <View className="w-10 h-10 border border-gray-400 rounded-full items-center justify-center">
                        <AntDesign name="user" size={20} color="#9ca3af" />
                      </View>
                    )}
                    <View className="flex-col">
                      <BaseText className="text-sm" fontWeight="semibold">
                        {postDetail?.user.fullName || ""}
                      </BaseText>
                      <BaseText className="text-sm text-gray-500">
                        {formatDateTime(postDetail?.createdAt, i18n.language)}
                      </BaseText>
                    </View>
                  </View>
                  {userInfo?.id != postDetail?.userId && (
                    <TouchableOpacity
                      disabled={
                        followUserMutation.isPending || isPostDetailFetching
                      }
                      onPress={handleFollowUser}
                      className={`px-3 py-1 rounded-full ${
                        postDetail?.isFollowing
                          ? "bg-blue-600"
                          : "bg-white border border-blue-600"
                      }`}
                    >
                      <BaseText
                        className={`text-xs ${
                          postDetail?.isFollowing
                            ? "text-white"
                            : "text-blue-600"
                        }`}
                      >
                        {postDetail?.isFollowing
                          ? t("post.unfollow")
                          : t("post.follow")}
                      </BaseText>
                    </TouchableOpacity>
                  )}
                </View>
              )}
              <View className="px-4 gap-y-1">
                <BaseText className="text-xl" fontWeight="bold">
                  {postDetail?.title || ""}
                </BaseText>
                {route.name === "PostDetail" && (
                  <View className="flex-row gap-x-1.5">
                    <Feather name="calendar" size={14} color="#6b7280" />
                    <BaseText className="text-sm text-gray-500">
                      {formatDateTime(postDetail?.createdAt) || ""}
                    </BaseText>
                  </View>
                )}
              </View>
              <View className="w-full aspect-[4/3]">
                {postDetail?.images && postDetail.images.length > 0 ? (
                  <BaseCarousel
                    imgUrl={postDetail.images.map((img) => img.imageUrl)}
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
              <View className="px-4 gap-y-2">
                <BaseText className="text-gray-800">
                  {postDetail?.content || "-"}
                </BaseText>
                <View className="flex-row flex-wrap items-center gap-2">
                  {postDetail?.tags.map((item, index) => (
                    <View
                      key={index}
                      className="bg-gray-100 px-3 py-1.5 rounded-full"
                    >
                      <BaseText className="text-xs text-gray-600">
                        # {item.tag}
                      </BaseText>
                    </View>
                  ))}
                </View>
              </View>
              <View>
                <View className="px-4 py-3 flex-row items-center justify-between border-y border-gray-100">
                  <View className="flex-row items-center gap-2">
                    <TouchableOpacity
                      onPress={handleLikePost}
                      className="flex-row gap-x-1"
                      disabled={
                        likePostMutation.isPending ||
                        route.name === "PostDetail" ||
                        isPostDetailFetching
                      }
                    >
                      {postDetail?.isLike ? (
                        <AntDesign name="heart" size={14} color="#1f2937" />
                      ) : (
                        <AntDesign name="hearto" size={14} color="#1f2937" />
                      )}
                      <BaseText className="text-sm text-gray-800">
                        {postDetail?.likeCount || "0"}
                      </BaseText>
                    </TouchableOpacity>

                    <View className="flex-row gap-x-1">
                      <Ionicons
                        name="chatbubble-outline"
                        size={14}
                        color="#1f2937"
                      />
                      <BaseText className="text-sm text-gray-600">
                        {postDetail?.commentCount || "0"}
                      </BaseText>
                    </View>
                  </View>
                  <View className="flex-row items-center gap-2">
                    {route.name === "CommunityDetail" && (
                      <TouchableOpacity
                        onPress={handleBookMarkPost}
                        disabled={
                          bookMarkPostMutation.isPending ||
                          isPostDetailFetching ||
                          deleteBookmarkPostMutation.isPending
                        }
                      >
                        {postDetail?.isBookMark ? (
                          <FontAwesome
                            name="bookmark"
                            size={14}
                            color="#1f2937"
                          />
                        ) : (
                          <FontAwesome
                            name="bookmark-o"
                            size={14}
                            color="#1f2937"
                          />
                        )}
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
                {comments && comments.length > 0 ? (
                  comments.map((comment, index) => (
                    <View
                      key={comment.id}
                      className={`p-4 ${
                        comments.length !== index + 1 && "border-b"
                      } border-gray-100 flex-row justify-between gap-x-3`}
                    >
                      <View className="flex-row gap-x-3 flex-1">
                        {comment?.user.avatarUrl &&
                        isValidUrl(comment?.user.avatarUrl) ? (
                          <Image
                            source={{ uri: comment.user.avatarUrl }}
                            className="w-10 h-10 rounded-full bg-gray-300"
                          />
                        ) : (
                          <View className="w-10 h-10 border border-gray-400 rounded-full items-center justify-center">
                            <AntDesign name="user" size={20} color="#9ca3af" />
                          </View>
                        )}
                        <View className="flex-col gap-y-1 flex-1">
                          <View className="flex-row items-center gap-x-2">
                            <BaseText className="text-sm" fontWeight="semibold">
                              {comment.user.fullName || ""}
                            </BaseText>
                            <BaseText className="text-sm text-gray-500">
                              {formatDate(comment.createdAt, i18n.language)}
                            </BaseText>
                          </View>
                          {isEdit === comment.id ? (
                            <View
                              className="gap-y-2"
                              onLayout={() => {
                                setTimeout(() => {
                                  inputRef.current?.focus();
                                }, 500);
                              }}
                            >
                              <BaseInput
                                ref={inputRef}
                                multiline
                                numberOfLines={2}
                                value={editContent}
                                onChangeText={setEditContent}
                                className="bg-gray-100 rounded-lg px-4 py-2 min-h-28 tex-sm"
                                textAlignVertical="top"
                              />
                              <View className="flex-row items-center gap-x-2">
                                <TouchableOpacity
                                  className="px-4 py-2 rounded-lg bg-gray-300"
                                  disabled={updateCommentMutation.isPending}
                                  onPress={() => {
                                    setIsEdit(null);
                                    setEditContent("");
                                  }}
                                >
                                  <BaseText className="text-white text-sm">
                                    {t("main.cancel")}
                                  </BaseText>
                                </TouchableOpacity>
                                <TouchableOpacity
                                  className={`px-4 py-2 rounded-lg bg-blue-600 flex-row gap-x-2 ${
                                    updateCommentMutation.isPending
                                      ? "opacity-50"
                                      : ""
                                  }`}
                                  disabled={updateCommentMutation.isPending}
                                  onPress={handleEditComment}
                                >
                                  {updateCommentMutation.isPending && (
                                    <View className="animate-spin">
                                      <AntDesign
                                        name="loading1"
                                        size={14}
                                        color="white"
                                      />
                                    </View>
                                  )}
                                  <BaseText className="text-white text-sm">
                                    {t("main.confirm")}
                                  </BaseText>
                                </TouchableOpacity>
                              </View>
                            </View>
                          ) : (
                            <BaseText className="text-sm text-gray-800">
                              {comment.content || ""}
                            </BaseText>
                          )}
                        </View>
                      </View>
                      {userInfo?.id === comment.userId.toString() &&
                        !isEdit && (
                          <View className="relative flex-shrink-0">
                            <TouchableOpacity
                              className="p-1 rounded bg-gray-100 h-fit self-start"
                              onPress={() => {
                                if (editId === comment.id) {
                                  setEditId(null);
                                } else {
                                  setEditId(comment.id);
                                }
                              }}
                            >
                              <Entypo
                                name="dots-three-horizontal"
                                size={16}
                                color="#6b7280"
                              />
                            </TouchableOpacity>
                            {editId === comment.id && (
                              <View className="absolute top-7 right-0 w-24 bg-white border border-gray-200 rounded-lg shadow z-50 overflow-hidden">
                                <TouchableOpacity
                                  className={`py-1 px-2 border-b border-gray-200`}
                                  onPress={() => {
                                    setEditId(null);
                                    setIsEdit(comment.id);
                                    setEditContent(comment.content);
                                  }}
                                >
                                  <BaseText className={`text-sm text-gray-700`}>
                                    {t("main.edit")}
                                  </BaseText>
                                </TouchableOpacity>
                              </View>
                            )}
                          </View>
                        )}
                    </View>
                  ))
                ) : (
                  <BaseText className="text-sm text-gray-500 py-5 mx-auto">
                    {t("main.no_data")}
                  </BaseText>
                )}
              </View>
            </View>
          )}
        </ScrollView>
        {route.name !== "PostDetail" && !isEdit && (
          <View
            className="bg-white px-4 pt-4 border-t border-gray-100 flex-row items-center gap-x-3"
            style={{
              paddingBottom: isKeyboardShow ? 16 : insets.bottom + 16,
            }}
          >
            <BaseInput
              placeholder={t("post.add_comment")}
              multiline
              numberOfLines={4}
              value={commentContent}
              onChangeText={setCommentContent}
              className="bg-gray-100 rounded-lg px-4 py-2 max-h-28 flex-1"
              textAlignVertical="top"
              onFocus={() => {
                setTimeout(() => {
                  scrollViewRef.current?.scrollToEnd({ animated: true });
                }, 100);
              }}
            />
            <TouchableOpacity
              disabled={!commentContent.trim() || commentPostMutation.isPending}
              className={`px-4 py-2 rounded-lg flex-shrink-0 ${
                !commentContent.trim() || commentPostMutation.isPending ? "bg-gray-300" : "bg-blue-600"
              }`}
              onPress={handleCommentPost}
            >
              {commentPostMutation.isPending ? (
                <Animated.View
                  entering={FadeIn}
                  exiting={FadeOut}
                >
                  <View className="animate-spin">
                    <AntDesign name="loading1" size={16} color="#fff" />
                  </View>
                </Animated.View>
              ) : (
                <Feather name="send" size={16} color="#fff" />
              )}
            </TouchableOpacity>
          </View>
        )}
      </KeyboardAvoidingView>
    </HeaderLayout>
  );
}
