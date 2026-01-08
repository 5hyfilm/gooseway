import { BASE_URL } from "@/lib/constants";
import { getCookie, deleteCookie } from "cookies-next";
import axios, { AxiosInstance } from "axios";

type ErrorResponse = {
  message: string;
  data: string;
  status: number;
  statusText: string;
};

function toError(err: unknown): Error {
  return err instanceof Error ? err : new Error(String(err));
}

const apiFetch = axios.create({
  baseURL: BASE_URL,
  headers: {
    // "ngrok-skip-browser-warning": "any",
  },
});

const attachInterceptors = async (client: AxiosInstance) => {
  client.interceptors.request.use(
    (config) => {
      const acccessToken = getCookie("token"); 
      
      if (typeof acccessToken === "string" && acccessToken) {
        config.headers.Authorization = `Bearer ${acccessToken}`;
      }
      return config;
    },
    (error) => Promise.reject(toError(error))
  );

  client.interceptors.response.use(
    (response) => response,
    async (error) => {
      const status = error.response?.status;

      if (status === 401) {
        console.warn("Access token expired or invalid. Logging out...");
        deleteCookie("token");

        return Promise.reject(toError(error));
      }

      return Promise.reject(toError(error));
    }
  );
};

attachInterceptors(apiFetch);

export default apiFetch;

export const handleAxiosError = (error: unknown): ErrorResponse => {
  if (axios.isAxiosError(error)) {
    const err = {
      message: error.message,
      data: error.response?.data?.message ?? "Unknown error",
      status: error.response?.status ?? 500,
      statusText: error.response?.statusText ?? "Unknown",
    };

    // alert(
    //   `Error: ${err.status} ${err.data}`
    // );

    return err;
  }

  let message = "Unknown error";

  if (error instanceof Error) {
    message = error.message;
  } else if (typeof error === "string") {
    message = error;
  } else if (typeof error === "object" && error !== null) {
    try {
      message = JSON.stringify(error);
    } catch {
      message = "[Unstringifiable object error]";
    }
  }

  alert(`Unexpected Error:\n${message}`);

  return {
    message,
    data: message,
    status: 500,
    statusText: "Unknown",
  };
};

