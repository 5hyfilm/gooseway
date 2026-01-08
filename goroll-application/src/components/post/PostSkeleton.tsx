import React from "react";
import { View } from "react-native";
import { AntDesign, Ionicons } from "@expo/vector-icons";

export default function PostSkeleton({ showHeader }: { showHeader: boolean }) {
  return (
    <View
      className="flex-1 gap-y-4 bg-white"
    >
      {/* Header Skeleton */}
      {showHeader && <View className="px-4 flex-row items-center gap-x-3">
        <View className="w-10 h-10 rounded-full bg-gray-200 animate-pulse" />
        <View className="flex-col gap-y-1 flex-1">
          <View className="h-4 bg-gray-200 rounded w-32 animate-pulse" />
          <View className="h-3 bg-gray-200 rounded w-20 animate-pulse" />
        </View>
      </View>}

      {/* Title Skeleton */}
      <View className="px-4 gap-y-2">
        <View className="h-6 bg-gray-200 rounded w-3/4 animate-pulse" />
        {!showHeader && <View className="h-4 bg-gray-200 rounded w-1/2 animate-pulse" />}
      </View>

      {/* Image Skeleton */}
      <View className="w-full aspect-[4/3]">
        <View className="w-full h-full bg-gray-200 animate-pulse" />
      </View>

      {/* Content Skeleton */}
      <View className="px-4 gap-y-2">
        <View className="h-4 bg-gray-200 rounded w-full animate-pulse" />
        <View className="h-4 bg-gray-200 rounded w-5/6 animate-pulse" />
        <View className="flex-row gap-2 mt-2">
          <View className="h-6 w-16 bg-gray-200 rounded-full animate-pulse" />
          <View className="h-6 w-20 bg-gray-200 rounded-full animate-pulse" />
        </View>
      </View>

      {/* Footer Buttons Skeleton */}
      <View>
        <View className="px-4 py-3 flex-row items-center justify-between border-y border-gray-100">
          <View className="flex-row items-center gap-2 animate-pulse">
            <View className="flex-row gap-x-1">
              <AntDesign name="heart" size={14} color="#e5e7eb" />
              <View className="h-4 w-6 bg-gray-200 rounded-full" />
            </View>

            <View className="flex-row items-center gap-x-1">
              <Ionicons name="chatbubble" size={14} color="#e5e7eb" />
              <View className="h-4 w-6 bg-gray-200 rounded-full" />
            </View>
          </View>
        </View>
        <View className="flex-row gap-x-3 p-4 border-b border-gray-100">
          <View className="w-10 h-10 rounded-full bg-gray-200 animate-pulse" />
          <View className="flex-1 gap-y-2">
            <View className="h-4 bg-gray-200 w-24 rounded animate-pulse" />
            <View className="h-3 bg-gray-200 w-3/4 rounded animate-pulse" />
          </View>
        </View>
        <View className="flex-row gap-x-3 p-4 border-b border-gray-100">
          <View className="w-10 h-10 rounded-full bg-gray-200 animate-pulse" />
          <View className="flex-1 gap-y-2">
            <View className="h-4 bg-gray-200 w-24 rounded animate-pulse" />
            <View className="h-3 bg-gray-200 w-3/4 rounded animate-pulse" />
          </View>
        </View>
      </View>
    </View>
  );
}
