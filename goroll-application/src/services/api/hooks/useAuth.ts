import { LoginParams, RegisterParams } from "../types/auth";
import { authLogin, authRegister, authCheckEmail,authForgotPassword } from "../models/Auth";
import { useMutation } from "@tanstack/react-query";

export const useLoginUsers = () => {
  return useMutation({
    mutationFn: (body: LoginParams) => authLogin(body),
  });
};

export const useRegisterUsers = () => {
  return useMutation({
    mutationFn: (body: RegisterParams) => authRegister(body),
  });
};

export const useCheckEmail = () => {
  return useMutation({
    mutationFn: (email: string) => authCheckEmail(email),
  });
};

export const useForgotPassword = () => {
  return useMutation({
    mutationFn: (email: string) => authForgotPassword(email),
  });
};
