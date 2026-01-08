import { View, TouchableOpacity } from "react-native";
import React from "react";
import { useRoute, RouteProp, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStacksParamList } from "../navigation/NavigationTypes";
import ImageViewer from "react-native-image-zoom-viewer";
import { AntDesign } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";

import { useImageStore } from "../stores/imageStore";
import BaseText from "../components/common/BaseText";

export default function LocationImageByTypeScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStacksParamList>>();
  const route = useRoute<RouteProp<RootStacksParamList, "ImagePreview">>();
  const insets = useSafeAreaInsets();

  const { imageData } = useImageStore();

  return (
    <View className="flex-1 bg-black">
      <ImageViewer
        imageUrls={imageData}
        enableSwipeDown
        onSwipeDown={() => navigation.goBack()}
        index={route.params.initialIndex}
        renderHeader={() => (
          <View className="absolute flex-row items-center justify-between p-4 z-20" style={{ paddingTop: insets.top + 16,paddingLeft: insets.left + 16,paddingRight: insets.right + 16 }}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <AntDesign name="arrowleft" size={24} color="white" />
            </TouchableOpacity>
            {/* <TouchableOpacity onPress={() => {}}>
              <MaterialCommunityIcons name="dots-vertical" size={24} color="white" />
            </TouchableOpacity> */}
          </View>
        )}
        renderIndicator={(currentIndex, allSize) => (
          <View className="absolute flex-row items-center justify-center w-full z-10" style={{ paddingTop: insets.top + 16 }}>
            <BaseText className="text-white text-lg">{`${(currentIndex ?? 0)} / ${allSize}`}</BaseText>
          </View>
        )}
      />
      <StatusBar style="light" />
    </View>
  );
}
