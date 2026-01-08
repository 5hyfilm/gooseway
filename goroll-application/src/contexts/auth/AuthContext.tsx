import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useMemo,
  useEffect,
  useCallback,
} from "react";
import { Alert } from "react-native";
import type { UserInfoType, AuthContextType } from "./AuthContextTypes";
import { userStorge } from "../../utils/storage/userStorage";
import apiClient, {
  attachInterceptors,
  queryClient,
} from "../../services/api/api";
import { useTranslation } from "react-i18next";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const { getUserStorage, setUserStorage, removeUserStorage } = userStorge;
  const [userInfo, setUserInfo] = useState<UserInfoType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { t } = useTranslation();

  const isSignIn = !!userInfo;

  const fetchUserStorage = useCallback(async () => {
    try {
      const storedUser = await getUserStorage();
      if (storedUser) {
        setUserInfo(storedUser);
      }
    } catch (error) {
      console.error("Error fetching user data from storage:", error);
      const errorMessage =
        error && typeof error === "object" && "message" in error
          ? (error as { message: string }).message
          : String(error);
      Alert.alert("Error fetching user data", errorMessage);
    } finally {
      setTimeout(() => {
        setIsLoading(false);
      }, 2000);
    }
  }, [getUserStorage]);

  const handleSetUserInfo = useCallback(
    async (user: UserInfoType | null) => {
      setUserInfo(user);
      try {
        if (user) {
          await setUserStorage(user);
        }
      } catch (error) {
        console.error("Error saving user data to storage:", error);
        const errorMessage =
          error && typeof error === "object" && "message" in error
            ? (error as { message: string }).message
            : String(error);
        Alert.alert("Error saving user data", errorMessage);
      }
    },
    [setUserStorage]
  );

  const handleRemoveUserInfo = useCallback(async () => {
    setUserInfo(null);
    try {
      const storedUser = await getUserStorage();
      if (storedUser) {
        await removeUserStorage();
      }
    } catch (error) {
      console.error("Error removing user data from storage:", error);
      const errorMessage =
        error && typeof error === "object" && "message" in error
          ? (error as { message: string }).message
          : String(error);
      Alert.alert("Error removing user data", errorMessage);
    }
  }, [getUserStorage, removeUserStorage]);

  const authContextValue = useMemo(
    () => ({
      userInfo,
      handleSetUserInfo,
      handleRemoveUserInfo,
      isSignIn,
      isLoading,
    }),
    [userInfo, isSignIn, isLoading, handleSetUserInfo, handleRemoveUserInfo]
  );

  useEffect(() => {
    fetchUserStorage();
  }, [fetchUserStorage]);

  useEffect(() => {
    attachInterceptors(apiClient, () => {
      handleRemoveUserInfo();
      queryClient.clear();
      // Alert.alert(t("session_expired"), t("session_expired_message"));
    });
  }, [handleRemoveUserInfo]);

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const useUserIsSignedIn = () => useAuth().isSignIn;

export const useUserIsSignedOut = () => !useAuth().isSignIn;

export const useUserIsLoading = () => useAuth().isLoading;
