import React, { forwardRef } from "react";
import { View, TextInput, TextInputProps } from "react-native";
import BaseText from "../common/BaseText";
import BaseInput from "../common/BaseInput";

interface FormInputProps extends TextInputProps {
  leftIcon?: () => React.ReactNode;
  rightIcon?: () => React.ReactNode;
  label?: string;
  onError?: boolean;
  errorMessage?: string;
  fontWeight?: "light" | "medium" | "semibold" | "bold";
}

const FormInput = forwardRef<TextInput, FormInputProps>(
  (
    {
      leftIcon,
      rightIcon,
      label,
      keyboardType = "default",
      onError,
      errorMessage,
      fontWeight,
      ...props
    },
    ref
  ) => {
    return (
      <View className="w-full gap-y-2">
        {label && (
          <BaseText className="text-sm text-gray-700" fontWeight="medium">
            {label}
          </BaseText>
        )}
        <View className="w-full gap-y-0.5">
          <View
            className={`flex-row items-center gap-x-4 bg-white rounded-lg border ${
              onError ? "border-red-600" : "border-gray-300"
            }`}
          >
            {leftIcon ? <View className="pl-4">{leftIcon()}</View> : null}
            <BaseInput
              ref={ref}
              className={`flex-1 text-black py-3 ${leftIcon ? "" : "pl-4"} ${
                rightIcon ? "" : "pr-4"
              }`}
              fontWeight={fontWeight}
              keyboardType={keyboardType}
              autoCapitalize="none"
              {...props}
            />
            {rightIcon ? <View className="pr-4">{rightIcon()}</View> : null}
          </View>
          {onError !== undefined && (
            <BaseText className="text-xs text-red-600">
              {onError ? errorMessage : ""}
            </BaseText>
          )}
        </View>
      </View>
    );
  }
);

export default FormInput;
