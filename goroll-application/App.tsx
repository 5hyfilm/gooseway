import "./global";
import "./src/languages/i18n";
import React, { useEffect } from "react";
import { Assets as NavigationAssets } from "@react-navigation/elements";
import { Asset } from "expo-asset";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import {
  configureReanimatedLogger,
  ReanimatedLogLevel,
} from "react-native-reanimated";

import { RootStacks } from "./src/navigation/StacksNavigation";
import { StatusBar } from "expo-status-bar";
import { AppProviders } from "./src/contexts/app/AppContext";
import { API_BASE_URL } from "./src/constants/api";
import { NetworkProvider } from "react-native-offline";

import { GoogleSignin } from "@react-native-google-signin/google-signin";

Asset.loadAsync([...NavigationAssets, require("./src/assets/goroll_icon.png")]);

configureReanimatedLogger({
  level: ReanimatedLogLevel.warn,
  strict: false,
});

SplashScreen.preventAutoHideAsync();

export default function App() {
  const [loaded, error] = useFonts({
    inter: require("./src/assets/fonts/Inter.ttf"),
    "inter-light": require("./src/assets/fonts/Inter_Light.ttf"),
    "inter-medium": require("./src/assets/fonts/Inter_Medium.ttf"),
    "inter-semibold": require("./src/assets/fonts/Inter_SemiBold.ttf"),
    "inter-bold": require("./src/assets/fonts/Inter_Bold.ttf"),
    noto: require("./src/assets/fonts/Noto.ttf"),
    "noto-light": require("./src/assets/fonts/Noto_Light.ttf"),
    "noto-medium": require("./src/assets/fonts/Noto_Medium.ttf"),
    "noto-semibold": require("./src/assets/fonts/Noto_SemiBold.ttf"),
    "noto-bold": require("./src/assets/fonts/Noto_Bold.ttf"),
  });

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  useEffect(() => {
    if (API_BASE_URL()) {
      console.log("API_BASE_URL is set to:", API_BASE_URL());
    } else {
      console.error(
        "API_BASE_URL is not set. Please check your environment variables."
      );
    }
    GoogleSignin.configure({
      iosClientId: process.env.EXPO_PUBLIC_IOS_CLIENT_ID,
      webClientId: process.env.EXPO_PUBLIC_WEB_CLIENT_ID,
      offlineAccess: true,
    });
  }, []);

  return (
    <NetworkProvider>
      <AppProviders>
        <StatusBar style="dark" />
        <RootStacks />
      </AppProviders>
    </NetworkProvider>
  );
}
