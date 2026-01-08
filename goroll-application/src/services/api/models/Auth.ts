import { ENDPOINTS } from "../../../constants/endpoints";
import {
  LoginParams,
  LoginResponse,
  RegisterParams,
  RegisterResponse,
  CheckEmailResponse,
} from "../types/auth";
import axiosInstance from "../api";

export const authLogin = async (body?: LoginParams): Promise<LoginResponse> => {
  const { data } = await axiosInstance.post<LoginResponse>(
    ENDPOINTS.AUTH.LOGIN,
    body
  );

  return data;
};

export const authRegister = async (
  body?: RegisterParams
): Promise<RegisterResponse> => {
  const { data } = await axiosInstance.post<RegisterResponse>(
    ENDPOINTS.AUTH.REGISTER,
    body
  );

  return data;
};

export const authCheckEmail = async (
  email: string
): Promise<CheckEmailResponse> => {
  const { data } = await axiosInstance.post<CheckEmailResponse>(
    ENDPOINTS.AUTH.CHECK_EMAIL,
    { email }
  );

  return data;
};

export const authForgotPassword = async (email: string): Promise<void> => {
  await axiosInstance.post(ENDPOINTS.AUTH.FORGOT_PASSWORD, { email });
};

export const authGoogleOAuth = async (idToken: string): Promise<LoginResponse> => {
  const { data } = await axiosInstance.post<LoginResponse>(
    ENDPOINTS.AUTH.OAUTH,
    { idToken }
  );

  return data;
};
