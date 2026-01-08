import apiFetch from "../api";
import { 
  PostDetail, 
  PostFindAllBody, 
  PostFindAllResult, 
  CreatePostBody, 
  updatePostBody,
  Category,
  PostUser,
  PostUserComment,
 } from "@/lib/types/community";

export const findAllPosts = async (body: PostFindAllBody): Promise<PostFindAllResult> => {
  const response = await apiFetch.post("/post/admin/findAll", body);
  return response.data;
}

export const getPostsCategory = async (): Promise<Array<Category>> => {
  const response = await apiFetch.get("/postCategory/findAll");
  return response.data;
}

export const findPostById = async (id: number): Promise<PostDetail> => {
  const response = await apiFetch.get(`/post/admin/findById/${id}`);
  return response.data;
};

export const deletePost = async (id: number): Promise<void> => {
  await apiFetch.delete(`/post/admin/delete/${id}`);
}

export const deleteComment = async (id: number): Promise<void> => {
  await apiFetch.delete(`/post/admin/delete/comment/${id}`);
}

export const createPost = async (post: CreatePostBody): Promise<CreatePostBody> => {
  const response = await apiFetch.post("/post/admin/insert", post);
  return response.data;
};

export const updatePost = async (post: updatePostBody): Promise<updatePostBody> => {
  const response = await apiFetch.post("/post/admin/update", post);
  return response.data;
};

export const exportPosts = async (): Promise<ArrayBuffer> => {
  const response = await apiFetch.post("/post/admin/export", {}, {
    responseType: "arraybuffer",
  });
  return response.data;
};

export const findPostByIdForUser = async (id: number): Promise<PostUser> => {
  const response = await apiFetch.get(`/post/findShareById/${id}`);
  return response.data;
}

export const findCommentsByPostId = async (postId: number): Promise<Array<PostUserComment>> => {
  const response = await apiFetch.get(`/post/findComment/${postId}`);
  return response.data;
}