import { ENDPOINTS } from "../../../constants/endpoints";
import axiosInstance from "../api";
import {
  CreatePostParams,
  LikePostParams,
  CommentPostParams,
  UpdatePostParams,
  PostResponse,
  PostFilter,
  PostCategory,
  PostDetailResponse,
  CommentResponse,
  PostByUserParams,
  PostByUserResponse,
  PostBookmarkParams,
  PostBookmarkResponse,
  UpdateComment
} from "../types/post";

export const createPost = async (body: CreatePostParams) => {
  await axiosInstance.post(ENDPOINTS.POST.CREATE_POST, body);
};

export const likePost = async (body: LikePostParams) => {
  await axiosInstance.post(ENDPOINTS.POST.LIKE_POST, body);
};

export const commentPost = async (body: CommentPostParams) => {
  await axiosInstance.post(ENDPOINTS.POST.COMMENT_POST, body);
};

export const updatePost = async (body: UpdatePostParams) => {
  await axiosInstance.post(ENDPOINTS.POST.UPDATE_POST, body);
};

export const getPosts = async (body: PostFilter): Promise<PostResponse> => {
  const { data } = await axiosInstance.post<PostResponse>(
    ENDPOINTS.POST.GET_POSTS,
    body
  );
  return data;
};

export const getPostCategories = async (): Promise<PostCategory[]> => {
  const { data } = await axiosInstance.get<PostCategory[]>(
    ENDPOINTS.POST.GET_POST_CATEGORIES
  );
  return data;
};

export const getPostById = async (
  postId: string
): Promise<PostDetailResponse> => {
  const { data } = await axiosInstance.get<PostDetailResponse>(
    `${ENDPOINTS.POST.GET_POST_BY_ID}/${postId}`
  );
  return data;
};

export const getCommentsByPostId = async (
  postId: string
): Promise<CommentResponse[]> => {
  const { data } = await axiosInstance.get<CommentResponse[]>(
    `${ENDPOINTS.POST.GET_COMMENTS_BY_POST_ID}/${postId}`
  );
  return data;
};

export const getPostsByUser = async (
  params: PostByUserParams
): Promise<PostByUserResponse> => {
  const { data } = await axiosInstance.post<PostByUserResponse>(
    ENDPOINTS.POST.GET_POSTS_BY_USER,
    params
  );
  return data;
};

export const deletePost = async (postId: string) => {
  await axiosInstance.delete(`${ENDPOINTS.POST.DELETE_POST}/${postId}`);
};

export const bookMarkPost = async (postId: string) => {
  await axiosInstance.post(ENDPOINTS.POST.BOOKMARK_POST, { postId });
};

export const deleteBookmarkPost = async (postId: string) => {
  await axiosInstance.delete(`${ENDPOINTS.POST.DELETE_BOOKMARK_POST}/${postId}`);
};

export const getPostBookmark = async (
  params: PostBookmarkParams
): Promise<PostBookmarkResponse> => {
  const { data } = await axiosInstance.post<PostBookmarkResponse>(
    ENDPOINTS.POST.GET_POST_BOOKMARK,
    params
  );
  return data;
};

export const updateComment = async (body: UpdateComment) => {
  await axiosInstance.post(ENDPOINTS.POST.UPDATE_COMMENT, body);
};
