import {
  View,
  Image,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import React from "react";

export default function AppSplashScreen() {
  return (
    <View className="flex-1 bg-gray-100 justify-center items-center">
      <Image
        className="w-64"
        source={require("../../assets/splash-icon.png")}
        // style={styles.image}
        resizeMode="contain"
      />
      <View style={styles.activityIndicatorContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  image: {
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height,
  },
  activityIndicatorContainer: {
    position: "absolute",
    bottom: Dimensions.get("window").width < 640 ? 56 : 112,
    transform:
      Dimensions.get("window").width > 640
        ? [{ scaleX: 2 }, { scaleY: 2 }]
        : [],
  },
});
