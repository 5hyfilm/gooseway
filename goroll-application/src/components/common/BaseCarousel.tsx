import React, { useState } from "react";
import { View, Image, Dimensions, TouchableOpacity } from "react-native";
import Carousel, { Pagination } from "react-native-reanimated-carousel";
import { useSharedValue } from "react-native-reanimated";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStacksParamList } from "../../navigation/NavigationTypes";
import { useImageStore } from "../../stores/imageStore";
import BaseText from "./BaseText";

import NoImage from "../../assets/no-image.png";

const { width: widthScreen } = Dimensions.get("window");

type BaseCarouselPropsType = {
  imgUrl: string[];
  positionVertical?: "top" | "bottom";
  positionHorizontal?: "left" | "right";
  preview?: boolean;
};

export default function BaseCarousel({
  imgUrl,
  positionVertical = "top",
  positionHorizontal = "left",
  preview = true,
}: BaseCarouselPropsType) {
  const { setImageData } = useImageStore();
  const progress = useSharedValue<number>(0);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStacksParamList>>();

  return (
    <View className="relative" id="carousel-component">
      <View
        className="absolute p-2 z-10 bg-white/60 rounded-full min-w-14"
        style={{
          [positionVertical]: 16,
          [positionHorizontal]: 16,
        }}
      >
        <BaseText className="text-sm text-center">
          {currentIndex + 1} / {imgUrl.length}
        </BaseText>
      </View>
      <Carousel
        loop={imgUrl.length > 1}
        data={imgUrl}
        pagingEnabled
        snapEnabled
        width={widthScreen}
        style={{ width: widthScreen }}
        onSnapToItem={(index: number) => setCurrentIndex(index)}
        onProgressChange={progress}
        renderItem={({ item, index }) => {
          const isValidUrl =
            item.startsWith("http://") || item.startsWith("https://");

          return (
            <TouchableOpacity
              activeOpacity={0.8}
              disabled={!isValidUrl || !preview}
              onPress={() => {
                setImageData(imgUrl.map((url) => ({ url })));
                navigation.push("ImagePreview", {
                  initialIndex: index,
                });
              }}
              className="w-full h-full"
            >
              <Image
                source={isValidUrl ? { uri: item } : NoImage}
                resizeMode="cover"
                style={{ width: "100%", height: "100%" }}
              />
            </TouchableOpacity>
          );
        }}
      />

      <Pagination.Basic
        progress={progress}
        data={imgUrl}
        size={8}
        dotStyle={{
          borderRadius: 100,
          backgroundColor: "#fff",
          opacity: 0.5,
        }}
        activeDotStyle={{
          borderRadius: 100,
          overflow: "hidden",
          backgroundColor: "#fff",
          opacity: 1,
        }}
        containerStyle={[
          {
            position: "absolute",
            bottom: 5,
            gap: 5,
          },
        ]}
        horizontal
      />
    </View>
  );
}
