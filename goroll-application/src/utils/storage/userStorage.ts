import AsyncStorage from "@react-native-async-storage/async-storage";

const USER_STORAGE_KEY = "userStorageKey";

type UserStorageType = {
  id: string;
  email: string;
  fullName: string;
  avatarUrl?: string;
  phoneNumber?: string;
  accessToken: string;
  refreshToken?: string;
};

export const userStorge = {
  async getUserStorage(): Promise<UserStorageType | null> {
    const userData = await AsyncStorage.getItem(USER_STORAGE_KEY);
    if (userData) {
      return JSON.parse(userData);
    }
    return null;
  },

  async setUserStorage(user: UserStorageType | null): Promise<void> {
    await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
  },

  async removeUserStorage(): Promise<void> {
    await AsyncStorage.removeItem(USER_STORAGE_KEY);
  },
};
