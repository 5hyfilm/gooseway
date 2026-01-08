export type LoginParams = {
  email: string;
  password: string;
};

export type UserData = {
  id: string;
  email: string;
  fullName: string;
  phoneNumber: string;
  avatarUrl: string | null;
};

export type LoginResponse = {
  message: string;
  accessToken: string;
  user: UserData;
};

export type RegisterParams = {
  email: string;
  password: string;
  fullName: string;
  phoneNumber: string;
};

export type NewUserData = UserData & {
  roleId: string;
  statusId: string;
  passwordHash: string;
  updatedAt: string;
  createdAt: string;
  updatedBy: string | null;
  createdBy: string | null;
};

export type RegisterResponse = {
  accessToken: string;
  newUser: NewUserData;
};

type AuthProvider = {
  providerName: string;
};

export type CheckEmailResponse = {
  id: string;
  email: string;
  authProviders: AuthProvider[];
};
