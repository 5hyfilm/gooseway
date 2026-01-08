export type AppContextType = {
  language: "en" | "th";
  showCreate: boolean;
  haveInternet: boolean;
  setHaveInternet: React.Dispatch<React.SetStateAction<boolean>>;
  setShowCreate: React.Dispatch<React.SetStateAction<boolean>>;
  fontFamily: (fontWeight?: "light" | "medium" | "semibold" | "bold") => string;
  handleSetLanguage: (lang: "en" | "th") => Promise<void>;
  handleSwitchLanguage: () => Promise<void>;
  searchText: string;
  setSearchText: React.Dispatch<React.SetStateAction<string>>;
  handleShowError: (title: string, message: string) => void;
};
