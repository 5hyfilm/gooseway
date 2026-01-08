import {
  CreatePostParams,
  LikePostParams,
  CommentPostParams,
  UpdatePostParams,
  PostFilter,
  PostDetailResponse,
  PostCategory,
  CommentResponse,
  PostByUserParams,
  PostByUserResponse,
  PostBookmarkParams,
  PostBookmarkResponse,
  UpdateComment,
} from "../types/post";
import {
  createPost,
  likePost,
  commentPost,
  updatePost,
  getPosts,
  getPostCategories,
  getPostById,
  getCommentsByPostId,
  getPostsByUser,
  deletePost,
  bookMarkPost,
  deleteBookmarkPost,
  getPostBookmark,
  updateComment,
} from "../models/Post";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useCreatePost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CreatePostParams) => createPost(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["postDetail"], exact: false });
      queryClient.invalidateQueries({ queryKey: ["userProfile"], exact: false });
    },
  });
};

export const useLikePost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: LikePostParams) => likePost(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["postDetail"], exact: false });
    },
  });
};

export const useCommentPost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CommentPostParams) => commentPost(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["postDetail"], exact: false });
      queryClient.invalidateQueries({ queryKey: ["comments"], exact: false });
    },
  });
};

export const useUpdatePost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: UpdatePostParams) => updatePost(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"], exact: false });
      queryClient.invalidateQueries({ queryKey: ["postsByUser"], exact: false });
      queryClient.invalidateQueries({ queryKey: ["postDetail"], exact: false });
      queryClient.invalidateQueries({ queryKey: ["userProfile"], exact: false });
    },
  });
};

export const useFetchPosts = () => {
  return useMutation({
    mutationKey: ["posts"],
    mutationFn: (filter: PostFilter) => getPosts(filter),
  });
};

export const useFetchPostCategories = () => {
  return useQuery<PostCategory[]>({
    queryKey: ["postCategories"],
    queryFn: () => getPostCategories(),
  });
};

export const useFetchPostById = (postId: string) => {
  return useQuery<PostDetailResponse>({
    queryKey: ["postDetail", postId],
    queryFn: () => getPostById(postId),
    enabled: !!postId,
  });
};

export const useFetchCommentsByPostId = (postId: string) => {
  return useQuery<CommentResponse[]>({
    queryKey: ["comments"],
    queryFn: () => getCommentsByPostId(postId),
    enabled: !!postId,
  });
};

export const useFetchPostsByUser = (params: PostByUserParams) => {
  return useQuery<PostByUserResponse>({
    queryKey: ["postsByUser", params],
    queryFn: () => getPostsByUser(params),
  });
};

export const useDeletePost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (postId: string) => deletePost(postId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"], exact: false });
      queryClient.invalidateQueries({ queryKey: ["postsByUser"], exact: false });
      queryClient.invalidateQueries({ queryKey: ["userProfile"], exact: false });
    },
  });
};

export const useBookMarkPost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (postId: string) => bookMarkPost(postId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["postDetail"], exact: false });
    },
  });
};

export const useDeleteBookmarkPost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (postId: string) => deleteBookmarkPost(postId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["postDetail"], exact: false });
    },
  });
};

export const useFetchPostBookmark = (
  params: PostBookmarkParams,
  enabled: boolean = true
) => {
  return useQuery<PostBookmarkResponse>({
    queryKey: ["postBookmark", params],
    queryFn: () => getPostBookmark(params),
    enabled,
  });
};

export const useUpdateComment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: UpdateComment) => updateComment(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments"], exact: false });
      queryClient.invalidateQueries({ queryKey: ["postDetail"], exact: false });
    },
  });
};
