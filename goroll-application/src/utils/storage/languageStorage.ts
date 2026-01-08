import AsyncStorage from "@react-native-async-storage/async-storage";

const LANGUAGE_STORAGE_KEY = "languageStorageKey";

export const languageStorage = {
  async getLanguageStorage(): Promise<"en" | "th" | null> {
    const langData = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (langData) {
      return JSON.parse(langData);
    }
    return null;
  },

  async setLanguageStorage(lang: "en" | "th"): Promise<void> {
    await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, JSON.stringify(lang));
  },

  async removeLanguageStorage(): Promise<void> {
    await AsyncStorage.removeItem(LANGUAGE_STORAGE_KEY);
  },
};
