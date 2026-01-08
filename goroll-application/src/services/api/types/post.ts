export type User = {
  id: number;
  fullName: string;
  avatarUrl: string | null;
};

export type CreatePostParams = {
  title: string;
  content?: string;
  categoryId: number;
  statusId: number;
  latitude?: number | null;
  longitude?: number | null;
  tag: string[];
  imageUrl: string[];
};

export type LikePostParams = {
  postId: string;
  like: boolean;
};

export type CommentPostParams = {
  postId: string;
  content: string;
};

export type PostFilter = {
  follower: boolean;
  isBookMark: boolean;
  title: string;
  categoryId: string;
  sort: "mostComment" | "mostLike" | "mostRecent" | "";
  limit: number;
  pageNumber: number;
};

export type PostData = {
  id: number;
  userId: number;
  title: string;
  content: string;
  categoryId: number;
  statusId: number;
  latitude: number | null;
  longitude: number | null;
  createdAt: string;
  updatedAt: string;
  likeCount: string;
  commentCount: string;
  user: {
    id: number;
    fullName: string;
  };
  category: {
    id: number;
    nameEn: string;
    nameTh: string;
  };
  tags: {
    postId: number;
    tag: string;
  }[];
  images: {
    id: number;
    imageUrl: string;
  }[];
};

export type PostResponse = {
  data: PostData[];
  total: number;
};

export type PostCategory = {
  id: number | string;
  nameEn: string;
  nameTh: string;
};

export type PostDetailResponse = {
  id: number;
  userId: number;
  title: string;
  content: string;
  categoryId: number;
  statusId: number;
  isBookMark: boolean;
  isFollowing: boolean;
  isLike: boolean;
  latitude: number | null;
  longitude: number | null;
  createdAt: string;
  updatedAt: string;
  likeCount: string;
  commentCount: string;
  user: User;
  category: {
    id: number;
    nameEn: string;
    nameTh: string;
  };
  tags: {
    postId?: number;
    tag: string;
    isNew?: boolean;
  }[];
  images: {
    id?: number;
    imageUrl: string;
    isNew?: boolean;
  }[];
};

export type CommentResponse = {
  id: number;
  postId: number;
  userId: number;
  content: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: number;
    fullName: string;
    avatarUrl: string | null;
  };
};

type SortOption = {
  column: string;
  direction: string;
};

export type PostByUserParams = {
  title: string;
  sortBy: SortOption[];
  limit: number;
  pageNumber: number;
};

export type PostByUserData = {
  id: number;
  title: string;
  content: string;
  createdAt: string;
  tags: string[];
};
export type PostByUserResponse = {
  data: PostByUserData[];
  total: number;
};

type UpdateTag = {
  tag: string;
};

export type UpdateImagePost = {
  imageUrl: string;
};

export type EditTags = {
  oldTag: string;
  newTag: string;
};

export type UpdatePostParams = {
  id: number;
  userId: number;
  title: string;
  content?: string;
  categoryId: number;
  latitude?: number | null;
  longitude?: number | null;
  tagsDelete?: string[];
  tagsAdd?: UpdateTag[];
  tagsEdit?: EditTags[];
  imgPostDelete?: string[];
  imgPostAdd?: UpdateImagePost[];
};

type SortBy = {
  column: string;
  direction: string;
};

export type PostBookmarkParams = {
  title: string;
  sortBy: SortBy[];
  limit: number;
  pageNumber: number;
};

type PostBookmark = {
  id: number;
  title: string;
  content: string;
  createdAt: string;
  user: User;
};


type PostBookmarkItem = {
  id: number;
  postId: number;
  userId: number;
  createdAt: string;
  post: PostBookmark;
};

export type PostBookmarkResponse = {
  data: PostBookmarkItem[];
  total: number;
};

export type UpdateComment = {
  id: number;
  content: string;
};