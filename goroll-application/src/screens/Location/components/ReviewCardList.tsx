import { FlatList, Dimensions } from "react-native";
import React from "react";
import ReviewCard from "./ReviewCard";
import { ReviewData } from "../../../services/api/types/review";


const { width } = Dimensions.get("window");

export default function ReviewCardList({
  reviews,
}: {
  reviews: ReviewData[];
}) {
  return (
    <FlatList
      data={reviews}
      horizontal
      showsHorizontalScrollIndicator={false}
      keyExtractor={(item) => item.id.toString()}
      snapToInterval={width * 0.75 + 24}
      snapToAlignment="start"
      decelerationRate="fast"
      scrollEventThrottle={16}
      contentContainerStyle={{
        gap: 24,
      }}
      renderItem={({ item }) => (
        <ReviewCard
          review={item}
          width={width * 0.75}
          className="border-r border-r-gray-300 pr-6"
          lineLimit="line-clamp-4"
        />
      )}
    />
  );
}
