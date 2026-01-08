// src/lib/types/community.ts

// User Type
export interface User {
  id: number;
  fullName: string;
  avatarUrl?: string;
  roleId?: number;
}

// Category Type
export interface Category {
  id: number;
  nameEn: string;
  nameTh?: string;
}

// Tag Type
export interface Tag {
  postId: number;
  tag: string;
}

//Comment Type
export interface Comment {
  id: number;
  postId: number;
  userId: number;
  content: string;
  createdAt: string;
  updatedAt: string;
  user: User;
}

// Image Type
export interface Image {
  id: number;
  imageUrl: string;
}

export interface Post {
  id: number;
  userId: number;
  title: string;
  content: string;
  categoryId: number;
  statusId: number;
  latitude: string | null;
  longitude: string | null;
  createdAt: string;
  updatedAt: string;
  likeCount: string;
  commentCount: string;
  user: User;
  category: Category;
}

export interface PostDetail extends Post {
  comments?: Comment[];
  tags?: Tag[];
  images?: Image[];
}

// Type for API response
type SortBy = {
  column: string;
  direction: "asc" | "desc";
};

export type PostFindAllBody = {
  title: string;
  sortBy: SortBy[];
  limit: number;
  pageNumber: number;
};

export type PostFindAllResult = {
  data: Post[];
  total: number;
};

export interface CreatePostBody {
  title: string;
  content: string;
  categoryId: number;
  statusId: number | null;
  latitude: string | null;
  longitude: string | null;
  tag: string[];
  imageUrl: string[];
}

export type updatePostBody = {
  id: number;
  userId: number;
  title: string;
  content: string;
  categoryId: number;
  statusId: number;
  latitude: string | null;
  longitude: string | null;
  createdAt: string;
  updatedAt: string;
  likeCount: string;
  commentCount: string;
  tagsDelete: string[];
  tagsAdd: {
    tag: string;
  }[];
  imgPostDelete: number[];
  imgPostAdd: {
    imageUrl: string;
  }[];
}

export type PostUser = {
  id: number;
  userId: number;
  title: string;
  content: string;
  categoryId: number;
  statusId: number;
  latitude: string | null;
  longitude: string | null;
  createdAt: string;
  updatedAt: string;
  likeCount: string;
  commentCount: string;
  isFollowing: boolean;
  isLike: boolean;
  user: User;
  category: Category;
  tags: Tag[];
  images: Image[];
  comments: Comment[];
}

export type PostUserComment = {
  id: number;
  postId: number;
  userId: number;
  content: string;
  createdAt: string;
  updatedAt: string;
  user: User;
}