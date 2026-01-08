import axios, { AxiosInstance, isAxiosError, AxiosError } from "axios";
import { userStorge } from "../../utils/storage/userStorage";
import { API_BASE_URL } from "../../constants/api";
import i18n from "../../languages/i18n";
import { QueryClient } from "@tanstack/react-query";

function toError(err: unknown): Error {
  return err instanceof Error ? err : new Error(String(err));
}

const apiClient = axios.create({
  baseURL: API_BASE_URL(),
  headers: {
    "ngrok-skip-browser-warning": "any",
  },
});

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {},
    mutations: {
      networkMode: "always",
    },
  },
});

export const attachInterceptors = async (
  client: AxiosInstance,
  onAuthError: () => void
) => {
  client.interceptors.request.use(
    async (config) => {
      const userData = await userStorge.getUserStorage();
      const acccessToken = userData?.accessToken;
      if (acccessToken) {
        config.headers.Authorization = `Bearer ${acccessToken}`;
      }
      if (config.params) {
        config.params = removeEmptyStrings(config.params);
      }
      if (
        config.data &&
        typeof config.data === "object" &&
        !Array.isArray(config.data) &&
        !(config.data instanceof FormData)
      ) {
        config.data = removeEmptyStrings(config.data);
      }
      return config;
    },
    (error) => Promise.reject(toError(error))
  );

  client.interceptors.response.use(
    (response) => response,
    async (error) => {
      const status = error.response?.status;

      if (status === 401 || status === 403) {
        onAuthError();
        return Promise.reject(toError(error));
      }

      return Promise.reject(toError(error));
    }
  );
};

export default apiClient;

export const handleAxiosError = (
  error: unknown,
  handleShowError: (title: string, message: string) => void
) => {
  const err = error as Error | AxiosError;
  if (isAxiosError(err)) {
    if (err.response?.data?.message) {
      const { response } = err;
      console.error(`API Error ${response.status} : `, response.data.message);
      handleShowError(`${i18n.t("main.error")} ${response.status}`, response.data.message || i18n.t("main.error_occurred"));
    } else {
      console.error(`API Error ${err.status} : `, err.message);
      handleShowError(`${i18n.t("main.error")} ${err.status}`, err.message || i18n.t("main.error_occurred"));
    }
  } else {
    console.error("API Error : ", err.message);
    handleShowError(`${i18n.t("main.unexpected_error")}`, err.message || i18n.t("main.error_occurred"));
  }
};

export const removeEmptyStrings = <T extends Record<string, any>>(
  obj: T
): Partial<T> => {
  const cleaned: Partial<T> = {};

  for (const key in obj) {
    if (obj[key] !== "") {
      cleaned[key] = obj[key];
    }
  }

  return cleaned;
};
