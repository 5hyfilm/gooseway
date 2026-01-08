import 'dotenv/config';

export default {
  expo: {
    name: "GOROLL",
    slug: "proj-goroll-app",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    newArchEnabled: true,
    splash: {
      image: "./assets/splash-icon.png",
      resizeMode: "contain",
      backgroundColor: "#f3f4f6",
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: process.env.EXPO_PUBLIC_APP_PACKAGE,
      infoPlist: {
        NSLocationWhenInUseUsageDescription:
          "We need your location to show you nearby points of interest",
        NSLocationAlwaysUsageDescription:
          "We need your location to provide notifications about changes to your local area",
      },
      buildNumber: "22",
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#f3f4f6",
      },
      package: process.env.EXPO_PUBLIC_APP_PACKAGE,
      permissions: [
        "android.permission.ACCESS_COARSE_LOCATION",
        "android.permission.ACCESS_FINE_LOCATION",
      ],
      versionCode: 1,
    },
    web: {
      favicon: "./assets/favicon.png",
    },
    plugins: [
      [
        "@rnmapbox/maps",
        {
          RNMapboxMapsDownloadToken: process.env.EXPO_PUBLIC_MAPBOX_DOWNLOAD_TOKEN
        },
      ],
      [
        "expo-location",
        {
          locationAlwaysAndWhenInUsePermission:
            "Allow $(PRODUCT_NAME) to use your location.",
        },
      ],
      [
        "expo-splash-screen",
        {
          backgroundColor: "#f3f4f6",
          image: "./assets/splash-icon.png",
          imageWidth: 256,
        },
      ],
      "react-native-edge-to-edge",
      "expo-asset",
      "expo-font",
      [
        "expo-image-picker",
        {
          photosPermission:
            "The app accesses your photos to let you share them with your friends.",
        },
      ],
      [
        "@react-native-google-signin/google-signin",
        {
          iosUrlScheme: process.env.EXPO_PUBLIC_IOS_URL_SCHEME
        },
      ],
      "react-native-email-link",
    ],
    extra: {
      eas: {
        projectId: process.env.EXPO_PUBLIC_EAS_PROJ_ID,
      },
    },
    owner: process.env.EXPO_PUBLIC_EAS_PROJ_OWNER,
  },
};
