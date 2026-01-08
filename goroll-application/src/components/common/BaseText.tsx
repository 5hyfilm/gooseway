import React from "react";
import { Text, TextProps, TextStyle, StyleProp } from "react-native";
import { useAppContext } from "../../contexts/app/AppContext";

interface BaseTextProps extends TextProps {
  children: React.ReactNode;
  style?: StyleProp<TextStyle>;
  className?: string;
  fontWeight?: "light" | "medium" | "semibold" | "bold";
}

export default function BaseText({
  children,
  style,
  className = "",
  fontWeight,
  ...props
}: BaseTextProps) {
  const { fontFamily } = useAppContext();

  return (
    <Text
      style={[{ fontFamily: fontFamily(fontWeight) }, style]}
      className={className}
      {...props}
    >
      {children}
    </Text>
  );
}
