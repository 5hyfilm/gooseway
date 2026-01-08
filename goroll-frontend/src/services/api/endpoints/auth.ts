import apiFetch from "../api";

export type UserData = {
  id: number;
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

export const handleLogin = async (
  email: string,
  password: string
): Promise<LoginResponse> => {
  const response = await apiFetch.post("/auth/login", {
    email,
    password,
  });
  return response.data;
}

export const resetPassword = async (
  token: string,
  newPassword: string,
): Promise<{ message: string }> => {
  const response = await apiFetch.post("/auth/resetPassword", {
    token,
    newPassword,
  });

  return response.data;
}