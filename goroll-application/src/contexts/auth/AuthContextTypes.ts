export type UserInfoType = {
  id: string;
  email: string;
  fullName: string;
  avatarUrl?: string;
  phoneNumber?: string;
  accessToken: string;
};

export type AuthContextType = {
  userInfo: UserInfoType | null;
  handleSetUserInfo: (userData: UserInfoType) => void;
  handleRemoveUserInfo: () => void;
  isSignIn: boolean;
  isLoading: boolean;
};
