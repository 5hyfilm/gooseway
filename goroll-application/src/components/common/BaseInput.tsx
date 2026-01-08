import React, { forwardRef } from "react";
import { TextInput, TextInputProps, TextStyle, StyleProp } from "react-native";
import { useAppContext } from "../../contexts/app/AppContext";

interface BaseInputProps extends TextInputProps {
  style?: StyleProp<TextStyle>;
  className?: string;
  numberOfLines?: number;
  fontWeight?: "light" | "medium" | "semibold" | "bold";
}

const BaseInput = forwardRef<TextInput, BaseInputProps>(
  ({ style, className = "", fontWeight, numberOfLines = 1, ...props }, ref) => {
    const { fontFamily } = useAppContext();

    return (
      <TextInput
        ref={ref}
        style={[{ fontFamily: fontFamily(fontWeight) }, style]}
        className={className}
        multiline={numberOfLines > 1}
        numberOfLines={numberOfLines}
        {...props}
      />
    );
  }
);

export default BaseInput;
