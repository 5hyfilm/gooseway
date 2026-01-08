import { View, Text } from "react-native";
import React from "react";

import BaseText from "../../../components/common/BaseText";

export default function AccessLevelStatus({
  accessLevel,
  label,
  className,
}: {
  accessLevel: number;
  label: string;
    className?: string;
}) {
  const getPrimaryColor = () => {
    switch (accessLevel) {
      case 1:
        return "#22C55E";
      case 2:
        return "#EAB308";
      case 3:
        return "#EF4444";
      default:
        return "#9CA3AF";
    }
  };

  const getSecondaryColor = () => {
    switch (accessLevel) {
      case 1:
        return "#dcfce7";
      case 2:
        return "#fef9c3";
      case 3:
        return "#fee2e2";
      default:
        return "#f3f4f6";
    }
  };
  return (
    <View
      className={`px-3 py-1.5 rounded-full text-sm flex-row items-center gap-x-2 ${className}`}
      style={{
        backgroundColor: getSecondaryColor(),
      }}
    >
      <View
        className="w-2 h-2 rounded-full bg-red-500"
        style={{
          backgroundColor: getPrimaryColor(),
        }}
      />
      <BaseText
        className="text-xs"
        style={{ color: getPrimaryColor() }}
        fontWeight="medium"
      >
        {label}
      </BaseText>
    </View>
  );
}
