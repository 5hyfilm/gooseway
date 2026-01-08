import React, {
  createContext,
  useContext,
  useMemo,
  useState,
  useEffect,
  useCallback,
} from "react";
import { Alert } from "react-native";
import { AuthProvider } from "../auth/AuthContext";
import { AppContextType } from "./AppContextTypes";
import { languageStorage } from "../../utils/storage/languageStorage";
import i18n from "../../languages/i18n";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useIsConnected } from "react-native-offline";
import { handleAxiosError } from "../../services/api/api";

const AppContext = createContext<AppContextType | undefined>(undefined);
const queryClient = new QueryClient();

export function AppProviders({ children }: { children: React.ReactNode }) {
  const isConnected = useIsConnected();
  const { getLanguageStorage, setLanguageStorage } = languageStorage;
  const [language, setLanguage] = useState<"en" | "th">(
    i18n.language as "en" | "th"
  );
  const [showCreate, setShowCreate] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [haveInternet, setHaveInternet] = useState(true);

  const handleShowError = useCallback(
    (title: string, message: string) => {
      Alert.alert(title, message || i18n.t("error_occurred"));
    },
    [i18n]
  );

  const fontFamily = useCallback(
    (fontWeight?: "light" | "medium" | "semibold" | "bold") => {
      // const base = i18n.language === "en" ? "inter" : "noto";
      const base = "noto";
      return fontWeight ? `${base}-${fontWeight}` : base;
    },
    [i18n.language]
  );

  const fetchLanguageStorage = useCallback(async () => {
    try {
      const storedLanguage = await getLanguageStorage();
      if (storedLanguage) {
        setLanguage(storedLanguage);
        i18n.changeLanguage(storedLanguage);
      }
    } catch (error) {
      console.error("Error fetching language from storage:", error);
      handleAxiosError(error, handleShowError);
    }
  }, [getLanguageStorage, handleShowError, i18n, setLanguage]);

  const handleSetLanguage = useCallback(
    async (lang: "en" | "th") => {
      setLanguage(lang);
      try {
        await setLanguageStorage(lang);
        i18n.changeLanguage(lang);
      } catch (error) {
        console.error("Error saving language to storage:", error);
        handleAxiosError(error, handleShowError);
      }
    },
    [setLanguageStorage, handleShowError, i18n, setLanguage]
  );

  const handleSwitchLanguage = useCallback(async () => {
    const lang = language === "en" ? "th" : "en";
    await handleSetLanguage(lang);
  }, [language, handleSetLanguage]);

  const appContextValue = useMemo(
    () => ({
      haveInternet,
      setHaveInternet,
      language,
      showCreate,
      setShowCreate,
      fontFamily,
      handleSetLanguage,
      handleSwitchLanguage,
      searchText,
      setSearchText,
      handleShowError,
    }),
    [
      haveInternet,
      setHaveInternet,
      language,
      showCreate,
      setShowCreate,
      fontFamily,
      handleSetLanguage,
      handleSwitchLanguage,
      searchText,
      setSearchText,
      handleShowError,
    ]
  );

  useEffect(() => {
    fetchLanguageStorage();
  }, [fetchLanguageStorage]);

  useEffect(() => {
    if (isConnected !== null && !isConnected) {
      setHaveInternet(false);
    }
  }, [isConnected]);

  return (
    <AppContext.Provider value={appContextValue}>
      <AuthProvider>
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      </AuthProvider>
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
}
