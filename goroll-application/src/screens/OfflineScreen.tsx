import { View } from "react-native";
import React, { useState } from "react";
import Ionicons from "@expo/vector-icons/Ionicons";
import BaseText from "../components/common/BaseText";
import BaseButton from "../components/common/BaseButton";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import NetInfo from "@react-native-community/netinfo";
import { useAppContext } from "../contexts/app/AppContext";

export default function OfflineScreen() {
  const [loading, setLoading] = useState(false);
  const { setHaveInternet } = useAppContext();

  const handleRetry = async () => {
    setLoading(true);
    try {
      const state = await NetInfo.fetch();
      setTimeout(() => {
        if (state.isConnected) {
          setHaveInternet(true);
        } else {
          setHaveInternet(false);
        }
        setLoading(false);
      }, 2000);
    } catch (error) {
      console.error("Error checking internet connection:", error);
      setHaveInternet(false);
    }
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView className="flex-1 p-5">
        <View className="flex-1 justify-center items-center bg-white gap-y-16">
          <Ionicons name="cloud-offline-outline" size={96} color="#3b82f6" />
          <View className="gap-y-4">
            <BaseText className="text-2xl text-center" fontWeight="bold">
              You're offline
            </BaseText>
            <BaseText className="text-center">
              Please connect to the internet and try again.
            </BaseText>
          </View>
        </View>
        <BaseButton
          className="bg-blue-600 w-full"
          onPress={handleRetry}
          loading={loading}
        >
          <BaseText className="text-white text-center">Try Again!</BaseText>
        </BaseButton>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
